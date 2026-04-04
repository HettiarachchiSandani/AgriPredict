from django.contrib import admin
from .models import Owner, Manager

@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ('ownerid', 'userid', 'farmname', 'address')

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ('managerid', 'userid')
