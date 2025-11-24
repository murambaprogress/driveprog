import React, { useEffect, useState } from 'react';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
  try { const p = JSON.parse(localStorage.getItem('drivecash_user_payments') || 'null'); setPayments(p || []); } catch { setPayments([]); }
  }, []);

  const markComplete = (id: string) => {
    setPayments(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p);
  try { localStorage.setItem('drivecash_user_payments', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-drivecash-blue mb-2">Payments</h2>
  <p className="text-drivecash-gray">View your payment history and manage upcoming payments</p>
      </div>
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-lg max-w-2xl mx-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-drivecash-blue text-sm">
              <th className="pb-2">Date</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Method</th>
              <th className="pb-2">Status</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-drivecash-gray/10 last:border-0">
                <td className="py-2 text-drivecash-gray">{new Date(p.date).toLocaleDateString()}</td>
                <td className="py-2 text-drivecash-blue font-semibold">${p.amount.toLocaleString()}</td>
                <td className="py-2 text-drivecash-gray">{p.method}</td>
                <td className={`py-2 font-semibold ${p.status === 'Completed' ? 'text-green-600' : 'text-yellow-500'}`}>{p.status}</td>
                <td className="py-2">
                  {p.status !== 'Completed' && (
                    <button onClick={() => markComplete(p.id)} className="px-3 py-1 bg-green-500 text-white rounded">Mark Complete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
