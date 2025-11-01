/**
 * Custom hook for managing customer profile data with real-time API integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchCompleteCustomerProfile, 
  updateUserProfile,
  CustomerProfilePoller 
} from '../services/apiService';

export const useCustomerProfile = (userId, options = {}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const pollerRef = useRef(null);
  const { 
    enablePolling = false, 
    pollingInterval = 30000,
    fallbackToStatic = true 
  } = options;

  // Load customer profile from API
  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch complete profile data from API
      const apiData = await fetchCompleteCustomerProfile(userId);
      
      // Ensure we have at least some basic structure
      const safeApiData = {
        userAccount: apiData?.userAccount || null,
        loanApplications: apiData?.loanApplications || [],
        paymentHistory: apiData?.paymentHistory || [],
        documents: apiData?.documents || []
      };

      // Convert API data to profile format
      const profileData = await convertApiDataToProfile(safeApiData, userId);
      setProfile(profileData);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load customer profile:', err);
      
      // Fallback to static data if enabled
      if (fallbackToStatic) {
        const { userProfile } = await import('../layouts/profile/data/userProfile');
        setProfile(userProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, fallbackToStatic]);

  // Update customer profile
  const updateProfile = useCallback(async (updates) => {
    if (!userId || !profile) return;

    try {
      setUpdating(true);
      setError(null);
      
      const updatedData = await updateUserProfile(updates);
      
      // Merge updates with current profile
      setProfile(prev => ({
        ...prev,
        ...updatedData,
        personalInfo: {
          ...prev.personalInfo,
          ...updates.personalInfo
        },
        contact: {
          ...prev.contact,
          ...updates.contact
        },
        employment: {
          ...prev.employment,
          ...updates.employment  
        },
        preferences: {
          ...prev.preferences,
          ...updates.preferences
        }
      }));
      
      setLastUpdated(new Date());
      return updatedData;
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to update customer profile:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [userId, profile]);

  // Refresh profile data
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Setup real-time polling if enabled
  useEffect(() => {
    if (enablePolling && userId && profile) {
      pollerRef.current = new CustomerProfilePoller(
        userId,
        (updatedData) => {
          convertApiDataToProfile(updatedData, userId).then(profileData => {
            setProfile(profileData);
            setLastUpdated(new Date());
          });
        },
        pollingInterval
      );
      
      pollerRef.current.start();
      
      return () => {
        if (pollerRef.current) {
          pollerRef.current.stop();
        }
      };
    }
  }, [enablePolling, userId, profile, pollingInterval]);

  // Load profile on mount and when userId changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop();
      }
    };
  }, []);

  return {
    profile,
    loading,
    error,
    updating,
    lastUpdated,
    updateProfile,
    refreshProfile,
    setProfile
  };
};

/**
 * Convert API data to customer profile format
 * @param {object} apiData - Raw API response data
 * @param {number} userId - User ID
 * @returns {Promise<object>} Formatted customer profile
 */
