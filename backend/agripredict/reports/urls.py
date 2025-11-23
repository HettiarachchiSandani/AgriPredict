from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecordViewSet, ReportViewSet

router = DefaultRouter()
router.register('records', RecordViewSet)
router.register('reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
