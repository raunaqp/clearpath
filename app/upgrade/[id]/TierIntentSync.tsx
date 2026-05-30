"use client";

/**
 * Sprint 3 Phase 1.1 Bug 2 → Phase 2c tier-picker fix.
 *
 * History: this used to mirror `?tier=` to sessionStorage and silently
 * restore it on subsequent /upgrade/[id] visits — so a Cashfree round-
 * trip that dropped `?tier=` on back-navigation still kept the
 * customer on their chosen tier surface.
 *
 * Phase 2c regression: the silent restore was hiding the TierPicker on
 * the main "Generate my documents" entry. If a user (or a demo session)
 * had ever clicked a tier card, the stored intent would re-route them
 * past the picker on every subsequent visit, even when they explicitly
 * came back to compare tiers.
 *
 * New behaviour: write-only. We still persist the current `?tier=` to
 * sessionStorage (kept for future analytics / observability use), but
 * we DO NOT silently restore from it. A Cashfree back-nav user who
 * loses `?tier=` will re-pick on the TierPicker — acceptable trade-off
 * because the alternative was hiding the main-journey picker entirely.
 *
 * Once the customer pays, the tier2_orders row's tier_choice column
 * becomes the source of truth — StatusPanel reads from there and this
 * sync is irrelevant.
 */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "cp_tier_intent";

export function TierIntentSync({
  currentTier,
}: {
  /** Server-resolved `?tier=` from page.tsx searchParams. */
  currentTier: "draft_pack" | "draft_editor" | null;
}) {
  const search = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (search.get("change") === "1") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // sessionStorage can throw in some sandboxed contexts; ignore.
      }
      return;
    }

    if (currentTier) {
      try {
        sessionStorage.setItem(STORAGE_KEY, currentTier);
      } catch {
        // ignore
      }
    }
    // Note: no read-and-restore path. Fresh visits without ?tier=
    // always render the TierPicker so the customer can pick (or
    // re-pick after a Cashfree back-navigation).
  }, [currentTier, search]);

  return null;
}
