import { createContext, useContext, useState, useCallback } from 'react';

/* ── Toast Context ─────────────────────────────────────────── */
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
};

/* ── Icon helpers ──────────────────────────────────────────── */
const icons = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const styles = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error:   'bg-red-500/10 border-red-500/30 text-red-300',
  info:    'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
};

/* ── Toast Item ────────────────────────────────────────────── */
const ToastItem = ({ toast, onRemove }) => (
  <div
    className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-up text-sm font-medium min-w-[280px] max-w-[360px] ${styles[toast.type] || styles.info}`}
    role="alert"
  >
    <span className="mt-0.5">{icons[toast.type] || icons.info}</span>
    <span className="flex-1 leading-snug">{toast.message}</span>
    <button
      onClick={() => onRemove(toast.id)}
      className="opacity-50 hover:opacity-100 transition-opacity mt-0.5"
      aria-label="Dismiss notification"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

/* ── Toast Container ───────────────────────────────────────── */
const ToastContainer = ({ toasts, onRemove }) => (
  <div
    aria-live="polite"
    className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
  >
    {toasts.map((t) => (
      <ToastItem key={t.id} toast={t} onRemove={onRemove} />
    ))}
  </div>
);
