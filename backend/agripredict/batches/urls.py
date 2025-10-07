from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet, BreedViewSet, DailyOperationsViewSet

router = DefaultRouter()
router.register(r'breeds', BreedViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'dailyoperations', DailyOperationsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
