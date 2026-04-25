"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";

const MAX_RETRIES = 3;
const RUNNING_LOCK_TTL_MS = 60_000;
const STUCK_RETRY_THRESHOLD_MS = 45_000;

export type RetrySynthesisOutcome =
  | { ok: true }
  | { ok: false; reason: "max_retries" | "running" | "wrong_state" | "error" };

/**
 * Retry the synthesizer from either:
 *   (a) `synthesizer_error` — the canonical retry path (post-failure).
 *       Subject to MAX_RETRIES and the 60s in-flight lock TTL.
 *   (b) `synthesizing` with `synthesizer_running_at` older than 45s —
 *       the "user-driven unstick" path triggered from the waiting
 *       panel's retry button. Bypasses retry_count (this isn't a
 *       failure-after-retry, just a long-running attempt).
 *
 * Either way, we flip status to `wizard_complete` and let the next
 * page render trigger a fresh synthesizer call.
 */
export async function retrySynthesis(
  id: string
): Promise<RetrySynthesisOutcome> {
  const supabase = getServiceClient();

  const { data, error: fetchErr } = await supabase
    .from("assessments")
    .select("id, status, meta")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      status: string;
      meta: Record<string, unknown> | null;
    }>();

  if (fetchErr || !data) {
    return { ok: false, reason: "error" };
  }

  const meta = (data.meta ?? {}) as Record<string, unknown>;
  const runningAt = meta.synthesizer_running_at as string | undefined;
  const ageMs = runningAt
    ? Date.now() - new Date(runningAt).getTime()
    : Infinity;

  let cas: { fromStatus: string };

  if (data.status === "synthesizer_error") {
    const errMeta = meta.synthesizer_error as
      | { retry_count?: number }
      | undefined;
    const retryCount =
      typeof errMeta?.retry_count === "number" ? errMeta.retry_count : 0;
    if (retryCount >= MAX_RETRIES) {
      return { ok: false, reason: "max_retries" };
    }
    // Don't retry if a fresh in-flight lock exists (race protection).
    if (runningAt && ageMs >= 0 && ageMs < RUNNING_LOCK_TTL_MS) {
      return { ok: false, reason: "running" };
    }
    cas = { fromStatus: "synthesizer_error" };
  } else if (data.status === "synthesizing") {
    // User-driven unstick. Only allow if the in-flight call has been
    // running long enough that re-issuing won't double up on a healthy
    // attempt about to finish.
    if (!runningAt) {
      return { ok: false, reason: "wrong_state" };
    }
    if (ageMs < STUCK_RETRY_THRESHOLD_MS) {
      return { ok: false, reason: "running" };
    }
    cas = { fromStatus: "synthesizing" };
  } else {
    return { ok: false, reason: "wrong_state" };
  }

  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      status: "wizard_complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", cas.fromStatus);

  if (updateErr) {
    return { ok: false, reason: "error" };
  }

  revalidatePath(`/assess/${id}`);
  return { ok: true };
}
