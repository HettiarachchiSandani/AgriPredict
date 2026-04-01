from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet, BreedViewSet, DailyOperationsViewSet, DailySummaryViewSet

router = DefaultRouter()
router.register(r'breeds', BreedViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'dailyoperations', DailyOperationsViewSet)

daily_summary_view = DailySummaryViewSet.as_view({'get': 'summary'})

urlpatterns = [
    path('', include(router.urls)),
    path('daily_summary/summary/', daily_summary_view, name='daily-summary'),
]