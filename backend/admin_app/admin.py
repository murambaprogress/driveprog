from django.contrib import admin
from .models import AdminProfile

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'position', 'created_at')
    search_fields = ('user__email', 'user__username', 'department', 'position')
    list_filter = ('department', 'position', 'created_at')