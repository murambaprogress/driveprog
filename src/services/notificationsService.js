import { apiClient } from "utils/apiClient";

const notificationsService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get("/api/notifications/");
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/`, { read: true });
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post("/api/notifications/mark_all_as_read/");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
};

export default notificationsService;
