# models.py
from django.db import models
from batches.models import Batch

class Prediction(models.Model):
    predictionid = models.CharField(max_length=50, primary_key=True)
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid')
    dategenerated = models.DateField(auto_now_add=True)
    predictedeggcount = models.IntegerField(null=True, blank=True)
    predictedfeedrequirement = models.IntegerField(null=True, blank=True)
    confidencelevel = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'predictions'  

    def __str__(self):
        return f"Prediction {self.predictionid}"
