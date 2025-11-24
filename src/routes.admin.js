/**
 * Admin Portal Routes - Only admin functionality
 * User routes are completely excluded from this file
 */

import Icon from "@mui/material/Icon";
import ProtectedRoute from "components/ProtectedRoute";
import React, { lazy, Suspense } from "react";
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";

// Lazy load admin components to ensure they're not in the user bundle
const AdminDashboard = lazy(() => import("layouts/admin"));

// Additional admin-specific routes can be added here
const AdminUsers = lazy(() => import("layouts/admin/usersEnhanced"));
const AdminLoans = lazy(() => import("layouts/admin/loansEnhanced"));
const AdminPayments = lazy(() => import("layouts/admin/paymentsEnhanced"));
const AdminSettings = lazy(() => import("layouts/admin/settings"));
const AdminChat = lazy(() => import("layouts/admin/adminChat"));
const EnhancedAdminChat = lazy(() => import("layouts/admin/EnhancedAdminChat"));

// Loading fallback component
const AdminLoadingFallback = () => (
  <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress color="info" />
  </MDBox>
);

import LoanApplicationDetails from 'loanApp/components/LoanApplicationDetails';

const adminRoutes = [
  {
    name: 'Loan Application Details',
    key: 'loan-application-details',
    route: '/admin/loans/:id',
    component: <LoanApplicationDetails />,
    hidden: true,
  },
  // Main Admin Dashboard
  {
    type: "collapse",
    name: "Admin Dashboard",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // User Management
  {
    type: "collapse",
    name: "User Management",
    key: "admin-users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/admin/users",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminUsers />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Loan Management
  {
    type: "collapse",
    name: "Loan Management",
    key: "admin-loans",
    icon: <Icon fontSize="small">account_balance</Icon>,
    route: "/admin/loans",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminLoans />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Payment Management
  {
    type: "collapse",
    name: "Payment Management",
    key: "admin-payments",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/admin/payments",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminPayments />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // System Settings
  {
    type: "collapse",
    name: "System Settings",
    key: "admin-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/admin/settings",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminSettings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Admin Chat Inbox
  {
    type: "collapse",
    name: "Admin Chat",
    key: "admin-chat",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/admin/chat",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <EnhancedAdminChat />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default adminRoutes;
