import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Authentication Guard
 * Ensures proper admin session validation before accessing admin portal
 * Focuses on efficiency and security for admin operations
 */
const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAdminSession = async () => {
      try {
        // Check for admin authentication tokens
        const isAdmin = localStorage.getItem("drivecash_isAdmin") === "true";
        const adminToken = localStorage.getItem("drivecash_admin_token");
        const loginTime = localStorage.getItem("drivecash_admin_login_time");
        const adminEmail = localStorage.getItem("drivecash_admin_email");

        if (!isAdmin) {
          toast.push("Admin access required - Redirecting to login", "error");
          const loginUrl = "/login";
          window.location.href = loginUrl;
          return;
        }

        // Validate admin token and session timing
        if (!adminToken || !loginTime) {
          toast.push("Admin session expired - Please log in again", "warn");
          const loginUrl = "/login";
          window.location.href = loginUrl;
          return;
        }

        // Check session timeout (24 hours max for admin sessions)
        const sessionAge = Date.now() - parseInt(loginTime);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxSessionAge) {
          toast.push(
            "Admin session expired for security - Please log in again",
            "warn"
          );
          // Clean up expired session
          localStorage.removeItem("drivecash_admin_token");
          localStorage.removeItem("drivecash_admin_login_time");
          localStorage.removeItem("drivecash_admin_email");
          localStorage.removeItem("drivecash_isAdmin");
          const loginUrl = "/login";
          window.location.href = loginUrl;
          return;
        }

        // Admin session is valid
        setIsAuthenticated(true);

        // Show admin session info
        if (adminEmail) {
          toast.push(`Admin portal ready - Welcome ${adminEmail}`, "success");
        }
      } catch (error) {
        console.error("Admin authentication validation error:", error);
        toast.push("Admin authentication error - Please try again", "error");
        const loginUrl = "/login";
        window.location.href = loginUrl;
      } finally {
        setIsValidating(false);
      }
    };

    validateAdminSession();
  }, [navigate, toast]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Validating Admin Access
          </h2>
          <p className="text-gray-600">
            Verifying admin credentials and session security...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Navigation will handle redirect
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
