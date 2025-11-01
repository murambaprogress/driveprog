/**
 * Customer Profile Service
 * Handles fetching and processing customer profile data from loan applications
 */

import { generateCustomerProfile } from '../utils/customerIdGenerator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Fetch customer profile by user ID from multiple API endpoints
 * @param {number} userId - User ID from authentication
 * @returns {Promise<object>} Customer profile data
 */
export const fetchCustomerProfile = async (userId) => {
  try {
    // Get access token from localStorage or context
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Fetch user profile data - updated to use available endpoints
    const [userResponse, loansResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/accounts/profile/`, { headers }),
      fetch(`${API_BASE_URL}/loans/applications/`, { headers }) // Removed user parameter
    ]);

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        throw new Error('Authentication required - please log in');
      }
      throw new Error(`Failed to fetch user profile: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    let loanApplications = [];

    if (loansResponse.ok) {
      loanApplications = await loansResponse.json();
    } else if (loansResponse.status === 401) {
      console.log('Loan applications require authentication');
    }

    // Generate complete profile from API data
    return await buildProfileFromApiData(userData, loanApplications, userId);
    
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return getDefaultCustomerProfile(userId);
  }
};

/**
 * Build customer profile from API responses
 * @param {object} userData - User account data
 * @param {Array} loanApplications - User's loan applications
 * @param {number} userId - User ID
 * @returns {Promise<object>} Complete customer profile
 */
const buildProfileFromApiData = async (userData, loanApplications, userId) => {
  const { generateCustomerId, generateLoanNumber } = await import('../utils/customerIdGenerator');
  
  // Get the most recent or approved loan application
  const mainApplication = loanApplications.find(app => app.status === 'approved') || 
                          loanApplications[0];

  const customerId = generateCustomerId(userId, userData.created_at || new Date());
  
  // Build profile from user data and loan applications
  const profile = {
    customerId,
    accountStatus: mainApplication?.status === 'approved' ? 'Active - Good Standing' : 'Registered',
    
    // Personal information from user account and loan application
    personalInfo: {
      firstName: userData.first_name || mainApplication?.personal_info?.first_name || '',
      lastName: userData.last_name || mainApplication?.personal_info?.last_name || '',
      fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      dateOfBirth: userData.date_of_birth || mainApplication?.personal_info?.dob || '',
      ssn: mainApplication?.personal_info?.social_security ? 
           `***-**-${mainApplication.personal_info.social_security.slice(-4)}` : '',
      driversLicense: mainApplication?.identification_info?.identification_no || '',
      dlExpiration: '' // Would need additional field in backend
    },
    
    // Contact information
    contact: {
      phone: userData.phone_number || mainApplication?.personal_info?.phone || '',
      email: userData.email || mainApplication?.personal_info?.email || '',
      address: mainApplication?.address?.street || '',
      city: mainApplication?.address?.city || '',
      state: mainApplication?.address?.state || '',
      zipCode: mainApplication?.address?.zip_code || ''
    },
    
    // Employment from financial profile
    employment: {
      employer: mainApplication?.financial_profile?.income_source || '',
      position: '', // Would need additional field
      monthlyIncome: mainApplication?.financial_profile?.gross_monthly_income || 0,
      employmentLength: mainApplication?.financial_profile?.employment_length ? 
                       `${mainApplication.financial_profile.employment_length} years` : '',
      workPhone: '' // Would need additional field
    },
    
    // Banking information
    banking: {
      bankName: mainApplication?.personal_info?.banks_name || '',
      accountType: 'Checking', // Default assumption
      routingNumber: '***-***-***', // Masked for security
      accountNumber: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      directDebitAuthorized: mainApplication?.financial_profile?.direct_deposit === 'Yes'
    },
    
    // Membership details
    membership: {
      joinDate: userData.created_at || new Date().toISOString().split('T')[0],
      customerSince: calculateTimeSince(userData.created_at),
      referralSource: 'Online Application',
      creditScore: mainApplication?.credit_score || 0,
      riskCategory: mapRiskCategory(mainApplication?.ai_risk_assessment)
    },
    
    // Active loans
    titleLoans: loanApplications
      .filter(app => app.status === 'approved')
      .map((loan, index) => ({
        loanNumber: generateLoanNumber(loan.created_at, index + 1),
        status: 'Current',
        loanAmount: parseFloat(loan.approved_amount || loan.amount),
        currentBalance: parseFloat(loan.approved_amount || loan.amount) * 0.85, // Assume payments made
        interestRate: parseFloat(loan.interest_rate || 18.99),
        monthlyPayment: calculateMonthlyPayment(
          loan.approved_amount || loan.amount, 
          loan.interest_rate || 18.99, 
          loan.term || 24
        ),
        monthlyExtension: calculateMonthlyPayment(
          loan.approved_amount || loan.amount, 
          loan.interest_rate || 18.99, 
          loan.term || 24
        ),
        nextPaymentDue: getNextPaymentDate(),
        startDate: loan.approved_at || loan.created_at,
        maturityDate: calculateMaturityDate(loan.approved_at || loan.created_at, loan.term || 24),
        totalPaid: 0, // Would need payment tracking
        paymentsRemaining: loan.term || 24,
        
        collateralVehicle: {
          year: parseInt(loan.vehicle_info?.year) || new Date().getFullYear() - 5,
          make: loan.vehicle_info?.make || '',
          model: loan.vehicle_info?.model || '',
          trim: '', // Would need additional field
          vin: loan.vehicle_info?.vin || '',
          mileage: loan.vehicle_info?.mileage || 0,
          estimatedValue: parseFloat(loan.applicant_estimated_value || 0),
          loanToValue: calculateLTV(loan.approved_amount || loan.amount, loan.applicant_estimated_value),
          titleStatus: 'Lien - DriveCash Financial',
          registrationState: loan.vehicle_info?.registration_state || loan.address?.state || '',
          licensePlate: loan.vehicle_info?.license_plate || ''
        },
        
        insurance: {
          company: '', // Would need from documents
          policyNumber: '', // Would need from documents
          expirationDate: '', // Would need from documents
          coverageAmount: 25000,
          deductible: 1000,
          driveCashAsAdditionalInsured: true
        }
      })),
    
    // Payment history (would need separate endpoint)
    paymentHistory: {
      totalPayments: 0,
      onTimePayments: 0,
      latePayments: 0,
      missedPayments: 0,
      averagePaymentAmount: 0,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
      paymentMethod: mainApplication?.financial_profile?.direct_deposit === 'Yes' ? 'Auto-Debit' : 'Manual',
      nextPaymentDate: getNextPaymentDate()
    },
    
    // Documents from loan applications
    documents: await fetchUserDocuments(userId),
    
    // User preferences
    preferences: {
      communicationMethod: 'Email & SMS',
      paymentReminders: true,
      marketingEmails: false,
      paperlessStatements: true,
      autoPayEnabled: mainApplication?.financial_profile?.direct_deposit === 'Yes',
      preferredContactTime: 'Evening (6-8 PM)'
    }
  };

  return profile;
};

/**
 * Fetch all customer profiles (admin view)
 * @returns {Promise<Array>} Array of customer profiles
 */
export const fetchAllCustomerProfiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer profiles');
    }

    const customers = await response.json();
    
    return customers.map(customer => ({
      customerId: customer.customer_id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      state: customer.state,
      joinDate: customer.created_at,
      status: customer.account_status,
      totalLoans: customer.total_loans,
      currentBalance: customer.current_balance,
      creditScore: customer.credit_score,
      vehicleMake: customer.vehicle_make,
      vehicleModel: customer.vehicle_model
    }));
  } catch (error) {
    console.error('Error fetching customer profiles:', error);
    return [];
  }
};

