from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportsViewSet, RecordsViewSet

router = DefaultRouter()
router.register(r'reports', ReportsViewSet)
router.register(r'records', RecordsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
