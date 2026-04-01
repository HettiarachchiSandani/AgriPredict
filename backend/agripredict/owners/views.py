from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from core.permission import IsOwner

from .models import Owner, Manager, OwnerManagerBatch, OwnerManagerFeedstock
from .serializers import (
    OwnerSerializer,
    ManagerSerializer,
    OwnerManagerBatchSerializer,
    OwnerManagerFeedstockSerializer
)
from core.serializers import UserSerializer

class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [IsAuthenticated, IsOwner] 

class ManagerViewSet(viewsets.ModelViewSet):
    queryset = Manager.objects.select_related('userid').all()
    serializer_class = ManagerSerializer
    lookup_field = 'managerid'
    permission_classes = [IsAuthenticated, IsOwner] 

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Validate required fields
        if not data.get("email"):
            return Response({"email": "email is required"}, status=400)
        if not data.get("password"):
            return Response({"password": "password is required"}, status=400)

        user_data = {
            "email": data["email"],
            "password": data["password"],
            "roleid": "A003",  
            "firstname": data.get("firstname", "Manager"),
            "lastname": data.get("lastname", ""),
            "phonenumber": data.get("phonenumber"),
            "nic": data.get("nic"),
            "gender": data.get("gender"),
            "dob": data.get("dob"),
            "note": data.get("note"),
            "is_staff": True,  #
            "is_active": data.get("is_active", True),
        }

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        manager = Manager.objects.create(userid=user)

        serializer = self.get_serializer(manager)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        manager = self.get_object()
        user = manager.userid

        user_serializer = UserSerializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        serializer = self.get_serializer(manager)
        return Response(serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            manager = self.get_object()
            if manager.userid:
                manager.userid.is_active = False
                manager.userid.save()

            manager.delete()

            return Response(
                {"message": "Manager deleted successfully. Linked user has been deactivated."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OwnerManagerBatchViewSet(viewsets.ModelViewSet):
    queryset = OwnerManagerBatch.objects.all()
    serializer_class = OwnerManagerBatchSerializer
    permission_classes = [IsAuthenticated, IsOwner] 

class OwnerManagerFeedstockViewSet(viewsets.ModelViewSet):
    queryset = OwnerManagerFeedstock.objects.all()
    serializer_class = OwnerManagerFeedstockSerializer
    permission_classes = [IsAuthenticated, IsOwner] 