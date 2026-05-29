/**
 * Hardware Submission Pack smoke harness (drug-eluting stent case).
 *
 * Day-4 first cut: deterministic generators + §13/§14/§19 stubs.
 * Day-5 morning: §13 Biocompatibility (hybrid — deterministic tier
 * matrix + Sonnet narrative); §14, §19 land as real generators next.
 *
 * Cost notes:
 *   - §13 runs Sonnet — ~$0.02 per smoke run.
 *   - §15/§16/§17/§18 are deterministic — $0.
 *   - §14, §19 stubbed today — $0.
 *   - §1 Opus consolidator skipped in dry-run — $0.
 * Expected total per run: ~$0.02.
 *
 * Run: pnpm tsx scripts/smoke-hardware-pack.ts [--dump <path>]
 *   --dump <path>  Write §13 content + the full per-section breakdown
 *                  to a markdown file so the founder can eyeball it
 *                  before §14 work begins.
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
  // Load .env.local so ANTHROPIC_API_KEY is available for §13's Sonnet
  // narrative call. Skip when running offline (the deterministic
  // skeleton fallback will fire).
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^"|"$/g, "");
      }
    }
  }

  const argv = process.argv.slice(2);
  const dumpIdx = argv.indexOf("--dump");
  const dumpPath =
    dumpIdx >= 0 && argv[dumpIdx + 1] ? argv[dumpIdx + 1] : null;

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

  // 8. §13 — Day 5 morning real generator (hybrid).
  //    Stent profile: q9=implant_gt_30d + drug_content="Yes (drug-eluting)"
  //    + one-liner mentions "bioresorbable" → implant tier + drug-eluting
  //    + bioresorbable add-ons all fire.
  const s13 = byKey.get("13_biocompatibility");
  assert("§13 biocomp present", s13 !== undefined);
  if (s13) {
    assert(
      "§13 generation_strategy = llm_synthesized (hybrid: deterministic panel + Sonnet narrative)",
      s13.meta.generation_strategy === "llm_synthesized"
    );
    // Panel coverage — deterministic. These rows must appear regardless
    // of the LLM narrative succeeding or failing. Wrong-panel selection
    // is the regulator-catchable content error the editor can't fix.
    const panelMustHave: Array<[string, string]> = [
      ["ISO 10993-5", "cytotoxicity baseline"],
      ["ISO 10993-10", "skin sensitization"],
      ["ISO 10993-23", "irritation"],
      ["ISO 10993-6", "local effects after implantation (implant signal)"],
      ["ISO 10993-11", "systemic toxicity (chronic implant)"],
      ["ISO 10993-3", "genotoxicity / carcinogenicity (long-term contact)"],
      ["ISO 10993-18", "chemical characterization (leachables)"],
      ["ISO 10993-17", "allowable limits (drug-eluting requires)"],
      ["ISO 10993-16", "toxicokinetic study (drug-eluting + bioresorbable)"],
      ["ISO 10993-9", "degradation framework (bioresorbable signal)"],
      ["ISO 10993-13", "polymeric degradation (bioresorbable signal)"],
    ];
    for (const [part, why] of panelMustHave) {
      assert(
        `§13 panel includes ${part} — ${why}`,
        s13.content.includes(part)
      );
    }
    // Add-on section headings
    assert(
      "§13 has 'Drug-eluting overlay' heading (drug_content trigger fired)",
      /##\s+Drug-eluting overlay/.test(s13.content)
    );
    assert(
      "§13 has 'Bioresorbable overlay' heading (one-liner bioresorbable keyword)",
      /##\s+Bioresorbable overlay/.test(s13.content)
    );
    // Cross-references the founder will read
    assert(
      "§13 references NABL-accredited lab evidence",
      /NABL/i.test(s13.content)
    );
    assert(
      "§13 cross-references §8.12 medicinal substances + §19 DCG(I)",
      /§8\.12|§19/.test(s13.content) || /DCG\(I\)/i.test(s13.content)
    );
    // SaMD-framing leak guard — §13 is hardware-only; no IMDRF / Q1×Q2 /
    // SaMD draft framing should appear.
    assert(
      "§13 does NOT use SaMD framing (IMDRF / Q1×Q2 / SaMD Draft)",
      !/IMDRF|Q1.{0,5}Q2|SaMD\s+Draft/i.test(s13.content)
    );
  }

  // 9. §14 Sterilization — Day-5 morning real generator (hybrid).
  //    Stent profile: sterile marker present + drug-eluting + bioresorbable.
  //    All four method blocks must surface (founder picks); method-
  //    selection guidance for drug-eluting + bioresorbable triggers.
  const s14 = byKey.get("14_sterilization_validation");
  assert("§14 sterilization present", s14 !== undefined);
  if (s14) {
    assert(
      "§14 generation_strategy = llm_synthesized (hybrid)",
      s14.meta.generation_strategy === "llm_synthesized"
    );
    // All four method blocks rendered (deterministic — the blast-radius
    // safe path when method signal is absent)
    for (const method of [
      "Ethylene oxide (EtO)",
      "Radiation (gamma / e-beam / X-ray)",
      "Steam / moist heat (autoclave)",
      "Aseptic processing",
    ] as const) {
      assert(
        `§14 emits ${method} method block`,
        s14.content.includes(method)
      );
    }
    // Primary standards cited
    for (const std of ["ISO 11135", "ISO 11137", "ISO 17665", "ISO 13408"] as const) {
      assert(`§14 cites ${std}`, s14.content.includes(std));
    }
    // Cross-cutting: ISO 11737 (bioburden + validation sterility) +
    // ISO 11607 (sterile barrier) + 10993-7 (EtO residuals)
    for (const std of ["ISO 11737", "ISO 11607", "ISO 10993-7"] as const) {
      assert(`§14 cites cross-cutting ${std}`, s14.content.includes(std));
    }
    // Drug-eluting + bioresorbable method-selection guidance section
    assert(
      "§14 surfaces method-selection guidance for drug-eluting + bioresorbable triggers",
      /Method-selection guidance for this device/.test(s14.content)
    );
    // Sequencing with §13 (leachables-profile change)
    assert(
      "§14 references the sterilization-changes-leachables sequencing with §13",
      /leachables/i.test(s14.content) && /§13/.test(s14.content)
    );
    // SaMD-framing leak guard
    assert(
      "§14 does NOT use SaMD framing (IMDRF / Q1×Q2 / SaMD Draft)",
      !/IMDRF|Q1.{0,5}Q2|SaMD\s+Draft/i.test(s14.content)
    );
    // NABL-accredited lab reference
    assert(
      "§14 references NABL-accredited validation evidence",
      /NABL/i.test(s14.content)
    );
  }

  // §19 Conditional NOCs — Day-5 morning real generator (hybrid).
  //    Stent profile: only drug_content trigger fires → ONLY DCG(I)
  //    sub-block emitted; DAHD / BARC / PNDT cleanly suppressed.
  const s19 = byKey.get("19_conditional_nocs");
  assert("§19 conditional NOCs present", s19 !== undefined);
  if (s19) {
    assert(
      "§19 generation_strategy = llm_synthesized (hybrid)",
      s19.meta.generation_strategy === "llm_synthesized"
    );
    // DCG(I) MUST be emitted for the drug-eluting stent.
    assert(
      "§19 emits DCG(I) joint review block (drug_content trigger)",
      /DCG\(I\)\s+joint\s+review/i.test(s19.content)
    );
    // The other three NOCs MUST be cleanly suppressed for this profile.
    assert(
      "§19 does NOT emit DAHD NOC block (no veterinary trigger)",
      !/##\s+DAHD\s+NOC/i.test(s19.content)
    );
    assert(
      "§19 does NOT emit BARC + AERB block (no ionising-radiation trigger)",
      !/##\s+BARC\s+NOC\s*\+\s*AERB/i.test(s19.content) &&
        !/##\s+.*\bBARC\b/i.test(s19.content.replace(/^# §19.*/m, ""))
    );
    assert(
      "§19 does NOT emit PNDT NOC block (no PNDT trigger)",
      !/##\s+PNDT\s+NOC/i.test(s19.content) &&
        !/PCPNDT\s+Act\s+compliance/i.test(s19.content)
    );
    // DCG(I) sub-block has its standard sub-headings
    assert(
      "§19 DCG(I) block has 'Evidence package' attestation rows",
      /###\s+Evidence package/i.test(s19.content) &&
        /^- \[ \]/m.test(s19.content)
    );
    assert(
      "§19 DCG(I) block has 'Timeline placement' sub-heading",
      /###\s+Timeline placement/i.test(s19.content)
    );
    // Cross-references for fired NOC
    assert(
      "§19 cross-references §8.12 medicinal substances + §13 ISO 10993-17",
      /§8.*?medicinal\s+substances/i.test(s19.content) &&
        /§13.*?10993-17/i.test(s19.content)
    );
    // Sequencing section
    assert(
      "§19 sequencing section present",
      /##\s+Sequencing notes/i.test(s19.content)
    );
    // Drugs and Cosmetics Act citation
    assert(
      "§19 cites Drugs and Cosmetics Act 1940",
      /Drugs\s+and\s+Cosmetics\s+Act\s+1940/.test(s19.content)
    );
    // SaMD-leak guard
    assert(
      "§19 does NOT use SaMD framing (IMDRF / Q1×Q2 / SaMD Draft)",
      !/IMDRF|Q1.{0,5}Q2|SaMD\s+Draft/i.test(s19.content)
    );
  }

  // 10. Total cost — SaMD §2–§12 generators each run Sonnet
  //     (~$0.02 each) PLUS §13 narrative Sonnet (~$0.02). Once Day-5
  //     afternoon overlays land for §6/§8/§11/§12, the cost drops as
  //     overlay branches choose deterministic paths where applicable.
  //     Cap loose enough to absorb Sonnet variance.
  const total = sections.reduce((sum, s) => sum + (s.meta.llm_cost_usd ?? 0), 0);
  assert(
    `total LLM cost reasonable (got $${total.toFixed(4)}; expect ~$0.20-$0.30 today, cap at $0.40)`,
    total >= 0 && total < 0.4
  );

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

  // === Optional dump for founder eyeball ===
  if (dumpPath) {
    const lines: string[] = [
      `# Hardware pack smoke output — ${stent.id} (${stent.card.meta.product_name})`,
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      `One-liner: ${sources.intake.one_liner}`,
      "",
      `Q8 predicate: ${STENT_WIZARD.q8}`,
      `Q9 patient_contact: ${STENT_WIZARD.q9}`,
      `B6 ISO 13485 status: ${STENT_WIZARD.b6_iso_13485_status}`,
      "",
      `Sections rendered: ${sections.length}`,
      `Total LLM cost: $${sections.reduce((s, x) => s + (x.meta.llm_cost_usd ?? 0), 0).toFixed(4)}`,
      `Assertions: ${checks.length - failed} pass / ${failed} fail`,
      "",
      "---",
      "",
    ];
    for (const s of sections) {
      lines.push(
        `# §${s.section_number} ${s.title}`,
        "",
        `_strategy: ${s.meta.generation_strategy} · status: ${s.completion_status} · cost: $${(s.meta.llm_cost_usd ?? 0).toFixed(4)}${s.meta.error_message ? ` · ERROR: ${s.meta.error_message.replace(/\n/g, " ")}` : ""}_`,
        "",
        s.content,
        "",
        "---",
        "",
      );
    }
    fs.writeFileSync(dumpPath, lines.join("\n"));
    console.log(`\n  Eyeball dump written to ${dumpPath}`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("smoke crashed:", err);
  process.exit(1);
});
