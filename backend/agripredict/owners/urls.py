from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OwnerViewSet,
    ManagerViewSet,
)

router = DefaultRouter()
router.register('owners', OwnerViewSet)
router.register('managers', ManagerViewSet)
urlpatterns = [
    path('', include(router.urls)),
]