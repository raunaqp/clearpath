"use client";
import { useSectionTracking } from "@/lib/analytics/useSectionTracking";

interface Regulation {
  name: string;
  body: string;
  borderColor: string;
}

const regulations: Regulation[] = [
  { name: "CDSCO MDR 2017", body: "Central Drugs Standard Control Organisation", borderColor: "#993C1D" },
  { name: "CDSCO Pharmacy", body: "Central Drugs Standard Control Organisation", borderColor: "#993C1D" },
  { name: "DPDP Act 2023", body: "Ministry of Electronics & IT", borderColor: "#0C447C" },
  { name: "ICMR AI Guidelines", body: "Indian Council of Medical Research", borderColor: "#993C1D" },
  { name: "ABDM Consent Framework", body: "Ayushman Bharat Digital Mission", borderColor: "#0F6E56" },
  { name: "NABH Digital Standards", body: "National Accreditation Board for Hospitals", borderColor: "#BA7517" },
  { name: "MCI Telemedicine", body: "Medical Council of India", borderColor: "#993C1D" },
  { name: "IRDAI Regulations", body: "Insurance Regulatory and Development Authority", borderColor: "#5B2B8E" },
  { name: "NABL Accreditation", body: "National Accreditation Board for Testing & Calibration", borderColor: "#BA7517" },
];

export default function ProblemSection() {
  const ref = useSectionTracking("regulatory_maze");

  return (
    <section ref={ref} className="py-20 md:py-28" id="problem">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <h2 className="font-serif font-normal text-[clamp(28px,3.6vw,52px)] leading-[1.08] tracking-[-0.02em] text-[#0E1411] mb-4">
          The regulatory maze — 9 regulations, 6 bodies
        </h2>
        <p className="text-[17px] italic text-[#6B766F] max-w-2xl leading-relaxed mb-12">
          Each with different forms, timelines, and classification logic.
          Founders chase sign-offs across ministries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {regulations.map((reg) => (
            <div
              key={reg.name}
              className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-card p-5"
              style={{ borderLeft: `3px solid ${reg.borderColor}` }}
            >
              <p className="font-medium text-[14px] text-[#0E1411] leading-snug mb-1">
                {reg.name}
              </p>
              <p className="text-[12px] text-[#6B766F] leading-snug">
                {reg.body}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#FAEEDA] border border-[#BA7517] rounded-card px-6 py-5">
          <p className="text-[15px] text-[#633806] leading-relaxed">
            No existing product maps all 9. No consultant covers all 6 bodies.
            Every founder reinvents the journey.
          </p>
        </div>
      </div>
    </section>
  );
}
