from django.db import models
from batches.models import Batch, DailyOperations
from core.models import User

class Report(models.Model):
    reportid = models.CharField(
        max_length=50, 
        primary_key=True, 
        db_column='reportid',
        blank=True
    )
    batchid = models.ForeignKey(Batch, on_delete=models.CASCADE, db_column='batchid', null=True, blank=True)
    type = models.CharField(max_length=50, null=True, blank=True)
    generatedby = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='generatedby')
    generateddate = models.DateTimeField(auto_now_add=True, db_column='generateddate')
    filepath = models.TextField(null=True, blank=True, db_column='filepath')

    class Meta:
        db_table = 'reports'
        ordering = ['-generateddate']

    def save(self, *args, **kwargs):
        if not self.reportid:
            last_report = Report.objects.filter(
                reportid__startswith="REP"
            ).order_by("-reportid").first()

            next_number = 1
            if last_report:
                try:
                    next_number = int(last_report.reportid.replace("REP", "")) + 1
                except ValueError:
                    pass

            self.reportid = f"REP{next_number:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type or 'Report'} ({self.reportid})"

class Records(models.Model):
    recordsid = models.CharField(
        max_length=50,
        primary_key=True,
        blank=True
    )

    operationid = models.ForeignKey(
        DailyOperations,
        on_delete=models.CASCADE,
        db_column='operationid'
    )

    batchid = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        db_column='batchid'
    )

    timestamp = models.DateTimeField(auto_now_add=True)
    hashvalue = models.TextField()
    previoushash = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'records'
        ordering = ['timestamp']

    def save(self, *args, **kwargs):
        if not self.recordsid:
            last_record = Records.objects.filter(
                recordsid__startswith="REC"
            ).order_by("-recordsid").first()

            next_number = 1
            if last_record:
                try:
                    next_number = int(
                        last_record.recordsid.replace("REC", "")
                    ) + 1
                except ValueError:
                    pass

            self.recordsid = f"REC{next_number:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.recordsid
