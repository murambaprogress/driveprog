/**
 * DriveCash Customer Configuration
 * Contains settings for customer ID generation and profile management
 */

export const CUSTOMER_CONFIG = {
  // Customer ID Format: DC-USR-YYYY-XXX
  customerId: {
    prefix: 'DC',
    type: 'USR',
    yearFormat: 'YYYY',
    sequenceLength: 3,
    separator: '-'
  },
  
  // Loan Number Format: DC-TL-YYYY-MM-XXX  
  loanNumber: {
    prefix: 'DC',
    type: 'TL',
    includeMonth: true,
    sequenceLength: 3,
    separator: '-'
  },
  
  // Application ID Format: DC-APP-YYYYMMDD-XXXXXX
  applicationId: {
    prefix: 'DC',
    type: 'APP',
    includeDate: true,
    timestampLength: 6,
    separator: '-'
  },
  
  // Default values for new customers
  defaults: {
    accountStatus: 'Active - Good Standing',
    riskCategory: 'Standard',
    communicationMethod: 'Email & SMS',
    paymentReminders: true,
    marketingEmails: false,
    paperlessStatements: true,
    autoPayEnabled: true,
    preferredContactTime: 'Evening (6-8 PM)',
    defaultInsuranceCoverage: 25000,
    defaultDeductible: 1000,
    paymentDueDay: 15 // 15th of each month
  },
  
  // Document categories and types
  documentTypes: {
    identification: [
      'Driver\'s License',
      'State ID',
      'Passport'
    ],
    collateral: [
      'Vehicle Title',
      'Vehicle Registration'
    ],
    insurance: [
      'Auto Insurance Certificate',
      'Insurance Declaration Page'
    ],
    income: [
      'Pay Stubs',
      'Tax Returns',
      'Bank Statements',
      'Employment Letter'
    ],
    vehicle: [
      'Vehicle Photos',
      'VIN Plate Photo',
      'Odometer Photo'
    ],
    legal: [
      'Loan Agreement',
      'Terms & Conditions',
      'Privacy Policy Acceptance'
    ]
  },
  
  // Risk assessment mappings
  riskCategories: {
    'low': 'Low Risk',
    'medium': 'Standard', 
    'high': 'High Risk',
    'very_high': 'Very High Risk'
  },
  
  // Loan status mappings
  loanStatuses: {
    'draft': 'Draft',
    'pending': 'Pending Review',
    'under_review': 'Under Review',
    'approved': 'Active',
    'rejected': 'Rejected',
    'withdrawn': 'Withdrawn',
    'paid_off': 'Paid Off',
    'defaulted': 'Defaulted'
  },
  
  // Employment status options
  employmentStatuses: {
    'employed': 'Employed',
    'self-employed': 'Self-Employed', 
    'retired': 'Retired',
    'unemployed': 'Unemployed'
  },
  
  // Document status options
  documentStatuses: {
    'pending': 'Pending Upload',
    'uploaded': 'Uploaded',
    'verified': 'Verified',
    'rejected': 'Rejected',
    'expired': 'Expired',
    'current': 'Current'
  },
  
  // Payment methods
  paymentMethods: {
    'auto_debit': 'Auto-Debit',
    'manual_payment': 'Manual Payment',
    'online': 'Online Payment',
    'phone': 'Phone Payment',
    'cash': 'Cash Payment'
  },
  
  // Sample customer data for testing/demo
  sampleCustomers: [
    {
      userId: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      city: 'San Francisco',
      state: 'CA',
      joinDate: '2024-03-15',
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      creditScore: 695
    },
    {
      userId: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@gmail.com',
      phone: '+1 (555) 234-5678',
      city: 'Los Angeles', 
      state: 'CA',
      joinDate: '2024-01-22',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      creditScore: 672
    },
    {
      userId: 3,
      firstName: 'Jessica',
      lastName: 'Martinez',
      email: 'jessica.martinez@outlook.com',
      phone: '+1 (555) 345-6789',
      city: 'Phoenix',
      state: 'AZ', 
      joinDate: '2023-11-08',
      vehicleMake: 'Ford',
      vehicleModel: 'Explorer',
      creditScore: 628
    }
  ]
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  customerId: /^DC-USR-\d{4}-\d{3}$/,
  loanNumber: /^DC-TL-\d{4}-\d{2}-\d{3}$/,
  applicationId: /^DC-APP-\d{8}-\d{6}$/,
  phone: /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]*([0-9]{3})[-.\s]*([0-9]{4})$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  vin: /^[A-HJ-NPR-Z0-9]{17}$/,
  zipCode: /^\d{5}(-\d{4})?$/
};

export default CUSTOMER_CONFIG;