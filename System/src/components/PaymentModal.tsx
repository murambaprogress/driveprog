import React, { useState } from 'react';
import { Payment } from '../types';

interface Props {
  open: boolean;
  defaultAmount?: number;
  onClose: () => void;
  onConfirm: (amount: number, method: Payment['method']) => void;
}

export const PaymentModal: React.FC<Props> = ({ open, defaultAmount = 0, onClose, onConfirm }) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [method, setMethod] = useState<Payment['method']>('card');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Make Payment</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])} className="mt-1 block w-full p-2 border rounded">
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="cashapp">CashApp</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button onClick={() => { onConfirm(amount, method); onClose(); }} className="px-4 py-2 rounded bg-blue-600 text-white">Pay</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
