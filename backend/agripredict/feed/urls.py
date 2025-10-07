from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedStockViewSet

router = DefaultRouter()
router.register(r'feedstocks', FeedStockViewSet, basename='feedstock')

urlpatterns = [
    path('', include(router.urls)),
]
