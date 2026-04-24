"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Toast = {
  id: string;
  message: string;
  retry?: () => void | Promise<void>;
};

type ToastCtx = {
  showToast: (message: string, retry?: () => void | Promise<void>) => void;
  dismissToast: () => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

/**
 * useToast — throws if called outside <WizardToastRoot>. Wizard
 * components rely on the layout to mount the provider; consumers
 * without a provider should fail loudly.
 */
export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <WizardToastRoot>");
  }
  return ctx;
}

/**
 * WizardToastRoot
 * Renders at the wizard layout level so the toast survives
 * client-side navigation between /wizard/[id]/q/[n] pages.
 *
 * Single-slot model: newest toast replaces older. Auto-dismiss
 * after 10s unless the user clicks Retry (Retry success dismisses).
 */
export default function WizardToastRoot({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = toast.id;
    const timer = setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 10000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback(
    (message: string, retry?: () => void | Promise<void>) => {
      setToast({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        message,
        retry,
      });
    },
    []
  );

  const dismissToast = useCallback(() => setToast(null), []);

  async function handleRetry() {
    if (!toast?.retry) return;
    try {
      await toast.retry();
      setToast((cur) => (cur?.id === toast.id ? null : cur));
    } catch {
      // Retry also failed — keep the toast up, reset dismiss timer.
      setToast((cur) =>
        cur?.id === toast.id
          ? {
              ...cur,
              id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : String(Date.now()),
            }
          : cur
      );
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <div
          className="fixed inset-x-0 bottom-6 flex justify-center z-50 px-4 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div
            data-wizard-toast
            className="pointer-events-auto max-w-md w-full bg-[#0E1411] text-white rounded-lg px-4 py-3 shadow-lg flex items-center justify-between gap-3"
          >
            <p className="text-sm">{toast.message}</p>
            {toast.retry && (
              <button
                type="button"
                data-wizard-toast-retry
                onClick={handleRetry}
                className="text-[#7ed6bc] font-medium text-sm underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1411] rounded"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
