from django.contrib import admin
from .models import ChatRoom, ChatMessage, ChatNotification


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_active', 'user_unread_count', 'admin_unread_count', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'sender', 'sender_type', 'message_preview', 'is_read', 'created_at']
    list_filter = ['sender_type', 'is_read', 'created_at']
    search_fields = ['sender__email', 'message']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'


@admin.register(ChatNotification)
class ChatNotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'recipient', 'message', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['recipient__email', 'message']
    readonly_fields = ['created_at']
