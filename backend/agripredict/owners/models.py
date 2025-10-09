from django.db import models
from core.models import User
from batches.models import Batch
from feed.models import FeedStock

class Owner(models.Model):
    ownerid = models.CharField(max_length=50, primary_key=True)
    userid = models.UUIDField(unique=True)
    farmname = models.CharField(max_length=150, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'owner'

    def __str__(self):
        return f"{self.farmname or 'Owner'} ({self.ownerid})"


class Manager(models.Model):
    managerid = models.CharField(max_length=50, primary_key=True)
    ownerid = models.ForeignKey(Owner, on_delete=models.CASCADE, db_column='ownerid', related_name='managers')
    userid = models.UUIDField(unique=True)

    class Meta:
        db_table = 'manager'

    def __str__(self):
        return f"Manager {self.managerid} of Owner {self.ownerid.ownerid}"

class OwnerManagerBatch(models.Model):
    ownerid = models.ForeignKey(Owner, on_delete=models.CASCADE, db_column='ownerid')
    managerid = models.ForeignKey(Manager, on_delete=models.CASCADE, db_column='managerid')
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid')
    batch_relation_id = models.AutoField(primary_key=True) 
     
    class Meta:
        db_table = 'owner_manager_batch'
        unique_together = ('ownerid', 'managerid', 'batchid')

    def __str__(self):
        return f"{self.ownerid.ownerid} - {self.managerid.managerid} - {self.batchid.batchid}"

class OwnerManagerFeedstock(models.Model):
    ownerid = models.ForeignKey(Owner, on_delete=models.CASCADE, db_column='ownerid')
    managerid = models.ForeignKey(Manager, on_delete=models.CASCADE, db_column='managerid')
    stockid = models.ForeignKey(FeedStock, on_delete=models.CASCADE, db_column='stockid')
    feed_relation_id = models.AutoField(primary_key=True) 

    class Meta:
        db_table = 'owner_manager_feedstock'
        unique_together = ('ownerid', 'managerid', 'stockid')

    def __str__(self):
        return f"{self.ownerid.ownerid} - {self.managerid.managerid} - {self.stockid.stockid}"
