/**
 * Section 3 — Intended Use & Indications.
 *
 * Maps to: DMF §8.2 (Descriptive information — intended-use portion).
 * Spec: docs/specs/draft-pack-document-matrix.md Section 3.
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

const SECTION_KEY = "03_intended_use" as const;
const TITLE = "Intended Use & Indications";
const MAX_TOKENS = 1200;

const LlmSchema = z.object({
  indication_paragraph: z.string().min(80).max(1500),
  contraindications: z.string().min(40).max(1500),
  patient_population: z.string().min(40).max(1500),
});
type LlmOutput = z.infer<typeof LlmSchema>;

const Q3_USER_LABEL: Record<string, string> = {
  hcps: "Healthcare professionals",
  patients: "Patients (lay users)",
  both: "Healthcare professionals AND patients (lay users)",
  admin: "Hospital administrators / back-office staff",
};
const Q2_DECISION_LABEL: Record<string, string> = {
  informs_only: "Inform clinical management",
  drives: "Drive clinical management",
  diagnoses_treats: "Diagnose / treat",
};
const B2_ENV_LABEL: Record<string, string> = {
  home: "Patient's home (lay-user setting)",
  opd: "Outpatient clinic / OPD",
  inpatient: "Hospital inpatient ward",
  surgical: "Operating theatre",
  pre_hospital: "Pre-hospital / ambulance / emergency",
  mixed: "Mixed (multiple settings)",
};

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;
  const card = sources.readiness_card;

  return [
    "Generate the body of Section 3 (Intended Use & Indications) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Phrasing variety: open with 'In accordance with MDR 2017 §4' OR 'Per MDR 2017 indications-of-use guidance'. Vary from earlier sections.",
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use statement: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Q3 user type: ${wa.q3 ? Q3_USER_LABEL[wa.q3] : "[TBD]"}`,
    `Q2 decision influence: ${wa.q2 ? Q2_DECISION_LABEL[wa.q2] : "[TBD]"}${wa.q2_defended ? " (user defended after follow-up)" : ""}`,
    `B2 use environment: ${wa.b2_use_environment ? B2_ENV_LABEL[wa.b2_use_environment] : "[TBD]"}`,
    `Q1 clinical state: ${wa.q1 ?? "[TBD]"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}; ACP required: ${card.classification.acp_required}`,
    `AI extraction — patient population: ${ai?.product_meta?.patient_population ?? "[TBD]"}`,
    `AI extraction — user population: ${ai?.product_meta?.user_population ?? "[TBD]"}`,
    `AI extraction — data sensitivity: ${ai?.suggested_wizard_answers?.data_sensitivity ?? "(not captured)"}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object:",
    "```",
    "{",
    '  "indication_paragraph": "60-180 words. State the indication, who uses it, the use environment, and the population. Open with a regulatory citation phrase that has NOT been used in Section 4 (avoid \\"Based on published CDSCO guidance\\" and \\"Per MDR 2017 Schedule II\\"). For AI/ML devices, include the explicit statement that the device DOES NOT perform autonomous diagnosis — clinician remains the decision-maker.",',
    '  "contraindications": "40-180 words. Be honest about contraindications. Where specifics are not in source data, frame as \\"to be confirmed during clinical validation\\" — that is acceptable regulatory language.",',
    '  "patient_population": "40-180 words. Describe the target patient population — demographics, condition, exclusions. If pitch-extract patient_population is null, render \\"[TBD] — pending Sprint 3 patient-population question\\"."',
    "}",
    "```",
    "",
    wa.b2_use_environment === "home"
      ? "Note: B2 = home — include a sentence about lay-user comprehension and (if Q3 includes patients) caregiver supervision."
      : "",
    card.classification.ai_ml_flag
      ? "Note: AI/ML device — `indication_paragraph` MUST include the explicit clinician-decision-maker statement."
      : "",
    wa.q1 === "critical" && wa.q2 === "diagnoses_treats" && wa.q2_defended !== true
      ? "Note: Q1 = critical AND Q2 = diagnoses_treats AND not defended — soften the decision-influence framing toward 'drive clinical management' rather than autonomous diagnose/treat."
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
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;
  const card = sources.readiness_card;

  const lines: string[] = [];
  lines.push("## Indication");
  lines.push("");
  lines.push(llm.indication_paragraph);
  lines.push("");

  lines.push("## Intended user");
  lines.push("");
  const userLabel = wa.q3 ? Q3_USER_LABEL[wa.q3] : "[TBD]";
  const userPop = ai?.product_meta?.user_population;
  lines.push(`${userLabel}${userPop ? ` — specifically: ${userPop}` : ""}.`);
  lines.push("");

  lines.push("## Use environment");
  lines.push("");
  lines.push(
    `${wa.b2_use_environment ? B2_ENV_LABEL[wa.b2_use_environment] : "[TBD] — Tier B B2 question not yet answered"}.`
  );
  lines.push("");

  lines.push("## Patient population");
  lines.push("");
  lines.push(llm.patient_population);
  lines.push("");

  lines.push("## Decision-making role");
  lines.push("");
  lines.push(
    `Per the IMDRF SaMD significance dimension and Tier A Q2 (decision influence), this device is intended to **${wa.q2 ? Q2_DECISION_LABEL[wa.q2] : "[TBD]"}**${wa.q2_defended ? " (applicant confirmed this framing after intake-content review)" : ""}.`
  );
  lines.push("");

  if (card.classification.ai_ml_flag) {
    lines.push("## AI/ML role statement");
    lines.push("");
    lines.push(
      "This device incorporates AI/ML components. It DOES NOT perform autonomous diagnosis or treatment. The clinician remains the responsible decision-maker for every recommendation. Adaptive model behaviour, where applicable, is governed by the Algorithm Change Protocol described in Section 8 — Design & Manufacturing."
    );
    lines.push("");
  }

  lines.push("## Contraindications");
  lines.push("");
  lines.push(llm.contraindications);
  lines.push("");

  // Conditional notes
  const notes: string[] = [];
  if (wa.b2_use_environment === "home") {
    notes.push(
      "Lay-user (non-HCP) operation — Instructions for Use (Section 7 — Labelling) must address comprehension at the general-public reading level per MDR 2017 Fifth Schedule labelling guidance."
    );
  }
  if (
    ai?.suggested_wizard_answers?.data_sensitivity === "identifiable" &&
    Array.isArray(wa.q6) &&
    wa.q6.some((d) => d !== "none")
  ) {
    notes.push(
      "Identifiable patient health data is in scope (Q6). Data-handling intent is documented in Section 9 — Essential Principles Conformity (cybersecurity sub-section)."
    );
  }
  if (notes.length > 0) {
    lines.push("## Notes");
    lines.push("");
    for (const n of notes) lines.push(`- ${n}`);
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection03: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "intake.one_liner",
    "wizard.b1_intended_use_statement",
    "wizard.q1",
    "wizard.q2",
    "wizard.q2_defended",
    "wizard.q3",
    "wizard.q6",
    "wizard.b2_use_environment",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.acp_required",
    "ai_extracted.fields.product_meta.patient_population",
    "ai_extracted.fields.product_meta.user_population",
    "ai_extracted.fields.suggested_wizard_answers.data_sensitivity",
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
      content: `[Section 3 generation failed: ${msg}]`,
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
      source_doc: "MDR 2017 — Medical Devices Rules, 2017 §4",
      quote:
        "Intended use and indications shall be stated in the application and in product labelling.",
      exact_reference: "MDR 2017 §4 (Intended use)",
    },
    {
      citation_id: "[2]",
      source_doc: "IMDRF SaMD framework — significance × situation",
      quote: "Used to anchor the decision-influence framing.",
      exact_reference: "IMDRF SaMD WG/N12 (2014)",
    },
  ];
  if (sources.readiness_card.classification.ai_ml_flag) {
    citations.push({
      citation_id: "[3]",
      source_doc:
        "CDSCO Draft Guidance — Software-as-a-Medical-Device (October 2025)",
      quote:
        "Clinician remains the responsible decision-maker for AI/ML clinical-decision-support outputs.",
      exact_reference: "CDSCO Oct 2025 SaMD Draft (clinician-final framing)",
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
