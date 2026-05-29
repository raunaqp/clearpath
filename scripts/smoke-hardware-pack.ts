/**
 * Sprint 3 Day 4 — hardware Submission Pack smoke harness (single case).
 *
 * Runs the hardware pack against the drug-eluting stent card from
 * `data/smoke/hardware-card-smoke.json` with dry_run=true (no DB writes,
 * no Opus consolidator). Asserts the gating + dispatch behaviour the
 * pack ships today.
 *
 * Day 5 morning will extend this to all 3 hardware cases (stent + BP
 * cuff + glucometer) and add LLM-dependent assertions when §13/§14
 * generators land.
 *
 * Cost: $0 — Day 4 only deterministic generators run; §1 consolidator
 * is skipped in dry-run mode.
 *
 * Run: pnpm tsx scripts/smoke-hardware-pack.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { runHardwarePack } from "../lib/engine/draft-pack-v2/orchestrator";
import type {
  SectionOpts,
  SourceData,
} from "../lib/engine/draft-pack-v2/types";
import type { WizardAnswers } from "../lib/wizard/types";
import type { ReadinessCard } from "../lib/schemas/readiness-card";

const FIXTURE = path.resolve(
  process.cwd(),
  "data/smoke/hardware-card-smoke.json"
);

type SmokeCase = { id: string; pass: boolean; card: ReadinessCard };

const STENT_WIZARD: WizardAnswers = {
  persona: "manufacturer_hardware",
  q8: "no", // novel — no predicate
  q9: "implant_gt_30d",
  b6_iso_13485_status: "in_progress",
};

function loadStentCard(): SmokeCase {
  const all = JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as SmokeCase[];
  const stent = all.find((c) => c.id === "implant");
  if (!stent) throw new Error(`No 'implant' case in ${FIXTURE}`);
  return stent;
}

function buildSourceData(c: SmokeCase, wizard: WizardAnswers): SourceData {
  return {
    assessment_id: `smoke-pack-${c.id}-${Date.now()}`,
    order_id: null,
    intake: {
      name: c.card.meta.company_name,
      email: "smoke@example.com",
      one_liner:
        "A bioresorbable drug-eluting cardiac stent for coronary artery disease.",
      url: null,
      url_fetched_content: null,
      uploaded_docs: [],
    },
    wizard_answers: wizard,
    readiness_card: c.card,
    ai_extracted: null,
  };
}

type Check = { name: string; pass: boolean; detail?: string };
const checks: Check[] = [];
function assert(name: string, cond: boolean, detail?: string): void {
  checks.push({ name, pass: cond, detail });
}

async function main(): Promise<void> {
  const stent = loadStentCard();
  const sources = buildSourceData(stent, STENT_WIZARD);

  const log = (m: string) => console.log("  " + m);
  const opts: SectionOpts = { dry_run: true, log };

  console.log("\n=== Hardware pack smoke — drug-eluting stent (implant) ===");
  const sections = await runHardwarePack(sources, opts, log, true);

  const byKey = new Map(sections.map((s) => [s.section_key, s]));
  const presentKeys = sections.map((s) => s.section_key);
  console.log(`\n  sections rendered: ${sections.length}`);
  for (const s of sections) {
    console.log(
      `    ${s.section_number.toString().padStart(2, " ")} ${s.section_key.padEnd(32, " ")}` +
        ` strategy=${s.meta.generation_strategy.padEnd(15, " ")}` +
        ` status=${s.completion_status.padEnd(8, " ")}` +
        ` cost=$${(s.meta.llm_cost_usd ?? 0).toFixed(4)}`
    );
  }

  // === Assertions ===
  // 1. §13 biocomp INCLUDED (q9 implant_gt_30d → wizard-explicit)
  assert(
    "§13 biocompatibility included (q9 implant_gt_30d)",
    byKey.has("13_biocompatibility")
  );

  // 2. §14 sterilization INCLUDED (sterile marker yes inferred)
  assert(
    "§14 sterilization included (sterile inferred yes)",
    byKey.has("14_sterilization_validation")
  );

  // 3. §15/16/17/18 always present
  for (const k of [
    "15_stability_data",
    "16_batch_release",
    "17_pmf_attestation",
    "18_qms_attestation",
  ] as const) {
    assert(`${k} always present`, byKey.has(k));
  }

  // 4. §19 NOC included (drug_content=Yes (drug-eluting) trigger fires)
  assert(
    "§19 conditional NOCs included (drug_content trigger)",
    byKey.has("19_conditional_nocs")
  );

  // 5. §4 hardware overlay — deterministic strategy + MD-7 → MD-9 pathway
  const s4 = byKey.get("04_classification_grouping");
  assert("§4 present", s4 !== undefined);
  if (s4) {
    assert(
      "§4 deterministic (hardware overlay used, NOT SaMD LLM path)",
      s4.meta.generation_strategy === "deterministic"
    );
    assert(
      "§4 title = 'Classification & Pathway' (hardware variant)",
      s4.title === "Classification & Pathway",
      s4.title
    );
    assert(
      "§4 mentions MD-7 → MD-9 pathway (Class D stent)",
      /MD-7\s*→\s*MD-9/.test(s4.content),
      s4.content.slice(0, 200)
    );
    assert(
      "§4 surfaces MD-26 / MD-27 pre-permission (q8=no)",
      /MD-26|MD-27/.test(s4.content)
    );
    assert(
      "§4 does NOT use SaMD IMDRF Q1×Q2 framing",
      !/IMDRF.+significance.+situation/i.test(s4.content)
    );
    assert(
      "§4 zero LLM cost (deterministic)",
      (s4.meta.llm_cost_usd ?? 0) === 0
    );
  }

  // 6. No software-gate leak across stub + deterministic content.
  //    Stent has software_in_device='No' inferred — IEC 62304 / ACP / 81001
  //    must not appear in any rendered section. (SaMD §11 V&V isn't run for
  //    hardware persona; §4 hardware overlay also avoids it. Once §6 / §8 /
  //    §11 hardware overlays land Day 5, this guard validates them too.)
  const softwareGateRegex = /\b(IEC\s*62304|ACP|PCCP|IEC\s*81001-5-1)\b/i;
  const leakingSections = sections.filter((s) =>
    softwareGateRegex.test(s.content)
  );
  assert(
    "no software-gate (IEC 62304 / ACP / 81001) leak in any section",
    leakingSections.length === 0,
    leakingSections.map((s) => s.section_key).join(", ")
  );

  // 7. §17 + §18 emit checklist markdown, not prose.
  const s17 = byKey.get("17_pmf_attestation");
  const s18 = byKey.get("18_qms_attestation");
  assert(
    "§17 PMF emits checkbox rows (`- [ ]`)",
    s17 !== undefined && /^- \[ \]/m.test(s17.content)
  );
  assert(
    "§17 PMF has all 11 sub-section headings (6.1 .. 6.11)",
    s17 !== undefined &&
      ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11"].every(
        (id) => s17.content.includes(`## ${id} `)
      )
  );
  assert(
    "§18 QMS emits checkbox rows (`- [ ]`)",
    s18 !== undefined && /^- \[ \]/m.test(s18.content)
  );
  assert(
    "§18 QMS has all 11 sub-section headings (7.1 .. 7.11)",
    s18 !== undefined &&
      ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11"].every(
        (id) => s18.content.includes(`## ${id} `)
      )
  );
  assert(
    "§18 QMS reflects b6_iso_13485_status='in_progress' preface",
    s18 !== undefined && /in progress/i.test(s18.content)
  );

  // 8. §13 / §14 / §19 stubs are clearly marked as Day-5 pending.
  for (const k of [
    "13_biocompatibility",
    "14_sterilization_validation",
    "19_conditional_nocs",
  ] as const) {
    const s = byKey.get(k);
    assert(
      `${k} stubbed for Day-5 (deterministic + pending)`,
      s !== undefined &&
        s.meta.generation_strategy === "deterministic" &&
        s.completion_status === "pending" &&
        /pending/i.test(s.content)
    );
  }

  // 9. Total cost = $0 (no LLM in any section; §1 skipped in dry-run).
  const total = sections.reduce((sum, s) => sum + (s.meta.llm_cost_usd ?? 0), 0);
  assert(`total LLM cost = $0 (got $${total.toFixed(4)})`, total === 0);

  // 10. §1 consolidator skipped in dry-run.
  assert(
    "§1 consolidator absent in dry-run",
    !byKey.has("01_executive_summary")
  );

  // === Report ===
  console.log(`\n=== Assertions ===`);
  let failed = 0;
  for (const c of checks) {
    const mark = c.pass ? "✓" : "✗";
    console.log(`  ${mark} ${c.name}${c.pass ? "" : `\n      detail: ${c.detail ?? ""}`}`);
    if (!c.pass) failed++;
  }
  console.log(`\n  ${failed === 0 ? "ALL PASS ✓" : `${failed} / ${checks.length} FAILED ✗`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("smoke crashed:", err);
  process.exit(1);
});
