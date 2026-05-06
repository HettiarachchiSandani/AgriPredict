from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg
from datetime import datetime, timedelta
import joblib
import os
import numpy as np
import shap
from decimal import Decimal
from .models import Prediction
from .serializers import PredictionSerializer
from batches.models import DailyOperations, Batch
from reports.blockchain import verify_blockchain, verify_latest_block
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

egg_model = joblib.load(os.path.join(MODEL_DIR, "egg_model.pkl"))
mortality_model = joblib.load(os.path.join(MODEL_DIR, "mortality_cb_model.pkl"))
batch_encoder = joblib.load(os.path.join(MODEL_DIR, "batch_encoder_v1.pkl"))
egg_explainer = shap.TreeExplainer(egg_model)
mort_explainer = shap.TreeExplainer(mortality_model)

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_rolling_avg(self, batch_obj, field, current_date, days=3):
        ops = DailyOperations.objects.filter(
            batch=batch_obj,
            date__lt=current_date,
            date__gte=current_date - timedelta(days=days)
        )
        if ops.exists():
            return ops.aggregate(avg_val=Avg(field))["avg_val"] or 0.0
        return 0.0

    def get_lag_value(self, batch_obj, field, days_back):
        target_date = datetime.today().date() - timedelta(days=days_back)
        op = DailyOperations.objects.filter(batch=batch_obj, date=target_date).first()
        return getattr(op, field, 0) if op else 0
    
    def production_factor(self, age_weeks):
        if age_weeks < 16:
            return 0.0

        elif age_weeks < 20:
            return 0.05 + ((age_weeks - 16) / 4) * (0.25 - 0.05)

        elif age_weeks < 28:
            return 0.25 + ((age_weeks - 20) / 8) * (0.85 - 0.25)

        elif age_weeks < 32:
            return 0.85 + ((age_weeks - 28) / 4) * (0.90 - 0.85)

        elif age_weeks < 60:
            return 0.90 - ((age_weeks - 32) / 28) * (0.90 - 0.80)

        elif age_weeks < 80:
            return 0.80 - ((age_weeks - 60) / 20) * (0.80 - 0.55)

        else:
            return max(0.25, 0.55 - ((age_weeks - 80) * 0.015))
        
    @action(detail=False, methods=['get'])
    def verify_blockchain_now(self, request):
        return Response(verify_blockchain())

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def predict_next_day(self, request):
        try:
            is_valid, bad_block = verify_latest_block()

            if not is_valid:
                return Response({
                    "error": "Blockchain integrity check failed",
                    "corrupted_block": bad_block
                }, status=400)
            
            batch_id = request.data.get("batchid")
            if not batch_id:
                return Response({"error": "batchid is required"}, status=400)

            try:
                batch_obj = Batch.objects.get(batchid=batch_id)
            except Batch.DoesNotExist:
                return Response({"error": f"Batch {batch_id} not found"}, status=400)

            ops = list(
                DailyOperations.objects.filter(batch=batch_obj)
                .order_by("-date")[:15]
            )
            ops.reverse()

            if len(ops) < 7:
                return Response({
                    "error": "Not enough data. Minimum 7 days required for prediction."
                }, status=400)

            prev_ops = ops[-1]
            today = prev_ops.date + timedelta(days=1)

            total_birds = float(batch_obj.currentcount or batch_obj.initialcount or 1)
            age_days = (today - batch_obj.startdate).days
            age_weeks = age_days // 7

            daily_feed = float(prev_ops.feedusage or 0.1)
            feed_per_bird = daily_feed / total_birds if total_birds else 0.01

            prev_day_eggs = int(prev_ops.eggcount or 0)
            prev_day_mortality = int((prev_ops.male_mortality + prev_ops.female_mortality) or 0)

            def lag(field, n):
                if len(ops) <= n:
                    return 0
                return getattr(ops[-(n+1)], field, 0) or 0

            def roll(field, window):
                if len(ops) < window:
                    return 0
                vals = [getattr(o, field) or 0 for o in ops[-window:]]
                return sum(vals) / window

            lag_1_eggs = prev_day_eggs
            lag_3_eggs = lag("eggcount", 3)
            lag_7_eggs = lag("eggcount", 7)

            lag_1_feed = daily_feed
            lag_3_feed = lag("feedusage", 3)

            roll_3_eggs = roll("eggcount", 3)
            roll_7_eggs = roll("eggcount", 7)
            roll_3_feed = roll("feedusage", 3)

            lag_1_mort = lag("mortalitycount", 1)
            lag_3_mort = lag("mortalitycount", 3)
            roll_3_mort = roll("mortalitycount", 3)
            mortality_3day_avg = roll_3_mort

            trend_eggs = lag_1_eggs - roll_3_eggs
            trend_mort = lag_1_mort

            features = {
                "age_weeks": float(age_weeks),
                "total_birds": float(total_birds),
                "daily_feed_kg": float(daily_feed),
                "feed_per_bird": float(feed_per_bird),
                "lag_1_eggs": float(lag_1_eggs),
                "lag_3_eggs": float(lag_3_eggs),
                "lag_7_eggs": float(lag_7_eggs),
                "roll_3_eggs": float(roll_3_eggs),
                "roll_7_eggs": float(roll_7_eggs),
                "trend_eggs": float(trend_eggs),
                "lag_1_feed": float(lag_1_feed),
                "lag_3_feed": float(lag_3_feed),
                "prev_day_mortality": float(prev_day_mortality),
                "mortality_3day_avg": float(mortality_3day_avg),
                "lag_1_mort": float(lag_1_mort),
                "lag_3_mort": float(lag_3_mort),
                "trend_mort": float(trend_mort)
            }

            egg_features = [
                'age_weeks','total_birds','daily_feed_kg','feed_per_bird',
                'lag_1_eggs','lag_3_eggs','lag_7_eggs',
                'roll_3_eggs','roll_7_eggs','trend_eggs'
            ]

            mort_features = [
                'age_weeks','total_birds','feed_per_bird','prev_day_mortality',
                'mortality_3day_avg','lag_1_mort','lag_3_mort','trend_mort'
            ]

            X_egg = np.array([[features[f] for f in egg_features]], dtype=float)
            X_mort = np.array([[features[f] for f in mort_features]], dtype=float)

            raw_pred = float(egg_model.predict(X_egg)[0])
            base = lag_1_eggs
            factor = self.production_factor(age_weeks)

            if base == 0:
                adjusted_pred = raw_pred * factor
            else:
                ratio = base / total_birds

                if ratio < 0.1:
                    max_increase = base * 1.6
                elif ratio < 0.5:
                    max_increase = base * 1.3
                elif ratio < 0.85:
                    max_increase = base * 1.15
                else:
                    max_increase = base * 1.05

                min_decrease = base * 0.90
                adjusted_pred = (0.6 * base) + (0.4 * raw_pred)
                adjusted_pred = min(max_increase, max(min_decrease, adjusted_pred))

            max_possible = total_birds * 0.95
            adjusted_pred = min(adjusted_pred, max_possible)

            pred_eggs = max(0, int(round(adjusted_pred)))

            pred_mortality = mortality_model.predict_proba(X_mort)[0][1]
            estimated_mortality = pred_mortality * total_birds
            mortality_risk = "High" if pred_mortality > 0.5 else "Low"

            prediction = Prediction.objects.create(
                batchid=batch_obj,
                predictedeggcount=int(pred_eggs),
                predicted_mortality=Decimal(str(pred_mortality)),
                input_features=features
            )

            serializer = self.get_serializer(prediction)
            result = serializer.data
            result.update({
                "mortality_risk": mortality_risk,
                "mortality_probability": float(pred_mortality),
                "estimated_mortality": float(estimated_mortality)
            })

            try:
                shap_values_egg = egg_explainer.shap_values(X_egg)
                shap_vals = shap_values_egg
                if isinstance(shap_vals, list):
                    shap_vals = shap_vals[0]
                result["shap_eggs"] = dict(zip(egg_features, shap_vals[0]))
            except:
                result["shap_eggs"] = {}

            try:
                shap_values_mort = mort_explainer.shap_values(X_mort)
                result["shap_mortality"] = dict(zip(mort_features, shap_values_mort[0]))
            except:
                result["shap_mortality"] = {}

            return Response(result, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def predict_total_today(self, request):
        try:
            is_valid, bad_block = verify_latest_block()

            if not is_valid:
                return Response({
                    "error": "Blockchain integrity check failed",
                    "corrupted_block": bad_block
                }, status=400)
            
            today = datetime.today().date()
            total_predicted_eggs = 0
            valid_batches_found = False

            batches = Batch.objects.all()

            for batch_obj in batches:
                try:
                    if not batch_obj.startdate:
                        continue

                    history_count = DailyOperations.objects.filter(batch=batch_obj).count()
                    if history_count < 7:
                        continue

                    prev_ops = DailyOperations.objects.filter(
                        batch=batch_obj,
                        date=today - timedelta(days=1)
                    ).first()

                    if not prev_ops or prev_ops.eggcount is None or not prev_ops.feedusage:
                        continue

                    if not batch_obj.currentcount and not batch_obj.initialcount:
                        continue

                    total_birds = float(batch_obj.currentcount or batch_obj.initialcount)

                    age_days = (today - batch_obj.startdate).days
                    age_weeks = age_days // 7

                    daily_feed = float(prev_ops.feedusage)
                    feed_per_bird = daily_feed / total_birds

                    prev_day_eggs = int(prev_ops.eggcount or 0)

                    lag_1_eggs = prev_day_eggs
                    lag_3_eggs = self.get_lag_value(batch_obj, "eggcount", 3)
                    lag_7_eggs = self.get_lag_value(batch_obj, "eggcount", 7)
                    roll_3_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 3)
                    roll_7_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 7)
                    trend_eggs = lag_1_eggs - roll_3_eggs

                    X_egg = np.array([[
                        age_weeks, total_birds, daily_feed, feed_per_bird,
                        lag_1_eggs, lag_3_eggs, lag_7_eggs,
                        roll_3_eggs, roll_7_eggs, trend_eggs
                    ]], dtype=float)

                    raw_pred = float(egg_model.predict(X_egg)[0])
                    base = lag_1_eggs
                    factor = self.production_factor(age_weeks)

                    if base == 0:
                        adjusted_pred = raw_pred * factor
                    else:
                        ratio = base / total_birds

                        if ratio < 0.1:
                            max_increase = base * 1.6
                        elif ratio < 0.5:
                            max_increase = base * 1.3
                        elif ratio < 0.85:
                            max_increase = base * 1.15
                        else:
                            max_increase = base * 1.05

                        min_decrease = base * 0.90
                        adjusted_pred = (0.6 * base) + (0.4 * raw_pred)
                        adjusted_pred = min(max_increase, max(min_decrease, adjusted_pred))

                    max_possible = total_birds * 0.95
                    adjusted_pred = min(adjusted_pred, max_possible)

                    pred_eggs = max(0, int(round(adjusted_pred)))

                    total_predicted_eggs += pred_eggs
                    valid_batches_found = True

                except Exception as batch_error:
                    print(f"Batch error ({batch_obj.batchid}):", batch_error)
                    continue

            if not valid_batches_found:
                return Response({
                    "error": "Prediction unavailable: missing yesterday’s data."
                }, status=400)

            return Response({
                "predicted_eggs_today": total_predicted_eggs
            }, status=200)

        except Exception as e:
            print("🔥 GLOBAL ERROR:", str(e))
            return Response({"error": str(e)}, status=500)