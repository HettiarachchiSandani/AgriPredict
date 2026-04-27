from .models import Buyer, Order, OrderBatch
from batches.models import DailyOperations
from .serializers import BuyerSerializer, OrderSerializer, OrderBatchSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Buyer
from core.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from core.permission import IsOwnerOrManager, IsBuyer
from rest_framework.decorators import action
from django.db.models import Sum
from predictions.views import PredictionViewSet
from datetime import timedelta, datetime
import joblib
import os
import numpy as np  
from predictions.views import egg_model, batch_encoder
from .models import Batch
from django.db.models import Max
from core.notifications import notify_on_request_creation, notify_on_status_change

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.select_related('userid').all()
    serializer_class = BuyerSerializer
    lookup_field = 'buyerid'
    permission_classes = [IsAuthenticated] 

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        if not data.get("email"):
            return Response({"email": "email is required"}, status=400)
        if not data.get("password"):
            return Response({"password": "password is required"}, status=400)

        user_data = {
            "email": data["email"],
            "password": data["password"],
            "roleid": "B001",  
            "firstname": data.get("firstname", "Buyer"),
            "lastname": data.get("lastname", ""),
            "phonenumber": data.get("phonenumber"),
            "nic": data.get("nic"),
            "gender": data.get("gender"),
            "dob": data.get("dob"),
            "note": data.get("note"),
            "is_staff": False,
            "is_active": data.get("is_active", True),
        }

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        buyer = Buyer.objects.create(
            userid=user,
            company=data.get("company"),
            address=data.get("address")
        )

        serializer = self.get_serializer(buyer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        buyer = self.get_object()
        user = buyer.userid

        user_serializer = UserSerializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        buyer.company = request.data.get("company", buyer.company)
        buyer.address = request.data.get("address", buyer.address)
        buyer.save()

        serializer = self.get_serializer(buyer)
        return Response(serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            buyer = self.get_object()

            if buyer.userid:
                buyer.userid.is_active = False
                buyer.userid.save()

            buyer.delete()

            return Response(
                {"message": "Buyer deleted successfully. Linked user has been deactivated."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Buyer.DoesNotExist:
            return Response({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()  
    serializer_class = OrderSerializer
    lookup_field = 'orderid'
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save() 
        notify_on_request_creation(order)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user

        if hasattr(user, "buyer") and order.buyerid != user.buyer:
            return Response({"detail": "Permission denied."}, status=403)
        
        old_status = order.status 

        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_order = serializer.save()  

        if old_status != updated_order.status:
            from core.notifications import notify_on_status_change
            notify_on_status_change(updated_order, actor=request.user)

        return Response(self.get_serializer(updated_order).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        user = request.user
        if hasattr(user, "buyer"):
            return Response({"detail": "Buyers cannot delete orders."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        order = self.get_object()
        order.delete()
        return Response({"message": "Order deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
    def get_queryset(self):
        user = self.request.user
        base_queryset = Order.objects.extra(
            select={'num': "CAST(SUBSTR(orderid, 4) AS INTEGER)"}
        ).order_by('-num')  

        if hasattr(user, "buyer"):
            return base_queryset.filter(buyerid=user.buyer)
        
        return base_queryset

    from django.db.models import Sum

    @action(detail=False, methods=['get'], url_path='with-available-eggs')
    def with_available_eggs(self, request):
        orders = self.get_queryset().select_related('buyerid', 'breedid')
        results = []

        egg_features = [
            'age_weeks',
            'total_birds',
            'daily_feed_kg',
            'feed_per_bird',
            'lag_1_eggs',
            'lag_3_eggs',
            'lag_7_eggs',
            'roll_3_eggs',
            'roll_7_eggs',
            'trend_eggs'
        ]

        eggs_per_breed = DailyOperations.objects.values(
            'batch__breed'
        ).annotate(total_eggs=Sum('eggcount'))

        eggs_dict = {
            item['batch__breed']: item['total_eggs'] or 0
            for item in eggs_per_breed
        }

        completed_per_breed = Order.objects.filter(
            completed=True
        ).values(
            'breedid'
        ).annotate(total_completed=Sum('quantity'))

        completed_dict = {
            item['breedid']: item['total_completed'] or 0
            for item in completed_per_breed
        }

        pred_view = PredictionViewSet()

        breed_ids = [o.breedid.breedid for o in orders if o.breedid]
        batches_by_breed = Batch.objects.filter(
            breed__breedid__in=breed_ids
        ).prefetch_related('dailyoperations_set')

        latest_ops_dates = DailyOperations.objects.values(
            'batch__batchid'
        ).annotate(latest_date=Max('date'))

        latest_date_dict = {
            item['batch__batchid']: item['latest_date']
            for item in latest_ops_dates
        }

        valid_batches_found = False
        for order in orders:
            breed = order.breedid
            available_eggs = 0
            next_7_days_predicted_eggs = 0

            if breed:
                total_eggs = eggs_dict.get(breed.breedid, 0)
                completed_qty = completed_dict.get(breed.breedid, 0)

                available_eggs = max(0, total_eggs - completed_qty)

                batches = [b for b in batches_by_breed if b.breed == breed]
                prediction_available = False 

                for batch in batches:
                    today = datetime.today().date()
                    yesterday = today - timedelta(days=1)

                    latest_date = latest_date_dict.get(batch.batchid)
                    if not latest_date:
                        continue
                    if (today - latest_date).days > 1:
                        continue

                    prev_ops = batch.dailyoperations_set.filter(date=latest_date).first()
                    if not prev_ops:
                        continue

                    prediction_available = True
                    valid_batches_found = True
                    total_birds = batch.currentcount or batch.initialcount or 1
                    daily_feed = float(prev_ops.feedusage or 0.1)
                    feed_per_bird = daily_feed / total_birds if total_birds else 0.01
                    prev_day_eggs = int(prev_ops.eggcount or 0)
                    lag_1_eggs = prev_day_eggs
                    lag_3_eggs = pred_view.get_lag_value(batch, "eggcount", 3)
                    lag_7_eggs = pred_view.get_lag_value(batch, "eggcount", 7)
                    roll_3_eggs = pred_view.get_rolling_avg(batch, "eggcount", latest_date, 3)
                    roll_7_eggs = pred_view.get_rolling_avg(batch, "eggcount", latest_date, 7)
                    trend_eggs = lag_1_eggs - roll_3_eggs

                    age_weeks = (latest_date - batch.startdate).days // 7

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

                    raw_pred = float(egg_model.predict(X_egg)[0])
                    if lag_1_eggs > 0:
                        adjusted_pred = raw_pred
                    else:
                        factor = pred_view.production_factor(age_weeks)
                        adjusted_pred = raw_pred * factor
                    pred_eggs = max(0, int(round(adjusted_pred)))
                    next_7_days_predicted_eggs += pred_eggs * 7

            results.append({
                "orderid": order.orderid,
                "buyerid": order.buyerid.buyerid,
                "breedid": breed.breedid if breed else None,
                "breedname": breed.breedname if breed else None,
                "eggtype": breed.eggtype if breed else None,
                "available_eggs": available_eggs,
                "next_7_days_predicted_eggs": next_7_days_predicted_eggs if prediction_available else None,
                "prediction_available": prediction_available,
                "quantity": order.quantity,
                "ordereddate": order.ordereddate,
                "requesteddate": order.requesteddate,
                "accepted": order.accepted,
                "completed": order.completed
            })


        return Response(results, status=status.HTTP_200_OK)

class OrderBatchViewSet(viewsets.ModelViewSet):
    queryset = OrderBatch.objects.all()
    serializer_class = OrderBatchSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]