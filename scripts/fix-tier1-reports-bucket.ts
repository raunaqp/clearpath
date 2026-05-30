/**
 * One-shot config fix: add 'application/json' to the tier1_reports
 * bucket's allowed_mime_types. The bucket was created with PDF-only,
 * but triggerReadinessReportForOrder uploads report.json first (so the
 * regenerate-PDF flow can re-render without re-calling Opus). Without
 * this fix, every Cashfree-paid ₹499 order fails at the storage step.
 *
 * Reversible: re-running the script is idempotent (sets the same list).
 * To revert, edit allowed_mime_types via Supabase Dashboard.
 */
import { getServiceClient } from "../lib/supabase";

const BUCKET = "tier1_reports";
const ALLOWED = ["application/pdf", "application/json"];

async function main() {
  const supabase = getServiceClient();
  const { error } = await supabase.storage.updateBucket(BUCKET, {
    allowedMimeTypes: ALLOWED,
  });
  if (error) {
    console.error(`updateBucket failed: ${error.message}`);
    process.exit(1);
  }
  // Verify
  const { data: buckets } = await supabase.storage.listBuckets();
  const b = buckets?.find((x) => x.name === BUCKET);
  console.log(`✓ ${BUCKET}.allowed_mime_types = ${JSON.stringify(b?.allowed_mime_types)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
