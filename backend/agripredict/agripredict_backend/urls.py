from django.contrib import admin
from django.urls import path, include   
from django.http import JsonResponse
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
]

