"""
WebSocket Consumer for Real-time Chat
Handles WebSocket connections for user-admin chat communication
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat functionality
    """
    
    async def connect(self):
        """
        Called when WebSocket connection is established
        """
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user')
        
        # Verify user is authenticated
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        # Verify user has access to this room
        has_access = await self.verify_room_access()
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify user is online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online'
            }
        )
    
    async def disconnect(self, close_code):
        """
        Called when WebSocket connection is closed
        """
        # Notify user is offline
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline'
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'chat_message')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    async def handle_chat_message(self, data):
        """
        Handle incoming chat message
        """
        message_text = data.get('message', '').strip()
        
        if not message_text:
            return
        
        # Save message to database
        message = await self.save_message(message_text)
        
        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': message['id'],
                    'message': message['message'],
                    'sender_id': message['sender_id'],
                    'sender_type': message['sender_type'],
                    'sender_name': message['sender_name'],
                    'created_at': message['created_at'],
                    'is_read': message['is_read']
                }
            )
    
    async def handle_typing(self, data):
        """
        Handle typing indicator
        """
        is_typing = data.get('is_typing', False)
        
        # Broadcast typing status to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'user_name': await self.get_user_name(),
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        """
        Handle message read receipts
        """
        message_id = data.get('message_id')
        
        if message_id:
            await self.mark_message_read(message_id)
            
            # Broadcast read receipt
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'message_id': message_id,
                    'read_by': self.user.id
                }
            )
    
    # Receive handlers
    async def chat_message(self, event):
        """
        Send chat message to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_type': event['sender_type'],
            'sender_name': event['sender_name'],
            'created_at': event['created_at'],
            'is_read': event['is_read']
        }))
    
    async def typing_indicator(self, event):
        """
        Send typing indicator to WebSocket
        """
        # Don't send typing indicator back to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))
    
    async def user_status(self, event):
        """
        Send user status change to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))
    
    async def read_receipt(self, event):
        """
        Send read receipt to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'read_by': event['read_by']
        }))
    
    # Database operations
    @database_sync_to_async
    def verify_room_access(self):
        """
        Verify user has access to the chat room
        """
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Admin can access all rooms
            if hasattr(self.user, 'user_type') and self.user.user_type == 'admin':
                return True
            
            # Regular user can only access their own room
            return room.user == self.user
            
        except ChatRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, message_text):
        """
        Save message to database
        """
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Determine sender type
            sender_type = 'admin' if (hasattr(self.user, 'user_type') and self.user.user_type == 'admin') else 'user'
            
            # Create message
            message = ChatMessage.objects.create(
                room=room,
                sender=self.user,
                sender_type=sender_type,
                message=message_text
            )
            
            # Update room's updated_at timestamp
            room.save()
            
            # Update unread counts
            if sender_type == 'user':
                room.admin_unread_count += 1
            else:
                room.user_unread_count += 1
            room.save()
            
            return {
                'id': message.id,
                'message': message.message,
                'sender_id': message.sender.id,
                'sender_type': message.sender_type,
                'sender_name': f"{message.sender.first_name} {message.sender.last_name}".strip() or message.sender.email,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
            
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        """
        Mark message as read
        """
        try:
            from django.utils import timezone
            message = ChatMessage.objects.get(id=message_id)
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            
            # Update unread counts
            room = message.room
            if message.sender_type == 'user':
                room.admin_unread_count = max(0, room.admin_unread_count - 1)
            else:
                room.user_unread_count = max(0, room.user_unread_count - 1)
            room.save()
            
        except ChatMessage.DoesNotExist:
            pass
    
    @database_sync_to_async
    def get_user_name(self):
        """
        Get formatted user name
        """
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.email
