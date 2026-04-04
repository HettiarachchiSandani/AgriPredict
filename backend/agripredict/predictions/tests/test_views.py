from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from unittest.mock import patch
import uuid

from batches.models import Batch, Breed, DailyOperations
from core.models import Role
from orders.models import Buyer

User = get_user_model()


class PredictionViewSetTest(APITestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.user = User.objects.create_user(
            email=f"user_{uuid.uuid4()}@test.com",
            password="test123",
            role=self.role
        )

        self.client.force_authenticate(user=self.user)

        self.buyer = Buyer.objects.create(userid=self.user)

        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer"
        )

        self.batch = Batch.objects.create(
            batchid="BAT001",
            batchname="Test Batch",
            breed=self.breed,
            startdate=date.today() - timedelta(days=10),  
            initialcount=100,
            currentcount=100
        )

        today = date.today()

        for i in range(7):
            DailyOperations.objects.create(
                batch=self.batch,
                date=today - timedelta(days=i),
                eggcount=50 + i,
                feedusage=10 + i,
                male_mortality=1,
                female_mortality=1,
                mortalitycount=2
            )

    @patch('predictions.views.mortality_model')
    @patch('predictions.views.egg_model')
    def test_predict_next_day(self, mock_egg, mock_mort):

        mock_egg.predict.return_value = [100]
        mock_mort.predict_proba.return_value = [[0.2, 0.8]]

        response = self.client.post(
            '/api/predictions/predict_next_day/',
            {
                "batchid": self.batch.batchid
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("predictionid", response.data)
        self.assertIn("mortality_risk", response.data)

    @patch('predictions.views.egg_model')
    def test_predict_total_today(self, mock_egg):

        mock_egg.predict.return_value = [50]

        response = self.client.get('/api/predictions/predict_total_today/')

        self.assertEqual(response.status_code, 200)
        self.assertIn("predicted_eggs_today", response.data)

    def test_invalid_batch(self):

        response = self.client.post(
            '/api/predictions/predict_next_day/',
            {
                "batchid": "INVALID"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_missing_batchid(self):

        response = self.client.post(
            '/api/predictions/predict_next_day/',
            {},
            format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)