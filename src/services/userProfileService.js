import { apiClient } from '../utils/apiClient';

/**
 * User Profile Service
 * Handles user profile data fetching and updates
 */

const userProfileService = {
  /**
   * Get comprehensive user profile with loan data
   */
  getUserProfile: async () => {
    try {
      console.log('📊 Fetching user profile from API...');
      const response = await apiClient.get('/accounts/profile/');
      console.log('✅ User profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile information
   */
  updateUserProfile: async (profileData) => {
    try {
      console.log('📝 Updating user profile...');
      const response = await apiClient.put('/accounts/profile/update/', profileData);
      console.log('✅ User profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Partial update of user profile
   */
  patchUserProfile: async (profileData) => {
    try {
      console.log('📝 Partially updating user profile...');
      const response = await apiClient.patch('/accounts/profile/update/', profileData);
      console.log('✅ User profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  },
};

export default userProfileService;
