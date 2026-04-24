import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const bodySchema = z.object({
  assessment_id: z.string().uuid(),
});

type AssessmentMeta = Record<string, unknown>;

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

  const { assessment_id } = parsed.data;

  const supabase = getServiceClient();
  const { data: existing, error: fetchError } = await supabase
    .from("assessments")
    .select("meta")
    .eq("id", assessment_id)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return NextResponse.json({ error: "Could not load assessment." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const currentMeta: AssessmentMeta =
    (existing.meta as AssessmentMeta | null) ?? {};
  const mergedMeta: AssessmentMeta = {
    ...currentMeta,
    conflict_acknowledged: true,
  };

  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      meta: mergedMeta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment_id);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: "Could not save acknowledgement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
