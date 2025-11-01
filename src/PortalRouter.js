/**
 * Portal Router - Routes between User and Admin portals
 * Determines which portal to load based on user role
 */

import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "context/AppDataContext";
import UserPortalApp from "UserPortalApp";
import AdminPortalApp from "AdminPortalApp";
import DriveCashLogin from "components/DriveCashLogin";
import Register from "components/Register";
import ForgotPassword from "components/ForgotPassword.jsx";

export default function PortalRouter() {
  const { user } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is actually authenticated (logged in through DriveCashLogin)
  // Recompute on every render so logout (which clears localStorage) is respected.
  const isAuthenticated = (() => {
    try {
      const stored = localStorage.getItem('authToken');
      if (!stored) return false;
      
      // Support both raw token strings and JSON formats
      try {
        const parsed = JSON.parse(stored);
        // Check for nested token formats: {access, refresh} or {tokens: {access, refresh}}
        return !!(parsed.access || (parsed.tokens && parsed.tokens.access));
      } catch (e) {
        // If JSON parse fails, it's a raw token string - valid if non-empty
        return stored.length > 0;
      }
    } catch (e) {
      return false;
    }
  })();
  
  // Compute effective role only if authenticated
  const effectiveRole = useMemo(() => {
    if (!isAuthenticated) return null;
    
    try {
      const stored = localStorage.getItem('mockUserProfile');
      let localRole = null;
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localRole = parsed.role || parsed.profile?.role || parsed.user?.profile?.role || null;
        } catch (e) {
          localRole = null;
        }
      }
      
      return localRole || user?.profile?.role || 'user';
    } catch (e) {
      return user?.profile?.role || 'user';
    }
  }, [user?.profile?.role, isAuthenticated]);

  // Handle role-based navigation to prevent conflicts (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const currentPath = location.pathname;
    
    // If admin user is on a user route, redirect to admin
    if (effectiveRole === 'admin' && (currentPath.startsWith('/dashboard') || currentPath.startsWith('/loans') || currentPath.startsWith('/payments') || currentPath.startsWith('/documents') || currentPath.startsWith('/calculator') || currentPath.startsWith('/support') || currentPath.startsWith('/chat'))) {
      navigate('/admin', { replace: true });
      return;
    }
    
    // If user is on an admin route, redirect to dashboard
    if (effectiveRole === 'user' && currentPath.startsWith('/admin')) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [effectiveRole, location.pathname, navigate, isAuthenticated]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    if (location.pathname === '/register') {
      return <Register />;
    }
    if (location.pathname === '/forgot-password') {
      return <ForgotPassword />;
    }
    return <DriveCashLogin />;
  }

  // Route to appropriate portal based on role
  if (effectiveRole === 'admin') {
    return (
      <>
        <AdminPortalApp />
      </>
    );
  }

  // Default to user portal
  return (
    <>
      <UserPortalApp />
    </>
  );
}
