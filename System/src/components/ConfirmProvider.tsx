import React, { createContext, useContext, useState } from 'react';

type ConfirmFn = (options: { title?: string; description?: string; confirmLabel?: string; cancelLabel?: string }) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ resolve?: (v: boolean) => void; title?: string; description?: string; confirmLabel?: string; cancelLabel?: string } | null>(null);

  const confirm: ConfirmFn = (options = {}) => {
    return new Promise<boolean>(res => {
      setState({ resolve: res, title: options.title, description: options.description, confirmLabel: options.confirmLabel || 'Yes', cancelLabel: options.cancelLabel || 'Cancel' });
    });
  };

  const handleClose = (result: boolean) => {
    if (state?.resolve) state.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">{state.title || 'Confirm'}</h3>
            <p className="text-sm text-gray-600 mb-4">{state.description}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleClose(false)} className="px-4 py-2 rounded bg-gray-100">{state.cancelLabel}</button>
              <button onClick={() => handleClose(true)} className="px-4 py-2 rounded bg-blue-600 text-white">{state.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
