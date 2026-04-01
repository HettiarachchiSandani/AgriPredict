from django.contrib import admin
from django.urls import path, include   
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return JsonResponse({"message": "AgriPredict API is running"})

urlpatterns = [
    path('', home), 
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),   
    path('api/owners/', include('owners.urls')), 
    path('api/batches/', include('batches.urls')),
    path('api/feed/', include('feed.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/core/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)