// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X, Clipboard } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastData[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

// Individual Toast Component
const Toast: React.FC<{ toast: ToastData; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-emerald-500 to-green-600",
      icon: "text-white",
      border: "border-emerald-400/30",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-rose-600",
      icon: "text-white",
      border: "border-red-400/30",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: "text-white",
      border: "border-amber-400/30",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: "text-white",
      border: "border-blue-400/30",
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        ${style.bg} ${style.border}
        flex items-start gap-4 p-4 rounded-2xl shadow-2xl
        border backdrop-blur-xl
        animate-toast-slide-in
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-3xl
        min-w-[320px] max-w-[420px]
      `}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Icon with glow effect */}
      <div className={`${style.icon} flex-shrink-0 mt-0.5`}>
        <div className="relative">
          <div className="absolute inset-0 blur-sm opacity-50">{icons[toast.type]}</div>
          {icons[toast.type]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-bold text-white text-base mb-1 tracking-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-white/90 text-sm font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-black/10">
        <div
          className="h-full bg-white/40 rounded-full animate-toast-progress"
          style={{
            animationDuration: `${toast.duration || 4000}ms`,
          }}
        />
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: ToastData[]; onClose: (id: string) => void }> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => {
      const id = `toast-${++toastIdCounter}`;
      setToasts((prev) => [...prev, { id, type, message, title, duration }]);
    },
    []
  );

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string, duration?: number) => showToast("success", message, title, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => showToast("error", message, title, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => showToast("warning", message, title, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => showToast("info", message, title, duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, closeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastProvider;
