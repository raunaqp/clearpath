"use client";

/**
 * Sprint 4B ITEM 1A — synthesis polling shell.
 *
 * Mirrors the StatusPanel polling pattern at app/upgrade/[id]/StatusPanel.tsx
 * (setInterval-based, no-store cache, cleanup on unmount). Replaces the
 * old behavior where /assess/[id] blocked the server response for the
 * 20-30s Opus call.
 *
 * Sub-item A scope: basic polling, redirect on completed, retry on error.
 * Sub-item C will layer 3s/10s/30s threshold feedback on top of this shell.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { elapsedToPhase } from "@/lib/hooks/use-elapsed-phase";

const POLL_INTERVAL_MS = 2000;

type StatusResponse = {
  status: string;
  share_token: string | null;
  age_seconds: number | null;
  error_type: string | null;
  error_message: string | null;
  retry_count: number;
};

export function SynthesisPolling({
  assessmentId,
  initialAgeSeconds,
  onRetry,
}: {
  assessmentId: string;
  /** Seconds elapsed on the synthesizer lock at first paint. null if the
   *  lock hadn't yet been stamped (just-dispatched case). */
  initialAgeSeconds: number | null;
  /** Server action that flips the row back to wizard_complete so the
   *  next page render kicks off a fresh attempt. Surfaced when the
   *  endpoint reports an error or the user requests a stuck-retry. */
  onRetry: () => Promise<void>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [terminalError, setTerminalError] = useState<{
    type: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/synthesis/status?assessment_id=${encodeURIComponent(assessmentId)}`,
          { cache: "no-store" }
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as StatusResponse;
        if (cancelled) return;
        setStatus(data);

        if (data.status === "completed" && data.share_token) {
          // Hard navigation: the destination is server-rendered with the
          // assessment's freshly-stamped readiness_card; we want a clean
          // fetch, not a router-cache hit.
          window.location.href = `/c/${data.share_token}`;
          return;
        }
        if (data.status === "synthesizer_error") {
          setTerminalError({
            type: data.error_type ?? "unknown",
            message: data.error_message ?? "Synthesis failed.",
          });
        }
      } catch {
        // best-effort poll; never throw to UI
      }
    };
    // Fire immediately + then interval — the very first paint is from
    // server data, but we want a fresh poll before the 2s interval to
    // catch the "already completed" race when the server response is
    // slightly delayed.
    poll();
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [assessmentId, router]);

  const ageSeconds = status?.age_seconds ?? initialAgeSeconds ?? 0;
  // Sprint 4B ITEM 1C — same 3s/10s/30s ladder as the wizard busy
  // feedback. Source is server-stamped synthesizer_running_at, so
  // page reloads pick up the real lock age, not a fresh client clock.
  const phase = elapsedToPhase(ageSeconds);

  if (terminalError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="font-serif text-2xl text-[#0E1411] mb-3">
          Generation hit a snag.
        </p>
        <p className="text-[#6B766F] mb-6">{terminalError.message}</p>
        <form
          action={async () => {
            await onRetry();
          }}
        >
          <button
            type="submit"
            className="text-sm rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-4 py-2"
          >
            Try again
          </button>
        </form>
      </div>
    );
  }

  // Phase ladder:
  //  idle/saving (0–9s)    — normal Opus latency window; just the spinner + tagline.
  //  longer      (10–29s)  — surface the "longer than usual" tone so the user knows
  //                          we noticed and to keep waiting.
  //  stuck       (≥30s)    — offer the unstick affordance. The same `onRetry` server
  //                          action used for the terminal-error path: flips the row
  //                          back to wizard_complete, the next page load redrives
  //                          synthesis with a fresh worker.
  const isStuck = phase === "stuck";
  const isLonger = phase === "longer";

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <div className="inline-block h-8 w-8 rounded-full border-2 border-[#0F6E56]/30 border-t-[#0F6E56] animate-spin mb-5" />
      <p className="font-serif text-2xl text-[#0E1411] mb-2">
        Generating your readiness card…
      </p>
      <p className="text-sm text-[#6B766F]">
        {isStuck
          ? "Still working, but this is taking unusually long."
          : isLonger
            ? "This is taking longer than usual — still working."
            : "Working through your assessment. This usually takes 20–30 seconds."}
      </p>
      {ageSeconds > 0 ? (
        <p className="text-xs text-[#6B766F] mt-3 font-mono">
          {ageSeconds}s elapsed
        </p>
      ) : null}
      {isStuck ? (
        <form
          action={async () => {
            await onRetry();
          }}
          className="mt-5"
        >
          <button
            type="submit"
            className="text-sm rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-4 py-2"
          >
            Restart generation
          </button>
        </form>
      ) : null}
    </div>
  );
}
