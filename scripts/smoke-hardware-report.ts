/**
 * Phase 2c Day 2 Step C — hardware ₹499 Readiness Report smoke test.
 *
 * Re-uses the cards previously persisted by `smoke-hardware-card.ts`
 * (no second synth call) and runs the report generator end-to-end
 * for the implant + connected_glucometer cases. The accessory case
 * is skipped to keep cost bounded; the two heavier cases exercise
 * the hardware Phase 2 branches more fully.
 *
 * Verifies:
 *   - Pathway forms match the hardware class (no SaMD MD-7 default)
 *   - Hardware-specific gaps (biocomp / sterilization / DMF) surface
 *     in the gap analysis when their triggers fire
 *   - No SaMD-only IEC 62304 / ACP / IEC 81001-5-1 gates leak into
 *     a pure-hardware case (implant has no software_in_device)
 *   - Inference markers passthrough the report meta block
 *   - Cost is in the ~Rs 0.13-0.15 / $0.13 band (parity with SaMD report)
 *   - Certainty softened (no banned-hard-claim phrases)
 *
 * Run:
 *   npx tsx scripts/smoke-hardware-report.ts
 */

import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY missing");
  process.exit(1);
}

import {
  generateReadinessReport,
  type ReadinessReportInput,
} from "../lib/engine/readiness-report-v1-generator";
import type { ReadinessCard } from "../lib/schemas/readiness-card";
import type { ReadinessReport } from "../lib/schemas/readiness-report";
import type { WizardAnswers } from "../lib/wizard/types";

interface SmokeCard {
  id: string;
  pass: boolean;
  card: ReadinessCard;
}

interface ReportCase {
  id: string;
  label: string;
  card: ReadinessCard;
  wizard_answers: WizardAnswers;
  expect: {
    formsContain: RegExp;
    formsDoNotContain?: RegExp;
    biocompInGapAnalysis: boolean;
    sterilizationInGapAnalysis: boolean;
    iec62304InGapAnalysis: boolean; // true only if software_in_device
    markerCountAtLeast: number;
    maxCostUsd: number;
    /** Bug 2 — smart_examples snippets should mention at least one of
     *  these device-relevant keywords. Soft check; case-insensitive. */
    deviceKeywordsAny?: string[];
    /** Bug 2 — smart_examples snippets must NOT contain any of these
     *  generic-template terms when the device is unrelated. */
    snippetsMustNotContain?: string[];
  };
}

