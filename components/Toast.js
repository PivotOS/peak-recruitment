import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 3500);
  }, []);
  const ToastContainer = () => (
    <div className="fixed z-50 bottom-5 right-5 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded shadow-lg font-semibold text-white ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-gray-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
  return { showToast, ToastContainer };
}

export default function ToastProvider({ children }) {
  const toast = useToast();
  return (
    <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}