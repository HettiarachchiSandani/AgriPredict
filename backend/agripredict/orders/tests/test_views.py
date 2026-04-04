from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date
import uuid

from orders.models import Buyer, Order, OrderBatch
from batches.models import Batch, Breed
from core.models import Role

User = get_user_model()


class OrdersViewSetTest(APITestCase):

    def setUp(self):
        self.owner_role = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.buyer_role = Role.objects.create(
            roleid="B001",
            rolename="Buyer"
        )

        self.user = User.objects.create_user(
            email=f"user_{uuid.uuid4()}@test.com",
            password="test123",
            role=self.owner_role
        )

        self.client.force_authenticate(user=self.user)

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

        self.order = Order.objects.create(
            buyerid=self.buyer,
            breedid=self.breed,
            quantity=10
        )

    def test_create_buyer(self):
        response = self.client.post(
            '/api/orders/buyers/',
            {
                "email": f"buyer_{uuid.uuid4()}@test.com",
                "password": "test123",
                "firstname": "Test",
                "lastname": "User",
                "company": "Test Company",
                "address": "Colombo",
                "roleid": "B001"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("buyerid", response.data)

    def test_list_buyers(self):
        response = self.client.get('/api/orders/buyers/')
        self.assertEqual(response.status_code, 200)

    def test_create_order(self):
        response = self.client.post(
            '/api/orders/orders/',
            {
                "breedid": self.breed.pk,
                "quantity": 5
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["orderid"].startswith("REQ"))

    def test_list_orders(self):
        response = self.client.get('/api/orders/orders/')
        self.assertEqual(response.status_code, 200)

    def test_update_order(self):
        response = self.client.patch(
            f'/api/orders/orders/{self.order.orderid}/',
            {
                "accepted": True
            },
            format="json"
        )

        self.order.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.order.status, "Confirmed")

    def test_completed_order(self):
        response = self.client.patch(
            f'/api/orders/orders/{self.order.orderid}/',
            {
                "completed": True
            },
            format="json"
        )

        self.order.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.order.status, "Completed")
        self.assertTrue(self.order.completed)

    def test_delete_order_not_allowed_for_buyer(self):
        response = self.client.delete(
            f'/api/orders/orders/{self.order.orderid}/'
        )

        self.assertEqual(response.status_code, 405)

    def test_create_order_batch(self):
        response = self.client.post(
            '/api/orders/order-batches/',
            {
                "orderid": self.order.pk,
                "batchid": self.batch.pk,
                "quantity": 5
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

    def test_list_order_batches(self):
        response = self.client.get('/api/orders/order-batches/')

        self.assertEqual(response.status_code, 200)

    def test_unique_order_batch_constraint(self):
        OrderBatch.objects.create(
            orderid=self.order,
            batchid=self.batch,
            quantity=5
        )

        response = self.client.post(
            '/api/orders/order-batches/',
            {
                "orderid": self.order.pk,
                "batchid": self.batch.pk,
                "quantity": 10
            },
            format="json"
        )

        self.assertNotEqual(response.status_code, 201)

    def test_unauthenticated_access(self):
        self.client.logout()

        response = self.client.get('/api/orders/orders/')
        self.assertEqual(response.status_code, 401)