from django.db import models
from batches.models import Batch  
from core.models import User  

class Buyer(models.Model):
    buyerid = models.CharField(max_length=50, primary_key=True)
    userid = models.UUIDField(unique=True)
    address = models.TextField(null=True, blank=True)
    company = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'buyer'

    def __str__(self):
        return f"{self.company or 'Buyer'} ({self.buyerid})"


class Order(models.Model):
    orderid = models.CharField(max_length=50, primary_key=True)
    buyerid = models.ForeignKey(Buyer, on_delete=models.CASCADE, db_column='buyerid')
    urgent = models.BooleanField(default=False)
    ordereddate = models.DateField(auto_now_add=True)
    requesteddate = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'orders'

    def __str__(self):
        return f"Order {self.orderid} - {self.status or 'Pending'}"


class OrderBatch(models.Model):
    batch_order_id = models.AutoField(primary_key=True)
    orderid = models.ForeignKey(Order, on_delete=models.CASCADE, db_column='orderid', related_name='order_batches')
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid', related_name='batch_orders')
    quantity = models.IntegerField()

    class Meta:
        db_table = 'order_batch'
        unique_together = ('orderid', 'batchid')

    def __str__(self):
        return f"Order {self.orderid.orderid} - Batch {self.batchid.batchid}"
