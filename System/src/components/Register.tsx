import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.register(formData);
      setSuccess(response.message);
      setUserId(response.user_id);
      setShowOtpForm(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !otpCode) {
      setError("Please enter the OTP code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.verifyOtp(userId, otpCode);

      setSuccess(
        "Account verified successfully! Redirecting to login page in 2 seconds..."
      );

      // Don't store tokens - let user log in manually
      // apiService.setTokens(response.tokens);

      // Add a delay to show success message, then redirect to login
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to login page after successful verification
          navigate("/login");
        }
      }, 2000); // 2 second delay to show success message
    } catch (err: any) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtpForm) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-drivecash-blue font-sans">
        {/* Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/defender.jpg)" }}
        >
          <div className="absolute inset-0 bg-drivecash-blue mix-blend-multiply"></div>
        </div>

        {/* OTP Verification Form */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <form
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full"
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
            onSubmit={handleOtpVerification}
          >
            <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
              Verify Your Account
            </h2>

            <p className="text-white/80 text-sm text-center mb-4">
              We've sent a 6-digit code to your email. Please enter it below to
              verify your account.
            </p>

            {success && (
              <div className="bg-green-500/20 border border-green-400/30 text-green-100 p-3 rounded-lg mb-4 text-sm">
                {success}
                {success.includes("Redirecting") && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-green-200 hover:text-white text-sm underline font-semibold"
                    >
                      Click here if not redirected automatically
                    </button>
                  </div>
                )}
              </div>
            )}

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
              {loading ? "Verifying..." : "Verify Account"}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowOtpForm(false)}
                className="text-white/70 hover:text-white text-sm underline"
              >
                Back to Registration
              </button>
              <div className="text-white/50 text-sm">or</div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-drivecash-green hover:text-drivecash-accent text-sm underline font-semibold"
              >
                Go to Login
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
                Join DriveCash{" "}
                <span className="block text-white text-2xl md:text-3xl font-semibold mt-2">
                  Start your journey today.
                </span>
              </h1>
              <p className="text-xl text-white max-w-lg">
                Create your account and get access to fast, competitive title
                loans with the best rates in Texas.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-base bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Quick Setup
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-primary rounded-full"></div>
                <span className="text-drivecash-primary font-semibold">
                  Secure Account
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Email Verified
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex flex-col items-center w-full lg:justify-end">
            <form
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
              onSubmit={handleRegister}
            >
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
                Create your account
              </h2>

              {success && (
                <div className="bg-green-500/20 border border-green-400/30 text-green-100 p-3 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-100 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-3 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="first_name"
                      className="text-white text-sm font-semibold"
                    >
                      First Name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="last_name"
                      className="text-white text-sm font-semibold"
                    >
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-white text-sm font-semibold"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="phone_number"
                    className="text-white text-sm font-semibold"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="date_of_birth"
                    className="text-white text-sm font-semibold"
                  >
                    Date of Birth (Optional)
                  </label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition text-drivecash-dark"
                  />
                </div>

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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password2"
                    className="text-white text-sm font-semibold"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="password2"
                    name="password2"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 mb-4"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-white">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-drivecash-green font-semibold underline underline-offset-2"
                >
                  Sign In
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
