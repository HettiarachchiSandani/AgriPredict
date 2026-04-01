from django.contrib import admin
from .models import Owner, Manager, OwnerManagerBatch, OwnerManagerFeedstock

@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ('ownerid', 'userid', 'farmname', 'address')

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ('managerid', 'userid')

@admin.register(OwnerManagerBatch)
class OwnerManagerBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_relation_id', 'ownerid', 'managerid', 'batchid')

@admin.register(OwnerManagerFeedstock)
class OwnerManagerFeedstockAdmin(admin.ModelAdmin):
    list_display = ('feed_relation_id', 'ownerid', 'managerid', 'stockid')
