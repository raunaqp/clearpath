"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

/**
 * Sprint 3 Phase 1.5 — primary + alternative CTAs at the bottom of
 * the Readiness Card. Pricing was pulled off this surface: the
 * Draft Pack vs Draft Editor choice now happens on /upgrade/[id]
 * (the tier picker), and the consultation path is an interest-signal
 * lead capture with no number shown.
 *
 * Mobile: stacked, full-width. sm+: side-by-side, equal width via flex-1.
 */
export function Tier23ButtonRow({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();

  function handleGenerate() {
    try {
      posthog.capture("tier2_cta_clicked", { source: "card_bottom" });
    } catch {
      // telemetry only
    }
    router.push(`/upgrade/${assessmentId}`);
  }

  function handleConsult() {
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
          onClick={handleGenerate}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 focus-visible:ring-offset-2 text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Generate my documents now →
        </button>
        <Link
          href={`/concierge?source=card&assessment_id=${assessmentId}`}
          onClick={handleConsult}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[#993C1D] hover:bg-[#7d3018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#993C1D]/30 focus-visible:ring-offset-2 text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Seek expert consultation →
        </Link>
      </div>
      <p className="text-xs text-[#6B766F] mt-3 leading-relaxed">
        Generate: a 4–6 page Readiness Report or the full
        Submission Workspace — pricing on the next page.
        Consultation: tell us about your filing and we&apos;ll match you
        with an Indian regulatory expert.
      </p>
    </section>
  );
}
