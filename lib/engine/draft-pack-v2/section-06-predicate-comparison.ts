/**
 * Section 6 — Predicate Device Comparison.
 *
 * Maps to: DMF §8.5 Substantial equivalence with reference to the predicate.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 6.
 *
 * Two body variants: has_predicate=true → substantial-equivalence narrative;
 * has_predicate=false (b3_no_predicate or empty predicate list) → novel-
 * device declaration with MD-26/MD-27 pre-permission note.
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
    "Generate the substantial-equivalence narrative for Section 6 (Predicate Device Comparison) of a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per MDR 2017 Rule 60' OR 'In line with substantial-equivalence principles documented in CDSCO published materials'. Avoid openers used in earlier sections.",
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
    "Generate the novel-device declaration for Section 6 (Predicate Device Comparison) of a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per MDR 2017 §3.2 and the no-predicate pathway documented in CDSCO published materials'.",
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

export const generateSection06: SectionGenerator = async (
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
