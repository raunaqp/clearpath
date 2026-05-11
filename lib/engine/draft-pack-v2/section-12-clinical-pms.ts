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
    "Opening framing: lead with the clinical evidence STATUS — what exists today, what's planned — and the PMS operational model. This section is where deployment realism matters most. Name specific cadences (e.g., 'quarterly trend report'), specific roles ('RA Officer notified within 24h of a Serious AE'), specific forms (MD-42, MD-43, Form-25). Where applicant data is silent, write \"[NEEDS INPUT: <what>]\" — do not fabricate cadences or roles.",
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
    `  "clinical_evidence_summary": "150-300 words. Map B5 status (${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT: clinical evidence status]"}) to a concrete description. For 'pilot_data': describe the pilot + acknowledge pivotal dependency. Where source data anchors specific numbers (sample size, sensitivity), cite them as preliminary. For 'published_study' or 'multi_center_trial' without source-data IDs, write \"[NEEDS INPUT: study ID / DOI / CTRI registration]\". ${card.classification.cdsco_class === "D" ? "Class D — clinical evidence effectively mandatory; be explicit." : ""}",`,
    `  "evidence_plan": "120-220 words. Prospective study plan + CTRI registration intent + EC engagement. Use \"[NEEDS INPUT: pivotal trial design — primary endpoint, sample size, comparator]\" for unknowns; do not fabricate study parameters.",`,
    `  "pms_plan_summary": "200-400 words. Active vigilance per MDR 2017. Three paragraphs: (1) complaint handling — intake → triage → CAPA workflow, naming the typical SLA (24h ack, 30 days root-cause); (2) adverse event reporting — MD-42 / MD-43 / Form-25 — name the form for each event class and the regulatory timing (Serious AE: 15-day reporting per MDR 2017); (3) periodic reporting + post-market clinical follow-up. ${card.classification.ai_ml_flag ? "AI/ML — name the drift-monitoring metric (calibration drift, performance drift) + cadence (monthly) + escalation (clinical reviewer → ACP retraining trigger)." : ""}",`,
    `  "vigilance_reporting_framework": "60-150 words. Forms (MD-42 manufacturer AE, MD-43 PMS, Form-25 device AE) + their triggering events + their reporting windows. Cite the MDR 2017 vigilance schedule once.",`,
    triggerCiPath
      ? '  "clinical_investigation_pathway_note": "60-130 words. Surface the MD-22 / MD-23 clinical-investigation pathway with the full sequence: MD-26 → MD-27 → MD-22 (CI permission) → MD-23 (CI grant) → CI conduct → MD-7 → MD-9. Mention that the Reviewer Concierge tier supports dual-pathway sequencing.",'
      : '  "clinical_investigation_pathway_note": null,',
    `  "post_market_clinical_followup": "60-150 words. PMCF triggers and cadence. ${wa.q1 === "critical" && (card.classification.cdsco_class === "C" || card.classification.cdsco_class === "D") ? "Q1=critical + Class C/D — quarterly cadence minimum, with a sentence on how PMCF reports feed back into the RMF (Section 10)." : "Annual default cadence; tighten for high-risk subgroups."}"`,
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
