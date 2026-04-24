import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import {
  WizardAnswersPartialSchema,
  type WizardAnswers,
} from "@/lib/wizard/types";

const bodySchema = z.object({
  assessment_id: z.string().uuid(),
  step: z.number().int().min(1).max(7),
  answer: WizardAnswersPartialSchema,
});

type AssessmentMeta = Record<string, unknown> & {
  wizard_started_at?: string;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message }, { status: 422 });
  }

  const { assessment_id, answer } = parsed.data;

  const supabase = getServiceClient();
  const { data: existing, error: fetchError } = await supabase
    .from("assessments")
    .select("wizard_answers, meta")
    .eq("id", assessment_id)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return NextResponse.json({ error: "Could not load assessment." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const currentAnswers: WizardAnswers =
    (existing.wizard_answers as WizardAnswers | null) ?? {};
  // Shallow merge: q6 (array) is replaced wholesale because it's a single key.
  const mergedAnswers: WizardAnswers = { ...currentAnswers, ...answer };

  const currentMeta: AssessmentMeta =
    (existing.meta as AssessmentMeta | null) ?? {};
  const mergedMeta: AssessmentMeta = { ...currentMeta };
  if (!mergedMeta.wizard_started_at) {
    mergedMeta.wizard_started_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      wizard_answers: mergedAnswers,
      meta: mergedMeta,
      status: "wizard",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment_id);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: "Could not save answer." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
