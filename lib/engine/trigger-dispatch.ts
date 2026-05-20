/**
 * Phase 1.6 — Tier-aware generation dispatcher.
 *
 * Single entry point for "the order is now status='generating',
 * produce the deliverable". Looks up `tier_choice` on the order and
 * routes to the right trigger:
 *
 *   - draft_pack    → triggerReadinessReportForOrder  (₹499 Tier 1)
 *   - draft_editor  → triggerV2GenerationForOrder      (₹2,499 Tier 2)
 *   - null (legacy) → triggerReadinessReportForOrder  (matches migration 016 backfill)
 *
 * Callers (Cashfree webhook, admin verify-order) call this instead
 * of the tier-specific functions directly so the tier check stays
 * in one place.
 */

import { getServiceClient } from "@/lib/supabase";
import { triggerV2GenerationForOrder } from "./draft-pack-v2/auto-trigger";
import { triggerReadinessReportForOrder } from "./readiness-report-trigger";

export async function dispatchGenerationForOrder(
  orderId: string
): Promise<void> {
  const supabase = getServiceClient();
  const { data: order, error } = await supabase
    .from("tier2_orders")
    .select("id, tier_choice")
    .eq("id", orderId)
    .maybeSingle<{ id: string; tier_choice: string | null }>();

  if (error || !order) {
    console.error(
      `[trigger-dispatch] could not load order ${orderId}:`,
      error?.message ?? "no row"
    );
    return;
  }

  const tier = order.tier_choice ?? "draft_pack";
  console.log(
    `[trigger-dispatch] order ${orderId} tier_choice=${tier} → routing`
  );

  if (tier === "draft_editor") {
    return triggerV2GenerationForOrder(orderId);
  }
  // 'draft_pack' OR legacy null — Phase 1.6 Tier 1 path.
  return triggerReadinessReportForOrder(orderId);
}
