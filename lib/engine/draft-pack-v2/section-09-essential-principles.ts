/**
 * Section 9 — Essential Principles Conformity.
 *
 * Maps to: DMF §8.8 Essential Principles checklist.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 9.
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

const SECTION_KEY = "09_essential_principles" as const;
const TITLE = "Essential Principles Conformity";
const MAX_TOKENS = 4000;

// Phase 4b iteration — applicability accepts free-form strings (Sonnet
// often returns "yes/n_a per product" style mixed values); we normalize
// to lower-case at markdown-format time.
const EpRowSchema = z.object({
  principle: z.string(),
  applicability: z.string(),
  evidence_reference: z.string(),
  rationale: z.string(),
});
const LlmSchema = z.object({
  essential_principles_table: z.array(EpRowSchema).min(8),
  software_conformance_subsection: z.string().nullable(),
  cybersecurity_subsection: z.string().nullable(),
  usability_engineering_summary: z.string().min(80).max(3000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function softwarePresent(sources: SourceData): boolean {
  const q = sources.readiness_card.classification.class_qualifier ?? "";
  if (q.startsWith("AI-CDS") || q.includes("SaMD")) return true;
  if (sources.readiness_card.classification.ai_ml_flag) return true;
  const aiClass = sources.ai_extracted?.suggested_wizard_answers?.device_class ?? "";
  return aiClass.startsWith("samd_");
}

function cybersecurityTriggered(sources: SourceData): boolean {
  const q6 = sources.wizard_answers.q6 ?? [];
  const q6Sensitive = q6.some((v) => v !== "none");
  const aiData = sources.ai_extracted?.suggested_wizard_answers?.data_sensitivity;
  return q6Sensitive || (aiData != null && aiData !== "none");
}

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const ai = sources.ai_extracted;
  const sw = softwarePresent(sources);
  const cyber = cybersecurityTriggered(sources);
  const sterile = (ai?.product_meta?.sterile ?? "")
    .toLowerCase()
    .includes("sterile") &&
    !(ai?.product_meta?.sterile ?? "")
      .toLowerCase()
      .includes("non-sterile");

  return [
    "Generate Section 9 (Essential Principles Conformity) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'Per MDR 2017 First Schedule (Essential Principles)' OR 'In conformity with the Essential Principles documented in MDR 2017'. Vary from earlier openers.",
    "",
    "## Applicant data",
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}; ACP required: ${card.classification.acp_required}`,
    `Sterile: ${sterile ? "yes" : "no/[TBD]"}`,
    `Software present: ${sw}`,
    `Cybersecurity trigger: ${cyber} (q6 = ${JSON.stringify(wa.q6 ?? [])}, ai data_sensitivity = ${ai?.suggested_wizard_answers?.data_sensitivity ?? "null"})`,
    `C2 cybersecurity posture: ${JSON.stringify(wa.c2_cybersecurity_posture ?? "(not captured)")}`,
    `Intended user (Q3): ${wa.q3 ?? "[TBD]"}`,
    `Use environment (B2): ${wa.b2_use_environment ?? "[TBD]"}`,
    `Q5 integrations: ${wa.q5 ?? "(not answered)"}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object:",
    "```",
    "{",
    `  "essential_principles_table": [`,
    `    { "principle": "EP1 — General requirements (safety + performance)", "applicability": "yes", "evidence_reference": "Section 10 — Risk Management; Section 11 — V&V", "rationale": "${card.classification.cdsco_class === "D" ? "≥ 50 words rationale (Class D heightened scrutiny)" : "30-80 words rationale"}" },`,
    `    { "principle": "EP2 — Risk management (ISO 14971)", "applicability": "yes", "evidence_reference": "Section 10", "rationale": "..." },`,
    `    { "principle": "EP3 — Design and construction characteristics", "applicability": "yes", "evidence_reference": "Section 2; Section 8", "rationale": "..." },`,
    `    { "principle": "EP4 — Performance (intended use achievement)", "applicability": "yes", "evidence_reference": "Section 11; Section 12", "rationale": "..." },`,
    `    { "principle": "EP5 — Lifetime / shelf life", "applicability": "${sterile ? "yes" : "yes/n_a per product"}", "evidence_reference": "Section 5; Section 11", "rationale": "..." },`,
    `    { "principle": "EP6 — Transport and storage", "applicability": "yes/n_a", "evidence_reference": "Section 7", "rationale": "..." },`,
    `    { "principle": "EP7 — Benefit-risk balance", "applicability": "yes", "evidence_reference": "Section 10; Section 12", "rationale": "..." },`,
    `    { "principle": "EP8 — Chemical / physical / biological properties", "applicability": "${sterile || ai?.product_meta?.patient_population ? "yes" : "n_a"}", "evidence_reference": "Section 2; Section 11 biocompatibility (if applicable)", "rationale": "..." },`,
    `    { "principle": "EP9 — Infection and microbial contamination", "applicability": "${sterile ? "yes" : "n_a (non-sterile or software-only)"}", "evidence_reference": "Section 8 sterilization", "rationale": "..." },`,
    `    { "principle": "EP10 — Construction / environmental interaction", "applicability": "yes/n_a", "evidence_reference": "Section 2", "rationale": "..." },`,
    sw
      ? `    { "principle": "EP-SW — IEC 62304 / IEC 81001-5-1 software conformance", "applicability": "yes", "evidence_reference": "Section 8 SDLC; Section 11 SwV&V", "rationale": "..." }`
      : `    { "principle": "EP-SW — software conformance", "applicability": "n_a (no software)", "evidence_reference": "N/A", "rationale": "No software in the device." }`,
    `  ],`,
    sw
      ? '  "software_conformance_subsection": "180-350 words. IEC 62304 (lifecycle), IEC 81001-5-1 (cybersecurity), IEC 62366-1 (usability). Cite Section 8 SDLC + Section 11 software V&V. Adaptive AI → cite ACP cross-reference.",'
      : '  "software_conformance_subsection": null,',
    cyber
      ? `  "cybersecurity_subsection": "150-300 words. Map C2 cybersecurity posture (${JSON.stringify(wa.c2_cybersecurity_posture ?? "(not captured)")}) to IEC 81001-5-1 + DPDP 2023. Document data-at-rest encryption, data-in-transit encryption, authentication model. Acknowledge gaps with [TBD]."`
      : '  "cybersecurity_subsection": null,',
    `  ,`,
    `  "usability_engineering_summary": "80-200 words. IEC 62366-1 framing. Intended user: ${wa.q3 ?? "[TBD]"}; use environment: ${wa.b2_use_environment ?? "[TBD]"}. Lay-user home environment → higher usability burden (formative + summative testing referenced)."`,
    "}",
    "```",
    "",
    card.classification.cdsco_class === "D"
      ? "Note: Class D — each row rationale ≥ 50 words; line-by-line examination basis."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
}): string {
  const { llm } = args;
  const lines: string[] = [];

  lines.push("## Essential Principles checklist");
  lines.push("");
  lines.push("| # | Principle | Applicability | Evidence | Rationale |");
  lines.push("|---|---|---|---|---|");
  llm.essential_principles_table.forEach((row, i) => {
    lines.push(
      `| EP${i + 1} | ${row.principle} | ${row.applicability} | ${row.evidence_reference} | ${row.rationale.replace(/\|/g, "\\|").slice(0, 350)}${row.rationale.length > 350 ? "..." : ""} |`
    );
  });
  lines.push("");

  if (llm.software_conformance_subsection) {
    lines.push("## Software conformance (IEC 62304 / 81001-5-1 / 62366-1)");
    lines.push("");
    lines.push(llm.software_conformance_subsection);
    lines.push("");
  }

  if (llm.cybersecurity_subsection) {
    lines.push("## Cybersecurity posture (IEC 81001-5-1 + DPDP 2023)");
    lines.push("");
    lines.push(llm.cybersecurity_subsection);
    lines.push("");
  }

  lines.push("## Usability engineering (IEC 62366-1)");
  lines.push("");
  lines.push(llm.usability_engineering_summary);
  lines.push("");

  // Non-applicability justifications surfaced from the table
  const naRows = llm.essential_principles_table.filter(
    (r) => r.applicability === "n_a"
  );
  if (naRows.length > 0) {
    lines.push("## Non-applicability justifications");
    lines.push("");
    for (const r of naRows) {
      lines.push(`- **${r.principle}** — ${r.rationale}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection09: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.acp_required",
    "wizard.q3",
    "wizard.q5",
    "wizard.q6",
    "wizard.b2_use_environment",
    "wizard.c2_cybersecurity_posture",
    "ai_extracted.fields.product_meta.sterile",
    "ai_extracted.fields.product_meta.patient_population",
    "ai_extracted.fields.suggested_wizard_answers.data_sensitivity",
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
      content: `[Section 9 generation failed: ${msg}]`,
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
      source_doc: "MDR 2017 — First Schedule (Essential Principles)",
      quote:
        "Essential principles of safety and performance of medical devices.",
      exact_reference: "MDR 2017 First Schedule",
    },
  ];
  if (llmOutput.software_conformance_subsection) {
    citations.push({
      citation_id: "[2]",
      source_doc: "IEC 62304 / IEC 81001-5-1 / IEC 62366-1",
      quote:
        "Software lifecycle, cybersecurity, and usability engineering standards for medical devices.",
      exact_reference: "IEC 62304:2006/AMD1, IEC 81001-5-1:2021, IEC 62366-1:2015",
    });
  }
  if (llmOutput.cybersecurity_subsection) {
    citations.push({
      citation_id: "[3]",
      source_doc: "Digital Personal Data Protection Act 2023 (India)",
      quote:
        "Obligations on processors of personal data, including health data, in India.",
      exact_reference: "DPDP Act 2023",
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
