import { apiClient } from '../utils/apiClient';

/**
 * Admin Dashboard Service
 * Handles all API calls for admin dashboard statistics and metrics
 */

const adminDashboardService = {
  /**
   * Get comprehensive dashboard statistics
   * @returns {Promise} Dashboard statistics data
   */
  getDashboardStatistics: async () => {
    try {
      console.log('Calling API: /admin/dashboard/statistics/');
      console.log('Auth Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      const response = await apiClient.get('/admin/dashboard/statistics/');
      console.log('✅ API Response received successfully (using REAL data):', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard statistics from API:', error);
      if (error.response?.status === 401) {
        console.error('🔒 Authentication failed - User not logged in or token expired');
      }
      console.error('Error details:', error.response?.data || error.message);
      console.warn('⚠️ Using fallback MOCK data');
      
      // Return mock data as fallback
      return {
        users: {
          total: 1240,
          active: 1089,
          newThisMonth: 89,
          growth: 12.5
        },
        loans: {
          total: 453,
          pending: 23,
          approved: 398,
          active: 320,
          totalAmount: 4567890,
          growth: 8.2,
          approvalRate: 94.2
        },
        revenue: {
          total: 2345678,
          monthly: 234567,
          growth: 15.3,
          totalPayments: 1234
        },
        charts: {
          userGrowth: [120, 135, 128, 156, 148, 167, 178, 189, 203],
          loanTrends: {
            approved: [28, 32, 35, 38],
            pending: [12, 18, 15, 22],
            rejected: [3, 5, 4, 6]
          }
        }
      };
    }
  },

  /**
   * Get user statistics
   * @returns {Promise} User statistics
   */
  getUserStatistics: async () => {
    try {
      const response = await apiClient.get('/admin/users/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return {
        total: 0,
        active: 0,
        suspended: 0,
        pending: 0,
        newUsersLast30Days: 0
      };
    }
  },

  /**
   * Get recent activities for admin dashboard
   * @returns {Promise} Recent activities
   */
  getRecentActivities: async () => {
    try {
      // This endpoint might not exist yet, but we can add it later
      const response = await apiClient.get('/admin/activities/recent/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
};

export default adminDashboardService;
