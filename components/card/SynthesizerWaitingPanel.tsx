"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_REFRESH_MS = 3000;
const MESSAGES = [
  "Mapping CDSCO classifications…",
  "Cross-checking DPDP framework…",
  "Reviewing ICMR AI guidelines…",
  "Checking ABDM consent rules…",
  "Aligning to IMDRF SaMD framework…",
  "Drafting regulatory verdict…",
  "Identifying compliance gaps…",
] as const;
const MESSAGE_ROTATION_S = 3.5;
const ELAPSED_VISIBLE_AFTER_S = 15;
const ALMOST_THERE_AFTER_S = 25;
const RETRY_AVAILABLE_AFTER_S = 45;

export function SynthesizerWaitingPanel({
  ageSeconds,
  onRetry,
}: {
  ageSeconds: number;
  onRetry?: () => Promise<void>;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Lightweight page-level polling — re-renders the server component so
  // we pick up status transitions (synthesizing → completed, etc.).
  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), PAGE_REFRESH_MS);
    return () => clearTimeout(timer);
  }, [router]);

  // Theater messages rotate with elapsed time. Deriving from the
  // server-provided ageSeconds keeps the rotation deterministic across
  // page-refresh re-renders.
  const messageIdx =
    Math.floor(ageSeconds / MESSAGE_ROTATION_S) % MESSAGES.length;
  const showElapsed = ageSeconds >= ELAPSED_VISIBLE_AFTER_S;
  const showAlmostThere = ageSeconds >= ALMOST_THERE_AFTER_S;
  const showRetry = ageSeconds >= RETRY_AVAILABLE_AFTER_S && !!onRetry;

  const headline = showAlmostThere
    ? "Almost there…"
    : MESSAGES[messageIdx];

  async function handleRetry() {
    if (!onRetry) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await onRetry();
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : "Retry failed.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div
          aria-hidden
          className="inline-block w-8 h-8 rounded-full border-2 border-[#0F6E56]/20 border-t-[#0F6E56] animate-spin mb-4"
        />
        <h1
          className="font-serif text-xl text-[#0E1411] mb-2 min-h-[28px]"
          aria-live="polite"
        >
          {headline}
        </h1>
        <p className="text-sm text-[#6B766F]">
          Generating your Readiness Card. This page refreshes itself.
        </p>
        {showElapsed && (
          <p className="text-xs text-[#6B766F] mt-3 font-mono">
            {ageSeconds} seconds elapsed
          </p>
        )}
        {showRetry && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium px-5 py-2 transition-colors"
            >
              {retrying ? "Retrying…" : "Try again"}
            </button>
            {retryError && (
              <p className="text-xs text-[#993C1D] mt-2" role="alert">
                {retryError}
              </p>
            )}
            <p className="text-xs text-[#6B766F] mt-3 leading-relaxed">
              This usually finishes in 30 seconds. Click retry if it&apos;s
              been longer than that — your data is saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