/**
 * Update customer profile
 * @param {number} userId - User ID
 * @param {object} profileData - Updated profile data
 * @returns {Promise<object>} Updated profile
 */
export const updateCustomerProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
};

/**
 * Fetch customer payment history
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Payment history data
 */
export const fetchPaymentHistory = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/payments/?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

/**
 * Fetch customer documents from API
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Documents data
 */
export const fetchCustomerDocuments = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/documents/?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customer documents:', error);
    return [];
  }
};

/**
 * Fetch user documents and format for profile
 * @param {number} userId - User ID  
 * @returns {Promise<Array>} Formatted documents array
 */
const fetchUserDocuments = async (userId) => {
  try {
    const documents = await fetchCustomerDocuments(userId);
    
    return documents.map(doc => ({
      type: formatDocumentType(doc.document_type),
      name: doc.title || doc.file?.split('/').pop() || 'Document',
      status: doc.is_verified ? 'verified' : 'uploaded',
      uploadDate: doc.uploaded_at?.split('T')[0] || '',
      expirationDate: doc.expiration_date || null,
      required: true,
      category: mapDocumentCategory(doc.document_type)
    }));
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return [];
  }
};

// Helper functions for API data processing
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

const calculateMonthlyPayment = (amount, rate, term) => {
  const monthlyRate = (parseFloat(rate) / 100) / 12;
  const numPayments = parseInt(term);
  const principal = parseFloat(amount);
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
};

