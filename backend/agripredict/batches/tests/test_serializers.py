from django.test import TestCase
from batches.models import Batch, Breed, DailyOperations
from batches.serializers import DailyOperationsSerializer
from feed.models import FeedStock
from core.models import Role
from django.contrib.auth import get_user_model
from datetime import date
from unittest.mock import patch

User = get_user_model()


class DailyOperationsSerializerTest(TestCase):

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

        role = Role.objects.create(
            rolename="Tester"
        )

        self.user = User.objects.create_user(
            email="test@test.com",
            password="test123",
            firstname="Test",
            role=role
        )

        self.stock = FeedStock.objects.create(
            stockid="FS001",  
            feedtype="Test Feed",
            quantity=100
        )

    def test_valid_serializer(self):
        data = {
            "batch": self.batch.batchid,
            "date": "2024-01-01",
            "male_mortality": 1,
            "female_mortality": 1,
            "feedusage": 10,
            "stock": self.stock.pk
        }

        serializer = DailyOperationsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_mortality_validation(self):
        data = {
            "batch": self.batch.batchid,
            "date": "2024-01-01",
            "male_mortality": 100,  
            "female_mortality": 1
        }

        serializer = DailyOperationsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("male_mortality", serializer.errors)

    def test_feed_validation(self):
        data = {
            "batch": self.batch.batchid,
            "date": "2024-01-01",
            "feedusage": 999,  
            "stock": self.stock.pk
        }

        serializer = DailyOperationsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("feedusage", serializer.errors)

    @patch("django.core.mail.send_mail")
    def test_create_operation(self, mock_send_mail):
        data = {
            "batch": self.batch.batchid,
            "date": "2024-01-01",
            "male_mortality": 1,
            "female_mortality": 1,
            "feedusage": 10,
            "stock": self.stock.pk
        }

        serializer = DailyOperationsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        operation = serializer.save(entered_by=self.user)

        self.assertEqual(operation.mortalitycount, 2)