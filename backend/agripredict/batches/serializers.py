from rest_framework import serializers
from .models import Batch, Breed, DailyOperations

class BreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breed
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class DailyOperationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyOperations
        fields = '__all__'