const convertApiDataToProfile = async (apiData, userId) => {
  const { generateCustomerId, generateLoanNumber } = await import('../utils/customerIdGenerator');
  
  const { userAccount, loanApplications, paymentHistory, documents } = apiData;
  
  // Handle case where userAccount might not be available
  // Create a default user account if needed
  const safeUserAccount = userAccount || {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    created_at: new Date().toISOString()
  };

  // Ensure arrays are properly initialized
  const safeLoanApplications = Array.isArray(loanApplications) ? loanApplications : [];
  const safePaymentHistory = Array.isArray(paymentHistory) ? paymentHistory : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];

  // Generate customer ID
  const customerId = generateCustomerId(userId, safeUserAccount.created_at || new Date());
  
  // Get primary loan application for profile data
  const primaryLoan = safeLoanApplications.find(app => app.status === 'approved') || safeLoanApplications[0];
  
  return {
    customerId,
    accountStatus: getAccountStatus(safeLoanApplications),
    
    // Personal information
    personalInfo: {
      firstName: safeUserAccount.first_name || '',
      lastName: safeUserAccount.last_name || '',
      fullName: `${safeUserAccount.first_name || ''} ${safeUserAccount.last_name || ''}`.trim(),
      dateOfBirth: safeUserAccount.date_of_birth || primaryLoan?.personal_info?.dob || '',
      ssn: primaryLoan?.personal_info?.social_security ? 
           `***-**-${primaryLoan.personal_info.social_security.slice(-4)}` : '',
      driversLicense: primaryLoan?.identification_info?.identification_no || '',
      dlExpiration: '' // Would need additional field
    },
    
    // Contact information
    contact: {
      phone: safeUserAccount.phone_number || primaryLoan?.personal_info?.phone || '',
      email: safeUserAccount.email || primaryLoan?.personal_info?.email || '',
      address: primaryLoan?.address?.street || '',
      city: primaryLoan?.address?.city || '',
      state: primaryLoan?.address?.state || '',
      zipCode: primaryLoan?.address?.zip_code || ''
    },
    
    // Employment information
    employment: {
      employer: primaryLoan?.financial_profile?.income_source || '',
      position: '', // Would need additional field
      monthlyIncome: primaryLoan?.financial_profile?.gross_monthly_income || 0,
      employmentLength: primaryLoan?.financial_profile?.employment_length ? 
                       `${primaryLoan.financial_profile.employment_length} years` : '',
      workPhone: '' // Would need additional field
    },
    
    // Banking information
    banking: {
      bankName: primaryLoan?.personal_info?.banks_name || '',
      accountType: 'Checking',
      routingNumber: '***-***-***',
      accountNumber: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      directDebitAuthorized: primaryLoan?.financial_profile?.direct_deposit === 'Yes'
    },
    
    // Membership details
    membership: {
      joinDate: safeUserAccount.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      customerSince: calculateTimeSince(safeUserAccount.created_at),
      referralSource: 'Online Application',
      creditScore: primaryLoan?.credit_score || 0,
      riskCategory: mapRiskCategory(primaryLoan?.ai_risk_assessment)
    },
    
    // Active loans
    titleLoans: loanApplications
      .filter(app => app.status === 'approved')
      .map((loan, index) => ({
        loanNumber: generateLoanNumber(loan.created_at, index + 1),
        status: 'Current',
        loanAmount: parseFloat(loan.approved_amount || loan.amount),
        currentBalance: calculateCurrentBalance(loan, paymentHistory),
        interestRate: parseFloat(loan.interest_rate || 18.99),
        monthlyPayment: calculateMonthlyPayment(loan),
        monthlyExtension: calculateMonthlyPayment(loan),
        nextPaymentDue: getNextPaymentDate(),
        startDate: loan.approved_at?.split('T')[0] || loan.created_at?.split('T')[0],
        maturityDate: calculateMaturityDate(loan.approved_at || loan.created_at, loan.term || 24),
        totalPaid: calculateTotalPaid(loan, safePaymentHistory),
        paymentsRemaining: calculatePaymentsRemaining(loan, safePaymentHistory),
        
        collateralVehicle: {
          year: parseInt(loan.vehicle_info?.year) || new Date().getFullYear() - 5,
          make: loan.vehicle_info?.make || '',
          model: loan.vehicle_info?.model || '',
          trim: '',
          vin: loan.vehicle_info?.vin || '',
          mileage: loan.vehicle_info?.mileage || 0,
          estimatedValue: parseFloat(loan.applicant_estimated_value || 0),
          loanToValue: calculateLTV(loan.approved_amount || loan.amount, loan.applicant_estimated_value),
          titleStatus: 'Lien - DriveCash Financial',
          registrationState: loan.vehicle_info?.registration_state || loan.address?.state || '',
          licensePlate: loan.vehicle_info?.license_plate || ''
        },
        
        insurance: {
          company: '',
          policyNumber: '',
          expirationDate: '',
          coverageAmount: 25000,
          deductible: 1000,
          driveCashAsAdditionalInsured: true
        }
      })),
    
    // Payment history
    paymentHistory: {
      totalPayments: safePaymentHistory.length,
      onTimePayments: safePaymentHistory.filter(p => p.status === 'completed' && !p.is_late).length,
      latePayments: safePaymentHistory.filter(p => p.is_late).length,
      missedPayments: safePaymentHistory.filter(p => p.status === 'failed').length,
      averagePaymentAmount: calculateAveragePayment(safePaymentHistory),
      lastPaymentDate: getLastPaymentDate(safePaymentHistory),
      lastPaymentAmount: getLastPaymentAmount(safePaymentHistory),
      paymentMethod: primaryLoan?.financial_profile?.direct_deposit === 'Yes' ? 'Auto-Debit' : 'Manual',
      nextPaymentDate: getNextPaymentDate()
    },
    
    // Documents
    documents: safeDocuments.map(doc => ({
      type: formatDocumentType(doc.document_type),
      name: doc.title || doc.file?.split('/').pop() || 'Document',
      status: doc.is_verified ? 'verified' : 'uploaded',
      uploadDate: doc.uploaded_at?.split('T')[0] || '',
      expirationDate: doc.expiration_date || null,
      required: true,
      category: mapDocumentCategory(doc.document_type)
    })),
    
    // User preferences
    preferences: {
      communicationMethod: 'Email & SMS',
      paymentReminders: true,
      marketingEmails: false,
      paperlessStatements: true,
      autoPayEnabled: primaryLoan?.financial_profile?.direct_deposit === 'Yes',
      preferredContactTime: 'Evening (6-8 PM)'
    }
  };
};

