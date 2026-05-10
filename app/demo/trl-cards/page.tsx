/**
 * Demo route — three calibrated cards rendered side-by-side with the
 * new TRL block. Used for showing partners (Venture Center, IKP Eden,
 * founders) the depth of the readiness-card output.
 *
 * Not behind a paywall, not linked from the public site. Reach via:
 *   /demo/trl-cards
 *
 * The cards are static — no DB hit, no synthesizer call.
 */

import { ReadinessCard } from "@/components/card/ReadinessCard";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";

export const dynamic = "force-static";

const NOOP_ABDM = async (): Promise<void> => {};
const NOOP_DPDP = async (): Promise<void> => {};

const cerviai: ReadinessCardType = {
  meta: {
    company_name: "Vyuhaa Med Data",
    product_name: "CerviAI",
    scoped_feature: null,
    product_type: "product",
    generated_at: "2026-05-06T08:00:00.000Z",
    conflict_resolved:
      "One-liner described a data platform; URL described AI cervical cancer screening. Trusted the URL.",
  },
  classification: {
    medical_device_status: "is_medical_device",
    device_type: "AI cervical cancer screening from colposcopy images (IVD-SaMD)",
    imdrf_category: "III",
    cdsco_class: "C",
    class_qualifier: "IVD-SaMD",
    ai_ml_flag: true,
    acp_required: true,
    export_only: false,
    novel_or_predicate: "novel",
  },
  readiness: {
    score: 3,
    band: "amber",
    dimensions: {
      regulatory_clarity: 1,
      quality_system: 0,
      technical_docs: 1,
      clinical_evidence: 1,
      submission_maturity: 0,
    },
    note: "Foundations in place; quality system and submission engagement are the next gates.",
  },
  risk: {
    level: "high",
    rationale:
      "Diagnostic AI on a serious clinical state (cancer screening). Patient impact is direct.",
  },
  trl: {
    level: 3,
    stage: "early_poc",
    track: "investigational",
    completion_pct: 22,
    next_milestone:
      "Iterate to design freeze, identify device class, file MD-12 (TRL 4)",
    rationale:
      "Likely TRL 3 on the investigational (no-predicate) track — based on in-house prototype and pilot clinical data on colposcopy images. Anchored to SERB / ANRF MAHA MedTech Mission framework.",
  },
  timeline: {
    estimate_months_low: 12,
    estimate_months_high: 18,
    display: "12–18 mo",
    anchor: "Class C novel SaMD; pivotal CI required.",
  },
  regulations: {
    cdsco_mdr: {
      verdict: "required",
      rationale: "AI diagnostic SaMD on cancer screening; central pathway likely.",
      forms: ["MD-12", "MD-26"],
      pathway_note: "SaMD pathway evolving · forms TBD",
    },
    cdsco_pharmacy: { verdict: "not_applicable", rationale: "No pharmacy scope." },
    dpdp: {
      verdict: "required",
      rationale: "Sensitive health data (clinical images). DPDP applies in full.",
    },
    icmr: {
      verdict: "required",
      rationale: "AI in clinical use; EC-approved validation likely required.",
    },
    abdm: { verdict: "conditional", rationale: "Optional unless integrating with hospital ABDM stack." },
    nabh: { verdict: "conditional", rationale: "Hospital procurement increasingly NABH-gated." },
    mci_telemed: { verdict: "not_applicable", rationale: "Not a telemedicine product." },
    irdai: { verdict: "not_applicable", rationale: "No insurance integration." },
    nabl: {
      verdict: "conditional",
      rationale: "Validation lab partnership likely needs NABL accreditation.",
    },
  },
  top_gaps: [
    {
      dim: "quality_system",
      gap_title: "ISO 13485 QMS not in place",
      fix_action:
        "Engage a QMS consultant; aim for documented procedures within 8–12 weeks.",
      severity: "high",
    },
    {
      dim: "clinical_evidence",
      gap_title: "Pivotal clinical investigation not started",
      fix_action: "Submit MD-22 once test license cleared; identify 2–3 pivotal CI sites.",
      severity: "high",
    },
    {
      dim: "submission_maturity",
      gap_title: "MD-12 test license not filed",
      fix_action:
        "Compile test-license dossier (DHF, IFU, risk file); file MD-12 to unlock TRL 4.",
      severity: "medium",
    },
  ],
  verdict:
    "Likely Class C IVD-SaMD under CDSCO. Approval pathway is evolving for AI; calibrate to Oct 2025 SaMD draft.",
  why_regulated:
    "Diagnostic AI on cervical cancer screening drives a clinical decision (screen-positive triage). Information significance crosses the threshold under the CDSCO Oct 2025 SaMD draft.",
  post_2025_samd_gap: true,
  tier0_card_tagline: "Diagnostic SaMD — full pathway ahead",
  tier1_teaser: "Get a structured Draft Pack mapped to MD-12 + MD-26",
  tier2_teaser: "Concierge for QMS + clinical validation plan",
};

