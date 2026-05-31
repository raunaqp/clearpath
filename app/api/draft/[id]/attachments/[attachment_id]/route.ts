/**
 * Phase 5.5.D — per-attachment endpoints.
 *
 *   PATCH  /api/draft/:id/attachments/:attachment_id
 *     body: { doc_type?: string, notes?: string }
 *     → updates the metadata row. Used for caption / doc_type edits.
 *
 *   DELETE /api/draft/:id/attachments/:attachment_id
 *     → removes the Storage object + the metadata row.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";

export const dynamic = "force-dynamic";

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const BUCKET = "draft_pack_attachments";

type Params = { params: Promise<{ id: string; attachment_id: string }> };

async function authzAndLoadAttachment(
  assessmentId: string,
  attachmentId: string
) {
  const supabase = getServiceClient();
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("assessment_id", assessmentId)
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
    return { error: "order_not_ready" as const, status: 409 };
  }
  const { data: row } = await supabase
    .from("draft_pack_attachments")
    .select("id, order_id, storage_path")
    .eq("id", attachmentId)
    .eq("order_id", order.id)
    .maybeSingle();
  if (!row) {
    return { error: "attachment_not_found" as const, status: 404 };
  }
  return { row, supabase };
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, attachment_id } = await ctx.params;
  const authed = await requireAuthOwnedAssessment(id);
  if (authed instanceof NextResponse) return authed;
  let body: { doc_type?: unknown; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 422 });
  }
  const update: { doc_type?: string; notes?: string | null } = {};
  if (typeof body.doc_type === "string") update.doc_type = body.doc_type;
  if (typeof body.notes === "string") update.notes = body.notes;
  else if (body.notes === null) update.notes = null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 422 });
  }

  const auth = await authzAndLoadAttachment(id, attachment_id);
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const { supabase } = auth;

  const { error } = await supabase
    .from("draft_pack_attachments")
    .update(update)
    .eq("id", attachment_id);
  if (error) {
    return NextResponse.json(
      { error: "db_failed", message: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, attachment_id } = await ctx.params;
  const authed = await requireAuthOwnedAssessment(id);
  if (authed instanceof NextResponse) return authed;
  const auth = await authzAndLoadAttachment(id, attachment_id);
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const { row, supabase } = auth;

  // Remove the Storage object (best-effort — non-fatal if missing).
  await supabase.storage.from(BUCKET).remove([row.storage_path]);

  const { error } = await supabase
    .from("draft_pack_attachments")
    .delete()
    .eq("id", attachment_id);
  if (error) {
    return NextResponse.json(
      { error: "db_failed", message: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
