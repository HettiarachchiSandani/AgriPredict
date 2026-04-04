from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from owners.models import Owner, Manager
from batches.models import Batch, Breed
from feed.models import FeedStock

from owners.serializers import (
    OwnerSerializer,
    ManagerSerializer,
)

User = get_user_model()

class OwnerSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@test.com",
            password="123"
        )

        self.owner = Owner.objects.create(userid=self.user)

    def test_owner_serializer_output(self):
        serializer = OwnerSerializer(instance=self.owner)
        data = serializer.data

        self.assertEqual(data["ownerid"], self.owner.ownerid)
        self.assertIn("user_details", data)

    def test_owner_serializer_read_only(self):
        data = {
            "ownerid": "O999",
            "userid": self.user.id,
            "farmname": "Test Farm",
            "address": "Test Address"
        }

        serializer = OwnerSerializer(instance=self.owner, data=data, partial=True)

        self.assertTrue(serializer.is_valid())

        updated_owner = serializer.save()

        self.assertNotEqual(updated_owner.ownerid, "O999")

class ManagerSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="manager@test.com",
            password="123"
        )

        self.manager = Manager.objects.create(userid=self.user)

    def test_manager_serializer_output(self):
        serializer = ManagerSerializer(instance=self.manager)
        data = serializer.data

        self.assertEqual(data["managerid"], self.manager.managerid)
        self.assertIn("user_details", data)