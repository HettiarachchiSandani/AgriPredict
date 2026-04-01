from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import FeedStock
from .serializers import FeedStockSerializer
from rest_framework.permissions import IsAuthenticated
from core.permission import IsOwnerOrManager

class FeedStockViewSet(viewsets.ModelViewSet):
    queryset = FeedStock.objects.all().order_by("stockid")
    serializer_class = FeedStockSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)