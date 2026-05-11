/**
 * Section 11 — Verification & Validation.
 *
 * Maps to: DMF §8.10 V&V, §8.11 Biocompatibility (conditional),
 * §8.13 Biological safety (conditional), §8.15 Software V&V (conditional),
 * §8.17 Stability data.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 11.
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

const SECTION_KEY = "11_verification_validation" as const;
const TITLE = "Verification & Validation";
const MAX_TOKENS = 3500;

// Phase 4b iteration — bounds relaxed.
const LlmSchema = z.object({
  verification_protocol_summary: z.string().min(150).max(5000),
  validation_summary: z.string().min(150).max(5000),
  biocompatibility_evidence: z.string().nullable(),
  software_verification_validation: z.string().nullable(),
  stability_data_summary: z.string().min(60).max(2500),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function isSoftware(sources: SourceData): boolean {
  const q = sources.readiness_card.classification.class_qualifier ?? "";
  if (q.startsWith("AI-CDS") || q.includes("SaMD")) return true;
  if (sources.readiness_card.classification.ai_ml_flag) return true;
  const aiClass = sources.ai_extracted?.suggested_wizard_answers?.device_class ?? "";
  return aiClass.startsWith("samd_");
}

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const sw = isSoftware(sources);

  return [
    "Generate Section 11 (Verification & Validation) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per ISO 13485 §7.3 design controls and IEC 62304 §5' OR 'In accordance with verification-and-validation expectations of MDR 2017'. Vary from earlier sections.",
    "",
    "## Applicant data",
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}; ACP required: ${card.classification.acp_required}`,
    `B5 clinical evidence status: ${wa.b5_clinical_evidence_status ?? "[TBD]"}`,
    `C1 software lifecycle: ${wa.c1_software_lifecycle_model ?? "(not captured)"}`,
    `Intended user (Q3): ${wa.q3 ?? "[TBD]"}`,
    `Software present: ${sw}`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "verification_protocol_summary": "150-300 words. What was tested (functional, safety, performance), against what specs/standards, and which Essential Principles (Section 9) each test maps to. ${card.classification.cdsco_class === "D" ? "Class D — ≥ 250 words." : ""}",`,
    `  "validation_summary": "150-300 words. Real-world performance against intended use. Be honest about B5 = ${wa.b5_clinical_evidence_status ?? "[TBD]"}. For 'none' or 'pilot_data': acknowledge gap and cross-reference Section 12 evidence plan. ${card.classification.cdsco_class === "D" ? "Class D — ≥ 250 words." : ""}",`,
    // Biocompatibility is a Sprint 3 question (patient-contact tier). Sprint 2 fills a stub.
    `  "biocompatibility_evidence": "100-250 words OR null. Render the sub-block (non-null) unless this is clearly a software-only product with no patient contact. Map to ISO 10993 series — be conservative: '[TBD]' for the specific test panel pending Sprint 3 patient-contact-type question. Default to surface_intact_skin tier when ambiguous.",`,
    sw
      ? `  "software_verification_validation": "180-350 words. IEC 62304 §5.5 (Software Unit V&V) + §5.6 (System V&V) + §5.7 (Software Release). Cite C1 = ${wa.c1_software_lifecycle_model ?? "[TBD]"} for SDLC. ${card.classification.acp_required ? "ACP-required AI/ML — explicitly include drift validation, subgroup performance, threshold-based retraining triggers (cross-ref Section 8 ACP, Section 10 ai_ml_specific_risks)." : ""}",`
      : '  "software_verification_validation": null,',
    `  "stability_data_summary": "60-180 words. ${sw ? "Software: 'Not applicable in the classical hardware-stability sense; version-specific change-control covered in Section 8 batch_release.'" : "Hardware: real-time + accelerated stability per ICH Q1A framing. [TBD] for specific shelf life pending Sprint 3 stability-status question."}"`,
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

  lines.push("## Verification protocol");
  lines.push("");
  lines.push(llm.verification_protocol_summary);
  lines.push("");

  lines.push("## Validation summary");
  lines.push("");
  lines.push(llm.validation_summary);
  lines.push("");

  if (llm.biocompatibility_evidence) {
    lines.push("## Biocompatibility evidence (DMF §8.11)");
    lines.push("");
    lines.push(llm.biocompatibility_evidence);
    lines.push("");
  }

  if (llm.software_verification_validation) {
    lines.push("## Software verification and validation (DMF §8.15)");
    lines.push("");
    lines.push(llm.software_verification_validation);
    lines.push("");
  }

  lines.push("## Stability data (DMF §8.17)");
  lines.push("");
  lines.push(llm.stability_data_summary);
  lines.push("");

  // V&V evidence references — derived from B5
  lines.push("## V&V evidence references");
  lines.push("");
  const b5 = wa.b5_clinical_evidence_status;
  if (b5 === "multi_center_trial") {
    lines.push(
      "- Multi-centre prospective study referenced (study citation: [TBD] — Sprint 3 study-citation question)."
    );
  } else if (b5 === "published_study") {
    lines.push("- Peer-reviewed publication referenced ([TBD] DOI / journal).");
  } else if (b5 === "pilot_data") {
    lines.push(
      "- Pilot data / retrospective analysis on file ([TBD] internal report ID). Pivotal-trial design in Section 12 evidence plan."
    );
  } else if (b5 === "none") {
    lines.push(
      "- No external validation evidence yet. Evidence plan in Section 12."
    );
  } else {
    lines.push("- [TBD] V&V evidence references pending B5 capture.");
  }
  lines.push("");
  return lines.join("\n");
}

export const generateSection11: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.acp_required",
    "wizard.b5_clinical_evidence_status",
    "wizard.c1_software_lifecycle_model",
    "wizard.q3",
    "ai_extracted.fields.suggested_wizard_answers.device_class",
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
      content: `[Section 11 generation failed: ${msg}]`,
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
  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "ISO 13485:2016 §7.3 Design and Development",
      quote:
        "Design controls including planning, inputs, outputs, review, verification, validation, transfer, and changes.",
      exact_reference: "ISO 13485:2016 §7.3",
    },
    {
      citation_id: "[2]",
      source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.10",
      quote: "Verification and validation of the medical device.",
      exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.10",
    },
  ];
  if (llmOutput.biocompatibility_evidence) {
    citations.push({
      citation_id: "[3]",
      source_doc: "ISO 10993 series — Biological evaluation of medical devices",
      quote:
        "Biocompatibility test panel by patient-contact tier (skin, mucosal, blood, implant).",
      exact_reference: "ISO 10993-1, -5, -10 (as applicable)",
    });
  }
  if (llmOutput.software_verification_validation) {
    citations.push({
      citation_id: "[4]",
      source_doc: "IEC 62304:2006/AMD1:2015 §5.5–§5.7",
      quote:
        "Software unit V&V, system V&V, and software release activities.",
      exact_reference: "IEC 62304:2006/AMD1:2015 §5.5–§5.7",
    });
  }
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
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};
