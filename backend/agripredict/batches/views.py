from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Breed, Batch, DailyOperations
from .serializers import BreedSerializer, BatchSerializer, DailyOperationsSerializer
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from core.permission import IsOwnerOrManager
from reports.blockchain import add_block
from rest_framework import status
from rest_framework.decorators import action
from datetime import timedelta, datetime
from collections import defaultdict

class BreedViewSet(viewsets.ModelViewSet):
    queryset = Breed.objects.all()
    serializer_class = BreedSerializer
    permission_classes = [IsAuthenticated]

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().order_by("batchid")
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Batch.objects.all().order_by("batchid")
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        batches = Batch.objects.filter(status="Active").order_by("batchid")
        serializer = self.get_serializer(batches, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        try:
            batch = Batch.objects.get(batchid=pk)
        except Batch.DoesNotExist:
            return Response({"error": "Batch not found"}, status=404)

        daily_ops = DailyOperations.objects.filter(batch=batch)

        totals = daily_ops.aggregate(
            total_feed=Sum('feedusage'),
            total_eggs=Sum('eggcount'),
            total_mortality=Sum('mortalitycount'),  
            total_male_mortality=Sum('male_mortality'),
            total_female_mortality=Sum('female_mortality')
        )

        avg_eggs_per_bird = (totals['total_eggs'] or 0) / batch.initialcount if batch.initialcount else 0
        feed_per_egg = (totals['total_feed'] or 0) / (totals['total_eggs'] or 1)
        mortality_rate = (totals['total_mortality'] or 0) / batch.initialcount if batch.initialcount else 0

        data = {
            "batchid": batch.batchid,
            "batchname": batch.batchname,
            "breedname": batch.breed.breedname,
            "eggtype": batch.breed.eggtype,
            "startdate": batch.startdate,
            "status": batch.status,
            "note": batch.note or "",

            "initial_male": batch.initial_male or 0,
            "initial_female": batch.initial_female or 0,
            "initial_total": (batch.initial_male or 0) + (batch.initial_female or 0),

            "current_male": batch.current_male or 0,
            "current_female": batch.current_female or 0,
            "current_total": (batch.current_male or 0) + (batch.current_female or 0),

            "mortality_male": totals['total_male_mortality'] or 0,
            "mortality_female": totals['total_female_mortality'] or 0,
            "total_mortality": totals['total_mortality'] or 0,

            "total_eggs": totals['total_eggs'] or 0,
            "total_feed": totals['total_feed'] or 0,
            "avg_eggs_per_bird": round(avg_eggs_per_bird, 2),
            "feed_per_egg": round(feed_per_egg, 2),
            "mortality_rate": round(mortality_rate * 100, 2)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def performance(self, request):

        batches = Batch.objects.all()
        results = []

        today = datetime.today().date()

        for batch in batches:

            ops = DailyOperations.objects.filter(batch=batch)

            totals = ops.aggregate(
                total_feed=Sum("feedusage"),
                total_eggs=Sum("eggcount"),
                total_mortality=Sum("mortalitycount")
            )

            total_feed = totals["total_feed"] or 0
            total_eggs = totals["total_eggs"] or 0
            total_mortality = totals["total_mortality"] or 0

            if not batch.initialcount:
                continue

            age_days = (today - batch.startdate).days

            mortality_rate = (total_mortality / batch.initialcount) * 100
            feed_efficiency = total_eggs / total_feed if total_feed else 0
            egg_per_bird = total_eggs / batch.initialcount


            if age_days < 126:
                score = (
                    80 - (mortality_rate * 2)
                )

            elif 126 <= age_days <= 560:
                score = (
                    (egg_per_bird * 60) +
                    (feed_efficiency * 20) -
                    (mortality_rate * 0.5)
                )

            else:
                score = (
                    (egg_per_bird * 40) +
                    (feed_efficiency * 20) -
                    (mortality_rate * 0.8)
                )

            score = max(0, min(100, round(score, 2)))

            if score >= 70:
                status = "Excellent"
            elif score >= 50:
                status = "Average"
            else:
                status = "Needs Attention"

            results.append({
                "batchid": batch.batchid,
                "batchname": batch.batchname,
                "score": score,
                "mortality_rate": round(mortality_rate, 2),
                "feed_efficiency": round(feed_efficiency, 2),
                "egg_per_bird": round(egg_per_bird, 2),
                "age_days": age_days,
                "status": status
            })

        results = sorted(results, key=lambda x: x["score"], reverse=True)

        return Response(results)

class DailyOperationsViewSet(viewsets.ModelViewSet):
    queryset = DailyOperations.objects.all().order_by("date")
    serializer_class = DailyOperationsSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def perform_create(self, serializer):
        print("REQUEST DATA:", self.request.data)
        operation = serializer.save(entered_by=self.request.user)
        add_block(operation)
        

    def list(self, request, *args, **kwargs):
        batch_id = request.query_params.get("batch")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if not batch_id or not start_date or not end_date:
            return Response(
                {"detail": "batch, start_date, and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        ops = DailyOperations.objects.filter(batch__batchid=batch_id, date__range=(start, end)).order_by("date")
        ops_by_date = {op.date: op for op in ops}

        result_list = []
        current = start
        while current <= end:
            op = ops_by_date.get(current)
            if op:
                serialized = self.get_serializer(op).data
            else:
                serialized = {
                    "operationid": None,
                    "batchid": batch_id,
                    "date": current.isoformat(),
                    "feedusage": None,
                    "water_used": None,
                    "eggcount": None,
                    "avgeggweight": None,
                    "male_mortality": None,
                    "female_mortality": None,
                    "mortalitycount": None,
                    "notes": None,
                }
            result_list.append(serialized)
            current += timedelta(days=1)

        return Response(result_list)

class DailySummaryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        today = datetime.today().date()
        yesterday = today - timedelta(days=1)
        month_ago = today - timedelta(days=10)

        batches = list(Batch.objects.values_list("batchname", flat=True))

        yesterday_totals = DailyOperations.objects.filter(date=yesterday).aggregate(
            eggs=Sum('eggcount'),
            feed=Sum('feedusage'),
            mortality=Sum('mortalitycount')
        )

        daily_ops = DailyOperations.objects.filter(date__range=(month_ago, yesterday))

        daily_data = defaultdict(lambda: defaultdict(lambda: {"eggs":0,"feed":0,"mortality":0}))
        for op in daily_ops:
            date_key = op.date.isoformat()
            batch_name = op.batch.batchname
            daily_data[date_key][batch_name]["eggs"] += op.eggcount or 0
            daily_data[date_key][batch_name]["feed"] += op.feedusage or 0
            daily_data[date_key][batch_name]["mortality"] += op.mortalitycount or 0

        filled_data = []
        current = month_ago
        while current <= yesterday:
            date_key = current.isoformat()
            day_batches = daily_data.get(date_key, {})

            eggs = {}
            feed = {}
            mortality = {}

            for batch in batches:
                eggs[batch] = day_batches.get(batch, {}).get("eggs", 0)
                feed[batch] = day_batches.get(batch, {}).get("feed", 0)
                mortality[batch] = day_batches.get(batch, {}).get("mortality", 0)

            filled_data.append({
                "date": date_key,
                "eggs_per_batch": eggs,
                "feed_per_batch": feed,
                "mortality_per_batch": mortality,
            })

            current += timedelta(days=1)

        return Response({
            "yesterday_totals": yesterday_totals,
            "last_30_days": filled_data
        }, status=status.HTTP_200_OK)