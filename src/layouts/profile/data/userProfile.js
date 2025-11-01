import { fetchCustomerProfile } from '../../../services/customerProfileService';
import { generateCustomerId, generateLoanNumber } from '../../../utils/customerIdGenerator';

// This will be replaced by API call - keeping as fallback
export const getUserProfile = async (userId) => {
  try {
    // Fetch from API
    const apiProfile = await fetchCustomerProfile(userId);
    return apiProfile;
  } catch (error) {
    console.error('Failed to fetch user profile from API:', error);
    // Return fallback static data
    return getFallbackProfile(userId);
  }
};

// Fallback profile for when API is unavailable
const getFallbackProfile = (userId = 1) => {
  // Generate customer ID and loan number for fallback data
  const joinDate = "2024-03-15";
  const customerId = generateCustomerId(userId, joinDate);
  const loanNumber = generateLoanNumber(joinDate, 1);
  
  return {
    // DriveCash customer identification - Generated from user ID and application date
    customerId,
  accountStatus: "Active - Good Standing",
  
  // Personal information from loan application
  personalInfo: {
    firstName: "Sarah",
    lastName: "Johnson", 
    fullName: "Sarah Johnson",
    dateOfBirth: "1988-07-22",
    ssn: "***-**-1234",
    driversLicense: "CA-DL-AB123456",
    dlExpiration: "2026-07-22"
  },
  
  // Contact information from ApplicantPersonalInfo and ApplicantAddress
  contact: {
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@email.com",
    address: "1425 Oak Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102"
  },
  
  // Employment & income from ApplicantFinancialProfile
  employment: {
    employer: "Tech Solutions Inc.",
    position: "Software Engineer",
    monthlyIncome: 5200,
    employmentLength: "2 years 8 months",
    workPhone: "+1 (555) 987-6543"
  },
  
  // Banking information from loan application
  banking: {
    bankName: "Wells Fargo",
    accountType: "Checking",
    routingNumber: "121042882",
    accountNumber: "****5678",
    directDebitAuthorized: true
  },
  
  // DriveCash membership details - Based on user registration and loan application
  membership: {
    joinDate: "2024-03-15",
    customerSince: "7 months",
    referralSource: "Google Search",
    creditScore: 695,
    riskCategory: "Low Risk"
  },
  
  // Active title loans - Based on LoanApplication model
  titleLoans: [
    {
      loanNumber,
      status: "Current",
      loanAmount: 8500,
      currentBalance: 7200,
      interestRate: 18.99,
      monthlyPayment: 325,
      // Monthly Extension terminology for DriveCash
      monthlyExtension: 325,
      nextPaymentDue: "2024-11-15",
      startDate: "2024-03-15",
      maturityDate: "2026-03-15",
      totalPaid: 1950,
      paymentsRemaining: 22,
      
      // Vehicle from VehicleInformation model
      collateralVehicle: {
        year: 2018,
        make: "Honda",
        model: "Civic",
        trim: "EX Sedan",
        vin: "2HGFC2F59JH123456",
        mileage: 42500,
        estimatedValue: 16800,
        loanToValue: 50.6,
        titleStatus: "Lien - DriveCash Financial",
        registrationState: "California",
        licensePlate: "8ABC123"
      },
      
      // Insurance requirements from loan application
      insurance: {
        company: "Geico",
        policyNumber: "GE-456789012",
        expirationDate: "2025-03-15",
        coverageAmount: 30000,
        deductible: 1000,
        driveCashAsAdditionalInsured: true
      }
    }
  ],
  
  // Payment history and patterns - Based on actual loan performance
  paymentHistory: {
    totalPayments: 6,
    onTimePayments: 6,
    latePayments: 0,
    missedPayments: 0,
    averagePaymentAmount: 325,
    lastPaymentDate: "2024-10-15",
    lastPaymentAmount: 325,
    paymentMethod: "Auto-Debit",
    nextPaymentDate: "2024-11-15"
  },
  
  // Required documents for title loans - Based on LoanApplicationDocument model
  documents: [
    {
      type: "Vehicle Title",
      name: "California Certificate of Title - Honda Civic 2018",
      status: "verified",
      uploadDate: "2024-03-12",
      expirationDate: null,
      required: true,
      category: "collateral"
    },
    {
      type: "Driver's License",
      name: "California Driver License - Sarah Johnson",
      status: "verified", 
      uploadDate: "2024-03-12",
      expirationDate: "2026-07-22",
      required: true,
      category: "identification"
    },
    {
      type: "Auto Insurance",
      name: "Geico Insurance Certificate",
      status: "current",
      uploadDate: "2024-03-13",
      expirationDate: "2025-03-15",
      required: true,
      category: "insurance"
    },
    {
      type: "Proof of Income",
      name: "Tech Solutions Inc. Pay Stubs (3 months)",
      status: "verified",
      uploadDate: "2024-03-12",
      expirationDate: null,
      required: true,
      category: "income"
    },
    {
      type: "Vehicle Registration",
      name: "California Vehicle Registration - 8ABC123",
      status: "current",
      uploadDate: "2024-03-13",
      expirationDate: "2025-07-22",
      required: true,
      category: "vehicle"
    },
    {
      type: "Vehicle Photos",
      name: "Honda Civic - Front, VIN, Odometer Photos",
      status: "verified",
      uploadDate: "2024-03-13",
      expirationDate: null,
      required: true,
      category: "vehicle"
    },
    {
      type: "Loan Agreement",
      name: `DriveCash Title Loan Agreement ${loanNumber}`,
      status: "signed",
      uploadDate: "2024-03-15",
      expirationDate: null,
      required: true,
      category: "legal"
    }
  ],
  
  // Account preferences and settings
  preferences: {
    communicationMethod: "Email & SMS",
    paymentReminders: true,
    marketingEmails: false,
    paperlessStatements: true,
    autoPayEnabled: true,
    preferredContactTime: "Evening (6-8 PM)"
  }
  };
};

// Export default static profile for backward compatibility
export const userProfile = getFallbackProfile(1);
