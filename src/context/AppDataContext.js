/**
 * Global Application Data Context
 * Manages data synchronization across all dashboard components
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import adminDataService from 'services/adminDataService';
import PropTypes from 'prop-types';

const AppDataContext = createContext();
AppDataContext.displayName = "AppDataContext";

// Action types for data synchronization
const ActionTypes = {
  // User data
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  
  // Loan application data
  UPDATE_LOAN_APPLICATION: 'UPDATE_LOAN_APPLICATION',
  SET_LOAN_STATUS: 'SET_LOAN_STATUS',
  UPDATE_LOAN_STEP: 'UPDATE_LOAN_STEP',
  
  // Calculator data
  UPDATE_CALCULATOR_RESULTS: 'UPDATE_CALCULATOR_RESULTS',
  SET_CALCULATOR_PREFERENCES: 'SET_CALCULATOR_PREFERENCES',
  
  // Financial data
  UPDATE_LOANS: 'UPDATE_LOANS',
  UPDATE_PAYMENTS: 'UPDATE_PAYMENTS',
  UPDATE_BILLING: 'UPDATE_BILLING',
  
  // Documents
  UPDATE_DOCUMENTS: 'UPDATE_DOCUMENTS',
  
  // Support data
  UPDATE_SUPPORT_TICKETS: 'UPDATE_SUPPORT_TICKETS',
  ADD_SUPPORT_TICKET: 'ADD_SUPPORT_TICKET',
  
  // Dashboard metrics
  UPDATE_DASHBOARD_METRICS: 'UPDATE_DASHBOARD_METRICS',
  
  // Global loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial application state
const initialState = {
  user: {
    profile: {
      id: null,
      fullName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
  // role: 'user' or 'admin' - used for simple role based UI guards
  role: 'user',
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en'
      }
    },
    isAuthenticated: true, // For demo purposes
    lastLogin: new Date().toISOString(),
  },
  
  loanApplication: {
    currentStep: 0,
    completionPercentage: 0,
    status: 'draft', // draft, submitted, approved, rejected, pending
    data: {
      personal: {},
      income: {},
      vehicle: {},
      photos: {},
      condition: {}
    },
    submittedAt: null,
    lastUpdated: new Date().toISOString(),
  },
  
  calculator: {
    lastCalculation: null,
    savedCalculations: [],
    preferences: {
      defaultLoanAmount: 5000,
      defaultVehicleValue: 10000,
      showAdvancedOptions: false
    },
    history: []
  },
  
  loans: {
    active: [],
    completed: [],
    pending: [],
    total: 0,
    totalBorrowed: 0,
    totalPaid: 0,
    lastPaymentDate: null,
    nextPaymentDate: null,
    currentBalance: 0
  },
  
  payments: {
    history: [],
    upcoming: [],
    overdue: [],
    totalMade: 0,
    lastPaymentAmount: 0,
    paymentMethods: []
  },
  
  billing: {
    currentBalance: 0,
    monthlyPayment: 0,
    nextDueDate: null,
    autopayEnabled: false,
    billingAddress: null,
    invoices: []
  },
  
  documents: {
    uploaded: [],
    required: [],
    verified: [],
    pending: [],
    categories: {
      identity: [],
      income: [],
      vehicle: [],
      insurance: []
    }
  },
  
  support: {
    tickets: [],
    openTickets: 0,
    resolvedTickets: 0,
    lastContactDate: null,
    preferredContactMethod: 'email'
  },
  
  dashboard: {
    metrics: {
      totalLoans: 0,
      activeLoans: 0,
      totalBorrowed: 0,
      currentBalance: 0,
      creditScore: null,
      paymentHistory: [],
      accountHealth: 'good' // good, warning, critical
    },
    notifications: [],
    recentActivity: [],
    quickStats: {}
  },
  
  system: {
    loading: {},
    errors: {},
    lastSyncTime: new Date().toISOString(),
    connectionStatus: 'online'
  }
};

// Reducer function for managing application state
function appDataReducer(state, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          profile: { ...state.user.profile, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            preferences: { ...state.user.profile.preferences, ...action.payload }
          }
        }
      };
      
    case ActionTypes.UPDATE_LOAN_APPLICATION:
      return {
        ...state,
        loanApplication: {
          ...state.loanApplication,
          data: { ...state.loanApplication.data, ...action.payload },
          lastUpdated: new Date().toISOString()
        }
      };
      
    case ActionTypes.SET_LOAN_STATUS:
      return {
        ...state,
        loanApplication: {
          ...state.loanApplication,
          status: action.payload.status,
          ...(action.payload.submittedAt && { submittedAt: action.payload.submittedAt })
        }
      };
      
    case ActionTypes.UPDATE_LOAN_STEP:
      return {
        ...state,
        loanApplication: {
          ...state.loanApplication,
          currentStep: action.payload.step,
          completionPercentage: action.payload.percentage
        }
      };
      
    case ActionTypes.UPDATE_CALCULATOR_RESULTS:
      return {
        ...state,
        calculator: {
          ...state.calculator,
          lastCalculation: {
            ...action.payload,
            timestamp: new Date().toISOString()
          },
          history: [
            ...state.calculator.history.slice(-9), // Keep last 10 calculations
            { ...action.payload, timestamp: new Date().toISOString() }
          ]
        }
      };
      
    case ActionTypes.SET_CALCULATOR_PREFERENCES:
      return {
        ...state,
        calculator: {
          ...state.calculator,
          preferences: { ...state.calculator.preferences, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_LOANS:
      const loanData = action.payload;
      return {
        ...state,
        loans: { ...state.loans, ...loanData },
        billing: {
          ...state.billing,
          currentBalance: loanData.currentBalance || state.billing.currentBalance,
          nextDueDate: loanData.nextPaymentDate || state.billing.nextDueDate
        },
        dashboard: {
          ...state.dashboard,
          metrics: {
            ...state.dashboard.metrics,
            totalLoans: loanData.total || state.dashboard.metrics.totalLoans,
            activeLoans: loanData.active?.length || state.dashboard.metrics.activeLoans,
            currentBalance: loanData.currentBalance || state.dashboard.metrics.currentBalance
          }
        }
      };
      
    case ActionTypes.UPDATE_PAYMENTS:
      const paymentData = action.payload;
      return {
        ...state,
        payments: { ...state.payments, ...paymentData },
        dashboard: {
          ...state.dashboard,
          metrics: {
            ...state.dashboard.metrics,
            paymentHistory: paymentData.history || state.dashboard.metrics.paymentHistory
          }
        }
      };
      
    case ActionTypes.UPDATE_BILLING:
      return {
        ...state,
        billing: { ...state.billing, ...action.payload }
      };
      
    case ActionTypes.UPDATE_DOCUMENTS:
      return {
        ...state,
        documents: { ...state.documents, ...action.payload }
      };
      
    case ActionTypes.UPDATE_SUPPORT_TICKETS:
      const supportData = action.payload;
      return {
        ...state,
        support: {
          ...state.support,
          tickets: supportData.tickets || state.support.tickets,
          openTickets: supportData.openTickets || state.support.openTickets,
          resolvedTickets: supportData.resolvedTickets || state.support.resolvedTickets,
          lastContactDate: supportData.lastContactDate || state.support.lastContactDate
        }
      };
      
    case ActionTypes.ADD_SUPPORT_TICKET:
      return {
        ...state,
        support: {
          ...state.support,
          tickets: [action.payload, ...state.support.tickets],
          openTickets: state.support.openTickets + 1
        }
      };
      
    case ActionTypes.UPDATE_DASHBOARD_METRICS:
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          metrics: { ...state.dashboard.metrics, ...action.payload }
        }
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        system: {
          ...state.system,
          loading: { ...state.system.loading, [action.payload.key]: action.payload.value }
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        system: {
          ...state.system,
          errors: { ...state.system.errors, [action.payload.key]: action.payload.error }
        }
      };
      
    case ActionTypes.CLEAR_ERROR:
      const newErrors = { ...state.system.errors };
      delete newErrors[action.payload.key];
      return {
        ...state,
        system: {
          ...state.system,
          errors: newErrors
        }
      };
      
    default:
      return state;
  }
}

// Context Provider Component
export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appDataReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Load user preferences
        const userPrefs = localStorage.getItem('userPreferences');
        if (userPrefs) {
          const preferences = JSON.parse(userPrefs);
          dispatch({
            type: ActionTypes.UPDATE_USER_PREFERENCES,
            payload: preferences
          });
        }

        // Load calculator preferences
        const calcPrefs = localStorage.getItem('calculatorPreferences');
        if (calcPrefs) {
          const preferences = JSON.parse(calcPrefs);
          dispatch({
            type: ActionTypes.SET_CALCULATOR_PREFERENCES,
            payload: preferences
          });
        }

        // Load calculator history
        const calcHistory = localStorage.getItem('calculatorHistory');
        if (calcHistory) {
          const history = JSON.parse(calcHistory);
          dispatch({
            type: ActionTypes.UPDATE_CALCULATOR_RESULTS,
            payload: { history }
          });
        }

        // Simulate loading initial app data
        dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'initial', value: false } });
      } catch (error) {
        console.error('Error loading persisted data:', error);
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: { key: 'initialization', error: error.message }
        });
      }
    };

    loadPersistedData();
    // Load admin-configured calculator settings and apply them to calculator preferences
    try {
      const adminSettings = adminDataService.getSettings();
      if (adminSettings) {
        const prefs = {
          defaultLoanAmount: adminSettings.defaultLoanAmount || adminSettings.minLoanAmount || 5000,
          defaultVehicleValue: adminSettings.defaultVehicleValue || 10000,
          maxLoanAmount: adminSettings.maxLoanAmount,
          minLoanAmount: adminSettings.minLoanAmount,
          defaultInterestRate: adminSettings.defaultInterestRate,
          maxLoanTerm: adminSettings.maxLoanTerm
        };
        dispatch({ type: ActionTypes.SET_CALCULATOR_PREFERENCES, payload: prefs });
      }
    } catch (e) {
      // ignore
    }

    // Listen for admin settings updates and map to calculator preferences
    const onAdminSettings = (e) => {
      const settings = (e && e.detail) ? e.detail : adminDataService.getSettings();
      if (!settings) return;
      const prefs = {
        defaultLoanAmount: settings.defaultLoanAmount || settings.minLoanAmount || 5000,
        defaultVehicleValue: settings.defaultVehicleValue || 10000,
        maxLoanAmount: settings.maxLoanAmount,
        minLoanAmount: settings.minLoanAmount,
        defaultInterestRate: settings.defaultInterestRate,
        maxLoanTerm: settings.maxLoanTerm
      };
      dispatch({ type: ActionTypes.SET_CALCULATOR_PREFERENCES, payload: prefs });
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('adminSettingsUpdated', onAdminSettings);
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('adminSettingsUpdated', onAdminSettings);
      }
    };
  }, []);

  // Persist important data changes
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(state.user.profile.preferences));
  }, [state.user.profile.preferences]);

  useEffect(() => {
    localStorage.setItem('calculatorPreferences', JSON.stringify(state.calculator.preferences));
  }, [state.calculator.preferences]);

  useEffect(() => {
    if (state.calculator.history.length > 0) {
      localStorage.setItem('calculatorHistory', JSON.stringify(state.calculator.history));
    }
  }, [state.calculator.history]);

  // Memoized value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions: {
      // User actions
      updateUserProfile: (data) => dispatch({
        type: ActionTypes.UPDATE_USER_PROFILE,
        payload: data
      }),
      updateUserPreferences: (prefs) => dispatch({
        type: ActionTypes.UPDATE_USER_PREFERENCES,
        payload: prefs
      }),
      
      // Loan application actions
      updateLoanApplication: (data) => dispatch({
        type: ActionTypes.UPDATE_LOAN_APPLICATION,
        payload: data
      }),
      setLoanStatus: (status, submittedAt = null) => dispatch({
        type: ActionTypes.SET_LOAN_STATUS,
        payload: { status, submittedAt }
      }),
      updateLoanStep: (step, percentage) => dispatch({
        type: ActionTypes.UPDATE_LOAN_STEP,
        payload: { step, percentage }
      }),
      
      // Calculator actions
      updateCalculatorResults: (results) => dispatch({
        type: ActionTypes.UPDATE_CALCULATOR_RESULTS,
        payload: results
      }),
      setCalculatorPreferences: (prefs) => dispatch({
        type: ActionTypes.SET_CALCULATOR_PREFERENCES,
        payload: prefs
      }),
      
      // Financial data actions
      updateLoans: (data) => dispatch({
        type: ActionTypes.UPDATE_LOANS,
        payload: data
      }),
      updatePayments: (data) => dispatch({
        type: ActionTypes.UPDATE_PAYMENTS,
        payload: data
      }),
      updateBilling: (data) => dispatch({
        type: ActionTypes.UPDATE_BILLING,
        payload: data
      }),
      
      // Document actions
      updateDocuments: (data) => dispatch({
        type: ActionTypes.UPDATE_DOCUMENTS,
        payload: data
      }),
      
      // Support actions
      updateSupportTickets: (data) => dispatch({
        type: ActionTypes.UPDATE_SUPPORT_TICKETS,
        payload: data
      }),
      addSupportTicket: (ticket) => dispatch({
        type: ActionTypes.ADD_SUPPORT_TICKET,
        payload: { ...ticket, id: Date.now(), createdAt: new Date().toISOString() }
      }),
      
      // Dashboard actions
      updateDashboardMetrics: (metrics) => dispatch({
        type: ActionTypes.UPDATE_DASHBOARD_METRICS,
        payload: metrics
      }),
      
      // System actions
      setLoading: (key, value) => dispatch({
        type: ActionTypes.SET_LOADING,
        payload: { key, value }
      }),
      setError: (key, error) => dispatch({
        type: ActionTypes.SET_ERROR,
        payload: { key, error }
      }),
      clearError: (key) => dispatch({
        type: ActionTypes.CLEAR_ERROR,
        payload: { key }
      })
    }
  }), [state]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

// Custom hook to use the AppDataContext
export function useAppData() {
  const context = useContext(AppDataContext);
  
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  
  return context;
}

// Utility hooks for specific data domains
export function useUserData() {
  const { state, actions } = useAppData();
  return {
    user: state.user,
    updateProfile: actions.updateUserProfile,
    updatePreferences: actions.updateUserPreferences
  };
}

export function useLoanData() {
  const { state, actions } = useAppData();
  return {
    loans: state.loans,
    loanApplication: state.loanApplication,
    updateLoans: actions.updateLoans,
    updateLoanApplication: actions.updateLoanApplication,
    setLoanStatus: actions.setLoanStatus,
    updateLoanStep: actions.updateLoanStep
  };
}

export function useCalculatorData() {
  const { state, actions } = useAppData();
  return {
    calculator: state.calculator,
    updateResults: actions.updateCalculatorResults,
    setPreferences: actions.setCalculatorPreferences
  };
}

export function useFinancialData() {
  const { state, actions } = useAppData();
  return {
    payments: state.payments,
    billing: state.billing,
    updatePayments: actions.updatePayments,
    updateBilling: actions.updateBilling
  };
}

export function useDashboardData() {
  const { state, actions } = useAppData();
  return {
    dashboard: state.dashboard,
    updateMetrics: actions.updateDashboardMetrics
  };
}

export function useSupportData() {
  const { state, actions } = useAppData();
  return {
    support: state.support,
    updateTickets: actions.updateSupportTickets,
    addTicket: actions.addSupportTicket
  };
}

// PropTypes
AppDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ActionTypes };
