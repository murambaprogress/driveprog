/**
 * Real-time Customer Profile API Service
 * Handles live data fetching from DriveCash backend APIs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API request helper with error handling
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch current user profile data
 * @returns {Promise<object>} User account data
 */
export const fetchUserAccount = async () => {
  return await apiRequest('/accounts/profile/');
};

/**
 * Fetch user's loan applications
 * @param {number} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Array>} Loan applications
 */
export const fetchUserLoanApplications = async (userId = null) => {
  // Use the available endpoint without user parameter
  return await apiRequest('/loans/applications/');
};

/**
 * Fetch specific loan application details
 * @param {string} applicationId - Application UUID
 * @returns {Promise<object>} Detailed loan application
 */
export const fetchLoanApplicationDetails = async (applicationId) => {
  return await apiRequest(`/loans/applications/${applicationId}/`);
};

/**
 * Fetch user's payment history (API not yet available)
 * @param {number} userId - User ID (optional)
 * @returns {Promise<Array>} Payment records
 */
export const fetchPaymentHistory = async (userId = null) => {
  console.log('Payment history API not yet available');
  return { data: [] };
};

/**
 * Fetch user's documents (API endpoint available but may need authentication)
 * @param {number} userId - User ID (optional)
 * @returns {Promise<Array>} Document records
 */
export const fetchUserDocuments = async (userId = null) => {
  try {
    return await apiRequest('/loans/documents/');
  } catch (error) {
    console.log('Documents API call failed:', error.message);
    return { data: [] };
  }
};

/**
 * Fetch vehicle valuation data
 * @param {string} applicationId - Application UUID
 * @returns {Promise<object>} Vehicle valuation details
 */
export const fetchVehicleValuation = async (applicationId) => {
  return await apiRequest(`/loans/applications/${applicationId}/valuation/`);
};

/**
 * Update user profile information
 * @param {object} profileData - Updated profile data
 * @returns {Promise<object>} Updated profile
 */
export const updateUserProfile = async (profileData) => {
  return await apiRequest('/accounts/profile/', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
};

/**
 * Fetch complete customer profile with all related data
 * @param {number} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<object>} Complete customer profile
 */
export const fetchCompleteCustomerProfile = async (userId = null) => {
  try {
    // Fetch all related data in parallel
    const [
      userAccount,
      loanApplications,
      paymentHistory,
      documents
    ] = await Promise.allSettled([
      fetchUserAccount(),
      fetchUserLoanApplications(userId),
      fetchPaymentHistory(userId),
      fetchUserDocuments(userId)
    ]);

    // Process results and handle any failed requests
    const processedData = {
      userAccount: userAccount.status === 'fulfilled' ? userAccount.value : null,
      loanApplications: loanApplications.status === 'fulfilled' ? loanApplications.value : [],
      paymentHistory: paymentHistory.status === 'fulfilled' ? paymentHistory.value : [],
      documents: documents.status === 'fulfilled' ? documents.value : []
    };

    // Log any failed requests
    [userAccount, loanApplications, paymentHistory, documents].forEach((result, index) => {
      if (result.status === 'rejected') {
        const endpoints = ['user account', 'loan applications', 'payment history', 'documents'];
        console.warn(`Failed to fetch ${endpoints[index]}:`, result.reason);
      }
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching complete customer profile:', error);
    throw error;
  }
};

/**
 * Search customers (admin only)
 * @param {string} query - Search query
 * @param {string} field - Field to search in
 * @returns {Promise<Array>} Search results
 */
export const searchCustomers = async (query, field = 'all') => {
  return await apiRequest(`/admin/customers/search/?q=${encodeURIComponent(query)}&field=${field}`);
};

/**
 * Fetch all customers (admin only)
 * @param {object} filters - Filter options
 * @returns {Promise<Array>} Customer list
 */
export const fetchAllCustomers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  return await apiRequest(`/admin/customers/?${params}`);
};

/**
 * Fetch loan statistics for dashboard
 * @returns {Promise<object>} Loan statistics
 */
export const fetchLoanStatistics = async () => {
  return await apiRequest('/loans/statistics/');
};

/**
 * Check API health and connectivity
 * @returns {Promise<boolean>} API health status
 */
export const checkApiHealth = async () => {
  try {
    await apiRequest('/health/');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Real-time data polling utilities
export class CustomerProfilePoller {
  constructor(userId, onUpdate, intervalMs = 30000) {
    this.userId = userId;
    this.onUpdate = onUpdate;
    this.intervalMs = intervalMs;
    this.polling = false;
    this.intervalId = null;
  }

  start() {
    if (this.polling) return;
    
    this.polling = true;
    this.poll(); // Initial poll
    this.intervalId = setInterval(() => this.poll(), this.intervalMs);
  }

  stop() {
    this.polling = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async poll() {
    try {
      const profile = await fetchCompleteCustomerProfile(this.userId);
      this.onUpdate(profile);
    } catch (error) {
      console.error('Profile polling error:', error);
    }
  }
}

export default {
  fetchUserAccount,
  fetchUserLoanApplications,
  fetchLoanApplicationDetails,
  fetchPaymentHistory,
  fetchUserDocuments,
  fetchVehicleValuation,
  updateUserProfile,
  fetchCompleteCustomerProfile,
  searchCustomers,
  fetchAllCustomers,
  fetchLoanStatistics,
  checkApiHealth,
  CustomerProfilePoller
};