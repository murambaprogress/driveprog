import { apiClient } from "utils/apiClient";

// Guard function to remove null, undefined, and empty values
const removeNullValues = (obj) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null, undefined, and empty strings
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    // Skip empty arrays and objects
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      continue;
    }
    
    // Include the value if it passes all checks
    cleaned[key] = value;
  }
  
  return cleaned;
};

// Transform frontend loan data to backend format
const transformLoanDataForBackend = (loan) => {
  const personal = loan.personal || {};
  const income = loan.income || {};
  const vehicle = loan.vehicle || {};
  const coApplicant = loan.coApplicant || {};
  const condition = loan.condition || {};
  const photos = loan.photos || {};
  
  // Extract all dynamic fields from personal object
  const personalKeys = Object.keys(personal);
  const incomeKeys = Object.keys(income);
  const vehicleKeys = Object.keys(vehicle);
  
  const backendData = {
    // Application ID mapping
    application_id: loan.id,
    is_draft: loan.status === 'draft',
    status: loan.status || 'draft',
    
    // Personal Information - Core fields
    first_name: personal.fullName?.split(' ')[0] || personal.firstName || '',
    last_name: personal.fullName?.split(' ').slice(1).join(' ') || personal.lastName || personal.fullName || '',
    email: personal.email || '',
    phone: personal.phoneNumber || personal.phone || '',
    dob: personal.dob || personal.dateOfBirth || null,
    social_security: personal.ssn || personal.socialSecurity || '',
    banks_name: personal.bankName || personal.bankName || '',
    
    // Address Information
    street: personal.homeAddress || personal.streetAddress || personal.address || '',
    city: personal.city || '',
    state: personal.state || '',
    zip_code: personal.zipCode || personal.postalCode || '',
    
    // Identification
    identification_type: personal.identificationType || 'drivers_license',
    identification_no: personal.driverLicense || personal.idNumber || '',
    id_issuing_agency: personal.idIssuingAgency || '',
    
    // Financial Information - Core fields
    employment_status: income.employmentStatus || personal.employmentStatus || 'employed',
    income_source: income.employerName || income.employer || personal.employer || '',
    income: income.annualIncome || personal.annualIncome || null,
    gross_monthly_income: personal.monthlyIncome || income.monthlyIncome || null,
    employment_length: income.yearsEmployed || personal.yearsEmployed || null,
    pay_frequency: income.payFrequency || personal.payFrequency || '',
    next_pay_date: income.nextPayDate || personal.nextPayDate || null,
    last_pay_date: income.lastPayDate || personal.lastPayDate || null,
    active_bankruptcy: income.activeBankruptcy || personal.activeBankruptcy || 'No',
    direct_deposit: income.directDeposit || personal.directDeposit || '',
    military_status: income.militaryStatus || personal.militaryStatus || '',
    
    // Loan Details
    amount: personal.loanAmount || loan.amount || 1000,
    term: personal.loanTerm || loan.term || 36,
    purpose: personal.loanPurpose || loan.purpose || '',
    
    // Vehicle Information - Core fields
    vehicle_make: vehicle.make || '',
    vehicle_model: vehicle.model || '',
    vehicle_year: vehicle.year || '',
    vehicle_vin: vehicle.vin || '',
    vehicle_mileage: vehicle.odometerMileage || vehicle.mileage || null,
    vehicle_color: vehicle.vehicleColor || vehicle.color || '',
    license_plate: vehicle.licensePlate || '',
    registration_state: vehicle.registrationState || '',
    
    // Applicant's vehicle value estimate
    applicant_estimated_value: vehicle.estimatedCarValue || vehicle.estimatedValue || null,
    
    // Credit Information
    credit_score: personal.creditScore || income.creditScore || null,
    
    // Accept terms and signature
    accept_terms: loan.accept_terms !== undefined ? loan.accept_terms : (loan.status !== 'draft'),
    signature: loan.signature || null,
  };

  // Add any additional dynamic fields from personal object
  personalKeys.forEach(key => {
    if (!backendData.hasOwnProperty(key) && personal[key] !== undefined && personal[key] !== '') {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (!backendData.hasOwnProperty(snakeKey)) {
        backendData[`personal_${snakeKey}`] = personal[key];
      }
    }
  });

  // Add any additional dynamic fields from income object
  incomeKeys.forEach(key => {
    if (!backendData.hasOwnProperty(key) && income[key] !== undefined && income[key] !== '') {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (!backendData.hasOwnProperty(snakeKey)) {
        backendData[`income_${snakeKey}`] = income[key];
      }
    }
  });

  // Add any additional dynamic fields from vehicle object
  vehicleKeys.forEach(key => {
    if (!key.startsWith('vehicle_') && !backendData.hasOwnProperty(key) && vehicle[key] !== undefined && vehicle[key] !== '') {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (!backendData.hasOwnProperty(`vehicle_${snakeKey}`)) {
        backendData[`vehicle_${snakeKey}`] = vehicle[key];
      }
    }
  });

  // Add co-applicant information if available
  if (Object.keys(coApplicant).length > 0) {
    Object.keys(coApplicant).forEach(key => {
      if (coApplicant[key] !== undefined && coApplicant[key] !== '') {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        backendData[`co_applicant_${snakeKey}`] = coApplicant[key];
      }
    });
  }

  // Add vehicle condition information if available
  if (Object.keys(condition).length > 0) {
    Object.keys(condition).forEach(key => {
      if (condition[key] !== undefined && condition[key] !== '') {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        backendData[`condition_${snakeKey}`] = condition[key];
      }
    });
  }

  // Include document information if available
  if (Object.keys(photos).length > 0 || loan.documents) {
    backendData.has_documents = true;
    backendData.document_count = Object.values(photos).flat().length || (loan.documents ? loan.documents.length : 0);
    
    // Store photo metadata (file names/references) in additional_data
    backendData.photo_metadata = {};
    Object.entries(photos).forEach(([fieldName, files]) => {
      if (files && files.length > 0) {
        backendData.photo_metadata[fieldName] = files.map(file => ({
          name: file.name || 'unknown',
          size: file.size || 0,
          type: file.type || 'unknown',
          lastModified: file.lastModified || null
        }));
      }
    });
  }
  
  // Include all review fields that should be saved
  // Ensure all displayed fields in Review.js are captured
  backendData.submission_metadata = {
    submitted_from_review: true,
    review_timestamp: new Date().toISOString(),
    all_fields_reviewed: true,
    fields_in_review: {
      personal: Object.keys(personal).length,
      income: Object.keys(income).length,
      vehicle: Object.keys(vehicle).length,
      coApplicant: Object.keys(coApplicant).length,
      condition: Object.keys(condition).length,
      photos: Object.keys(photos).length
    }
  };

  // Apply guard to remove null, undefined, and empty values
  const cleanedData = removeNullValues(backendData);
  
  console.log('Data before cleaning:', backendData);
  console.log('Data after cleaning:', cleanedData);
  
  return cleanedData;
};

