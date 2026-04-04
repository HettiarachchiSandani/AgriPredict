from django.test import TestCase
from batches.models import Batch, Breed, DailyOperations
from django.contrib.auth import get_user_model
from feed.models import FeedStock
from django.db import IntegrityError, transaction
from unittest.mock import patch
from core.models import Role

User = get_user_model()

class BatchModelTest(TestCase):

    def setUp(self):
        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer Chicken"
        )

    def test_batch_id_and_counts(self):
        batch = Batch.objects.create(
            batchname="Batch Test",
            breed=self.breed,
            startdate="2024-01-01",
            initial_male=10,
            initial_female=20
        )

        self.assertTrue(batch.batchid.startswith("Batch"))
        self.assertEqual(batch.initialcount, 30)
        self.assertEqual(batch.currentcount, 30)

    def test_current_values_default(self):
        batch = Batch.objects.create(
            batchname="Batch Test 2",
            breed=self.breed,
            startdate="2024-01-01",
            initial_male=5,
            initial_female=5
        )

        self.assertEqual(batch.current_male, 5)
        self.assertEqual(batch.current_female, 5)
        self.assertEqual(batch.currentcount, 10)

    def test_current_values_custom(self):
        batch = Batch.objects.create(
            batchname="Batch Test 3",
            breed=self.breed,
            startdate="2024-01-01",
            initial_male=10,
            initial_female=10,
            current_male=8,
            current_female=9
        )

        self.assertEqual(batch.currentcount, 17)


class DailyOperationsModelTest(TestCase):

    def setUp(self):
        self.breed = Breed.objects.create(
            breedid="BR002",
            breedname="Broiler Chicken"
        )

        self.batch = Batch.objects.create(
            batchname="Batch Daily",
            breed=self.breed,
            startdate="2024-01-01",
            initial_male=10,
            initial_female=10
        )

        role = Role.objects.create(
            rolename="Tester"  
        )

        self.user = User.objects.create_user(
            email="tester@test.com",
            password="test123",
            firstname="Test",
            role=role
        )

    @patch("django.core.mail.send_mail")
    def test_operation_id_and_mortality(self, mock_send_mail):
        op = DailyOperations.objects.create(
            batch=self.batch,
            date="2024-01-02",
            male_mortality=3,
            female_mortality=2,
            entered_by=self.user
        )

        self.assertTrue(op.operationid.startswith("Op"))
        self.assertEqual(op.mortalitycount, 5)

    def test_unique_batch_date_constraint(self):
        DailyOperations.objects.create(
            batch=self.batch,
            date="2024-01-02"
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                DailyOperations.objects.create(
                    batch=self.batch,
                    date="2024-01-02"
                )