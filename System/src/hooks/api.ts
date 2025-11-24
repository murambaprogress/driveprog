import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  authAPI, 
  usersAPI, 
  loansAPI, 
  applicationsAPI, 
  paymentsAPI, 
  documentsAPI 
} from '../api/client';

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authAPI.login(email, password),
    onSuccess: () => {
      // Invalidate and refetch relevant queries after login
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// User hooks
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersAPI.getById(userId),
    enabled: !!userId,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
  });
}

// Loan hooks
export function useLoan(loanId: string) {
  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => loansAPI.getById(loanId),
    enabled: !!loanId,
  });
}

export function useUserLoans(userId: string) {
  return useQuery({
    queryKey: ['loans', 'user', userId],
    queryFn: () => loansAPI.getByUserId(userId),
    enabled: !!userId,
  });
}

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: () => loansAPI.getAll(),
  });
}

type LoanData = Record<string, unknown>;
type ApplicationData = Record<string, unknown>;
type PaymentData = Record<string, unknown>;

export function useCreateLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: (loanData: LoanData) => loansAPI.create(loanData),
    onSuccess: () => {
      // Invalidate and refetch loans queries
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useUpdateLoan(loanId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: (loanData: LoanData) => loansAPI.update(loanId, loanData),
    onSuccess: () => {
      // Invalidate and refetch the specific loan and all loans
      queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

// Application hooks
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationsAPI.getById(applicationId),
    enabled: !!applicationId,
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsAPI.getAll(),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: (applicationData: ApplicationData) => applicationsAPI.create(applicationData),
    onSuccess: () => {
      // Invalidate and refetch applications queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplication(applicationId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: (applicationData: ApplicationData) => applicationsAPI.update(applicationId, applicationData),
    onSuccess: () => {
      // Invalidate and refetch the specific application and all applications
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// Payment hooks
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.getAll(),
  });
}

export function useLoanPayments(loanId: string) {
  return useQuery({
    queryKey: ['payments', 'loan', loanId],
    queryFn: () => paymentsAPI.getByLoanId(loanId),
    enabled: !!loanId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: (paymentData: PaymentData) => paymentsAPI.create(paymentData),
    onSuccess: (data: unknown) => {
      // Invalidate and refetch payments queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      // If we have a loanId in the response, invalidate loan payments too
      if (data && typeof data === 'object' && 'loanId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loanId = (data as any).loanId as string | undefined;
        if (loanId) {
          queryClient.invalidateQueries({ queryKey: ['payments', 'loan', loanId] });
          // Also invalidate loan data since payment may affect balance
          queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
        }
      }
    },
  });
}

// Document hooks
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsAPI.getAll(),
  });
}

export function useUserDocuments(userId: string) {
  return useQuery({
    queryKey: ['documents', 'user', userId],
    queryFn: () => documentsAPI.getByUserId(userId),
    enabled: !!userId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
  mutationFn: ({ userId, file }: { userId: string; file: File }) => 
      documentsAPI.upload(userId, file),
    onSuccess: (data: unknown) => {
      // Invalidate and refetch documents queries
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      // If we have a userId in the response, invalidate user documents too
      if (data && typeof data === 'object' && 'userId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (data as any).userId as string | undefined;
        if (userId) {
          queryClient.invalidateQueries({ queryKey: ['documents', 'user', userId] });
        }
      }
    },
  });
}
