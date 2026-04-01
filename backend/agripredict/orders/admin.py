from django.contrib import admin
from .models import Buyer, Order, OrderBatch

@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ('buyerid', 'userid', 'company', 'address')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('orderid', 'buyerid', 'ordereddate', 'requesteddate', 'status', 'breedid', 'note', 'quantity', 'accepted', 'completed')

@admin.register(OrderBatch)
class OrderBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_order_id', 'orderid', 'batchid', 'quantity')
