from django.contrib import admin
from .models import User, Role, Settings, Notifications

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('roleid', 'rolename')
    search_fields = ('roleid', 'rolename')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('userid', 'firstname', 'lastname', 'email', 'role', 'is_staff', 'is_active', 'gender', 'dob')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('firstname', 'lastname', 'email')
    ordering = ('userid',)


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('settingsid', 'user', 'sound_enabled', 'updateat', 'last_password_change')
    list_filter = ('user',)
    search_fields = ('settingsid',)

@admin.register(Notifications)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ('notificationid', 'user', 'message', 'type', 'createdat', 'isread')
    list_filter = ('user', 'isread')
    search_fields = ('message',)
