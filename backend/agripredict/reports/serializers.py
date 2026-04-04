from rest_framework import serializers
from .models import Records, Report

class ReportSerializer(serializers.ModelSerializer):
    generatedby = serializers.StringRelatedField()
    
    class Meta:
        model = Report
        fields = '__all__'

class RecordSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batchid.batchname', read_only=True)
    operation_date = serializers.DateField(source='operationid.date', read_only=True)
    entered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Records
        fields = [
            "recordsid",
            "operationid",
            "batchid",
            "timestamp",
            "hashvalue",
            "previoushash",
            "batch_name",
            "operation_date",
            "entered_by_name",
        ]

    def get_entered_by_name(self, obj):
        try:
            return obj.operationid.entered_by.email
        except AttributeError:
            return None