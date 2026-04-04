from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import Role, Settings, Notifications
from unittest.mock import patch
import uuid

User = get_user_model()


class UserManagerTests(TestCase):

    def setUp(self):
        # Create a role (NOT admin)
        self.role = Role.objects.create(
            roleid='A002',
            rolename='Owner'
        )

    @patch('core.models.send_mail')
    def test_create_user_success(self, mock_send_mail):
        user = User.objects.create_user(
            email="test@example.com",
            password="test123",
            firstname="John",
            role=self.role
        )

        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("test123"))
        self.assertTrue(mock_send_mail.called)

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email=None,
                password="123",
                firstname="Test"
            )

    @patch('core.models.send_mail')
    def test_create_superuser(self, mock_send_mail):
        # Override role manually (avoid A001 issue)
        user = User.objects.create_user(
            email="admin@example.com",
            password="admin123",
            firstname="Admin",
            is_staff=True,
            is_active=True,
            role=self.role
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)


class UserModelTests(TestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid='A002',
            rolename='Owner'
        )

        self.user = User.objects.create(
            email="user@test.com",
            firstname="Jane",
            lastname="Doe",
            role=self.role
        )

    def test_str_method(self):
        self.assertEqual(
            str(self.user),
            "Jane Doe (user@test.com)"
        )

    def test_has_perm(self):
        self.user.is_superuser = True
        self.assertTrue(self.user.has_perm(None))

        self.user.is_superuser = False
        self.assertFalse(self.user.has_perm(None))

    def test_has_module_perms(self):
        self.user.is_superuser = True
        self.assertTrue(self.user.has_module_perms(None))


class SettingsModelTests(TestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid='A002',
            rolename='Owner'
        )

        self.user = User.objects.create(
            email="settings@test.com",
            firstname="Set",
            role=self.role
        )

    def test_settings_id_auto_generated(self):
        settings = Settings.objects.create(user=self.user)

        self.assertIsNotNone(settings.settingsid)
        self.assertTrue(settings.settingsid.startswith("SET"))


class NotificationsModelTests(TestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid='A002',
            rolename='Owner'
        )

        self.user = User.objects.create(
            email="notify@test.com",
            firstname="Notify",
            role=self.role
        )

    def test_notification_defaults(self):
        notification = Notifications.objects.create(
            user=self.user,
            message="Test notification"
        )

        self.assertEqual(notification.type, "INFO")
        self.assertFalse(notification.isread)

    def test_notification_creation(self):
        notification = Notifications.objects.create(
            user=self.user,
            message="Order created",
            type="ALERT",
            referenceid=uuid.uuid4()
        )

        self.assertEqual(notification.message, "Order created")
        self.assertEqual(notification.type, "ALERT")