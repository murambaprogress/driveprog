/**
 * Loan Application Service
 * Handles all loan application API interactions for users
 */

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob?: string;
  social_security?: string;
  banks_name?: string;
}

export interface Identification {
  identification_type?: string;
  id_issuing_agency?: string;
  identification_no?: string;
}

export interface FinancialProfile {
  income?: number;
  employment_status?: string;
  employment_length?: number;
  income_source?: string;
  gross_monthly_income?: number;
  pay_frequency?: string;
  next_pay_date?: string;
  last_pay_date?: string;
  active_bankruptcy?: string;
  direct_deposit?: string;
  military_status?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface VehicleInfo {
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  mileage?: number;
  color?: string;
  license_plate?: string;
  registration_state?: string;
}

export interface LoanApplicationData {
  application_id?: string;

  // Application details
  amount: number;
  term?: number;
  purpose?: string;
  applicant_estimated_value?: number;

  // Personal information
  personal_info?: PersonalInfo;
  identification?: Identification;
  financial_profile?: FinancialProfile;
  address?: Address;
  vehicle_info?: VehicleInfo;

  // Documents
  documents?: {
    photo_vin_sticker?: File;
    photo_odometer?: File;
    photo_borrower?: File;
    photo_front_car?: File;
    photo_vin?: File;
    photo_license?: File;
    photo_insurance?: File;
  };

  // Status and metadata
  status?: string;
  is_draft?: boolean;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;

  // Terms
  accept_terms?: boolean;
  signature?: string;
}

export interface LoanApplication {
  application_id: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  is_draft: boolean;

