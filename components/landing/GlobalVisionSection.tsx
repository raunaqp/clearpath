"use client";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

export default function GlobalVisionSection() {
  const ref = useSectionTracking("global_vision");

  return (
    <section ref={ref} className="py-16 md:py-20 px-6 md:px-8 border-b border-[#E8E4D6] bg-[#F7F6F2]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-5">
          What&apos;s Next
        </p>
        <h2 className="font-serif font-normal text-3xl sm:text-4xl tracking-tight text-[#0E1411]">
          India first. Global regulatory backbone next.
        </h2>
        <p className="mt-5 text-[#6B766F] text-base md:text-lg leading-relaxed">
          ClearPath is built for India&apos;s 14,000 healthtech companies today.
          Expansion to USA, EU, UK, and Japan planned 2027+. The India regulatory
          playbook is becoming the template for emerging markets.
        </p>
      </div>
    </section>
  );
}
