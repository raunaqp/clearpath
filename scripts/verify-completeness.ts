#!/usr/bin/env tsx
/**
 * Verify completeness check produces sensible output for the demo packets.
 * Run: npx tsx scripts/verify-completeness.ts
 */
import { runCompletenessForCard, categoryForCard } from "../lib/completeness/category";
import type { ReadinessCard } from "../lib/schemas/readiness-card";

function makeCard(overrides: {
  cls: ReadinessCard["classification"]["cdsco_class"];
  qualifier?: ReadinessCard["classification"]["class_qualifier"];
  ai_ml: boolean;
  status?: ReadinessCard["classification"]["medical_device_status"];
}): ReadinessCard {
  return {
    meta: {
      company_name: "Test", product_name: "Test", scoped_feature: null,
      product_type: "product", generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: overrides.status ?? "is_medical_device",
      device_type: "test",
      imdrf_category: null,
      cdsco_class: overrides.cls,
      class_qualifier: overrides.qualifier ?? null,
      ai_ml_flag: overrides.ai_ml,
      acp_required: overrides.ai_ml,
      export_only: false,
      novel_or_predicate: null,
    },
    readiness: {
      score: 4, band: "amber",
      dimensions: { regulatory_clarity: 1, quality_system: 1, technical_docs: 1, clinical_evidence: 1, submission_maturity: 0 },
      note: "",
    },
    risk: { level: "high", rationale: "" },
    timeline: { estimate_months_low: 9, estimate_months_high: 14, display: "9-14 mo", anchor: "" },
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
    top_gaps: [], verdict: "", why_regulated: "", post_2025_samd_gap: false,
    tier0_card_tagline: "", tier1_teaser: "", tier2_teaser: "",
  };
}

const cases = [
  {
    name: "CerviAI (Class C IVD-SaMD, AI/ML, no docs uploaded)",
    card: makeCard({ cls: "C", qualifier: "IVD-SaMD", ai_ml: true }),
    docs: [],
    expect: { category: "samd_class_c_d", total: 10, satisfied: 0 },
  },
  {
    name: "EkaScribe (Class B AI-CDS, AI/ML, no docs)",
    card: makeCard({ cls: "B", qualifier: "AI-CDS", ai_ml: true }),
    docs: [],
    expect: { category: "samd_class_a_b", total: 6, satisfied: 0 },
  },
  {
    name: "Forus 3nethra (Class D non-AI, mfg license uploaded)",
    card: makeCard({ cls: "D", ai_ml: false }),
    docs: [
      { id: "d1", filename: "iso_13485_certificate.pdf", doc_type: "iso_13485" },
      { id: "d2", filename: "device_master_record_3nethra.pdf", doc_type: null },
      { id: "d3", filename: "ifu_3nethra_v3.pdf", doc_type: null },
    ],
    expect: { category: "class_c_d", total: 8, satisfied: 3 },
  },
  {
    name: "Forus mature (all dims=2, signal supplement should fire)",
    card: (() => {
      const c = makeCard({ cls: "D", ai_ml: false });
      c.readiness.dimensions = {
        regulatory_clarity: 2,
        quality_system: 2,
        technical_docs: 2,
        clinical_evidence: 2,
        submission_maturity: 2,
      };
      return c;
    })(),
    docs: [],
    // class_c_d has 8 reqs. Signal supplement on all dims=2 satisfies:
    //   submission_maturity → MD-7
    //   quality_system     → iso_13485_cert (iec_62304 not in class_c_d list)
    //   technical_docs     → device_master_record, test_reports
    //   clinical_evidence  → clinical_evaluation_report, risk_management_file
    // = 6 satisfied. Missing: essential_principles, ifu. → 75%.
    expect: { category: "class_c_d", total: 8, satisfied: 6 },
  },
  {
    name: "Wellness app (no MD)",
    card: makeCard({ cls: null, ai_ml: true, status: "wellness_carve_out" }),
    docs: [],
    expect: { category: null, total: 0, satisfied: 0 },
  },
];

let pass = 0;
let fail = 0;
for (const c of cases) {
  const cat = categoryForCard(c.card);
  const result = runCompletenessForCard(c.card, c.docs);

  const catOk = cat === c.expect.category;
  const totalOk = (result?.per_requirement.length ?? 0) === c.expect.total;
  const satOk =
    (result?.per_requirement.filter((r) => r.satisfied).length ?? 0) ===
    c.expect.satisfied;
  const ok = catOk && totalOk && satOk;

  console.log(
    `[${ok ? "PASS" : "FAIL"}] ${c.name}\n  category=${cat ?? "null"} (expected ${c.expect.category ?? "null"})\n  total=${result?.per_requirement.length ?? 0} (expected ${c.expect.total})\n  satisfied=${result?.per_requirement.filter((r) => r.satisfied).length ?? 0} (expected ${c.expect.satisfied})\n  pct=${result?.overall_pct ?? "—"}\n`
  );
  if (ok) pass++;
  else fail++;
}

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail > 0 ? 1 : 0);
