/**
 * Pitch visual — for use in meetings with Venture Center, IKP Eden, founders.
 *
 * One screen. Three sections:
 *   1. The four-product platform vision (Regulation → TRL → Grants → Patents)
 *   2. Shared infrastructure (~70% reuse)
 *   3. Three B2B paths and why incubators say yes
 *
 * Designed to be screenshotted or projected. Reach via /demo/pitch.
 * Not linked from the public site.
 */

import { GlobalHeader } from "@/components/layout/GlobalHeader";
import Link from "next/link";

export const dynamic = "force-static";

const TEAL = "#0F6E56";
const TEAL_LIGHT = "#E1F5EE";
const AMBER = "#BA7517";
const AMBER_LIGHT = "#FAEEDA";
const PURPLE = "#534AB7";
const PURPLE_LIGHT = "#EEEDFE";
const CORAL = "#993C1D";
const CORAL_LIGHT = "#FAECE7";
const GRAY = "#5F5E5A";
const GRAY_LIGHT = "#F1EFE8";
const BG = "#F7F6F2";
const BORDER = "#D9D5C8";
const INK = "#0E1411";
const MUTED = "#6B766F";

type ProductCard = {
  title: string;
  subtitle: string;
  status: string;
  fill: string;
  border: string;
  textColor: string;
};

const products: ProductCard[] = [
  {
    title: "Regulation",
    subtitle: "9 regulations · 6 bodies",
    status: "Live · Tier 1–3",
    fill: TEAL_LIGHT,
    border: TEAL,
    textColor: TEAL,
  },
  {
    title: "TRL + Completion",
    subtitle: "SERB / ANRF anchored",
    status: "Shipping today",
    fill: AMBER_LIGHT,
    border: AMBER,
    textColor: AMBER,
  },
  {
    title: "Grants",
    subtitle: "MAHA · BIRAC · DST",
    status: "Sprint 2",
    fill: PURPLE_LIGHT,
    border: PURPLE,
    textColor: PURPLE,
  },
  {
    title: "Patents",
    subtitle: "FTO · drafting · matching",
    status: "Sprint 3",
    fill: CORAL_LIGHT,
    border: CORAL,
    textColor: CORAL,
  },
];

type B2BPath = {
  title: string;
  who: string;
  price: string;
  notes: string[];
  fill: string;
  border: string;
  textColor: string;
};

const paths: B2BPath[] = [
  {
    title: "Incubator licence",
    who: "Venture Center · IKP Eden · BIRAC TBIs · DST NIDHI",
    price: "Discussing with partners",
    notes: [
      "Cohort access for 30–50 portfolio startups",
      "Pilot terms shaped per partner",
      "Goal: 1–2 case studies before Q3",
    ],
    fill: TEAL_LIGHT,
    border: TEAL,
    textColor: TEAL,
  },
  {
    title: "Co-branded readiness index",
    who: "[Incubator] × ClearPath Index",
    price: "Distribution play",
    notes: [
      "Incubator looks sophisticated to their LPs",
      "We get reach into 30–50 startups",
      "Commercials TBD",
    ],
    fill: PURPLE_LIGHT,
    border: PURPLE,
    textColor: PURPLE,
  },
  {
    title: "Tier 3 referral",
    who: "Incubator surfaces concierge to portfolio",
    price: "Referral fee on close",
    notes: [
      "Per signed concierge contract",
      "Aligns incentives, no upfront commitment",
      "Rate to be agreed per partner",
    ],
    fill: CORAL_LIGHT,
    border: CORAL,
    textColor: CORAL,
  },
];

