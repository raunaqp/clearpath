import { getServiceClient } from "../lib/supabase";
const supabase = getServiceClient();
async function main() {
  const { data: section } = await supabase
    .from("draft_pack_sections")
    .select("id")
    .eq("section_key", "01_executive_summary")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log("section:", section);
  if (!section) return;
  const { data: revs } = await supabase
    .from("draft_pack_section_revisions")
    .select("created_at, edited_by, reason, content")
    .eq("section_id", section.id)
    .order("created_at", { ascending: false })
    .limit(5);
  for (const r of revs ?? []) {
    console.log(`\n--- ${r.created_at} by ${r.edited_by} (${r.reason ?? "(no reason)"}) ---`);
    console.log(`  len: ${r.content?.length ?? 0}, head: ${JSON.stringify(r.content?.slice(0, 100))}`);
  }
}
main().catch(console.error);
