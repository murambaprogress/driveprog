import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";

interface ForgotPasswordProps {
  onSuccess?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.requestPasswordReset(email);
      setSuccess(response.message);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !formData.password || !formData.password2) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.resetPassword(
        email,
        otpCode,
        formData.password,
        formData.password2
      );
      setSuccess(response.message);

      // Redirect to login after successful reset
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/login");
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "otpCode") {
      setOtpCode(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError("");
  };

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
                Reset Password{" "}
                <span className="block text-white text-2xl md:text-3xl font-semibold mt-2">
                  Get back on track.
                </span>
              </h1>
              <p className="text-xl text-white max-w-lg">
                {step === "email"
                  ? "Enter your email address and we'll send you a code to reset your password."
                  : "Enter the code we sent to your email and choose a new password."}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-base bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Secure Process
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-primary rounded-full"></div>
                <span className="text-drivecash-primary font-semibold">
                  Email Verified
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">
                  Quick Recovery
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Form */}
          <div className="flex flex-col items-center w-full lg:justify-end">
            {step === "email" ? (
              <form
                className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
                onSubmit={handleEmailSubmit}
              >
                <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
                  Forgot Password
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

                <div className="flex flex-col gap-1 mb-4">
                  <label
                    htmlFor="email"
                    className="text-white text-sm font-semibold"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 mb-4"
                  disabled={loading}
                >
                  {loading ? "Sending Code..." : "Send Reset Code"}
                </button>

                <div className="text-center space-y-2">
                  <a
                    href="/login"
                    className="text-white/70 hover:text-white text-sm underline block"
                  >
                    Back to Login
                  </a>
                  <p className="text-center text-sm text-white">
                    Don't have an account?{" "}
                    <a
                      href="/register"
                      className="text-drivecash-green font-semibold underline underline-offset-2"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <form
                className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
                onSubmit={handlePasswordReset}
              >
                <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
                  Reset Password
                </h2>

                <p className="text-white/80 text-sm text-center mb-4">
                  Enter the 6-digit code sent to {email}
                </p>

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
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="otpCode"
                      className="text-white text-sm font-semibold"
                    >
                      Reset Code
                    </label>
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={handleChange}
                      maxLength={6}
                      required
                      className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark text-center text-lg tracking-widest"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="password"
                      className="text-white text-sm font-semibold"
                    >
                      New Password
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
                      Confirm New Password
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
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-white/70 hover:text-white text-sm underline"
                  >
                    Back to Email Step
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
