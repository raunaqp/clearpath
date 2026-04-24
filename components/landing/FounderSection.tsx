"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

const credentials = [
  "IPU Pathfinder Award",
  "ABDM Champion Mentor",
  "SIIP Fellow — DBT BIRAC",
  "Distinguished speaker, national health forums",
  "Mentor to 20+ digital health startups",
];

const testimonials = [
  {
    quote:
      "This can be an extremely useful tool for new founders, before they start building their product.",
    name: "Dr Bhaskar Rajakumar",
    title: "CEO, Charaka",
  },
  {
    quote:
      "It was a nightmarish process over 2 years, where I had to figure out everything by myself — and spend hours preparing the documentation.",
    name: "Dhritiman Mallick",
    title: "CEO, Vyuhaa Med Data",
  },
  {
    quote:
      "For healthcare regulations, providing support end to end can be of a lot of value to the founder.",
    name: "Sohit Kapoor",
    title: "Founder, Briefcase",
  },
];

export default function FounderSection() {
  const ref = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          try {
            posthog.capture("section_viewed", { section: "founder" });
          } catch {}
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 border-b border-[#E8E4D6]"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-6">
          Who built this
        </p>
        <h2 className="font-serif font-normal text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] max-w-2xl mb-14">
          Built by founders who&apos;ve reviewed real CDSCO submissions.
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Founder */}
          <div>
            <div className="flex flex-col items-start gap-5">
              <Image
                src="/founder.jpeg"
                alt="Raunaq Pradhan"
                width={120}
                height={120}
                className="rounded-full border-2 border-[#D9D5C8] object-cover"
                style={{ width: 120, height: 120 }}
              />
              <div>
                <p className="font-serif text-[20px] text-[#0E1411] mb-3">
                  Raunaq Pradhan
                </p>
                <p className="text-[14px] text-[#6B766F] leading-relaxed max-w-sm">
                  For a decade, I&apos;ve worked across digital health, ABDM
                  protocol design, and digital health startup mentoring — from
                  concept to scale. Core contributor to the Ayushman Bharat
                  Digital Mission, helping companies navigate ABDM integration,
                  go-lives in Delhi and Odisha, and AI-in-health compliance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {credentials.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[11px] border border-[#D9D5C8] bg-white text-[#0E1411] rounded-full px-3 py-1 leading-snug"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Testimonials */}
          <div className="flex flex-col gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-5"
              >
                <p className="font-serif italic text-[15px] text-[#0E1411] leading-relaxed">
                  <span className="text-[#0F6E56] not-italic">&ldquo;</span>
                  {t.quote}
                  <span className="text-[#0F6E56] not-italic">&rdquo;</span>
                </p>
                <p className="font-mono text-[11px] text-[#6B766F] mt-3">
                  — {t.name}, {t.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
