/**
 * Sprint 3 Day 4 — section-gating unit test.
 *
 * No LLM, no DB. Loads the Day-2 hardware card fixtures
 * (data/smoke/hardware-card-smoke.json), pairs each with a synthetic
 * wizard_answers payload reflecting that case's likely Q8/Q9 answers,
 * runs hardwarePackSectionPlan() and shouldIncludeSubBlock(), and
 * asserts the expected presence/absence pattern per case.
 *
 * Cases (same as Day-2 readiness-report smoke):
 *   - drug-eluting stent (implant) — Class D novel, drug-eluting,
 *     sterile, implant contact, no software
 *   - disposable BP cuff (accessory) — Class A sterile, no drug,
 *     surface skin contact, no software
 *   - connected glucometer — Class C, no drug, blood-path indirect,
 *     SOFTWARE in device (companion app + connectivity)
 *
 * Run: pnpm tsx scripts/test-section-gating.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  hardwarePackSectionPlan,
  shouldIncludeSubBlock,
} from "../lib/engine/draft-pack-v2/section-gating";
import type { SourceData } from "../lib/engine/draft-pack-v2/types";
import type { WizardAnswers } from "../lib/wizard/types";
import type { ReadinessCard } from "../lib/schemas/readiness-card";

type SmokeCase = { id: string; pass: boolean; card: ReadinessCard };

const FIXTURE = path.resolve(
  process.cwd(),
  "data/smoke/hardware-card-smoke.json"
);

/** Per-case wizard answers. Hand-coded from each case's intended
 *  profile; these are the answers a real founder would give the
 *  hardware-persona Tier A wizard (persona + q1..q7 + q8 + q9). */
const WIZARD_BY_CASE: Record<string, WizardAnswers> = {
  implant: {
    persona: "manufacturer_hardware",
    q8: "no", // no predicate — novel drug-eluting stent
    q9: "implant_gt_30d",
  },
  accessory: {
    persona: "manufacturer_hardware",
    q8: "yes_indian", // BP cuffs are commodity
    q9: "surface_intact_skin",
  },
  connected_glucometer: {
    persona: "manufacturer_hardware",
    q8: "yes_indian", // glucometers are commodity
    q9: "blood_path_indirect", // test-strip blood contact — system-level signal
  },
};

/** Per-case expected gating outcomes. These ARE the regulatory
 *  contract — a regression here is a regulatory drift, not a code
 *  smell. */
type Expected = {
  /** Section keys that MUST appear. */
  must_include: string[];
  /** Section keys that MUST NOT appear. */
  must_exclude: string[];
  /** Sub-block keys (in `parent.sub` form) that MUST appear. */
  sub_blocks_include: string[];
  /** Sub-block keys that MUST NOT appear. */
  sub_blocks_exclude: string[];
};

const EXPECTED: Record<string, Expected> = {
  implant: {
    must_include: [
      // Always-present hardware sections
      "01_executive_summary",
      "02_device_description",
      "03_intended_use",
      "04_classification_grouping",
      "05_product_specification",
      "06_predicate_comparison",
      "07_labelling",
      "08_design_manufacturing",
      "09_essential_principles",
      "10_risk_management",
      "11_verification_validation",
      "12_clinical_evidence_pms",
      "15_stability_data",
      "16_batch_release",
      "17_pmf_attestation",
      "18_qms_attestation",
      // Gated YES for stent
      "13_biocompatibility", // q9 = implant_gt_30d
      "14_sterilization_validation", // sterile marker present, inferred yes
      "19_conditional_nocs", // drug_content trigger
    ],
    must_exclude: [],
    sub_blocks_include: [
      "08.medicinal_substances", // drug-eluting
      "12.animal_preclinical", // implant + drug
    ],
    sub_blocks_exclude: [
      "11.software_vv", // no software_in_device marker
    ],
  },
  accessory: {
    // BP cuff: synthesizer-fixture has sterile=No extracted, drug_content
    // status=assumed (no signal). Per calibrated trigger:
    //  - §14 EXCLUDED (sterile=No status=extracted — founder said so via deck)
    //  - §8.12 [ASSUMED] INCLUDED (drug_content has no signal → safeguard)
    //  - §12.animal_preclinical [ASSUMED] INCLUDED (drug-combination route via
    //    assumed drug_content — wizard Q9=surface_intact_skin doesn't trigger)
    // BP cuff founder removes the assumed-yes drug/animal blocks in editor.
    // The friction is the price of never silently omitting drug-content
    // content from a device the synthesizer didn't have signal on.
    must_include: [
      "01_executive_summary",
      "02_device_description",
      "03_intended_use",
      "04_classification_grouping",
      "05_product_specification",
      "06_predicate_comparison",
      "07_labelling",
      "08_design_manufacturing",
      "09_essential_principles",
      "10_risk_management",
      "11_verification_validation",
      "12_clinical_evidence_pms",
      "15_stability_data",
      "16_batch_release",
      "17_pmf_attestation",
      "18_qms_attestation",
      "13_biocompatibility", // q9 = surface_intact_skin (wizard-explicit)
    ],
    must_exclude: [
      "14_sterilization_validation", // sterile=No status=extracted — founder said
      "19_conditional_nocs", // no NOC affirmative trigger
    ],
    sub_blocks_include: [
      "08.medicinal_substances", // [ASSUMED] — drug_content no signal
      "12.animal_preclinical", // [ASSUMED] — drug-combination via assumed drug_content
    ],
    sub_blocks_exclude: [
      "11.software_vv", // software_in_device=No status=estimated
    ],
  },
  connected_glucometer: {
    // Glucometer: synthesizer-fixture has sterile=Yes estimated,
    // software_in_device=Yes estimated, drug_content assumed-No.
    //  - §14 INCLUDED (sterile=Yes signal seen)
    //  - §11.software_vv INCLUDED (software=Yes signal seen)
    //  - §8.12 [ASSUMED] INCLUDED (drug_content no signal → safeguard)
    //  - §12.animal_preclinical [ASSUMED] INCLUDED (drug-combination via
    //    assumed drug_content — Q9=blood_path_indirect is short-term, not long)
    must_include: [
      "01_executive_summary",
      "02_device_description",
      "03_intended_use",
      "04_classification_grouping",
      "05_product_specification",
      "06_predicate_comparison",
      "07_labelling",
      "08_design_manufacturing",
      "09_essential_principles",
      "10_risk_management",
      "11_verification_validation",
      "12_clinical_evidence_pms",
      "15_stability_data",
      "16_batch_release",
      "17_pmf_attestation",
      "18_qms_attestation",
      "13_biocompatibility", // q9 = blood_path_indirect
      "14_sterilization_validation", // sterile=Yes signal present
    ],
    must_exclude: [
      "19_conditional_nocs", // no NOC affirmative trigger
    ],
    sub_blocks_include: [
      "11.software_vv", // software=Yes signal present
      "08.medicinal_substances", // [ASSUMED] — drug_content no signal
      "12.animal_preclinical", // [ASSUMED] — drug-combination route via assumed
    ],
    sub_blocks_exclude: [],
  },
};

