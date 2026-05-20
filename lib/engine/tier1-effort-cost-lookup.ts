/**
 * Phase 1.6 — Tier 1 Regulatory Readiness Report static lookup:
 * effort + cost ranges per common gap pattern.
 *
 * Purpose: drives the `estimated_effort` column in Section 3
 * (Readiness Gap Analysis) of the ₹499 report. Also feeds the
 * cost_range_inr per phase in Section 4 (Timeline + Cost).
 *
 * MOAT CONTENT — these numbers are reviewable seed values, NOT
 * authoritative truth. They are calibrated against the CDSCO
 * forms-reference bible and realistic Indian medtech startup
 * context (consultant rates ₹1.5–3L/mo, EC fees ₹50k–2L per site,
 * clinical study costs ₹5–15L per centre, ISO 13485 cert path
 * ₹2.5–4L over 6–9 months).
 *
 * REVIEW STATUS: every entry is `estimate` until the founder or a
 * CDSCO consultant signs off → mark `reviewed`. See the human-
 * readable twin at `docs/seed-tables/tier1-effort-cost-lookup.md`.
 *
 * Lookup strategy:
 *   1. Match `gap_title` against `patterns` regex set (most specific)
 *   2. Fall back to match by readiness `dim`
 *   3. Final fallback: GENERIC_FALLBACK band
 */

export type ReviewStatus = "estimate" | "reviewed";

export interface EffortCostEntry {
  key: string;
  display_name: string;
  patterns: RegExp[];
  dim_fallback: string[];
  effort_months: { low: number; high: number };
  cost_inr_lakhs: { low: number; high: number };
  why_it_matters_seed: string;
  review_status: ReviewStatus;
}

export const GENERIC_FALLBACK: EffortCostEntry = {
  key: "generic_fallback",
  display_name: "General compliance gap",
  patterns: [],
  dim_fallback: [],
  effort_months: { low: 2, high: 4 },
  cost_inr_lakhs: { low: 1, high: 3 },
  why_it_matters_seed:
    "Reviewers will likely flag this as a documentation gap during the submission review and may request remediation before clearance.",
  review_status: "estimate",
};

