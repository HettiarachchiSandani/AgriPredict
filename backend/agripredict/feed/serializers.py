from rest_framework import serializers
from .models import FeedStock
from django.db import transaction

class FeedStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedStock
        fields = '__all__'
        read_only_fields = ('stockid',)  

    def create(self, validated_data):
        if not validated_data.get("stockid"):
            with transaction.atomic():  
                last_stock = (
                    FeedStock.objects
                    .filter(stockid__startswith="FS")
                    .order_by("-stockid")
                    .first()
                )

                if last_stock and last_stock.stockid:
                    try:
                        last_number = int(last_stock.stockid.replace("FS", ""))
                    except ValueError:
                        last_number = 0
                    next_number = last_number + 1
                else:
                    next_number = 1

                validated_data["stockid"] = f"FS{next_number:03d}"  

        return super().create(validated_data)