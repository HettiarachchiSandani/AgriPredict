from django.db import models

class FeedStock(models.Model):
    stockid = models.CharField(max_length=50, primary_key=True)
    feedtype = models.CharField(max_length=100)
    quantity = models.IntegerField()
    lastupdated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'feedstock'

    def __str__(self):
        return f"{self.feedtype} ({self.stockid})"
