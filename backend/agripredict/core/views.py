from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Role, User, Settings, Notifications
from rest_framework.decorators import api_view
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from supabase import create_client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail

from .serializers import (
    RoleSerializer,
    UserSerializer,
    SettingsSerializer,
    NotificationsSerializer
)

UserModel = get_user_model()

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=["delete"])
    @transaction.atomic
    def safe_delete(self, request, pk=None):
        try:
            user = self.get_object()
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if hasattr(user, "manager"):
            user.manager.delete()

        if hasattr(user, "buyer"):
            user.buyer.delete()

        user.delete()

        return Response({"success": True}, status=status.HTTP_200_OK)

class SettingsViewSet(viewsets.ModelViewSet):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Settings.objects.filter(user=self.request.user)

    def get_object(self):
        settings_obj, created = Settings.objects.get_or_create(
            user=self.request.user
        )
        return settings_obj

    def list(self, request, *args, **kwargs):
        settings_obj, created = Settings.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(settings_obj)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        settings_obj = self.get_object()  # get the current user's settings
        serializer = self.get_serializer(settings_obj, data=request.data, partial=True)  # partial=True allows updating only some fields
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class NotificationsViewSet(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "notificationid"

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Notifications.objects.none()

        qs = Notifications.objects.filter(user=user)

        if hasattr(user, "buyer"):
            buyer = getattr(user, "buyer", None)
            if buyer:
                qs = qs | Notifications.objects.filter(buyer=buyer)

        return qs.order_by("-createdat")

    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = self.get_queryset().filter(isread=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(isread=False).count()
        return Response({"unread_count": count})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, notificationid=None):
        notification = self.get_object()
        notification.isread = True
        notification.save()
        return Response({"message": "Marked as read"}, status=status.HTTP_200_OK)

class SupabaseLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials."}, status=401)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials."}, status=401)
        
        if not user.is_active:
            return Response({"detail": "Account is deactivated."}, status=403)

        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_data = {
            "userid": str(user.userid),
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "roleid": user.role.roleid if hasattr(user, "role") else user.roleid
        }

        return Response({
            "access": access_token,
            "refresh": str(refresh),
            "user": user_data
        })
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user

    return Response({
        "userid": str(user.userid),
        "firstname": user.firstname,   
        "lastname": user.lastname,
        "email": user.email,
        "roleid": user.role.roleid if hasattr(user, "role") else None
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')

    try:
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"http://localhost:5173/reset-password-confirm/{uid}/{token}/"

        send_mail(
            subject="Reset Your Password",
            message=f"Hi {user.firstname},\n\nClick below to reset your password:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    except User.DoesNotExist:
        pass  # 🔐 don't reveal if user exists

    return Response({"message": "If email exists, reset link sent"})


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')

    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()

            return Response({"message": "Password reset successful"})
        else:
            return Response({"error": "Invalid or expired token"}, status=400)

    except Exception:
        return Response({"error": "Invalid request"}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def deactivate_user(request):
    user = request.user
    user.is_active = False
    user.save(update_fields=["is_active"])

    return Response({"message": "Account deactivated"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user

    return Response({
        "userid": str(user.userid),
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phonenumber": user.phonenumber,
        "roleid": user.role.roleid if user.role else None,
    })

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    if not user.check_password(request.data.get("current_password")):
        return Response({"error": "Wrong password"}, status=400)

    user.set_password(request.data.get("new_password"))
    user.save()

    return Response({"message": "Password updated"})