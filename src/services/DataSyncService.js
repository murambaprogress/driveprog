/**
 * Data Synchronization Service
 * Handles cross-component data correlations and real-time updates
 */

import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { methodToString } from '../utils/methodUtils';

// Mock data for demonstration - in production these would come from API calls
const mockData = {
  userProfile: {},
  activeLoans: [],
  paymentHistory: [],
  documents: [],
  supportTickets: []
};

// Data correlation service
export class DataSyncService {
  constructor(appDataContext) {
    this.context = appDataContext;
  }

  // Initialize all data relationships
  async initializeData() {
    const { actions } = this.context;

    try {
      // Load user profile
      actions.updateUserProfile(mockData.userProfile);

      // Calculate and update loan metrics
      const loanMetrics = this.calculateLoanMetrics(mockData.activeLoans);
      actions.updateLoans(loanMetrics);

      // Update payment data
      const paymentMetrics = this.calculatePaymentMetrics(mockData.paymentHistory);
      actions.updatePayments(paymentMetrics);

      // Update billing information
      const billingInfo = this.calculateBillingInfo(mockData.activeLoans, mockData.paymentHistory);
      actions.updateBilling(billingInfo);

      // Update documents
      const documentMetrics = this.organizeDocuments(mockData.documents);
      actions.updateDocuments(documentMetrics);

      // Update support tickets
      const supportMetrics = this.organizeSupportTickets(mockData.supportTickets);
      actions.updateSupportTickets(supportMetrics);

      // Calculate dashboard metrics
      const dashboardMetrics = this.calculateDashboardMetrics(
        mockData.activeLoans, 
        mockData.paymentHistory, 
        mockData.supportTickets
      );
      actions.updateDashboardMetrics(dashboardMetrics);

      return true;
    } catch (error) {
      console.error('Error initializing data:', error);
      actions.setError('initialization', error.message);
      return false;
    }
  }

  // Calculate comprehensive loan metrics
  calculateLoanMetrics(loans) {
    const active = loans.filter(loan => loan.status === 'active');
    const total = loans.length;
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const currentBalance = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    
    // Find next payment date
    const upcomingPayments = active
      .map(loan => ({ ...loan, paymentDate: new Date(loan.nextPaymentDate) }))
      .sort((a, b) => a.paymentDate - b.paymentDate);
    
    const nextPaymentDate = upcomingPayments.length > 0 
      ? upcomingPayments[0].nextPaymentDate 
      : null;

    return {
      active,
      completed: loans.filter(loan => loan.status === 'completed'),
      pending: loans.filter(loan => loan.status === 'pending'),
      total,
      totalBorrowed,
      totalPaid: totalBorrowed - currentBalance,
      currentBalance,
      nextPaymentDate,
      lastPaymentDate: null // Would be calculated from payment history
    };
  }

  // Calculate payment metrics
  calculatePaymentMetrics(payments) {
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalMade = completedPayments.length;
    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const lastPayment = completedPayments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];

  // Get unique payment methods (safe normalize)
  const paymentMethods = [...new Set(completedPayments.map(p => methodToString(p.method) || p.method))];

