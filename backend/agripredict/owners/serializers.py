from rest_framework import serializers
from .models import Owner, Manager, OwnerManagerBatch, OwnerManagerFeedstock

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = '__all__'


class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = '__all__'


class OwnerManagerBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerManagerBatch
        fields = '__all__'


class OwnerManagerFeedstockSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerManagerFeedstock
        fields = '__all__'
