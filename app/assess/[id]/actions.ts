"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";

const MAX_RETRIES = 3;
const RUNNING_LOCK_TTL_MS = 60_000;

export type RetrySynthesisOutcome =
  | { ok: true }
  | { ok: false; reason: "max_retries" | "running" | "wrong_state" | "error" };

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

  const meta = data.meta ?? {};
  const errMeta = (meta as Record<string, unknown>).synthesizer_error as
    | { retry_count?: number }
    | undefined;
  const retryCount =
    typeof errMeta?.retry_count === "number" ? errMeta.retry_count : 0;
  if (retryCount >= MAX_RETRIES) {
    return { ok: false, reason: "max_retries" };
  }

  const runningAt = (meta as Record<string, unknown>)
    .synthesizer_running_at as string | undefined;
  if (runningAt) {
    const age = Date.now() - new Date(runningAt).getTime();
    if (age >= 0 && age < RUNNING_LOCK_TTL_MS) {
      return { ok: false, reason: "running" };
    }
  }

  if (data.status !== "synthesizer_error") {
    return { ok: false, reason: "wrong_state" };
  }

  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      status: "wizard_complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "synthesizer_error");

  if (updateErr) {
    return { ok: false, reason: "error" };
  }

  revalidatePath(`/assess/${id}`);
  return { ok: true };
}
