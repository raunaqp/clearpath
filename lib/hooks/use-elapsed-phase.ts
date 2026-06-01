"use client";

/**
 * Sprint 4B ITEM 1B + 1C — shared 3s/10s/30s threshold UX for
 * long-running operations (wizard save+complete, synthesis polling).
 *
 * Both consumers want the same threshold ladder. Defining it once here
 * keeps the timings consistent and means a future founder tweak ("make
 * the 'longer than usual' message kick in at 8s") lands in one place.
 *
 * The threshold-to-phase mapping is a pure function (`elapsedToPhase`)
 * for callers that already have elapsed seconds from an external source
 * (e.g. server-stamped lock age). The hook (`useElapsedPhase`) wraps
 * the same function with a client-side stopwatch for callers that need
 * to time their own operation (e.g. fetch round-trip).
 */
import { useEffect, useState } from "react";

export const ELAPSED_PHASE_THRESHOLDS_SECONDS = {
  saving: 3,
  longer: 10,
  stuck: 30,
} as const;

export type ElapsedPhase = "idle" | "saving" | "longer" | "stuck";

export function elapsedToPhase(elapsedSeconds: number): ElapsedPhase {
  if (elapsedSeconds >= ELAPSED_PHASE_THRESHOLDS_SECONDS.stuck) return "stuck";
  if (elapsedSeconds >= ELAPSED_PHASE_THRESHOLDS_SECONDS.longer) return "longer";
  if (elapsedSeconds >= ELAPSED_PHASE_THRESHOLDS_SECONDS.saving) return "saving";
  return "idle";
}

/**
 * Client-side stopwatch variant. Starts counting when `active` flips
 * from false → true, freezes when it flips back to false. Re-arming
 * (active goes false → true again) resets the clock.
 *
 * Returns both the phase and the live elapsed-seconds count so callers
 * can render an inline counter without recomputing.
 */
export function useElapsedPhase(active: boolean): {
  phase: ElapsedPhase;
  elapsedSeconds: number;
} {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      // One-shot reset on the inactive transition. Linter flags this as
      // "setState in effect" because it can cascade in render-driven
      // effects; here it can't — `active` is a user-driven state flip
      // (busy → idle), and the reset runs at most once per transition.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(0);
      return;
    }
    const startedAtMs = Date.now();
    // Tick at 500ms — enough to land cleanly on the second-aligned
    // 3/10/30 boundaries without burning render cycles. setInterval is
    // fine here; we never need sub-second precision for these
    // user-facing thresholds.
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtMs) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, [active]);

  return { phase: elapsedToPhase(elapsedSeconds), elapsedSeconds };
}
