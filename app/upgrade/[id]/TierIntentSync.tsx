"use client";

/**
 * Sprint 3 Phase 1.1 Bug 2 — keep tier choice across back-navigation.
 *
 * The Cashfree JS SDK navigates the customer to a hosted checkout page.
 * Depending on the SDK version this can drop the `?tier=` query string
 * on browser-back, so the customer returns to /upgrade/[id] with the
 * tier picker re-shown — even though they had already picked.
 *
 * This mirrors the URL's `tier` param to sessionStorage:
 *   • URL has tier → write it to sessionStorage
 *   • URL missing tier → if sessionStorage has one, replace the URL
 *
 * The explicit "Change tier" link adds ?change=1, which clears the
 * stored intent and skips the rehydration to avoid trapping the
 * customer in their previous choice.
 *
 * Once the customer pays, the tier2_orders row's tier_choice column
 * becomes the source of truth — StatusPanel reads from there and this
 * sync is irrelevant.
 */
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "cp_tier_intent";
const VALID = new Set(["draft_pack", "draft_editor"]);

export function TierIntentSync({
  currentTier,
}: {
  /** Server-resolved `?tier=` from page.tsx searchParams. */
  currentTier: "draft_pack" | "draft_editor" | null;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();

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
      return;
    }

    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (stored && VALID.has(stored)) {
      router.replace(`${pathname}?tier=${stored}`);
    }
  }, [currentTier, search, pathname, router]);

  return null;
}
