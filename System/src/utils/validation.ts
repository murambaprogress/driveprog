import { z } from 'zod';

// Schema for loan application form
export const loanApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().refine((date) => {
    // Basic date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }, { message: 'Date must be in YYYY-MM-DD format' }),
  amount: z.number().min(1000, 'Loan amount must be at least $1,000').max(100000, 'Loan amount cannot exceed $100,000'),
  term: z.number().int().min(6, 'Term must be at least 6 months').max(72, 'Term cannot exceed 72 months'),
  purpose: z.string().min(1, 'Loan purpose is required'),
  income: z.number().min(20000, 'Annual income must be at least $20,000'),
  employmentStatus: z.enum(['employed', 'self-employed', 'retired', 'unemployed']),
  employmentLength: z.number().min(0, 'Employment length cannot be negative'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  }),
  creditScore: z.number().min(300, 'Credit score must be at least 300').max(850, 'Credit score cannot exceed 850'),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
});

// Schema for loan calculator
export const loanCalculatorSchema = z.object({
  amount: z.number().min(1000, 'Loan amount must be at least $1,000').max(100000, 'Loan amount cannot exceed $100,000'),
  term: z.number().int().min(6, 'Term must be at least 6 months').max(72, 'Term cannot exceed 72 months'),
  interestRate: z.number().min(1, 'Interest rate must be at least 1%').max(30, 'Interest rate cannot exceed 30%'),
});

// Schema for payment form
export const paymentFormSchema = z.object({
  amount: z.number().min(1, 'Payment amount must be greater than $0'),
  method: z.enum(['bank', 'credit', 'debit']),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  savePaymentMethod: z.boolean().optional(),
});

// Schema for user login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

// Schema for user registration
export const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Schema for document upload
export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  type: z.enum(['id', 'income', 'address', 'other']),
  file: z.any(),
  description: z.string().optional(),
});

// Schema for support ticket
export const supportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  attachment: z.any().optional(),
});

// Export types based on the schemas
export type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;
export type LoanCalculatorFormData = z.infer<typeof loanCalculatorSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;
