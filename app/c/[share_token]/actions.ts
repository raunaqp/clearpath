"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";

type AssessmentMeta = Record<string, unknown>;

export async function captureAbdmIntent(
  assessmentId: string,
  shareToken: string,
  message: string
): Promise<{ ok: true }> {
  const supabase = getServiceClient();
  const { data, error: fetchErr } = await supabase
    .from("assessments")
    .select("id, abdm_intent_captured_at, meta")
    .eq("id", assessmentId)
    .maybeSingle<{
      id: string;
      abdm_intent_captured_at: string | null;
      meta: AssessmentMeta | null;
    }>();

  if (fetchErr || !data) {
    throw new Error("Could not load assessment.");
  }

  // Idempotent: if already captured, no-op.
  if (data.abdm_intent_captured_at) {
    return { ok: true };
  }

  const trimmed = message?.trim() ?? "";
  const newMeta: AssessmentMeta = {
    ...(data.meta ?? {}),
    abdm_intent_message: trimmed.length > 0 ? trimmed : null,
  };
  const now = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      abdm_intent_captured_at: now,
      meta: newMeta,
      updated_at: now,
    })
    .eq("id", assessmentId)
    .is("abdm_intent_captured_at", null);

  if (updateErr) {
    throw new Error("Could not save your request. Please try again.");
  }

  revalidatePath(`/c/${shareToken}`);
  return { ok: true };
}

export async function captureDpdpIntent(
  assessmentId: string,
  shareToken: string
): Promise<{ ok: true }> {
  const supabase = getServiceClient();
  const { data, error: fetchErr } = await supabase
    .from("assessments")
    .select("id, dpdp_intent_captured_at")
    .eq("id", assessmentId)
    .maybeSingle<{ id: string; dpdp_intent_captured_at: string | null }>();

  if (fetchErr || !data) {
    throw new Error("Could not load assessment.");
  }

  if (data.dpdp_intent_captured_at) {
    return { ok: true };
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      dpdp_intent_captured_at: now,
      updated_at: now,
    })
    .eq("id", assessmentId)
    .is("dpdp_intent_captured_at", null);

  if (updateErr) {
    throw new Error("Could not save your request. Please try again.");
  }

  revalidatePath(`/c/${shareToken}`);
  return { ok: true };
}
