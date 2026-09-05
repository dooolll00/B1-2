import { createContext, useCallback, useContext, useEffect, useState } from 'react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const notify = useCallback(message => setToast({ message, id: Date.now() }), []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 4500); return () => clearTimeout(timer); }, [toast]);
  return <ToastContext.Provider value={notify}>{children}{toast && <div className="toast" role="status">✓ {toast.message}<button onClick={() => setToast(null)} aria-label="알림 닫기">×</button></div>}</ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
