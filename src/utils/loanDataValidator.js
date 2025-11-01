/**
 * Data Flow Validator - Ensures backend data matches frontend expectations
 * Import this in components to validate API responses
 */

// Required fields for different views
export const FIELD_REQUIREMENTS = {
  myLoans: [
    'id',
    'application_id',
    'amount',
    'vehicle_make',
    'vehicle_model',
    'vehicle_year',
    'status',
    'created_at'
  ],
  
  loanDetails: [
    'application_id',
    'status',
    'amount',
    'term',
    'created_at',
    'submitted_at',
    'approved_amount',
    'first_name',
    'last_name',
    'email',
    'phone',
    'dob',
    'vehicle_make',
    'vehicle_model',
    'vehicle_year',
    'vehicle_vin',
    'vehicle_mileage',
    'ai_recommendation',
    'ai_risk_assessment',
    'approval_notes'
  ],
  
  adminLoans: [
    'id',
    'application_id',
    'first_name',
    'last_name',
    'full_name',
    'email',
    'phone',
    'amount',
    'interest_rate',
    'term',
    'status',
    'created_at',
    'submitted_at'
  ]
};

/**
 * Validate that a loan object has all required fields
 * @param {Object} loan - Loan application object from API
 * @param {String} view - View name ('myLoans', 'loanDetails', 'adminLoans')
 * @returns {Object} - { valid: boolean, missing: string[], warnings: string[] }
 */
export const validateLoanData = (loan, view = 'myLoans') => {
  const required = FIELD_REQUIREMENTS[view] || FIELD_REQUIREMENTS.myLoans;
  const missing = [];
  const warnings = [];
  
  // Check for missing fields
  required.forEach(field => {
    if (!(field in loan)) {
      missing.push(field);
    } else if (loan[field] === null || loan[field] === undefined) {
      warnings.push(`${field} is null or undefined`);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
};

/**
 * Log validation results to console (development only)
 * @param {Object} loan - Loan application object
 * @param {String} view - View name
 */
export const debugLoanData = (loan, view = 'myLoans') => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const validation = validateLoanData(loan, view);
  
  console.group(`🔍 Loan Data Validation (${view})`);
  console.log('Loan ID:', loan.id || loan.application_id);
  console.log('Valid:', validation.valid ? '✅' : '❌');
  
  if (validation.missing.length > 0) {
    console.error('❌ Missing fields:', validation.missing);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }
  
  if (validation.valid && validation.warnings.length === 0) {
    console.log('✅ All required fields present');
  }
  
  console.groupEnd();
  
  return validation;
};

/**
 * Ensure safe access to nested loan properties
 * @param {Object} loan - Loan application object
 * @returns {Object} - Normalized loan object with safe defaults
 */
export const normalizeLoanData = (loan) => {
  if (!loan) return null;
  
  return {
    // Core fields
    id: loan.id || null,
    application_id: loan.application_id || null,
    status: loan.status || 'draft',
    is_draft: loan.is_draft ?? true,
    
    // Personal info
    first_name: loan.first_name || '',
    last_name: loan.last_name || '',
    full_name: loan.full_name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Applicant',
    email: loan.email || '',
    phone: loan.phone || '',
    dob: loan.dob || null,
    
    // Loan details
    amount: loan.amount || 0,
    term: loan.term || 36,
    interest_rate: loan.interest_rate || null,
    purpose: loan.purpose || '',
    
    // Vehicle info
    vehicle_make: loan.vehicle_make || '',
    vehicle_model: loan.vehicle_model || '',
    vehicle_year: loan.vehicle_year || '',
    vehicle_vin: loan.vehicle_vin || '',
    vehicle_mileage: loan.vehicle_mileage || null,
    
    // Timestamps
    created_at: loan.created_at || null,
    updated_at: loan.updated_at || null,
    submitted_at: loan.submitted_at || null,
    
    // AI Analysis
    ai_recommendation: loan.ai_recommendation || null,
    ai_risk_assessment: loan.ai_risk_assessment || null,
    
    // Admin fields
    approved_amount: loan.approved_amount || null,
    approved_at: loan.approved_at || null,
    approval_notes: loan.approval_notes || null,
    
    // Keep original for reference
    _raw: loan
  };
};

/**
 * Check if critical fields are missing and throw error in development
 * @param {Object} loan - Loan application object
 * @param {String} view - View name
 * @throws {Error} - In development mode if critical fields are missing
 */
export const assertLoanData = (loan, view = 'myLoans') => {
  const validation = validateLoanData(loan, view);
  
  if (!validation.valid && process.env.NODE_ENV === 'development') {
    console.error('❌ Loan data validation failed:', validation);
    throw new Error(
      `Missing required fields for ${view}: ${validation.missing.join(', ')}\n` +
      `Check LOAN_DATA_FLOW_TRACKING.md for field requirements.`
    );
  }
  
  return validation.valid;
};

/**
 * Field mapper - Maps backend field names to frontend display names
 */
export const FIELD_DISPLAY_NAMES = {
  application_id: 'Application ID',
  first_name: 'First Name',
  last_name: 'Last Name',
  full_name: 'Full Name',
  vehicle_make: 'Vehicle Make',
  vehicle_model: 'Vehicle Model',
  vehicle_year: 'Vehicle Year',
  vehicle_vin: 'VIN',
  vehicle_mileage: 'Mileage',
  interest_rate: 'Interest Rate',
  approved_amount: 'Approved Amount',
  ai_risk_assessment: 'Risk Assessment',
  ai_recommendation: 'AI Recommendation',
  created_at: 'Created Date',
  submitted_at: 'Submitted Date',
  approved_at: 'Approved Date',
};

export default {
  FIELD_REQUIREMENTS,
  validateLoanData,
  debugLoanData,
  normalizeLoanData,
  assertLoanData,
  FIELD_DISPLAY_NAMES
};
