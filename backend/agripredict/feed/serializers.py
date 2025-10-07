from rest_framework import serializers
from .models import FeedStock

class FeedStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedStock
        fields = '__all__'