  // Flattened fields
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  gross_monthly_income?: number;
  employment_status?: string;
}

export interface AIAnalysisResult {
  id: number;
  ai_decision: "APPROVE" | "DENY" | "REQUEST_MORE_INFO";
  confidence_level: number;
  summary: string;
  vehicle_estimated_value: number;
  overall_risk: "LOW" | "MEDIUM" | "HIGH";
  recommended_amount?: number;
  analysis_timestamp: string;
}

export class LoanApplicationService {
  private baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  private getAuthHeaders() {
    const token = localStorage.getItem("drivecash_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Create a new draft loan application
   */
  async createDraftApplication(
    data: Partial<LoanApplicationData>
  ): Promise<LoanApplication> {
    const response = await fetch(`${this.baseURL}/api/loans/applications/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        amount: data.amount || 1000,
        term: data.term || 36,
        purpose: data.purpose || "",
        applicant_estimated_value: data.applicant_estimated_value,
        is_draft: true,

        // Flatten nested data for API
        first_name: data.personal_info?.first_name || "",
        last_name: data.personal_info?.last_name || "",
        email: data.personal_info?.email || "",
        phone: data.personal_info?.phone || "",
        dob: data.personal_info?.dob,

        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        zip_code: data.address?.zip_code || "",

        vehicle_make: data.vehicle_info?.make || "",
        vehicle_model: data.vehicle_info?.model || "",
        vehicle_year: data.vehicle_info?.year || "",
        vehicle_vin: data.vehicle_info?.vin || "",
        vehicle_mileage: data.vehicle_info?.mileage,

        gross_monthly_income: data.financial_profile?.gross_monthly_income,
        employment_status: data.financial_profile?.employment_status || "",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to create application"
      );
    }

    return response.json();
  }

  /**
   * Update an existing loan application
   */
  async updateApplication(
    applicationId: string,
    data: Partial<LoanApplicationData>
  ): Promise<LoanApplication> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/${applicationId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          amount: data.amount,
          term: data.term,
          purpose: data.purpose,
          applicant_estimated_value: data.applicant_estimated_value,

          // Flatten nested data
          first_name: data.personal_info?.first_name,
          last_name: data.personal_info?.last_name,
          email: data.personal_info?.email,
          phone: data.personal_info?.phone,
          dob: data.personal_info?.dob,

          street: data.address?.street,
          city: data.address?.city,
          state: data.address?.state,
          zip_code: data.address?.zip_code,

          vehicle_make: data.vehicle_info?.make,
          vehicle_model: data.vehicle_info?.model,
          vehicle_year: data.vehicle_info?.year,
          vehicle_vin: data.vehicle_info?.vin,
          vehicle_mileage: data.vehicle_info?.mileage,

          gross_monthly_income: data.financial_profile?.gross_monthly_income,
          employment_status: data.financial_profile?.employment_status,

          accept_terms: data.accept_terms,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to update application"
      );
    }

    return response.json();
  }

  /**
   * Upload documents for a loan application
   */
  async uploadDocuments(
    applicationId: string,
    documents: Record<string, File>
  ): Promise<{ uploaded_files: string[] }> {
    const formData = new FormData();

    // Add each document to the form data
    Object.entries(documents).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    const response = await fetch(
      `${this.baseURL}/api/loans/applications/${applicationId}/upload_documents/`,
      {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to upload documents"
      );
    }

    return response.json();
  }

  /**
   * Run AI analysis on the application
   */
  async runAIAnalysis(applicationId: string): Promise<AIAnalysisResult> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/${applicationId}/gemini_analysis/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "AI analysis failed");
    }

    return response.json();
  }

  /**
   * Submit application for review
   */
  async submitApplication(
    applicationId: string,
    signature: string
  ): Promise<{ status: string; submitted_at: string }> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/${applicationId}/submit/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ signature }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to submit application"
      );
    }

    return response.json();
  }

  /**
   * Get user's loan applications
   */
  async getUserApplications(): Promise<{
    applications: LoanApplication[];
    count: number;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/my_applications/`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to fetch applications"
      );
    }

    return response.json();
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(applicationId: string): Promise<LoanApplication> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/${applicationId}/`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to fetch application"
      );
    }

    return response.json();
  }

  /**
   * Associate a draft application with the current user
   */
  async associateDraftApplication(
    applicationId: string,
    email?: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/loans/applications/associate_draft/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          application_id: applicationId,
          email: email,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || error.error || "Failed to associate application"
      );
    }
  }

  /**
   * Get application status display text
   */
  getStatusDisplay(status: string): {
    text: string;
    color: string;
    description: string;
  } {
    const statusMap = {
      draft: {
        text: "Draft",
        color: "bg-gray-100 text-gray-800",
        description: "Application is being prepared",
      },
      pending: {
        text: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
        description: "Application submitted and awaiting review",
      },
      under_review: {
        text: "Under Review",
        color: "bg-blue-100 text-blue-800",
        description: "Application is being reviewed by our team",
      },
      ai_analysis: {
        text: "AI Analysis",
        color: "bg-purple-100 text-purple-800",
        description: "AI is analyzing your application",
      },
      ai_approved: {
        text: "AI Pre-Approved",
        color: "bg-green-100 text-green-800",
        description: "AI has pre-approved your application",
      },
      ai_denied: {
        text: "AI Review Required",
        color: "bg-orange-100 text-orange-800",
        description: "Application requires manual review",
      },
      ai_review_required: {
        text: "Manual Review",
        color: "bg-orange-100 text-orange-800",
        description: "Application requires manual review by our team",
      },
      additional_info_required: {
        text: "Info Required",
        color: "bg-yellow-100 text-yellow-800",
        description: "Additional information needed",
      },
      approved: {
        text: "Approved",
        color: "bg-green-100 text-green-800",
        description: "Your loan has been approved!",
      },
      denied: {
        text: "Denied",
        color: "bg-red-100 text-red-800",
        description: "Application was not approved",
      },
      withdrawn: {
        text: "Withdrawn",
        color: "bg-gray-100 text-gray-800",
        description: "Application was withdrawn",
      },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        text: status,
        color: "bg-gray-100 text-gray-800",
        description: "Unknown status",
      }
    );
  }

  /**
   * Validate application data before submission
   */
  validateApplication(data: LoanApplicationData): string[] {
    const errors: string[] = [];

    // Check required personal info
    if (!data.personal_info?.first_name) errors.push("First name is required");
    if (!data.personal_info?.last_name) errors.push("Last name is required");
    if (!data.personal_info?.email) errors.push("Email is required");
    if (!data.personal_info?.phone) errors.push("Phone number is required");

    // Check address
    if (!data.address?.street) errors.push("Street address is required");
    if (!data.address?.city) errors.push("City is required");
    if (!data.address?.state) errors.push("State is required");
    if (!data.address?.zip_code) errors.push("ZIP code is required");

    // Check vehicle info
    if (!data.vehicle_info?.make) errors.push("Vehicle make is required");
    if (!data.vehicle_info?.model) errors.push("Vehicle model is required");
    if (!data.vehicle_info?.year) errors.push("Vehicle year is required");

    // Check financial info
    if (!data.financial_profile?.employment_status)
      errors.push("Employment status is required");
    if (!data.financial_profile?.gross_monthly_income)
      errors.push("Monthly income is required");

    // Check loan amount
    if (!data.amount) errors.push("Loan amount is required");
    else if (data.amount < 1000) errors.push("Minimum loan amount is $1,000");
    else if (data.amount > 100000)
      errors.push("Maximum loan amount is $100,000");

    // Check terms
    if (!data.accept_terms)
      errors.push("You must accept the terms and conditions");

    return errors;
  }

  /**
   * Check if application has required documents
   */
  hasRequiredDocuments(application: LoanApplication): {
    complete: boolean;
    missing: string[];
  } {
    const requiredDocs = [
      { key: "photo_front_car", label: "Vehicle Photo" },
      { key: "photo_license", label: "Driver's License" },
      { key: "photo_insurance", label: "Insurance Document" },
      { key: "photo_vin_sticker", label: "VIN Sticker" },
    ];

    const missing: string[] = [];

    requiredDocs.forEach((doc) => {
      // This would need to be checked based on the actual application object structure
      // For now, we'll assume documents are present if the application has been submitted
      if (!application.submitted_at) {
        missing.push(doc.label);
      }
    });

    return {
      complete: missing.length === 0,
      missing,
    };
  }
}

// Export a singleton instance
export const loanApplicationService = new LoanApplicationService();
