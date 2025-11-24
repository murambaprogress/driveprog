import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanCalculatorSchema, type LoanCalculatorFormData } from '../../../utils/validation';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface LoanCalculatorProps {
  className?: string;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ className }) => {
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  
  const {
    register,
  // handleSubmit is not used because the calculator updates live
    watch,
    formState: { errors },
  } = useForm<LoanCalculatorFormData>({
    resolver: zodResolver(loanCalculatorSchema),
    defaultValues: {
      amount: 10000,
      term: 36,
      interestRate: 5.5,
    },
  });
  
  // Get the current form values for calculation
  const amount = watch('amount');
  const term = watch('term');
  const interestRate = watch('interestRate');
  
  // Calculate loan details whenever form values change
  useEffect(() => {
    if (amount && term && interestRate && !isNaN(amount) && !isNaN(term) && !isNaN(interestRate)) {
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPaymentValue = 
        (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
        (Math.pow(1 + monthlyRate, term) - 1);
      
      const totalPaymentValue = monthlyPaymentValue * term;
      const totalInterestValue = totalPaymentValue - amount;
      
      setMonthlyPayment(monthlyPaymentValue);
      setTotalPayment(totalPaymentValue);
      setTotalInterest(totalInterestValue);
    }
  }, [amount, term, interestRate]);
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Calculator</h2>
        <form className="space-y-4">
          <div>
            <label 
              htmlFor="amount" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Loan Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="amount"
                type="number"
                className={`w-full pl-8 pr-4 py-2 border ${
                  errors.amount ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.amount ? 'true' : 'false'}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                min="1000"
                max="100000"
                step="500"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>
          
          <div>
            <label 
              htmlFor="term" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Loan Term (months)
            </label>
            <select
              id="term"
              className={`w-full px-4 py-2 border ${
                errors.term ? 'border-red-300 ring-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={errors.term ? 'true' : 'false'}
              aria-describedby={errors.term ? 'term-error' : undefined}
              {...register('term', { valueAsNumber: true })}
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
              <option value={48}>48 months</option>
              <option value={60}>60 months</option>
              <option value={72}>72 months</option>
            </select>
            {errors.term && (
              <p id="term-error" className="mt-1 text-sm text-red-600">
                {errors.term.message}
              </p>
            )}
          </div>
          
          <div>
            <label 
              htmlFor="interestRate" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                id="interestRate"
                type="number"
                className={`w-full pr-8 pl-4 py-2 border ${
                  errors.interestRate ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.interestRate ? 'true' : 'false'}
                aria-describedby={errors.interestRate ? 'interestRate-error' : undefined}
                step="0.1"
                min="1"
                max="30"
                {...register('interestRate', { valueAsNumber: true })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
            {errors.interestRate && (
              <p id="interestRate-error" className="mt-1 text-sm text-red-600">
                {errors.interestRate.message}
              </p>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-b-xl border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Loan Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly Payment</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Payment</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalPayment)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Interest</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalInterest)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            This calculator provides an estimate based on the information you enter.
            Actual loan offers may vary based on credit history, income verification, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
