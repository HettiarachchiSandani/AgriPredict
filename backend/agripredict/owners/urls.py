from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OwnerViewSet, ManagerViewSet, OwnerManagerBatchViewSet, OwnerManagerFeedstockViewSet

router = DefaultRouter()
router.register(r'owners', OwnerViewSet)
router.register(r'managers', ManagerViewSet)
router.register(r'owner-manager-batches', OwnerManagerBatchViewSet)
router.register(r'owner-manager-feedstocks', OwnerManagerFeedstockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
