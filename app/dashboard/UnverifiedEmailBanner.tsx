"use client";

import { useState } from "react";

type Props = {
  email: string;
};

/**
 * Sprint 2 closeout — dismissable banner that nudges unverified
 * customers to confirm their email before they hit /upgrade/[id].
 * Dismiss is session-scoped (state only); we don't persist to DB —
 * the banner returns on a fresh tab, which is the right behaviour
 * until the customer actually verifies.
 */
export function UnverifiedEmailBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [resentAt, setResentAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  async function resend() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ return_to: "/dashboard" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      setResentAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg bg-[#FAEEDA] border border-[#BA7517]/40 px-4 py-3 flex flex-wrap items-start justify-between gap-3">
      <div className="flex-1 min-w-[240px]">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#BA7517] mb-1">
          Verify your email
        </p>
        <p className="text-sm text-[#0E1411] leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-medium">{email}</span>. Verify before
          paying so we can email your Draft Pack to that address.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={resend}
          disabled={pending || !!resentAt}
          className="inline-flex items-center rounded-md border border-[#BA7517] bg-white px-3 py-1.5 text-xs font-medium text-[#633806] hover:bg-[#FAEEDA] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resentAt
            ? "Sent ✓"
            : pending
              ? "Sending…"
              : "Resend email"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="inline-flex items-center rounded-md px-2 py-1.5 text-xs text-[#6B766F] hover:text-[#0E1411]"
        >
          ✕
        </button>
      </div>
      {error ? (
        <p className="basis-full text-xs text-[#993C1D]">⚠ {error}</p>
      ) : null}
    </div>
  );
}
