/**
 * Inspect the tier1_reports bucket config — looking for mime-type
 * restrictions that block JSON uploads.
 */
import { getServiceClient } from "../lib/supabase";

async function main() {
  const supabase = getServiceClient();
  // List buckets first
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error("listBuckets failed:", bErr.message);
    process.exit(1);
  }
  for (const b of buckets ?? []) {
    if (b.name === "tier1_reports") {
      console.log(JSON.stringify(b, null, 2));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
