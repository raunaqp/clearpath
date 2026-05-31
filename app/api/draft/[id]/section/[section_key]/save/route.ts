/**
 * Sprint 2 Story 2.5 Phase 5.5.B — section overlay save endpoint.
 *
 * POST /api/draft/:id/section/:section_key/save
 *   body: { content: string, reason?: string }
 *
 *   1. Authn (signed-in user) + authz (tier2_order in renderable state
 *      and the named section exists under that order).
 *   2. Append the OUTGOING content (content_edited ?? content) to
 *      draft_pack_section_revisions before overwriting — so the
 *      pre-save version is always recoverable.
 *   3. Update draft_pack_sections.content_edited / edited_at / edited_by
 *      with the new value. content (AI baseline) is never touched.
 *
 * 422 on empty body or oversized payload. 409 if section/order missing.
 * 401 on missing session.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";

export const dynamic = "force-dynamic";

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const MAX_CONTENT_BYTES = 200_000; // 200 KB cap — generous; sections are 1–6 KB

type Params = {
  params: Promise<{ id: string; section_key: string }>;
};

export async function POST(req: NextRequest, ctx: Params) {
  const { id, section_key } = await ctx.params;

  const auth = await requireAuthOwnedAssessment(id);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  let body: { content?: unknown; reason?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 422 });
  }

  const content = typeof body.content === "string" ? body.content : null;
  const reason = typeof body.reason === "string" ? body.reason : null;
  if (content === null) {
    return NextResponse.json(
      { error: "missing_content" },
      { status: 422 }
    );
  }
  if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    return NextResponse.json(
      { error: "content_too_large", limit_bytes: MAX_CONTENT_BYTES },
      { status: 413 }
    );
  }

  const supabase = getServiceClient();

  // Authz — order must exist + be in a renderable status.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("assessment_id", id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    !order ||
    !READABLE_STATUSES.includes(
      order.status as (typeof READABLE_STATUSES)[number]
    )
  ) {
    return NextResponse.json(
      { error: "order_not_ready", status: order?.status ?? null },
      { status: 409 }
    );
  }

  // Look up the section + its current content_edited / content so we can
  // append the outgoing version to revisions.
  const { data: section, error: secErr } = await supabase
    .from("draft_pack_sections")
    .select("id, content, content_edited")
    .eq("order_id", order.id)
    .eq("section_key", section_key)
    .maybeSingle();
  if (secErr) {
    console.error("[section-save] section lookup failed:", secErr.message);
    return NextResponse.json(
      { error: "section_lookup_failed", message: secErr.message },
      { status: 500 }
    );
  }
  if (!section) {
    return NextResponse.json(
      { error: "section_not_found", section_key },
      { status: 404 }
    );
  }

  const outgoing = section.content_edited ?? section.content ?? "";

  // Append outgoing content to revisions (best-effort — non-fatal if it
  // fails, we still want the save to land).
  if (outgoing && outgoing !== content) {
    const { error: revErr } = await supabase
      .from("draft_pack_section_revisions")
      .insert({
        section_id: section.id,
        content: outgoing,
        edited_by: user.id,
        reason: reason ?? null,
      });
    if (revErr) {
      console.error(
        "[section-save] revision append failed (non-fatal):",
        revErr.message
      );
    }
  }

  const nowIso = new Date().toISOString();
  const { error: upErr } = await supabase
    .from("draft_pack_sections")
    .update({
      content_edited: content,
      edited_at: nowIso,
      edited_by: user.id,
    })
    .eq("id", section.id);
  if (upErr) {
    console.error("[section-save] update failed:", upErr.message);
    return NextResponse.json(
      { error: "save_failed", message: upErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    section_id: section.id,
    edited_at: nowIso,
    bytes: Buffer.byteLength(content, "utf8"),
  });
}
