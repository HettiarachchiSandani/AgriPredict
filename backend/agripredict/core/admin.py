from django.contrib import admin
from .models import User, Role

# User admin
class UserAdmin(admin.ModelAdmin):
    list_display = ('UserID', 'FirstName', 'LastName', 'RoleID')
    search_fields = ('FirstName', 'LastName')
    list_filter = ('RoleID',)

# Role admin
class RoleAdmin(admin.ModelAdmin):
    list_display = ('RoleID', 'RoleName')
    search_fields = ('RoleName',)

# Register models with admin
admin.site.register(User, UserAdmin)
admin.site.register(Role, RoleAdmin)
