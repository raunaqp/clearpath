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

  // CAS: only flip if currently pending_verification.
  const { data, error } = await supabase
    .from("tier2_orders")
    .update({
      status: "verified",
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
 * Story 2.6 — runs the v2 orchestrator for an order. Status transitions:
 *   verified → generating  (CAS)
 *   generating → delivered (on success)
 *   generating → verified  (on failure, so admin can retry)
 *
 * Logs "would send email" as the Sprint 3 SMTP placeholder. The
 * `email_sent_to` column on tier2_orders captures the intended
 * recipient even when no SMTP is wired.
 */
async function triggerV2GenerationForOrder(orderId: string): Promise<void> {
  const supabase = getServiceClient();
  const startedAt = Date.now();

  // CAS verified → generating. If someone else already triggered this
  // (or status moved past 'verified'), bail.
  const { data: locked, error: casErr } = await supabase
    .from("tier2_orders")
    .update({
      status: "generating",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "verified")
    .select("id, assessment_id")
    .maybeSingle<{ id: string; assessment_id: string }>();

  if (casErr) {
    console.error(
      "[verify-order:auto-trigger] CAS verified→generating failed:",
      casErr.message
    );
    return;
  }
  if (!locked) {
    console.log(
      `[verify-order:auto-trigger] order ${orderId} not in 'verified' state — skip`
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
    // Revert lock so admin can retry from the orders table.
    await supabase
      .from("tier2_orders")
      .update({
        status: "verified",
        updated_at: new Date().toISOString(),
        notes: `auto-gen failed: ${result.error ?? "unknown"}`,
      })
      .eq("id", orderId)
      .eq("status", "generating");
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
