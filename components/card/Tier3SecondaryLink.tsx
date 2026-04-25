"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function Tier3SecondaryLink() {
  function handleClick() {
    try {
      posthog.capture("tier3_cta_clicked", { source: "card_bottom" });
    } catch {
      // telemetry only; never block navigation
    }
  }

  return (
    <div className="mt-6">
      <hr className="border-t border-[#D9D5C8] mb-4" />
      <p className="text-sm text-[#6B766F] leading-relaxed">
        Or want an expert to review + refine before you file?{" "}
        <Link
          href="/concierge"
          onClick={handleClick}
          className="text-[#6B766F] hover:text-[#0F6E56] hover:underline underline-offset-2"
        >
          Submission Concierge · ₹50,000 for 12 months →
        </Link>
      </p>
    </div>
  );
}
