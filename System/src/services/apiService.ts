/**
 * DriveCash Backend API Service
 * Handles all backend communication for authentication and user management
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/accounts";

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  password: string;
  password2: string;
}

interface LoginResponse {
  user: any;
  tokens: {
    access: string;
    refresh: string;
  };
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestOptions = {}, retry = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("drivecash_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // If access token expired, try to refresh and retry once
      if (response.status === 401 && retry) {
        try {
          const refreshResponse = await this.refreshToken();
          const newAccess = refreshResponse.access || (refreshResponse.tokens && refreshResponse.tokens.access);
          const newRefresh = refreshResponse.refresh || (refreshResponse.tokens && refreshResponse.tokens.refresh);
          if (newAccess) {
            this.setTokens({ access: newAccess, refresh: newRefresh });
            // Retry original request with new token
            return await this.request(endpoint, options, false);
          } else {
            throw new Error("Unable to refresh token");
          }
        } catch (refreshError) {
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Authentication APIs
  async register(userData: RegisterData): Promise<any> {
    return this.request("/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async verifyOtp(userId: number, otpCode: string): Promise<any> {
    return this.request("/verify-otp/", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        otp_code: otpCode,
      }),
    });
  }

  async login(email: string): Promise<LoginResponse> {
    console.log("Login validation disabled for testing.");
    return Promise.resolve({
      user: { email: email, name: "Test User" },
      tokens: { access: "test-access-token", refresh: "test-refresh-token" },
    });
  }

  async requestPasswordReset(email: string): Promise<any> {
    return this.request("/password-reset-request/", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
  }

  async resetPassword(
    email: string,
    otpCode: string,
    password: string,
    password2: string
  ): Promise<any> {
    return this.request("/password-reset/", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp_code: otpCode,
        password,
        password2,
      }),
    });
  }

  async getUserProfile() {
    return this.request("/profile/", {
      method: "GET",
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return this.request("/token/refresh/", {
      method: "POST",
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });
  }

  // Admin two-step login
  async adminLoginStep1(username: string): Promise<any> {
    return this.request("/admin/login/step1/", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    });
  }

  async adminLoginStep2(userId: number): Promise<LoginResponse> {
    console.log("Admin login validation disabled for testing.");
    return Promise.resolve({
      user: { id: userId, name: "Test Admin" },
      tokens: {
        access: "test-admin-access-token",
        refresh: "test-admin-refresh-token",
      },
    });
  }

  // Token management
  setTokens(tokens: { access?: string; refresh?: string }): void {
    if (tokens.access) {
      localStorage.setItem("drivecash_access_token", tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem("drivecash_refresh_token", tokens.refresh);
    }
  }

  clearTokens() {
    localStorage.removeItem("drivecash_access_token");
    localStorage.removeItem("drivecash_refresh_token");
    localStorage.removeItem("drivecash_user_email");
    localStorage.removeItem("drivecash_login_time");
    localStorage.removeItem("drivecash_admin_token");
  }

  isAuthenticated() {
    return !!localStorage.getItem("drivecash_access_token");
  }
}

export default new ApiService();
