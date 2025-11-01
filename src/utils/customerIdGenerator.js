/**
 * Customer ID Generator Utility
 * Generates unique customer IDs based on DriveCash patterns
 */

/**
 * Generate customer ID in format: DC-USR-YYYY-XXX
 * @param {number} userId - User's database ID
 * @param {string|Date} joinDate - Date when user joined (ISO string or Date object)
 * @returns {string} Generated customer ID
 */
export const generateCustomerId = (userId, joinDate) => {
  const year = new Date(joinDate).getFullYear();
  const userNum = String(userId).padStart(3, '0');
  return `DC-USR-${year}-${userNum}`;
};

/**
 * Generate loan number in format: DC-TL-YYYY-MM-XXX
 * @param {string|Date} applicationDate - Date when loan was applied for
 * @param {number} sequenceNumber - Sequential number for that month
 * @returns {string} Generated loan number
 */
export const generateLoanNumber = (applicationDate, sequenceNumber) => {
  const date = new Date(applicationDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seqNum = String(sequenceNumber).padStart(3, '0');
  return `DC-TL-${year}-${month}-${seqNum}`;
};

/**
 * Generate application ID UUID-like format for tracking
 * @param {string|Date} applicationDate - Application submission date
 * @returns {string} Generated application ID
 */
export const generateApplicationId = (applicationDate) => {
  const date = new Date(applicationDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  return `DC-APP-${year}${month}${day}-${timestamp}`;
};

/**
 * Parse customer ID to extract information
 * @param {string} customerId - Customer ID to parse
 * @returns {object} Parsed information
 */
export const parseCustomerId = (customerId) => {
  const parts = customerId.split('-');
  if (parts.length !== 4 || parts[0] !== 'DC' || parts[1] !== 'USR') {
    return null;
  }
  
  return {
    prefix: parts[0],
    type: parts[1],
    year: parseInt(parts[2]),
    sequence: parseInt(parts[3])
  };
};

/**
 * Validate customer ID format
 * @param {string} customerId - Customer ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidCustomerId = (customerId) => {
  const pattern = /^DC-USR-\d{4}-\d{3}$/;
  return pattern.test(customerId);
};

/**
 * Generate customer profile from loan application data
 * @param {object} loanApplication - Loan application object from backend
 * @param {number} userId - User ID from accounts system
 * @returns {object} Customer profile object
 */
export const generateCustomerProfile = (loanApplication, userId) => {
  const customerId = generateCustomerId(userId, loanApplication.created_at);
  const loanNumber = generateLoanNumber(loanApplication.created_at, 1);
  
  // Extract personal info
  const personalInfo = loanApplication.personal_info || {};
  const address = loanApplication.address || {};
  const financial = loanApplication.financial_profile || {};
  const vehicle = loanApplication.vehicle_info || {};
  const identification = loanApplication.identification_info || {};
  
  return {
    customerId,
    accountStatus: loanApplication.status === 'approved' ? 'Active - Good Standing' : 'Pending',
    
    personalInfo: {
      firstName: personalInfo.first_name || '',
      lastName: personalInfo.last_name || '',
      fullName: `${personalInfo.first_name || ''} ${personalInfo.last_name || ''}`.trim(),
      dateOfBirth: personalInfo.dob || '',
      ssn: personalInfo.social_security ? `***-**-${personalInfo.social_security.slice(-4)}` : '',
      driversLicense: identification.identification_no || '',
      dlExpiration: '' // Would need additional field in backend
    },
    
    contact: {
      phone: personalInfo.phone || '',
      email: personalInfo.email || '',
      address: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zip_code || ''
    },
    
    employment: {
      employer: financial.income_source || '',
      position: '', // Would need additional field
      monthlyIncome: financial.gross_monthly_income || 0,
      employmentLength: financial.employment_length ? `${financial.employment_length} years` : '',
      workPhone: '' // Would need additional field
    },
    
    banking: {
      bankName: personalInfo.banks_name || '',
      accountType: 'Checking', // Default assumption
      routingNumber: '***-***-***', // Masked for security
      accountNumber: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      directDebitAuthorized: financial.direct_deposit === 'Yes'
    },
    
    membership: {
      joinDate: loanApplication.created_at,
      customerSince: calculateTimeSince(loanApplication.created_at),
      referralSource: 'Online Application',
      creditScore: loanApplication.credit_score || 0,
      riskCategory: mapRiskCategory(loanApplication.ai_risk_assessment)
    },
    
    titleLoans: loanApplication.status === 'approved' ? [{
      loanNumber,
      status: 'Current',
      loanAmount: parseFloat(loanApplication.approved_amount || loanApplication.amount),
      currentBalance: parseFloat(loanApplication.approved_amount || loanApplication.amount) * 0.85, // Assume some payments made
      interestRate: parseFloat(loanApplication.interest_rate || 18.99),
      monthlyPayment: calculateMonthlyPayment(loanApplication.approved_amount || loanApplication.amount, loanApplication.interest_rate || 18.99, loanApplication.term || 24),
      monthlyExtension: calculateMonthlyPayment(loanApplication.approved_amount || loanApplication.amount, loanApplication.interest_rate || 18.99, loanApplication.term || 24),
      nextPaymentDue: getNextPaymentDate(),
      startDate: loanApplication.approved_at || loanApplication.created_at,
      maturityDate: calculateMaturityDate(loanApplication.approved_at || loanApplication.created_at, loanApplication.term || 24),
      totalPaid: 0, // Would need payment tracking
      paymentsRemaining: loanApplication.term || 24,
      
      collateralVehicle: {
        year: parseInt(vehicle.year) || new Date().getFullYear() - 5,
        make: vehicle.make || '',
        model: vehicle.model || '',
        trim: '', // Would need additional field
        vin: vehicle.vin || '',
        mileage: vehicle.mileage || 0,
        estimatedValue: parseFloat(loanApplication.applicant_estimated_value || 0),
        loanToValue: calculateLTV(loanApplication.approved_amount || loanApplication.amount, loanApplication.applicant_estimated_value),
        titleStatus: 'Lien - DriveCash Financial',
        registrationState: vehicle.registration_state || address.state || '',
        licensePlate: vehicle.license_plate || ''
      },
      
      insurance: {
        company: '', // Would need from documents
        policyNumber: '', // Would need from documents
        expirationDate: '', // Would need from documents
        coverageAmount: 25000, // Default assumption
        deductible: 1000, // Default assumption
        driveCashAsAdditionalInsured: true
      }
    }] : [],
    
    paymentHistory: {
      totalPayments: 0,
      onTimePayments: 0,
      latePayments: 0,
      missedPayments: 0,
      averagePaymentAmount: 0,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
      paymentMethod: financial.direct_deposit === 'Yes' ? 'Auto-Debit' : 'Manual',
      nextPaymentDate: getNextPaymentDate()
    },
    
    documents: generateDocumentsList(loanApplication),
    
    preferences: {
      communicationMethod: 'Email & SMS',
      paymentReminders: true,
      marketingEmails: false,
      paperlessStatements: true,
      autoPayEnabled: financial.direct_deposit === 'Yes',
      preferredContactTime: 'Evening (6-8 PM)'
    }
  };
};

// Helper functions
const calculateTimeSince = (date) => {
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

const generateDocumentsList = (loanApplication) => {
  const docs = [];
  const personalInfo = loanApplication.personal_info || {};
  const vehicle = loanApplication.vehicle_info || {};
  const identification = loanApplication.identification_info || {};
  
  // Standard required documents
  if (vehicle.make && vehicle.model) {
    docs.push({
      type: "Vehicle Title",
      name: `${identification.id_issuing_agency || 'State'} Certificate of Title - ${vehicle.make} ${vehicle.model}`,
      status: "verified",
      uploadDate: loanApplication.created_at,
      expirationDate: null,
      required: true,
      category: "collateral"
    });
  }
  
  if (personalInfo.first_name && personalInfo.last_name) {
    docs.push({
      type: "Driver's License",
      name: `${identification.id_issuing_agency || 'State'} Driver License - ${personalInfo.first_name} ${personalInfo.last_name}`,
      status: "verified",
      uploadDate: loanApplication.created_at,
      expirationDate: null,
      required: true,
      category: "identification"
    });
  }
  
  // Add other standard documents
  docs.push(
    {
      type: "Auto Insurance",
      name: "Insurance Certificate",
      status: "verified",
      uploadDate: loanApplication.created_at,
      expirationDate: getNextPaymentDate(), // Approximate
      required: true,
      category: "insurance"
    },
    {
      type: "Proof of Income",
      name: "Income Verification Documents",
      status: "verified", 
      uploadDate: loanApplication.created_at,
      expirationDate: null,
      required: true,
      category: "income"
    }
  );
  
  return docs;
};