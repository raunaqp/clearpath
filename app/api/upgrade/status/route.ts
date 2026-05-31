import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";

const idSchema = z.string().uuid();

/** In-flight statuses where a section-progress count is meaningful. */
const PROGRESSIVE_STATUSES = new Set(["verified", "generating"]);

export async function GET(req: NextRequest) {
  const assessment_id = req.nextUrl.searchParams.get("assessment_id");
  const parsed = idSchema.safeParse(assessment_id);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid assessment_id." },
      { status: 422 }
    );
  }

  const auth = await requireAuthOwnedAssessment(parsed.data);
  if (auth instanceof NextResponse) return auth;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tier2_orders")
    .select(
      "id, status, transaction_id, payment_screenshot_url, draft_pack_pdf_url, delivered_at, created_at, email_sent_to, tier_choice, notes"
    )
    .eq("assessment_id", parsed.data)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Could not load order." },
      { status: 500 }
    );
  }

  // Phase B Item 3 — surface section-by-section progress for the
  // Submission Workspace generating state. The orchestrator persists
  // each section to draft_pack_sections as it completes, so a simple
  // count moves naturally from 0 → 12 over the 4-6 min generation.
  // Only meaningful while the workspace is actively generating; null
  // otherwise so the client can branch cleanly.
  let sectionsComplete: number | null = null;
  if (
    data &&
    data.tier_choice === "draft_editor" &&
    PROGRESSIVE_STATUSES.has(data.status)
  ) {
    const { count } = await supabase
      .from("draft_pack_sections")
      .select("id", { count: "exact", head: true })
      .eq("order_id", data.id);
    sectionsComplete = count ?? 0;
  }

  return NextResponse.json({ order: data ?? null, sections_complete: sectionsComplete });
}
