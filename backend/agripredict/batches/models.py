from django.db import models
from feed.models import FeedStock
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

# Breed Model
class Breed(models.Model):
    breedid = models.CharField(max_length=50, primary_key=True)
    breedname = models.CharField(max_length=100)
    eggtype = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'breed'

    def __str__(self):
        return self.breedname

# Batch Model
class Batch(models.Model):
    class BatchStatus(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        COMPLETED = 'Completed', 'Completed'
        TERMINATED = 'Terminated', 'Terminated'
        ARCHIVED = 'Archived', 'Archived'

    batchid = models.CharField(max_length=50, primary_key=True, blank=True)
    batchname = models.CharField(max_length=100)

    breed = models.ForeignKey(
        Breed,
        on_delete=models.CASCADE,
        db_column='breedid',
        related_name="batches"
    )

    startdate = models.DateField()
    initial_male = models.IntegerField(null=True, blank=True)
    initial_female = models.IntegerField(null=True, blank=True)
    current_male = models.IntegerField(null=True, blank=True)
    current_female = models.IntegerField(null=True, blank=True)
    initialcount = models.IntegerField(editable=False)
    currentcount = models.IntegerField(editable=False)
    status = models.CharField(
        max_length=20,
        choices=BatchStatus.choices,
        default=BatchStatus.ACTIVE
    )
    note = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'batch'

    def save(self, *args, **kwargs):
        if not self.batchid:
            last_batch = Batch.objects.filter(
                batchid__startswith="Batch"
            ).order_by("-batchid").first()

            next_number = 1
            if last_batch:
                try:
                    next_number = int(last_batch.batchid.replace("Batch", "")) + 1
                except ValueError:
                    pass

            self.batchid = f"Batch{next_number:03d}"

        male_init = self.initial_male or 0
        female_init = self.initial_female or 0
        self.initialcount = male_init + female_init

        if self.current_male is None:
            self.current_male = male_init
        if self.current_female is None:
            self.current_female = female_init

        self.currentcount = (self.current_male or 0) + (self.current_female or 0)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batchid} ({self.status})"

# Daily Operations Model
class DailyOperations(models.Model):
    operationid = models.CharField(max_length=50, primary_key=True, blank=True)

    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        db_column="batchid"
    )

    stock = models.ForeignKey(
        FeedStock,
        on_delete=models.CASCADE,
        db_column="stockid",
        null=True,
        blank=True
    )

    date = models.DateField()
    feedusage = models.FloatField(null=True, blank=True)
    water_used = models.FloatField(null=True, blank=True)
    eggcount = models.IntegerField(null=True, blank=True)
    avgeggweight = models.FloatField(null=True, blank=True)
    male_mortality = models.IntegerField(null=True, blank=True)
    female_mortality = models.IntegerField(null=True, blank=True)
    mortalitycount = models.IntegerField(editable=False)
    notes = models.TextField(null=True, blank=True)
    entered_by = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)


    class Meta:
        db_table = "dailyoperations"
        ordering = ["date"]
        unique_together = ('batch', 'date') 

    def save(self, *args, **kwargs):
        if not self.operationid:
            last_op = DailyOperations.objects.filter(
                operationid__startswith="Op"
            ).order_by("-operationid").first()

            next_number = 1
            if last_op:
                try:
                    next_number = int(last_op.operationid.replace("Op", "")) + 1
                except ValueError:
                    pass

            self.operationid = f"Op{next_number:03d}"

        male = int(self.male_mortality or 0)
        female = int(self.female_mortality or 0)
        self.mortalitycount = male + female

        super().save(*args, **kwargs)