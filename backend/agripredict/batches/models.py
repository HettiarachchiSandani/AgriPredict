from django.db import models

class Breed(models.Model):
    breedid = models.CharField(max_length=50, primary_key=True)
    breedname = models.CharField(max_length=100)
    eggtype = models.CharField(max_length=50, null=True, blank=True)
    avglifespan = models.IntegerField(null=True, blank=True)
    avgdailyeggrate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'breed'  

    def __str__(self):
        return self.breedname


class Batch(models.Model):
    class BatchStatus(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        COMPLETED = 'Completed', 'Completed'
        TERMINATED = 'Terminated', 'Terminated'
        ARCHIVED = 'Archived', 'Archived'

    batchid = models.CharField(max_length=50, primary_key=True)
    breed = models.ForeignKey(
        Breed, 
        on_delete=models.CASCADE,
        db_column='breedid'
    )
    startdate = models.DateField()
    initialcount = models.IntegerField()
    currentcount = models.IntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=BatchStatus.choices,
        default=BatchStatus.ACTIVE
    )

    class Meta:
        db_table = 'batch' 

    def __str__(self):
        return f"{self.batchid} ({self.status})"


class DailyOperations(models.Model):
    operationid = models.CharField(max_length=50, primary_key=True)
    batch = models.ForeignKey(
        Batch, 
        on_delete=models.CASCADE,
        db_column='batchid'
    )
    date = models.DateField()
    feedusage = models.IntegerField(null=True, blank=True)
    eggcount = models.IntegerField(null=True, blank=True)
    mortalitycount = models.IntegerField(null=True, blank=True)
    waterused = models.IntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'dailyoperations'  

    def __str__(self):
        return f"{self.operationid} - {self.batch.batchid}"
