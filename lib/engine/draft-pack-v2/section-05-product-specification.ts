/**
 * Section 5 — Product Specification & Variants.
 *
 * Maps to: DMF §8.4 Product Specification, including variants and accessories.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 5.
 *
 * Heavy on Sprint 3 [TBD] gaps — many of the fields here depend on
 * questions clearpath does not yet capture (family grouping, accessories,
 * packaging). Sprint 2 outputs honest placeholders rather than invented
 * specifics.
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

const SECTION_KEY = "05_product_specification" as const;
const TITLE = "Product Specification & Variants";
const MAX_TOKENS = 2000;

// Phase 4b iteration — bounds intentionally generous. Sonnet's regulatory
// prose tends to run longer than matrix word-count bands; we relax max()
// to avoid schema-rejection on otherwise-acceptable content.
const LlmSchema = z.object({
  device_family: z.string().min(20).max(1600),
  physical_specifications: z.string().min(40).max(3000),
  performance_specifications: z.string().min(40).max(3000),
  intended_lifetime: z.string().min(20).max(1000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function isSoftwareOnly(sources: SourceData): boolean {
  const q = sources.readiness_card.classification.class_qualifier ?? "";
  if (q.startsWith("AI-CDS") || q.includes("SaMD") || q === "IVD-SaMD") return true;
  const aiClass =
    sources.ai_extracted?.suggested_wizard_answers?.device_class ?? "";
  return aiClass.startsWith("samd_");
}

function buildUserMessage(sources: SourceData): string {
  const ai = sources.ai_extracted;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const softwareOnly = isSoftwareOnly(sources);

  return [
    "Generate Section 5 (Product Specification & Variants) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with the product taxonomy — single SKU / family / variants — anchored to the applicant data. The regulatory anchor (DMF §8.4) is a citation, not the opening clause.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Model number: ${ai?.product_meta?.model_number ?? "[TBD]"}`,
    `Sterile: ${ai?.product_meta?.sterile ?? "[TBD]"}`,
    `Setting of use: ${wa.b2_use_environment ?? ai?.product_meta?.setting_of_use ?? "[TBD]"}`,
    `Device class: ${card.classification.cdsco_class ?? "[TBD]"} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `Clinical evidence status (B5): ${wa.b5_clinical_evidence_status ?? "(not answered)"}`,
    `URL content available: ${sources.intake.url_fetched_content ? "yes" : "no"}`,
    softwareOnly
      ? "Note: software-only product. physical_specifications → \"Not applicable — software-only product.\" Performance specs should be functional/computational (latency, accuracy targets, model output cadence) — honest about [TBD] where pitch data is silent."
      : "Note: hardware product. physical_specifications should include dimensions, weight, power, connectivity, materials placeholders.",
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Low end of each band where source data is thin; do not pad.",
    "```",
    "{",
    '  "device_family": "≤ 50 words. Default to the single-SKU statement. If the pitch data does suggest variants, describe at that level — never invent SKU numbers.",',
    '  "physical_specifications": "60-150 words for hardware; one short paragraph N/A for software-only. Specific dimensions/weights/materials not in source → \"[NEEDS INPUT: <what>]\".",',
    '  "performance_specifications": "60-150 words. Functional spec — what the device does, accuracy/sensitivity/latency where supported by source. Where source gives anchor numbers (e.g., pilot at 94% sensitivity), cite them and label as preliminary subject to pivotal confirmation. Otherwise \"[NEEDS INPUT: pivotal accuracy / sensitivity / specificity targets]\".",',
    '  "intended_lifetime": "30-80 words. Hardware: expected service life (state in years if source supports; else \"[NEEDS INPUT: expected service life]\"). Software: ongoing SDLC + IEC 62304 version retirement."',
    "}",
    "```",
    "",
    wa.b5_clinical_evidence_status === "multi_center_trial"
      ? "Note: B5 indicates a multi-centre trial. If the pitch extraction surfaced study performance numbers, cite them in performance_specifications."
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
  const { llm, sources, softwareOnly } = args;
  const ai = sources.ai_extracted;
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(`| Model number | ${ai?.product_meta?.model_number ?? "[TBD]"} |`);
  lines.push(
    `| Product class | ${sources.readiness_card.classification.cdsco_class ?? "[TBD]"} |`
  );
  lines.push(
    `| Form factor | ${softwareOnly ? "Software-only" : "Hardware (or hardware + software)"} |`
  );
  lines.push("");

  lines.push("## Device family / variants");
  lines.push("");
  lines.push(llm.device_family);
  lines.push("");

  lines.push("## Physical specifications");
  lines.push("");
  lines.push(llm.physical_specifications);
  lines.push("");

  lines.push("## Performance specifications");
  lines.push("");
  lines.push(llm.performance_specifications);
  lines.push("");

  lines.push("## Intended service life");
  lines.push("");
  lines.push(llm.intended_lifetime);
  lines.push("");

  lines.push("## Accessories and packaging");
  lines.push("");
  if (softwareOnly) {
    lines.push(
      "Not applicable for the software-only product. The application does not include physical accessories or packaging in scope. Cross-reference: Section 7 — Labelling for software release-version labelling."
    );
  } else {
    lines.push(
      "[TBD] — accessories list and sterile-barrier packaging description pending Sprint 3 applicant input on family grouping and packaging characteristics. Cross-reference: Section 7 — Labelling for sterile-barrier and shelf-life statements once captured."
    );
  }
  lines.push("");

  return lines.join("\n");
}

export const generateSection05: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const softwareOnly = isSoftwareOnly(sources);
  const sourceFields = [
    "intake.one_liner",
    "intake.url_fetched_content",
    "wizard.b2_use_environment",
    "wizard.b5_clinical_evidence_status",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "ai_extracted.fields.product_meta.model_number",
    "ai_extracted.fields.product_meta.sterile",
    "ai_extracted.fields.product_meta.setting_of_use",
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
      content: `[Section 5 generation failed: ${msg}]`,
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
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations: [
      {
        citation_id: "[1]",
        source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.4",
        quote:
          "Product specification, including variants and accessories, shall be documented in the Device Master File.",
        exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.4",
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
