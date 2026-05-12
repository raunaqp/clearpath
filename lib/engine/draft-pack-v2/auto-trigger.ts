/**
 * Sprint 3 Story 3.2 — shared v2 auto-trigger.
 *
 * Called from BOTH:
 *   - /api/cashfree/webhook on PAYMENT_SUCCESS_WEBHOOK
 *   - /api/admin/verify-order (legacy admin path; kept for the sandbox
 *     period until production keys land and we trust webhooks fully)
 *
 * Caller is responsible for landing status='generating' before
 * scheduling this via after(). We just verify, run, and finalise.
 *
 * Status transitions (Story 3.5 — robustness):
 *   generating → delivered  iff (orchestrator ok AND
 *                                draft_pack_sections rowcount === 12)
 *   generating → generating (sticky) on any failure, with
 *                            tier2_orders.notes stamped. Admin can
 *                            recover via /admin/orders Reset Stuck +
 *                            scripts/generate-draft-pack-v2-live.ts.
 */
import { getServiceClient } from "@/lib/supabase";
import { runDraftPackV2 } from "./orchestrator";

const REQUIRED_SECTION_COUNT = 12;

export async function triggerV2GenerationForOrder(
  orderId: string
): Promise<void> {
  const supabase = getServiceClient();
  const startedAt = Date.now();

  const { data: locked, error: casErr } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id, status")
    .eq("id", orderId)
    .maybeSingle<{ id: string; assessment_id: string; status: string }>();

  if (casErr || !locked) {
    console.error(
      `[v2-auto-trigger] could not load order ${orderId}:`,
      casErr?.message ?? "no row"
    );
    return;
  }
  if (locked.status !== "generating") {
    console.log(
      `[v2-auto-trigger] order ${orderId} status=${locked.status} (expected 'generating') — skip`
    );
    return;
  }

  console.log(
    `[v2-auto-trigger] starting v2 gen for order ${orderId} (assessment ${locked.assessment_id})`
  );

  // Clear any prior sections under this order (idempotent re-run).
  await supabase
    .from("draft_pack_sections")
    .delete()
    .eq("order_id", orderId);

  const result = await runDraftPackV2({
    assessment_id: locked.assessment_id,
    dry_run: false,
    log: (msg) => console.log(`[v2-auto-trigger] ${msg}`),
  });

  if (!result.ok) {
    console.error(`[v2-auto-trigger] orchestrator failed: ${result.error}`);
    await supabase
      .from("tier2_orders")
      .update({
        updated_at: new Date().toISOString(),
        notes: `auto-gen failed: ${result.error ?? "unknown"}`,
      })
      .eq("id", orderId);
    return;
  }

  // Story 3.5 robustness — refuse to mark delivered if section
  // rowcount doesn't match what the orchestrator reports. Guards
  // against silent persistence failures (the v1/v2 race bug at
  // Sprint 2 closeout is the canonical failure mode).
  const { count: sectionCount, error: countErr } = await supabase
    .from("draft_pack_sections")
    .select("*", { count: "exact", head: true })
    .eq("order_id", orderId);

  if (countErr) {
    console.error(
      `[v2-auto-trigger] section count query failed: ${countErr.message}`
    );
    await supabase
      .from("tier2_orders")
      .update({
        updated_at: new Date().toISOString(),
        notes: `auto-gen post-check failed: ${countErr.message}`,
      })
      .eq("id", orderId);
    return;
  }

  if ((sectionCount ?? 0) !== REQUIRED_SECTION_COUNT) {
    console.error(
      `[v2-auto-trigger] section count mismatch: expected ${REQUIRED_SECTION_COUNT}, got ${sectionCount}`
    );
    await supabase
      .from("tier2_orders")
      .update({
        updated_at: new Date().toISOString(),
        notes: `auto-gen incomplete: ${sectionCount}/${REQUIRED_SECTION_COUNT} sections persisted`,
      })
      .eq("id", orderId);
    return;
  }

  // Recipient email lookup for the "would send" placeholder log.
  const { data: assessment } = await supabase
    .from("assessments")
    .select("email")
    .eq("id", locked.assessment_id)
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
    `[v2-auto-trigger] delivered in ${durationS}s · ${result.totals.sections_generated}/12 sections · $${result.totals.cost_usd.toFixed(4)}`
  );

  if (recipient) {
    console.log(
      `[v2-auto-trigger] would send email: to=${recipient} subject="Your CDSCO Draft Pack is ready"`
    );
  } else {
    console.warn(
      "[v2-auto-trigger] no recipient email recorded; skipping notification placeholder"
    );
  }
}
