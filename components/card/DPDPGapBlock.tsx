"use client";

import { useState } from "react";

export function DPDPGapBlock({
  assessmentId,
  alreadyCaptured,
  onSubmit,
}: {
  assessmentId: string;
  alreadyCaptured: boolean;
  onSubmit: () => Promise<void>;
}) {
  void assessmentId;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't submit. Please try again."
      );
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-6 rounded-xl bg-[#FAEEDA] border border-[#BA7517]/30 p-5">
      <h2 className="font-serif text-xl text-[#0E1411] mb-3">
        DPDP Act 2023 likely applies to your product.
      </h2>

      <p className="text-sm text-[#0E1411] leading-relaxed mb-2">
        We&apos;re building a DPDP-first Draft Pack for products at scale.
      </p>
      <p className="text-xs text-[#6B766F] leading-relaxed mb-4">
        Email pre-filled from intake.
      </p>

      {alreadyCaptured ? (
        <span className="inline-flex items-center rounded-full bg-[#BA7517] text-white px-4 py-1.5 text-sm font-medium">
          We&apos;ll email you when it&apos;s ready.
        </span>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#BA7517] hover:bg-[#9a6113] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2 transition-colors"
          >
            {submitting ? "Submitting…" : "Notify me — coming May 2026 →"}
          </button>
          {error && <p className="text-xs text-[#993C1D]">{error}</p>}
        </div>
      )}
    </section>
  );
}
