import React, { createContext, useContext, useState, useCallback } from 'react';

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' | 'warn' };

const ToastContext = createContext<{ push: (message: string, type?: Toast['type']) => void } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const t: Toast = { id: `t_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, message, type };
    setToasts(prev => [t, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {toasts.filter(t => t.message !== 'Session auto-extended 5 minutes').map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-2 rounded shadow-lg text-white ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : t.type === 'warn' ? 'bg-yellow-500 text-black' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
