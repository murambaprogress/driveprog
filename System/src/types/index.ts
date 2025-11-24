export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  interestRate: number;
  term: number;
  status: 'active' | 'pending' | 'paid_off' | 'defaulted';
  startDate: string;
  nextPaymentDate: string;
  remainingBalance: number;
  monthlyPayment: number;
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    vin: string;
    value: number;
  };
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: 'card' | 'bank' | 'cash' | 'stripe' | 'paypal' | 'cashapp';
}

export interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalRevenue: number;
  avgLoanAmount: number;
  defaultRate: number;
  monthlyGrowth: number;
}
