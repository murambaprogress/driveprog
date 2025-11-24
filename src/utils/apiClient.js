import axios from 'axios';

// Use environment variable for API URL, fallback to local development
const API_BASE_URL = process.env.REACT_APP_API_URL 
  || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('authToken');
    // Support multiple storage formats: raw access token, JSON with {access, refresh}, or wrapped structures
    if (token) {
      try {
        const maybeJson = JSON.parse(token);
        // Common shapes
        if (maybeJson && typeof maybeJson === 'object') {
          token = maybeJson.access 
            || maybeJson.token 
            || (maybeJson.tokens && maybeJson.tokens.access) 
            || null;
        }
      } catch (_) {
        // token was a plain string; keep as-is
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Persistent debug logging that survives redirects
function debugLog(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, data };
  
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('apiClientDebugLogs') || '[]');
    existingLogs.push(logEntry);
    // Keep only last 50 entries
    const recentLogs = existingLogs.slice(-50);
    sessionStorage.setItem('apiClientDebugLogs', JSON.stringify(recentLogs));
    console.log(`[apiClient] ${message}`, data);
  } catch (e) {
    console.log(`[apiClient] ${message}`, data);
  }
}

// Function to retrieve and display debug logs (call this from console after redirect)
window.getApiDebugLogs = function() {
  const logs = JSON.parse(sessionStorage.getItem('apiClientDebugLogs') || '[]');
  console.table(logs);
  return logs;
};

// Add a response interceptor to handle authentication errors
let isRedirecting = false; // Prevent multiple redirects
let failedRequestsCount = 0; // Track failed requests

apiClient.interceptors.response.use(
  (response) => {
    // Reset failed requests counter on successful request
    failedRequestsCount = 0;
    debugLog('✅ Successful request', { url: response.config.url, status: response.status });
    return response;
  },
  (error) => {
    // If 401 Unauthorized, log but don't redirect automatically
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || 'unknown';
      
      // Check if token exists
      const hasToken = localStorage.getItem('authToken');
      failedRequestsCount++;
      
      debugLog('❌ 401 Unauthorized', { 
        url: requestUrl, 
        hasToken: !!hasToken,
        failedCount: failedRequestsCount,
        currentPath: window.location.pathname
      });
      
      if (hasToken) {
        // Only redirect after 3 consecutive failures to avoid false positives
        if (failedRequestsCount >= 3 && !isRedirecting) {
          debugLog('🚨 REDIRECT TRIGGERED', { 
            reason: 'Multiple auth failures',
            failedCount: failedRequestsCount 
          });
          
          // Don't redirect if already on login/registration pages
          const publicPaths = ['/authentication/sign-in', '/authentication/sign-up', '/register', '/login'];
          const currentPath = window.location.pathname;
          const isPublicPath = publicPaths.some(path => currentPath.includes(path));
          
          if (!isPublicPath) {
            isRedirecting = true;
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('mockUserProfile');
            
            setTimeout(() => {
              window.location.href = '/authentication/sign-in';
              isRedirecting = false;
              failedRequestsCount = 0;
            }, 300);
          }
        }
      } else {
        debugLog('ℹ️ No token found - user not logged in', {});
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
