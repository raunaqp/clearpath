/**
 * Section 6 — Predicate Device Comparison.
 *
 * Maps to: DMF §8.5 Substantial equivalence with reference to the predicate.
 *
 * SaMD path (Sprint 2 default): gates on Tier B B3 predicate list + the
 * b3_no_predicate flag; emits substantial-equivalence narrative or novel-
 * device declaration; may include 510(k) / FDA framing for foreign-
 * predicate cases; recommends Reviewer Concierge product (ClearPath
 * Tier 3) for novel cases.
 *
 * Hardware path (Sprint 3 Day 5 afternoon): gates on wizard-explicit Q8
 * predicate (`yes_indian` / `yes_only_foreign` / `no` / `not_sure`), with
 * B3 used only as supplemental detail when also present. Strips the
 * Reviewer-Concierge product copy (it doesn't belong in CDSCO submission
 * content). Adds an explicit clinical-evidence implication paragraph
 * tying no-predicate → effectively-mandatory §12 work. Uses the verified
 * MDR-2017 citation block.
 *
 * Dispatch is by `wizard_answers.persona`. SaMD path unchanged.
 */

import { z } from "zod";
import {
  SHARED_SECTION_SYSTEM_PROMPT,
  SECTION_MODEL,
  callLlm,
  parseStrictJson,
} from "./prompts";
import type {
  SectionGenerator,
  SectionOpts,
  SectionOutput,
  SourceData,
} from "./types";
import { sectionNumberFromKey } from "./types";
import { softenCertainty } from "@/lib/engine/soften-certainty";
import { MDR_2017_VERIFIED_CITATIONS_BLOCK } from "./mdr-2017-citations";

const SECTION_KEY = "06_predicate_comparison" as const;
const TITLE = "Predicate Device Comparison";
const MAX_TOKENS = 1800;

// Two output schemas depending on path.
const HasPredicateSchema = z.object({
  substantial_equivalence_summary: z.string().min(80).max(2500),
  differences_explanation: z.string().min(100).max(2500),
});
const NovelSchema = z.object({
  novel_device_declaration: z.string().min(80).max(1500),
  md27_pathway_note: z.string().min(60).max(1500),
});
type HasPredicateOutput = z.infer<typeof HasPredicateSchema>;
type NovelOutput = z.infer<typeof NovelSchema>;

function hasPredicate(sources: SourceData): boolean {
  const wa = sources.wizard_answers;
  if (wa.b3_no_predicate === true) return false;
  const list = wa.b3_predicate_devices ?? [];
  return list.some((p) => p.device_name.trim().length > 0);
}

function buildHasPredicateMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const predicates = (wa.b3_predicate_devices ?? []).filter(
    (p) => p.device_name.trim().length > 0
  );

  return [
    "Generate Section 6 (Predicate Device Comparison) — substantial-equivalence narrative — for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with the predicate(s) and what they share with the subject device. Cite MDR 2017 §32 once when the equivalence basis is invoked — not as the opening clause.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Device class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    "",
    "## Predicate devices (applicant-declared, Tier B B3):",
    ...predicates.map(
      (p, i) =>
        `  ${i + 1}. ${p.device_name}${p.manufacturer ? ` (${p.manufacturer})` : ""}${p.rationale ? ` — ${p.rationale}` : ""}`
    ),
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    '  "substantial_equivalence_summary": "80-250 words. Synthesise the equivalence basis comparing the subject device to the declared predicate(s). Cover: intended_use, device_class, technology, materials/architecture, performance, indications. Where the predicate is foreign (e.g., FDA 510(k)-cleared device with non-Indian manufacturer), acknowledge that CDSCO accepts foreign predicates per MDR 2017 §32 alongside in-India clinical performance evaluation where applicable.",',
    '  "differences_explanation": "100-280 words. Document material differences between the subject device and the predicate(s) and explain why they do not affect safety/effectiveness equivalence. For AI/ML devices where the predicate is non-AI, devote a sub-paragraph to algorithm-specific differences (training data, validation methodology, drift behaviour) and how Section 9 — Essential Principles handles them."',
    "}",
    "```",
    card.classification.cdsco_class === "D"
      ? "Note: Class D — heightened scrutiny. differences_explanation should be ≥ 150 words and cover ALL six axes (intended_use, class, technology, materials, performance, indications) explicitly."
      : "",
    card.classification.ai_ml_flag &&
    !predicates.some((p) =>
      (p.rationale ?? "").toLowerCase().includes("ai")
    )
      ? "Note: subject device is AI/ML; predicate appears non-AI. Address algorithm-specific equivalence explicitly."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildNovelMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  return [
    "Generate Section 6 (Predicate Device Comparison) — novel-device declaration — for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: state plainly that no Indian predicate is claimed and what that means for the pathway. Practical tone — this is the section that triggers the MD-26/MD-27 pre-permission requirement, treat it that way.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Device class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `Predicate status: b3_no_predicate = true (or empty predicate list)`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    '  "novel_device_declaration": "80-150 words. State plainly that no predicate device is claimed. Frame the device as first-in-class for its intended use within Indian regulatory scope. Acknowledge the implication: clinical evidence (Section 12) effectively becomes mandatory at the heightened scrutiny applied to no-predicate Class C/D devices.",',
    '  "md27_pathway_note": "60-150 words. Document the MD-26 → MD-27 pre-permission pathway: applicant files MD-26 for novel-device permission BEFORE the MD-7 manufacturing licence application; CDSCO grants on MD-27. Cite MDR 2017 Form MD-26 / MD-27 references. Recommend the Reviewer Concierge tier for guided dual-pathway sequencing."',
    "}",
    "```",
  ].join("\n");
}

