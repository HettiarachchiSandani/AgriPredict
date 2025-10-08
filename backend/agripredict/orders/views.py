from rest_framework import viewsets
from .models import Buyer, Order, OrderBatch
from .serializers import BuyerSerializer, OrderSerializer, OrderBatchSerializer

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderBatchViewSet(viewsets.ModelViewSet):
    queryset = OrderBatch.objects.all()
    serializer_class = OrderBatchSerializer
