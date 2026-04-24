"use client";
import Link from "next/link";
import posthog from "posthog-js";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

export default function CTASection() {
  const ref = useSectionTracking("final_cta");

  function handleClick() {
    try {
      posthog.capture("cta_clicked", {
        cta_location: "final_cta",
        cta_text: "Get your readiness card →",
        destination: "/start",
      });
    } catch {}
  }

  return (
    <section ref={ref} className="bg-[#0E1411] py-24 md:py-32 w-full">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 text-center">
        <h2 className="font-serif font-normal text-[clamp(32px,5vw,48px)] leading-[1.1] tracking-[-0.02em] text-white mb-4">
          Know where you stand in 5 minutes.
        </h2>
        <p className="text-[#9AA69F] text-[17px] mb-10">
          Free. No sign-up. No consultant calls.
        </p>
        <Link
          href="/start"
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-[#0F6E56] text-white font-medium text-[16px] px-8 py-4 rounded-full hover:bg-[#0d5c48] transition-colors"
        >
          Get your readiness card →
        </Link>
        <p className="text-[#9AA69F] text-[13px] mt-6">
          Questions? Write to{" "}
          <a href="mailto:founder@clearpath.in" className="underline hover:text-white transition-colors">
            founder@clearpath.in
          </a>
        </p>
      </div>
    </section>
  );
}
