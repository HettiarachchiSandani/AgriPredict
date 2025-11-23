from django.contrib import admin
from .models import Record, Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reportid', 'batchid', 'type', 'generatedby', 'generateddate', 'filepath')
    list_filter = ('batchid', 'type', 'generatedby')
    search_fields = ('type', 'filepath')


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('recordsid', 'operationsid', 'orderid', 'predictionsid', 'reportsid', 'batchid', 'entrytype', 'timestamp', 'hashvalue', 'previoushash')
    list_filter = ('batchid', 'entrytype')
    search_fields = ('recordsid', 'hashvalue', 'previoushash')
