"use client";
import Link from "next/link";
import posthog from "posthog-js";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

const stats = [
  {
    number: "12–24",
    unit: "months",
    label: "from filing to approval for Class C/D devices",
  },
  {
    number: "₹10–80L",
    unit: "",
    label: "in consultants + delays for a typical MVP-to-submission journey",
  },
  {
    number: "70–80%",
    unit: "",
    label: "of first-time submissions come back with deficiency letters",
  },
];

function trackCta(location: string, text: string) {
  try {
    posthog.capture("cta_clicked", {
      cta_location: location,
      cta_text: text,
      destination: "/start",
    });
  } catch {}
}

export default function HeroSection() {
  const ref = useSectionTracking("hero");

  return (
    <section ref={ref} className="pt-12 pb-12 md:pt-28 md:pb-24 border-b border-[#E8E4D6]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-6">
          Indian Digital Health · Regulatory Readiness
        </p>

        <h1 className="font-serif font-normal text-[clamp(40px,6vw,80px)] leading-[1.04] tracking-[-0.03em] text-[#0E1411] max-w-4xl mb-6">
          CDSCO changed what counts as a medical device.{" "}
          <span className="text-[#2A3430]">
            Your product might be one you didn&apos;t know about.
          </span>
        </h1>

        <p className="text-base sm:text-[18px] text-[#6B766F] max-w-2xl leading-relaxed mb-6 sm:mb-10">
          CDSCO&apos;s Medical Device Rules 2017 and the Oct 2025 SaMD draft changed
          what counts as a medical device. ClearPath tells you in 5 minutes
          whether your product is in scope — and what the fastest path to
          compliance looks like.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <Link
            href="/start"
            onClick={() => trackCta("hero", "Get your readiness card — free")}
            className="inline-flex items-center gap-2 bg-[#0F6E56] text-white font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-[#0d5c48] transition-colors"
          >
            Get your readiness card — free
          </Link>
          <span className="text-sm text-[#6B766F]">
            5 minutes. No sign-up required. Share-ready verdict.
          </span>
        </div>

        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#6B766F] mt-5">
          Backed by experts from ABDM · Regulatory Officials · Indian healthtech founders
        </p>
        <p className="text-[12px] text-[#6B766F] font-mono tracking-wide mt-2">
          Built on real CDSCO submissions · Aligned to the Oct 2025 SaMD draft
          · Tested on 15+ Indian healthtech products
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-14">
          {stats.map((s) => (
            <div
              key={s.number}
              className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-card p-5"
            >
              <p className="font-serif text-[36px] font-normal text-[#BA7517] leading-none mb-1">
                {s.number}
                {s.unit && (
                  <span className="text-[18px] ml-1 text-[#6B766F]">
                    {s.unit}
                  </span>
                )}
              </p>
              <p className="text-[13px] text-[#6B766F] leading-snug mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
