/**
 * Reset the previously-seeded regulator-demo rows so we can re-seed
 * cleanly after fixing the bucket.
 */
import { getServiceClient } from "../lib/supabase";

const DEMO_EMAIL = "demo+regulator@clearpath.in";

async function main() {
  const supabase = getServiceClient();

  // Find the assessment(s)
  const { data: rows, error: qErr } = await supabase
    .from("assessments")
    .select("id, share_token")
    .eq("email", DEMO_EMAIL);
  if (qErr) {
    console.error(qErr.message);
    process.exit(1);
  }
  if (!rows || rows.length === 0) {
    console.log("no demo assessments to clean");
    return;
  }

  for (const a of rows) {
    // Delete dependent tier2_orders first
    const { error: oErr } = await supabase
      .from("tier2_orders")
      .delete()
      .eq("assessment_id", a.id);
    if (oErr) {
      console.error(`delete tier2_orders for ${a.id} failed: ${oErr.message}`);
      process.exit(1);
    }
    // Delete engine_costs (telemetry rows that FK to assessment)
    const { error: ecErr } = await supabase
      .from("engine_costs")
      .delete()
      .eq("assessment_id", a.id);
    if (ecErr) {
      console.error(`delete engine_costs for ${a.id} failed: ${ecErr.message}`);
      process.exit(1);
    }
    // Delete the assessment
    const { error: aErr } = await supabase
      .from("assessments")
      .delete()
      .eq("id", a.id);
    if (aErr) {
      console.error(`delete assessment ${a.id} failed: ${aErr.message}`);
      process.exit(1);
    }
    console.log(`✓ cleaned assessment ${a.id} (share_token=${a.share_token})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
