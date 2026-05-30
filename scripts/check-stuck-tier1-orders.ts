/**
 * One-shot READ-ONLY audit: list any tier2_orders rows for Tier 1
 * (tier_choice='draft_pack') that are still in 'generating' or
 * 'verified' (pre-generation) limbo. These are candidates for being
 * stranded by the reviewer_insights JSON-parse bug.
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx scripts/check-stuck-tier1-orders.ts
 */
import { getServiceClient } from "../lib/supabase";

async function main() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tier2_orders")
    .select("*")
    .in("status", ["generating", "verified", "failed"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }

  const tier1 = (data ?? []).filter((o) => (o.tier_choice ?? "draft_pack") === "draft_pack");

  if (tier1.length === 0) {
    console.log("✓ no Tier 1 orders in generating/verified/failed");
    return;
  }

  const now = Date.now();
  console.log(`found ${tier1.length} Tier 1 order(s) not in 'delivered':\n`);
  for (const o of tier1) {
    const ageMin = ((now - new Date(o.created_at).getTime()) / 60000).toFixed(0);
    const sinceUpdateMin = ((now - new Date(o.updated_at).getTime()) / 60000).toFixed(0);
    console.log(
      `${o.id}  status=${o.status}  age=${ageMin}min  since_update=${sinceUpdateMin}min`
    );
    console.log(`  assessment=${o.assessment_id}`);
    console.log(`  email=${o.email_sent_to ?? "(none)"}`);
    console.log(`  notes=${o.notes ?? "(none)"}`);
    console.log(`  pdf_url=${o.draft_pack_pdf_url ? "(present)" : "(none)"}`);
    const keys = Object.keys(o).filter((k) =>
      /cashfree|payment|amount|paid|cf_/i.test(k)
    );
    for (const k of keys) {
      console.log(`  ${k}=${JSON.stringify((o as Record<string, unknown>)[k])}`);
    }
    console.log("");
  }

  const stuckGenerating = tier1.filter(
    (o) =>
      o.status === "generating" &&
      now - new Date(o.updated_at).getTime() > 10 * 60 * 1000
  );
  if (stuckGenerating.length > 0) {
    console.log(
      `⚠ ${stuckGenerating.length} order(s) stuck 'generating' for >10min — likely stranded:`
    );
    for (const o of stuckGenerating) {
      console.log(`  - ${o.id} (${o.email_sent_to ?? "no email"})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
