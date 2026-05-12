#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 5 — LIVE generation of v2 Draft Pack for a given
 * assessment. Writes to draft_pack_sections + draft_pack_citations +
 * engine_costs. Will FAIL if no tier2_orders row exists for the
 * assessment, or if migration 012 hasn't retargeted the FK.
 *
 * Run: npx tsx --env-file=.env.local scripts/generate-draft-pack-v2-live.ts [assessment_id]
 *      (defaults to CardioRhythm 39c844a1-...)
 *
 * Use this to populate test data for the /draft/[id] reader. Bumps the
 * tier2_orders status to 'verified' first if it's not already, so the
 * reader UI E4 auth gate opens.
 */
import { runDraftPackV2 } from "../lib/engine/draft-pack-v2/orchestrator";
import { getServiceClient } from "../lib/supabase";

const DEFAULT_ID = "39c844a1-9091-45d0-af5f-c17c431fc734";

async function main() {
  const id = process.argv[2] ?? DEFAULT_ID;
  const supabase = getServiceClient();

  console.log(`\n=== LIVE Draft Pack v2 generation: ${id} ===\n`);

  // Look up tier2_order. Bump to 'verified' if it isn't already, so the
  // E4 gate on /draft/[id] opens after generation.
  const { data: orderRows, error: oErr } = await supabase
    .from("tier2_orders")
    .select("id, status, amount_inr")
    .eq("assessment_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (oErr) {
    console.error("tier2_orders lookup failed:", oErr.message);
    process.exit(1);
  }

  let order = orderRows?.[0];
  if (!order) {
    console.log(
      "No tier2_orders row for this assessment — creating one in 'verified' state for the reader test."
    );
    const { data: created, error: cErr } = await supabase
      .from("tier2_orders")
      .insert({
        assessment_id: id,
        status: "verified",
        amount_inr: 499,
        verified_at: new Date().toISOString(),
        verified_by: "phase5_test_seed",
      })
      .select("id, status")
      .single();
    if (cErr || !created) {
      console.error("tier2_orders seed failed:", cErr?.message);
      process.exit(1);
    }
    order = { ...created, amount_inr: 499 };
  } else if (
    !["verified", "generating", "delivered"].includes(order.status)
  ) {
    console.log(
      `Bumping tier2_orders.status from '${order.status}' → 'verified' so the reader gate opens.`
    );
    const { error: upErr } = await supabase
      .from("tier2_orders")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: "phase5_test_seed",
      })
      .eq("id", order.id);
    if (upErr) {
      console.error("status bump failed:", upErr.message);
      process.exit(1);
    }
  }
  console.log(`Using tier2_orders.id = ${order.id} (status: verified)\n`);

  // Clear any existing rows from a previous run (idempotent re-seed).
  await supabase.from("draft_pack_sections").delete().eq("order_id", order.id);

  const result = await runDraftPackV2({
    assessment_id: id,
    dry_run: false,
    log: (m) => console.log(m),
  });

  if (!result.ok) {
    console.error(`\nORCHESTRATOR FAILED: ${result.error}`);
    process.exit(1);
  }

  console.log("\n=== Per-section summary ===");
  console.log("  # | key                          | status   | words | cost   | model");
  for (const s of result.sections) {
    console.log(
      `  ${String(s.section_number).padStart(2)} | ${s.section_key.padEnd(28)} | ${s.completion_status.padEnd(8)} | ${String(s.word_count).padStart(5)} | $${(s.meta.llm_cost_usd ?? 0).toFixed(4)} | ${s.meta.model ?? "—"}`
    );
  }
  console.log("\n=== Totals ===");
  console.log(`  cost:                $${result.totals.cost_usd.toFixed(4)}`);
  console.log(`  duration:            ${(result.totals.duration_ms / 1000).toFixed(1)}s`);
  console.log(`  sections generated:  ${result.totals.sections_generated}/12`);
  console.log(`  sections failed:     ${result.totals.sections_failed}`);
  console.log(`\nDB populated. Reader URL → /draft/${id}\n`);
}

main().catch((err) => {
  console.error("\ncrashed:", err);
  process.exit(1);
});
