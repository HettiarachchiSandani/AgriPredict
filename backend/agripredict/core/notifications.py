from core.models import Notifications
from core.models import User

def notify_on_request_creation(order):
    recipients = User.objects.filter(role__roleid__in=['A002','A003'])
    notifications = [
        Notifications(
            user=u,
            message=f"New request {order.orderid} created by {order.buyerid.userid.firstname}",
            type=Notifications.NotificationType.INFO
        )
        for u in recipients
    ]
    Notifications.objects.bulk_create(notifications)

def notify_on_status_change(order, actor=None):
    if order.buyerid and order.buyerid.userid and order.buyerid.userid != actor:
        Notifications.objects.create(
            user=order.buyerid.userid,
            buyer=order.buyerid,
            message=f"Your request {order.orderid} status changed to {order.status}",
            type=Notifications.NotificationType.ALERT
        )

    if order.status.strip().lower() in ["canceled", "cancelled"]:
        users = User.objects.filter(role__roleid__in=["A002", "A003"])
        for user in users:
            if user != actor:  # exclude the actor
                Notifications.objects.create(
                    user=user,
                    message=f"Order {order.orderid} was cancelled",
                    type=Notifications.NotificationType.WARNING,
                    referenceid=None
                )