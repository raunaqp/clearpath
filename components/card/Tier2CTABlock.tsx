"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";

const PILLARS: ReadonlyArray<{
  icon: string;
  label: string;
  detail: string;
}> = [
  {
    icon: "📋",
    label: "The regulations that apply to your product",
    detail: "3-5 of 9 — specific to your classification",
  },
  {
    icon: "📄",
    label: "The blank CDSCO forms you'll need to fill",
    detail: "MD-12, MD-9, etc. — real government PDFs",
  },
  {
    icon: "🗺",
    label: "A submission guide",
    detail: "Which form goes where, in what order",
  },
  {
    icon: "✍",
    label: "Drafted content for each section",
    detail:
      "Intended Use, Device Description, Risk Justification, Clinical Context — tailored to your product",
  },
];

export function Tier2CTABlock({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();

  function handleClick() {
    try {
      posthog.capture("tier2_cta_clicked", { source: "card_bottom" });
    } catch {
      // posthog may be uninitialised in some envs (e.g., SSR-stripped tests);
      // never block the navigation on telemetry.
    }
    router.push(`/upgrade/${assessmentId}`);
  }

  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl text-[#0E1411] mb-5">
        Ready to file? Get your Draft Pack — ₹499
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.label}
            className="flex items-start gap-3 rounded-xl bg-white border border-[#D9D5C8] p-4"
          >
            <span aria-hidden className="text-xl leading-none mt-0.5">
              {pillar.icon}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] text-[#0E1411] leading-snug">
                {pillar.label}
              </p>
              <p className="text-sm text-[#6B766F] mt-1 leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Get the Draft Pack — ₹499 →
        </button>
        <p className="text-xs text-[#6B766F]">
          10 minutes. Emailed to you. Replaces ₹50K-3L of consultant work.
        </p>
      </div>
    </section>
  );
}
