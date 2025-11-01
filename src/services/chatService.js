import { apiClient } from '../utils/apiClient';

/**
 * Chat Service
 * Handles chat room and messaging functionality
 */

const chatService = {
  /**
   * Get or create user's chat room
   */
  getMyRoom: async () => {
    try {
      console.log('💬 Fetching user chat room...');
      const response = await apiClient.get('/chat/rooms/my_room/');
      console.log('✅ Chat room fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chat room:', error);
      throw error;
    }
  },

  /**
   * Get chat room by user ID (admin only)
   */
  getRoomByUserId: async (userId) => {
    try {
      console.log(`💬 Fetching chat room for user ${userId}...`);
      const response = await apiClient.get(`/chat/rooms/user/${userId}/`);
      console.log('✅ Chat room fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chat room:', error);
      throw error;
    }
  },

  /**
   * Get all chat rooms (admin only)
   */
  getAllRooms: async () => {
    try {
      console.log('💬 Fetching all chat rooms...');
      const response = await apiClient.get('/chat/rooms/');
      console.log('✅ Chat rooms fetched successfully');
      // Assuming the backend returns user presence as part of the room data
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
      throw error;
    }
  },

  /**
   * Get messages for a specific room
   */
  getRoomMessages: async (roomId) => {
    try {
      console.log(`💬 Fetching messages for room ${roomId}...`);
      const response = await apiClient.get(`/chat/messages/room_messages/?room_id=${roomId}`);
      console.log('✅ Messages fetched successfully');
      return response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a new message
   */
  sendMessage: async (roomId, message, attachment = null) => {
    try {
      console.log(`💬 Sending message to room ${roomId}...`);
      
      const formData = new FormData();
      formData.append('room_id', roomId);
      formData.append('message', message);
      
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      const response = await apiClient.post('/chat/messages/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Message sent successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark room messages as read
   */
  markRoomAsRead: async (roomId) => {
    try {
      console.log(`💬 Marking room ${roomId} as read...`);
      const response = await apiClient.post(`/chat/rooms/${roomId}/mark_as_read/`);
      console.log('✅ Room marked as read');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking room as read:', error);
      throw error;
    }
  },

  /**
   * Mark a specific message as read
   */
  markMessageAsRead: async (messageId) => {
    try {
      const response = await apiClient.post(`/chat/messages/${messageId}/mark_read/`);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications
   */
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/chat/notifications/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await apiClient.post(`/chat/notifications/${notificationId}/mark_read/`);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiClient.post('/chat/notifications/mark_all_read/');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  },
};

export default chatService;
