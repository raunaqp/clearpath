import { getServiceClient } from "../lib/supabase";

const TARGET = "9398e698-2b1b-4fca-9b4f-3a99e2298447";

async function main() {
  const s = getServiceClient();
  const a = await s.from("assessments").select("id, name, email, created_at, status").eq("id", TARGET).maybeSingle();
  console.log("assessments match:", a.data ?? "not found");

  const ds = await s.from("draft_pack_sections").select("id", { count: "exact", head: true }).eq("order_id", TARGET);
  console.log("draft_pack_sections by order_id count:", ds.count);

  const ec = await s.from("engine_costs").select("id", { count: "exact", head: true }).eq("assessment_id", TARGET);
  console.log("engine_costs by assessment_id count:", ec.count);

  const recent = await s
    .from("tier2_orders")
    .select("id, assessment_id, status, tier_choice, created_at, delivered_at, notes")
    .eq("tier_choice", "draft_editor")
    .order("created_at", { ascending: false })
    .limit(8);
  console.log("\n8 most recent draft_editor orders:");
  for (const o of recent.data ?? []) {
    console.log(`  ${o.id}  status=${o.status}  ${o.created_at} → ${o.delivered_at ?? "(none)"}  notes=${o.notes ?? "-"}`);
  }
}

main().catch(console.error);
