from rest_framework import viewsets
from .models import FeedStock
from .serializers import FeedStockSerializer

class FeedStockViewSet(viewsets.ModelViewSet):
    queryset = FeedStock.objects.all()
    serializer_class = FeedStockSerializer
