from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuyerViewSet, OrderViewSet, OrderBatchViewSet

router = DefaultRouter()
router.register(r'buyers', BuyerViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-batches', OrderBatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]