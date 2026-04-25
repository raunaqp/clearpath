"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function Tier3SecondaryLink({
  assessmentId,
}: {
  assessmentId?: string;
}) {
  const href = assessmentId
    ? `/concierge?source=card&assessment_id=${assessmentId}`
    : "/concierge";

  function handleClick() {
    try {
      posthog.capture("tier3_cta_clicked", {
        source: "card_bottom",
        has_assessment_id: !!assessmentId,
      });
    } catch {
      // telemetry only; never block navigation
    }
  }

  return (
    <div className="mt-6">
      <hr className="border-t border-[#D9D5C8] mb-4" />
      <p className="text-sm text-[#6B766F] leading-relaxed mb-3">
        Want an expert to review + refine before you file?
      </p>
      <Link
        href={href}
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full border-2 border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white font-medium text-sm px-5 py-2 transition-colors"
      >
        Submission Concierge · ₹50,000 for 12 months →
      </Link>
    </div>
  );
}
