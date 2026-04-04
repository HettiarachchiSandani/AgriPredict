from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from datetime import date
import uuid

from orders.models import Buyer, Order, OrderBatch
from batches.models import Batch, Breed
from orders.serializers import BuyerSerializer, OrderSerializer, OrderBatchSerializer

User = get_user_model()


class OrdersSerializerTest(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            email=f"user_{uuid.uuid4()}@test.com",
            password="test123"
        )

        self.buyer, _ = Buyer.objects.get_or_create(userid=self.user)

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

    def test_buyer_serializer(self):
        serializer = BuyerSerializer(instance=self.buyer)
        data = serializer.data

        self.assertEqual(data["buyerid"], self.buyer.buyerid)
        self.assertEqual(data["company"], self.buyer.company)

    def test_order_serializer_create(self):
        request = self.factory.post("/")
        request.user = self.user

        data = {
            "breedid": self.breed.pk,
            "quantity": 10
        }

        serializer = OrderSerializer(
            data=data,
            context={"request": request}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        order = serializer.save()

        self.assertTrue(order.orderid.startswith("REQ"))
        self.assertEqual(order.buyerid, self.buyer)

    def test_order_serializer_status(self):
        order = Order.objects.create(
            buyerid=self.buyer,
            accepted=True
        )

        serializer = OrderSerializer(order)

        self.assertEqual(serializer.data["status"], "Confirmed")

    def test_order_batch_serializer(self):
        order = Order.objects.create(buyerid=self.buyer)

        data = {
            "orderid": order.pk,
            "batchid": self.batch.pk,
            "quantity": 5
        }

        serializer = OrderBatchSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        ob = serializer.save()

        self.assertEqual(ob.quantity, 5)
        self.assertEqual(ob.orderid, order)
        self.assertEqual(ob.batchid, self.batch)

    def test_order_batch_unique(self):
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