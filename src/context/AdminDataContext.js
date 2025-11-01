/**
 * Admin Data Context - Lazy loaded admin state management
 * This context is only loaded when admin features are accessed
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const AdminDataContext = createContext();
AdminDataContext.displayName = "AdminDataContext";

// Admin-specific action types
const AdminActionTypes = {
  LOAD_USERS: 'LOAD_USERS',
  UPDATE_USER: 'UPDATE_USER',
  LOAD_ADMIN_LOANS: 'LOAD_ADMIN_LOANS',
  APPROVE_LOAN: 'APPROVE_LOAN',
  DENY_LOAN: 'DENY_LOAN',
  LOAD_ADMIN_PAYMENTS: 'LOAD_ADMIN_PAYMENTS',
  REFUND_PAYMENT: 'REFUND_PAYMENT',
  LOAD_ANALYTICS: 'LOAD_ANALYTICS',
  LOAD_AUDIT_LOGS: 'LOAD_AUDIT_LOGS',
  SET_ADMIN_LOADING: 'SET_ADMIN_LOADING',
  SET_ADMIN_ERROR: 'SET_ADMIN_ERROR',
};

// Initial admin state
const initialAdminState = {
  users: [],
  loans: [],
  payments: [],
  analytics: {
    totalUsers: 0,
    totalLoans: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  },
  auditLogs: [],
  system: {
    loading: {},
    errors: {},
  },
};

// Admin reducer
function adminDataReducer(state, action) {
  switch (action.type) {
    case AdminActionTypes.LOAD_USERS:
      return {
        ...state,
        users: action.payload,
      };

    case AdminActionTypes.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        ),
      };

    case AdminActionTypes.LOAD_ADMIN_LOANS:
      return {
        ...state,
        loans: action.payload,
      };

    case AdminActionTypes.APPROVE_LOAN:
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.id ? { ...loan, status: 'approved' } : loan
        ),
      };

    case AdminActionTypes.DENY_LOAN:
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.id 
            ? { ...loan, status: 'denied', denyReason: action.payload.reason } 
            : loan
        ),
      };

    case AdminActionTypes.LOAD_ADMIN_PAYMENTS:
      return {
        ...state,
        payments: action.payload,
      };

    case AdminActionTypes.LOAD_ANALYTICS:
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };

    case AdminActionTypes.LOAD_AUDIT_LOGS:
      return {
        ...state,
        auditLogs: action.payload,
      };

    case AdminActionTypes.SET_ADMIN_LOADING:
      return {
        ...state,
        system: {
          ...state.system,
          loading: { ...state.system.loading, [action.payload.key]: action.payload.value },
        },
      };

    case AdminActionTypes.SET_ADMIN_ERROR:
      return {
        ...state,
        system: {
          ...state.system,
          errors: { ...state.system.errors, [action.payload.key]: action.payload.error },
        },
      };

    default:
      return state;
  }
}

// Admin Context Provider
export function AdminDataProvider({ children }) {
  const [state, dispatch] = useReducer(adminDataReducer, initialAdminState);

  // Lazy load admin API when needed
  const loadAdminAPI = async () => {
    try {
      const { default: adminApi } = await import('../services/adminApi');
      return adminApi;
    } catch (error) {
      console.error('Failed to load admin API:', error);
      return null;
    }
  };

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions: {
      loadUsers: async () => {
        dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'users', value: true } });
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            const users = await adminApi.getUsers();
            dispatch({ type: AdminActionTypes.LOAD_USERS, payload: users });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'users', error: error.message } });
        } finally {
          dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'users', value: false } });
        }
      },

      updateUser: async (id, updates) => {
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            await adminApi.updateUser(id, updates);
            dispatch({ type: AdminActionTypes.UPDATE_USER, payload: { id, ...updates } });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'updateUser', error: error.message } });
        }
      },

      loadAdminLoans: async () => {
        dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'loans', value: true } });
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            const loans = await adminApi.getLoans();
            dispatch({ type: AdminActionTypes.LOAD_ADMIN_LOANS, payload: loans });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'loans', error: error.message } });
        } finally {
          dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'loans', value: false } });
        }
      },

      approveLoan: async (loanId) => {
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            await adminApi.approveLoan(loanId);
            dispatch({ type: AdminActionTypes.APPROVE_LOAN, payload: { id: loanId } });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'approveLoan', error: error.message } });
        }
      },

      denyLoan: async (loanId, reason) => {
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            await adminApi.denyLoan(loanId, reason);
            dispatch({ type: AdminActionTypes.DENY_LOAN, payload: { id: loanId, reason } });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'denyLoan', error: error.message } });
        }
      },

      loadAnalytics: async () => {
        dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'analytics', value: true } });
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            const analytics = await adminApi.getAnalytics();
            dispatch({ type: AdminActionTypes.LOAD_ANALYTICS, payload: analytics });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'analytics', error: error.message } });
        } finally {
          dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'analytics', value: false } });
        }
      },

      loadAuditLogs: async () => {
        dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'audit', value: true } });
        try {
          const adminApi = await loadAdminAPI();
          if (adminApi) {
            const logs = await adminApi.getAuditLogs();
            dispatch({ type: AdminActionTypes.LOAD_AUDIT_LOGS, payload: logs });
          }
        } catch (error) {
          dispatch({ type: AdminActionTypes.SET_ADMIN_ERROR, payload: { key: 'audit', error: error.message } });
        } finally {
          dispatch({ type: AdminActionTypes.SET_ADMIN_LOADING, payload: { key: 'audit', value: false } });
        }
      },
    },
  }), [state]);

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}

// Custom hook to use admin data context
export function useAdminData() {
  const context = useContext(AdminDataContext);
  
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  
  return context;
}

AdminDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AdminActionTypes };
