from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from django.conf import settings
from .models import ChatRoom, ChatMessage, ChatNotification
from .serializers import ChatRoomSerializer, ChatMessageSerializer, ChatNotificationSerializer


class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat rooms
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            # Admin sees all chat rooms
            return ChatRoom.objects.all().select_related('user').prefetch_related('messages')
        else:
            # Regular user sees only their own chat room
            return ChatRoom.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my_room(self, request):
        """Get or create chat room for the current user"""
        user = request.user

        # Admin cannot have their own room
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            return Response(
                {'error': 'Admin users cannot have personal chat rooms'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create room for user
        room, created = ChatRoom.objects.get_or_create(user=user)

        serializer = self.get_serializer(room)
        return Response({
            'room': serializer.data,
            'created': created
        })

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user(self, request, user_id=None):
        """Get chat room for a specific user (admin only)"""
        user = request.user

        if not hasattr(user, 'user_type') or user.user_type != 'admin':
            return Response(
                {'error': 'You do not have permission to access this room'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            target_user = settings.AUTH_USER_MODEL.objects.get(id=user_id)
        except settings.AUTH_USER_MODEL.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        room, created = ChatRoom.objects.get_or_create(user=target_user)
        serializer = self.get_serializer(room)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages in room as read for current user"""
        room = self.get_object()
        user = request.user

        # Determine if user is admin
        is_admin = hasattr(user, 'user_type') and user.user_type == 'admin'

        if is_admin:
            # Mark all user messages as read
            unread_messages = room.messages.filter(sender_type='user', is_read=False)
            unread_messages.update(is_read=True, read_at=timezone.now())
            room.admin_unread_count = 0
        else:
            # Mark all admin messages as read
            unread_messages = room.messages.filter(sender_type='admin', is_read=False)
            unread_messages.update(is_read=True, read_at=timezone.now())
            room.user_unread_count = 0

        room.save()

        return Response({
            'message': 'Messages marked as read',
            'count': unread_messages.count()
        })


class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat messages
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get('room_id')

        if hasattr(user, 'user_type') and user.user_type == 'admin':
            # Admin can see all messages for a specific room
            queryset = ChatMessage.objects.filter(room_id=room_id) if room_id else ChatMessage.objects.all()
        else:
            # User can only see messages in their own room
            queryset = ChatMessage.objects.filter(room__user=user)

        if room_id:
            queryset = queryset.filter(room_id=room_id)

        return queryset.select_related('sender', 'room').order_by('created_at')

    def create(self, request, *args, **kwargs):
        """Create a new chat message"""
        user = request.user
        room_id = request.data.get('room_id')
        message_text = request.data.get('message')

        if not room_id or not message_text:
            return Response(
                {'error': 'room_id and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chat room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Determine sender type
        is_admin = hasattr(user, 'user_type') and user.user_type == 'admin'
        sender_type = 'admin' if is_admin else 'user'

        # Check permissions
        if not is_admin and room.user != user:
            return Response(
                {'error': 'You do not have permission to send messages in this room'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create message
        message = ChatMessage.objects.create(
            room=room,
            sender=user,
            sender_type=sender_type,
            message=message_text,
            attachment=request.FILES.get('attachment'),
            attachment_name=request.FILES.get('attachment').name if request.FILES.get('attachment') else None
        )

        # Update unread counts
        if sender_type == 'admin':
            room.user_unread_count += 1
        else:
            room.admin_unread_count += 1

        room.save()

        # Create notification for recipient
        recipient = room.user if is_admin else None
        if recipient:
            ChatNotification.objects.create(
                room=room,
                recipient=recipient if is_admin else room.user,
                message=f"New message from {user.email}"
            )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def room_messages(self, request):
        """Get all messages for a specific room"""
        room_id = request.query_params.get('room_id')

        if not room_id:
            return Response(
                {'error': 'room_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chat room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permissions
        user = request.user
        is_admin = hasattr(user, 'user_type') and user.user_type == 'admin'

        if not is_admin and room.user != user:
            return Response(
                {'error': 'You do not have permission to view this room'},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = room.messages.all().order_by('created_at')
        serializer = self.get_serializer(messages, many=True)

        return Response({
            'room_id': room.id,
            'messages': serializer.data
        })

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific message as read"""
        message = self.get_object()
        message.mark_as_read()

        serializer = self.get_serializer(message)
        return Response(serializer.data)


class ChatNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for chat notifications
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatNotificationSerializer

    def get_queryset(self):
        return ChatNotification.objects.filter(
            recipient=self.request.user,
            is_read=False
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = ChatNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            'message': 'All notifications marked as read',
            'count': count
        })
