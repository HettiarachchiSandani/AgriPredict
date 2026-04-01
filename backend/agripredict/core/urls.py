from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RoleViewSet, 
    UserViewSet, 
    SettingsViewSet, 
    NotificationsViewSet,
    SupabaseLoginAPIView,
    get_user,
    request_password_reset,
    confirm_password_reset,
    deactivate_user,
    get_profile,
    update_user,
    change_password
)


router = DefaultRouter()
router.register('roles', RoleViewSet)
router.register('users', UserViewSet)
router.register('settings', SettingsViewSet)
router.register('notifications', NotificationsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("supabase-login/", SupabaseLoginAPIView.as_view(), name="supabase_login"),
    path("get-user/", get_user),
    path("deactivate-user/", deactivate_user),
    path("profile/", get_profile),
    path("update-user/", update_user),
    path("change-password/", change_password),
    path("request-password-reset/", request_password_reset),
    path("confirm-password-reset/", confirm_password_reset),
]
