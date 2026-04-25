"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

/**
 * Two equal-hierarchy CTAs side-by-side. Tier 2 (Draft Pack, ₹499) and
 * Tier 3 (Concierge, ₹50K/12 months) are now presented as parallel
 * decision paths rather than primary + secondary. Replaces the previous
 * Tier2CTABlock + Tier3SecondaryLink pair on the Readiness Card.
 *
 * Mobile: stacked, full-width. sm+: side-by-side, equal width via flex-1.
 */
export function Tier23ButtonRow({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();

  function handleTier2() {
    try {
      posthog.capture("tier2_cta_clicked", { source: "card_bottom" });
    } catch {
      // telemetry only
    }
    router.push(`/upgrade/${assessmentId}`);
  }

  function handleTier3() {
    try {
      posthog.capture("tier3_cta_clicked", {
        source: "card_bottom",
        has_assessment_id: true,
      });
    } catch {
      // telemetry only
    }
  }

  return (
    <section>
      <h2 className="font-serif text-2xl text-[#0E1411] mb-1">Pick your path</h2>
      <p className="text-sm text-[#6B766F] mb-5">
        Two ways forward — both build off this Readiness Card.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleTier2}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 focus-visible:ring-offset-2 text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Get the Draft Pack — ₹499 →
        </button>
        <Link
          href={`/concierge?source=card&assessment_id=${assessmentId}`}
          onClick={handleTier3}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[#993C1D] hover:bg-[#7d3018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#993C1D]/30 focus-visible:ring-offset-2 text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Concierge — ₹50K / 12 months →
        </Link>
      </div>
      <p className="text-xs text-[#6B766F] mt-3 leading-relaxed">
        Draft Pack: 10 minutes, emailed. Concierge: ongoing expert review for
        12 months.
      </p>
    </section>
  );
}
