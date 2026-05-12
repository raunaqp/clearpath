"use client";

import { useState } from "react";

type Props = {
  assessmentId: string;
};

/**
 * Story 2.8 — "Pay ₹499 via Cashfree" button.
 *
 * Calls /api/cashfree/create-order, then redirects the browser to
 * Cashfree's hosted checkout URL. On payment completion Cashfree
 * redirects back to /api/cashfree/return → /upgrade/[id].
 *
 * Only shown when Cashfree is configured server-side (page-level
 * check). If keys are missing the create-order endpoint returns
 * 503 — caught here and surfaced as a banner so the customer
 * doesn't get a silent failure.
 */
export function CashfreePayButton({ assessmentId }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.checkout_url) {
        throw new Error(
          body.message ?? body.error ?? `HTTP ${res.status}`
        );
      }
      window.location.href = body.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0a5a47] text-white font-medium text-[15px] px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Redirecting…" : "Pay ₹499 with Cashfree →"}
      </button>
      <p className="text-xs text-[#6B766F]">
        UPI · cards · netbanking — handled by Cashfree on their
        secure page.
      </p>
      {error ? (
        <p className="text-xs text-[#993C1D]">⚠ {error}</p>
      ) : null}
    </div>
  );
}