const ekascribe: ReadinessCardType = {
  meta: {
    company_name: "Eka Care",
    product_name: "EkaScribe",
    scoped_feature: "EkaScribe",
    product_type: "platform",
    generated_at: "2026-05-06T08:00:00.000Z",
    conflict_resolved: null,
  },
  classification: {
    medical_device_status: "is_medical_device",
    device_type: "AI clinical-decision-support scribe (scoped sub-feature of Eka Care platform)",
    imdrf_category: "II",
    cdsco_class: "B",
    class_qualifier: "AI-CDS",
    ai_ml_flag: true,
    acp_required: true,
    export_only: false,
    novel_or_predicate: "novel",
  },
  readiness: {
    score: 4,
    band: "amber",
    dimensions: {
      regulatory_clarity: 1,
      quality_system: 1,
      technical_docs: 1,
      clinical_evidence: 1,
      submission_maturity: 0,
    },
    note: "Eka has strong platform compliance; sub-feature regulation is the new front.",
  },
  risk: {
    level: "high",
    rationale:
      "AI in clinical workflow drafting prescriptions/notes; in-market post Oct 2025 SaMD draft.",
  },
  trl: {
    level: 3,
    stage: "early_poc",
    track: "investigational",
    completion_pct: 22,
    next_milestone:
      "Iterate to design freeze, identify device class, file MD-12 (TRL 4)",
    rationale:
      "Likely TRL 3 on the investigational track — sub-feature in market with pilot data, but no formal CDSCO submission yet against the Oct 2025 SaMD draft. Anchored to SERB / ANRF MAHA MedTech Mission framework.",
  },
  timeline: {
    estimate_months_low: 9,
    estimate_months_high: 14,
    display: "9–14 mo",
    anchor:
      "Class B AI-CDS scoped sub-feature; sub-feature pathway under evolving SaMD draft.",
  },
  regulations: {
    cdsco_mdr: {
      verdict: "required_sub_feature",
      rationale: "EkaScribe is the regulated sub-feature; the parent EHR is not.",
      forms: ["MD-12"],
      pathway_note: "SaMD pathway evolving · forms TBD",
    },
    cdsco_pharmacy: { verdict: "not_applicable", rationale: "Not a pharmacy product." },
    dpdp: {
      verdict: "required_SDF",
      rationale: "Above 10 lakh users; clinical voice data is sensitive.",
    },
    icmr: { verdict: "required", rationale: "AI in clinical use; EC validation expected." },
    abdm: {
      verdict: "core_compliance_achieved",
      rationale: "Eka Care holds M1/M2/M3 milestones.",
    },
    nabh: { verdict: "conditional", rationale: "Hospital deployments may invoke NABH." },
    mci_telemed: { verdict: "not_applicable", rationale: "Not a telemedicine product." },
    irdai: { verdict: "not_applicable", rationale: "No insurance integration." },
    nabl: { verdict: "not_applicable", rationale: "No lab accreditation in scope." },
  },
  top_gaps: [
    {
      dim: "submission_maturity",
      gap_title: "Sub-feature not yet engaged with CDSCO",
      fix_action:
        "Pre-submission consult with CDSCO on sub-feature SaMD scoping; target MD-12 in 90 days.",
      severity: "high",
    },
    {
      dim: "quality_system",
      gap_title: "IEC 62304 software lifecycle file incomplete",
      fix_action: "Tighten SDLC documentation against IEC 62304 to support MD-12 dossier.",
      severity: "medium",
    },
    {
      dim: "clinical_evidence",
      gap_title: "EC-approved validation study not registered",
      fix_action:
        "Register a prospective accuracy study in CTRI with an EC-approved protocol.",
      severity: "medium",
    },
  ],
  verdict:
    "EkaScribe is likely SaMD under CDSCO's Oct 2025 SaMD draft. Prescription drafting may influence treatment decisions — this is where the feature crosses into regulation.",
  why_regulated:
    "Scribe is in clinical decision-support territory: drafted notes and prescriptions inform clinician decisions. The Oct 2025 SaMD draft brings this into MDR scope.",
  post_2025_samd_gap: true,
  tier0_card_tagline: "Scoped sub-feature — Class B SaMD likely",
  tier1_teaser: "Sub-feature scoping + MD-12 dossier mapping",
  tier2_teaser: "Concierge for sub-feature pre-sub strategy",
};

