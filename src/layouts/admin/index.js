// Unified Admin Dashboard - All admin functionality in one place
// Wrapped with AdminDataProvider for isolated admin state management
import React, { lazy } from "react";
import UnifiedAdminDashboard from "./unified";
import { AdminDataProvider } from "../../context/AdminDataContext";

const AdminUsersEnhanced = lazy(() => import("./usersEnhanced"));
const AdminLoansEnhanced = lazy(() => import("./loansEnhanced"));
const AdminPaymentsEnhanced = lazy(() => import("./paymentsEnhanced"));
const AdminSettings = lazy(() => import("./settings"));

function AdminLayout() {
  return (
    <AdminDataProvider>
      <UnifiedAdminDashboard
        AdminUsersEnhanced={AdminUsersEnhanced}
        AdminLoansEnhanced={AdminLoansEnhanced}
        AdminPaymentsEnhanced={AdminPaymentsEnhanced}
        AdminSettings={AdminSettings}
      />
    </AdminDataProvider>
  );
}

export default AdminLayout;
