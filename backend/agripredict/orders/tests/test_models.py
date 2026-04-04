from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date
import uuid

from orders.models import Buyer, Order, OrderBatch
from batches.models import Batch, Breed

User = get_user_model()


class OrdersAppTest(TestCase):

    def setUp(self):
        # Create unique user
        self.user = User.objects.create_user(
            email=f"buyer_{uuid.uuid4()}@test.com",
            password="test123"
        )

        self.buyer, _ = Buyer.objects.get_or_create(
            userid=self.user,
            defaults={
                "address": "Colombo",
                "company": "Test Company"
            }
        )

        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer"
        )

        self.batch = Batch.objects.create(
            batchname="Test Batch",
            breed=self.breed,
            startdate=date.today(),
            initial_male=10,
            initial_female=20
        )

    def test_buyer_auto_id(self):
        new_user = User.objects.create_user(
            email=f"buyer_{uuid.uuid4()}@test.com",
            password="test123"
        )

        buyer, _ = Buyer.objects.get_or_create(userid=new_user)

        self.assertTrue(buyer.buyerid.startswith("BUY"))

    def test_order_auto_id(self):
        order = Order.objects.create(
            buyerid=self.buyer,
            breedid=self.breed,
            quantity=10
        )
        self.assertTrue(order.orderid.startswith("REQ"))

    def test_order_pending_status(self):
        order = Order.objects.create(
            buyerid=self.buyer
        )
        self.assertEqual(order.status, "Pending")

    def test_order_confirmed_status(self):
        order = Order.objects.create(
            buyerid=self.buyer,
            accepted=True
        )
        self.assertEqual(order.status, "Confirmed")

    def test_order_canceled_status(self):
        order = Order.objects.create(
            buyerid=self.buyer,
            accepted=False
        )
        self.assertEqual(order.status, "Canceled")

    def test_order_completed_status(self):
        order = Order.objects.create(
            buyerid=self.buyer,
            completed=True
        )
        self.assertEqual(order.status, "Completed")
        self.assertTrue(order.accepted)
        self.assertIsNotNone(order.completeddate)

    def test_order_batch_creation(self):
        order = Order.objects.create(buyerid=self.buyer)

        ob = OrderBatch.objects.create(
            orderid=order,
            batchid=self.batch,
            quantity=5
        )

        self.assertEqual(ob.quantity, 5)
        self.assertEqual(ob.orderid, order)
        self.assertEqual(ob.batchid, self.batch)

    def test_order_batch_unique_constraint(self):
        order = Order.objects.create(buyerid=self.buyer)

        OrderBatch.objects.create(
            orderid=order,
            batchid=self.batch,
            quantity=5
        )

        with self.assertRaises(Exception):
            OrderBatch.objects.create(
                orderid=order,
                batchid=self.batch,
                quantity=10
            )