function buildSourceData(c: SmokeCase, wizard: WizardAnswers): SourceData {
  return {
    assessment_id: `gating-test-${c.id}`,
    order_id: null,
    intake: {
      name: c.card.meta.company_name,
      email: "test@example.com",
      one_liner: "",
      url: null,
      url_fetched_content: null,
      uploaded_docs: [],
    },
    wizard_answers: wizard,
    readiness_card: c.card,
    ai_extracted: null,
  };
}

function fmt(s: string): string {
  return s.length > 60 ? s.slice(0, 57) + "…" : s;
}

function runOne(c: SmokeCase): boolean {
  const wizard = WIZARD_BY_CASE[c.id];
  if (!wizard) {
    console.log(`  ✗ no wizard fixture for case ${c.id}`);
    return false;
  }
  const exp = EXPECTED[c.id];
  if (!exp) {
    console.log(`  ✗ no expected gating for case ${c.id}`);
    return false;
  }

  const sources = buildSourceData(c, wizard);

  // Section-level gating.
  const plan = hardwarePackSectionPlan(sources);
  const includedKeys = plan
    .filter((p) => p.decision.included)
    .map((p) => p.key);
  const excludedKeys = plan
    .filter((p) => !p.decision.included)
    .map((p) => p.key);

  console.log(`\n=== ${c.id} ===`);
  console.log(`  card markers: ${(c.card.inference_markers ?? []).map((m) => m.field).join(", ")}`);
  console.log(`  q8=${wizard.q8} q9=${wizard.q9}`);
  console.log(`  included (${includedKeys.length}): ${includedKeys.join(", ")}`);
  console.log(`  excluded (${excludedKeys.length}): ${excludedKeys.join(", ")}`);
  for (const p of plan) {
    if (p.decision.assumed) {
      console.log(`    [ASSUMED] ${p.key} — ${p.decision.reason}`);
    }
  }

  let ok = true;
  for (const must of exp.must_include) {
    if (!includedKeys.includes(must)) {
      console.log(`  ✗ MISSING expected: ${must}`);
      const dec = plan.find((p) => p.key === must)?.decision;
      if (dec) console.log(`      reason: ${dec.reason}`);
      ok = false;
    }
  }
  for (const must of exp.must_exclude) {
    if (includedKeys.includes(must)) {
      console.log(`  ✗ UNEXPECTED include: ${must}`);
      const dec = plan.find((p) => p.key === must)?.decision;
      if (dec) console.log(`      reason: ${dec.reason}`);
      ok = false;
    }
  }

  // Sub-block gating.
  const subResults = [
    {
      ref: "08.medicinal_substances" as const,
      dec: shouldIncludeSubBlock("medicinal_substances", sources),
    },
    {
      ref: "11.software_vv" as const,
      dec: shouldIncludeSubBlock("software_vv", sources),
    },
    {
      ref: "12.animal_preclinical" as const,
      dec: shouldIncludeSubBlock("animal_preclinical", sources),
    },
  ];
  console.log(`  sub-blocks:`);
  for (const sr of subResults) {
    const flag = sr.dec.included ? "✓" : "—";
    const asm = sr.dec.assumed ? " [ASSUMED]" : "";
    console.log(`    ${flag} ${sr.ref}${asm} — ${fmt(sr.dec.reason)}`);
  }
  for (const must of exp.sub_blocks_include) {
    const found = subResults.find((sr) => sr.ref === must);
    if (!found || !found.dec.included) {
      console.log(`  ✗ MISSING sub-block: ${must}`);
      if (found) console.log(`      reason: ${found.dec.reason}`);
      ok = false;
    }
  }
  for (const must of exp.sub_blocks_exclude) {
    const found = subResults.find((sr) => sr.ref === must);
    if (found && found.dec.included) {
      console.log(`  ✗ UNEXPECTED sub-block include: ${must}`);
      console.log(`      reason: ${found.dec.reason}`);
      ok = false;
    }
  }

  console.log(`  ${ok ? "✓" : "✗"} case ${c.id}`);
  return ok;
}

function main(): void {
  const cases = JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as SmokeCase[];
  let allOk = true;
  for (const c of cases) {
    if (!runOne(c)) allOk = false;
  }
  console.log(`\n=== ${allOk ? "ALL PASS ✓" : "FAILURES ✗"} ===`);
  process.exit(allOk ? 0 : 1);
}

main();
