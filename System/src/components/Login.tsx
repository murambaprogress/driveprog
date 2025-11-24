import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { validateAdminCredentials } from "../utils/adminCredentials";

interface LoginProps {
  onAuthSuccess?: (isAdmin: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    email: "", // This will accept both email and username formats
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminOtpForm, setShowAdminOtpForm] = useState(false);
  const [adminUserId, setAdminUserId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email/username.");
      return;
    }

    // Check if this is admin username
    if (formData.email === "9999999999") {
      await handleAdminLogin();
      return;
    }

    // Regular user login - requires password
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    await handleRegularUserLogin();
  };

  const handleAdminLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Send username and get OTP
      const response = await apiService.adminLoginStep1(formData.email);
      setAdminUserId(response.user_id);
      setShowAdminOtpForm(true);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegularUserLogin = async () => {
    try {
      // Attempt backend login first
      const response = await apiService.login(
        formData.email,
        formData.password
      );

      // Store JWT tokens using apiService
      apiService.setTokens(response.tokens);
      localStorage.setItem("drivecash_user_email", formData.email);
      localStorage.setItem("drivecash_login_time", Date.now().toString());

      // Determine if user is admin based on backend response
      const isAdmin = response.user?.user_type === "admin";

      // Set admin state in localStorage for App.tsx
      localStorage.setItem("drivecash_isAdmin", isAdmin.toString());

      // Set additional admin tokens if admin user
      if (isAdmin) {
        localStorage.setItem(
          "drivecash_admin_login_time",
          Date.now().toString()
        ); // For AdminAuthGuard
        localStorage.setItem("drivecash_admin_token", response.tokens.access);
        localStorage.setItem("drivecash_admin_email", formData.email);
        localStorage.setItem("drivecash_admin_role", "admin");
        localStorage.setItem("drivecash_user_type", "admin");
      } else {
        localStorage.setItem("drivecash_user_type", "user");
      }

      // Call callback if provided (AuthHandler will pass one), otherwise navigate directly
      if (onAuthSuccess) {
        onAuthSuccess(isAdmin);
      } else {
        navigate(isAdmin ? "/admin" : "/dashboard");
      }
    } catch (err: any) {
      // Fallback to hardcoded credentials if backend fails
      console.warn(
        "Backend login failed, trying hardcoded credentials:",
        err.message
      );

      const adminCredential = validateAdminCredentials(
        formData.email,
        formData.password
      );
      const isAdmin = adminCredential !== null;

      if (adminCredential) {
        // Set admin session tokens for enhanced portal integration
        const adminToken =
          "admin_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const adminRole = adminCredential.role;

        // Set admin state in localStorage for App.tsx
        localStorage.setItem("drivecash_isAdmin", "true");
        localStorage.setItem("drivecash_admin_token", adminToken);
        localStorage.setItem(
          "drivecash_admin_login_time",
          Date.now().toString()
        );
        localStorage.setItem("drivecash_admin_email", formData.email);
        localStorage.setItem("drivecash_admin_role", adminRole);
        localStorage.setItem("drivecash_user_type", "admin");
        localStorage.setItem(
          "drivecash_admin_permissions",
          JSON.stringify(adminCredential.permissions)
        );

        // Call callback if provided
        if (onAuthSuccess) {
          onAuthSuccess(isAdmin);
        } else {
          navigate("/admin");
        }
      } else {
        setError(err.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !adminUserId) {
      setError("Please enter the OTP code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Step 2: Verify OTP and get tokens
      const response = await apiService.adminLoginStep2(adminUserId, otpCode);

      // Store JWT tokens using apiService
      apiService.setTokens(response.tokens);

      // Store additional admin-specific tokens and data
      localStorage.setItem("drivecash_user_email", "9999999999");
      localStorage.setItem("drivecash_login_time", Date.now().toString());
      localStorage.setItem("drivecash_admin_login_time", Date.now().toString()); // For AdminAuthGuard

      // Set admin state in localStorage
      localStorage.setItem("drivecash_isAdmin", "true");
      localStorage.setItem("drivecash_admin_token", response.tokens.access);
      localStorage.setItem(
        "drivecash_admin_email",
        "r2210294w@students.msu.ac.zw"
      );
      localStorage.setItem("drivecash_admin_role", "admin");
      localStorage.setItem("drivecash_user_type", "admin");

      // Call callback if provided, otherwise navigate to admin dashboard
      if (onAuthSuccess) {
        onAuthSuccess(true);
      } else {
        navigate("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show admin OTP form if admin username was entered
  if (showAdminOtpForm) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-drivecash-blue font-sans">
        {/* Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/defender.jpg)" }}
        >
          <div className="absolute inset-0 bg-drivecash-blue mix-blend-multiply"></div>
        </div>

        {/* Admin OTP Form */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <form
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full"
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
            onSubmit={handleAdminOtpSubmit}
          >
            <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
              Admin Verification
            </h2>

            <p className="text-white/80 text-sm text-center mb-4">
              We've sent a 6-digit OTP to r2210294w@students.msu.ac.zw. Please
              enter it below to complete admin login.
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-100 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="otpCode"
                className="text-white text-sm font-semibold block mb-2"
              >
                Enter OTP Code
              </label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                className="w-full px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark text-center text-lg tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 mb-4"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowAdminOtpForm(false);
                  setOtpCode("");
                  setAdminUserId(null);
                  setError("");
                }}
                className="text-white/70 hover:text-white text-sm underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-drivecash-blue font-sans">
      {/* Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/defender.jpg)" }}
        onError={(e) => {
          e.currentTarget.style.backgroundImage =
            "url(https://placehold.co/600x400?text=No+Image)";
        }}
      >
        <div className="absolute inset-0 bg-drivecash-blue mix-blend-multiply"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div className="space-y-4 bg-black/20 backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-lg">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow text-drivecash-primary">
                DriveCash{" "}
                <span className="block text-white text-2xl md:text-3xl font-semibold mt-2">
                  The smarter, safer choice.
                </span>
              </h1>
              <p className="text-xl text-white max-w-lg">
                Texas-based Title loans with competitive rates. Whether you’re
                applying for the first time,
                <br />
                refinancing or looking for a title loan buyout- we’ve got you
                covered.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-base bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Fast Approval
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-primary rounded-full"></div>
                <span className="text-drivecash-primary font-semibold">
                  Competitive Rates
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Texas Local
                </span>
              </div>
            </div>
          </div>
          {/* Right Side - Login Form */}
          <div className="flex flex-col items-center w-full lg:justify-end">
            <form
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
                Log into your account
              </h2>

              <div className="grid gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-white text-sm font-semibold"
                  >
                    Email / Username
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="Email or Username"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>
                {formData.email !== "9999999999" && (
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="password"
                      className="text-white text-sm font-semibold"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                    />
                  </div>
                )}
                {formData.email === "9999999999" && (
                  <div className="text-white/80 text-sm text-center p-3 bg-blue-500/20 rounded-lg">
                    Admin login detected. Click "Send OTP" to receive
                    verification code at r2210294w@students.msu.ac.zw
                  </div>
                )}
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center mb-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 mb-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="text-blue-500">
                    {formData.email === "9999999999"
                      ? "Sending OTP..."
                      : "Signing In..."}
                  </span>
                ) : (
                  <span className="text-blue-500">
                    {formData.email === "9999999999" ? "Send OTP" : "Sign In"}
                  </span>
                )}
              </button>

              <div className="text-center space-y-2">
                <a
                  href="/forgot-password"
                  className="text-white/70 hover:text-white text-sm underline block"
                >
                  Forgot Password?
                </a>
                <p className="text-center text-sm text-white">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="text-drivecash-green font-semibold underline underline-offset-2"
                  >
                    Sign Up
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
