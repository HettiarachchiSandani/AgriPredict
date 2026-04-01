from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from core.models import User, Notifications
from core.notifications import notify_on_status_change

@receiver(post_save, sender=Order)
def notify_on_order_update(sender, instance, created, **kwargs):
    if created:
        users_to_notify = User.objects.filter(roleid__in=["A002", "A003"])

        for user in users_to_notify:
            Notifications.objects.create(
                user=user,
                message=f"New buyer request received (Order {instance.orderid})",
                type="INFO",
                referenceid=instance.orderid
            )
    else:
        notify_on_status_change(instance)