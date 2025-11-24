import { apiClient } from "utils/apiClient";

const notificationsService = {
  getNotifications: async () => {
    try {
      // Check if user is authenticated before making request
      const token = localStorage.getItem('authToken');
      if (!token) {
        return []; // Return empty array if not authenticated
      }
      
      const response = await apiClient.get("/notifications/");
      return response.data;
    } catch (error) {
      // Silently handle 401 errors (user not logged in)
      if (error.response?.status === 401) {
        return [];
      }
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/`, { read: true });
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post("/notifications/mark_all_as_read/");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
};

export default notificationsService;
