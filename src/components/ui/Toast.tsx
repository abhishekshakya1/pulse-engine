"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastContextType {
  show: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (title: string, message?: string, type: ToastType = "info") => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts at once

      setTimeout(() => {
        removeToast(id);
      }, 4200);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => show(title, message, "success"), [show]);
  const error = useCallback((title: string, message?: string) => show(title, message, "error"), [show]);
  const info = useCallback((title: string, message?: string) => show(title, message, "info"), [show]);
  const warning = useCallback((title: string, message?: string) => show(title, message, "warning"), [show]);

  const value = useMemo(
    () => ({ show, success, error, info, warning }),
    [show, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Floating Glassmorphic Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none transition-all duration-300"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
              item.type === "success"
                ? "bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 text-slate-900 dark:text-white shadow-emerald-500/10"
                : item.type === "error"
                ? "bg-white/95 dark:bg-slate-900/95 border-rose-500/40 text-slate-900 dark:text-white shadow-rose-500/10"
                : item.type === "warning"
                ? "bg-white/95 dark:bg-slate-900/95 border-amber-500/40 text-slate-900 dark:text-white shadow-amber-500/10"
                : "bg-white/95 dark:bg-slate-900/95 border-indigo-500/40 text-slate-900 dark:text-white shadow-indigo-500/10"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {item.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {item.type === "error" && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {item.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {item.type === "info" && <Info className="h-5 w-5 text-indigo-500" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                {item.title}
              </h4>
              {item.message && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
