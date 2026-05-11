/**
 * Section 1 — Executive Summary (CONSOLIDATOR).
 *
 * Maps to: DMF §8.1 Executive Summary.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 1.
 *
 * Generated LAST — reads §2-§12 outputs and consolidates. Uses Opus 4.7
 * (vs Sonnet 4.6 for other sections) because cross-section synthesis is
 * the highest-reasoning task in the pipeline.
 */

import { z } from "zod";
import {
  SHARED_SECTION_SYSTEM_PROMPT,
  CONSOLIDATOR_MODEL,
  callLlm,
  parseStrictJson,
} from "./prompts";
import type {
  SectionOpts,
  SectionOutput,
  SourceData,
} from "./types";
import { sectionNumberFromKey } from "./types";

const SECTION_KEY = "01_executive_summary" as const;
const TITLE = "Executive Summary";
const MAX_TOKENS = 1500;

const LlmSchema = z.object({
  body: z.string().min(800).max(3500),
  headline_gaps: z.array(z.string().min(20).max(300)).length(3),
  recommended_path_note: z.string().nullable(),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function deriveProductClass(sources: SourceData): string {
  const cls = sources.readiness_card.classification.cdsco_class;
  const qual = sources.readiness_card.classification.class_qualifier;
  if (!cls) return "[TBD]";
  if (!qual) return `Class ${cls} medical device`;
  if (qual.startsWith("AI-CDS")) return `Class ${cls} SaMD (AI-CDS)`;
  if (qual.includes("SaMD")) return `Class ${cls} SaMD`;
  if (qual === "IVD" || qual === "IVD-SaMD") return `Class ${cls} IVD`;
  return `Class ${cls} medical device (${qual})`;
}

function derivePathway(sources: SourceData): string {
  const cls = sources.readiness_card.classification.cdsco_class;
  const wa = sources.wizard_answers;
  const novel =
    wa.b3_no_predicate === true ||
    (wa.b3_predicate_devices ?? []).length === 0;

  if (!cls) return "[TBD]";

  const prefix = novel ? "MD-26 → MD-27 → " : "";
  if (cls === "A" || cls === "B") {
    return `${prefix}MD-3 → MD-5 (State Licensing Authority)`;
  }
  return `${prefix}MD-7 → MD-9 (Central Licensing Authority)`;
}

function buildUserMessage(args: {
  sources: SourceData;
  priorSections: SectionOutput[];
}): string {
  const { sources, priorSections } = args;
  const card = sources.readiness_card;
  const productClass = deriveProductClass(sources);
  const pathway = derivePathway(sources);

  // Short snippets from prior sections so Opus has cross-section context
  // without inflating the prompt to multi-thousand tokens.
  const snippets = priorSections
    .filter((s) => s.completion_status === "complete")
    .map((s) => {
      const firstPara = s.content
        .split("\n\n")
        .find((p) => p.trim() && !p.startsWith("#") && !p.startsWith("|"))
        ?.slice(0, 400) ?? "";
      return `### Section ${s.section_number} — ${s.title}\n${firstPara}`;
    })
    .join("\n\n");

  const failedSections = priorSections.filter(
    (s) => s.completion_status === "failed"
  );

  return [
    "Generate the Executive Summary (Section 1) for a CDSCO MD-7/MD-3 Draft Pack. You are the CONSOLIDATOR — you read the other 11 sections (snippets below) and produce a cohesive, regulator-grade summary.",
    "",
    "Phrasing variety: open with 'This Draft Pack documents' OR 'The applicant has prepared this submission' OR direct device-name opening. Vary from earlier sections.",
    "",
    "## Applicant data",
    `Company: ${sources.ai_extracted?.company?.legal_name ?? sources.intake.name}`,
    `Device: ${sources.ai_extracted?.device_name ?? "(see intake one-liner)"}`,
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${sources.wizard_answers.b1_intended_use_statement ?? "(not captured)"}`,
    "",
    "## Derived facts (anchors — do NOT contradict)",
    `Product class: ${productClass}`,
    `Pathway: ${pathway}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    `ACP required: ${card.classification.acp_required}`,
    `Has predicate: ${
      sources.wizard_answers.b3_no_predicate === true
        ? "false (novel)"
        : (sources.wizard_answers.b3_predicate_devices ?? []).length > 0
          ? "true"
          : "[TBD]"
    }`,
    `Recommended path (light signal): ${card.recommended_path ?? "(not set)"}`,
    "",
    "## Risk Card top_gaps (use these for headline_gaps)",
    ...card.top_gaps
      .slice(0, 5)
      .map(
        (g, i) =>
          `  ${i + 1}. [${g.severity}] ${g.gap_title} → ${g.fix_action}`
      ),
    "",
    failedSections.length > 0
      ? `## ⚠ Failed sections (do NOT cite content; note as gaps): ${failedSections.map((s) => `§${s.section_number} ${s.title}`).join(", ")}`
      : "",
    "",
    "## Prior section snippets (for cross-section coherence)",
    snippets,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "body": "250-350 words. Cohesive executive summary covering: device + class statement, intended use one-liner, regulatory pathway, key strengths (ISO 13485 status, clinical evidence stage, predicate basis), top 3 gaps, expected timeline anchor. Open with a regulatory citation phrase NOT used in Sections 2-12. ${card.classification.cdsco_class === "D" ? "Class D — emphasise heightened scrutiny." : ""}",`,
    `  "headline_gaps": ["3 action items derived from Risk Card top_gaps. Each ≤ 30 words, phrased as a verb-led action sentence ('Lock the BSI India Stage 1 audit before Q3 2026.')", "...", "..."],`,
    card.recommended_path === "clinical_investigation"
      ? '  "recommended_path_note": "60-120 words. Surface MD-22 / MD-23 clinical-investigation pathway. Recommend Reviewer Concierge for dual-pathway sequencing."'
      : '  "recommended_path_note": null',
    "}",
    "```",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
  productClass: string;
  pathway: string;
}): string {
  const { llm, sources, productClass, pathway } = args;
  const lines: string[] = [];

  lines.push("## At-a-glance");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(
    `| Applicant | ${sources.ai_extracted?.company?.legal_name ?? sources.intake.name} |`
  );
  lines.push(
    `| Device | ${sources.ai_extracted?.device_name ?? "(see intake one-liner)"} |`
  );
  lines.push(`| Product class | ${productClass} |`);
  lines.push(`| Pathway | ${pathway} |`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(llm.body);
  lines.push("");

  lines.push("## Top three gaps to close");
  lines.push("");
  llm.headline_gaps.forEach((g, i) => lines.push(`${i + 1}. ${g}`));
  lines.push("");

  if (llm.recommended_path_note) {
    lines.push("## Recommended path note");
    lines.push("");
    lines.push(llm.recommended_path_note);
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection01 = async (
  sources: SourceData,
  opts: SectionOpts,
  priorSections: SectionOutput[]
): Promise<SectionOutput> => {
  const startedAt = new Date().toISOString();
  const productClass = deriveProductClass(sources);
  const pathway = derivePathway(sources);
  const sourceFields = [
    "intake.name",
    "intake.one_liner",
    "wizard.b1_intended_use_statement",
    "wizard.b3_no_predicate",
    "wizard.b3_predicate_devices",
    "readiness_card.classification",
    "readiness_card.recommended_path",
    "readiness_card.top_gaps",
    "ai_extracted.fields.company.legal_name",
    "ai_extracted.fields.device_name",
    "_consolidates: sections 02-12",
  ];

  let llmOutput: LlmOutput;
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;

  try {
    const r = await callLlm({
      assessmentId: sources.assessment_id,
      callLayer: "draft_pack_v2_consolidator",
      model: CONSOLIDATOR_MODEL,
      userMessage: buildUserMessage({ sources, priorSections }),
      systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      dryRun: opts.dry_run,
      log: opts.log,
    });
    cost = r.costUsd;
    usage = r.usage;
    llmOutput = LlmSchema.parse(parseStrictJson(r.rawText));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 1 generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        source_fields: sourceFields,
        model: CONSOLIDATOR_MODEL,
        llm_cost_usd: cost,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: msg,
        usage,
      },
    };
  }

  const content = formatMarkdown({
    llm: llmOutput,
    sources,
    productClass,
    pathway,
  });
  const wordCount = content.trim().split(/\s+/).length;

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.1",
      quote: "Executive Summary of the Device Master File.",
      exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.1",
    },
  ];
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
      source_fields: sourceFields,
      model: CONSOLIDATOR_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};
