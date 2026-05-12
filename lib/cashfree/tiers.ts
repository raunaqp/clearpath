/**
 * Sprint 3 Story 3.1 — single source of truth for the two-tier pricing.
 *
 * Importable by both server (page.tsx, route.ts) and client (button
 * + status-panel branches), so a price change touches one file.
 */

export type TierChoice = "draft_pack" | "draft_editor";

export type TierConfig = {
  /** ₹ amount sent to Cashfree at order creation. */
  amountInr: number;
  /** Draft Pack delivers via email → email must be verified before
   *  payment. Draft Editor delivers in-app → no email gate. */
  requiresVerifiedEmail: boolean;
  /** Customer-facing label. */
  label: string;
  /** One-line summary of the delivery channel. */
  deliveryChannel: string;
};

export const TIER_PRICING: Record<TierChoice, TierConfig> = {
  draft_pack: {
    amountInr: 499,
    requiresVerifiedEmail: true,
    label: "Draft Pack",
    deliveryChannel: "Emailed to you",
  },
  draft_editor: {
    amountInr: 2499,
    requiresVerifiedEmail: false,
    label: "Draft Editor",
    deliveryChannel: "In-app editor",
  },
};

export function isTierChoice(v: unknown): v is TierChoice {
  return v === "draft_pack" || v === "draft_editor";
}
