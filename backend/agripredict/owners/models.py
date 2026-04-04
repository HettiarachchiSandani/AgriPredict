from django.db import models
from core.models import User
import uuid

class Owner(models.Model):
    ownerid = models.CharField(max_length=10, primary_key=True, editable=False)
    userid = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='userid'  
    )
    farmname = models.CharField(max_length=150, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'owner'

    def save(self, *args, **kwargs):
        if not self.ownerid:
            last_owner = Owner.objects.all().order_by('ownerid').last()
            if last_owner and last_owner.ownerid.startswith("O"):
                last_id = int(last_owner.ownerid[1:])
                self.ownerid = f"O{str(last_id + 1).zfill(3)}"
            else:
                self.ownerid = "O001"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.farmname or 'Owner'} ({self.ownerid})"


class Manager(models.Model):
    managerid = models.CharField(max_length=10, primary_key=True, editable=False)
    userid = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='userid' 
    )

    class Meta:
        db_table = 'manager'

    def save(self, *args, **kwargs):
        if not self.managerid:
            last_manager = Manager.objects.all().order_by('managerid').last()
            if last_manager and last_manager.managerid.startswith("M"):
                try:
                    last_id = int(last_manager.managerid[1:])
                except ValueError:
                    last_id = 0
                self.managerid = f"M{str(last_id + 1).zfill(3)}"
            else:
                self.managerid = "M001"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Manager {self.managerid}"
