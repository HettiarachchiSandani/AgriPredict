from django.test import TestCase
from core.models import Role, User, Settings, Notifications
from core.serializers import (
    UserSerializer,
    RoleSerializer,
    SettingsSerializer,
    NotificationsSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch
import uuid


class RoleSerializerTest(TestCase):

    def test_role_serializer(self):
        role = Role.objects.create(roleid='A002', rolename='Owner')

        serializer = RoleSerializer(role)
        data = serializer.data

        self.assertEqual(data['roleid'], 'A002')
        self.assertEqual(data['rolename'], 'Owner')


class UserSerializerTest(TestCase):

    def setUp(self):
        self.role = Role.objects.create(roleid='A002', rolename='Owner')

    @patch('core.models.send_mail')
    def test_create_user(self, mock_send_mail):
        data = {
            "email": "test@example.com",
            "password": "test123",
            "firstname": "John",
            "roleid": "A002"
        }

        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = serializer.save()

        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("test123"))
        self.assertEqual(user.role.roleid, "A002")

    def test_update_user(self):
        user = User.objects.create(
            email="old@example.com",
            firstname="Old",
            role=self.role
        )

        data = {
            "firstname": "New",
            "password": "newpass",
            "roleid": "A002"
        }

        serializer = UserSerializer(instance=user, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_user = serializer.save()

        self.assertEqual(updated_user.firstname, "New")
        self.assertTrue(updated_user.check_password("newpass"))


class SettingsSerializerTest(TestCase):

    def setUp(self):
        self.role = Role.objects.create(roleid='A002', rolename='Owner')
        self.user = User.objects.create(
            email="settings@test.com",
            firstname="Test",
            role=self.role
        )

    def test_settings_serializer(self):
        settings = Settings.objects.create(user=self.user)

        serializer = SettingsSerializer(settings)

        self.assertIn("settingsid", serializer.data)
        self.assertEqual(str(serializer.data["user"]), str(self.user.id))


class NotificationsSerializerTest(TestCase):

    def setUp(self):
        self.role = Role.objects.create(roleid='A002', rolename='Owner')
        self.user = User.objects.create(
            email="notify@test.com",
            firstname="Notify",
            role=self.role
        )

    def test_notification_serializer(self):
        notification = Notifications.objects.create(
            user=self.user,
            message="Test message"
        )

        serializer = NotificationsSerializer(notification)

        self.assertEqual(serializer.data["message"], "Test message")
        self.assertEqual(serializer.data["type"], "INFO")


class JWTSerializerTest(TestCase):

    def setUp(self):
        self.role = Role.objects.create(roleid='A002', rolename='Owner')
        self.user = User.objects.create(
            email="jwt@test.com",
            firstname="JWT",
            role=self.role
        )

    def test_token_contains_role(self):
        refresh = RefreshToken.for_user(self.user)
        token = str(refresh.access_token)

        self.assertIsNotNone(token)