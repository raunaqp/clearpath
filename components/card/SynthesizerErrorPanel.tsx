"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

export type SynthesizerErrorType =
  | "opus_failure"
  | "save_failed"
  | "fetch_failed"
  | "unknown";

export function SynthesizerErrorPanel({
  assessmentId,
  retryCount,
  errorType,
  canRetry,
  onRetry,
}: {
  assessmentId: string;
  retryCount: number;
  errorType: SynthesizerErrorType;
  canRetry: boolean;
  onRetry: () => Promise<void>;
}) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fire posthog event once per mount per (assessmentId, retry_count, error_type) combo.
  // useEffect alone reruns on prop change, but the combo is what changes between attempts
  // — and that's the desired event boundary.
  const seenKey = useRef<string | null>(null);
  useEffect(() => {
    const key = `${assessmentId}:${retryCount}:${errorType}`;
    if (seenKey.current === key) return;
    seenKey.current = key;
    try {
      posthog.capture("synthesizer_error_shown", {
        assessment_id: assessmentId,
        error_type: errorType,
        retry_count: retryCount,
      });
    } catch {
      // posthog may be uninitialised in some envs; never block rendering.
    }
  }, [assessmentId, retryCount, errorType]);

  async function handleRetry() {
    try {
      posthog.capture("synthesizer_retry_clicked", {
        assessment_id: assessmentId,
        retry_count: retryCount,
      });
    } catch {
      // telemetry only
    }
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
          Generation taking longer than expected.
        </h1>
        <p className="text-[#6B766F] text-base mb-6 leading-relaxed">
          Your data is saved — nothing lost. Try again, or email us if
          this keeps happening.
        </p>

        {canRetry ? (
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
        ) : (
          <p className="text-sm text-[#993C1D] font-medium">
            We&apos;ve tried 3 times — please email us so we can investigate.
          </p>
        )}

        {error && (
          <p className="text-sm text-[#993C1D] mt-4" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-[#6B766F] mt-8 leading-relaxed">
          {canRetry ? "If this keeps happening, email" : "Email"}{" "}
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
