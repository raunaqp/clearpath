/**
 * Sprint 2 Story 2.5 Phase 6 — PDF v2 endpoint.
 *
 * POST /api/draft/:id/pdf
 *   1. Authn (must be signed in)
 *   2. Authz (assessment + tier2_order must exist and be verified+)
 *   3. Render PDF via Chrome headless against /draft/:id?print=1
 *   4. Upload to Supabase Storage bucket `draft_packs` under
 *      `<assessment_id>/draft-pack-v2-<ts>.pdf`
 *   5. Return { url, signed_url_ttl_seconds, duration_ms, size_bytes }
 *
 * Idempotency: a new PDF is generated on every call (sections may have
 * been regenerated). Old files are not deleted — Storage handles
 * versioning. The latest URL is also written to
 *   tier2_orders.draft_pack_pdf_url
 * so other UIs can link to the most recent file.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";
import {
  renderDraftPackPdfV2,
  resolveBaseUrl,
} from "@/lib/pdf/draft-pack-pdf-v2";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const BUCKET = "draft_packs";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — durable for email links

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;

  const auth = await requireAuthOwnedAssessment(id);
  if (auth instanceof NextResponse) return auth;

  const supabase = getServiceClient();

  // Verify order in a renderable status.
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

  // Verify sections actually exist (avoid burning Chrome on an empty pack).
  const { count: sectionCount } = await supabase
    .from("draft_pack_sections")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);
  if (!sectionCount || sectionCount === 0) {
    return NextResponse.json(
      { error: "no_sections" },
      { status: 409 }
    );
  }

  // Render. Surface env presence in the response so the founder can
  // see which configuration cell is missing without trawling logs.
  const envSummary = {
    base_url: resolveBaseUrl(),
    has_internal_print_token: !!process.env.INTERNAL_PRINT_TOKEN,
    has_bypass_secret: !!process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
    has_chromium_pack_url: !!process.env.CHROMIUM_PACK_URL,
    vercel_env: process.env.VERCEL_ENV ?? null,
    vercel_url: process.env.VERCEL_URL ?? null,
    next_public_site_url: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  let pdf: Uint8Array;
  let durationMs: number;
  try {
    const r = await renderDraftPackPdfV2({
      assessmentId: id,
      baseUrl: envSummary.base_url,
    });
    pdf = r.pdf;
    durationMs = r.durationMs;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "Error";
    const stack = err instanceof Error ? err.stack : null;
    console.error(
      "[draft-pack-pdf-v2] render failed:",
      JSON.stringify({ name, msg, env: envSummary })
    );
    if (stack) console.error(stack);
    return NextResponse.json(
      {
        error: "render_failed",
        message: msg,
        error_name: name,
        env: envSummary,
      },
      { status: 500 }
    );
  }

  // Upload.
  const objectPath = `${id}/draft-pack-v2-${Date.now()}.pdf`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) {
    console.error("[draft-pack-pdf-v2] upload failed:", upErr.message);
    return NextResponse.json(
      { error: "upload_failed", message: upErr.message },
      { status: 500 }
    );
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    console.error(
      "[draft-pack-pdf-v2] signed-url failed:",
      signErr?.message ?? "no url"
    );
    return NextResponse.json(
      { error: "signed_url_failed", message: signErr?.message },
      { status: 500 }
    );
  }

  // Record latest pdf url on the order (best-effort; non-fatal).
  await supabase
    .from("tier2_orders")
    .update({ draft_pack_pdf_url: signed.signedUrl })
    .eq("id", order.id);

  return NextResponse.json({
    url: signed.signedUrl,
    signed_url_ttl_seconds: SIGNED_URL_TTL_SECONDS,
    duration_ms: durationMs,
    size_bytes: pdf.byteLength,
  });
}