function loadCards(): SmokeCard[] {
  const file = path.resolve(
    process.cwd(),
    "data/smoke/hardware-card-smoke.json"
  );
  if (!fs.existsSync(file)) {
    console.error(`Card smoke file not found: ${file}\nRun smoke-hardware-card.ts first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as SmokeCard[];
}

function check(name: string, cond: boolean, detail?: string): boolean {
  const sym = cond ? "✓" : "✗";
  console.log(`    ${sym} ${name}${detail ? ` — ${detail}` : ""}`);
  return cond;
}

function bannedCertainty(text: string): string[] {
  const banned = [
    /\bdefinitely\b/i,
    /\babsolutely\b/i,
    /\bcertainly\b/i,
    /\bguaranteed\b/i,
    /\bobvious(?:ly)?\b/i,
    /\bmust file\b/i,
    /\bis required\b/i,
  ];
  return banned
    .map((re) => re.exec(text)?.[0])
    .filter((s): s is string => Boolean(s));
}

async function runOne(tc: ReportCase): Promise<boolean> {
  console.log(`\n=== ${tc.id} — ${tc.label} ===`);

  const input: ReadinessReportInput = {
    assessment_id: `smoke-report-${tc.id}-${Date.now()}`,
    company_name: tc.card.meta.company_name,
    product_name: tc.card.meta.product_name,
    scoped_feature: tc.card.meta.scoped_feature,
    readiness_card: tc.card,
    wizard_answers: tc.wizard_answers,
  };

  let report: ReadinessReport;
  let cost_usd: number;
  try {
    const result = await generateReadinessReport(input);
    report = result.report;
    cost_usd = result.cost_usd;
  } catch (err) {
    console.log(`    ✗ report generation failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }

  let allPass = true;
  const pass = (cond: boolean) => {
    if (!cond) allPass = false;
    return cond;
  };

  // --- pathway forms ---
  const formsJoined = report.pathway.forms.join(", ");
  pass(
    check(
      `forms contain ${tc.expect.formsContain} (got "${formsJoined}")`,
      tc.expect.formsContain.test(formsJoined)
    )
  );
  if (tc.expect.formsDoNotContain) {
    pass(
      check(
        `forms do NOT contain ${tc.expect.formsDoNotContain}`,
        !tc.expect.formsDoNotContain.test(formsJoined)
      )
    );
  }

  // --- gap analysis content ---
  const gapTitles = report.gap_analysis.rows.map((r) => r.gap.toLowerCase());
  const gapEfforts = report.gap_analysis.rows.map((r) => r.estimated_effort);

  const hasBiocomp = gapTitles.some((t) => /biocomp|iso\s*10993/.test(t));
  if (tc.expect.biocompInGapAnalysis) {
    pass(check("biocomp gap in gap_analysis", hasBiocomp));
  }

  const hasSterilization = gapTitles.some((t) =>
    /steril|eto\b|gamma|autoclav/.test(t)
  );
  if (tc.expect.sterilizationInGapAnalysis) {
    pass(check("sterilization gap in gap_analysis", hasSterilization));
  }

  const hasIec62304 = gapTitles.some((t) =>
    /iec\s*62304|software\s+lifecycle|companion\s+app/.test(t)
  );
  if (tc.expect.iec62304InGapAnalysis) {
    pass(check("IEC 62304 surfaces (device has software)", hasIec62304));
  } else {
    pass(
      check(
        "IEC 62304 does NOT leak (no software in device)",
        !hasIec62304,
        hasIec62304 ? "IEC 62304 surfaced unexpectedly" : undefined
      )
    );
  }

  // ACP / IEC 81001-5-1 should never leak into a pure hardware report
  const hasAcp = gapTitles.some((t) => /\bacp\b|pccp|algorithm\s+change/.test(t));
  const has81001 = gapTitles.some((t) =>
    /iec\s*81001|cert[-\s]?in/.test(t)
  );
  if (!tc.expect.iec62304InGapAnalysis) {
    pass(check("ACP/PCCP does NOT leak", !hasAcp));
    pass(check("IEC 81001-5-1 does NOT leak", !has81001));
  }

  // --- inference markers passthrough ---
  const markerCount = report.meta.inference_markers?.length ?? 0;
  pass(
    check(
      `inference_markers carried into report (count=${markerCount})`,
      markerCount >= tc.expect.markerCountAtLeast
    )
  );

  // --- certainty softness ---
  const surfaceTexts: string[] = [
    report.scorecard.classification_label,
    report.scorecard.pathway_label,
    report.scorecard.recommended_next_action,
    report.pathway.why_this_class_applies,
    ...report.gap_analysis.rows.map((r) => r.why_it_matters),
    ...report.reviewer_insights.map((r) => r.what_reviewers_look_for),
  ];
  const bannedHits = surfaceTexts.flatMap((t) => bannedCertainty(t));
  pass(
    check(
      "report surfaces free of banned hard phrases",
      bannedHits.length === 0,
      bannedHits.length ? `found: ${bannedHits.join(", ")}` : undefined
    )
  );

  // --- cost ---
  pass(
    check(
      `cost ≤ $${tc.expect.maxCostUsd} (got $${cost_usd.toFixed(4)})`,
      cost_usd <= tc.expect.maxCostUsd
    )
  );

  // --- Bug 1 verification: scorecard pathway_label must NOT include MD-12
  //     as a manufacturing licence form (MD-12 is the test licence). ---
  pass(
    check(
      `scorecard pathway_label deterministic — no "MD-12 (Central)" leak (got "${report.scorecard.pathway_label}")`,
      !/md-?\s*12\s*\(/i.test(report.scorecard.pathway_label)
    )
  );

  // --- Bug 1 verification: the manufacturing-licence step in
  //     step_sequence is class-appropriate. ---
  const mfgStep = report.pathway.step_sequence.find((s) =>
    /manufacturing\s+licence/i.test(s.step)
  );
  if (mfgStep) {
    const cls = tc.card.classification.cdsco_class;
    if (cls === "C" || cls === "D") {
      pass(
        check(
          `Class ${cls} manufacturing licence step labelled MD-7 (got "${mfgStep.step}")`,
          /md-?\s*7/i.test(mfgStep.step)
        )
      );
    }
    if (cls === "A" || cls === "B") {
      pass(
        check(
          `Class ${cls} manufacturing licence step labelled MD-3 / portal (got "${mfgStep.step}")`,
          /md-?\s*3|portal/i.test(mfgStep.step)
        )
      );
    }
  }

  // --- Bug 2 verification: Smart Examples should NOT leak generic
  //     brain-MRI / Alzheimer's wording when the device is something
  //     else. Soft check: the snippet should mention something
  //     plausibly related to the actual device, OR at minimum not
  //     all three snippets should be brain-MRI themed for non-brain
  //     products. ---
  if (tc.expect.deviceKeywordsAny && tc.expect.deviceKeywordsAny.length > 0) {
    const allSnippets = report.smart_examples
      .map((e) => `${e.good_snippet} ${e.bad_snippet}`)
      .join(" ");
    const matched = tc.expect.deviceKeywordsAny.find((kw) =>
      new RegExp(`\\b${kw}\\b`, "i").test(allSnippets)
    );
    pass(
      check(
        `smart_examples mention device terminology (any of: ${tc.expect.deviceKeywordsAny.join(", ")})`,
        Boolean(matched),
        matched ? `matched "${matched}"` : "no device keyword found in snippets"
      )
    );
  }
  if (tc.expect.snippetsMustNotContain) {
    const allSnippets = report.smart_examples
      .map((e) => `${e.good_snippet} ${e.bad_snippet}`)
      .join(" ");
    const leakage = tc.expect.snippetsMustNotContain.find((kw) =>
      new RegExp(`\\b${kw}\\b`, "i").test(allSnippets)
    );
    pass(
      check(
        `smart_examples free of off-product wording (none of: ${tc.expect.snippetsMustNotContain.join(", ")})`,
        !leakage,
        leakage ? `leaked "${leakage}"` : undefined
      )
    );
  }

  // --- diagnostic dump for the founder ---
  console.log("\n    [scorecard]");
  console.log(`      classification_label: ${report.scorecard.classification_label}`);
  console.log(`      pathway_label: ${report.scorecard.pathway_label}`);
  console.log("\n    [pathway]");
  console.log(`      authority: ${report.pathway.authority}`);
  console.log(`      forms: ${report.pathway.forms.join(", ")}`);
  for (const s of report.pathway.step_sequence) {
    console.log(`      • ${s.step} — ${s.duration}`);
  }
  console.log("\n    [gap_analysis]");
  for (const r of report.gap_analysis.rows) {
    console.log(`      [${r.priority}] ${r.gap} (${r.estimated_effort})`);
  }
  console.log("\n    [phases]");
  for (const p of report.timeline_cost.phases) {
    console.log(`      ${p.name} (${p.duration}, ${p.cost_range_inr})`);
  }
  console.log("\n    [smart_examples]");
  for (const e of report.smart_examples) {
    console.log(`      • [${e.category}] ${e.topic}`);
    console.log(`        good: ${e.good_snippet.slice(0, 180)}${e.good_snippet.length > 180 ? "…" : ""}`);
    console.log(`        bad:  ${e.bad_snippet.slice(0, 180)}${e.bad_snippet.length > 180 ? "…" : ""}`);
  }

  return allPass;
}

/** Phase 2c Bug 1 — synthetic SaMD card with the WRONG forms field
 *  (forms: ["MD-12"]) so we can verify the report generator overrides
 *  it with the class-derived MD-7. Class C SaMD, AI/ML, has predicate.
 *  Product: retinal-fundus diabetic-retinopathy detection (NOT
 *  brain-MRI / Alzheimer's — to exercise Bug 2 fix too). */
function syntheticSamdCard(): ReadinessCard {
  return {
    meta: {
      company_name: "Demo: RetinaFlag",
      product_name: "RetinaFlag DR",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type:
        "AI-CDS for diabetic-retinopathy screening from fundus photographs",
      imdrf_category: "III",
      cdsco_class: "C",
      class_qualifier: "AI-CDS",
      ai_ml_flag: true,
      acp_required: true,
      export_only: false,
      novel_or_predicate: "has_predicate",
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
      note: "Foundational compliance work outstanding before submission.",
    },
    risk: {
      level: "high",
      rationale:
        "AI clinical decision support in a serious clinical state (diabetic retinopathy screening) — Class C SaMD profile under CDSCO MDR-2017.",
    },
    timeline: {
      estimate_months_low: 12,
      estimate_months_high: 18,
      display: "12–18 months",
      anchor: "AI-CDS Class C path with predicate-based equivalence.",
    },
    regulations: {
      // The buggy forms array — synthesizer historically puts MD-12 first
      // for SaMD. The report generator should override this with MD-7.
      cdsco_mdr: {
        verdict: "required",
        rationale: "AI diagnostic SaMD; central pathway likely.",
        forms: ["MD-12", "MD-9"],
        pathway_note: "SaMD pathway evolving · forms TBD",
      },
      cdsco_pharmacy: { verdict: "not_applicable", rationale: "No drug substance." },
      dpdp: {
        verdict: "required",
        rationale: "Fundus images + DR diagnosis are sensitive health data.",
      },
      icmr: {
        verdict: "required",
        rationale: "AI in healthcare — ICMR 2023 AI ethics guideline applies.",
      },
      abdm: {
        verdict: "conditional",
        rationale: "Hospital deployment may involve ABDM record linkage.",
      },
      nabh: {
        verdict: "required_for_procurement",
        rationale: "Hospital procurement increasingly NABH-gated.",
      },
      mci_telemed: { verdict: "not_applicable", rationale: "Not a telemedicine service." },
      irdai: { verdict: "not_applicable", rationale: "No insurance scope." },
      nabl: {
        verdict: "conditional",
        rationale:
          "Performance evaluation may use NABL-accredited reference labs.",
      },
    },
    top_gaps: [
      {
        dim: "quality_system",
        gap_title: "No ISO 13485 QMS detected",
        fix_action: "Engage an ISO 13485 consultant for a gap assessment.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "IEC 62304 software lifecycle evidence missing",
        fix_action:
          "Establish lifecycle processes (safety classification, SOUP list, V&V).",
        severity: "high",
      },
      {
        dim: "clinical_evidence",
        gap_title: "Indian-population validation evidence not documented",
        fix_action:
          "Plan a retrospective evaluation on Indian fundus images plus a prospective multi-centre study.",
        severity: "high",
      },
    ],
    verdict:
      "Likely a Class C AI-CDS SaMD under CDSCO MDR-2017 — central licensing pathway. Foundational QMS, software lifecycle, and Indian-population validation are open lifts before submission.",
    why_regulated:
      "Driving clinical management in a serious condition (diabetic retinopathy diagnosis) using AI on fundus photographs places the product in the SaMD Class C band.",
    post_2025_samd_gap: false,
    tier0_card_tagline: "AI-CDS for diabetic-retinopathy screening.",
    tier1_teaser: "Get the founder-facing CDSCO readiness report.",
    tier2_teaser: "Generate the 12-section Submission Workspace.",
    recommended_path: "manufacturing_license",
    inference_markers: [],
  };
}

(async function main() {
  console.log("Phase 2c Day 2 Step C — hardware ₹499 report smoke test\n");

  const cards = loadCards();
  const byId = new Map(cards.map((c) => [c.id, c.card]));

  // Wizard answers must match what the card was generated with.
  // Reused from scripts/smoke-hardware-card.ts CASES.
  const REPORT_CASES: ReportCase[] = [
    {
      id: "implant",
      label: "Drug-eluting coronary stent (pure hardware, Class D)",
      card: byId.get("implant")!,
      wizard_answers: {
        persona: "manufacturer_hardware",
        q1: "critical",
        q3: "hcps",
        q5: "hospital",
        q6: ["phi"],
        q7: "mvp",
        q8: "yes_indian",
        q9: "implant_gt_30d",
      },
      expect: {
        // Class D → MD-7 path; should NOT carry the SaMD-only ACP step.
        formsContain: /md-?\s*7/i,
        biocompInGapAnalysis: true,
        sterilizationInGapAnalysis: true,
        iec62304InGapAnalysis: false, // no software in device
        markerCountAtLeast: 8,
        maxCostUsd: 0.25,
        // Implant device — Smart Examples should reflect coronary /
        // stent / cardiovascular vocabulary, NOT brain-MRI / Alzheimer's.
        deviceKeywordsAny: [
          "stent",
          "coronary",
          "cardiac",
          "cardiovascular",
          "implant",
          "drug-eluting",
          "ischaemic",
          "ischemic",
        ],
        snippetsMustNotContain: ["Alzheimer", "dementia", "brain MRI"],
      },
    },
    {
      id: "connected_glucometer",
      label: "Connected glucometer (hardware + companion app, Class C IVD)",
      card: byId.get("connected_glucometer")!,
      wizard_answers: {
        persona: "manufacturer_hardware",
        q1: "serious",
        q3: "patients",
        q5: "abdm",
        q6: ["phi"],
        q7: "mvp",
        q8: "yes_indian",
        q9: "blood_path_direct",
      },
      expect: {
        formsContain: /md-?\s*7/i,
        biocompInGapAnalysis: true,
        sterilizationInGapAnalysis: false, // not enforced; meter itself isn't sterile
        iec62304InGapAnalysis: true, // companion app is software_in_device
        markerCountAtLeast: 8,
        maxCostUsd: 0.25,
        deviceKeywordsAny: [
          "glucose",
          "glucometer",
          "diabet",
          "blood sugar",
          "BG",
          "insulin",
        ],
        snippetsMustNotContain: ["Alzheimer", "dementia", "brain MRI"],
      },
    },
    // Phase 2c Bug 1 + Bug 2 — synthetic SaMD case. Card deliberately
    // has forms: ["MD-12", "MD-9"] (MD-12 is the test licence, NOT a
    // manufacturing licence — historical synthesizer drift). Report
    // must override to MD-7 for Class C. Smart Examples should reflect
    // diabetic-retinopathy / fundus terminology, not brain-MRI defaults.
    {
      id: "samd_retina",
      label: "AI-CDS for diabetic retinopathy on fundus images (Class C SaMD)",
      card: syntheticSamdCard(),
      wizard_answers: {
        persona: "manufacturer_samd",
        q1: "serious",
        q2: "drives",
        q3: "hcps",
        q4: "10k_to_1l",
        q5: "hospital",
        q6: ["phi", "imaging"],
        q7: "mvp",
      },
      expect: {
        formsContain: /md-?\s*7/i,
        formsDoNotContain: /md-?\s*12\s*\(/i, // "MD-12 (Central)" leak
        biocompInGapAnalysis: false, // no patient_contact signal for SaMD
        sterilizationInGapAnalysis: false,
        iec62304InGapAnalysis: true, // ai_ml_flag → software_in_device
        markerCountAtLeast: 0, // SaMD reports may have empty markers
        maxCostUsd: 0.25,
        deviceKeywordsAny: [
          "retin",
          "fundus",
          "diabet",
          "DR",
          "ophthalm",
          "eye",
        ],
        snippetsMustNotContain: ["Alzheimer", "dementia", "brain MRI"],
      },
    },
  ];

  const results: Array<{ id: string; pass: boolean }> = [];
  for (const tc of REPORT_CASES) {
    if (!tc.card) {
      console.log(`Skipping ${tc.id} — no card in smoke file.`);
      continue;
    }
    const ok = await runOne(tc);
    results.push({ id: tc.id, pass: ok });
  }

  console.log("\n=== Summary ===");
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.id}`);
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.log(`\n${failed.length}/${results.length} cases FAILED.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} cases PASSED.`);
})().catch((err) => {
  console.error("\nReport smoke crashed:", err);
  process.exit(1);
});
