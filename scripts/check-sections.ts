import { getServiceClient } from "../lib/supabase";
const supabase = getServiceClient();
async function main() {
  const { count } = await supabase
    .from("draft_pack_sections")
    .select("*", { count: "exact", head: true })
    .eq("order_id", "b54a20ec-9bbc-46bd-a53c-4cdbacc9ce15");
  console.log("draft_pack_sections under b54a20ec:", count);
  const { data } = await supabase
    .from("draft_pack_sections")
    .select("section_key, word_count, completion_status")
    .eq("order_id", "b54a20ec-9bbc-46bd-a53c-4cdbacc9ce15")
    .order("section_key");
  for (const s of data ?? []) console.log(" ", s.section_key, s.word_count, s.completion_status);
}
main().catch(console.error);
