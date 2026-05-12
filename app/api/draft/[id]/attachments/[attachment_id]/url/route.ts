/**
 * Phase 5.5.D — short-lived signed URL for an attachment.
 *
 * GET /api/draft/:id/attachments/:attachment_id/url
 * Returns: { url: string, expires_in_seconds: number }
 *
 * Client uses this to open the file in a new tab. TTL is short (10 min)
 * because we always have the row in DB and can re-mint on demand.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const BUCKET = "draft_pack_attachments";
const TTL_SECONDS = 10 * 60;

type Params = { params: Promise<{ id: string; attachment_id: string }> };

export async function GET(_req: NextRequest, ctx: Params) {
  const { id, attachment_id } = await ctx.params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
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
    return NextResponse.json({ error: "order_not_ready" }, { status: 409 });
  }
  const { data: row } = await supabase
    .from("draft_pack_attachments")
    .select("storage_path")
    .eq("id", attachment_id)
    .eq("order_id", order.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json(
      { error: "attachment_not_found" },
      { status: 404 }
    );
  }
  const { data: signed, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, TTL_SECONDS);
  if (error || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "signed_url_failed", message: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({
    url: signed.signedUrl,
    expires_in_seconds: TTL_SECONDS,
  });
}
