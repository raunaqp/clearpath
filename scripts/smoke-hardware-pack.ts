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
  q3: "hcps", // interventional cardiologists
  q8: "no", // novel — no predicate
  q9: "implant_gt_30d",
  b2_use_environment: "surgical", // cath lab (procedural environment)
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

// ────────────────────────────────────────────────────────────────────
// SaMD-leak detector — gate vs mention
// ────────────────────────────────────────────────────────────────────

const SAMD_TERMS = /\b(IEC\s*62304|ACP|PCCP|IEC\s*81001-5-1)\b/i;

/** Sentence-level negation markers that turn a SaMD term into an
 *  explicit "not applicable" / "no" mention. When any of these appear
 *  in the same sentence as the term, the sentence is a MENTION not a
 *  GATE. */
const NEGATION_MARKERS =
  /\b(no|not|non[-\s]?applicable|n[\/_]a|n\.\s?a\.?|without|absence\s+of|does\s+not|do\s+not|isn't|aren't|won't|out\s+of\s+scope|exclud(?:e|ed|es))\b/i;

/** Sentence-level hypothetical/conditional markers — the term is being
 *  raised as a what-if rather than asserted as a requirement. */
const HYPOTHETICAL_MARKERS =
  /\b(if|when|should|would|future|in\s+the\s+event|conditional\s+on|hypothetic|may\s+apply|might\s+apply)\b/i;

/** Sentence-level gate markers — words that turn a SaMD-term mention
 *  into an assertion that the term IS a regulatory requirement. */
const GATE_MARKERS =
  /\b(required|mandatory|shall|must|is\s+filed|is\s+to\s+be\s+filed|are\s+filed|are\s+to\s+be\s+filed|filed\s+alongside|expected\s+to\s+be\s+filed|need(?:s|ed)?\s+to\s+file|developed\s+per|established\s+per|comply\s+with|compliance\s+with|in\s+accordance\s+with|conform(?:ance|ed)?\s+to|certif(?:y|ied|ication)\s+(?:to|against))\b/i;

/** Sentence-level scan for SaMD-gate LEAKS. Returns the sentences that
 *  represent a leak (regulatory assertion of a SaMD-only requirement on
 *  a hardware pack). Sentences that explicitly disclaim applicability
 *  or that frame the term as hypothetical are NOT counted as leaks.
 *
 *  Splitting heuristic: terminator punctuation (. ! ?) or hard line
 *  breaks (newline followed by bullet/heading). Doesn't try to be
 *  linguistically perfect — false positives are addressable by
 *  founder review; false negatives would be the actual leak. */
export function detectSamdGateLeak(content: string): string[] {
  const sentences = content.split(/(?<=[.!?])\s+|\n+(?=[*\-#]|\s*\n)/);
  const leaks: string[] = [];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!SAMD_TERMS.test(sentence)) continue;
    if (NEGATION_MARKERS.test(sentence)) continue;
    if (HYPOTHETICAL_MARKERS.test(sentence)) continue;
    if (GATE_MARKERS.test(sentence)) leaks.push(sentence);
  }
  return leaks;
}

/** Inline unit tests for detectSamdGateLeak — run before any smoke
 *  assertions land. If these fail, the regex is mis-tuned and would
 *  produce false positives or false negatives across the pack. */
function runSamdLeakDetectorTests(): void {
  const cases: Array<{ name: string; input: string; expectLeak: boolean }> = [
    {
      // The current §9 EP-SW dump — correct N/A output for a no-software
      // device. Must PASS (no leak detected).
      name: "current §9 EP-SW n/a phrasing → not a leak",
      input:
        "n_a, no IEC 62304 software development lifecycle documentation or IEC 81001-5-1 health software security controls are required.",
      expectLeak: false,
    },
    {
      // Synthetic gate from a SaMD §8 leak — what we DO want to catch.
      // Must FAIL (leak detected).
      name: "synthetic gate 'IEC 62304 software lifecycle is required' → IS a leak",
      input: "IEC 62304 software lifecycle is required for this device.",
      expectLeak: true,
    },
    // Additional supporting cases — internal sanity, not founder-named.
    {
      name: "hypothetical 'if future adds software, IEC 62304 would apply' → not a leak",
      input:
        "If a future iteration adds embedded software, IEC 62304 would apply.",
      expectLeak: false,
    },
    {
      name: "gate 'ACP must be filed alongside MD-7' → IS a leak",
      input: "An ACP must be filed alongside MD-7.",
      expectLeak: true,
    },
    {
      name: "negation 'IEC 81001-5-1 not applicable' → not a leak",
      input:
        "IEC 81001-5-1 health-software security controls are not applicable to this device.",
      expectLeak: false,
    },
  ];
  for (const c of cases) {
    const leaks = detectSamdGateLeak(c.input);
    const detected = leaks.length > 0;
    const pass = detected === c.expectLeak;
    console.log(
      `  ${pass ? "✓" : "✗"} [detector test] ${c.name} — ${
        pass ? "ok" : `expected leak=${c.expectLeak}, got ${detected}`
      }`
    );
    if (!pass) {
      console.error(
        `[detector test FAIL] ${c.name}\n    input: ${c.input}\n    leaks: ${JSON.stringify(leaks)}`
      );
      process.exit(2);
    }
  }
}

async function main(): Promise<void> {
  // Gate everything else on the SaMD-leak detector unit tests passing.
  // If the detector is mis-tuned, the §8/§9 leak gate is unreliable —
  // worth catching before any LLM cost is spent.
  console.log("\n=== SaMD-leak detector unit tests ===");
  runSamdLeakDetectorTests();
  console.log("  (detector tests pass)");

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

  // 5b. §3 hardware overlay — strips SaMD framing (IMDRF / Q1×Q2 /
  //     AI/ML autonomous-diagnosis disclaimer / ACP). Grounds in Q9
  //     body-contact + Q8 predicate.
  const s3 = byKey.get("03_intended_use");
  assert("§3 intended use present", s3 !== undefined);
  if (s3) {
    // SaMD-framing leak: explicit phrases that gave the SaMD path away.
    assert(
      "§3 does NOT use IMDRF SaMD significance dimension language",
      !/IMDRF\s+SaMD\s+significance|significance\s+dimension/i.test(s3.content)
    );
    assert(
      "§3 does NOT reference Q1×Q2 matrix or 'decision influence' framing",
      !/Q1.{0,5}Q2|decision[\s-]influence|significance\s*×\s*situation/i.test(s3.content)
    );
    assert(
      "§3 does NOT carry the AI/ML autonomous-diagnosis disclaimer",
      !/autonomous\s+diagnosis|clinician\s+remains\s+the\s+(?:responsible\s+)?decision-?maker/i.test(s3.content)
    );
    assert(
      "§3 does NOT reference Algorithm Change Protocol (ACP / PCCP)",
      !/Algorithm\s+Change\s+Protocol|\bACP\b|\bPCCP\b/i.test(s3.content)
    );
    // Hardware-specific framing: Q9 body-contact section + Q8 predicate
    assert(
      "§3 emits a 'Body-contact tier' section grounded in Q9",
      /##\s+Body-contact\s+tier/i.test(s3.content) &&
        /implant\s*—\s*tissue\/bone/i.test(s3.content)
    );
    assert(
      "§3 emits a 'Predicate basis' section grounded in Q8",
      /##\s+Predicate\s+basis/i.test(s3.content) &&
        /novel|No\s+predicate\s+device/i.test(s3.content)
    );
    // MD-26 / MD-27 callout (q8=no)
    assert(
      "§3 surfaces MD-26 / MD-27 pre-permission (q8=no novel)",
      /MD-26|MD-27/.test(s3.content)
    );
    // Cross-references to other hardware sections
    assert(
      "§3 cross-references §13 (biocompatibility from Q9)",
      /§13/.test(s3.content)
    );
    // Schedule-citation hallucination guard. Indian regulatory convention
    // writes ordinals in full ("Fifth Schedule"), never Roman ("Schedule V").
    // This guard catches the §3 hallucination we shipped previously
    // ("Schedule III of MDR 2017") and any equivalent Roman-numeral form.
    assert(
      "§3 does NOT cite MDR Schedules in Roman-numeral form (anti-hallucination)",
      !/\bSchedule\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(s3.content)
    );
  }

  // 5c. §8 Design & Manufacturing hardware overlay
  //     - §8.12 medicinal-substances sub-block PRESENT (stent triggers
  //       drug_content)
  //     - NO software-lifecycle prose (SDLC / IEC 62304 / release
  //       engineering / version control) — §11 V&V handles software_vv
  //     - NO sterilization prose duplicated inline (§14 owns it)
  //     - NO QMS 11-sub-row enumeration (§18 owns it)
  //     - Cross-references to §13 / §14 / §16 / §18 / §10
  const s8 = byKey.get("08_design_manufacturing");
  assert("§8 design & manufacturing present", s8 !== undefined);
  if (s8) {
    // §8.12 sub-block fires for drug-eluting stent
    assert(
      "§8 emits the §8.12 medicinal-substances sub-block (drug_content trigger)",
      /##\s+§8\.12\s+Medicinal\s+substances/i.test(s8.content)
    );
    assert(
      "§8.12 sub-block includes combination-product attestation rows",
      /Combination-product\s+dossier\s+attestation/i.test(s8.content) &&
        /Drug\s+substance\s+characterised/i.test(s8.content) &&
        /Leachables.*§13/i.test(s8.content) &&
        /DCG\(I\).*§19/i.test(s8.content)
    );
    // BOM section present, hardware-shaped
    assert(
      "§8 emits a BOM & materials selection section",
      /##\s+Bill\s+of\s+materials/i.test(s8.content)
    );
    // No software-lifecycle prose. The shared gate-vs-mention detector
    // catches gates; here we add a stricter test that §8 specifically
    // doesn't have a section heading naming the SaMD constructs.
    assert(
      "§8 has NO 'Software development lifecycle' heading",
      !/##\s+Software\s+development\s+lifecycle/i.test(s8.content)
    );
    assert(
      "§8 has NO 'Algorithm Change Protocol' heading",
      !/##\s+Algorithm\s+Change\s+Protocol/i.test(s8.content)
    );
    // No inline sterilization prose; cross-references §14 instead
    assert(
      "§8 has NO 'Sterilization validation' section heading (§14 owns it)",
      !/##\s+Sterilization\s+validation/i.test(s8.content) &&
        /§14/.test(s8.content)
    );
    // Cross-references the surrounding hardware sections
    assert(
      "§8 cross-references §13 / §14 / §16 / §18",
      ["§13", "§14", "§16", "§18"].every((ref) => s8.content.includes(ref))
    );
    // Anti-hallucination guard inherited from §3
    assert(
      "§8 does NOT cite MDR Schedules in Roman-numeral form (anti-hallucination)",
      !/\bSchedule\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(s8.content)
    );
  }

  // 5d. §6 Predicate Comparison hardware overlay
  //     Stent profile: Q8=no (novel) → novel-device path
  //     - MD-26 / MD-27 callout PRESENT
  //     - NO SaMD framing (no 510(k), no IMDRF, no AI/ML predicate)
  //     - NO 'Reviewer Concierge' platform-marketing leak
  //     - Cross-references §4 (pathway) + §12 (clinical evidence,
  //       because no-predicate makes CI effectively mandatory)
  const s6 = byKey.get("06_predicate_comparison");
  assert("§6 predicate comparison present", s6 !== undefined);
  if (s6) {
    // Novel path content
    assert(
      "§6 emits no-predicate declaration (Q8=no)",
      /No-predicate\s+declaration/i.test(s6.content) ||
        /No\s+predicate\s+device.*novel/i.test(s6.content)
    );
    assert(
      "§6 surfaces MD-26 / MD-27 pre-permission callout",
      /MD-26.*MD-27|MD-26\s*→\s*MD-27/i.test(s6.content)
    );
    assert(
      "§6 has a 'Clinical-evidence implication' section (no-predicate → effectively-mandatory CI)",
      /Clinical-evidence\s+implication/i.test(s6.content)
    );
    // Cross-references
    assert(
      "§6 cross-references §4 (pathway)",
      /§4/.test(s6.content)
    );
    assert(
      "§6 cross-references §12 (clinical evidence)",
      /§12/.test(s6.content)
    );
    // SaMD-leak guards
    assert(
      "§6 does NOT use SaMD 510(k) framing",
      !/510\s*\(\s*k\s*\)/i.test(s6.content)
    );
    assert(
      "§6 does NOT use IMDRF / SaMD significance framing",
      !/IMDRF|significance\s+dimension|SaMD\s+Draft/i.test(s6.content)
    );
    // Reviewer Concierge platform-marketing leak guard
    assert(
      "§6 does NOT carry 'Reviewer Concierge' platform-marketing language",
      !/Reviewer\s+Concierge/i.test(s6.content)
    );
    // Anti-hallucination
    assert(
      "§6 does NOT cite MDR Schedules in Roman-numeral form",
      !/\bSchedule\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(s6.content)
    );
  }

  // 5e. §11 V&V hardware overlay — software_vv suppression case
  //     Stent profile: software_in_device marker = No status=estimated
  //     → §8.15 software V&V sub-block code-gated OUT (calibrated
  //     trigger via shouldIncludeSubBlock). Bench V&V content present.
  const s11 = byKey.get("11_verification_validation");
  assert("§11 V&V present", s11 !== undefined);
  if (s11) {
    // Code-level gating: meta source_fields carries the gate decision
    assert(
      "§11 §8.15 software_vv gate is CODE-set to excluded (not text-absence)",
      s11.meta.source_fields.includes("_software_vv_gate:excluded")
    );
    // Sub-block heading must not appear in rendered output
    assert(
      "§11 §8.15 software V&V sub-block ABSENT (not 'Section §8.15: N/A')",
      !/##\s+§8\.15\s+Software\s+V&V/i.test(s11.content)
    );
    assert(
      "§11 has NO software-V&V attestation rows (suppression case)",
      !/Software\s+safety\s+classification/i.test(s11.content) &&
        !/Software\s+unit\s+V&V\s+records/i.test(s11.content)
    );
    // Bench V&V content present — verification protocol + design-input
    // traceability + test programme structure
    assert(
      "§11 emits 'Verification protocol' section (hardware bench V&V)",
      /##\s+Verification\s+protocol/i.test(s11.content)
    );
    assert(
      "§11 emits 'Design-input traceability' section",
      /##\s+Design-input\s+traceability/i.test(s11.content)
    );
    assert(
      "§11 emits 'Test programme' section",
      /##\s+Test\s+programme/i.test(s11.content)
    );
    // Cross-references to §13 (biocomp) + §15 (stability)
    assert(
      "§11 cross-references §13 (biocompatibility)",
      /§13/.test(s11.content)
    );
    assert(
      "§11 cross-references §15 (stability)",
      /§15/.test(s11.content)
    );
    assert(
      "§11 cross-references §14 (sterilization)",
      /§14/.test(s11.content)
    );
    assert(
      "§11 cross-references §10 (risk management)",
      /§10/.test(s11.content)
    );
    // No SaMD framing
    assert(
      "§11 does NOT use SaMD framing (IMDRF / Q1×Q2 / SaMD Draft / ACP)",
      !/IMDRF|Q1.{0,5}Q2|SaMD\s+Draft|Algorithm\s+Change\s+Protocol/i.test(
        s11.content
      )
    );
    // Anti-hallucination
    assert(
      "§11 does NOT cite MDR Schedules in Roman-numeral form",
      !/\bSchedule\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(s11.content)
    );
  }

  // 5f. §12 Clinical Evidence + §8.16 animal preclinical sub-block
  //     Stent profile: Q9=implant_gt_30d + drug_content trigger →
  //     §8.16 sub-block code-gated INCLUDED.
  //     Q8=no (novel) → MD-22/MD-23 clinical-investigation pathway
  //     section emitted.
  const s12 = byKey.get("12_clinical_evidence_pms");
  assert("§12 clinical evidence present", s12 !== undefined);
  if (s12) {
    // Code-level gating: meta source_fields carries the gate decision
    assert(
      "§12 §8.16 animal preclinical gate is CODE-set to included (Q9 implant + drug)",
      s12.meta.source_fields.includes("_animal_preclinical_gate:included")
    );
    // §8.16 sub-block content present
    assert(
      "§12 emits §8.16 animal preclinical sub-block heading",
      /##\s+§8\.16\s+Animal\s+preclinical/i.test(s12.content)
    );
    assert(
      "§12 animal preclinical sub-block has attestation rows",
      /GLP-compliant\s+animal\s+study/i.test(s12.content) &&
        /Implant-model.*species/i.test(s12.content) &&
        /Chronic\s+histopathology/i.test(s12.content)
    );
    // Class D + novel framing: MD-22 / MD-23 pathway present
    assert(
      "§12 emits MD-22 / MD-23 clinical-investigation pathway section (Q8=novel)",
      /MD-22.*MD-23|MD-22\s*→\s*MD-23/i.test(s12.content) &&
        /CTRI/i.test(s12.content)
    );
    assert(
      "§12 references EC approval (ICMR ethics)",
      /EC\s+approval|ethics\s+committee|Ethics\s+Committee/i.test(s12.content)
    );
    // Cross-references
    assert(
      "§12 cross-references §6 (predicate basis drives clinical-evidence expectation)",
      /§6/.test(s12.content)
    );
    assert(
      "§12 cross-references §13 (biocompatibility / chronic toxicity)",
      /§13/.test(s12.content)
    );
    assert(
      "§12 cross-references §10 (risk management)",
      /§10/.test(s12.content)
    );
    assert(
      "§12 cross-references §3 (intended population)",
      /§3/.test(s12.content)
    );
    // PMS framework — MD-42 / MD-43 / Form-25 forms cited
    assert(
      "§12 cites MD-42 / MD-43 / Form-25 vigilance forms",
      /MD-42/.test(s12.content) &&
        /MD-43/.test(s12.content) &&
        /Form-25/.test(s12.content)
    );
    // No SaMD clinical framing
    assert(
      "§12 does NOT use SaMD clinical-evidence framing (ACP / drift / algorithm-validation)",
      !/Algorithm\s+Change\s+Protocol|ACP\s+retraining|drift[\s-]monitoring|drift[\s-]detection|algorithm\s+validation/i.test(
        s12.content
      )
    );
    // Reviewer Concierge platform-marketing leak guard
    assert(
      "§12 does NOT carry 'Reviewer Concierge' platform-marketing language",
      !/Reviewer\s+Concierge/i.test(s12.content)
    );
    // Anti-hallucination
    assert(
      "§12 does NOT cite MDR Schedules in Roman-numeral form",
      !/\bSchedule\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(s12.content)
    );
  }

  // 6. SaMD software-gate leak detection — distinguishes GATES from
  //    MENTIONS. A leak is when a section says "IEC 62304 required" /
  //    "must be filed" / "shall be developed per" — a regulatory
  //    requirement statement. A correct mention is "no IEC 62304
  //    required" / "IEC 62304 not applicable" / "if a future iteration
  //    adds software, IEC 62304 would apply" — explicitly disclaiming
  //    applicability or framing as hypothetical.
  //
  //    Stent has software_in_device='No' inferred. §9 EP-SW row
  //    correctly states "n_a, no IEC 62304 software development
  //    lifecycle documentation or IEC 81001-5-1 health software
  //    security controls are required." — that's GOOD output and must
  //    not trip the assertion. SaMD §8 generator running on hardware
  //    data may emit "IEC 62304 documentation is filed alongside…" —
  //    that IS the leak.
  const samdLeaks = sections.flatMap((s) =>
    detectSamdGateLeak(s.content).map((leak) => ({
      section_key: s.section_key,
      sentence: leak,
    }))
  );
  assert(
    "no software-gate LEAKS (gates only — explicit 'n/a' / hypothetical mentions are correct output)",
    samdLeaks.length === 0,
    samdLeaks
      .map((l) => `${l.section_key}: ${l.sentence.slice(0, 120)}`)
      .join(" || ")
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