export const EFFORT_COST_LIBRARY: EffortCostEntry[] = [
  {
    key: "iso_13485_qms",
    display_name: "ISO 13485 QMS",
    patterns: [/iso\s*13485/i, /\bqms\b/i, /quality\s+management\s+system/i],
    dim_fallback: ["quality_system"],
    effort_months: { low: 6, high: 9 },
    cost_inr_lakhs: { low: 3, high: 5 },
    why_it_matters_seed:
      "Reviewers will likely expect ISO 13485-aligned QMS evidence (procedures, records, CAPA, internal audit) before they accept a Class B/C/D submission. Without it, your submission is typically held until you can demonstrate a documented quality system.",
    review_status: "estimate",
  },
  {
    key: "iec_62304_sdlc",
    display_name: "IEC 62304 software lifecycle",
    patterns: [/iec\s*62304/i, /software\s+lifecycle/i, /sdlc/i],
    dim_fallback: ["technical_docs"],
    effort_months: { low: 4, high: 6 },
    cost_inr_lakhs: { low: 2, high: 4 },
    why_it_matters_seed:
      "Reviewers will likely look for software lifecycle evidence (planning, requirements, architecture, V&V, release) per IEC 62304 — its absence typically lengthens the review cycle.",
    review_status: "estimate",
  },
  {
    key: "clinical_validation",
    display_name: "Clinical validation evidence",
    patterns: [
      /clinical\s+validation/i,
      /clinical\s+evidence/i,
      /pivotal/i,
      /multi[-\s]?cent(er|re)/i,
      /ethics\s+committee/i,
      /ec\s+approval/i,
      /ctri/i,
    ],
    dim_fallback: ["clinical_evidence"],
    effort_months: { low: 9, high: 14 },
    cost_inr_lakhs: { low: 8, high: 18 },
    why_it_matters_seed:
      "For Class C/D and novel indications, reviewers will likely require Indian-population clinical evidence — a multi-centre study with EC approval and CTRI registration. This is typically the longest item on the critical path.",
    review_status: "estimate",
  },
  {
    key: "risk_management_iso_14971",
    display_name: "Risk Management File (ISO 14971)",
    patterns: [/iso\s*14971/i, /risk\s+management/i, /\brmf\b/i],
    dim_fallback: ["technical_docs"],
    effort_months: { low: 2, high: 3 },
    cost_inr_lakhs: { low: 1, high: 2 },
    why_it_matters_seed:
      "Reviewers will likely expect a documented ISO 14971 risk file (hazards, mitigations, residual risk) before clearing the submission. The work itself is bounded but it gates other documentation.",
    review_status: "estimate",
  },
  {
    key: "dpdp_compliance",
    display_name: "DPDP compliance workflow",
    patterns: [/dpdp/i, /privacy\s+notice/i, /\bconsent\b/i, /breach\s+response/i],
    dim_fallback: ["dpdp", "regulatory_clarity"],
    effort_months: { low: 2, high: 4 },
    cost_inr_lakhs: { low: 2, high: 4 },
    why_it_matters_seed:
      "MRI / health data falls under DPDP's sensitive-personal-data tier. Reviewers and procurement teams will likely ask for a privacy notice, consent flow, grievance officer, and breach SOP before allowing deployment.",
    review_status: "estimate",
  },
  {
    key: "cybersecurity_iec_81001",
    display_name: "Cybersecurity (IEC 81001-5-1)",
    patterns: [
      /cybersecurity/i,
      /iec\s*81001/i,
      /threat\s+model/i,
      /pen[-\s]?test/i,
    ],
    dim_fallback: ["technical_docs"],
    effort_months: { low: 3, high: 5 },
    cost_inr_lakhs: { low: 2, high: 5 },
    why_it_matters_seed:
      "Cloud-deployed SaMD with health data carries cybersecurity expectations under IEC 81001-5-1 plus CERT-In safe-to-host. Reviewers typically ask for a threat model, control map, and penetration-test evidence.",
    review_status: "estimate",
  },
  {
    key: "usability_iec_62366",
    display_name: "Usability engineering (IEC 62366-1)",
    patterns: [
      /usability/i,
      /iec\s*62366/i,
      /human\s+factors/i,
      /formative\s+evaluation/i,
      /summative\s+evaluation/i,
    ],
    dim_fallback: ["technical_docs"],
    effort_months: { low: 2, high: 4 },
    cost_inr_lakhs: { low: 1, high: 3 },
    why_it_matters_seed:
      "Use-error risks matter for clinician-facing diagnostic support tools. Reviewers will likely ask for a usability file (use specification, formative + summative evaluations) per IEC 62366-1.",
    review_status: "estimate",
  },
  {
    key: "acp_pccp",
    display_name: "Algorithm Change Protocol (ACP/PCCP)",
    patterns: [
      /\bacp\b/i,
      /\bpccp\b/i,
      /algorithm\s+change/i,
      /model\s+update\s+control/i,
      /adaptive\s+ai/i,
    ],
    dim_fallback: ["technical_docs"],
    effort_months: { low: 3, high: 5 },
    cost_inr_lakhs: { low: 2, high: 4 },
    why_it_matters_seed:
      "Per the Oct 2025 CDSCO SaMD draft, adaptive AI/ML devices typically file an ACP describing modification scope, retraining triggers, validation thresholds, and human oversight before commercial updates.",
    review_status: "estimate",
  },
  {
    key: "predicate_research",
    display_name: "Predicate / substantial-equivalence basis",
    patterns: [
      /predicate/i,
      /substantial\s+equivalence/i,
      /md[-\s]?26/i,
      /md[-\s]?27/i,
    ],
    dim_fallback: ["regulatory_clarity"],
    effort_months: { low: 1, high: 2 },
    cost_inr_lakhs: { low: 0.5, high: 1.5 },
    why_it_matters_seed:
      "Without an Indian predicate, you likely move via the MD-26/MD-27 pre-permission route before MD-7, which adds a separate review cycle. International FDA / CE predicates can be cited but typically need a stronger comparison narrative.",
    review_status: "estimate",
  },
  {
    key: "intended_use_drafting",
    display_name: "Intended Use Statement drafting",
    patterns: [
      /intended\s+use/i,
      /classification\s+rationale/i,
      /feature[-\s]?creep/i,
      /scope\s+boundary/i,
    ],
    dim_fallback: ["regulatory_clarity"],
    effort_months: { low: 1, high: 2 },
    cost_inr_lakhs: { low: 0.3, high: 1 },
    why_it_matters_seed:
      "Reviewers cross-check the Intended Use Statement against marketing copy, labelling, and the IFU. Inconsistencies typically trigger questions early in the review cycle.",
    review_status: "estimate",
  },
  {
    key: "pms_plan",
    display_name: "Post-market surveillance plan",
    patterns: [
      /post[-\s]?market/i,
      /\bpms\b/i,
      /\bpmcf\b/i,
      /complaint\s+handling/i,
    ],
    dim_fallback: ["submission_maturity"],
    effort_months: { low: 2, high: 3 },
    cost_inr_lakhs: { low: 1, high: 3 },
    why_it_matters_seed:
      "Reviewers will likely ask for a documented PMS plan (complaint handling, periodic safety updates, PMCF triggers) as a precondition for licence grant for Class B/C/D devices.",
    review_status: "estimate",
  },
  {
    key: "labelling_ifu",
    display_name: "Labelling + IFU",
    patterns: [
      /labelling/i,
      /labeling/i,
      /\bifu\b/i,
      /instructions\s+for\s+use/i,
    ],
    dim_fallback: ["submission_maturity"],
    effort_months: { low: 1, high: 2 },
    cost_inr_lakhs: { low: 0.5, high: 2 },
    why_it_matters_seed:
      "Labelling content (intended use, contraindications, warnings, IFU) is reviewed for consistency against the rest of the submission. Lay-user environments require IFU at a general-public reading level.",
    review_status: "estimate",
  },
  {
    key: "abdm_fhir_integration",
    display_name: "ABDM / FHIR integration",
    patterns: [/abdm/i, /\bfhir\b/i, /milestone\s+1\s+abdm/i],
    dim_fallback: ["abdm"],
    effort_months: { low: 2, high: 4 },
    cost_inr_lakhs: { low: 1.5, high: 3 },
    why_it_matters_seed:
      "If you plan to integrate with ABDM / public-health systems, reviewers and procurement teams typically expect FHIR R4 conformance, OAuth 2.0 onboarding, and CERT-In safe-to-host evidence.",
    review_status: "estimate",
  },
  {
    key: "icmr_ai_ethics",
    display_name: "ICMR AI ethics review",
    patterns: [
      /icmr/i,
      /ai\s+ethics/i,
      /ethical\s+considerations/i,
      /bias\s+evaluation/i,
    ],
    dim_fallback: ["clinical_evidence"],
    effort_months: { low: 1, high: 2 },
    cost_inr_lakhs: { low: 0.5, high: 1.5 },
    why_it_matters_seed:
      "Reviewers and ethics committees increasingly reference the ICMR 2023 AI-in-health-research ethics guideline — bias evaluation, explainability, and Indian-population validity typically need explicit treatment for AI/ML devices.",
    review_status: "estimate",
  },
];

/**
 * Match a gap to the lookup library by title first, dim second.
 */
export function matchEffortCost(
  gapTitle: string,
  dim: string
): EffortCostEntry {
  for (const entry of EFFORT_COST_LIBRARY) {
    if (entry.patterns.some((re) => re.test(gapTitle))) return entry;
  }
  for (const entry of EFFORT_COST_LIBRARY) {
    if (entry.dim_fallback.includes(dim)) return entry;
  }
  return GENERIC_FALLBACK;
}

/**
 * Format the entry's numbers into the schema's `estimated_effort` string.
 * Example: "6–9 months · ₹3–5L"
 */
export function formatEffort(entry: EffortCostEntry): string {
  const months = `${entry.effort_months.low}–${entry.effort_months.high} months`;
  const cost = formatInrLakhs(entry.cost_inr_lakhs.low, entry.cost_inr_lakhs.high);
  return `${months} · ${cost}`;
}

export function formatInrLakhs(low: number, high: number): string {
  const round = (n: number) =>
    Number.isInteger(n) ? n.toString() : n.toFixed(1).replace(/\.0$/, "");
  return `₹${round(low)}–${round(high)}L`;
}