export const getLoanApplication = async (id) => {
  try {
    const response = await apiClient.get(`/loans/applications/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    throw error;
  }
};

// Create or update loan application
export async function putLoan(loan) {
  try {
    const backendData = transformLoanDataForBackend(loan);
    console.log('Sending loan data to backend:', backendData);
    
    // Debug: Check if token exists
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    
    // Check if loan exists in backend (has application_id from backend)
    if (loan.backendId) {
      // Update existing application
      console.log('Updating loan with backendId:', loan.backendId);
      const response = await apiClient.patch(`/loans/applications/${loan.backendId}/`, backendData);
      console.log('PATCH response:', response.data);
      return { ok: true, data: response.data, backendId: loan.backendId };
    } else {
      // Create new application
      console.log('Creating new loan application...');
      console.log('API Base URL:', apiClient.defaults.baseURL);
      console.log('Full URL:', `${apiClient.defaults.baseURL}/loans/applications/`);
      
      const response = await apiClient.post(`/loans/applications/`, backendData);
      console.log('POST response status:', response.status);
      console.log('POST response data:', response.data);
      console.log('POST response data type:', typeof response.data);
      
      // Ensure we have the response data
      if (!response.data) {
        console.error('POST response has no data property');
        return { ok: false, error: 'No data returned from server' };
      }
      
      const backendId = response.data.id || response.data.application_id;
      if (!backendId) {
        console.error('Response data has no id or application_id:', response.data);
      }
      
      return { ok: true, data: response.data, backendId: backendId };
    }
  } catch (error) {
    console.error("Error saving loan application:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Request config:", error.config);
    return { ok: false, error };
  }
}

export async function fetchLoans() {
  try {
    const response = await apiClient.get("/loans/applications/");
    return response.data;
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
}

// Fetch all loan applications for the authenticated user
export async function fetchMyApplications() {
  try {
    const response = await apiClient.get("/loans/applications/my_applications/");
    return response.data;
  } catch (error) {
    console.error("Error fetching my applications:", error);
    throw error;
  }
}

export const createLoanApplication = async (loanData) => {
  try {
    const backendData = transformLoanDataForBackend(loanData);
    const response = await apiClient.post("/loans/applications/", backendData);
    return response.data;
  } catch (error) {
    console.error("Error creating loan application:", error);
    throw error;
  }
};

export const updateLoanApplication = async (id, loanData) => {
  try {
    const backendData = transformLoanDataForBackend(loanData);
    const response = await apiClient.patch(`/loans/applications/${id}/`, backendData);
    return response.data;
  } catch (error) {
    console.error("Error updating loan application:", error);
    throw error;
  }
};

// Delete a draft loan application
export const deleteLoanApplication = async (id) => {
  try {
    const response = await apiClient.delete(`/loans/applications/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting loan application:", error);
    throw error;
  }
};

// Withdraw a submitted loan application
export const withdrawLoanApplication = async (id) => {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/withdraw/`);
    return response.data;
  } catch (error) {
    console.error("Error withdrawing loan application:", error);
    throw error;
  }
};

// Resubmit a loan application
export const resubmitLoanApplication = async (applicationId) => {
  try {
    const response = await apiClient.post(`/loans/applications/submit/`, {
      application_id: applicationId
    });
    return response.data;
  } catch (error) {
    console.error("Error resubmitting loan application:", error);
    throw error;
  }
};

// Submit a loan application (initial submission)
export const submitLoanApplication = async (applicationId) => {
  try {
    const response = await apiClient.post(`/loans/applications/submit/`, {
      application_id: applicationId
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting loan application:", error);
    throw error;
  }
};

// Admin quick actions
export const approveLoanApplication = async (id, approvedAmount, approvalNotes = "") => {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/approve/`, {
      approved_amount: Number(approvedAmount || 0),
      approval_notes: approvalNotes
    });
    return response.data;
  } catch (error) {
    console.error("Error approving loan application:", error);
    throw error;
  }
};

export const rejectLoanApplication = async (id, notes = "") => {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/reject/`, {
      notes: notes
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting loan application:", error);
    throw error;
  }
};

export const raiseQueryLoanApplication = async (id, notes = "") => {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/raise_query/`, {
      notes: notes
    });
    return response.data;
  } catch (error) {
    console.error("Error raising query for loan application:", error);
    throw error;
  }
};

export const resolveQueryLoanApplication = async (id) => {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/resolve_query/`);
    return response.data;
  } catch (error) {
    console.error("Error resolving query for loan application:", error);
    throw error;
  }
};
