/**
 * Sprint 3 Story 3.1 — single source of truth for the two-tier pricing.
 *
 * Importable by both server (page.tsx, route.ts) and client (button
 * + status-panel branches), so a price change touches one file.
 *
 * Phase 1.6 — pricing UNCHANGED (₹499 / ₹2,499) per founder lock.
 * Customer-facing labels renamed to "Regulatory Readiness Report" /
 * "Submission Workspace". DB enum values (draft_pack / draft_editor)
 * stay the same — only the display strings updated.
 */

export type TierChoice = "draft_pack" | "draft_editor";

export type TierConfig = {
  /** ₹ amount sent to Cashfree at order creation. */
  amountInr: number;
  /** Tier 1 delivers via email → email must be verified before
   *  payment. Tier 2 delivers in-app → no email gate. */
  requiresVerifiedEmail: boolean;
  /** Customer-facing label. */
  label: string;
  /** Tier number for eyebrows / chips. The DB enum draft_pack is
   *  the ₹499 Tier 1 Readiness Report; draft_editor is the ₹2,499
   *  Tier 2 Submission Workspace. Centralised here so eyebrows
   *  can't mislabel one as the other. */
  tierLabel: "Tier 1" | "Tier 2";
  /** One-line summary of the delivery channel. */
  deliveryChannel: string;
};

export const TIER_PRICING: Record<TierChoice, TierConfig> = {
  draft_pack: {
    amountInr: 499,
    requiresVerifiedEmail: true,
    label: "Regulatory Readiness Report",
    tierLabel: "Tier 1",
    deliveryChannel: "Emailed to you",
  },
  draft_editor: {
    amountInr: 2499,
    requiresVerifiedEmail: false,
    label: "Submission Workspace",
    tierLabel: "Tier 2",
    deliveryChannel: "In-app editor",
  },
};

export function isTierChoice(v: unknown): v is TierChoice {
  return v === "draft_pack" || v === "draft_editor";
}
