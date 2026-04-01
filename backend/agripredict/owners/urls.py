from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OwnerViewSet,
    ManagerViewSet,
    OwnerManagerBatchViewSet,
    OwnerManagerFeedstockViewSet,
)

router = DefaultRouter()
router.register('owners', OwnerViewSet)
router.register('managers', ManagerViewSet)
router.register('owner-manager-batches', OwnerManagerBatchViewSet)
router.register('owner-manager-feedstocks', OwnerManagerFeedstockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]