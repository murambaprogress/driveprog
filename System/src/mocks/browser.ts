import { http, HttpResponse } from 'msw';
import { mockPayments, mockDocuments } from '../data/mockData';

// Expanded mock data for the admin dashboard
const mockUsers = [
  { id: 'USER-001', name: 'John Smith', email: 'john@example.com', role: 'borrower', status: 'active', joinDate: '2023-01-15' },
  { id: 'USER-002', name: 'Emily Johnson', email: 'emily@example.com', role: 'borrower', status: 'active', joinDate: '2023-02-20' },
  { id: 'USER-003', name: 'Michael Wilson', email: 'michael@example.com', role: 'borrower', status: 'inactive', joinDate: '2023-03-05' },
  { id: 'USER-004', name: 'Sarah Davis', email: 'sarah@example.com', role: 'borrower', status: 'active', joinDate: '2023-03-12' },
  { id: 'USER-005', name: 'Robert Brown', email: 'robert@example.com', role: 'borrower', status: 'active', joinDate: '2023-04-08' },
  { id: 'ADMIN-001', name: 'Admin User', email: 'admin@drivecash.com', role: 'admin', status: 'active', joinDate: '2023-01-01' }
];

const mockApplications = [
  { 
    id: 'APP-0023', 
    name: 'John Smith', 
    email: 'john@example.com',
    amount: 45000, 
    purpose: 'Home improvement',
    creditScore: 720,
    income: 85000,
    date: '2023-06-12', 
    status: 'pending' 
  },
  { 
    id: 'APP-0022', 
    name: 'Emily Johnson', 
    email: 'emily@example.com',
    amount: 65000, 
    purpose: 'Debt consolidation',
    creditScore: 750,
    income: 95000,
    date: '2023-06-11', 
    status: 'approved' 
  },
  { 
    id: 'APP-0021', 
    name: 'Michael Wilson', 
    email: 'michael@example.com',
    amount: 35000, 
    purpose: 'Business expansion',
    creditScore: 620,
    income: 70000,
    date: '2023-06-10', 
    status: 'rejected' 
  },
  { 
    id: 'APP-0020', 
    name: 'Sarah Davis', 
    email: 'sarah@example.com',
    amount: 25000, 
    purpose: 'Education',
    creditScore: 680,
    income: 60000,
    date: '2023-06-09', 
    status: 'pending' 
  },
  { 
    id: 'APP-0019', 
    name: 'Robert Brown', 
    email: 'robert@example.com',
    amount: 85000, 
    purpose: 'Home purchase',
    creditScore: 790,
    income: 120000,
    date: '2023-06-08', 
    status: 'approved' 
  }
];

const extendedLoans = [
  { 
    id: 'LN-0156', 
    userId: 'USER-001',
    borrower: 'James Johnson', 
    amount: 75000, 
    term: 60,
    interestRate: 5.5,
    remainingBalance: 62500, 
    monthlyPayment: 1432.25,
    nextPaymentDate: '2023-07-15',
    startDate: '2023-01-15',
    status: 'current' 
  },
  { 
    id: 'LN-0155', 
    userId: 'USER-002',
    borrower: 'Olivia Smith', 
    amount: 45000, 
    term: 36,
    interestRate: 4.75,
    remainingBalance: 28000, 
    monthlyPayment: 1350.80,
    nextPaymentDate: '2023-07-10',
    startDate: '2022-10-10',
    status: 'current' 
  },
  { 
    id: 'LN-0154', 
    userId: 'USER-003',
    borrower: 'William Davis', 
    amount: 65000, 
    term: 48,
    interestRate: 6.25,
    remainingBalance: 61750, 
    monthlyPayment: 1527.15,
    nextPaymentDate: '2023-06-25',
    startDate: '2023-02-25',
    status: 'overdue' 
  },
  { 
    id: 'LN-0153', 
    userId: 'USER-004',
    borrower: 'Emma Wilson', 
    amount: 38000, 
    term: 24,
    interestRate: 4.25,
    remainingBalance: 12500, 
    monthlyPayment: 1642.75,
    nextPaymentDate: '2023-07-05',
    startDate: '2022-07-05',
    status: 'current' 
  },
  { 
    id: 'LN-0152', 
    userId: 'USER-005',
    borrower: 'Daniel Brown', 
    amount: 95000, 
    term: 72,
    interestRate: 5.85,
    remainingBalance: 81300, 
    monthlyPayment: 1591.30,
    nextPaymentDate: '2023-07-20',
    startDate: '2023-03-20',
    status: 'current' 
  }
];

// Define handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as unknown;
    const { email, password } = (body as { email?: string; password?: string }) || {};
    
    // Very simple auth check
  if (email === 'admin@drivecash.com' && password === 'admin123') {
      return HttpResponse.json({
        user: mockUsers.find(u => u.email === email),
        token: 'mock-jwt-token',
        isAdmin: true
      }, { status: 200 });
    }
    
  if (email === 'user@example.com' && password === 'user123') {
      return HttpResponse.json({
        user: mockUsers.find(u => u.role === 'borrower') || mockUsers[0],
        token: 'mock-jwt-token',
        isAdmin: false
      }, { status: 200 });
    }
    
    return HttpResponse.json({
      message: 'Invalid email or password'
    }, { status: 401 });
  }),
  
  // User endpoints
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers, { status: 200 });
  }),
  
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params as { id: string };
    const user = mockUsers.find(u => u.id === id);
    
    if (user) {
      return HttpResponse.json(user, { status: 200 });
    }
    
    return HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),
  
  // Loan endpoints
  http.get('/api/loans', () => {
    return HttpResponse.json(extendedLoans, { status: 200 });
  }),
  
  http.get('/api/loans/:id', ({ params }) => {
    const { id } = params as { id: string };
    const loan = extendedLoans.find(l => l.id === id);
    
    if (loan) {
      return HttpResponse.json(loan, { status: 200 });
    }
    
    return HttpResponse.json({ message: 'Loan not found' }, { status: 404 });
  }),
  
  http.get('/api/users/:userId/loans', ({ params }) => {
    const { userId } = params as { userId: string };
    const loans = extendedLoans.filter(l => l.userId === userId);
    
    return HttpResponse.json(loans, { status: 200 });
  }),
  
  // Application endpoints
  http.get('/api/applications', () => {
    return HttpResponse.json(mockApplications, { status: 200 });
  }),
  
  http.get('/api/applications/:id', ({ params }) => {
    const { id } = params as { id: string };
    const application = mockApplications.find(a => a.id === id);
    
    if (application) {
      return HttpResponse.json(application, { status: 200 });
    }
    
    return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
  }),
  
  http.post('/api/applications', async ({ request }) => {
    const body = await request.json();
    const newApplication = {
      id: `APP-${String(mockApplications.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...body
    };
    
    // In a real implementation, we would add the application to our mockApplications array
    
    return HttpResponse.json(newApplication, { status: 201 });
  }),
  
  // Payment endpoints
  http.get('/api/payments', () => {
    return HttpResponse.json(mockPayments, { status: 200 });
  }),
  
  http.get('/api/loans/:loanId/payments', () => {
    // In a real implementation, we would filter payments by loan ID
    return HttpResponse.json(mockPayments, { status: 200 });
  }),
  
  // Document endpoints
  http.get('/api/documents', () => {
    return HttpResponse.json(mockDocuments, { status: 200 });
  }),
  
  http.get('/api/users/:userId/documents', () => {
    // In a real implementation, we would filter documents by user ID
    return HttpResponse.json(mockDocuments, { status: 200 });
  })
];
