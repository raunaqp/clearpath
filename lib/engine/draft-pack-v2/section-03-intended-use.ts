/**
 * Section 3 — Intended Use & Indications.
 *
 * Maps to: DMF §8.2 (Descriptive information — intended-use portion).
 *
 * SaMD path (Sprint 2 default): anchors decision-influence framing in
 * the IMDRF SaMD significance dimension and Q1×Q2 matrix; includes an
 * AI/ML autonomous-diagnosis disclaimer when the AI/ML flag is set.
 *
 * Hardware path (Sprint 3 Day 5 afternoon): grounds in population +
 * intended user + use environment + body-contact (Q9) + predicate (Q8)
 * + contraindications — the bible §4.A Stage 1 framing for hardware
 * intended-use statements. Strips IMDRF / Q1×Q2 / AI/ML autonomous-
 * diagnosis framing entirely; those don't apply to hardware. Software-
 * in-device hardware references the §8.15 software V&V sub-block in
 * §11 by cross-ref rather than duplicating SaMD framing here.
 *
 * Dispatch is by `wizard_answers.persona`. The exported
 * `generateSection03` routes to the hardware variant when persona
 * === "manufacturer_hardware"; everything else falls through to the
 * SaMD path which is unchanged from Sprint 2.
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
import { softenCertainty } from "@/lib/engine/soften-certainty";
import { MDR_2017_VERIFIED_CITATIONS_BLOCK } from "./mdr-2017-citations";

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
    "Generate Section 3 (Intended Use & Indications) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with the clinical scope — who the device is for, what condition or context, in what setting. Do NOT open with a regulatory citation; the regulatory anchor (MDR 2017 §4) belongs in a citation, not the opening sentence.",
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
    "Return ONLY this JSON object. Lower-end of each band is usually right.",
    "```",
    "{",
    '  "indication_paragraph": "60-150 words. State the indication, who uses it, the use environment, and the population — in that order. For AI/ML devices, include ONE sentence that the device does not perform autonomous diagnosis and the clinician remains the decision-maker. Do not repeat that statement elsewhere in this section.",',
    '  "contraindications": "40-120 words. Honest about real contraindications for this product class. Specific clinical limits the source data does not disclose → \"[NEEDS INPUT: <what>]\" rather than vague language.",',
    '  "patient_population": "40-120 words. Demographics, condition, exclusions. Where pitch-extract patient_population is null, write \"[NEEDS INPUT: target patient demographics and exclusion criteria]\"."',
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

const generateSection03Samd: SectionGenerator = async (
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

// ────────────────────────────────────────────────────────────────────
// Hardware variant — Sprint 3 Day 5 afternoon
// ────────────────────────────────────────────────────────────────────

/** Q9 PatientContact → human-readable label for the body-contact
 *  statement section. Wizard-explicit; not inferred. */
const Q9_CONTACT_LABEL: Record<string, string> = {
  no_contact: "No patient contact (lab/process device)",
  surface_intact_skin: "Surface contact — intact skin",
  surface_mucosal: "Surface contact — mucous membrane",
  blood_path_indirect: "External communicating — blood (indirect path)",
  blood_path_direct: "External communicating — blood (direct circulation)",
  invasive_transient_lt_24h:
    "External communicating — tissue/bone (limited duration ≤ 24h)",
  invasive_long_term_30d:
    "External communicating — tissue/bone (prolonged duration > 24h to 30d)",
  implant_gt_30d: "Implant — tissue/bone OR blood (long-term > 30d)",
};

/** Q8 PredicateExists → human-readable label. */
const Q8_PREDICATE_LABEL: Record<string, string> = {
  yes_indian: "Indian predicate device available",
  yes_only_foreign: "Only foreign predicate device available",
  no: "No predicate device — novel",
  not_sure: "Predicate status uncertain",
};

// Per-section cap calibration (see feedback-schema-cap-calibration
// memory). §3 indication paragraph covers multiple elements
// (indication × user × environment × population) so deserves the
// tier-matched complex ceiling of 2000. Other fields are single-
// concern and cap lower.
const HardwareLlmSchema = z.object({
  indication_paragraph: z.string().min(100).max(2000),
  patient_population: z.string().min(60).max(1500),
  contraindications: z.string().min(60).max(1500),
  body_contact_statement: z.string().min(60).max(1500),
  predicate_disclosure: z.string().min(40).max(1000),
});
type HardwareLlmOutput = z.infer<typeof HardwareLlmSchema>;

function buildHardwareUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;
  const card = sources.readiness_card;

  const q9Label = wa.q9 ? Q9_CONTACT_LABEL[wa.q9] : "[NEEDS INPUT: Q9 patient_contact not captured]";
  const q8Label = wa.q8 ? Q8_PREDICATE_LABEL[wa.q8] : "[NEEDS INPUT: Q8 predicate not captured]";
  const userLabel = wa.q3 ? Q3_USER_LABEL[wa.q3] : "[NEEDS INPUT: Q3 user type not captured]";
  const envLabel = wa.b2_use_environment
    ? B2_ENV_LABEL[wa.b2_use_environment]
    : "[NEEDS INPUT: Tier B B2 use environment not captured]";

  return [
    "Generate Section 3 (Intended Use & Indications) for a CDSCO MD-7 / MD-3 hardware Submission Pack.",
    "",
    "This is the HARDWARE persona — a physical medical device manufacturer. DO NOT use any of the following framings (they are SaMD-only and have leaked into hardware packs before):",
    "- IMDRF SaMD significance × situation matrix",
    "- Q1×Q2 significance / situation derivation",
    "- 'Decision-influence framing' as a top-level concept",
    "- AI/ML autonomous-diagnosis disclaimer",
    "- 'Clinician remains the decision-maker' boilerplate",
    "- 'Algorithm Change Protocol (ACP)' or 'PCCP' framing",
    "- IEC 62304 or IEC 81001-5-1 referenced in the indication prose",
    "",
    "Hardware intended-use grounds in BIBLE §4.A Stage 1 (intended-use foundation) — six elements: medical purpose, condition/indication, patient population, intended user, use environment, contraindications, plus a body-contact statement (Q9) and predicate disclosure (Q8) that are specific to hardware.",
    "",
    MDR_2017_VERIFIED_CITATIONS_BLOCK,
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use statement: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Q3 intended user: ${userLabel}`,
    `B2 use environment: ${envLabel}`,
    `Q9 patient contact (wizard-explicit): ${q9Label}`,
    `Q8 predicate (wizard-explicit): ${q8Label}`,
    `AI extraction — patient population: ${ai?.product_meta?.patient_population ?? "(not captured)"}`,
    `AI extraction — user population: ${ai?.product_meta?.user_population ?? "(not captured)"}`,
    `AI extraction — setting of use: ${ai?.product_meta?.setting_of_use ?? "(not captured)"}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Aim for the lower end of word bands.",
    "```",
    "{",
    '  "indication_paragraph": "100-220 words. Lead with the medical purpose, the condition/indication, the intended user, the use environment, and the patient population — in that order. Hardware framing. Reference the body-contact tier ONCE in this paragraph (e.g., \\"as a long-term implant\\") to anchor the device class.",',
    '  "patient_population": "60-150 words. Demographics, condition, exclusions. Use [NEEDS INPUT: ...] for genuinely-missing population specifics rather than inventing them.",',
    '  "contraindications": "60-150 words. Real contraindications for this product class — material hypersensitivity, anatomic exclusions, comorbidity exclusions, paediatric/pregnancy where relevant. Mark applicant-specific limits as [NEEDS INPUT: ...].",',
    '  "body_contact_statement": "60-150 words. Frame the patient-contact tier (per Q9) as a regulatory categorisation point. Cross-reference §13 Biocompatibility for the ISO 10993 panel that follows from this tier. Cross-reference §14 Sterilization if the device is sterile.",',
    '  "predicate_disclosure": "40-100 words. State the predicate basis per Q8. If Q8 = \\"no\\" (novel), call out the MD-26 / MD-27 pre-permission path required before MD-7 and cross-reference §6 Predicate Comparison for the substantial-equivalence analysis. If Q8 = \\"yes_indian\\" or \\"yes_only_foreign\\", reference §6 for the substantial-equivalence analysis."',
    "}",
    "```",
    "",
    "Apply softening rules from the system prompt. Do not invent applicant facts. Use [NEEDS INPUT: ...] for genuinely-missing values. Hardware framing — no IMDRF, no Q1×Q2, no AI/ML autonomous-diagnosis statement.",
    wa.q8 === "no"
      ? "Note: Q8 = no (novel) — predicate_disclosure MUST surface the MD-26 / MD-27 pre-permission requirement."
      : "",
    wa.q9 === "implant_gt_30d"
      ? "Note: Q9 = implant_gt_30d — body_contact_statement should anchor in the long-term-implant tier."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatHardwareMarkdown(args: {
  llm: HardwareLlmOutput;
  sources: SourceData;
}): string {
  const { llm, sources } = args;
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;

  const lines: string[] = [];
  lines.push("## Indication");
  lines.push("");
  lines.push(softenCertainty(llm.indication_paragraph));
  lines.push("");

  lines.push("## Intended user");
  lines.push("");
  const userLabel = wa.q3 ? Q3_USER_LABEL[wa.q3] : "[NEEDS INPUT: Q3 user type not captured]";
  const userPop = ai?.product_meta?.user_population;
  lines.push(
    softenCertainty(`${userLabel}${userPop ? ` — specifically: ${userPop}` : ""}.`)
  );
  lines.push("");

  lines.push("## Use environment");
  lines.push("");
  lines.push(
    softenCertainty(
      `${wa.b2_use_environment ? B2_ENV_LABEL[wa.b2_use_environment] : "[NEEDS INPUT: Tier B B2 use environment not captured]"}.`
    )
  );
  lines.push("");

  lines.push("## Patient population");
  lines.push("");
  lines.push(softenCertainty(llm.patient_population));
  lines.push("");

  lines.push("## Body-contact tier (Q9 wizard-explicit)");
  lines.push("");
  const q9Label = wa.q9 ? Q9_CONTACT_LABEL[wa.q9] : "[NEEDS INPUT: Q9 patient_contact not captured]";
  lines.push(`**Tier:** ${q9Label}`);
  lines.push("");
  lines.push(softenCertainty(llm.body_contact_statement));
  lines.push("");

  lines.push("## Predicate basis (Q8 wizard-explicit)");
  lines.push("");
  const q8Label = wa.q8 ? Q8_PREDICATE_LABEL[wa.q8] : "[NEEDS INPUT: Q8 predicate not captured]";
  lines.push(`**Status:** ${q8Label}`);
  lines.push("");
  lines.push(softenCertainty(llm.predicate_disclosure));
  lines.push("");

  lines.push("## Contraindications");
  lines.push("");
  lines.push(softenCertainty(llm.contraindications));
  lines.push("");

  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §4 Classification & Pathway — class derivation + MD-3 / MD-7 path");
  lines.push("- §6 Predicate Comparison — full substantial-equivalence analysis");
  lines.push("- §13 Biocompatibility — ISO 10993 panel keyed to Q9 patient contact");
  lines.push("- §7 Labelling — intended-use statement on label + IFU");

  return lines.join("\n");
}

const generateSection03Hardware: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "intake.one_liner",
    "wizard.b1_intended_use_statement",
    "wizard.q3",
    "wizard.q8",
    "wizard.q9",
    "wizard.b2_use_environment",
    "ai_extracted.product_meta.patient_population",
    "ai_extracted.product_meta.user_population",
    "ai_extracted.product_meta.setting_of_use",
  ];

  let llmOutput: HardwareLlmOutput;
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;

  try {
    const r = await callLlm({
      assessmentId: sources.assessment_id,
      callLayer: "draft_pack_v2",
      model: SECTION_MODEL,
      userMessage: buildHardwareUserMessage(sources),
      systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      dryRun: opts.dry_run,
      log: opts.log,
    });
    cost = r.costUsd;
    usage = r.usage;
    llmOutput = HardwareLlmSchema.parse(parseStrictJson(r.rawText));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[§3 hardware] failed: ${msg}`);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 3 hardware generation failed: ${msg}]`,
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

  const content = formatHardwareMarkdown({ llm: llmOutput, sources });
  const wordCount = content.trim().split(/\s+/).length;

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR 2017 — Medical Devices Rules, 2017 §4",
      quote:
        "Intended use and indications stated in application and product labelling.",
      exact_reference: "MDR 2017 §4 (Intended use)",
    },
    {
      citation_id: "[2]",
      source_doc: "MDR-2017 Fourth Schedule Appendix II",
      quote: "Descriptive information — intended use portion.",
      exact_reference: "DMF §8.2",
    },
    {
      citation_id: "[3]",
      source_doc: "Bible §4.A Stage 1 (hardware persona intended-use foundation)",
      quote:
        "Intended-use statement covers medical purpose, condition, patient population, intended user, environment, contraindications.",
      exact_reference: "Bible §4.A Stage 1; FAQ §50",
    },
    ...(sources.wizard_answers.q8 === "no"
      ? [
          {
            citation_id: "[4]",
            source_doc: "MDR-2017 Forms MD-26 / MD-27",
            quote:
              "Novel devices without an Indian predicate require MD-26 pre-permission before MD-7; grant on MD-27.",
            exact_reference: "MD-7 checklist §11.0",
          },
        ]
      : []),
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
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};

// Dispatcher — persona-aware. SaMD behaviour is unchanged from
// Sprint 2; hardware path is Day-5 afternoon work.
export const generateSection03: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  if (sources.wizard_answers.persona === "manufacturer_hardware") {
    return generateSection03Hardware(sources, opts);
  }
  return generateSection03Samd(sources, opts);
};
