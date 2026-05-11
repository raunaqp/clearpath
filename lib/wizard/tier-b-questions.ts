/**
 * Tier B wizard questions (Sprint 2 Story 2.5 Phase 3).
 *
 * Gated to paying Tier 2 customers — collects CDSCO manufacturing-license-
 * specific data that the upgraded Draft Pack needs but the free 7-Q Tier A
 * wizard doesn't capture.
 *
 * Single source of truth for: copy, options, ordering, conditional triggers.
 * Mirrors lib/wizard/questions.ts (Tier A) shape so the same client patterns
 * apply.
 *
 * Decisions per docs/decisions/2026-05-12-wizard-architecture-audit.md
 * Section D.
 */

export type TierBOption = {
  value: string;
  label: string;
  description?: string;
};

export type TierBField =
  | "b1_intended_use_statement"
  | "b2_use_environment"
  | "b3_predicate_devices"
  | "b4_risks_and_mitigations"
  | "b5_clinical_evidence_status"
  | "b6_iso_13485_status"
  | "c1_software_lifecycle_model"
  | "c2_cybersecurity_posture";

export type TierBQuestion = {
  field: TierBField;
  prompt: string;
  helper?: string;
  /** "core" appears for everyone; "conditional" requires a trigger to show. */
  tier: "core" | "conditional";
  /** UI hint — drives which input component renders client-side. */
  kind:
    | "textarea"
    | "radio"
    | "predicate_picker"
    | "risk_mitigation_pairs"
    | "cybersecurity";
  required: boolean;
  options?: TierBOption[];
};

export const TIER_B_QUESTIONS: TierBQuestion[] = [
  {
    field: "b1_intended_use_statement",
    prompt: "Write 2–4 sentences describing the device's intended use.",
    helper:
      "Be specific about who uses it, on whom, in what setting, and for what clinical purpose. CDSCO Section 3 (Intended Use & Indications) is written from this.",
    tier: "core",
    kind: "textarea",
    required: true,
  },
  {
    field: "b2_use_environment",
    prompt: "Where will the device be used?",
    helper: "Drives Section 3 (Indications) and Section 7 (Labelling).",
    tier: "core",
    kind: "radio",
    required: true,
    options: [
      { value: "home", label: "Patient's home" },
      { value: "opd", label: "Outpatient clinic / OPD" },
      { value: "inpatient", label: "Hospital inpatient ward" },
      { value: "surgical", label: "Operating theatre" },
      { value: "pre_hospital", label: "Ambulance / pre-hospital / emergency" },
      { value: "mixed", label: "Mixed — multiple settings" },
    ],
  },
  {
    field: "b3_predicate_devices",
    prompt: "Name up to 3 predicate devices similar to yours.",
    helper:
      "Devices already approved (CDSCO, US FDA 510(k), or CE-marked) that your device compares to. Drives Section 6 (Predicate Device Comparison).",
    tier: "core",
    kind: "predicate_picker",
    // Required to be non-empty for the Tier B gate, but each row's
    // manufacturer + rationale stay optional. Validation at submit.
    required: true,
  },
  {
    field: "b4_risks_and_mitigations",
    prompt: "Top 3 known risks and what mitigates them.",
    helper:
      "Drives Section 10 (Risk Management, ISO 14971). Prefilled from your Risk Card's top gaps — edit each as needed.",
    tier: "core",
    kind: "risk_mitigation_pairs",
    required: true,
  },
  {
    field: "b5_clinical_evidence_status",
    prompt: "What clinical evidence do you have today?",
    helper:
      "Drives Section 12 (Clinical Evidence & Post-Market Surveillance). Honest answer here saves rework later.",
    tier: "core",
    kind: "radio",
    required: true,
    options: [
      { value: "none", label: "None yet" },
      {
        value: "pilot_data",
        label: "Pilot data or retrospective analysis",
        description: "Internal data, single-site early use, retrospective chart review",
      },
      {
        value: "published_study",
        label: "Published study or peer-reviewed paper",
        description: "Validation study published or CTRI-registered",
      },
      {
        value: "multi_center_trial",
        label: "Multi-centre prospective trial",
        description: "EC-approved prospective study, multiple sites",
      },
    ],
  },
  {
    field: "b6_iso_13485_status",
    prompt: "Where are you with ISO 13485 (QMS) certification?",
    helper:
      "Drives Section 8 (Design & Manufacturing) and the Quality System section of the Draft Pack.",
    tier: "core",
    kind: "radio",
    required: true,
    options: [
      {
        value: "certified",
        label: "Certified",
        description: "Active certificate from a recognised CB",
      },
      {
        value: "in_progress",
        label: "In progress",
        description: "Engaged with a CB, audit scheduled or under way",
      },
      { value: "not_started", label: "Not started yet" },
      {
        value: "not_applicable",
        label: "Not applicable",
        description: "e.g., software-only with no manufacturing footprint",
      },
    ],
  },
  {
    field: "c1_software_lifecycle_model",
    prompt: "Which software lifecycle model do you follow?",
    helper:
      "Drives IEC 62304 conformance in Section 9. Only asked because your device involves software / AI/ML.",
    tier: "conditional",
    kind: "radio",
    required: true,
    options: [
      { value: "waterfall", label: "Waterfall / phased" },
      { value: "agile", label: "Agile / iterative" },
      { value: "hybrid", label: "Hybrid (e.g., scaled-agile with phase gates)" },
      { value: "not_applicable", label: "Not applicable" },
    ],
  },
  {
    field: "c2_cybersecurity_posture",
    prompt: "Cybersecurity posture (encryption + authentication).",
    helper:
      "Only asked because your product handles personal health data. Drives Section 9 (Essential Principles Conformity) cybersecurity sub-section.",
    tier: "conditional",
    kind: "cybersecurity",
    required: true,
  },
];

/** Returns the question for a given field, or null if unknown. */
export function getTierBQuestion(field: TierBField): TierBQuestion | null {
  return TIER_B_QUESTIONS.find((q) => q.field === field) ?? null;
}

/** Returns just the core questions (B1–B6). */
export function getCoreTierBQuestions(): TierBQuestion[] {
  return TIER_B_QUESTIONS.filter((q) => q.tier === "core");
}

/** Returns just the conditional questions (C1, C2). */
export function getConditionalTierBQuestions(): TierBQuestion[] {
  return TIER_B_QUESTIONS.filter((q) => q.tier === "conditional");
}
