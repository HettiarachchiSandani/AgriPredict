from django.db import models
from batches.models import Batch

class Prediction(models.Model):
    predictionid = models.CharField(max_length=50, primary_key=True, editable=False)
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid')
    dategenerated = models.DateTimeField(auto_now_add=True)
    predictedeggcount = models.IntegerField(null=True, blank=True)
    predictedfeedrequirement = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    predicted_mortality = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    input_features = models.JSONField(null=True, blank=True)  

    class Meta:
        db_table = 'predictions'

    def save(self, *args, **kwargs):
        if not self.predictionid:
            last = Prediction.objects.all().order_by('predictionid').last()
            if last:
                last_id = int(last.predictionid.replace('PRE', ''))
                self.predictionid = f'PRE{last_id + 1:03d}'
            else:
                self.predictionid = 'PRE001'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Prediction {self.predictionid}"