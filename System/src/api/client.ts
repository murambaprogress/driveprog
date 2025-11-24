// API client for DriveCash

// Minimal domain types used by the frontend (kept intentionally small)
export interface User { id: string; name: string; email: string; role?: string; status?: string }
export interface Loan { id: string; userId?: string; amount?: number; status?: string }
export interface Payment { id: string; loanId?: string; amount?: number; date?: string }
export interface Document { id: string; userId?: string; name?: string; url?: string }
export interface Application { id: string; name?: string; email?: string; amount?: number; status?: string }

// Base fetch function with error handling
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = '/api';
  const url = `${baseUrl}${endpoint}`;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // For 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Auth
export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI<{ user: User; token: string; isAdmin: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Users
export const usersAPI = {
  getAll: () => fetchAPI<User[]>('/users'),
  getById: (id: string) => fetchAPI<User>(`/users/${id}`),
  create: (userData: Partial<User>) => fetchAPI<User>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: Partial<User>) => fetchAPI<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Loans
export const loansAPI = {
  getAll: () => fetchAPI<Loan[]>('/loans'),
  getById: (id: string) => fetchAPI<Loan>(`/loans/${id}`),
  getByUserId: (userId: string) => fetchAPI<Loan[]>(`/users/${userId}/loans`),
  create: (loanData: Partial<Loan>) => fetchAPI<Loan>('/loans', {
    method: 'POST',
    body: JSON.stringify(loanData),
  }),
  update: (id: string, loanData: Partial<Loan>) => fetchAPI<Loan>(`/loans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(loanData),
  }),
};

// Applications
export const applicationsAPI = {
  getAll: () => fetchAPI<Application[]>('/applications'),
  getById: (id: string) => fetchAPI<Application>(`/applications/${id}`),
  create: (applicationData: Partial<Application>) => fetchAPI<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  update: (id: string, applicationData: Partial<Application>) => fetchAPI<Application>(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(applicationData),
  }),
};

// Payments
export const paymentsAPI = {
  getAll: () => fetchAPI<Payment[]>('/payments'),
  getByLoanId: (loanId: string) => fetchAPI<Payment[]>(`/loans/${loanId}/payments`),
  create: (paymentData: Partial<Payment>) => fetchAPI<Payment>('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
};

// Documents
export const documentsAPI = {
  getAll: () => fetchAPI<Document[]>('/documents'),
  getByUserId: (userId: string) => fetchAPI<Document[]>(`/users/${userId}/documents`),
  upload: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetchAPI<Document>(`/users/${userId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the correct content type for FormData
    });
  },
};
