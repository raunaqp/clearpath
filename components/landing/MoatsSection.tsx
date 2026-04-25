"use client";

import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

const moats = [
  {
    title: "Trained on 15+ real products, validated with experts",
    description:
      "Calibrated on 15 real Indian healthtechs — CerviAI filings, EkaScribe, Neodocs, Niramai, Forus Health. Reviewed with ABDM architects and founders who have filed CDSCO applications.",
  },
  {
    title: "Founder-first UX",
    description:
      "Consultants sell complexity. We sell clarity. Different incentives, different product.",
  },
  {
    title: "India × digital health intersection — 9 regulations",
    description:
      "CDSCO MDR + Pharmacy, DPDP, ICMR, ABDM, NABH, MCI, IRDAI, NABL. Not solved anywhere today.",
  },
  {
    title: "Compound regulatory intelligence",
    description:
      "Every product we run improves the next. CDSCO precedent, class patterns, approval timelines build up into a data moat.",
  },
  {
    title: "Expert-in-loop concierge",
    description:
      "Stage 3 leverages 20–30 Indian regulatory experts. Software doesn't replace human judgement at ₹50K value. The network is the defensibility.",
  },
];

export default function MoatsSection() {
  const ref = useSectionTracking("moats");

  return (
    <section
      ref={ref}
      className="py-20 px-6 md:px-8 bg-[#FDFCF8]"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="font-serif font-normal text-3xl sm:text-4xl tracking-tight text-[#0E1411]">
            Why ClearPath — not a consultant, not a search
          </h2>
          <p className="mt-2 text-[#6B766F] text-base md:text-lg max-w-xl mx-auto">
            Structural reasons a generalist LLM or a consultant&apos;s website can&apos;t
            replicate this.
          </p>
        </div>

        {/* Moat list */}
        <div className="max-w-2xl mx-auto divide-y divide-[#E8E4D6]">
          {moats.map((moat, i) => (
            <div key={moat.title} className="flex gap-5 py-6 first:pt-0 last:pb-0">
              {/* Circle number */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0F6E56] flex items-center justify-center mt-0.5">
                <span className="text-white text-sm font-semibold font-mono leading-none">
                  {i + 1}
                </span>
              </div>

              {/* Content */}
              <div>
                <p className="font-semibold text-[#0E1411] text-base leading-snug">
                  {moat.title}
                </p>
                <p className="mt-1 text-sm text-[#6B766F] leading-relaxed">
                  {moat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
