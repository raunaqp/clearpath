/**
 * Section 2 — Device Description.
 *
 * Maps to: DMF §8.2 Descriptive information of the device.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 2.
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

const SECTION_KEY = "02_device_description" as const;
const TITLE = "Device Description";
const MAX_TOKENS = 1800;

const LlmSchema = z.object({
  components_architecture: z.string().min(100).max(2000),
  principle_of_operation: z.string().min(100).max(2000),
  materials_standards: z.string().min(40).max(2000),
  variants_accessories: z.string().min(40).max(2000),
  lifecycle_disposal: z.string().min(40).max(2000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function isSoftwareOnly(sources: SourceData): boolean {
  const q = sources.readiness_card.classification.class_qualifier ?? "";
  if (q.startsWith("AI-CDS") || q.includes("SaMD") || q === "IVD-SaMD") return true;
  const aiClass = sources.ai_extracted?.suggested_wizard_answers?.device_class ?? "";
  if (aiClass.startsWith("samd_")) return true;
  return false;
}

function buildUserMessage(sources: SourceData): string {
  const card = sources.readiness_card;
  const ai = sources.ai_extracted;
  const wa = sources.wizard_answers;
  const softwareOnly = isSoftwareOnly(sources);

  return [
    "Generate Section 2 (Device Description) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with what the device IS — a brief one-sentence anchor describing the device's class of product (e.g., 'CardioRhythm AI is a cloud-deployed SaMD that…' or '[device] is a single-use disposable…'). Do NOT open with a regulatory citation; substance first.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not yet captured)"}`,
    `Setting of use: ${wa.b2_use_environment ?? ai?.product_meta?.setting_of_use ?? "[TBD]"}`,
    `Sterile (from pitch extraction): ${ai?.product_meta?.sterile ?? "[TBD]"}`,
    `Patient population: ${ai?.product_meta?.patient_population ?? "[TBD]"}`,
    `User population: ${ai?.product_meta?.user_population ?? "[TBD]"}`,
    `Model number: ${ai?.product_meta?.model_number ?? "[TBD]"}`,
    `Device class: ${card.classification.cdsco_class ?? "[TBD]"} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}; ai_ml mode: ${ai?.suggested_wizard_answers?.ai_ml ?? "(unspecified)"}`,
    `URL content available: ${sources.intake.url_fetched_content ? "yes" : "no"}`,
    `Q5 integrations: ${wa.q5 ?? "(not answered)"}`,
    "",
    softwareOnly
      ? "Note: this is a software-only product. For `materials_standards`, output `\"Not applicable — software-only product. No physical materials in regulatory scope.\"`. For `lifecycle_disposal`, frame around SDLC + version retirement, not physical disposal."
      : "Note: this is a hardware (or hardware + software) product. `materials_standards` should describe material classes; `lifecycle_disposal` should describe service life + disposal.",
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Target each field at the LOW end of the band where substance permits — 60-120 words is usually enough; bigger only when warranted.",
    "```",
    "{",
    '  "components_architecture": "60-150 words. Concrete components and how they fit. For software: front-end, inference service, data pipeline. For hardware: principal sub-assemblies. Skip the throat-clearing.",',
    '  "principle_of_operation": "60-150 words. How the device delivers its intended use. Mention the intended user OR use environment once. For AI/ML: adaptive vs static, training data class.",',
    '  "materials_standards": "40-150 words for hardware; one short sentence for software-only. Reference standards (ISO 10993, IEC 60601) only where they earn their place.",',
    '  "variants_accessories": "40-120 words. If none in source data, write a short statement of the single-variant assumption + \"[TBD] — Sprint 3 family-grouping question\".",',
    '  "lifecycle_disposal": "40-120 words. Expected service life (hardware) or SDLC + version retirement (software)."',
    "}",
    "```",
    "",
    wa.q5 === "abdm" || wa.q5 === "both"
      ? "Note: Q5 indicates ABDM integration. Reference FHIR R4 / OAuth 2.0 / CERT-In Safe-to-Host in principle_of_operation where natural."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
  softwareOnly: boolean;
}): string {
  const { llm, sources } = args;
  const ai = sources.ai_extracted;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const sterileStatus =
    args.softwareOnly
      ? "not_applicable"
      : ai?.product_meta?.sterile?.toLowerCase().includes("non-sterile")
        ? "non_sterile"
        : ai?.product_meta?.sterile?.toLowerCase().includes("sterile")
          ? "sterile"
          : "[TBD]";

  const lines: string[] = [];
  lines.push("## Summary");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(`| Model number | ${ai?.product_meta?.model_number ?? "[TBD]"} |`);
  lines.push(
    `| Device class | ${card.classification.cdsco_class ?? "[TBD]"} |`
  );
  lines.push(`| Sterile status | ${sterileStatus} |`);
  lines.push(`| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |`);
  lines.push("");

  lines.push("## Components and architecture");
  lines.push("");
  lines.push(llm.components_architecture);
  lines.push("");

  lines.push("## Principle of operation");
  lines.push("");
  lines.push(llm.principle_of_operation);
  lines.push("");

  lines.push("## Materials and applicable standards");
  lines.push("");
  lines.push(llm.materials_standards);
  lines.push("");

  lines.push("## Variants and accessories");
  lines.push("");
  lines.push(llm.variants_accessories);
  lines.push("");

  lines.push("## Lifecycle and disposal");
  lines.push("");
  lines.push(llm.lifecycle_disposal);
  lines.push("");

  // Conditional cross-references per matrix Section 2.C.
  const conditionalNotes: string[] = [];
  if (sterileStatus === "sterile") {
    conditionalNotes.push(
      "Sterilization method and validation evidence are detailed in Section 8 — Design & Manufacturing (DMF §8.14)."
    );
  }
  if (
    card.classification.class_qualifier &&
    card.classification.class_qualifier.startsWith("IVD-SaMD")
  ) {
    conditionalNotes.push(
      "[TBD] IVD-specific characteristics (analyte / specimen / diagnostic level / output type) — Sprint 3 path expansion."
    );
  }
  if (card.classification.ai_ml_flag) {
    conditionalNotes.push(
      `AI/ML mode: ${ai?.suggested_wizard_answers?.ai_ml ?? "(unspecified — see Section 8 Algorithm Change Protocol)"}. Cross-reference Section 8 for ACP detail.`
    );
  }
  // Patient contact is a Sprint 3 gap — bridge to next section input.
  conditionalNotes.push(
    "Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation."
  );
  if (wa.q5 === "abdm" || wa.q5 === "both") {
    conditionalNotes.push(
      "ABDM integration declared (Q5). FHIR R4 / OAuth 2.0 / CERT-In Safe-to-Host conformance is covered in Section 9 — Essential Principles Conformity."
    );
  }
  if (conditionalNotes.length > 0) {
    lines.push("## Cross-references");
    lines.push("");
    for (const n of conditionalNotes) lines.push(`- ${n}`);
    lines.push("");
  }
  return lines.join("\n");
}

export const generateSection02: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const softwareOnly = isSoftwareOnly(sources);
  const sourceFields = [
    "intake.one_liner",
    "intake.url_fetched_content",
    "wizard.b1_intended_use_statement",
    "wizard.b2_use_environment",
    "wizard.q5",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "ai_extracted.fields.product_meta.sterile",
    "ai_extracted.fields.product_meta.model_number",
    "ai_extracted.fields.product_meta.patient_population",
    "ai_extracted.fields.product_meta.user_population",
    "ai_extracted.fields.product_meta.setting_of_use",
    "ai_extracted.fields.suggested_wizard_answers.ai_ml",
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
      content: `[Section 2 generation failed: ${msg}]`,
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

  const content = formatMarkdown({ llm: llmOutput, sources, softwareOnly });
  const wordCount = content.trim().split(/\s+/).length;
  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR 2017 — Fourth Schedule, Appendix II",
      quote:
        "Device Master File §8.2 — Descriptive information of the device.",
      exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.2",
    },
    {
      citation_id: "[2]",
      source_doc: "IMDRF SaMD framework",
      quote:
        "SaMD risk categorisation framework, used to anchor architectural description for software medical devices.",
      exact_reference: "IMDRF SaMD WG/N12 (2014)",
    },
  ];
  if (sources.readiness_card.classification.ai_ml_flag) {
    citations.push({
      citation_id: "[3]",
      source_doc: "IEC 62304 — Medical device software — Software life cycle processes",
      quote:
        "Software lifecycle processes referenced for SaMD architectural description.",
      exact_reference: "IEC 62304:2006/AMD 1:2015",
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
