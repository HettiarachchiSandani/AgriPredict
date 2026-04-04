from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from feed.models import FeedStock
from core.models import Role

User = get_user_model()

class FeedStockViewSetTest(APITestCase):

    def setUp(self):
        # Create role
        self.role = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.user = User.objects.create_user(
            email="owner@test.com",
            password="test123",
            firstname="Owner",
            role=self.role
        )

        self.client.force_authenticate(user=self.user)

        # Create initial stock
        self.stock = FeedStock.objects.create(
            stockid="FS001",
            feedtype="Feed A",
            quantity=100
        )

    def test_create_feedstock(self):
        response = self.client.post(
            '/api/feed/feedstocks/',
            {
                "feedtype": "Feed B",
                "quantity": 200
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("FS", response.data["stockid"])

    def test_list_feedstock(self):
        response = self.client.get('/api/feed/feedstocks/')

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_update_feedstock(self):
        response = self.client.put(
            f'/api/feed/feedstocks/{self.stock.stockid}/',
            {
                "feedtype": "Updated Feed",
                "quantity": 150
            },
            format="json"
        )

        self.stock.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.stock.feedtype, "Updated Feed")
        self.assertEqual(self.stock.quantity, 150)

    def test_partial_update_feedstock(self):
        response = self.client.patch(
            f'/api/feed/feedstocks/{self.stock.stockid}/',
            {
                "quantity": 50
            },
            format="json"
        )

        self.stock.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.stock.quantity, 50)

    def test_delete_feedstock(self):
        response = self.client.delete(
            f'/api/feed/feedstocks/{self.stock.stockid}/',
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            FeedStock.objects.filter(stockid=self.stock.stockid).exists()
        )

    def test_permission_denied_for_unauthorized_user(self):
        user = User.objects.create_user(
            email="user@test.com",
            password="test123",
            firstname="User",
            role=None
        )

        self.client.force_authenticate(user=user)

        response = self.client.get('/api/feed/feedstocks/')

        self.assertEqual(response.status_code, 403)