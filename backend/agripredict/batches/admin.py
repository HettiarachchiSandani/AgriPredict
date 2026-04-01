from django.contrib import admin
from .models import Breed, Batch, DailyOperations

# Breed Admin
@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = (
        'breedid',
        'breedname',
        'eggtype',
    )
    search_fields = ('breedid', 'breedname')

# Batch Admin
@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = (
        'batchid',
        'batchname',
        'breed',
        'startdate',
        'initial_male',
        'initial_female',
        'current_male',
        'current_female',
        'initialcount',
        'currentcount',
        'status',
    )

    list_filter = ('status', 'breed')
    search_fields = ('batchid', 'batchname', 'breed__breedname')

    readonly_fields = (
        'initialcount',
        'currentcount',
    )

# Daily Operations Admin
@admin.register(DailyOperations)
class DailyOperationsAdmin(admin.ModelAdmin):
    list_display = (
        'operationid',
        'batch',
        'date',
        'feedusage',
        'water_used',
        'eggcount',
        'male_mortality',
        'female_mortality',
        'mortalitycount',
        'avgeggweight',
    )

    list_filter = ('batch', 'date')
    search_fields = ('operationid', 'batch__batchid')

    readonly_fields = (
        'mortalitycount',
    )