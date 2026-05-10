"use client";

import { useState } from "react";
import { REGULATION_REFERENCES, type RegulationKey } from "@/lib/cdsco/regulations-reference";
import { REGULATION_FAQ, type FAQEntry } from "@/lib/cdsco/regulation-faq";

/**
 * RegulationFilterTabs — interactive filter for the /regulations page.
 *
 * Renders a row of filter chips (one per regulation + "All") and the
 * filtered FAQ section. Defaults to "All" so the page works as a
 * scannable reference, but a partner researching a specific regulation
 * (say, DPDP) can tap and see just its 5 questions.
 *
 * Pure client-side state — no URL or server roundtrip — because this
 * is reference content, not a deep-linkable view. Wednesday cleanup
 * could promote to URL state if partners ask for shareable links.
 */
export function RegulationFilterTabs({
  orderedKeys,
}: {
  orderedKeys: RegulationKey[];
}) {
  const [active, setActive] = useState<RegulationKey | "all">("all");

  const visibleKeys =
    active === "all" ? orderedKeys : orderedKeys.filter((k) => k === active);

  return (
    <>
      {/* Filter chips — horizontal scroll on mobile */}
      <div className="mb-7 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setActive("all")}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              active === "all"
                ? "bg-[#0F6E56] text-white"
                : "bg-white text-[#6B766F] border border-[#D9D5C8] hover:border-[#0F6E56] hover:text-[#0F6E56]",
            ].join(" ")}
          >
            All 9 regulations
          </button>
          {orderedKeys.map((key) => {
            const reg = REGULATION_REFERENCES[key];
            const faqCount = REGULATION_FAQ[key]?.length ?? 0;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  active === key
                    ? "bg-[#0F6E56] text-white"
                    : "bg-white text-[#6B766F] border border-[#D9D5C8] hover:border-[#0F6E56] hover:text-[#0F6E56]",
                ].join(" ")}
                title={`${reg.display_name} — ${faqCount} question${faqCount === 1 ? "" : "s"}`}
              >
                {/* Short label — e.g. "CDSCO MDR" not "CDSCO Medical Devices Rules 2017" */}
                {shortLabel(key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered regulation list with FAQ */}
      <section className="space-y-8">
        {visibleKeys.map((key) => {
          const reg = REGULATION_REFERENCES[key];
          const faqs: FAQEntry[] = REGULATION_FAQ[key] ?? [];
          return (
            <article
              key={key}
              id={`reg-${key}`}
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
              <div className="flex items-center gap-3 text-xs mb-5">
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

              {faqs.length > 0 && (
                <div className="border-t border-[#E8E4D6] pt-4 space-y-5">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
                    Common questions ({faqs.length})
                  </p>
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      {faq.tag && (
                        <span className="inline-block font-mono text-[9px] tracking-[0.16em] uppercase text-[#0F6E56] bg-[#E8F2EE] rounded px-1.5 py-0.5 mr-2 mb-1">
                          {faq.tag}
                        </span>
                      )}
                      <p className="text-sm text-[#0E1411] font-medium mb-1.5">
                        {faq.q}
                      </p>
                      <p className="text-sm text-[#6B766F] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}

/** Short label for the filter chip — full names are too long for chips. */
function shortLabel(key: RegulationKey): string {
  switch (key) {
    case "cdsco_mdr":
      return "CDSCO MDR";
    case "cdsco_pharmacy":
      return "CDSCO Pharmacy";
    case "dpdp":
      return "DPDP";
    case "icmr":
      return "ICMR AI";
    case "abdm":
      return "ABDM";
    case "nabh":
      return "NABH";
    case "mci_telemed":
      return "Telemedicine";
    case "irdai":
      return "IRDAI";
    case "nabl":
      return "NABL";
  }
}