const forus: ReadinessCardType = {
  meta: {
    company_name: "Forus Health",
    product_name: "3nethra Classic",
    scoped_feature: null,
    product_type: "hardware_software",
    generated_at: "2026-05-06T08:00:00.000Z",
    conflict_resolved: null,
  },
  classification: {
    medical_device_status: "is_medical_device",
    device_type: "Portable retinal screening camera (Class D ophthalmic device)",
    imdrf_category: "IV",
    cdsco_class: "D",
    class_qualifier: null,
    ai_ml_flag: false,
    acp_required: false,
    export_only: false,
    novel_or_predicate: "has_predicate",
  },
  readiness: {
    score: 8,
    band: "green_plus",
    dimensions: {
      regulatory_clarity: 2,
      quality_system: 2,
      technical_docs: 2,
      clinical_evidence: 2,
      submission_maturity: 2,
    },
    note: "Established CDSCO posture; renewals and PMS are the active workstream.",
  },
  risk: {
    level: "high",
    rationale: "Class D ophthalmic device; established CDSCO posture.",
  },
  trl: {
    level: 8,
    stage: "pre_commercialisation",
    track: "has_predicate",
    completion_pct: 92,
    next_milestone:
      "Launch with PMS system and user feedback loop (TRL 9)",
    rationale:
      "Likely TRL 8 on the predicate-equivalence track — based on active CDSCO filing, published clinical validation, ISO 13485 line in place, and DHF/V&V protocols. Anchored to SERB / ANRF MAHA MedTech Mission framework.",
  },
  timeline: {
    estimate_months_low: 3,
    estimate_months_high: 6,
    display: "3–6 mo",
    anchor: "Renewal and post-market surveillance cycle.",
  },
  regulations: {
    cdsco_mdr: {
      verdict: "core_compliance_achieved",
      rationale: "Manufacturing license history; on a known pathway.",
      forms: ["MD-9"],
      pathway_note: "Renewal + post-market surveillance.",
    },
    cdsco_pharmacy: { verdict: "not_applicable", rationale: "Not a pharmacy product." },
    dpdp: { verdict: "conditional", rationale: "Patient image data — DPDP applies if cloud-stored." },
    icmr: { verdict: "optional", rationale: "Established device; new clinical claims would re-trigger." },
    abdm: { verdict: "optional", rationale: "Optional integration for retinal report sharing." },
    nabh: {
      verdict: "required_for_procurement",
      rationale: "Hospital procurement increasingly NABH-gated.",
    },
    mci_telemed: { verdict: "not_applicable", rationale: "Hardware device, not telemedicine." },
    irdai: { verdict: "not_applicable", rationale: "No insurance integration." },
    nabl: { verdict: "conditional", rationale: "Calibration labs may need NABL." },
  },
  top_gaps: [
    {
      dim: "submission_maturity",
      gap_title: "PMS system not fully digital",
      fix_action: "Digitise post-market surveillance + user feedback loop to close TRL 8 → 9.",
      severity: "medium",
    },
    {
      dim: "regulatory_clarity",
      gap_title: "NABH procurement readiness not documented",
      fix_action:
        "Compile NABH procurement-ready dossier for hospital tenders.",
      severity: "low",
    },
  ],
  verdict:
    "Established Class D device on the predicate track. Already at TRL 8 — pre-commercialisation gate is fully cleared. Focus is on PMS digitisation and procurement-readiness.",
  why_regulated:
    "Direct patient-contact ophthalmic imaging device. Class D under CDSCO MDR 2017; manufacturing license in place.",
  post_2025_samd_gap: false,
  tier0_card_tagline: "Pre-commercialisation — PMS the next gate",
  tier1_teaser: "PMS dossier template + NABH procurement readiness",
  tier2_teaser: "Concierge for export pathways + global expansion",
};

