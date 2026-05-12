"use client";

import { useState } from "react";

type Props = {
  email: string;
  /** Where to send the verification link after they click it (Supabase
   *  appends a token then redirects). We use the current upgrade page. */
  returnTo: string;
};

/**
 * Sprint 2 closeout — verification gate that sits above the Cashfree
 * pay block on /upgrade/[id]. Customer can't pay until they confirm
 * the email Draft Pack delivery uses.
 *
 * "Resend verification email" calls /api/auth/resend-verification —
 * implemented as a thin wrapper around Supabase's auth.resend().
 */
export function EmailVerifyGate({ email, returnTo }: Props) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ return_to: returnTo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message ?? body.error ?? `HTTP ${res.status}`
        );
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg bg-[#FAEEDA] border border-[#BA7517]/40 px-5 py-4">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#BA7517] mb-1.5">
        Verify your email
      </p>
      <p className="text-sm text-[#0E1411] leading-relaxed">
        Your Draft Pack will be emailed to{" "}
        <span className="font-medium">{email}</span>. Click the link in
        your inbox (sent at signup) to confirm the address before paying.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={resend}
          disabled={pending || sent}
          className="inline-flex items-center rounded-md border border-[#BA7517] bg-white px-3 py-1.5 text-sm font-medium text-[#633806] hover:bg-[#FAEEDA] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sent
            ? "Sent ✓"
            : pending
              ? "Sending…"
              : "Resend verification email"}
        </button>
        {error ? (
          <span className="text-xs text-[#993C1D]">⚠ {error}</span>
        ) : null}
      </div>
    </div>
  );
}
