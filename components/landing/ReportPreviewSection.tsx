"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import posthog from "posthog-js";

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
  // N/A
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
  const ref = useRef<HTMLElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          try {
            posthog.capture("section_viewed", { section: "report_preview" });
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
      id="report-preview"
      ref={ref}
      className="py-20 px-6 md:px-8 bg-[#F7F6F2]"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl text-[#0E1411] tracking-tight">
            What a Readiness Card looks like
          </h2>
          <p className="mt-2 text-[#6B766F] text-base md:text-lg max-w-xl mx-auto">
            Screenshot-worthy, under 10 seconds to understand. Example: EkaScribe
            (of Eka Care).
          </p>
        </div>

        {/* Mock card */}
        <div className="max-w-2xl mx-auto bg-white border border-[#D9D5C8] rounded-xl p-7 shadow-sm">
          {/* Eyebrow */}
          <p className="font-mono text-xs tracking-widest uppercase text-[#6B766F]">
            Regulatory Risk Profile
          </p>

          {/* Product name */}
          <h3 className="font-serif text-[26px] font-bold text-[#0E1411] mt-1 leading-tight">
            EkaScribe (of Eka Care)
          </h3>

          {/* Description */}
          <p className="text-sm text-[#6B766F] mt-1">
            AI-assisted clinical documentation + prescription drafting
          </p>

          {/* Badge row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Readiness */}
            <span className="inline-flex items-center gap-1.5 bg-[#FAEEDA] text-[#BA7517] text-xs font-mono font-semibold px-3 py-1 rounded-full">
              <span className="w-5 h-5 rounded-full bg-[#BA7517] text-white flex items-center justify-center text-[10px] font-bold leading-none">
                4
              </span>
              Readiness: 4/10
            </span>
            {/* Risk */}
            <span className="bg-[#FAECE7] text-[#993C1D] text-xs font-mono font-semibold px-3 py-1 rounded-full">
              Risk: High
            </span>
            {/* MD? */}
            <span className="bg-[#EFECE3] text-[#0E1411] text-xs font-mono font-semibold px-3 py-1 rounded-full">
              MD?: Feature
            </span>
            {/* Class */}
            <span className="bg-[#EFECE3] text-[#0E1411] text-xs font-mono font-semibold px-3 py-1 rounded-full">
              Class: B/C (AI-CDS, scoped)
            </span>
            {/* Timeline */}
            <span className="bg-[#EFECE3] text-[#0E1411] text-xs font-mono font-semibold px-3 py-1 rounded-full">
              9–14 months
            </span>
          </div>

          <div className="mt-5 border-t border-[#E8E4D6] pt-4">
            <p className="text-sm font-bold text-[#0E1411]">Verdict</p>
            <p className="mt-1 text-sm text-[#2A3430] leading-relaxed">
              Likely SaMD under CDSCO&apos;s evolving 2025 draft. Prescription drafting
              may influence treatment decisions — this is where the feature crosses
              into regulation.
            </p>
          </div>

          <div className="mt-4 border-t border-[#E8E4D6] pt-4">
            <p className="text-sm font-bold text-[#0E1411]">
              Why this may be regulated
            </p>
            <p className="mt-1 text-sm text-[#2A3430] leading-relaxed">
              Prescription drafting auto-generated by AI qualifies as clinical
              decision-influence. CDSCO&apos;s Oct 2025 SaMD draft classifies such tools
              as Class B/C.
            </p>
          </div>

          <div className="mt-4 border-t border-[#E8E4D6] pt-4">
            <p className="text-sm font-bold text-[#0E1411]">
              Fix first · Top 3 gaps
            </p>
            <ul className="mt-2 space-y-2">
              {gaps.map((gap) => (
                <li key={gap.text} className="flex items-start gap-2">
                  <span
                    className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${gapStyle(
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

          <div className="mt-4 border-t border-[#E8E4D6] pt-4">
            <p className="text-sm font-bold text-[#0E1411] mb-2">
              Regulation snapshot
            </p>
            <div className="flex flex-wrap gap-2">
              {regulationPills.map((pill) => (
                <span
                  key={pill.label}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full ${pillStyle(
                    pill.verdict
                  )}`}
                >
                  {pill.label} · {pill.verdict}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA below card */}
        <div className="mt-8 text-center">
          <p className="text-[#6B766F] text-sm mb-2">
            Want to see your product&apos;s card?
          </p>
          <Link
            href="/start"
            className="inline-block bg-[#0F6E56] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
          >
            Get your free Readiness Card →
          </Link>
        </div>
      </div>
    </section>
  );
}
