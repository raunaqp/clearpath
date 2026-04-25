"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

const steps = [
  { label: "Land", sub: "clearpath.in" },
  { label: "Describe", sub: "one-liner + URL" },
  { label: "Readiness Card", sub: "5 minutes", badge: "FREE", badgeColor: "bg-[#E1F5EE] text-[#0F6E56]" },
  { label: "Draft Pack", sub: "10 minutes", badge: "₹499", badgeColor: "bg-[#FAEEDA] text-[#BA7517]" },
  { label: "Concierge", sub: "12-month engagement", badge: "₹50K", badgeColor: "bg-[#FAECE7] text-[#993C1D]" },
  { label: "Submit to CDSCO", sub: "to CDSCO" },
];

export default function HowItWorksSection() {
  const ref = useSectionTracking("how_it_works");

  function handleCta() {
    try {
      posthog.capture("cta_clicked", {
        cta_location: "journey_end",
        cta_text: "Start with Stage 1 — it's free →",
        destination: "/start",
      });
    } catch {}
  }

  return (
    <section id="how-it-works" ref={ref} className="py-20 px-6 md:px-8 bg-[#F7F6F2]">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#0E1411] tracking-tight">
            Clarity → Draft → Submission
          </h2>
          <p className="mt-2 text-[#6B766F] text-base md:text-lg">
            Three stages. Each one earns the next.
          </p>
        </div>

        <div className="mt-16 overflow-x-auto">
          <div className="flex items-start min-w-max mx-auto justify-center">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-start">
                <div className="flex flex-col items-center w-32">
                  <div className="w-10 h-10 rounded-full border-2 border-[#D9D5C8] bg-[#FDFCF8] flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-medium text-[#0E1411]">{i + 1}</span>
                  </div>
                  {step.badge ? (
                    <span className={`mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  ) : (
                    <div className="mt-1 h-[22px]" />
                  )}
                  <p className="mt-1 text-xs font-medium text-[#0E1411] text-center leading-tight">{step.label}</p>
                  <p className="mt-0.5 text-[10px] text-[#6B766F] text-center">{step.sub}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-shrink-0 w-8 mt-4 border-t-2 border-dashed border-[#D9D5C8]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/start"
            onClick={handleCta}
            className="inline-block bg-[#0F6E56] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
          >
            Start with Stage 1 — it&apos;s free →
          </Link>
        </div>
      </div>
    </section>
  );
}
