"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: string; message: string; kind: ToastKind };

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4600);
  }, []);

  const dismiss = (id: string) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[120] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        {toasts.map((toast) => {
          const Icon =
            toast.kind === "error" ? AlertCircle : toast.kind === "info" ? Info : CheckCircle2;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
                toast.kind === "error"
                  ? "border-rose-400/25 bg-rose-950/90 text-rose-100"
                  : toast.kind === "info"
                    ? "border-sky-400/25 bg-sky-950/90 text-sky-100"
                    : "border-mint/25 bg-[#061c16]/95 text-emerald-50"
              }`}
              role="status"
            >
              <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  toast.kind === "error"
                    ? "text-rose-300"
                    : toast.kind === "info"
                      ? "text-sky-300"
                      : "text-mint"
                }`}
              />
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="mt-0.5 rounded p-0.5 text-white/40 transition hover:text-white"
                aria-label="Cerrar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
