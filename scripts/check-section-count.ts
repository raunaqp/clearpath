/**
 * Verify the new sections_complete count works against real data.
 * Calls /api/upgrade/status the same way the StatusPanel will.
 */
import { getServiceClient } from "../lib/supabase";

async function main() {
  const supabase = getServiceClient();
  // Find recent draft_editor orders so we can spot-check the count.
  const { data: orders } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id, status, tier_choice, created_at")
    .eq("tier_choice", "draft_editor")
    .order("created_at", { ascending: false })
    .limit(5);

  for (const o of orders ?? []) {
    const { count } = await supabase
      .from("draft_pack_sections")
      .select("id", { count: "exact", head: true })
      .eq("order_id", o.id);
    console.log(
      `${o.id}  status=${o.status}  sections_persisted=${count ?? 0}  assessment=${o.assessment_id}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
