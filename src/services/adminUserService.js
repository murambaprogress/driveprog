import { apiClient } from "utils/apiClient";

/**
 * Admin User Management Service
 * Handles all admin-side user management operations
 */

const adminUserService = {
  /**
   * Fetch all users with pagination, search, and filters
   */
  async fetchUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await apiClient.get(`/admin/users/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get detailed information for a specific user
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update a user's information
   */
  async updateUser(userId, updates) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk update multiple users
   */
  async bulkUpdateUsers(userIds, updates) {
    try {
      const response = await apiClient.post('/admin/users/bulk-update/', {
        userIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  },

  /**
   * Bulk delete multiple users
   */
  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiClient.post('/admin/users/bulk-delete/', {
        userIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  },

  /**
   * Get user statistics for dashboard
   */
  async getUserStatistics() {
    try {
      const response = await apiClient.get('/admin/users/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  /**
   * Suspend a user (set is_active to false)
   */
  async suspendUser(userId) {
    return this.updateUser(userId, { status: 'suspended' });
  },

  /**
   * Activate a user (set is_active to true and is_verified to true)
   */
  async activateUser(userId) {
    return this.updateUser(userId, { status: 'active' });
  },

  /**
   * Verify a user (set is_verified to true)
   */
  async verifyUser(userId) {
    return this.updateUser(userId, { is_verified: true });
  },

  /**
   * Bulk suspend users
   */
  async bulkSuspendUsers(userIds) {
    return this.bulkUpdateUsers(userIds, { status: 'suspended' });
  },

  /**
   * Bulk activate users
   */
  async bulkActivateUsers(userIds) {
    return this.bulkUpdateUsers(userIds, { status: 'active' });
  },

  /**
   * Bulk verify users
   */
  async bulkVerifyUsers(userIds) {
    return this.bulkUpdateUsers(userIds, { is_verified: true });
  }
};

export default adminUserService;
