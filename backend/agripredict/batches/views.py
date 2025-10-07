from rest_framework import viewsets
from .models import Batch, Breed, DailyOperations
from .serializers import BatchSerializer, BreedSerializer, DailyOperationsSerializer

class BreedViewSet(viewsets.ModelViewSet):
    queryset = Breed.objects.all()
    serializer_class = BreedSerializer

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

class DailyOperationsViewSet(viewsets.ModelViewSet):
    queryset = DailyOperations.objects.all()
    serializer_class = DailyOperationsSerializer
