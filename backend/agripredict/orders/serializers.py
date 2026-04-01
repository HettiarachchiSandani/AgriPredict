from rest_framework import serializers
from .models import Buyer, Order, OrderBatch
from core.serializers import UserSerializer

#BUYER
class BuyerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='userid', read_only=True)

    class Meta:
        model = Buyer
        fields = ['buyerid', 'userid', 'user_details', 'company', 'address']
        read_only_fields = ('buyerid', 'userid')

class OrderSerializer(serializers.ModelSerializer):
    buyer_details = BuyerSerializer(source='buyerid', read_only=True)
    breed_details = serializers.StringRelatedField(source='breedid', read_only=True)
    breedname = serializers.CharField(source='breedid.breedname', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('orderid', 'buyerid','requesteddate', 'status')

    def create(self, validated_data):
        user = self.context['request'].user
        if hasattr(user, "buyer"):  
            validated_data['buyerid'] = user.buyer
        return super().create(validated_data)

#ORDER BATCH
class OrderBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderBatch
        fields = ('orderid', 'batchid', 'quantity')