function formatHasPredicate(args: {
  llm: HasPredicateOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const wa = sources.wizard_answers;
  const predicates = (wa.b3_predicate_devices ?? []).filter(
    (p) => p.device_name.trim().length > 0
  );

  const lines: string[] = [];
  lines.push("## Predicate devices (applicant-declared)");
  lines.push("");
  lines.push("| # | Device name | Manufacturer | Rationale |");
  lines.push("|---|---|---|---|");
  predicates.forEach((p, i) =>
    lines.push(
      `| ${i + 1} | ${p.device_name} | ${p.manufacturer ?? "[TBD]"} | ${p.rationale ?? "[TBD]"} |`
    )
  );
  lines.push("");

  lines.push("## Substantial equivalence summary");
  lines.push("");
  lines.push(llm.substantial_equivalence_summary);
  lines.push("");

  lines.push("## Material differences");
  lines.push("");
  lines.push(llm.differences_explanation);
  lines.push("");

  lines.push("## Pathway implication");
  lines.push("");
  lines.push(
    `With at least one declared predicate, the substantial-equivalence basis is sufficient for a direct MD-${sources.readiness_card.classification.cdsco_class === "A" || sources.readiness_card.classification.cdsco_class === "B" ? "3" : "7"} manufacturing licence application path. Cross-reference: Section 4 — Classification & Grouping.`
  );
  lines.push("");

  return lines.join("\n");
}

function formatNovel(args: { llm: NovelOutput; sources: SourceData }): string {
  const { llm, sources } = args;
  const lines: string[] = [];
  lines.push("## No-predicate declaration");
  lines.push("");
  lines.push(llm.novel_device_declaration);
  lines.push("");

  lines.push("## MD-26 → MD-27 pre-permission pathway");
  lines.push("");
  lines.push(llm.md27_pathway_note);
  lines.push("");

  lines.push("## Pathway implication");
  lines.push("");
  const cls = sources.readiness_card.classification.cdsco_class;
  lines.push(
    `Per MDR 2017 and based on published CDSCO guidance, the manufacturing licence path becomes MD-26 → MD-27 → MD-${cls === "A" || cls === "B" ? "3" : "7"} → MD-${cls === "A" || cls === "B" ? "5" : "9"}. Cross-reference: Section 1 — Executive Summary (headline pathway note) and Section 12 — Clinical Evidence (clinical-investigation route note where applicable).`
  );
  lines.push("");

  return lines.join("\n");
}

const generateSection06Samd: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "wizard.b3_predicate_devices",
    "wizard.b3_no_predicate",
    "wizard.b1_intended_use_statement",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "intake.one_liner",
  ];

  const path = hasPredicate(sources) ? "has_predicate" : "novel";
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;
  let content = "";
  let citations: SectionOutput["citations"] = [];

  try {
    if (path === "has_predicate") {
      const r = await callLlm({
        assessmentId: sources.assessment_id,
        callLayer: "draft_pack_v2",
        model: SECTION_MODEL,
        userMessage: buildHasPredicateMessage(sources),
        systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
        dryRun: opts.dry_run,
        log: opts.log,
      });
      cost = r.costUsd;
      usage = r.usage;
      const llmOutput = HasPredicateSchema.parse(parseStrictJson(r.rawText));
      content = formatHasPredicate({ llm: llmOutput, sources });
      citations = [
        {
          citation_id: "[1]",
          source_doc: "MDR 2017 — Medical Devices Rules, 2017 §32",
          quote:
            "Substantial equivalence to a predicate device with CDSCO or stringent-authority approval is an acceptable evidence basis.",
          exact_reference: "MDR 2017 §32 (Substantial equivalence)",
        },
        {
          citation_id: "[2]",
          source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.5",
          quote:
            "Substantial equivalence with reference to the predicate device or previous generations shall be documented.",
          exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.5",
        },
      ];
    } else {
      const r = await callLlm({
        assessmentId: sources.assessment_id,
        callLayer: "draft_pack_v2",
        model: SECTION_MODEL,
        userMessage: buildNovelMessage(sources),
        systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
        dryRun: opts.dry_run,
        log: opts.log,
      });
      cost = r.costUsd;
      usage = r.usage;
      const llmOutput = NovelSchema.parse(parseStrictJson(r.rawText));
      content = formatNovel({ llm: llmOutput, sources });
      citations = [
        {
          citation_id: "[1]",
          source_doc: "MDR 2017 — Medical Devices Rules, 2017 (Forms MD-26, MD-27)",
          quote:
            "Novel devices without an Indian predicate require pre-permission on Form MD-26; grant is on Form MD-27 before manufacturing licence application.",
          exact_reference: "MDR 2017 Forms MD-26, MD-27",
        },
      ];
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 6 generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        source_fields: sourceFields,
        model: SECTION_MODEL,
        llm_cost_usd: cost,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: msg,
        usage,
      },
    };
  }

  const wordCount = content.trim().split(/\s+/).length;
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations,
    completion_status: "complete",
    word_count: wordCount,
    meta: {
      generation_strategy: "llm_synthesized",
      source_fields: [...sourceFields, `_path:${path}`],
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};

// ────────────────────────────────────────────────────────────────────
// Hardware variant — Sprint 3 Day 5 afternoon
// ────────────────────────────────────────────────────────────────────

type HardwarePredicatePath =
  | { kind: "novel" }
  | { kind: "has_predicate"; source: "indian" | "foreign_only" }
  | { kind: "uncertain" };

/** Hardware predicate gate uses Q8 (Tier A wizard-explicit). When B3
 *  Tier B predicates are also filled, they enrich the has_predicate
 *  narrative but do not override Q8 = no. */
function hardwarePredicatePath(sources: SourceData): HardwarePredicatePath {
  const q8 = sources.wizard_answers.q8;
  if (q8 === "no") return { kind: "novel" };
  if (q8 === "yes_indian") return { kind: "has_predicate", source: "indian" };
  if (q8 === "yes_only_foreign")
    return { kind: "has_predicate", source: "foreign_only" };
  return { kind: "uncertain" };
}

// Per `feedback-schema-cap-calibration`: §6 narrative fields are
// single-concern (predicate basis vs. novel framing), so 1500 cap.
// Has-predicate equivalence summary is multi-axis → 2000 ceiling.
const HardwareHasPredicateSchema = z.object({
  substantial_equivalence_summary: z.string().min(100).max(2000),
  material_differences: z.string().min(100).max(2000),
});
const HardwareNovelSchema = z.object({
  novel_device_declaration: z.string().min(80).max(1500),
  md26_27_pathway_note: z.string().min(80).max(1500),
  clinical_evidence_implication: z.string().min(80).max(1500),
});
type HardwareHasPredicateOutput = z.infer<typeof HardwareHasPredicateSchema>;
type HardwareNovelOutput = z.infer<typeof HardwareNovelSchema>;

