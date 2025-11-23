from django.contrib import admin
from .models import Breed, Batch, DailyOperations

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ('breedid', 'breedname', 'eggtype', 'avglifespan', 'avgdailyeggrate')

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batchid', 'breedid', 'startdate', 'initialcount', 'currentcount', 'status')

@admin.register(DailyOperations)
class DailyOperationsAdmin(admin.ModelAdmin):
    list_display = ('operationid', 'batchid', 'date', 'feedusage', 'eggcount', 'mortalitycount', 'waterused', 'notes')
