/**
 * Read-only pre-flight: check for any existing rows we'd collide with
 * before seeding the regulator demo.
 */
import { getServiceClient } from "../lib/supabase";

const DEMO_EMAIL = "demo+regulator@clearpath.in";

async function main() {
  const supabase = getServiceClient();
  const { data: assess, error: e1 } = await supabase
    .from("assessments")
    .select("id, name, email, share_token, status, created_at")
    .eq("email", DEMO_EMAIL);
  if (e1) {
    console.error("assessments query failed:", e1.message);
    process.exit(1);
  }
  console.log(`assessments with email=${DEMO_EMAIL}: ${assess?.length ?? 0}`);
  for (const a of assess ?? []) {
    console.log(`  ${a.id}  share_token=${a.share_token}  status=${a.status}  created=${a.created_at}`);
  }

  const { data: orders, error: e2 } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id, status, email_sent_to, draft_pack_pdf_url, created_at")
    .eq("email_sent_to", DEMO_EMAIL);
  if (e2) {
    console.error("tier2_orders query failed:", e2.message);
    process.exit(1);
  }
  console.log(`\ntier2_orders with email_sent_to=${DEMO_EMAIL}: ${orders?.length ?? 0}`);
  for (const o of orders ?? []) {
    console.log(`  ${o.id}  assessment=${o.assessment_id}  status=${o.status}  pdf=${o.draft_pack_pdf_url ? "(present)" : "(none)"}  created=${o.created_at}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
