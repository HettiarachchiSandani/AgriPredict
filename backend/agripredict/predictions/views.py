from rest_framework import viewsets
from .models import Prediction
from .serializers import PredictionSerializer

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