const calculateLTV = (loanAmount, vehicleValue) => {
  if (!vehicleValue || vehicleValue === 0) return 0;
  return (parseFloat(loanAmount) / parseFloat(vehicleValue)) * 100;
};

const getNextPaymentDate = () => {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  next.setDate(15); // Assume payments due on 15th
  return next.toISOString().split('T')[0];
};

const calculateMaturityDate = (startDate, termMonths) => {
  const maturity = new Date(startDate);
  maturity.setMonth(maturity.getMonth() + parseInt(termMonths));
  return maturity.toISOString().split('T')[0];
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
 * Get default customer profile for users without loan applications
 * @param {number} userId - User ID
 * @returns {object} Default profile structure
 */
const getDefaultCustomerProfile = (userId) => {
  const now = new Date();
  const customerId = `DC-USR-${now.getFullYear()}-${String(userId).padStart(3, '0')}`;
  
  return {
    customerId,
    accountStatus: "Registered - No Active Loans",
    
    personalInfo: {
      firstName: "",
      lastName: "",
      fullName: "",
      dateOfBirth: "",
      ssn: "",
      driversLicense: "",
      dlExpiration: ""
    },
    
    contact: {
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: ""
    },
    
    employment: {
      employer: "",
      position: "",
      monthlyIncome: 0,
      employmentLength: "",
      workPhone: ""
    },
    
    banking: {
      bankName: "",
      accountType: "",
      routingNumber: "",
      accountNumber: "",
      directDebitAuthorized: false
    },
    
    membership: {
      joinDate: now.toISOString().split('T')[0],
      customerSince: "New Customer",
      referralSource: "",
      creditScore: 0,
      riskCategory: "Not Assessed"
    },
    
    titleLoans: [],
    
    paymentHistory: {
      totalPayments: 0,
      onTimePayments: 0,
      latePayments: 0,
      missedPayments: 0,
      averagePaymentAmount: 0,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
      paymentMethod: "",
      nextPaymentDate: null
    },
    
    documents: [],
    
    preferences: {
      communicationMethod: "Email",
      paymentReminders: true,
      marketingEmails: true,
      paperlessStatements: true,
      autoPayEnabled: false,
      preferredContactTime: "Any Time"
    }
  };
};

/**
 * Search customers by various criteria
 * @param {string} query - Search query
 * @param {string} field - Field to search in (name, email, phone, customerId)
 * @returns {Promise<Array>} Matching customer profiles
 */
export const searchCustomers = async (query, field = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers/search/?q=${encodeURIComponent(query)}&field=${field}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search customers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
};

export default {
  fetchCustomerProfile,
  fetchAllCustomerProfiles,
  updateCustomerProfile,
  fetchPaymentHistory,
  fetchCustomerDocuments,
  searchCustomers
};