import { apiClient } from '../utils/apiClient';

/**
 * User Dashboard Service
 * Handles user dashboard statistics and data
 */

const userDashboardService = {
  /**
   * Get user dashboard statistics with charts
   */
  getDashboardStatistics: async () => {
    try {
      console.log('📊 Fetching user dashboard statistics...');
      console.log('Auth Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      const response = await apiClient.get('/loans/applications/dashboard_statistics/');
      console.log('✅ User dashboard statistics fetched successfully');
      console.log('📈 Dashboard Data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user dashboard statistics:', error);
      console.error('Error details:', error.response?.data);
      
      // Return mock data as fallback
      console.log('⚠️ Using fallback mock data for user dashboard');
      return {
        metrics: {
          total_applications: 0,
          pending_count: 0,
          approved_count: 0,
          rejected_count: 0,
          query_count: 0,
          active_loans: 0,
          total_borrowed: 0,
          total_requested: 0,
          current_balance: 0,
          monthly_payment: 0,
          next_due_date: null,
          account_health: 'New Account',
        },
        charts: {
          applications_over_time: {
            labels: [],
            data: [],
          },
          status_distribution: {
            pending: 0,
            approved: 0,
            rejected: 0,
            query: 0,
          },
        },
        recent_activity: [],
      };
    }
  },
};

export default userDashboardService;
