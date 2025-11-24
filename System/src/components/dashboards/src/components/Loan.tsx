import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Loan: React.FC = () => {
  // Demo loan data
  const loan = {
    id: 'LN-001',
    amount: 15000,
    interestRate: 11.5,
    term: 36,
    startDate: '2024-01-20',
    nextPaymentDate: '2024-12-20',
    remainingBalance: 8500,
    status: 'active',
  };

  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const makePayment = async () => {
    setProcessing(true);
    // create a demo payment and persist to localStorage
    const payment = { id: `P${Date.now()}`, date: new Date().toISOString(), amount: 500, method: 'Card', status: 'Completed' };
    try {
  const prev = JSON.parse(localStorage.getItem('drivecash_user_payments') || '[]');
      prev.unshift(payment);
  localStorage.setItem('drivecash_user_payments', JSON.stringify(prev));
    } catch {}
    await new Promise(r => setTimeout(r, 800));
    setProcessing(false);
    alert('Payment processed (demo).');
  };

  const goApply = () => navigate('/portal');

  return (
    <div className="p-6">
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-drivecash-blue mb-2">Loan Details</h2>
  <p className="text-drivecash-gray">View and manage your current loan</p>
      </div>
  <div className="bg-white/30 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-lg max-w-xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <CreditCard className="w-10 h-10 text-drivecash-blue" />
          <div>
            <div className="text-lg font-semibold text-drivecash-blue">Loan ID: <span className="text-drivecash-gray">{loan.id}</span></div>
            <div className="text-sm text-drivecash-gray">Status: <span className="font-bold text-green-600">{loan.status}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs text-drivecash-gray">Original Amount</div>
            <div className="text-xl font-bold text-drivecash-blue">${loan.amount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-drivecash-gray">Payoff Amount</div>
            <div className="text-xl font-bold text-drivecash-blue">${loan.remainingBalance.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-drivecash-gray">Interest Rate</div>
            <div className="text-xl font-bold text-drivecash-blue">{loan.interestRate}%</div>
          </div>
          <div>
            <div className="text-xs text-drivecash-gray">Term</div>
            <div className="text-xl font-bold text-drivecash-blue">{loan.term} months</div>
          </div>
          <div>
            <div className="text-xs text-drivecash-gray">Start Date</div>
            <div className="text-xl font-bold text-drivecash-blue">{new Date(loan.startDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-xs text-drivecash-gray">Next Payment</div>
            <div className="text-xl font-bold text-drivecash-blue">{new Date(loan.nextPaymentDate).toLocaleDateString()}</div>
          </div>
        </div>
  <button onClick={makePayment} disabled={processing} className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:opacity-95 transition mb-4">{processing ? 'Processing...' : 'Make a Payment'}</button>
  <button onClick={goApply} className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow hover:opacity-95 transition">Apply</button>
      </div>
    </div>
  );
};

export default Loan;
