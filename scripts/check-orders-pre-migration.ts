/**
 * E3 pre-migration data check.
 * Counts rows in legacy `orders` + new `tier2_orders` + dependents.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function count(table: string): Promise<number | string> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return `ERR ${error.code}: ${error.message}`;
  return count ?? 0;
}

async function main() {
  const tables = [
    "orders",
    "tier2_draft_packs",
    "tier2_orders",
    "draft_pack_sections",
    "draft_pack_citations",
    "draft_pack_predicates",
  ];
  for (const t of tables) {
    const c = await count(t);
    console.log(`${t.padEnd(30)} | ${c}`);
  }

  console.log("\n--- draft_pack_sections.order_id values (first 5) ---");
  const { data: secs, error: secErr } = await supabase
    .from("draft_pack_sections")
    .select("id, order_id, section_key, completion_status")
    .limit(5);
  if (secErr) console.log("ERR", secErr.message);
  else console.log(secs);

  console.log("\n--- orders ids (first 5) ---");
  const { data: ord, error: ordErr } = await supabase
    .from("orders")
    .select("id, assessment_id, tier, status, created_at")
    .limit(5);
  if (ordErr) console.log("ERR", ordErr.message);
  else console.log(ord);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
