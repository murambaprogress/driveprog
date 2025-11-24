from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatNotification
from accounts.models import User


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'sender', 'sender_type', 'sender_name', 'sender_email',
            'message', 'attachment', 'attachment_name', 'is_read', 'read_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'sender_type', 'created_at', 'updated_at', 'read_at']
    
    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.email
    
    def get_sender_email(self, obj):
        return obj.sender.email


class ChatRoomSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'user', 'user_email', 'user_name', 'is_active',
            'user_unread_count', 'admin_unread_count', 'last_message',
            'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'message': last_msg.message[:100],
                'sender_type': last_msg.sender_type,
                'created_at': last_msg.created_at,
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread count based on current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(request.user, 'user_type') and request.user.user_type == 'admin':
                return obj.admin_unread_count
            else:
                return obj.user_unread_count
        return 0


class ChatNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatNotification
        fields = ['id', 'room', 'recipient', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']
