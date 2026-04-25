"use client";

import { useState } from "react";

export function SynthesizerErrorPanel({
  assessmentId,
  onRetry,
}: {
  assessmentId: string;
  onRetry: () => Promise<void>;
}) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    try {
      await onRetry();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Retry failed. Please try again in a moment."
      );
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-[clamp(24px,3vw,32px)] leading-tight text-[#0E1411] mb-3">
          We hit a snag generating your Readiness Card.
        </h1>
        <p className="text-[#6B766F] text-base mb-6 leading-relaxed">
          Don&apos;t worry — your data is saved.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          {retrying && (
            <span
              aria-hidden
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
            />
          )}
          {retrying ? "Retrying…" : "Try again"}
        </button>

        {error && (
          <p className="text-sm text-[#993C1D] mt-4" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-[#6B766F] mt-8 leading-relaxed">
          If this keeps happening, email{" "}
          <a
            href="mailto:founder@clearpath.in"
            className="underline underline-offset-2 hover:text-[#0E1411]"
          >
            founder@clearpath.in
          </a>{" "}
          with your assessment ID:{" "}
          <code className="font-mono text-[#0E1411] bg-[#F7F6F2] px-1.5 py-0.5 rounded border border-[#D9D5C8]">
            {assessmentId}
          </code>
        </p>
      </div>
    </div>
  );
}
