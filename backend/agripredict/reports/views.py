from rest_framework import viewsets
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Records, Report
from .serializers import RecordSerializer, ReportSerializer
from rest_framework.permissions import IsAuthenticated
from core.permission import IsOwnerOrManager
from rest_framework.decorators import action
from rest_framework.response import Response
from .blockchain import verify_blockchain
import uuid
from django.conf import settings
import os
from .utils import generate_pdf, generate_excel
from datetime import datetime
from batches.models import DailyOperations, Batch
from feed.models import FeedStock
from orders.models import Order
from django.utils.dateparse import parse_date
from django.http import FileResponse, Http404  

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by("-generateddate")
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    @action(detail=False, methods=["post"])
    def generate(self, request):
        report_type = request.data.get("type")
        batch_id = request.data.get("batchid")
        date_from = request.data.get("date_from")
        date_to = request.data.get("date_to")

        if not report_type:
            return Response({"error": "type is required"}, status=400)

        if report_type not in ["batch", "feed", "order", "daily"]:
            return Response({"error": "Invalid report type"}, status=400)

        if report_type != "batch":
            if not date_from or not date_to:
                return Response({"error": "date_from and date_to are required"}, status=400)

        start_date = parse_date(date_from) if date_from else None
        end_date = parse_date(date_to) if date_to else None

        if report_type != "batch":
            if not start_date or not end_date:
                return Response({"error": "Invalid date format"}, status=400)

            if end_date < start_date:
                return Response({"error": "date_to cannot be earlier than date_from"}, status=400)

        batch = None
        if batch_id:
            try:
                batch = Batch.objects.get(batchid=batch_id)
            except Batch.DoesNotExist:
                return Response({"error": "Invalid batchid"}, status=400)

        data = []

        if report_type == "batch":
            queryset = Batch.objects.all()

            if start_date and end_date:
                queryset = queryset.filter(startdate__range=[start_date, end_date])

            if batch_id:
                queryset = queryset.filter(batchid=batch_id)

            data = [
                {
                    "Batch ID": obj.batchid,
                    "Batch Name": obj.batchname,
                    "Breed": str(obj.breed),
                    "Start Date": str(obj.startdate),
                    "Initial Male": obj.initial_male,
                    "Initial Female": obj.initial_female,
                    "Current Male": obj.current_male,
                    "Current Female": obj.current_female,
                    "Initial Count": obj.initialcount,
                    "Current Count": obj.currentcount,
                    "Status": obj.status,
                    "Note": obj.note,
                }
                for obj in queryset
            ]

        elif report_type == "feed":
            queryset = FeedStock.objects.filter(lastupdated__date__range=[start_date, end_date])

            data = [
                {
                    "Stock ID": obj.stockid,
                    "Feed Type": obj.feedtype,
                    "Quantity": obj.quantity,
                    "Last Updated": obj.lastupdated.strftime("%Y-%m-%d %H:%M:%S") if obj.lastupdated else "",
                    "Status": obj.status,
                }
                for obj in queryset
            ]

        elif report_type == "order":
            queryset = Order.objects.filter(requesteddate__range=[start_date, end_date])

            data = [
                {
                    "Order ID": obj.orderid,
                    "Buyer ID": obj.buyerid.buyerid if obj.buyerid else "",
                    "Buyer Name": (
                        f"{obj.buyerid.userid.firstname} {obj.buyerid.userid.lastname or ''}"
                        if obj.buyerid and obj.buyerid.userid else ""
                    ),
                    "Buyer Email": obj.buyerid.userid.email if obj.buyerid and obj.buyerid.userid else "",
                    "Company": obj.buyerid.company if obj.buyerid else "",
                    "Address": obj.buyerid.address if obj.buyerid else "",
                    "Breed": str(obj.breedid) if obj.breedid else "",
                    "Ordered Date": str(obj.ordereddate) if obj.ordereddate else "",
                    "Requested Date": str(obj.requesteddate) if obj.requesteddate else "",
                    "Completed Date": str(obj.completeddate) if obj.completeddate else "",
                    "Quantity": obj.quantity,
                    "Status": obj.status,
                    "Note": obj.note,
                }
                for obj in queryset
            ]

        elif report_type == "daily":
            queryset = DailyOperations.objects.filter(date__range=[start_date, end_date])

            if batch_id:
                queryset = queryset.filter(batch=batch)

            data = [
                {
                    "Operation ID": obj.operationid,
                    "Batch ID": obj.batch.batchid if obj.batch else "",
                    "Stock ID": obj.stock.stockid if obj.stock else "",
                    "Date": str(obj.date),
                    "Feed Usage": obj.feedusage,
                    "Water Used": obj.water_used,
                    "Egg Count": obj.eggcount,
                    "Avg Egg Weight": obj.avgeggweight,
                    "Male Mortality": obj.male_mortality,
                    "Female Mortality": obj.female_mortality,
                    "Mortality Count": obj.mortalitycount,
                    "Notes": obj.notes,
                    "Entered By": str(obj.entered_by) if obj.entered_by else "",
                }
                for obj in queryset
            ]

        if not data:
            return Response({"error": "No data found"}, status=404)

        return Response({
            "message": "Preview generated successfully",
            "data": data
        })

    @action(detail=False, methods=["post"])
    def download(self, request):
        report_type = request.data.get("type")
        batch_id = request.data.get("batchid")
        date_from = request.data.get("date_from")
        date_to = request.data.get("date_to")

        if not report_type:
            return Response({"error": "type is required"}, status=400)

        if report_type not in ["batch", "feed", "order", "daily"]:
            return Response({"error": "Invalid report type"}, status=400)

        if report_type != "batch":
            if not date_from or not date_to:
                return Response({"error": "date_from and date_to are required"}, status=400)

        start_date = parse_date(date_from) if date_from else None
        end_date = parse_date(date_to) if date_to else None

        if report_type != "batch":
            if not start_date or not end_date:
                return Response({"error": "Invalid date format"}, status=400)

            if end_date < start_date:
                return Response({"error": "date_to cannot be earlier than date_from"}, status=400)

        batch = None
        if batch_id:
            try:
                batch = Batch.objects.get(batchid=batch_id)
            except Batch.DoesNotExist:
                return Response({"error": "Invalid batchid"}, status=400)

        data = []

        if report_type == "batch":
            queryset = Batch.objects.all()

            if start_date and end_date:
                queryset = queryset.filter(startdate__range=[start_date, end_date])

            if batch_id:
                queryset = queryset.filter(batchid=batch_id)

            data = [
                {
                    "Batch ID": obj.batchid,
                    "Batch Name": obj.batchname,
                    "Breed": str(obj.breed),
                    "Start Date": str(obj.startdate),
                    "Initial Male": obj.initial_male,
                    "Initial Female": obj.initial_female,
                    "Current Male": obj.current_male,
                    "Current Female": obj.current_female,
                    "Initial Count": obj.initialcount,
                    "Current Count": obj.currentcount,
                    "Status": obj.status,
                    "Note": obj.note,
                }
                for obj in queryset
            ]

        elif report_type == "feed":
            queryset = FeedStock.objects.filter(lastupdated__date__range=[start_date, end_date])

            data = [
                {
                    "Stock ID": obj.stockid,
                    "Feed Type": obj.feedtype,
                    "Quantity": obj.quantity,
                    "Last Updated": obj.lastupdated.strftime("%Y-%m-%d %H:%M:%S") if obj.lastupdated else "",
                    "Status": obj.status,
                }
                for obj in queryset
            ]

        elif report_type == "order":
            queryset = Order.objects.filter(requesteddate__range=[start_date, end_date])

            data = [
                {
                    "Order ID": obj.orderid,
                    "Buyer ID": obj.buyerid.buyerid if obj.buyerid else "",
                    "Buyer Name": (
                        f"{obj.buyerid.userid.firstname} {obj.buyerid.userid.lastname or ''}"
                        if obj.buyerid and obj.buyerid.userid else ""
                    ),
                    "Buyer Email": obj.buyerid.userid.email if obj.buyerid and obj.buyerid.userid else "",
                    "Company": obj.buyerid.company if obj.buyerid else "",
                    "Address": obj.buyerid.address if obj.buyerid else "",
                    "Breed": str(obj.breedid) if obj.breedid else "",
                    "Ordered Date": str(obj.ordereddate) if obj.ordereddate else "",
                    "Requested Date": str(obj.requesteddate) if obj.requesteddate else "",
                    "Completed Date": str(obj.completeddate) if obj.completeddate else "",
                    "Quantity": obj.quantity,
                    "Status": obj.status,
                    "Note": obj.note,
                }
                for obj in queryset
            ]

        elif report_type == "daily":
            queryset = DailyOperations.objects.filter(date__range=[start_date, end_date])

            if batch_id:
                queryset = queryset.filter(batch=batch)

            data = [
                {
                    "Operation ID": obj.operationid,
                    "Batch ID": obj.batch.batchid if obj.batch else "",
                    "Stock ID": obj.stock.stockid if obj.stock else "",
                    "Date": str(obj.date),
                    "Feed Usage": obj.feedusage,
                    "Water Used": obj.water_used,
                    "Egg Count": obj.eggcount,
                    "Avg Egg Weight": obj.avgeggweight,
                    "Male Mortality": obj.male_mortality,
                    "Female Mortality": obj.female_mortality,
                    "Mortality Count": obj.mortalitycount,
                    "Notes": obj.notes,
                    "Entered By": str(obj.entered_by) if obj.entered_by else "",
                }
                for obj in queryset
            ]

        if not data:
            return Response({"error": "No data found"}, status=404)

        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

        file_name = f"{uuid.uuid4()}.xlsx"
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)

        generate_excel(file_path, data)

        report = Report.objects.create(
            batchid=batch,
            type=report_type,
            filepath=file_name,
            generatedby=request.user
        )

        file_full_path = os.path.join(settings.MEDIA_ROOT, file_name)

        return FileResponse(
            open(file_full_path, 'rb'),
            as_attachment=True,
            filename="report.xlsx",
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    @action(detail=False, methods=["post"])
    def preview(self, request):
        report_type = request.data.get("type")
        batch_id = request.data.get("batchid")
        date_from = request.data.get("date_from")
        date_to = request.data.get("date_to")

        data = []

        return Response({"data": data})

class RecordViewSet(ReadOnlyModelViewSet):
    queryset = Records.objects.all().order_by('-timestamp')
    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    @action(detail=False, methods=["get"])
    def verify(self, request):
        valid, problem_block = verify_blockchain()
        return Response({
            "valid": valid,
            "problem_block": problem_block
        })