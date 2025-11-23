# admin.py
from django.contrib import admin
from .models import Prediction

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('predictionid', 'batchid', 'dategenerated', 'predictedeggcount', 'predictedfeedrequirement', 'confidencelevel')
    search_fields = ('predictionid',)
    list_filter = ('batchid', 'dategenerated')
