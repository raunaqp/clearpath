import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * GET /api/assessment/[id]
 * Returns the intake-form-shaped fields from an assessment so that
 * `/start?resume=<id>` can pre-fill the form. Does NOT expose meta
 * or pre-router internals.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, name, email, mobile, one_liner, url, uploaded_docs")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("assessment GET error:", error);
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(data);
}
