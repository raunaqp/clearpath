import Link from "next/link";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { REGULATION_REFERENCES } from "@/lib/cdsco/regulations-reference";
import type { RegulationKey } from "@/lib/cdsco/regulations-reference";

export const metadata = {
  title: "Indian Healthtech Regulations — ClearPath",
  description:
    "The 9 regulatory frameworks every Indian digital health product touches: CDSCO, DPDP, ICMR, ABDM, NABH, MCI Telemedicine, IRDAI, NABL.",
};

/**
 * /regulations — single-page reference for the 9 regulations evaluated by
 * the ClearPath Risk Card. Linked from the card itself ("More about
 * these regulations →").
 *
 * Tonight: stub layout pulling display_name + authority + submission_process
 * from lib/cdsco/regulations-reference.ts. Same source-of-truth the
 * synthesizer prompt + RegulationSnapshot use, so this page is auto-correct.
 *
 * Wednesday: replace placeholder FAQ with real Q&A copy. The page route
 * stays unchanged.
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
          <header className="mb-10">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
              Reference · 9 regulations
            </p>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] leading-tight text-[#0E1411] mb-4">
              The Indian healthtech regulatory landscape
            </h1>
            <p className="text-base text-[#6B766F] leading-relaxed max-w-2xl">
              Every Indian digital health product touches some subset of these
              nine frameworks. ClearPath checks all nine in your Readiness
              Card. This page is a quick reference for what each one is, who
              runs it, and how submissions work.
            </p>
          </header>

          {/* The 9 regulations */}
          <section className="space-y-6">
            {orderedKeys.map((key) => {
              const reg = REGULATION_REFERENCES[key];
              return (
                <article
                  key={key}
                  className="rounded-lg border border-[#D9D5C8] bg-white px-5 py-5"
                >
                  <h2 className="font-serif text-xl text-[#0E1411] mb-1">
                    {reg.display_name}
                  </h2>
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-3">
                    {reg.authority}
                  </p>
                  <p className="text-sm text-[#0E1411] leading-relaxed mb-3">
                    {reg.submission_process}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={reg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0F6E56] hover:text-[#0d5c48] underline underline-offset-2"
                    >
                      Official site →
                    </a>
                    {reg.associated_forms.length > 0 && (
                      <span className="text-[#6B766F]">
                        Forms:{" "}
                        <span className="font-mono">
                          {reg.associated_forms.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {/* FAQ placeholder */}
          <section className="mt-12 pt-10 border-t border-[#D9D5C8]">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
              Frequently asked questions
            </p>
            <h2 className="font-serif text-2xl text-[#0E1411] mb-4">
              Common questions
            </h2>
            <div className="rounded-lg border border-dashed border-[#D9D5C8] bg-[#FAF8F2] px-5 py-6">
              <p className="text-sm text-[#6B766F] leading-relaxed">
                We&apos;re writing answers to the questions founders ask us
                most: when does CDSCO actually apply, when is something a
                medical device, what triggers DPDP and ABDM, how do
                consent rules differ for clinical investigations, when do you
                need ICMR-EC approval, and so on.
              </p>
              <p className="text-sm text-[#6B766F] leading-relaxed mt-3">
                In the meantime, the fastest way to get a product-specific
                answer is to run your own Readiness Card —{" "}
                <Link
                  href="/start"
                  className="text-[#0F6E56] hover:text-[#0d5c48] underline underline-offset-2"
                >
                  it&apos;s free, takes about 5 minutes
                </Link>
                .
              </p>
            </div>
          </section>

          <footer className="mt-12 pt-6 border-t border-[#D9D5C8]">
            <p className="text-xs text-[#6B766F] font-mono leading-relaxed">
              ClearPath — not legal advice. Sources: CDSCO Medical Devices
              Rules 2017, DPDP Act 2023, ICMR Ethical Guidelines for
              Application of AI in Biomedical Research and Healthcare 2023,
              ABDM Onboarding documentation, NABH Digital Health Standards,
              NMC Telemedicine Practice Guidelines 2020, IRDAI regulations,
              NABL accreditation criteria.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
