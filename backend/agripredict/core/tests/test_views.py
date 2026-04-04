from rest_framework.test import APITestCase
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

from core.models import Role

User = get_user_model()


class CoreViewsTest(APITestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.user = User.objects.create_user(
            email="test@example.com",
            password="test123",
            firstname="John",
            role=self.role
        )

        self.client.force_authenticate(user=self.user)

    @patch('core.views.RefreshToken.for_user')
    def test_supabase_login_success(self, mock_token):
        mock_token.return_value.access_token = "access"
        mock_token.return_value.refresh_token = "refresh"

        response = self.client.post('/api/core/supabase-login/', {
            "email": "test@example.com",
            "password": "test123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_supabase_login_invalid(self):
        response = self.client.post('/api/core/supabase-login/', {
            "email": "wrong@example.com",
            "password": "wrong"
        })

        self.assertEqual(response.status_code, 401)

    def test_get_user(self):
        response = self.client.get('/api/core/get-user/')
        self.assertEqual(response.status_code, 200)

    def test_get_profile(self):
        response = self.client.get('/api/core/profile/')
        self.assertEqual(response.status_code, 200)

    def test_update_user(self):
        response = self.client.put(
            '/api/core/update-user/',
            data={"firstname": "Updated"},
            format="json"
        )

        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.firstname, "Updated")

    def test_change_password(self):
        response = self.client.post('/api/core/change-password/', {
            "current_password": "test123",
            "new_password": "newpass123"
        })

        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.user.check_password("newpass123"))

    @patch('core.views.send_mail')
    def test_request_password_reset(self, mock_send_mail):
        response = self.client.post('/api/core/request-password-reset/', {
            "email": "test@example.com"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(mock_send_mail.called)

    def test_confirm_password_reset(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post('/api/core/confirm-password-reset/', {
            "uid": uid,
            "token": token,
            "password": "newpass123"
        })

        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.user.check_password("newpass123"))

    def test_deactivate_user(self):
        response = self.client.post('/api/core/deactivate-user/')

        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.user.is_active)