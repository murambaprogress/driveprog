/**
 * User Data Context - User-specific state management
 * This context excludes all admin functionality to ensure clean separation
 */

import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAppData } from './AppDataContext';

const UserDataContext = createContext();
UserDataContext.displayName = "UserDataContext";

// User Context Provider - filters out admin functionality
export function UserDataProvider({ children }) {
  const { state, actions } = useAppData();
  
  // Only expose user-relevant data and actions
  const userContextValue = useMemo(() => ({
    // User data (safe to expose)
    user: state.user,
    loanApplication: state.loanApplication,
    calculator: state.calculator,
    loans: state.loans,
    payments: state.payments,
    billing: state.billing,
    documents: state.documents,
    support: state.support,
    dashboard: state.dashboard,
    system: {
      // Only expose safe system state
      loading: state.system.loading,
      errors: state.system.errors,
      lastSyncTime: state.system.lastSyncTime,
      connectionStatus: state.system.connectionStatus,
    },
    
    // User-safe actions (no admin actions exposed)
    actions: {
      // User profile actions
      updateUserProfile: actions.updateUserProfile,
      updateUserPreferences: actions.updateUserPreferences,
      
      // Loan application actions
      updateLoanApplication: actions.updateLoanApplication,
      setLoanStatus: actions.setLoanStatus,
      updateLoanStep: actions.updateLoanStep,
      
      // Calculator actions
      updateCalculatorResults: actions.updateCalculatorResults,
      setCalculatorPreferences: actions.setCalculatorPreferences,
      
      // Financial data actions (user view only)
      updateLoans: actions.updateLoans,
      updatePayments: actions.updatePayments,
      updateBilling: actions.updateBilling,
      
      // Document actions
      updateDocuments: actions.updateDocuments,
      
      // Support actions
      updateSupportTickets: actions.updateSupportTickets,
      addSupportTicket: actions.addSupportTicket,
      
      // Dashboard actions
      updateDashboardMetrics: actions.updateDashboardMetrics,
      
      // Safe system actions
      setLoading: actions.setLoading,
      setError: actions.setError,
      clearError: actions.clearError,
    },
  }), [state, actions]);

  return (
    <UserDataContext.Provider value={userContextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

// Custom hook to use user data context
export function useUserDataSafe() {
  const context = useContext(UserDataContext);
  
  if (!context) {
    throw new Error('useUserDataSafe must be used within a UserDataProvider');
  }
  
  return context;
}

// Utility hooks for specific user data domains (admin-safe)
export function useUserProfileSafe() {
  const { user, actions } = useUserDataSafe();
  return {
    user,
    updateProfile: actions.updateUserProfile,
    updatePreferences: actions.updateUserPreferences,
  };
}

export function useLoanDataSafe() {
  const { loans, loanApplication, actions } = useUserDataSafe();
  return {
    loans,
    loanApplication,
    updateLoans: actions.updateLoans,
    updateLoanApplication: actions.updateLoanApplication,
    setLoanStatus: actions.setLoanStatus,
    updateLoanStep: actions.updateLoanStep,
  };
}

export function useCalculatorDataSafe() {
  const { calculator, actions } = useUserDataSafe();
  return {
    calculator,
    updateResults: actions.updateCalculatorResults,
    setPreferences: actions.setCalculatorPreferences,
  };
}

export function useFinancialDataSafe() {
  const { payments, billing, actions } = useUserDataSafe();
  return {
    payments,
    billing,
    updatePayments: actions.updatePayments,
    updateBilling: actions.updateBilling,
  };
}

export function useDashboardDataSafe() {
  const { dashboard, actions } = useUserDataSafe();
  return {
    dashboard,
    updateMetrics: actions.updateDashboardMetrics,
  };
}

export function useSupportDataSafe() {
  const { support, actions } = useUserDataSafe();
  return {
    support,
    updateTickets: actions.updateSupportTickets,
    addTicket: actions.addSupportTicket,
  };
}

UserDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
