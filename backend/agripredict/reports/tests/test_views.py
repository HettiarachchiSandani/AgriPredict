from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from batches.models import Batch, Breed
from core.models import Role 
from datetime import date

User = get_user_model()


class ReportViewSetTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@test.com",
            password="testpass123"
        )

        self.role = Role.objects.create(
            roleid="A002",  # Owner or Manager
            rolename="Owner"
        )

        self.user.role = self.role
        self.user.save()

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer"
        )

        self.batch = Batch.objects.create(
            batchname="Test Batch",
            breed=self.breed,
            startdate=date.today(),
            initial_male=10,
            initial_female=10,
            current_male=10,
            current_female=10,
            status="Active"
        )

        self.generate_url = "/api/reports/reports/generate/"
        self.download_url = "/api/reports/reports/download/"

    def test_generate_success(self):
        response = self.client.post(self.generate_url, {
            "type": "batch",
            "batchid": self.batch.batchid
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_missing_type(self):
        response = self.client.post(self.generate_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_type(self):
        response = self.client.post(self.generate_url, {
            "type": "invalid"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_no_data(self):
        response = self.client.post(self.generate_url, {
            "type": "batch",
            "batchid": "WRONG"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_download_success(self):
        response = self.client.post(self.download_url, {
            "type": "batch",
            "batchid": self.batch.batchid
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response["Content-Type"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    def test_unauthenticated(self):
        client = APIClient()

        response = client.post(self.generate_url, {
            "type": "batch"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)