"use client";

import { useState } from "react";

export function ABDMGapBlock({
  assessmentId,
  alreadyCaptured,
  onSubmit,
}: {
  assessmentId: string;
  alreadyCaptured: boolean;
  onSubmit: (message: string) => Promise<void>;
}) {
  // assessmentId currently unused by the UI itself — retained on the prop
  // signature so the parent can wire telemetry / API calls if it later moves
  // here. Suppress unused-warning explicitly.
  void assessmentId;

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't submit. Please try again."
      );
      setSubmitting(false);
      return;
    }
    // On success the parent re-renders with alreadyCaptured=true, so we
    // don't need to clear submitting locally — the success path unmounts
    // this branch.
    setSubmitting(false);
  }

  return (
    <section className="mt-6 rounded-xl bg-[#EAF3EF] border border-[#0F6E56]/30 p-5">
      <h2 className="font-serif text-xl text-[#0E1411] mb-3">
        ABDM integration is required for your product.
      </h2>

      <div className="text-sm text-[#0E1411] leading-relaxed space-y-1 mb-4">
        <p>
          Documentation:{" "}
          <a
            href="https://sandbox.abdm.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
          >
            sandbox.abdm.gov.in
          </a>
        </p>
        <p>
          Partnership:{" "}
          <a
            href="mailto:pm.adoption@nha.gov.in"
            className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
          >
            pm.adoption@nha.gov.in
          </a>
        </p>
      </div>

      <p className="text-sm text-[#0E1411] leading-relaxed mb-3">
        Want help getting started? We can connect you with the NHA team.
      </p>

      {alreadyCaptured ? (
        <span className="inline-flex items-center rounded-full bg-[#0F6E56] text-white px-4 py-1.5 text-sm font-medium">
          We&apos;ll be in touch shortly.
        </span>
      ) : (
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Anything specific you'd like us to mention? (optional)"
            disabled={submitting}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm text-[#0E1411] placeholder:text-[#6B766F] border border-[#D9D5C8] focus:outline-none focus:ring-1 focus:ring-[#0F6E56] focus:border-[#0F6E56] resize-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2 transition-colors"
          >
            {submitting ? "Submitting…" : "Connect me with NHA →"}
          </button>
          {error && <p className="text-xs text-[#993C1D]">{error}</p>}
        </div>
      )}
    </section>
  );
}
