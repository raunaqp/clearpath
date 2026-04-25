"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

const regulationPills = [
  { label: "CDSCO MDR", verdict: "likely required" },
  { label: "CDSCO Pharmacy", verdict: "N/A" },
  { label: "DPDP Act", verdict: "likely required" },
  { label: "ICMR AI", verdict: "required" },
  { label: "ABDM", verdict: "conditional" },
  { label: "NABH", verdict: "conditional" },
  { label: "MCI Telemed", verdict: "N/A" },
  { label: "IRDAI", verdict: "N/A" },
  { label: "NABL", verdict: "conditional" },
];

function pillStyle(verdict: string) {
  if (verdict === "required" || verdict === "likely required") {
    return "bg-[#E1F5EE] text-[#0F6E56]";
  }
  if (verdict === "conditional") {
    return "bg-[#FAEEDA] text-[#633806]";
  }
  return "bg-[#EFECE3] text-[#6B766F]";
}

const gaps = [
  { severity: "HIGH", text: "ISO 13485 Quality Management System not in place" },
  { severity: "HIGH", text: "Clinical validation study not started" },
  { severity: "MED", text: "CDSCO MD-12 test license not filed" },
];

function gapStyle(severity: string) {
  if (severity === "HIGH") return "bg-[#FAECE7] text-[#993C1D]";
  return "bg-[#FAEEDA] text-[#BA7517]";
}

export default function ReportPreviewSection() {
  const ref = useSectionTracking("sample_card");

  return (
    <section
      id="report-preview"
      ref={ref}
      className="py-20 px-6 md:px-8 bg-[#F7F6F2] border-b border-[#E8E4D6]"
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-4">
            Sample Output
          </p>
          <h2 className="font-serif font-normal text-3xl sm:text-4xl tracking-tight text-[#0E1411]">
            What a Readiness Card looks like
          </h2>
          <p className="mt-3 text-[#6B766F] text-base md:text-lg max-w-xl mx-auto">
            Screenshot-worthy, under 10 seconds to understand. Example: EkaScribe (of Eka Care).
          </p>
        </div>

        {/* Mock card — High risk: coral-light tint + coral border */}
        <div className="max-w-2xl mx-auto bg-[#FAECE7] border border-[#993C1D] rounded-xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="px-7 pt-6 pb-4 border-b border-[#f0c4b6]">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#993C1D] mb-1">
              Regulatory Risk Profile
            </p>
            <h3 className="font-serif text-[24px] text-[#0E1411] leading-tight">
              EkaScribe <span className="text-[#6B766F] text-lg font-normal">of Eka Care</span>
            </h3>
            <p className="text-sm text-[#6B766F] mt-0.5">
              AI-assisted clinical documentation + prescription drafting
            </p>
          </div>

          {/* Score + badges row */}
          <div className="px-7 py-5 flex items-center gap-6 border-b border-[#f0c4b6]">
            {/* Readiness circle — score 4 → amber */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "conic-gradient(#BA7517 0% 40%, #E8E4D6 40% 100%)",
                }}
              >
                <div className="w-[72px] h-[72px] rounded-full bg-[#FAECE7] flex flex-col items-center justify-center">
                  <span className="font-serif text-[32px] leading-none text-[#BA7517] font-normal">4</span>
                  <span className="font-mono text-[9px] text-[#6B766F] tracking-wide">/10</span>
                </div>
              </div>
              <p className="font-mono text-[9px] text-[#6B766F] tracking-wide uppercase mt-1.5">
                Readiness
              </p>
            </div>

            {/* 2×2 badge grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div className="bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-3 py-2">
                <p className="font-mono text-[9px] text-[#6B766F] uppercase tracking-wide">Risk</p>
                <p className="font-semibold text-[#993C1D] text-sm mt-0.5">High</p>
              </div>
              <div className="bg-white/60 border border-[#f0c4b6] rounded-lg px-3 py-2">
                <p className="font-mono text-[9px] text-[#6B766F] uppercase tracking-wide">MD?</p>
                <p className="font-semibold text-[#0E1411] text-sm mt-0.5">Feature</p>
              </div>
              <div className="bg-white/60 border border-[#f0c4b6] rounded-lg px-3 py-2">
                <p className="font-mono text-[9px] text-[#6B766F] uppercase tracking-wide">Class</p>
                <p className="font-semibold text-[#0E1411] text-sm mt-0.5">Likely B/C</p>
              </div>
              <div className="bg-white/60 border border-[#f0c4b6] rounded-lg px-3 py-2">
                <p className="font-mono text-[9px] text-[#6B766F] uppercase tracking-wide">Timeline</p>
                <p className="font-semibold text-[#0E1411] text-sm mt-0.5">9–14 mo</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-5 space-y-4 bg-white/40">
            <div>
              <p className="text-xs font-semibold text-[#0E1411] uppercase tracking-wide mb-1">Verdict</p>
              <p className="text-sm text-[#2A3430] leading-relaxed">
                Likely SaMD under CDSCO&apos;s evolving 2025 draft. Prescription drafting may
                influence treatment decisions — this is where the feature crosses into regulation.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#0E1411] uppercase tracking-wide mb-2">Fix first · Top 3 gaps</p>
              <ul className="space-y-1.5">
                {gaps.map((gap) => (
                  <li key={gap.text} className="flex items-start gap-2">
                    <span
                      className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${gapStyle(
                        gap.severity
                      )}`}
                    >
                      {gap.severity}
                    </span>
                    <span className="text-sm text-[#0E1411]">{gap.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#0E1411] uppercase tracking-wide mb-2">Regulation snapshot</p>
              <div className="flex flex-wrap gap-1.5">
                {regulationPills.map((pill) => (
                  <span
                    key={pill.label}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${pillStyle(
                      pill.verdict
                    )}`}
                  >
                    {pill.label} · {pill.verdict}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#6B766F] text-sm mb-3">
            Want to see your product&apos;s card?
          </p>
          <Link
            href="/start"
            onClick={() => {
              try { posthog.capture("cta_clicked", { cta_location: "card_bottom", cta_text: "Get your free Readiness Card →", destination: "/start" }); } catch {}
            }}
            className="inline-block bg-[#0F6E56] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
          >
            Get your free Readiness Card →
          </Link>
        </div>
      </div>
    </section>
  );
}
