from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status

from core.models import Role
from owners.models import Owner, Manager

User = get_user_model()

class OwnerViewSetTest(APITestCase):

    def setUp(self):
        self.role = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.user = User.objects.create_user(
            email="owner@test.com",
            password="test123",
            role=self.role
        )

        self.client.force_authenticate(user=self.user)

        self.owner = Owner.objects.create(userid=self.user)

    def test_list_owners(self):
        response = self.client.get('/api/owners/owners/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_owner_detail(self):
        response = self.client.get(f'/api/owners/owners/{self.owner.ownerid}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ManagerViewSetTest(APITestCase):

    def setUp(self):
        self.role_owner = Role.objects.create(
            roleid="A002",
            rolename="Owner"
        )

        self.role_manager = Role.objects.create(
            roleid="A003",
            rolename="Manager"
        )

        self.user = User.objects.create_user(
            email="owner@test.com",
            password="test123",
            role=self.role_owner
        )

        self.client.force_authenticate(user=self.user)

    def test_create_manager(self):
        response = self.client.post('/api/owners/managers/', {
            "email": "manager@test.com",
            "password": "test123",
            "firstname": "Test",
            "lastname": "Manager"
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("managerid", response.data)

    def test_create_manager_missing_fields(self):
        response = self.client.post('/api/owners/managers/', {
            "email": ""
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_managers(self):
        response = self.client.get('/api/owners/managers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

