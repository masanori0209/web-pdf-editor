import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 2;
const TOAST_DURATION: Record<ToastType, number> = {
  info: 3000,
  success: 2500,
  error: 4500,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    const duration = TOAST_DURATION[type];

    setToasts((prev) => {
      let next = prev.filter((toast) => toast.message !== message);
      if (type === 'success') {
        next = next.filter((toast) => toast.type !== 'success');
      }
      next = [...next, { id, message, type }];
      return next.slice(-MAX_TOASTS);
    });

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            data-testid={`toast-${toast.type}`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
