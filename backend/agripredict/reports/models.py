from django.db import models
from batches.models import Batch
from orders.models import Order
from batches.models import DailyOperations
from core.models import User

class Reports(models.Model):
    reportid = models.CharField(max_length=50, primary_key=True)
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid')
    type = models.CharField(max_length=50, null=True, blank=True)
    generatedby = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='generatedby')
    generateddate = models.DateField(auto_now_add=True)
    filepath = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'reports'

    def __str__(self):
        return f"{self.type or 'Report'} ({self.reportid})"


class Records(models.Model):
    recordsid = models.CharField(max_length=50, primary_key=True)
    operationsid = models.ForeignKey('batches.DailyOperations', on_delete=models.SET_NULL, null=True, blank=True, db_column='operationsid')
    orderid = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, db_column='orderid')
    predictionsid = models.ForeignKey('predictions.Prediction', on_delete=models.SET_NULL, null=True, blank=True, db_column='predictionsid')
    reportsid = models.ForeignKey(Reports, on_delete=models.SET_NULL, null=True, blank=True, db_column='reportsid')
    batchid = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, db_column='batchid')
    entrytype = models.CharField(max_length=50, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    hashvalue = models.TextField()
    previoushash = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'records'

    def __str__(self):
        return f"Record {self.recordsid} - {self.entrytype or 'Entry'}"
