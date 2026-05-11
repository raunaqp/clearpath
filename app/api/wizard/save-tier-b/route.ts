/**
 * Tier B wizard save endpoint (Sprint 2 Story 2.5 Phase 3).
 *
 * Save-on-blur target. Accepts a partial Tier B answer object and
 * merges it into assessments.wizard_answers (jsonb). Same column as
 * Tier A — different keyspace (b1–b6, c1–c2). Tier A keys (q1–q7) are
 * preserved untouched.
 *
 * Auth: gated to the assessment owner via Supabase Auth (Story 2.2).
 * Anonymous requests are rejected.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import {
  TierBAnswersPartialSchema,
  type WizardAnswers,
} from "@/lib/wizard/types";

const bodySchema = z.object({
  assessment_id: z.string().uuid(),
  answers: TierBAnswersPartialSchema,
  /** Phase 3.5 Bug A — set on the final submit call so the
   *  /upgrade/[id] gate can distinguish "in-progress" from "submitted". */
  completed: z.boolean().optional(),
});

type AssessmentMeta = Record<string, unknown> & {
  tier_b_started_at?: string;
  tier_b_completed_at?: string;
};

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: `${first.path.join(".")}: ${first.message}`,
      },
      { status: 422 }
    );
  }

  const { assessment_id, answers, completed } = parsed.data;

  const supabase = getServiceClient();

  const { data: existing, error: fetchError } = await supabase
    .from("assessments")
    .select("id, email, wizard_answers, meta")
    .eq("id", assessment_id)
    .maybeSingle();

  if (fetchError) {
    console.error("[save-tier-b] fetch error:", fetchError);
    return NextResponse.json(
      { error: "Could not load assessment." },
      { status: 500 }
    );
  }
  if (!existing) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  // Ownership check — the authed user must match the assessment email.
  if (existing.email !== user.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const currentAnswers: WizardAnswers =
    (existing.wizard_answers as WizardAnswers | null) ?? {};
  const mergedAnswers: WizardAnswers = { ...currentAnswers, ...answers };

  const currentMeta: AssessmentMeta =
    (existing.meta as AssessmentMeta | null) ?? {};
  const mergedMeta: AssessmentMeta = { ...currentMeta };
  const now = new Date().toISOString();
  if (!mergedMeta.tier_b_started_at) {
    mergedMeta.tier_b_started_at = now;
  }
  if (completed) {
    mergedMeta.tier_b_completed_at = now;
  }

  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      wizard_answers: mergedAnswers,
      meta: mergedMeta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment_id);

  if (updateError) {
    console.error("[save-tier-b] update error:", updateError);
    return NextResponse.json(
      { error: "Could not save answers." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