function buildHardwareHasPredicateMessage(args: {
  sources: SourceData;
  source: "indian" | "foreign_only";
}): string {
  const { sources, source } = args;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const predicates = (wa.b3_predicate_devices ?? []).filter(
    (p) => p.device_name.trim().length > 0
  );

  return [
    "Generate Section 6 (Predicate Device Comparison) — substantial-equivalence narrative — for a CDSCO MD-7 / MD-3 hardware Submission Pack.",
    "",
    "This is the HARDWARE persona. DO NOT use:",
    "- US-FDA 510(k) framing as the primary equivalence anchor (CDSCO substantial-equivalence is MDR 2017 §32; 510(k) may be cited only when a foreign predicate's clearance is the source-of-record, never as the equivalence framework itself)",
    "- IMDRF SaMD significance × situation matrix",
    "- AI/ML algorithm-specific equivalence sub-paragraphs (this device is hardware; if a software component exists, §11 V&V handles it)",
    "- ClearPath product names like 'Reviewer Concierge' — those are platform marketing and do not belong in CDSCO submission content",
    "",
    MDR_2017_VERIFIED_CITATIONS_BLOCK,
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Device class: ${card.classification.cdsco_class ?? "[TBD]"}${card.classification.class_qualifier ? ` (qualifier: ${card.classification.class_qualifier})` : ""}`,
    `Q8 predicate (wizard-explicit): ${wa.q8 ?? "(not answered)"}`,
    `Predicate source: ${source === "indian" ? "Indian predicate available" : "Foreign predicate only — no Indian predicate"}`,
    "",
    predicates.length > 0
      ? `## Predicate devices (applicant-declared, Tier B B3):\n${predicates
          .map(
            (p, i) =>
              `  ${i + 1}. ${p.device_name}${p.manufacturer ? ` (${p.manufacturer})` : ""}${p.rationale ? ` — ${p.rationale}` : ""}`
          )
          .join("\n")}`
      : "## Predicate devices: [NEEDS INPUT: Tier B B3 predicate-device list not yet filled — narrative below should flag this gap]",
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "substantial_equivalence_summary": "100-260 words. Synthesise the equivalence basis comparing the subject device to the declared predicate(s) across six axes: intended_use, device_class, technology, materials / architecture, performance, indications. ${source === "foreign_only" ? "Acknowledge that the predicate(s) are foreign — CDSCO accepts foreign predicates per MDR 2017 §32 alongside in-India clinical performance evaluation where applicable. Note that foreign-predicate cases typically attract additional clinical-evidence expectations." : "Indian-predicate equivalence is the primary basis; document the predicate's CDSCO licence reference where available."}",`,
    `  "material_differences": "100-260 words. Document material differences between the subject device and the predicate(s) and explain why each does not affect safety / effectiveness equivalence. Cover the same six axes referenced above. ${card.classification.cdsco_class === "D" ? "Class D — heightened scrutiny applies; address each axis explicitly." : ""}"`,
    "}",
    "```",
    "",
    "Apply softening rules. Do not invent specific predicate details. Use [NEEDS INPUT: ...] for any axis where applicant data is genuinely missing.",
  ].join("\n");
}

function buildHardwareNovelMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  return [
    "Generate Section 6 (Predicate Device Comparison) — novel-device declaration — for a CDSCO MD-7 / MD-3 hardware Submission Pack.",
    "",
    "This is the HARDWARE persona, Q8 wizard-explicit answer is `no` (no predicate). DO NOT use:",
    "- US-FDA 510(k) framing",
    "- IMDRF SaMD significance × situation matrix",
    "- 'New drug' framing for the novel-device pathway (this is a novel medical-device path under MDR 2017, not the new-drug path under the Drugs and Cosmetics Act)",
    "- ClearPath product names like 'Reviewer Concierge' — those are platform marketing and do not belong in CDSCO submission content",
    "",
    MDR_2017_VERIFIED_CITATIONS_BLOCK,
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Device class: ${card.classification.cdsco_class ?? "[TBD]"}${card.classification.class_qualifier ? ` (qualifier: ${card.classification.class_qualifier})` : ""}`,
    `Q8 predicate (wizard-explicit): no`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "novel_device_declaration": "80-160 words. State plainly that no Indian predicate is claimed (Q8 wizard-explicit). Frame the device as first-in-class for its intended use within Indian regulatory scope. Anchor the regulatory consequence in MDR 2017 — not in the Drugs and Cosmetics Act / new-drug framework (drug-eluting devices are combination products handled separately in §8.12 + §19 DCG(I); the device pathway itself is medical-device-rules-2017).",`,
    `  "md26_27_pathway_note": "80-180 words. Document the MD-26 → MD-27 pre-permission pathway: applicant files Form MD-26 (application for permission for a novel medical device) with CDSCO Central Licensing Authority BEFORE the MD-${card.classification.cdsco_class === "A" || card.classification.cdsco_class === "B" ? "3" : "7"} manufacturing licence application is accepted; CDSCO grants on Form MD-27. Reference §4 Classification & Pathway for the full sequence (MD-26 → MD-27 → MD-${card.classification.cdsco_class === "A" || card.classification.cdsco_class === "B" ? "3 → MD-5" : "7 → MD-9"}). [NEEDS INPUT: Confirmation of whether applicant intends domestic manufacture (Form MD-${card.classification.cdsco_class === "A" || card.classification.cdsco_class === "B" ? "3" : "7"}) or import (Form MD-${card.classification.cdsco_class === "A" || card.classification.cdsco_class === "B" ? "14" : "14"}), as this determines the precise MD-26 declaration scope].",`,
    `  "clinical_evidence_implication": "80-160 words. Explain the no-predicate → effectively-mandatory clinical evidence consequence. Without a predicate, the substantial-equivalence pathway is unavailable, so clinical evidence (§12 Clinical Evidence & PMS) becomes the primary safety / performance evidence basis. Cross-reference §12 for the pivotal-study design implications and §10 Risk Management for the corresponding hazard register inputs."`,
    "}",
    "```",
    "",
    "Apply softening rules. No 'Reviewer Concierge' or platform-marketing language. No 510(k) framing.",
  ].join("\n");
}

function formatHardwareHasPredicate(args: {
  llm: HardwareHasPredicateOutput;
  sources: SourceData;
  source: "indian" | "foreign_only";
}): string {
  const { llm, sources, source } = args;
  const wa = sources.wizard_answers;
  const predicates = (wa.b3_predicate_devices ?? []).filter(
    (p) => p.device_name.trim().length > 0
  );
  const cls = sources.readiness_card.classification.cdsco_class;

  const lines: string[] = [];
  lines.push("## Predicate basis (Q8 wizard-explicit)");
  lines.push("");
  lines.push(
    `**Status:** ${source === "indian" ? "Indian predicate available" : "Foreign predicate only — no Indian predicate"}`
  );
  lines.push("");

  if (predicates.length > 0) {
    lines.push("## Declared predicates (Tier B B3)");
    lines.push("");
    lines.push("| # | Device | Manufacturer | Rationale |");
    lines.push("|---|---|---|---|");
    predicates.forEach((p, i) =>
      lines.push(
        `| ${i + 1} | ${p.device_name} | ${p.manufacturer ?? "[NEEDS INPUT]"} | ${p.rationale ?? "[NEEDS INPUT]"} |`
      )
    );
    lines.push("");
  } else {
    lines.push("## Declared predicates (Tier B B3)");
    lines.push("");
    lines.push(
      "[NEEDS INPUT: Tier B B3 predicate-device list not yet filled — applicant to supply predicate device name(s), manufacturer(s), and rationale for substantial-equivalence claim before submission lock.]"
    );
    lines.push("");
  }

  lines.push("## Substantial-equivalence summary");
  lines.push("");
  lines.push(softenCertainty(llm.substantial_equivalence_summary));
  lines.push("");

  lines.push("## Material differences");
  lines.push("");
  lines.push(softenCertainty(llm.material_differences));
  lines.push("");

  lines.push("## Pathway implication");
  lines.push("");
  lines.push(
    softenCertainty(
      `With at least one declared predicate, the substantial-equivalence basis carries the technical file. The manufacturing licence path is the direct ${cls === "A" || cls === "B" ? "MD-3 → MD-5" : "MD-7 → MD-9"} sequence (see §4 Classification & Pathway). Clinical evidence requirements are tied to the class and the strength of predicate equivalence — see §12 Clinical Evidence & PMS.`
    )
  );
  lines.push("");

  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §4 Classification & Pathway — main MD-3 / MD-7 sequence");
  lines.push("- §12 Clinical Evidence & PMS — class-driven clinical-evidence requirements");
  lines.push("- §3 Intended Use — predicate intended-use alignment");

  return lines.join("\n");
}

