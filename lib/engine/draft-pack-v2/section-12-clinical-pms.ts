/**
 * Section 12 — Clinical Evidence & Post-Market Surveillance.
 *
 * Maps to: DMF §8.18 Clinical evidence + §8.19 PMS (Vigilance reporting).
 * Spec: docs/specs/draft-pack-document-matrix.md Section 12.
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

const SECTION_KEY = "12_clinical_evidence_pms" as const;
const TITLE = "Clinical Evidence & Post-Market Surveillance";
const MAX_TOKENS = 4000;

// Phase 4b iteration — bounds relaxed.
const LlmSchema = z.object({
  clinical_evidence_summary: z.string().min(150).max(6000),
  evidence_plan: z.string().min(100).max(5000),
  pms_plan_summary: z.string().min(200).max(7000),
  vigilance_reporting_framework: z.string().min(60).max(2500),
  clinical_investigation_pathway_note: z.string().nullable(),
  post_market_clinical_followup: z.string().min(60).max(3000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;

  const hasPredicate =
    wa.b3_no_predicate !== true &&
    (wa.b3_predicate_devices ?? []).some(
      (p) => p.device_name.trim().length > 0
    );
  const triggerCiPath =
    card.recommended_path === "clinical_investigation" ||
    (!hasPredicate && wa.b5_clinical_evidence_status === "none");

  return [
    "Generate Section 12 (Clinical Evidence & Post-Market Surveillance) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per MDR 2017 vigilance-reporting expectations' OR 'In accordance with Schedule III post-market obligations'.",
    "",
    "## Applicant data",
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    `Recommended path: ${card.recommended_path ?? "(not set)"}`,
    `B5 clinical evidence status: ${wa.b5_clinical_evidence_status ?? "[TBD]"}`,
    `Has predicate: ${hasPredicate ? "yes" : "no (novel device)"}`,
    `Q1 clinical state: ${wa.q1 ?? "[TBD]"}`,
    `Trigger CI pathway note: ${triggerCiPath}`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "clinical_evidence_summary": "200-400 words. Map B5 status (${wa.b5_clinical_evidence_status ?? "[TBD]"}) to study description. For 'none': honest gap statement + bridge to evidence_plan. For 'pilot_data': describe pilot + acknowledge pivotal dependency. For 'published_study': cite '[TBD] DOI'. For 'multi_center_trial': describe ([TBD] study ID + sample size). ${card.classification.cdsco_class === "D" ? "Class D — ≥ 300 words; clinical evidence effectively mandatory." : ""}",`,
    `  "evidence_plan": "150-300 words. Sprint 3 prospective study plan + CTRI registration intent + EC engagement (mark [TBD] for specifics pending Sprint 4 questions).",`,
    `  "pms_plan_summary": "250-500 words. Active vigilance reporting per MDR 2017. Cover: complaint handling, adverse event reporting (MD-42 / MD-43 forms), periodic safety updates, post-market clinical follow-up cadence. ${card.classification.ai_ml_flag ? "AI/ML — MUST include drift monitoring + periodic algorithm performance reports (cross-ref Section 8 ACP)." : ""}",`,
    `  "vigilance_reporting_framework": "60-200 words. Name the forms: MD-42 (manufacturer adverse event reporting), MD-43 (post-market surveillance), Form-25 (medical device adverse event report). Cite MDR 2017 vigilance schedule.",`,
    triggerCiPath
      ? '  "clinical_investigation_pathway_note": "60-150 words. Surface the MD-22 / MD-23 clinical-investigation pathway. Sequence: MD-26 → MD-27 → MD-22 (CI permission) → MD-23 (CI grant) → CI conduct → MD-7 → MD-9. Recommend the Reviewer Concierge tier for sequencing.",'
      : '  "clinical_investigation_pathway_note": null,',
    `  "post_market_clinical_followup": "60-200 words. PMCF triggers and cadence. ${wa.q1 === "critical" && (card.classification.cdsco_class === "C" || card.classification.cdsco_class === "D") ? "Q1=critical + Class C/D — quarterly cadence minimum; ≥ 150 words." : "Annual default cadence; tighten for high-risk subgroups."}"`,
    "}",
    "```",
  ].join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const wa = sources.wizard_answers;
  const lines: string[] = [];

  lines.push("## Clinical evidence status");
  lines.push("");
  lines.push(`**Tier B B5 status:** ${wa.b5_clinical_evidence_status ?? "[TBD]"}`);
  lines.push("");

  lines.push("## Clinical evidence summary");
  lines.push("");
  lines.push(llm.clinical_evidence_summary);
  lines.push("");

  lines.push("## Evidence plan");
  lines.push("");
  lines.push(llm.evidence_plan);
  lines.push("");

  lines.push("## Post-market surveillance plan");
  lines.push("");
  lines.push(llm.pms_plan_summary);
  lines.push("");

  lines.push("## Vigilance reporting framework");
  lines.push("");
  lines.push(llm.vigilance_reporting_framework);
  lines.push("");

  lines.push("## Post-market clinical follow-up (PMCF)");
  lines.push("");
  lines.push(llm.post_market_clinical_followup);
  lines.push("");

  if (llm.clinical_investigation_pathway_note) {
    lines.push("## Clinical investigation pathway");
    lines.push("");
    lines.push(llm.clinical_investigation_pathway_note);
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection12: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "wizard.q1",
    "wizard.b3_no_predicate",
    "wizard.b3_predicate_devices",
    "wizard.b5_clinical_evidence_status",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.recommended_path",
  ];

  let llmOutput: LlmOutput;
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;

  try {
    const r = await callLlm({
      assessmentId: sources.assessment_id,
      callLayer: "draft_pack_v2",
      model: SECTION_MODEL,
      userMessage: buildUserMessage(sources),
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
      content: `[Section 12 generation failed: ${msg}]`,
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

  const content = formatMarkdown({ llm: llmOutput, sources });
  const wordCount = content.trim().split(/\s+/).length;
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations: [
      {
        citation_id: "[1]",
        source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.18, §8.19",
        quote:
          "Clinical evidence + Post-Marketing Surveillance data (vigilance reporting).",
        exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.18, §8.19",
      },
      {
        citation_id: "[2]",
        source_doc: "MDR 2017 — Forms MD-42 / MD-43 / Form-25",
        quote:
          "Vigilance reporting forms for manufacturer adverse events, post-market surveillance, and medical device adverse event reports.",
        exact_reference: "MDR 2017 Forms MD-42, MD-43, Form-25",
      },
    ],
    completion_status: "complete",
    word_count: wordCount,
    meta: {
      generation_strategy: "llm_synthesized",
      source_fields: sourceFields,
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};
