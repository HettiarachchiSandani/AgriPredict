from django.test import TestCase
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from owners.models import (
    Owner,
    Manager,
)
from batches.models import Batch, Breed
from feed.models import FeedStock

User = get_user_model()


class OwnerModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@test.com",
            password="test123"
        )

    def test_owner_id_generation(self):
        owner = Owner.objects.create(userid=self.user)
        self.assertEqual(owner.ownerid, "O001")


class ManagerModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="manager@test.com",
            password="test123"
        )

    def test_manager_id_generation(self):
        manager = Manager.objects.create(userid=self.user)
        self.assertEqual(manager.managerid, "M001")
