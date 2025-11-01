import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Direct connection to backend
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

export { apiClient };
