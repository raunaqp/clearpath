/**
 * Section 7 — Labelling.
 *
 * Maps to: DMF §8.6 Labelling information (Labels, Instruction for Use, etc.)
 * Spec: docs/specs/draft-pack-document-matrix.md Section 7.
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

const SECTION_KEY = "07_labelling" as const;
const TITLE = "Labelling";
const MAX_TOKENS = 2500;

// Phase 4b iteration — bounds relaxed for Sonnet prose variance.
const LlmSchema = z.object({
  ifu_summary: z.string().min(200).max(7000),
  intended_use_label: z.string().min(20).max(1500),
  contraindications_label: z.string().min(20).max(1500),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function buildUserMessage(sources: SourceData): string {
  const ai = sources.ai_extracted;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;

  const sterile = (ai?.product_meta?.sterile ?? "").toLowerCase().includes("non-sterile")
    ? "non_sterile"
    : (ai?.product_meta?.sterile ?? "").toLowerCase().includes("sterile")
      ? "sterile"
      : "[TBD]";

  return [
    "Generate Section 7 (Labelling) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with what the user-facing labelling actually covers (label + IFU) and who reads it (clinician vs lay user, anchored to Q3 + B2). The Fifth Schedule citation belongs in a footnote-style reference, not the opening clause.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Use environment (B2): ${wa.b2_use_environment ?? "[TBD]"}`,
    `User type (Q3): ${wa.q3 ?? "[TBD]"}`,
    `Sterile status: ${sterile}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    `Class qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `Manufacturer name: ${ai?.company?.legal_name ?? "[TBD]"}`,
    `Manufacturer address: ${ai?.company?.registered_address ?? "[TBD]"}`,
    `Manufacturing address: ${ai?.company?.manufacturing_address ?? ai?.company?.registered_address ?? "[TBD]"}`,
    `Model number: ${ai?.product_meta?.model_number ?? "[TBD]"}`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "ifu_summary": "200-350 words. Working IFU draft covering: indications; intended users; intended environment; pre-use checks; directions for use; warnings & precautions; storage; cleaning/disinfection (or software update for SaMD); disposal/decommission; manufacturer contact. Reading level: ${wa.b2_use_environment === "home" ? "general-public lay user (8th-grade equivalent — short sentences, bullet steps)" : "qualified clinician"}. Use \"[NEEDS INPUT: <what>]\" for genuinely missing specifics (specific torque values, lot codes, etc.). Do NOT invent.",`,
    '  "intended_use_label": "≤ 50 words. Label-card statement of intended use. Concise — a label has limited space.",',
    '  "contraindications_label": "≤ 60 words. Concise contraindications statement suitable for label/IFU."',
    "}",
    "```",
    "",
    sterile === "sterile"
      ? "Note: sterile device — IFU must address sterile-barrier inspection and single-use/sterile-pack-expiry."
      : "",
    card.classification.ai_ml_flag
      ? "Note: AI/ML device — include the device-label disclosure that the device does NOT perform autonomous diagnosis/treatment."
      : "",
    wa.b2_use_environment === "home" && (wa.q3 === "patients" || wa.q3 === "both")
      ? "Note: lay-user home setting with patient user — include a caregiver/parent-supervised sub-section."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const ai = sources.ai_extracted;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const sterile = (ai?.product_meta?.sterile ?? "").toLowerCase().includes("non-sterile")
    ? "non_sterile"
    : (ai?.product_meta?.sterile ?? "").toLowerCase().includes("sterile")
      ? "sterile"
      : "[TBD]";

  const lines: string[] = [];
  lines.push("## Manufacturer details");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(
    `| Manufacturer (legal) | ${ai?.company?.legal_name ?? "[TBD]"} |`
  );
  lines.push(
    `| Registered address | ${ai?.company?.registered_address ?? "[TBD]"} |`
  );
  lines.push(
    `| Manufacturing address | ${ai?.company?.manufacturing_address ?? ai?.company?.registered_address ?? "[TBD]"} |`
  );
  lines.push(
    `| Product / brand | ${ai?.device_name ?? "[TBD]"} |`
  );
  lines.push(
    `| Model number | ${ai?.product_meta?.model_number ?? "[TBD]"} |`
  );
  lines.push("");

  lines.push("## Intended-use label");
  lines.push("");
  lines.push(llm.intended_use_label);
  lines.push("");

  lines.push("## Contraindications");
  lines.push("");
  lines.push(llm.contraindications_label);
  lines.push("");

  // Regulatory marks block (derived).
  lines.push("## Regulatory marks");
  lines.push("");
  const marks: string[] = [];
  if (sterile === "sterile") {
    marks.push("Sterile — single use unless otherwise specified.");
  }
  if (card.classification.class_qualifier?.includes("SaMD") || card.classification.ai_ml_flag) {
    marks.push("Software medical device — version-controlled release.");
  }
  if (card.classification.ai_ml_flag) {
    marks.push(
      "This device incorporates AI/ML. It does NOT perform autonomous diagnosis or treatment. The clinician remains the responsible decision-maker."
    );
  }
  if (wa.q3 === "hcps" || wa.q3 === "both") {
    marks.push("For use by qualified clinicians.");
  }
  marks.push("[TBD] CDSCO manufacturing licence number — populated post-grant.");
  for (const m of marks) lines.push(`- ${m}`);
  lines.push("");

  lines.push("## Instructions for Use (IFU summary)");
  lines.push("");
  lines.push(llm.ifu_summary);
  lines.push("");

  // Cross-references / conditional notes
  const notes: string[] = [];
  if (sterile === "sterile") {
    notes.push(
      "Sterilisation method and validation evidence: Section 8 — Design & Manufacturing (DMF §8.14)."
    );
  }
  if (card.classification.ai_ml_flag) {
    notes.push(
      "Algorithm Change Protocol governing model updates: Section 8 — Design & Manufacturing (ACP sub-block)."
    );
  }
  if (notes.length > 0) {
    lines.push("## Cross-references");
    lines.push("");
    for (const n of notes) lines.push(`- ${n}`);
    lines.push("");
  }
  return lines.join("\n");
}

export const generateSection07: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "intake.one_liner",
    "wizard.b1_intended_use_statement",
    "wizard.b2_use_environment",
    "wizard.q3",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.class_qualifier",
    "ai_extracted.fields.company.legal_name",
    "ai_extracted.fields.company.registered_address",
    "ai_extracted.fields.company.manufacturing_address",
    "ai_extracted.fields.device_name",
    "ai_extracted.fields.product_meta.model_number",
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
      content: `[Section 7 generation failed: ${msg}]`,
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
        source_doc: "MDR 2017 — Fifth Schedule (Labelling)",
        quote:
          "Particulars to be specified on labels of medical devices: intended use, manufacturer, model, batch, expiry, warnings, instructions.",
        exact_reference: "MDR 2017 Fifth Schedule",
      },
      {
        citation_id: "[2]",
        source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.6",
        quote: "Labelling information (Labels, Instruction for Use, etc.).",
        exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.6",
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
