import { Suspense, lazy, useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import AboutUs from "./components/AboutUs";
import AdminAuthGuard from "./components/AdminAuthGuard";
import ApplicationForm from "./components/ApplicationForm";
import AuthHandler from "./components/AuthHandler";
import BenefitsPage from "./components/BenefitsPage";
import { ConfirmProvider } from "./components/ConfirmProvider";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import ForgotPassword from "./components/ForgotPassword";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LoanCalculator from "./components/LoanCalculator";
import Login from "./components/Login";
import Register from "./components/Register";
import { ToastProvider } from "./components/ToastProvider";
import UserPortal from "./components/UserPortal";
import { clearSession, setSession, timeUntilExpiryMs } from "./utils/session";
import useSafeNavigate from "./utils/useSafeNavigate";
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const UserDashboard = lazy(() => import("./components/UserDashboard"));

function AppContent() {
  // Restore isAdmin from localStorage if present
  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    const stored = localStorage.getItem("drivecash_isAdmin");
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  });
  const userId = "1";
  const navigate = useSafeNavigate();
  const location = useLocation();
  const pathname = location.pathname || "/";
  const protectedPrefixes = [
    "/dashboard",
    "/admin",
    "/loans",
    "/payments",
    "/documents",
    "/calculator",
    "/support",
    "/chat",
  ];
  const isProtectedRoute = protectedPrefixes.some((p) =>
    pathname.startsWith(p)
  );
  const isLoginPage = false; // No longer using internal login page
  setSession(5); // default 5 minutes

  // Force first-load to start on landing page for this session only
  useEffect(() => {
    const started = sessionStorage.getItem("drivecash_started");
    if (!started) {
      sessionStorage.setItem("drivecash_started", "1");
      if (pathname !== "/") {
        navigate("/", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enforce body class for protected & login routes
  useEffect(() => {
    const shouldProtect = isProtectedRoute || isLoginPage;
    document.body.classList.toggle("protected", shouldProtect);
    return () => {
      document.body.classList.remove("protected");
    };
  }, [isProtectedRoute, isLoginPage]);

  // Correctly handle login success and role changes to set isAdmin state and redirect
  const handleAuthSuccess = (isAdmin: boolean) => {
    console.log("handleAuthSuccess called with isAdmin:", isAdmin);
    setIsAdmin(isAdmin);
    localStorage.setItem("drivecash_isAdmin", String(isAdmin));
    setSession(5);

    // Use setTimeout to ensure state updates before navigation
    setTimeout(() => {
      // Enhanced navigation with efficiency focus for admin
      if (isAdmin) {
        console.log("Navigating to /admin");
        navigate("/admin?view=overview&focus=efficiency");
      } else {
        console.log("Navigating to /dashboard");
        navigate("/dashboard");
      }
    }, 100); // Small delay to ensure state is updated
  };

  // Handle logout from dashboard or direct logout
  const handleLogout = () => {
    setIsAdmin(null);
    localStorage.removeItem("drivecash_isAdmin");
    localStorage.removeItem("drivecash_admin_token");
    localStorage.removeItem("drivecash_admin_login_time");
    localStorage.removeItem("drivecash_admin_email");
    clearSession();
    navigate("/");
  };

  // auto-logout: schedule a single timeout to fire at expiry
  useEffect(() => {
    let to: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      const ms = timeUntilExpiryMs();
      if (ms <= 0) {
        // already expired - return to public landing page instead of forcing login
        handleLogout();
        return;
      }
      // schedule logout at expiry
      to = setTimeout(() => {
        handleLogout();
      }, ms + 100); // slight buffer
    };

    schedule();
    // reschedule if location changes (user navigated) or when component unmounts
    return () => {
      if (to) clearTimeout(to);
    };
  }, [navigate, location, handleLogout]);

  // Listen for logout messages from dashboard iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "logout" || event.data?.type === "logout") {
        handleLogout();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleLogout]);

  // Clear isAdmin on logout (when setIsAdmin(null))
  useEffect(() => {
    if (isAdmin === null) {
      localStorage.removeItem("drivecash_isAdmin");
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header shown on public routes only; hidden on protected routes and shown on login */}
      {!isProtectedRoute && (
        <Header
          currentRole={
            isAdmin === true ? "admin" : isAdmin === false ? "user" : null
          }
          onRoleChange={handleAuthSuccess}
          showRoleToggle={false}
        />
      )}
      <div className="flex flex-1 min-h-0">
        {/* Top navigation replaces sidebar on all pages (responsive) */}
        <div className="w-full flex flex-col min-h-0">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <ApplicationForm />
                    <LoanCalculator />
                    <AboutUs />
                    <FAQ />
                  </>
                }
              />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<AuthHandler mode="signup" />} />
              <Route
                path="/login"
                element={<Login onAuthSuccess={handleAuthSuccess} />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/portal" element={<UserPortal />} />

              {/* Admin Dashboard routes - always available, AdminAuthGuard handles authentication */}
              <Route
                path="/admin"
                element={
                  <AdminAuthGuard>
                    <AdminDashboard />
                  </AdminAuthGuard>
                }
              />
              <Route
                path="/admin/:view"
                element={
                  <AdminAuthGuard>
                    <AdminDashboard />
                  </AdminAuthGuard>
                }
              />

              {/* User Dashboard routes */}
              {isAdmin === false && (
                <>
                  <Route
                    path="/dashboard"
                    element={<UserDashboard userId={userId} />}
                  />
                  <Route
                    path="/dashboard/:view"
                    element={<UserDashboard userId={userId} />}
                  />
                </>
              )}
            </Routes>
          </Suspense>
        </div>
      </div>
      {/* Copyright hidden on protected routes & login */}
      {!isProtectedRoute && !isLoginPage && (
        <div
          id="landing-footer"
          className="w-full bg-drivecash-primary text-drivecash-white text-center py-4 text-sm border-t border-drivecash-light"
        >
          ©Market.Maker.Softwares 2025 DriveCash. All rights reserved.
        </div>
      )}
      {/* Footer for public routes only; hide on protected & login */}
      {!isProtectedRoute && !isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <ConfirmProvider>
          <AppContent />
        </ConfirmProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
