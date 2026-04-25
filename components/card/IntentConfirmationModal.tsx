"use client";

import { useEffect, useRef } from "react";

const COPY: Record<
  "abdm" | "dpdp",
  { title: string; subject: string }
> = {
  abdm: {
    title: "Got it — ABDM interest captured.",
    subject: "ABDM",
  },
  dpdp: {
    title: "Got it — DPDP interest captured.",
    subject: "DPDP",
  },
};

const AUTO_DISMISS_MS = 5000;

export function IntentConfirmationModal({
  open,
  type,
  email,
  onClose,
}: {
  open: boolean;
  type: "abdm" | "dpdp";
  email: string;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-focus the close button when the modal opens.
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  // Auto-dismiss timer. Cleared on close (state change) or unmount.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  // Escape key closes.
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const copy = COPY[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-labelledby="intent-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white border border-[#D9D5C8] shadow-lg p-6 sm:p-7"
      >
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F6E56] mb-3">
          Saved
        </p>
        <h2
          id="intent-modal-title"
          className="font-serif text-xl text-[#0E1411] mb-3"
        >
          {copy.title}
        </h2>
        <p className="text-sm text-[#0E1411] leading-relaxed mb-2">
          We&apos;ve captured your interest in {copy.subject} guidance. Our
          team will follow up at{" "}
          <span className="font-medium">{email}</span> within 48 hours with
          curated resources and next steps.
        </p>
        <p className="text-xs text-[#6B766F] leading-relaxed mb-5">
          You can close this and continue browsing your card. We&apos;ll be
          in touch.
        </p>
        <div className="flex justify-end">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-sm px-5 py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
