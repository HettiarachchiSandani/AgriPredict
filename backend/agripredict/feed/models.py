from django.db import models
from core.models import Notifications, User

class FeedStock(models.Model):
    STOCK_STATUS_CHOICES = [
        ("Available", "Available"),
        ("Low Stock", "Low Stock"),
        ("Out of Stock", "Out of Stock"),
    ]

    stockid = models.CharField(max_length=50, primary_key=True, blank=True)
    feedtype = models.CharField(max_length=100)
    quantity = models.FloatField()
    lastupdated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50, choices=STOCK_STATUS_CHOICES, default="Available")

    class Meta:
        db_table = 'feedstock'

    def __str__(self):
        return f"{self.feedtype} ({self.stockid})"

    def save(self, *args, **kwargs):
        old_status = None

        if self.pk:
            try:
                old_status = FeedStock.objects.get(pk=self.pk).status
            except FeedStock.DoesNotExist:
                old_status = None

        if self.quantity <= 0:
            self.status = "Out of Stock"
            self.quantity = 0
        elif self.quantity < 500:
            self.status = "Low Stock"
        else:
            self.status = "Available"

        super().save(*args, **kwargs)

        if self.status in ["Low Stock", "Out of Stock"] and self.status != old_status:
            message = f"Feedstock '{self.feedtype}' is {self.status} (Qty: {self.quantity})"

            recipients = User.objects.filter(role__roleid__in=["A002", "A003"])

            for user in recipients:
                exists = Notifications.objects.filter(
                    user=user,
                    message=message,
                    type=Notifications.NotificationType.WARNING
                ).exists()

                if not exists:
                    Notifications.objects.create(
                        user=user,
                        message=message,
                        type=Notifications.NotificationType.WARNING
                    )