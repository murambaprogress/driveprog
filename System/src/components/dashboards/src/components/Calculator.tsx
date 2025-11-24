import React, { useState } from 'react';
// import { CreditCard, TrendingUp } from 'lucide-react';

const Calculator: React.FC = () => {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(11.5);
  const [term, setTerm] = useState(36);

  const monthly = (amount * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, term)) / (Math.pow(1 + rate / 100 / 12, term) - 1) || 0;

  return (
    <div className="p-6">
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-drivecash-blue mb-2">Loan Calculator</h2>
  <p className="text-drivecash-gray">Estimate your monthly payment</p>
      </div>
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-lg max-w-xl mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium text-drivecash-gray mb-2">Loan Amount (${amount.toLocaleString()})</label>
          <input type="range" min="1000" max="25000" step="500" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-drivecash-blue" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-drivecash-gray mb-2">Interest Rate ({rate}%)</label>
          <select value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full border border-drivecash-blue/30 rounded-lg px-3 py-2">
            <option value={8.0}>8.0%</option>
            <option value={11.5}>11.5%</option>
            <option value={25.0}>25.0%</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-drivecash-gray mb-2">Term ({term} months)</label>
          <select value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full border border-drivecash-blue/30 rounded-lg px-3 py-2">
            <option value={12}>12 months</option>
            <option value={36}>36 months</option>
            <option value={60}>60 months</option>
          </select>
        </div>
        <div className="text-center mt-8">
          <div className="text-lg text-drivecash-gray mb-1">Estimated Monthly Payment</div>
          <div className="text-3xl font-bold text-drivecash-blue">${monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
