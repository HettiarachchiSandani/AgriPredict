from django.db import models
from batches.models import Batch
from orders.models import Order
from predictions.models import Prediction
from core.models import User

class Report(models.Model):
    reportid = models.CharField(max_length=50, primary_key=True, db_column='reportid')
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid')
    type = models.CharField(max_length=50, null=True, blank=True)
    generatedby = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='generatedby')
    generateddate = models.DateField(auto_now_add=True, db_column='generateddate')
    filepath = models.TextField(null=True, blank=True, db_column='filepath')

    class Meta:
        db_table = 'reports'

    def __str__(self):
        return f"{self.type or 'Report'} ({self.reportid})"


class Record(models.Model):
    recordsid = models.CharField(max_length=50, primary_key=True, db_column='recordsid')
    operationsid = models.ForeignKey('batches.DailyOperations', on_delete=models.SET_NULL, null=True, blank=True, db_column='operationsid')
    orderid = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, db_column='orderid')
    predictionsid = models.ForeignKey(Prediction, on_delete=models.SET_NULL, null=True, blank=True, db_column='predictionsid')
    reportsid = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True, db_column='reportsid')
    batchid = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, db_column='batchid')
    entrytype = models.CharField(max_length=50, null=True, blank=True, db_column='entrytype')
    timestamp = models.DateTimeField(auto_now_add=True, db_column='timestamp')
    hashvalue = models.TextField(db_column='hashvalue')
    previoushash = models.TextField(null=True, blank=True, db_column='previoushash')

    class Meta:
        db_table = 'records'

    def __str__(self):
        return f"Record {self.recordsid} - {self.entrytype or 'Entry'}"
