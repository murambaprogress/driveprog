// Centralized mock data used by MSW handlers
export const mockPayments = [
  { id: 'PAY-001', loanId: 'LN-0156', amount: 1500, date: '2023-06-15', status: 'paid' },
  { id: 'PAY-002', loanId: 'LN-0155', amount: 1350.8, date: '2023-06-10', status: 'paid' }
];

export const mockDocuments = [
  { id: 'DOC-001', name: 'title.pdf', uploadedBy: 'USER-001', date: '2023-05-01' },
  { id: 'DOC-002', name: 'insurance.pdf', uploadedBy: 'USER-002', date: '2023-05-03' }
];

export const mockLoans = [];
