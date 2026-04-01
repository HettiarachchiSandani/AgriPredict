from django.contrib import admin
from .models import Records, Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reportid', 'batchid', 'type', 'generatedby', 'generateddate', 'filepath')
    list_filter = ('batchid', 'type', 'generatedby')
    search_fields = ('type', 'filepath')


@admin.register(Records)
class RecordsAdmin(admin.ModelAdmin):
    list_display = ('recordsid', 'operationid', 'batchid', 'timestamp', 'hashvalue', 'previoushash')
    list_filter = ('batchid',)
    search_fields = ('recordsid', 'hashvalue', 'previoushash', 'operationid__operationid')
