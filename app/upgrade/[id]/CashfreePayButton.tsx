"use client";

import { useState } from "react";
import { load, type CashfreeMode } from "@cashfreepayments/cashfree-js";

type Props = {
  assessmentId: string;
  /** 'TEST' | 'PROD' — set on the page from process.env.CASHFREE_ENVIRONMENT
   *  (server-side) so the SDK loads against the right Cashfree origin. */
  cashfreeEnv: "TEST" | "PROD";
};

/**
 * Story 2.8 — "Pay ₹499 via Cashfree" button (SDK flow).
 *
 * Calls /api/cashfree/create-order to obtain a payment_session_id,
 * then hands it to Cashfree's JS SDK which navigates to the correct
 * hosted-checkout URL. Earlier iteration tried to construct that
 * URL ourselves and 404'd because the pattern we guessed was an API
 * path, not a customer-facing path.
 */
export function CashfreePayButton({ assessmentId, cashfreeEnv }: Props) {
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
      if (!res.ok || !body.session_id) {
        throw new Error(
          body.message ?? body.error ?? `HTTP ${res.status}`
        );
      }
      const mode: CashfreeMode =
        cashfreeEnv === "PROD" ? "production" : "sandbox";
      const cashfree = await load({ mode });
      // redirectTarget '_self' navigates the current tab; SDK handles
      // the right URL for the SDK version.
      await cashfree.checkout({
        paymentSessionId: body.session_id,
        redirectTarget: "_self",
      });
      // If we reach here the SDK didn't redirect — surface that.
      setError("Cashfree did not redirect. Try again or refresh the page.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
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
        UPI · cards · netbanking — handled by Cashfree on their secure
        page.
        {cashfreeEnv === "TEST" ? (
          <span className="ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#FAEEDA] text-[#633806] border border-[#BA7517]/40">
            Sandbox · test mode
          </span>
        ) : null}
      </p>
      {error ? (
        <p className="text-xs text-[#993C1D]">⚠ {error}</p>
      ) : null}
    </div>
  );
}