function CardWrapper({
  card,
  caption,
}: {
  card: ReadinessCardType;
  caption: string;
}) {
  const isWellness =
    card.classification.medical_device_status === "wellness_carve_out";
  return (
    <div className="space-y-3">
      <div className="bg-[#FAF8F2] border border-[#D9D5C8] rounded-lg px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F6E56] mb-1">
          Demo case
        </p>
        <p className="text-sm text-[#0E1411] leading-snug">{caption}</p>
      </div>
      <ReadinessCard
        card={card}
        assessmentId={`demo-${card.meta.product_name.toLowerCase()}`}
        shareUrl={`https://clearpath.in/demo/trl-cards`}
        shareToken={`demo-${card.meta.product_name.toLowerCase()}`}
        abdmAlreadyCaptured={true}
        dpdpAlreadyCaptured={true}
        onAbdmSubmit={NOOP_ABDM}
        onDpdpSubmit={NOOP_DPDP}
        showAbdmBlock={false}
        showDpdpBlock={false}
        isWellness={isWellness}
        hideDownload={true}
      />
    </div>
  );
}

export default function DemoTRLCardsPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
              Internal demo · TRL + Completion · 6 May 2026
            </p>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] leading-tight text-[#0E1411]">
              Three real Indian medtech products. Three TRL stages.
            </h1>
            <p className="text-base text-[#6B766F] max-w-2xl leading-relaxed">
              Each card adds Technology Readiness Level (TRL) anchored to the
              SERB / ANRF MAHA MedTech Mission framework — the same vocabulary
              BIRAC, MAHA MedTech evaluators, and IKP Eden use for funding
              decisions. TRL is a sibling metric to readiness, not a composite:
              three numbers stay independent.
            </p>
          </header>

          <CardWrapper
            card={cerviai}
            caption="Vyuhaa CerviAI — pre-MD-12, novel AI cervical cancer screening. Investigational track. Long road to commercialisation."
          />
          <CardWrapper
            card={ekascribe}
            caption="EkaScribe (sub-feature of Eka Care) — scoped sub-feature pulled in by the Oct 2025 SaMD draft. Investigational track because no clear AI-CDS predicate exists."
          />
          <CardWrapper
            card={forus}
            caption="Forus Health 3nethra — Class D ophthalmic device with established CDSCO history. Predicate track. Already at TRL 8 / pre-commercialisation."
          />

          <footer className="pt-8 border-t border-[#D9D5C8]">
            <p className="text-xs text-[#6B766F] leading-relaxed">
              These cards are static for demo. The TRL fallback derivation is
              also wired into the live engine at /c/[share_token], so existing
              customer cards now show TRL too without re-running synthesis.
              Source: SERB / ANRF Annexure-II, MAHA MedTech Mission FAQ Q35.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
