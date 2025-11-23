from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, UserViewSet, SettingsViewSet, NotificationsViewSet

router = DefaultRouter()
router.register('roles', RoleViewSet)
router.register('users', UserViewSet)
router.register('settings', SettingsViewSet)
router.register('notifications', NotificationsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
