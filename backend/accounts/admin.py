from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'username', 'user_type', 'is_verified', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_verified', 'is_active', 'created_at')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Permissions', {'fields': ('user_type', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'user_type', 'password1', 'password2')}
        ),
    )
    search_fields = ('email', 'username')
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(OTP)