function formatHardwareNovel(args: {
  llm: HardwareNovelOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const cls = sources.readiness_card.classification.cdsco_class;

  const lines: string[] = [];
  lines.push("## Predicate basis (Q8 wizard-explicit)");
  lines.push("");
  lines.push("**Status:** No predicate device — novel");
  lines.push("");

  lines.push("## No-predicate declaration");
  lines.push("");
  lines.push(softenCertainty(llm.novel_device_declaration));
  lines.push("");

  lines.push("## MD-26 → MD-27 pre-permission pathway");
  lines.push("");
  lines.push(softenCertainty(llm.md26_27_pathway_note));
  lines.push("");

  lines.push("## Clinical-evidence implication");
  lines.push("");
  lines.push(softenCertainty(llm.clinical_evidence_implication));
  lines.push("");

  lines.push("## Pathway implication");
  lines.push("");
  lines.push(
    softenCertainty(
      `The manufacturing licence sequence is MD-26 → MD-27 → ${
        cls === "A" || cls === "B" ? "MD-3 → MD-5" : "MD-7 → MD-9"
      }. See §4 Classification & Pathway for the full sequence and §12 Clinical Evidence & PMS for the no-predicate clinical-evidence work.`
    )
  );
  lines.push("");

  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §4 Classification & Pathway — MD-26 / MD-27 sequence + form-pair detail");
  lines.push("- §12 Clinical Evidence & PMS — pivotal-study design when no predicate");
  lines.push("- §10 Risk Management — novel-device hazard register inputs");
  lines.push("- §3 Intended Use — first-in-class intended-use anchor");

  return lines.join("\n");
}

function formatHardwareUncertain(): string {
  return [
    "## Predicate basis (Q8 wizard-explicit)",
    "",
    "**Status:** Uncertain (Q8 = `not_sure` or not yet answered)",
    "",
    "## [NEEDS INPUT: predicate-existence determination]",
    "",
    "The Q8 wizard answer is `not_sure` (or not yet captured). Predicate existence drives the regulatory pathway materially:",
    "",
    "- **If an Indian or foreign predicate exists** → direct MD-3 / MD-7 manufacturing licence sequence based on substantial-equivalence basis under MDR 2017 §32.",
    "- **If no predicate exists** → MD-26 → MD-27 pre-permission required BEFORE the manufacturing licence application is accepted; clinical evidence (§12) becomes effectively mandatory.",
    "",
    "Founder action: identify whether any CDSCO-licensed device, or foreign-cleared device with substantially-equivalent intended use + technology + materials + performance + indications, exists. Update the Q8 answer accordingly.",
    "",
    "## Cross-references",
    "",
    "- §4 Classification & Pathway — pathway branches by predicate status",
    "- §12 Clinical Evidence & PMS — no-predicate adds clinical-evidence work",
  ].join("\n");
}

const generateSection06Hardware: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const path = hardwarePredicatePath(sources);
  const sourceFields = [
    "wizard.q8",
    "wizard.b3_predicate_devices",
    "wizard.b1_intended_use_statement",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "intake.one_liner",
  ];

  // Q8 = not_sure → deterministic uncertain path; no LLM call.
  if (path.kind === "uncertain") {
    const content = formatHardwareUncertain();
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content,
      citations: [
        {
          citation_id: "[1]",
          source_doc: "MDR 2017 — Medical Devices Rules, 2017 §32",
          quote: "Substantial equivalence to a predicate device.",
          exact_reference: "MDR 2017 §32",
        },
      ],
      completion_status: "pending",
      word_count: content.split(/\s+/).filter(Boolean).length,
      meta: {
        generation_strategy: "deterministic",
        source_fields: [...sourceFields, "_path:uncertain"],
        model: null,
        llm_cost_usd: null,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: null,
        usage: null,
      },
    };
  }

  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;
  let content = "";
  let citations: SectionOutput["citations"] = [];

  try {
    if (path.kind === "has_predicate") {
      const r = await callLlm({
        assessmentId: sources.assessment_id,
        callLayer: "draft_pack_v2",
        model: SECTION_MODEL,
        userMessage: buildHardwareHasPredicateMessage({
          sources,
          source: path.source,
        }),
        systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
        dryRun: opts.dry_run,
        log: opts.log,
      });
      cost = r.costUsd;
      usage = r.usage;
      const llmOutput = HardwareHasPredicateSchema.parse(
        parseStrictJson(r.rawText)
      );
      content = formatHardwareHasPredicate({
        llm: llmOutput,
        sources,
        source: path.source,
      });
      citations = [
        {
          citation_id: "[1]",
          source_doc: "MDR 2017 — Medical Devices Rules, 2017 §32",
          quote:
            "Substantial equivalence to a predicate device with CDSCO or stringent-authority approval is an acceptable evidence basis.",
          exact_reference: "MDR 2017 §32 (Substantial equivalence)",
        },
        {
          citation_id: "[2]",
          source_doc: "MDR-2017 Fourth Schedule Appendix II §8.5",
          quote:
            "Substantial equivalence with reference to the predicate device or previous generations shall be documented.",
          exact_reference: "Fourth Schedule Appendix II §8.5",
        },
      ];
    } else {
      // novel
      const r = await callLlm({
        assessmentId: sources.assessment_id,
        callLayer: "draft_pack_v2",
        model: SECTION_MODEL,
        userMessage: buildHardwareNovelMessage(sources),
        systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
        dryRun: opts.dry_run,
        log: opts.log,
      });
      cost = r.costUsd;
      usage = r.usage;
      const llmOutput = HardwareNovelSchema.parse(parseStrictJson(r.rawText));
      content = formatHardwareNovel({ llm: llmOutput, sources });
      citations = [
        {
          citation_id: "[1]",
          source_doc: "MDR 2017 — Medical Devices Rules, 2017 (Forms MD-26, MD-27)",
          quote:
            "Novel devices without an Indian predicate require pre-permission on Form MD-26; grant is on Form MD-27 before manufacturing licence application.",
          exact_reference: "MDR 2017 Forms MD-26, MD-27; MD-7 checklist §11.0",
        },
        {
          citation_id: "[2]",
          source_doc: "MDR-2017 Fourth Schedule Appendix II §8.5",
          quote:
            "Where no predicate exists, the dossier marks §8.5 N/A with rationale and proceeds via the MD-26/27 path.",
          exact_reference: "Fourth Schedule Appendix II §8.5",
        },
      ];
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[§6 hardware] failed: ${msg}`);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 6 hardware generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        source_fields: sourceFields,
        model: SECTION_MODEL,
        llm_cost_usd: cost,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: msg,
        usage,
      },
    };
  }

  const wordCount = content.trim().split(/\s+/).length;
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations,
    completion_status: "complete",
    word_count: wordCount,
    meta: {
      generation_strategy: "llm_synthesized",
      source_fields: [...sourceFields, `_path:hardware_${path.kind}`],
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};

// Dispatcher — persona-aware. SaMD behaviour unchanged.
export const generateSection06: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  if (sources.wizard_answers.persona === "manufacturer_hardware") {
    return generateSection06Hardware(sources, opts);
  }
  return generateSection06Samd(sources, opts);
};
