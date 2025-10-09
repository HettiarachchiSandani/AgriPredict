from rest_framework import viewsets
from .models import Owner, Manager, OwnerManagerBatch, OwnerManagerFeedstock
from .serializers import (
    OwnerSerializer, ManagerSerializer,
    OwnerManagerBatchSerializer, OwnerManagerFeedstockSerializer
)

class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer


class ManagerViewSet(viewsets.ModelViewSet):
    queryset = Manager.objects.all()
    serializer_class = ManagerSerializer


class OwnerManagerBatchViewSet(viewsets.ModelViewSet):
    queryset = OwnerManagerBatch.objects.all()
    serializer_class = OwnerManagerBatchSerializer


class OwnerManagerFeedstockViewSet(viewsets.ModelViewSet):
    queryset = OwnerManagerFeedstock.objects.all()
    serializer_class = OwnerManagerFeedstockSerializer