    return {
      history: payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)),
      upcoming: [], // Would be calculated from loan data
      overdue: [], // Would be calculated based on current date
      totalMade,
      lastPaymentAmount: lastPayment ? lastPayment.amount : 0,
      paymentMethods: paymentMethods.map(method => ({ name: method, active: true }))
    };
  }

  // Calculate billing information
  calculateBillingInfo(loans, payments) {
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const currentBalance = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const monthlyPayment = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    
    // Find next due date
    const nextDueDate = activeLoans.length > 0 
      ? activeLoans.sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))[0].nextPaymentDate
      : null;

    return {
      currentBalance,
      monthlyPayment,
      nextDueDate,
      autopayEnabled: false,
      billingAddress: null,
      invoices: [] // Would be generated from loan and payment data
    };
  }

  // Organize documents by category
  organizeDocuments(documents) {
    const categories = {
      identity: documents.filter(doc => doc.category === 'identity'),
      income: documents.filter(doc => doc.category === 'income'),
      vehicle: documents.filter(doc => doc.category === 'vehicle'),
      insurance: documents.filter(doc => doc.category === 'insurance')
    };

    return {
      uploaded: documents,
      required: [], // Would be determined by loan requirements
      verified: documents.filter(doc => doc.status === 'verified'),
      pending: documents.filter(doc => doc.status === 'pending'),
      categories
    };
  }

  // Organize support tickets
  organizeSupportTickets(tickets) {
    return {
      tickets: tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)),
      openTickets: tickets.filter(t => t.status === 'open').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      lastContactDate: tickets.length > 0 
        ? tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0].createdDate
        : null,
      preferredContactMethod: 'email'
    };
  }

  // Calculate comprehensive dashboard metrics
  calculateDashboardMetrics(loans, payments, tickets) {
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const currentBalance = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    
    // Calculate payment history for chart
    const paymentHistory = payments
      .filter(p => p.status === 'completed')
      .slice(-12) // Last 12 payments
      .map(p => ({
        date: p.paymentDate,
        amount: p.amount,
        loanId: p.loanId
      }));

    // Determine account health
    const overduePeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const now = new Date().getTime();
    const hasOverduePayments = activeLoans.some(loan => {
      const dueDate = new Date(loan.nextPaymentDate).getTime();
      return dueDate < (now - overduePeriod);
    });

    const accountHealth = hasOverduePayments ? 'critical' : 
                         currentBalance > totalBorrowed * 0.8 ? 'warning' : 'good';

    // Create recent activity
    const recentActivity = [
      ...payments.slice(-3).map(p => ({
        type: 'payment',
        description: `Payment of $${p.amount} processed`,
        date: p.paymentDate,
        amount: p.amount
      })),
      ...tickets.slice(-2).map(t => ({
        type: 'support',
        description: t.subject,
        date: t.createdDate,
        status: t.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalBorrowed,
      currentBalance,
      creditScore: null, // Would come from credit service
      paymentHistory,
      accountHealth,
      recentActivity,
      quickStats: {
        nextPaymentAmount: activeLoans.length > 0 
          ? activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0) 
          : 0,
        openSupportTickets: tickets.filter(t => t.status === 'open').length,
        documentsVerified: 3, // From mock data
        lastLoginDate: new Date().toISOString()
      }
    };
  }

  // Correlate loan application with calculator results
  correlateLoanApplicationData(calculatorResults, applicationData) {
    if (!calculatorResults || !applicationData) return applicationData;

    // Pre-fill application with calculator results
    const correlatedData = {
      ...applicationData,
      personal: {
        ...applicationData.personal,
        loanAmount: calculatorResults.loanAmount
      },
      vehicle: {
        ...applicationData.vehicle,
        estimatedCarValue: calculatorResults.vehicleValue
      }
    };

    return correlatedData;
  }

  // Real-time data update handler
  handleDataUpdate(dataType, data) {
    const { actions } = this.context;

    switch (dataType) {
      case 'loan_application':
        actions.updateLoanApplication(data);
        break;
      case 'calculator_results':
        actions.updateCalculatorResults(data);
        break;
      case 'payment_made':
        this.handlePaymentUpdate(data);
        break;
      case 'document_uploaded':
        this.handleDocumentUpdate(data);
        break;
      case 'support_ticket':
        actions.addSupportTicket(data);
        break;
      default:
        console.warn(`Unknown data type: ${dataType}`);
    }
  }

  // Handle payment updates and recalculate related metrics
  handlePaymentUpdate(paymentData) {
    const { state, actions } = this.context;
    
    // Add to payment history
    const updatedPayments = {
      ...state.payments,
      history: [paymentData, ...state.payments.history],
      totalMade: state.payments.totalMade + 1,
      lastPaymentAmount: paymentData.amount
    };
    
    actions.updatePayments(updatedPayments);

    // Update loan balance
    const updatedLoans = state.loans.active.map(loan => {
      if (loan.id === paymentData.loanId) {
        return {
          ...loan,
          currentBalance: Math.max(0, loan.currentBalance - paymentData.amount)
        };
      }
      return loan;
    });

    const loanMetrics = this.calculateLoanMetrics(updatedLoans);
    actions.updateLoans(loanMetrics);

    // Recalculate dashboard metrics
    const dashboardMetrics = this.calculateDashboardMetrics(
      updatedLoans, 
      updatedPayments.history, 
      state.support.tickets
    );
    actions.updateDashboardMetrics(dashboardMetrics);
  }

  // Handle document updates
  handleDocumentUpdate(documentData) {
    const { state, actions } = this.context;
    
    const updatedDocuments = {
      ...state.documents,
      uploaded: [documentData, ...state.documents.uploaded],
      categories: {
        ...state.documents.categories,
        [documentData.category]: [
          documentData, 
          ...state.documents.categories[documentData.category]
        ]
      }
    };

    actions.updateDocuments(updatedDocuments);
  }
}

// Hook to use the DataSyncService
export function useDataSync() {
  const appDataContext = useAppData();
  // Keep a stable instance of DataSyncService across renders. The service
  // references the appDataContext when methods are called rather than at
  // construction time, so we can store it in a ref to avoid re-creating it.
  const ref = React.useRef(null);
  if (!ref.current) {
    ref.current = new DataSyncService(appDataContext);
  } else {
    // update context reference on existing instance so methods see latest state
    ref.current.context = appDataContext;
  }

  const initializeData = React.useCallback(() => ref.current.initializeData(), []);
  const handleDataUpdate = React.useCallback((type, data) => ref.current.handleDataUpdate(type, data), []);
  const correlateLoanApplication = React.useCallback((calculator, application) => 
    ref.current.correlateLoanApplicationData(calculator, application), []);

  return {
    initializeData,
    handleDataUpdate,
    correlateLoanApplication,
    service: ref.current,
  };
}

export default DataSyncService;
