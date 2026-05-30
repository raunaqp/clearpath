/**
 * Find a delivered Tier 2 (Submission Workspace / draft_editor) order
 * with a stored PDF URL so we can download + inspect for arrow rendering.
 */
import { getServiceClient } from "../lib/supabase";

async function main() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tier2_orders")
    .select("id, tier_choice, status, draft_pack_pdf_url, delivered_at, created_at")
    .eq("status", "delivered")
    .not("draft_pack_pdf_url", "is", null)
    .order("delivered_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log("no delivered Tier 2 orders with pdf urls");
    return;
  }
  for (const o of data) {
    console.log(`${o.id}  tier=${o.tier_choice ?? "(legacy/draft_pack)"}  delivered=${o.delivered_at}`);
    console.log(`  url=${o.draft_pack_pdf_url}\n`);
  }
}

main().catch(console.error);
