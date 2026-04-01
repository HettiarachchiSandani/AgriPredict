from django.db import models
from batches.models import Batch  
from core.models import User  
from batches.models import Breed
from datetime import date

class Buyer(models.Model):
    buyerid = models.CharField(max_length=10, primary_key=True, editable=False)
    userid = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='userid' 
    )
    address = models.TextField(null=True, blank=True)
    company = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'buyer'

    def save(self, *args, **kwargs):
        if not self.buyerid:
            buyers = Buyer.objects.filter(buyerid__startswith="BUY")
            if buyers.exists():
                max_id = max(int(b.buyerid[3:]) for b in buyers)
                self.buyerid = f"BUY{str(max_id + 1).zfill(3)}"
            else:
                self.buyerid = "BUY001"
        super().save(*args, **kwargs)
        
    def __str__(self):
            return f"Buyer {self.buyerid}"

class Order(models.Model):
    orderid = models.CharField(max_length=50, primary_key=True)
    buyerid = models.ForeignKey(Buyer, on_delete=models.CASCADE, db_column='buyerid')
    breedid = models.ForeignKey(Breed, on_delete=models.CASCADE, db_column='breedid', null=True, blank=True)
    ordereddate = models.DateField(null=True, blank=True)
    requesteddate = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    accepted = models.BooleanField(null=True, blank=True)
    completed = models.BooleanField(default=False) 
    completeddate = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['orderid'] 

    def save(self, *args, **kwargs):
        if not self.requesteddate:
            self.requesteddate = date.today()

        if not self.orderid:
            last_order = Order.objects.order_by('-orderid').first()
            if last_order:
                last_id = int(last_order.orderid.replace("REQ", ""))
                self.orderid = f"REQ{last_id + 1:03d}"
            else:
                self.orderid = "REQ001"
        
        if not self.ordereddate:
            self.ordereddate = None 

        if self.completed:
            self.accepted = True
            self.status = "Completed"
            self.completeddate = date.today()
        elif self.accepted is True:
            self.status = "Confirmed"
        elif self.accepted is False:
            self.status = "Canceled"
        else:
            self.status = "Pending"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.orderid} - {self.status}"

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