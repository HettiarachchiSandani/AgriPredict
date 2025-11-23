from django.contrib import admin
from .models import Breed, Batch, DailyOperations

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ('breedid', 'breedname', 'eggtype', 'avglifespan', 'avgdailyeggrate')
    search_fields = ('breedid', 'breedname')

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batchid', 'breed', 'startdate', 'initialcount', 'currentcount', 'status')
    list_filter = ('status', 'breed')
    search_fields = ('batchid', 'breed__breedname')

@admin.register(DailyOperations)
class DailyOperationsAdmin(admin.ModelAdmin):
    list_display = ('operationid', 'batch', 'date', 'feedusage', 'eggcount', 'mortalitycount', 'waterused', 'notes')
    list_filter = ('batch', 'date')
    search_fields = ('operationid',)
