from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from batches.models import Breed, Batch
from datetime import date
from core.models import Role

User = get_user_model()


class BatchAndDailyAPITest(APITestCase):

    def setUp(self):
        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer Chicken"
        )

        self.batch = Batch.objects.create(
            batchname="Batch Test",
            breed=self.breed,
            startdate=date(2024, 1, 1),
            initial_male=10,
            initial_female=10
        )

        self.role = Role.objects.create(
            roleid="A002",   
            rolename="Owner"
        )

        self.user = User.objects.create_user(
            email="test@test.com",
            password="test123",
            role=self.role   
        )

        self.client.force_authenticate(user=self.user)

    def test_get_batches(self):
        response = self.client.get("/api/batches/batches/")
        self.assertEqual(response.status_code, 200)

    def test_get_active_batches(self):
        response = self.client.get("/api/batches/batches/active/")
        self.assertEqual(response.status_code, 200)

    def test_get_batch_details(self):
        response = self.client.get(f"/api/batches/batches/{self.batch.batchid}/details/")
        self.assertEqual(response.status_code, 200)

    def test_create_daily_operation(self):
        data = {
            "batch": self.batch.batchid,
            "date": "2024-01-01",
            "male_mortality": 1,
            "female_mortality": 1,
            "feedusage": 5,
            "eggcount": 10
        }

        response = self.client.post(
            "/api/batches/dailyoperations/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 201)

    def test_get_daily_operations(self):
        url = "/api/batches/dailyoperations/?batch=" + self.batch.batchid + \
              "&start_date=2024-01-01&end_date=2024-01-05"

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

    def test_daily_summary(self):
        response = self.client.get("/api/batches/daily_summary/summary/")
        self.assertEqual(response.status_code, 200)

    # ❗ TEST: INVALID request (should fail)
    def test_invalid_daily_operation(self):
        data = {
            "batch": self.batch.batchid
        }

        response = self.client.post("/api/batches/dailyoperations/", data)

        self.assertNotEqual(response.status_code, 201)