function ProductCardBox({ p, isLast }: { p: ProductCard; isLast: boolean }) {
  return (
    <div className="flex items-stretch flex-1">
      <div
        className="flex-1 rounded-lg border px-4 py-4 flex flex-col justify-between"
        style={{ background: p.fill, borderColor: p.border }}
      >
        <div>
          <p
            className="font-serif text-base leading-tight mb-1"
            style={{ color: INK }}
          >
            {p.title}
          </p>
          <p className="text-xs leading-snug" style={{ color: MUTED }}>
            {p.subtitle}
          </p>
        </div>
        <p
          className="text-[11px] font-mono uppercase tracking-wide mt-3"
          style={{ color: p.textColor }}
        >
          {p.status}
        </p>
      </div>
      {!isLast && (
        <div
          className="flex items-center justify-center px-1"
          style={{ color: MUTED }}
          aria-hidden
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <path
              d="M1 7 L18 7 M14 3 L18 7 L14 11"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function B2BPathCard({ path }: { path: B2BPath }) {
  return (
    <div
      className="rounded-lg border px-4 py-4"
      style={{ background: path.fill, borderColor: path.border }}
    >
      <p
        className="font-serif text-base leading-tight mb-1"
        style={{ color: INK }}
      >
        {path.title}
      </p>
      <p className="text-xs mb-3" style={{ color: MUTED }}>
        {path.who}
      </p>
      <p
        className="font-mono text-sm mb-3"
        style={{ color: path.textColor }}
      >
        {path.price}
      </p>
      <ul className="text-xs space-y-1.5" style={{ color: MUTED }}>
        {path.notes.map((n) => (
          <li key={n} className="leading-snug">
            · {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PitchVisualPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="max-w-5xl mx-auto space-y-7">
          {/* Header */}
          <header className="space-y-2">
            <p
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: AMBER }}
            >
              ClearPath · Strategic vision · 6 May 2026
            </p>
            <h1
              className="font-serif leading-tight"
              style={{ color: INK, fontSize: "clamp(28px, 3.5vw, 40px)" }}
            >
              From regulatory clarity to a medtech founder readiness platform.
            </h1>
            <p
              className="text-base leading-relaxed max-w-3xl"
              style={{ color: MUTED }}
            >
              ClearPath today: regulatory clarity in 5 minutes. ClearPath in 90
              days: TRL stage certificate, MAHA MedTech alignment, grant
              eligibility match, predicate matching for IP defence — all
              anchored to the same SERB / ANRF / CDSCO vocabulary that grant
              bodies and incubators already use.
            </p>
          </header>

          {/* Product roadmap */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2
                className="font-mono text-[11px] tracking-[0.14em] uppercase"
                style={{ color: TEAL }}
              >
                The four products
              </h2>
              <span
                className="font-mono text-[11px] tracking-[0.14em] uppercase"
                style={{ color: MUTED }}
              >
                Earlier stage → Later stage
              </span>
            </div>
            <div className="flex items-stretch gap-0">
              {products.map((p, i) => (
                <ProductCardBox
                  key={p.title}
                  p={p}
                  isLast={i === products.length - 1}
                />
              ))}
            </div>
          </section>

          {/* Shared infrastructure */}
          <section className="space-y-3">
            <h2
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: GRAY }}
            >
              Shared infrastructure · build once, reuse across products
            </h2>
            <div
              className="rounded-lg border px-5 py-4"
              style={{ background: GRAY_LIGHT, borderColor: BORDER }}
            >
              <p className="text-sm leading-relaxed" style={{ color: INK }}>
                Scrape · Decomposer · 7-Q wizard · Synthesiser · Certainty
                post-processor · Share URL + OG image · Brand system · pgvector
                predicate corpus (5050 records, ports next sprint from CDSCO
                repo)
              </p>
              <p className="text-xs mt-2" style={{ color: MUTED }}>
                Roughly 70% of the platform code is reusable across all four
                products. Each product changes the engine logic (rules +
                prompts + schema), not the chassis. The decomposer earns its
                keep across all four — every founder describes their product
                wrong on first contact.
              </p>
            </div>
          </section>

          {/* B2B paths */}
          <section className="space-y-3">
            <h2
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: PURPLE }}
            >
              Three B2B paths to revenue
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paths.map((p) => (
                <B2BPathCard key={p.title} path={p} />
              ))}
            </div>
          </section>

          {/* Why incubators say yes */}
          <section className="space-y-3">
            <h2
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: CORAL }}
            >
              Why incubators say yes
            </h2>
            <div
              className="rounded-lg border px-5 py-4 space-y-3"
              style={{ background: "white", borderColor: BORDER }}
            >
              <div>
                <p
                  className="font-serif text-base mb-1"
                  style={{ color: INK }}
                >
                  1. MAHA MedTech is live and their portfolio needs a TRL Stage
                  Certificate.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  ANRF + ICMR + Gates Foundation, ₹750 cr over 5 years. ₹5–25
                  cr per project (up to ₹50 cr exceptional). TRL 3–8 eligible.
                  Mandatory document: TRL Stage Certificate. ClearPath produces
                  this framing automatically. No other Indian tool does.
                </p>
              </div>
              <div>
                <p
                  className="font-serif text-base mb-1"
                  style={{ color: INK }}
                >
                  2. They have no scalable regulatory layer today.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Every founder in their portfolio asks the same questions.
                  Their team repeats the same answers. ClearPath is the
                  leverage layer — 30 startups served by one tool, not one
                  consultant per startup.
                </p>
              </div>
              <div>
                <p
                  className="font-serif text-base mb-1"
                  style={{ color: INK }}
                >
                  3. Calibrated on 15 real Indian medtechs. Not vapourware.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Show them CerviAI, EkaScribe, Forus Health cards live in the
                  meeting. The cards are reproducible — they can run their own
                  portfolio companies through and see the output in 5 minutes.
                </p>
              </div>
            </div>
          </section>

          {/* Pitch script anchor */}
          <section className="space-y-3">
            <h2
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: AMBER }}
            >
              Pitch in one sentence
            </h2>
            <div
              className="rounded-lg border-2 px-5 py-5"
              style={{ background: AMBER_LIGHT, borderColor: AMBER }}
            >
              <p
                className="font-serif leading-snug"
                style={{ color: INK, fontSize: "clamp(20px, 2.5vw, 28px)" }}
              >
                &ldquo;Your portfolio needs TRL Stage Certificates and CDSCO
                clarity to apply for MAHA MedTech. ClearPath delivers both in
                5 minutes, free. Let me onboard 5–10 of your medtech startups
                as a pilot — feedback in exchange for early access.&rdquo;
              </p>
            </div>
          </section>

          <footer className="pt-4 border-t" style={{ borderColor: BORDER }}>
            <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
              Demo cards: <Link href="/demo/trl-cards" style={{ color: TEAL, textDecoration: "underline" }}>/demo/trl-cards</Link> ·
              Live product: <Link href="/" style={{ color: TEAL, textDecoration: "underline" }}>clearpath-medtech.vercel.app</Link> ·
              Source: SERB Annexure-II + MAHA MedTech FAQ Q35
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
