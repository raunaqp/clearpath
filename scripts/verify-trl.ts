#!/usr/bin/env tsx
/**
 * Quick verification: deriveTRL() on the 4 main calibration archetypes.
 * Run: cd /home/claude/clearpath && npx tsx scripts/verify-trl.ts
 */
import { deriveTRL } from "../lib/engine/trl";
import type { ReadinessCard } from "../lib/schemas/readiness-card";

function makeCard(overrides: Partial<ReadinessCard>): ReadinessCard {
  const base: ReadinessCard = {
    meta: {
      company_name: "Test",
      product_name: "Test",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type: "test",
      imdrf_category: null,
      cdsco_class: null,
      class_qualifier: null,
      ai_ml_flag: false,
      acp_required: false,
      export_only: false,
      novel_or_predicate: null,
    },
    readiness: {
      score: 0,
      band: "red",
      dimensions: {
        regulatory_clarity: 0,
        quality_system: 0,
        technical_docs: 0,
        clinical_evidence: 0,
        submission_maturity: 0,
      },
      note: "",
    },
    risk: { level: "high", rationale: "" },
    timeline: { estimate_months_low: 0, estimate_months_high: 0, display: "", anchor: "" },
    regulations: {
      cdsco_mdr: { verdict: "required", rationale: "" },
      cdsco_pharmacy: { verdict: "not_applicable", rationale: "" },
      dpdp: { verdict: "required", rationale: "" },
      icmr: { verdict: "required", rationale: "" },
      abdm: { verdict: "conditional", rationale: "" },
      nabh: { verdict: "conditional", rationale: "" },
      mci_telemed: { verdict: "not_applicable", rationale: "" },
      irdai: { verdict: "not_applicable", rationale: "" },
      nabl: { verdict: "conditional", rationale: "" },
    },
    top_gaps: [],
    verdict: "",
    why_regulated: "",
    post_2025_samd_gap: false,
    tier0_card_tagline: "",
    tier1_teaser: "",
    tier2_teaser: "",
  };
  return { ...base, ...overrides } as ReadinessCard;
}

const cases = [
  {
    name: "EkaScribe — early stage AI scribe (sub-feature, novel)",
    expected_trl_range: [3, 4],
    card: makeCard({
      classification: {
        medical_device_status: "is_medical_device",
        device_type: "AI clinical-decision-support scribe",
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
        note: "",
      },
    }),
  },
  {
    name: "CerviAI — pre-submission, novel AI cancer screening",
    expected_trl_range: [3, 5],
    card: makeCard({
      classification: {
        medical_device_status: "is_medical_device",
        device_type: "AI cervical cancer screening",
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
        note: "",
      },
    }),
  },
  {
    name: "Forus Health — Class D ophthalmic, established (has predicate)",
    expected_trl_range: [7, 8],
    card: makeCard({
      classification: {
        medical_device_status: "is_medical_device",
        device_type: "Portable retinal screening camera (Class D)",
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
        note: "",
      },
    }),
  },
  {
    name: "HealthifyMe — wellness carve-out (TRL N/A expected)",
    expected_trl_range: [null, null],
    card: makeCard({
      classification: {
        medical_device_status: "wellness_carve_out",
        device_type: "Consumer wellness app",
        imdrf_category: null,
        cdsco_class: null,
        class_qualifier: null,
        ai_ml_flag: true,
        acp_required: false,
        export_only: false,
        novel_or_predicate: null,
      },
      readiness: {
        score: null,
        band: "not_applicable",
        dimensions: {
          regulatory_clarity: 0,
          quality_system: 0,
          technical_docs: 0,
          clinical_evidence: 0,
          submission_maturity: 0,
        },
        note: "Wellness carve-out",
      },
      risk: { level: "low", rationale: "Wellness only" },
    }),
  },
];

let pass = 0;
let fail = 0;
for (const c of cases) {
  const result = deriveTRL(c.card);
  const level = result?.level ?? null;
  const [lo, hi] = c.expected_trl_range;
  const ok =
    level === null
      ? lo === null
      : lo !== null && hi !== null && level >= lo && level <= hi;
  console.log(
    `[${ok ? "PASS" : "FAIL"}] ${c.name}\n  → TRL=${level} pct=${result?.completion_pct ?? "—"} track=${result?.track ?? "—"}\n  expected: TRL in [${lo}, ${hi}]\n  rationale: ${result?.rationale ?? "(no rationale)"}\n`
  );
  if (ok) pass++;
  else fail++;
}
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail > 0 ? 1 : 0);
