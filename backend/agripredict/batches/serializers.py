from rest_framework import serializers
from .models import Breed, Batch, DailyOperations
from feed.models import FeedStock
from datetime import timedelta
from django.db.models import Max

# Breed Serializer
class BreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breed
        fields = '__all__'

# Batch Serializer
class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'
        read_only_fields = (
            'batchid',
            'initialcount',
            'currentcount',
        )

# Daily Operations Serializer
class DailyOperationsSerializer(serializers.ModelSerializer):
    batch = serializers.SlugRelatedField(
        queryset=Batch.objects.all(),
        slug_field='batchid'
    )

    stock = serializers.PrimaryKeyRelatedField(
        queryset=FeedStock.objects.all(),
        required=False,
        allow_null=True
    )

    feedusage = serializers.FloatField(required=False, default=0)
    eggcount = serializers.IntegerField(required=False, default=0)
    avgeggweight = serializers.FloatField(required=False, default=0)
    male_mortality = serializers.IntegerField(required=False, default=0)
    female_mortality = serializers.IntegerField(required=False, default=0)
    water_used = serializers.FloatField(required=False, default=0)
    batchid = serializers.CharField(source='batch.batchid', read_only=True)

    class Meta:
        model = DailyOperations
        fields = "__all__"
        read_only_fields = (
            "operationid",
            "mortalitycount",
            "entered_by", 
        )

    def validate(self, attrs):
        batch = attrs.get("batch")
        stock = attrs.get("stock")
        date = attrs.get("date")
        feed_usage = float(attrs.get("feedusage", 0))
        male_mortality = int(attrs.get("male_mortality", 0))
        female_mortality = int(attrs.get("female_mortality", 0))
        stock_qty = float(stock.quantity) if stock and stock.quantity is not None else 0
        current_male = int(batch.current_male) if batch and batch.current_male is not None else 0
        current_female = int(batch.current_female) if batch and batch.current_female is not None else 0
        if stock and feed_usage > stock_qty:
            raise serializers.ValidationError({
                "feedusage": f"Not enough feed available. Current stock: {stock_qty}"
            })
        if batch:
            if male_mortality > current_male:
                raise serializers.ValidationError({
                    "male_mortality": "Male mortality exceeds current male count."
                })

            if female_mortality > current_female:
                raise serializers.ValidationError({
                    "female_mortality": "Female mortality exceeds current female count."
                })
        
        first_record = DailyOperations.objects.filter(batch=batch).exists()
        if not first_record:
            if date != batch.startdate:
                raise serializers.ValidationError(
                    f"The first daily operation must start from {batch.startdate}."
                )

        if DailyOperations.objects.filter(batch=batch, date=date).exists():
            raise serializers.ValidationError(
                "This batch already has a record for this date."
            )

        last_record = DailyOperations.objects.filter(
            batch=batch
        ).order_by("-date").first()

        if last_record:
            expected_date = last_record.date + timedelta(days=1)

            if date <= last_record.date:
                raise serializers.ValidationError(
                    "You cannot add the same date or an earlier date."
                )

            if date != expected_date:
                raise serializers.ValidationError(
                    f"You must add record for {expected_date} first."
                )
            
        return attrs

    def create(self, validated_data):
        feed_usage = float(validated_data.get("feedusage", 0))
        male_mortality = int(validated_data.get("male_mortality", 0))
        female_mortality = int(validated_data.get("female_mortality", 0))
        stock = validated_data.get("stock")
        batch = validated_data.get("batch")
        if stock and feed_usage > 0:
            stock.quantity = float(stock.quantity) - feed_usage
            stock.save()
        operation = super().create(validated_data)
        if batch:
            batch.current_male = max(int(batch.current_male or 0) - male_mortality, 0)
            batch.current_female = max(int(batch.current_female or 0) - female_mortality, 0)
            batch.currentcount = batch.current_male + batch.current_female
            batch.save()

        return operation