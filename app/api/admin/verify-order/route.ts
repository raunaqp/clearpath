import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { runDraftPackV2 } from "@/lib/engine/draft-pack-v2/orchestrator";

// Sprint 2 Story 2.6 — auto-trigger v2 generation when admin verifies
// the payment. The response returns immediately (status: 'verified');
// the v2 orchestrator runs in the background via Vercel's after().
// maxDuration extended to fit a ~4-minute pack gen.
export const maxDuration = 300;

const schema = z.object({ order_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid order_id." },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  const now = new Date().toISOString();

  // CAS pending_verification → generating in ONE write. Skipping the
  // intermediate 'verified' state eliminates a race we observed in
  // production: admin clicked Verify, then immediately clicked the
  // legacy v1 "Generate" button, whose CAS verified→generating
  // succeeded before the auto-trigger v2 (scheduled via after()) ever
  // ran. v1 set status='delivered' + draft_pack_pdf_url but writes
  // nothing to draft_pack_sections — leaving /draft/[id] empty.
  // Result for the affected order b54a20ec-…: PDF exists, but the
  // sectioned editor sees zero rows.
  //
  // By landing 'generating' in the verify response, any v1 click after
  // that returns 409 cleanly. Status semantics shift slightly: we no
  // longer pass through 'verified'. Existing customers in 'verified'
  // still work — the v1 endpoint accepts that state. Sprint 3 will
  // replace this whole chain with Cashfree-paid → generating.
  const { data, error } = await supabase
    .from("tier2_orders")
    .update({
      status: "generating",
      verified_at: now,
      verified_by: "admin",
      updated_at: now,
    })
    .eq("id", parsed.data.order_id)
    .eq("status", "pending_verification")
    .select("id, status")
    .maybeSingle<{ id: string; status: string }>();

  if (error) {
    console.error("verify-order update failed:", error);
    return NextResponse.json(
      { error: "Could not verify order. Please try again." },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "Order not in pending_verification state." },
      { status: 409 }
    );
  }

  // Auto-trigger Phase 5.5 v2 generation in the background. The admin
  // response returns immediately. Fluid Compute keeps the function
  // alive past the response to run after()-scheduled work.
  after(async () => {
    await triggerV2GenerationForOrder(data.id);
  });

  return NextResponse.json({ ok: true, order_id: data.id, status: data.status });
}

/**
 * Story 2.6 — runs the v2 orchestrator for an order. By the time this
 * runs (scheduled via after() from verify-order), the calling endpoint
 * has already landed status='generating'. We just verify that and pull
 * assessment_id.
 *
 * Status transitions:
 *   generating → delivered  (on success)
 *   generating → failed     (on failure; admin can retry via legacy
 *                            v1 button or by re-running the script)
 *
 * Logs "would send email" as the Sprint 3 SMTP placeholder. The
 * `email_sent_to` column on tier2_orders captures the intended
 * recipient even when no SMTP is wired.
 */
async function triggerV2GenerationForOrder(orderId: string): Promise<void> {
  const supabase = getServiceClient();
  const startedAt = Date.now();

  const { data: locked, error: casErr } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id, status")
    .eq("id", orderId)
    .maybeSingle<{ id: string; assessment_id: string; status: string }>();

  if (casErr || !locked) {
    console.error(
      `[verify-order:auto-trigger] could not load order ${orderId}:`,
      casErr?.message ?? "no row"
    );
    return;
  }
  if (locked.status !== "generating") {
    console.log(
      `[verify-order:auto-trigger] order ${orderId} status=${locked.status} (expected 'generating') — skip`
    );
    return;
  }

  console.log(
    `[verify-order:auto-trigger] starting v2 gen for order ${orderId} (assessment ${locked.assessment_id})`
  );

  // Clear any prior sections under this order (idempotent re-run).
  await supabase
    .from("draft_pack_sections")
    .delete()
    .eq("order_id", orderId);

  const result = await runDraftPackV2({
    assessment_id: locked.assessment_id,
    dry_run: false,
    log: (msg) => console.log(`[verify-order:auto-trigger] ${msg}`),
  });

  if (!result.ok) {
    console.error(
      `[verify-order:auto-trigger] v2 gen failed: ${result.error}`
    );
    // Stamp the failure note but leave status='generating' so the
    // admin's "Reset stuck order" button + the live-gen script can
    // recover. We don't auto-revert to 'pending_verification' because
    // payment already cleared.
    await supabase
      .from("tier2_orders")
      .update({
        updated_at: new Date().toISOString(),
        notes: `auto-gen failed: ${result.error ?? "unknown"}`,
      })
      .eq("id", orderId);
    return;
  }

  // Pull the recipient email + push to delivered.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id")
    .eq("id", orderId)
    .single();
  const { data: assessment } = await supabase
    .from("assessments")
    .select("email")
    .eq("id", order?.assessment_id ?? "")
    .maybeSingle();

  const recipient = assessment?.email ?? null;
  const nowIso = new Date().toISOString();
  await supabase
    .from("tier2_orders")
    .update({
      status: "delivered",
      delivered_at: nowIso,
      updated_at: nowIso,
      email_sent_to: recipient,
    })
    .eq("id", orderId)
    .eq("status", "generating");

  const durationS = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[verify-order:auto-trigger] delivered in ${durationS}s · ${result.totals.sections_generated}/12 sections · $${result.totals.cost_usd.toFixed(4)}`
  );

  // Story 2.6 email placeholder — Sprint 3 wires real SMTP.
  if (recipient) {
    console.log(
      `[verify-order:auto-trigger] would send email: to=${recipient} subject="Your CDSCO Draft Pack is ready"`
    );
  } else {
    console.warn(
      "[verify-order:auto-trigger] no recipient email recorded; skipping notification placeholder"
    );
  }
}
