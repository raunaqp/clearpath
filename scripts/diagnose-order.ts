/**
 * Read-only diagnosis: trace the lifecycle + per-section timing of
 * a Submission Workspace order. Used for Item 3 perf-vs-UX inquiry.
 */
import { getServiceClient } from "../lib/supabase";

const ORDER_ID = "d777afd2-7d41-47fe-989e-d29a36ab1c42";

async function main() {
  const supabase = getServiceClient();

  const { data: order } = await supabase
    .from("tier2_orders")
    .select("*")
    .eq("id", ORDER_ID)
    .maybeSingle();
  if (!order) {
    console.log("order not found");
    return;
  }

  console.log("=== ORDER ===");
  console.log(`  id            ${order.id}`);
  console.log(`  assessment_id ${order.assessment_id}`);
  console.log(`  tier_choice   ${order.tier_choice}`);
  console.log(`  status        ${order.status}`);
  console.log(`  amount_inr    ${order.amount_inr}`);
  console.log(`  created_at    ${order.created_at}`);
  console.log(`  updated_at    ${order.updated_at}`);
  console.log(`  delivered_at  ${order.delivered_at}`);
  console.log(`  notes         ${order.notes ?? "(none)"}`);
  console.log(`  email_sent_to ${order.email_sent_to}`);
  console.log(`  pdf_url       ${order.draft_pack_pdf_url ? "(present)" : "(none)"}`);

  // Generation duration if both timestamps exist
  if (order.delivered_at && order.created_at) {
    const created = new Date(order.created_at).getTime();
    const delivered = new Date(order.delivered_at).getTime();
    const s = ((delivered - created) / 1000).toFixed(1);
    console.log(`\ncreated → delivered: ${s}s (${(Number(s) / 60).toFixed(2)} min)`);
  }

  console.log("\n=== SECTIONS (draft_pack_sections) ===");
  const { data: sections } = await supabase
    .from("draft_pack_sections")
    .select("section_key, completion_status, word_count, meta, created_at, updated_at")
    .eq("order_id", ORDER_ID)
    .order("section_key");
  if (!sections || sections.length === 0) {
    console.log("  (no sections persisted)");
  } else {
    console.log(`  total sections persisted: ${sections.length}`);
    for (const s of sections) {
      const m = s.meta as Record<string, unknown> | null;
      const durationMs = m && typeof m["duration_ms"] === "number" ? m["duration_ms"] : null;
      const model = m && typeof m["model"] === "string" ? m["model"] : null;
      const costUsd = m && typeof m["cost_usd"] === "number" ? m["cost_usd"] : null;
      console.log(
        `  ${s.section_key}  status=${s.completion_status}  words=${s.word_count}  duration=${
          durationMs !== null ? (durationMs / 1000).toFixed(1) + "s" : "?"
        }  cost=${costUsd !== null ? "$" + (costUsd as number).toFixed(4) : "?"}  model=${model ?? "?"}`
      );
    }
    // Sum + summary stats
    const durations = sections
      .map((s) => {
        const m = s.meta as Record<string, unknown> | null;
        return m && typeof m["duration_ms"] === "number" ? (m["duration_ms"] as number) : null;
      })
      .filter((x): x is number => x !== null);
    if (durations.length > 0) {
      const sum = durations.reduce((a, b) => a + b, 0);
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      console.log(
        `\n  duration totals (only sections with meta.duration_ms): sum=${(sum / 1000).toFixed(1)}s  min=${(min / 1000).toFixed(1)}s  max=${(max / 1000).toFixed(1)}s  n=${durations.length}`
      );
    }
  }

  console.log("\n=== ENGINE_COSTS (per-call cost telemetry) ===");
  const { data: costs } = await supabase
    .from("engine_costs")
    .select("call_layer, model, input_tokens, output_tokens, cost_usd, created_at")
    .eq("assessment_id", order.assessment_id)
    .order("created_at");
  if (!costs || costs.length === 0) {
    console.log("  (no engine_costs rows)");
  } else {
    let totalCost = 0;
    for (const c of costs) {
      totalCost += Number(c.cost_usd);
      console.log(
        `  ${c.created_at}  ${c.call_layer}  model=${c.model}  in=${c.input_tokens}  out=${c.output_tokens}  $${Number(c.cost_usd).toFixed(4)}`
      );
    }
    console.log(`\n  total cost: $${totalCost.toFixed(4)}  rows: ${costs.length}`);
    // Time span of LLM calls
    const first = new Date(costs[0].created_at).getTime();
    const last = new Date(costs[costs.length - 1].created_at).getTime();
    console.log(`  call timespan: ${((last - first) / 1000).toFixed(1)}s (first → last engine_cost row)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
