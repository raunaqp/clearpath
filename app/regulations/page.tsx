import Link from "next/link";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import type { RegulationKey } from "@/lib/cdsco/regulations-reference";
import { RegulationFilterTabs } from "@/components/regulations/RegulationFilterTabs";

export const metadata = {
  title: "Indian Healthtech Regulations — ClearPath",
  description:
    "The 9 regulatory frameworks every Indian digital health product touches: CDSCO, DPDP, ICMR, ABDM, NABH, MCI Telemedicine, IRDAI, NABL.",
};

/**
 * /regulations — single-page reference for the 9 regulations evaluated by
 * the ClearPath Risk Card. Linked from the card itself ("More about
 * these regulations + FAQ →"). Opens in a new tab from the card so
 * partners don't lose card context.
 *
 * Layout: filter chips at top (All / per-regulation), filtered list below
 * with display_name + authority + submission_process pulled from
 * lib/cdsco/regulations-reference.ts (single source of truth so this page
 * is auto-correct), plus FAQ entries from lib/cdsco/regulation-faq.ts.
 *
 * FAQ content is sourced from the published guidance of each authority
 * (CDSCO, DPDP, ICMR, ABDM, NABH, NMC, IRDAI, NABL), paraphrased throughout
 * with conservative framing ('typically', 'in most cases'). Each entry is
 * tagged 'why' / 'what' / 'how' / 'scope' for the optional filter UI.
 */
export default function RegulationsPage() {
  const orderedKeys: RegulationKey[] = [
    "cdsco_mdr",
    "cdsco_pharmacy",
    "dpdp",
    "icmr",
    "abdm",
    "nabh",
    "mci_telemed",
    "irdai",
    "nabl",
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
              Reference · 9 regulations · 35+ FAQ
            </p>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] leading-tight text-[#0E1411] mb-4">
              The Indian healthtech regulatory landscape
            </h1>
            <p className="text-base text-[#6B766F] leading-relaxed max-w-2xl">
              Every Indian digital health product touches some subset of these
              nine frameworks. ClearPath checks all nine in your Readiness
              Card. This page is a quick reference for what each one is, who
              runs it, how submissions work, and the questions founders ask
              us most.
            </p>
          </header>

          <RegulationFilterTabs orderedKeys={orderedKeys} />

          {/* CTA back to /start */}
          <section className="mt-12 pt-10 border-t border-[#D9D5C8] text-center">
            <h2 className="font-serif text-2xl text-[#0E1411] mb-3">
              Want a product-specific answer?
            </h2>
            <p className="text-sm text-[#6B766F] leading-relaxed max-w-xl mx-auto mb-5">
              Run your own Risk Card. Type a one-liner about your product, answer 7
              questions, get a calibrated regulatory readiness assessment.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
            >
              Start your Risk Card — free →
            </Link>
          </section>

          <footer className="mt-12 pt-6 border-t border-[#D9D5C8]">
            <p className="text-xs text-[#6B766F] font-mono leading-relaxed">
              ClearPath — not legal advice. Sources verified May 2026 against:
              CDSCO Medical Devices Rules 2017 + draft SaMD Guidance (Oct
              2025), DPDP Act 2023 + DPDP Rules 2025 (notified Nov 13 2025),
              ICMR Ethical Guidelines for AI in Healthcare 2023, ABDM
              Sandbox &amp; Integration documentation, NABH Digital Health
              Standards 2nd Edition (2025), NMC Telemedicine Practice
              Guidelines 2020, IRDAI TPA Regulations 2016 + Web Aggregator
              Regulations 2017, NABL ISO 15189:2022 + NABL 100B Procedure.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
