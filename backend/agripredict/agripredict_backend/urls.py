from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('api/batches/', include('batches.urls')),
    path('api/feed/', include('feed.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/reports/', include('reports.urls')),
]
