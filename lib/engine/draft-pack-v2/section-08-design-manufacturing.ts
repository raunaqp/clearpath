/**
 * Section 8 — Design & Manufacturing.
 *
 * Maps to: DMF §8.7 Device Design and Manufacturing Information,
 * plus §8.16 Animal preclinical (conditional), §8.20 Batch release.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 8.
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

const SECTION_KEY = "08_design_manufacturing" as const;
const TITLE = "Design & Manufacturing";
const MAX_TOKENS = 4000;

// Phase 4b iteration — bounds relaxed; MAX_TOKENS bumped because §8
// has 8 fields, several long, plus conditional sub-blocks.
const LlmSchema = z.object({
  design_history_summary: z.string().min(120).max(5000),
  manufacturing_process_summary: z.string().min(120).max(5000),
  quality_management_overview: z.string().min(150).max(6000),
  software_development_lifecycle: z.string().nullable(),
  algorithm_change_protocol: z.string().nullable(),
  sterilization_validation: z.string().nullable(),
  iso_13485_evidence: z.string().min(40).max(2000),
  batch_release_documentation: z.string().min(40).max(2000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function isSoftwarePresent(sources: SourceData): boolean {
  const q = sources.readiness_card.classification.class_qualifier ?? "";
  if (q.startsWith("AI-CDS") || q.includes("SaMD")) return true;
  if (sources.readiness_card.classification.ai_ml_flag) return true;
  const aiClass = sources.ai_extracted?.suggested_wizard_answers?.device_class ?? "";
  return aiClass.startsWith("samd_");
}

function isSterile(sources: SourceData): boolean {
  return (sources.ai_extracted?.product_meta?.sterile ?? "")
    .toLowerCase()
    .includes("sterile") &&
    !(sources.ai_extracted?.product_meta?.sterile ?? "")
      .toLowerCase()
      .includes("non-sterile");
}

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;
  const card = sources.readiness_card;
  const softwarePresent = isSoftwarePresent(sources);
  const sterile = isSterile(sources);

  return [
    "Generate Section 8 (Design & Manufacturing) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per MDR 2017 Fourth Schedule Appendix II §8.7' OR 'In accordance with ISO 13485 §7.3 design controls'. Vary from earlier sections.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `ISO 13485 status (B6): ${wa.b6_iso_13485_status ?? "[TBD]"}`,
    `Commercial stage (Q7): ${wa.q7 ?? "(not answered)"}`,
    `Manufacturing address: ${ai?.company?.manufacturing_address ?? ai?.company?.registered_address ?? "[TBD]"}`,
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}; ACP required: ${card.classification.acp_required}`,
    `Software lifecycle (C1): ${wa.c1_software_lifecycle_model ?? "(not captured)"}`,
    `Sterile: ${sterile ? "yes" : "no/[TBD]"}`,
    `Q5 integrations: ${wa.q5 ?? "(not answered)"}`,
    `Readiness — quality_system dim: ${card.readiness?.dimensions?.quality_system ?? "[TBD]"}/2`,
    `Readiness — technical_docs dim: ${card.readiness?.dimensions?.technical_docs ?? "[TBD]"}/2`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "design_history_summary": "150-300 words. ISO 13485 §7.3 design-controls framing — design inputs, design reviews, V&V activities, design transfer. Anchor to Q7 commercial stage (${wa.q7 ?? "[TBD]"}) and the intended use. For software, frame around IEC 62304 lifecycle.",`,
    '  "manufacturing_process_summary": "150-300 words. For hardware: process flow, in-process controls, finished-product release. For software-only: SDLC + release engineering + version control + deployment topology.",',
    `  "quality_management_overview": "200-400 words. Cover the 11 QMS sub-blocks per MDR 2017 Fifth Schedule (Quality Manual, Doc Control, Records Control, Mgmt Responsibility, Resource Mgmt, Production Controls, Internal Audit, NCP, CAPA, Env Requirements). Anchor to B6 status: ${wa.b6_iso_13485_status ?? "[TBD]"}. Be honest about gaps. ${card.classification.cdsco_class === "D" ? "Class D — ≥ 300 words, explicit on internal audit cadence and CAPA SLA." : ""}",`,
    softwarePresent
      ? `  "software_development_lifecycle": "150-300 words. Map C1 = ${wa.c1_software_lifecycle_model ?? "[TBD]"} to IEC 62304 framing. waterfall → phased V-model; agile → iterative sprints + risk-based regression; hybrid → scaled-agile with stage gates. Cite IEC 62304:2006/AMD1:2015 §5.",`
      : '  "software_development_lifecycle": null,',
    card.classification.acp_required
      ? '  "algorithm_change_protocol": "150-300 words. Sprint 2 stub for the 5-component ACP per Oct 2025 CDSCO SaMD draft: (1) modification scope, (2) retraining triggers, (3) validation thresholds, (4) human oversight, (5) re-submission triggers. Use [TBD] for component-specific values pending Sprint 4 ACP question.",'
      : '  "algorithm_change_protocol": null,',
    sterile
      ? '  "sterilization_validation": "150-300 words. Cover sterilisation mode (EtO / steam / radiation / aseptic), validation per ISO 11135 / ISO 11137 / ISO 17665 family, bioburden + sterility-assurance level, packaging shelf-life. [TBD] for the specific mode pending Sprint 3 sterilisation-mode question."'
      : '  "sterilization_validation": null,',
    `  "iso_13485_evidence": "40-120 words. Template based on B6 status (${wa.b6_iso_13485_status ?? "[TBD]"}). For 'certified': certificate # [TBD], issued by [TBD], valid through [TBD]. For 'in_progress': describe engagement (CB / Stage 1 / Stage 2 schedule). For 'not_started': honest gap statement + engagement plan."`,
    "  ,",
    '  "batch_release_documentation": "40-120 words. Hardware: minimum 3 consecutive batches per DMF §8.20. Software: version release certificate per IEC 62304 §5.8."',
    "}",
    "```",
    "",
  ].join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(`| ISO 13485 status | ${wa.b6_iso_13485_status ?? "[TBD]"} |`);
  lines.push(
    `| Manufacturing address | ${ai?.company?.manufacturing_address ?? ai?.company?.registered_address ?? "[TBD]"} |`
  );
  lines.push(
    `| Software lifecycle | ${wa.c1_software_lifecycle_model ?? "(not applicable — no software, or not captured)"} |`
  );
  lines.push(
    `| ACP required | ${sources.readiness_card.classification.acp_required ? "Yes" : "No"} |`
  );
  lines.push("");

  lines.push("## Design history");
  lines.push("");
  lines.push(llm.design_history_summary);
  lines.push("");

  lines.push("## Manufacturing process");
  lines.push("");
  lines.push(llm.manufacturing_process_summary);
  lines.push("");

  lines.push("## Quality management system");
  lines.push("");
  lines.push(llm.quality_management_overview);
  lines.push("");

  lines.push("## ISO 13485 status & evidence");
  lines.push("");
  lines.push(llm.iso_13485_evidence);
  lines.push("");

  if (llm.software_development_lifecycle) {
    lines.push("## Software development lifecycle (DMF §8.15)");
    lines.push("");
    lines.push(llm.software_development_lifecycle);
    lines.push("");
  }

  if (llm.algorithm_change_protocol) {
    lines.push("## Algorithm Change Protocol (ACP, Oct 2025 CDSCO SaMD draft)");
    lines.push("");
    lines.push(llm.algorithm_change_protocol);
    lines.push("");
  }

  if (llm.sterilization_validation) {
    lines.push("## Sterilization validation (DMF §8.14)");
    lines.push("");
    lines.push(llm.sterilization_validation);
    lines.push("");
  }

  lines.push("## Batch release / version release (DMF §8.20)");
  lines.push("");
  lines.push(llm.batch_release_documentation);
  lines.push("");

  // Risk-callout for ISO 13485 not_started + Class C/D
  if (
    wa.b6_iso_13485_status === "not_started" &&
    (sources.readiness_card.classification.cdsco_class === "C" ||
      sources.readiness_card.classification.cdsco_class === "D")
  ) {
    lines.push("## Risk callout");
    lines.push("");
    lines.push(
      "ISO 13485 certification is not yet started. Per MDR 2017 and based on published CDSCO guidance, ISO 13485 is effectively a pre-condition for grant of Class C/D manufacturing licence. This gap is reflected in Section 1 — Executive Summary (headline gaps)."
    );
    lines.push("");
  }
  return lines.join("\n");
}

export const generateSection08: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "intake.one_liner",
    "wizard.b1_intended_use_statement",
    "wizard.b6_iso_13485_status",
    "wizard.c1_software_lifecycle_model",
    "wizard.q5",
    "wizard.q7",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.acp_required",
    "readiness_card.readiness.dimensions.quality_system",
    "readiness_card.readiness.dimensions.technical_docs",
    "ai_extracted.fields.company.manufacturing_address",
    "ai_extracted.fields.company.registered_address",
    "ai_extracted.fields.product_meta.sterile",
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
      content: `[Section 8 generation failed: ${msg}]`,
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
      source_doc: "MDR 2017 — Fifth Schedule (Quality Management System)",
      quote:
        "Manufacturing-site compliance with the QMS framework of the Fifth Schedule.",
      exact_reference: "MDR 2017 Fifth Schedule",
    },
    {
      citation_id: "[2]",
      source_doc: "ISO 13485:2016 — Medical devices QMS",
      quote: "Quality management system requirements for regulatory purposes.",
      exact_reference: "ISO 13485:2016",
    },
  ];
  if (llmOutput.software_development_lifecycle) {
    citations.push({
      citation_id: "[3]",
      source_doc: "IEC 62304:2006/AMD1:2015 — Medical device software lifecycle",
      quote:
        "Software lifecycle processes, including software unit verification, system V&V, and software release.",
      exact_reference: "IEC 62304:2006/AMD1:2015",
    });
  }
  if (llmOutput.algorithm_change_protocol) {
    citations.push({
      citation_id: "[4]",
      source_doc:
        "CDSCO Draft Guidance — Software-as-a-Medical-Device (October 2025)",
      quote:
        "Algorithm Change Protocol expected as part of the Risk Management File for adaptive AI/ML SaMD.",
      exact_reference: "CDSCO Oct 2025 SaMD Draft §4.2.D",
    });
  }
  if (llmOutput.sterilization_validation) {
    citations.push({
      citation_id: "[5]",
      source_doc: "ISO 11135 / ISO 11137 / ISO 17665 (Sterilisation)",
      quote:
        "Sterilisation method-specific validation standards (EtO / radiation / moist-heat).",
      exact_reference: "ISO 11135, ISO 11137, ISO 17665 (as applicable)",
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
