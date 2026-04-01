from django.contrib import admin
from .models import FeedStock

@admin.register(FeedStock)
class FeedStockAdmin(admin.ModelAdmin):
    list_display = ('stockid', 'feedtype', 'quantity', 'lastupdated', 'status')
