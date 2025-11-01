
import Dashboard from "layouts/dashboard";
import UnifiedLoans from "layouts/loans";
import UnifiedPayments from "layouts/payments";
import Documents from "layouts/documents";
import Calculator from "layouts/calculator";
import Support from "layouts/support";
import ChatPlatform from "layouts/chat";
import Icon from "@mui/material/Icon";
import ProtectedRoute from "components/ProtectedRoute";
import React, { lazy, Suspense } from "react";
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";

// Lazy load admin components to avoid including them in the main user bundle
const Admin = lazy(() => import("layouts/admin"));

const routes = [
  // User Dashboard Routes
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Loans",
    key: "loans",
    icon: <Icon fontSize="small">account_balance</Icon>,
    route: "/loans",
    component: <UnifiedLoans />,
  },
  {
    type: "collapse",
    name: "Payments",
    key: "payments",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/payments",
    component: <UnifiedPayments />,
  },
  {
    type: "collapse",
    name: "Documents",
    key: "documents",
    icon: <Icon fontSize="small">folder</Icon>,
    route: "/documents",
    component: <Documents />,
  },
  {
    type: "collapse",
    name: "Calculator",
    key: "calculator",
    icon: <Icon fontSize="small">calculate</Icon>,
    route: "/calculator",
    component: <Calculator />,
  },
  {
    type: "collapse",
    name: "Support",
    key: "support",
    icon: <Icon fontSize="small">support_agent</Icon>,
    route: "/support",
    component: <Support />,
  },
  {
    type: "collapse",
    name: "Live Chat",
    key: "chat",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/chat",
    component: <ChatPlatform />,
  },
  // Admin Routes (Protected and Lazy-loaded)
  {
    type: "collapse",
    name: "Admin Portal",
    key: "admin",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin",
    // This route should only be visible/available to admin users
    adminOnly: true,
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense
          fallback={
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </MDBox>
          }
        >
          <Admin />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default routes;
