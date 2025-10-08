from rest_framework import serializers
from .models import Buyer, Order, OrderBatch

class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class OrderBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderBatch
        fields = ('orderid', 'batchid', 'quantity')