// Helper functions for data processing
const getAccountStatus = (loanApplications) => {
  const activeLoans = loanApplications.filter(app => app.status === 'approved');
  if (activeLoans.length > 0) return 'Active - Good Standing';
  if (loanApplications.length > 0) return 'Registered';
  return 'New Customer';
};

const calculateTimeSince = (date) => {
  if (!date) return 'New Customer';
  
  const now = new Date();
  const past = new Date(date);
  const months = (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
  return `${months} month${months !== 1 ? 's' : ''}`;
};

const mapRiskCategory = (aiRisk) => {
  const riskMap = {
    'low': 'Low Risk',
    'medium': 'Standard',
    'high': 'High Risk',
    'very_high': 'Very High Risk'
  };
  return riskMap[aiRisk] || 'Standard';
};

const calculateCurrentBalance = (loan, paymentHistory) => {
  const loanPayments = paymentHistory.filter(p => p.loan_id === loan.id && p.status === 'completed');
  const totalPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  return parseFloat(loan.approved_amount || loan.amount) - totalPaid;
};

const calculateMonthlyPayment = (loan) => {
  const amount = parseFloat(loan.approved_amount || loan.amount);
  const rate = parseFloat(loan.interest_rate || 18.99);
  const term = parseInt(loan.term || 24);
  
  const monthlyRate = (rate / 100) / 12;
  if (monthlyRate === 0) return amount / term;
  
  return amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
         (Math.pow(1 + monthlyRate, term) - 1);
};

const calculateTotalPaid = (loan, paymentHistory) => {
  const loanPayments = paymentHistory.filter(p => p.loan_id === loan.id && p.status === 'completed');
  return loanPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
};

const calculatePaymentsRemaining = (loan, paymentHistory) => {
  const totalTerm = parseInt(loan.term || 24);
  const completedPayments = paymentHistory.filter(p => p.loan_id === loan.id && p.status === 'completed').length;
  return Math.max(0, totalTerm - completedPayments);
};

const calculateLTV = (loanAmount, vehicleValue) => {
  if (!vehicleValue || vehicleValue === 0) return 0;
  return (parseFloat(loanAmount) / parseFloat(vehicleValue)) * 100;
};

const getNextPaymentDate = () => {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  next.setDate(15);
  return next.toISOString().split('T')[0];
};

const calculateMaturityDate = (startDate, termMonths) => {
  const maturity = new Date(startDate);
  maturity.setMonth(maturity.getMonth() + parseInt(termMonths));
  return maturity.toISOString().split('T')[0];
};

const calculateAveragePayment = (paymentHistory) => {
  const completedPayments = paymentHistory.filter(p => p.status === 'completed');
  if (completedPayments.length === 0) return 0;
  const total = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  return total / completedPayments.length;
};

const getLastPaymentDate = (paymentHistory) => {
  const completedPayments = paymentHistory
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  return completedPayments[0]?.payment_date?.split('T')[0] || null;
};

const getLastPaymentAmount = (paymentHistory) => {
  const completedPayments = paymentHistory
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  return parseFloat(completedPayments[0]?.amount || 0);
};

const formatDocumentType = (docType) => {
  const typeMap = {
    'id': 'Driver\'s License',
    'income': 'Proof of Income',
    'address': 'Address Proof',
    'vehicle_title': 'Vehicle Title',
    'vehicle_image': 'Vehicle Photos',
    'other': 'Other Document'
  };
  return typeMap[docType] || 'Document';
};

const mapDocumentCategory = (docType) => {
  const categoryMap = {
    'id': 'identification',
    'income': 'income',
    'address': 'address',
    'vehicle_title': 'collateral',
    'vehicle_image': 'vehicle',
    'other': 'other'
  };
  return categoryMap[docType] || 'other';
};

/**
 * Hook for managing multiple customer profiles (admin view)
 */
export const useCustomerProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use API service to fetch all customer profiles
      const { fetchAllCustomers } = await import('../services/apiService');
      const customersData = await fetchAllCustomers();
      
      // Convert API data to profile list format
      const profilesData = customersData.map(customer => ({
        customerId: customer.customer_id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone_number,
        city: customer.city,
        state: customer.state,
        joinDate: customer.created_at?.split('T')[0],
        status: customer.account_status,
        totalLoans: customer.total_loans || 0,
        currentBalance: customer.current_balance || 0,
        creditScore: customer.credit_score || 0,
        vehicleMake: customer.vehicle_make || '',
        vehicleModel: customer.vehicle_model || ''
      }));
      
      setProfiles(profilesData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load customer profiles:', err);
      
      // Fallback to static data
      const { default: profilesListData } = await import('../layouts/profile/data/profilesListData');
      setProfiles(profilesListData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    loading,
    error,
    refreshProfiles: loadProfiles
  };
};

export default useCustomerProfile;