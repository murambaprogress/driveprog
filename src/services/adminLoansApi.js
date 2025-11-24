import { fetchLoans as fetchLoansApi } from "loanApp/api/loans";
import { apiClient } from "utils/apiClient";

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const toInteger = (value) => {
  if (value === null || value === undefined) return null;
  const int = parseInt(value, 10);
  return Number.isNaN(int) ? null : int;
};

const pickApplicationDate = (loan) => loan?.submitted_at || loan?.created_at || loan?.updated_at || null;

const deriveInterestRate = (loan) => {
  const aiRate = loan?.ai_analysis_data?.loan_assessment?.interest_rate ?? loan?.ai_analysis_data?.interest_rate;
  if (aiRate !== null && aiRate !== undefined) {
    const numeric = Number(aiRate);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  if (loan?.interest_rate !== null && loan?.interest_rate !== undefined) {
    const numeric = Number(loan.interest_rate);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return null;
};

const buildBorrowerName = (loan) => {
  if (loan?.full_name) {
    return loan.full_name;
  }

  const first = loan?.first_name || loan?.personal_info?.first_name || "";
  const last = loan?.last_name || loan?.personal_info?.last_name || "";
  const name = `${first} ${last}`.trim();
  return name || "Applicant";
};

const normalizeLoan = (loan) => {
  const normalizedStatus = (loan?.status || "draft").toLowerCase();

  return {
    id: loan?.id,
    applicationId: loan?.application_id,
    borrowerName: buildBorrowerName(loan),
    email: loan?.email || loan?.personal_info?.email || "",
    phone: loan?.phone || loan?.personal_info?.phone || "",
    amount: toNumber(loan?.amount) ?? 0,
    interestRate: deriveInterestRate(loan),
    term: toInteger(loan?.term) ?? null,
    status: normalizedStatus,
    applicationDate: pickApplicationDate(loan),
    createdAt: loan?.created_at || null,
    raw: loan,
  };
};

export async function fetchAdminLoans() {
  const response = await fetchLoansApi();

  let records = [];
  if (Array.isArray(response)) {
    records = response;
  } else if (Array.isArray(response?.results)) {
    records = response.results;
  } else if (Array.isArray(response?.applications)) {
    records = response.applications;
  } else if (Array.isArray(response?.data)) {
    records = response.data;
  }

  return records.map(normalizeLoan);
}

export async function fetchAdminLoanDetails(id) {
  try {
    const response = await apiClient.get(`/loans/applications/${id}/`);
    console.log('[fetchAdminLoanDetails] Full loan data with documents:', response.data);
    return response.data;
  } catch (error) {
    console.error('[fetchAdminLoanDetails] Error fetching loan details:', error);
    throw error;
  }
}

export async function approveAdminLoan(id, { approvedAmount, approvalNotes } = {}) {
  const payload = {
    approved_amount: Number(approvedAmount ?? 0),
    approval_notes: approvalNotes ?? "",
  };

  try {
    const response = await apiClient.post(`/loans/applications/${id}/approve/`, payload);
    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.error || 'Cannot approve this application';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export async function rejectAdminLoan(id, { reason } = {}) {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/reject/`, {
      notes: reason ?? "",
    });
    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.error || 'Cannot reject this application';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export async function raiseAdminLoanQuery(id, { message } = {}) {
  try {
    const response = await apiClient.post(`/loans/applications/${id}/raise_query/`, {
      notes: message ?? "",
    });
    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.error || 'Cannot raise query for this application';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export const formatStatusLabel = (status) => {
  if (!status) return "--";
  return status
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper function to check if actions are allowed based on application status
export const getActionPermissions = (status) => {
  const normalizedStatus = status?.toLowerCase();
  
  return {
    canApprove: ['pending', 'under_review'].includes(normalizedStatus),
    canReject: ['pending', 'under_review'].includes(normalizedStatus),
    canQuery: normalizedStatus === 'pending',
    canWithdraw: ['pending', 'under_review'].includes(normalizedStatus),
    statusMessage: getStatusActionMessage(normalizedStatus)
  };
};

const getStatusActionMessage = (status) => {
  switch (status) {
    case 'draft':
      return 'Draft applications cannot be processed';
    case 'approved':
      return 'Application already approved';
    case 'rejected':
      return 'Application already rejected';
    case 'withdrawn':
      return 'Application already withdrawn';
    case 'pending':
      return 'All actions available';
    case 'under_review':
      return 'Can approve or reject';
    default:
      return 'Unknown status';
  }
};
