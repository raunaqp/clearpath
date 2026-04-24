"use client";

import Link from "next/link";
import posthog from "posthog-js";

const CHECK = (
  <svg
    className="w-4 h-4 flex-shrink-0 text-[#0F6E56]"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8l3.5 3.5L13 4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-[#0E1411]">
          {CHECK}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function trackCta(tier: string) {
  try {
    posthog.capture("pricing_cta_clicked", { tier });
  } catch {}
}

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-28 px-6 md:px-8 border-b border-[#E8E4D6]"
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-4">
            Pricing
          </p>
          <h2 className="font-serif font-normal text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411]">
            Priced so a founder decides,<br className="hidden sm:block" /> not a procurement team.
          </h2>
          <p className="mt-4 text-[#6B766F] text-base md:text-lg max-w-xl mx-auto">
            A free card to know where you stand. ₹499 for a draft. ₹50,000 when you&apos;re ready to file.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 — Free */}
          <div className="rounded-xl border border-[#D9D5C8] bg-[#FDFCF8] p-6 flex flex-col">
            <span className="font-mono text-xs tracking-widest uppercase text-[#6B766F] mb-3">
              Stage 1 · Free
            </span>
            <h3 className="font-serif text-2xl text-[#0E1411]">
              Readiness Card
            </h3>
            <p className="italic text-[#6B766F] text-sm mt-1">
              5-minute clarity
            </p>
            <BulletList
              items={[
                "Risk · High / Medium / Low",
                "Readiness score · /10",
                "Likely CDSCO class (if applicable)",
                "Top 3 gaps to fix first",
                "Time-to-approval estimate",
              ]}
            />
            <div className="mt-auto pt-6">
              <p className="text-[28px] font-serif text-[#0E1411] mb-3">Free</p>
              <Link
                href="/start"
                onClick={() => trackCta("free")}
                className="block text-center bg-[#E1F5EE] text-[#0F6E56] font-medium text-sm px-5 py-3 rounded-full hover:bg-[#c9ede3] transition-colors"
              >
                Start free →
              </Link>
            </div>
          </div>

          {/* Tier 2 — ₹499 (highlighted) */}
          <div className="rounded-xl border-2 border-[#0F6E56] bg-[#FDFCF8] p-6 flex flex-col shadow-md">
            <span className="font-mono text-xs tracking-widest uppercase text-[#0F6E56] mb-3">
              Stage 2 · Most popular
            </span>
            <h3 className="font-serif text-2xl text-[#0E1411]">
              Regulatory Draft Pack
            </h3>
            <p className="italic text-[#6B766F] text-sm mt-1">
              Delivered in ~10 minutes
            </p>
            <BulletList
              items={[
                "Structured application draft",
                "Section-wise content (intended use, risk, clinical context)",
                "Checklist mapped to CDSCO submission structure",
                "Relevant CDSCO forms (MD-12, MD-9 etc.)",
                "Pathway + realistic timeline",
              ]}
            />
            <div className="mt-auto pt-6">
              <p className="text-[28px] font-serif text-[#0E1411] mb-3">₹499</p>
              <Link
                href="/start"
                onClick={() => trackCta("draft_pack")}
                className="block text-center bg-[#0F6E56] text-white font-medium text-sm px-5 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
              >
                Get draft pack →
              </Link>
            </div>
          </div>

          {/* Tier 3 — ₹50,000 */}
          <div className="rounded-xl border border-[#D9D5C8] bg-[#FDFCF8] p-6 flex flex-col">
            <span className="font-mono text-xs tracking-widest uppercase text-[#6B766F] mb-3">
              Stage 3 · Waitlist
            </span>
            <h3 className="font-serif text-2xl text-[#0E1411]">
              Submission Concierge
            </h3>
            <p className="italic text-[#6B766F] text-sm mt-1">
              Expert-reviewed · 2–3 weeks
            </p>
            <BulletList
              items={[
                "Document refinement by Indian regulatory experts",
                "Classification re-validation",
                "QMS checklist guidance (ISO 13485, IEC 62304)",
                "Clinical validation plan review",
                "Submission support · 1 iteration",
              ]}
            />
            <div className="mt-auto pt-6">
              <p className="text-[28px] font-serif text-[#0E1411] mb-3">₹50,000</p>
              <Link
                href="/start"
                onClick={() => trackCta("concierge")}
                className="block text-center bg-[#FAECE7] text-[#993C1D] font-medium text-sm px-5 py-3 rounded-full hover:bg-[#f5d5cb] transition-colors"
              >
                Join waitlist →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
