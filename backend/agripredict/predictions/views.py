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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

egg_model = joblib.load(os.path.join(MODEL_DIR, "egg_model.pkl"))
mortality_model = joblib.load(os.path.join(MODEL_DIR, "mortality_model.pkl"))
batch_encoder = joblib.load(os.path.join(MODEL_DIR, "batch_encoder_v1.pkl"))

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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def predict_next_day(self, request):
        try:
            batch_id = request.data.get("batchid")
            if not batch_id:
                return Response({"error": "batchid is required"}, status=400)

            # Get batch
            try:
                batch_obj = Batch.objects.get(batchid=batch_id)
            except Batch.DoesNotExist:
                return Response({"error": f"Batch {batch_id} not found"}, status=400)

            today = datetime.today().date()
            prev_ops = DailyOperations.objects.filter(
                batch=batch_obj,
                date=today - timedelta(days=1)
            ).first()

            if not prev_ops:
                return Response({
                    "error": "No daily data found for this batch. Add at least yesterday's record."
                }, status=400)

            total_birds = float(batch_obj.currentcount or batch_obj.initialcount or 1)
            age_days = (today - batch_obj.startdate).days
            age_weeks = age_days // 7
            daily_feed = float(prev_ops.feedusage or 0.1)
            feed_per_bird = daily_feed / total_birds if total_birds else 0.01
            prev_day_eggs = int(prev_ops.eggcount or 0)
            prev_day_mortality = int((prev_ops.male_mortality + prev_ops.female_mortality) or 0)
            lag_1_eggs = prev_day_eggs
            lag_3_eggs = self.get_lag_value(batch_obj, "eggcount", 3)
            lag_7_eggs = self.get_lag_value(batch_obj, "eggcount", 7)
            lag_1_feed = daily_feed
            lag_3_feed = self.get_lag_value(batch_obj, "feedusage", 3)
            roll_3_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 3)
            roll_7_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 7)
            roll_3_feed = self.get_rolling_avg(batch_obj, "feedusage", today, 3)
            lag_1_mort = self.get_lag_value(batch_obj, "mortalitycount", 1)
            lag_3_mort = self.get_lag_value(batch_obj, "mortalitycount", 3)
            roll_3_mort = self.get_rolling_avg(batch_obj, "mortalitycount", today, 3)
            mortality_3day_avg = self.get_rolling_avg(batch_obj, "mortalitycount", today, 3)
            trend_eggs = lag_1_eggs - roll_3_eggs
            trend_mort = lag_1_mort

            history_count = DailyOperations.objects.filter(batch=batch_obj).count()
            if history_count < 7:
                return Response({
                    "error": "Not enough data. Minimum 7 days required for prediction."
                }, status=400)

            features = {
                "age_weeks": float(age_weeks),
                "total_birds": float(total_birds),
                "daily_feedusage": float(daily_feed),
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
                'age_weeks','total_birds','daily_feedusage','feed_per_bird',
                'lag_1_eggs','lag_3_eggs','lag_7_eggs','roll_3_eggs',
                'roll_7_eggs','trend_eggs'
            ]

            mort_features = [
                'age_weeks','total_birds','feed_per_bird','prev_day_mortality',
                'mortality_3day_avg','lag_1_mort','lag_3_mort','trend_mort'
            ]

            X_egg = np.array([[features[f] for f in egg_features]], dtype=float)
            X_mort = np.array([[features[f] for f in mort_features]], dtype=float)

            if roll_3_eggs == 0 and prev_day_eggs == 0:
                pred_eggs = 0
                pred_mortality = 0.0
                estimated_mortality = 0
                mortality_risk = "Low"
            else:
                pred_eggs = max(0, int(round(egg_model.predict(X_egg)[0])))
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
                explainer_egg = shap.TreeExplainer(egg_model)
                shap_values_egg = explainer_egg.shap_values(X_egg)
                result["shap_eggs"] = dict(zip(egg_features, shap_values_egg[0]))
            except:
                result["shap_eggs"] = {}

            try:
                explainer_mort = shap.TreeExplainer(mortality_model)
                shap_values_mort = explainer_mort.shap_values(X_mort)
                result["shap_mortality"] = dict(zip(mort_features, shap_values_mort[0]))
            except:
                result["shap_mortality"] = {}

            return Response(result, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def predict_total_today(self, request):
        try:
            today = datetime.today().date()
            total_predicted_eggs = 0
            valid_batches_found = False

            batches = Batch.objects.all()

            for batch_obj in batches:
                try:
                    total_birds = float(batch_obj.currentcount or batch_obj.initialcount or 1)

                    if not batch_obj.startdate:
                        continue

                    age_days = (today - batch_obj.startdate).days
                    age_weeks = age_days // 7

                    prev_ops = DailyOperations.objects.filter(
                        batch=batch_obj,
                        date=today - timedelta(days=1)
                    ).first()

                    if not prev_ops:
                        continue

                    valid_batches_found = True

                    daily_feed = float(prev_ops.feedusage or 0.1)
                    feed_per_bird = daily_feed / total_birds if total_birds else 0.01
                    prev_day_eggs = int(prev_ops.eggcount or 0)
                    lag_1_eggs = prev_day_eggs
                    lag_3_eggs = self.get_lag_value(batch_obj, "eggcount", 3)
                    lag_7_eggs = self.get_lag_value(batch_obj, "eggcount", 7)
                    roll_3_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 3)
                    roll_7_eggs = self.get_rolling_avg(batch_obj, "eggcount", today, 7)
                    trend_eggs = lag_1_eggs - roll_3_eggs

                    X_egg = np.array([[
                        float(age_weeks),
                        float(total_birds),
                        float(daily_feed),
                        float(feed_per_bird),
                        float(lag_1_eggs),
                        float(lag_3_eggs),
                        float(lag_7_eggs),
                        float(roll_3_eggs),
                        float(roll_7_eggs),
                        float(trend_eggs)
                    ]], dtype=float)

                    pred = egg_model.predict(X_egg)
                    pred_eggs = max(0, int(round(float(pred[0]))))
                    total_predicted_eggs += pred_eggs

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