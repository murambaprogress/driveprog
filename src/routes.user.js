/**
 * User Portal Routes - Only user-facing functionality
 * Admin routes are completely excluded from this file
 */

import Dashboard from "layouts/dashboard";
import UnifiedLoans from "layouts/loans";
import UnifiedPayments from "layouts/payments";
import Documents from "layouts/documents";
import Calculator from "layouts/calculator";
import Support from "layouts/support";
import UserChat from "layouts/chat/userChat";
import Profile from "layouts/profile";
import Icon from "@mui/material/Icon";
import LoanApplicationDetails from "loanApp/components/LoanApplicationDetails";
import React from "react";

const userRoutes = [
  // User Dashboard Routes Only
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
    name: "Loan Application Details",
    key: "loan-application-details",
    route: "/loan/application/:id",
    component: <LoanApplicationDetails />,
    hidden: true,
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
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">account_circle</Icon>,
    route: "/profile",
    component: <Profile />,
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
    component: <UserChat />,
  },
];

export default userRoutes;
