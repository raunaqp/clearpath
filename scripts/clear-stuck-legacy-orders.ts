/**
 * One-shot cleanup: flip the two known pre-Cashfree legacy orders
 * stuck at status='generating' to 'failed' so the admin order table
 * is clean. Both orders have NULL cashfree_payment_id — no charge,
 * no refund needed. Idempotent (CAS on status='generating').
 *
 * Run: dotenvx run -f .env.local -- tsx scripts/clear-stuck-legacy-orders.ts
 */
import { getServiceClient } from "../lib/supabase";

const STUCK_ORDER_IDS = [
  "745c9768-de1d-4388-918f-6c81fc49407f", // demo+cerviai@clearpath.in, ~20d
  "c4a5a62a-7c2b-4a32-bd57-81f307a37508", // raunaq.pradhan@gmail.com, ~31d
] as const;

async function main() {
  const supabase = getServiceClient();
  for (const id of STUCK_ORDER_IDS) {
    const { data, error } = await supabase
      .from("tier2_orders")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
        notes: "legacy pre-Cashfree UPI-QR test order — cleared on 2026-05-26",
      })
      .eq("id", id)
      .eq("status", "generating")
      .select("id, status")
      .maybeSingle();
    if (error) {
      console.error(`✗ ${id}: ${error.message}`);
      continue;
    }
    if (!data) {
      console.log(`◌ ${id}: not in 'generating' (already cleared or different state) — skipped`);
      continue;
    }
    console.log(`✓ ${id}: ${data.status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
