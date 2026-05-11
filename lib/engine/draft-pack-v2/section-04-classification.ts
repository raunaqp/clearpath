/**
 * Section 4 — Classification & Grouping.
 *
 * Maps to: DMF §8.3 Justification for the Medical Device Grouping.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 4.
 *
 * Strategy: most fields are `derived` deterministically from
 * readiness_card.classification. Only three fields require LLM
 * synthesis (imdrf_rationale, cdsco_rationale, grouping_statement).
 * One Sonnet 4.6 call covers all three in a single JSON response.
 *
 * Anchor section — generated first by the orchestrator. Other sections
 * cross-reference its classification + pathway outputs.
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

const SECTION_KEY = "04_classification_grouping" as const;
const TITLE = "Classification & Grouping";
const MAX_TOKENS = 1200;

const LlmSchema = z.object({
  imdrf_rationale: z.string().min(80).max(2000),
  cdsco_rationale: z.string().min(80).max(2000),
  grouping_statement: z.string().min(40).max(800),
});

type LlmOutput = z.infer<typeof LlmSchema>;

function buildUserMessage(sources: SourceData): string {
  const card = sources.readiness_card;
  const wa = sources.wizard_answers;
  const ai = sources.ai_extracted;

  // Q1/Q2 raw enums + human-readable labels for the IMDRF matrix.
  const q1 = wa.q1 ?? "(not answered)";
  const q2 = wa.q2 ?? "(not answered)";
  const q1Label =
    q1 === "critical"
      ? "Critical"
      : q1 === "serious"
        ? "Serious"
        : q1 === "non_serious"
          ? "Non-serious"
          : q1 === "varies"
            ? "Varies"
            : "Unknown";
  const q2Label =
    q2 === "diagnoses_treats"
      ? "Diagnose / treat"
      : q2 === "drives"
        ? "Drive clinical management"
        : q2 === "informs_only"
          ? "Inform clinical management"
          : "Unknown";

  // Predicate signal (Phase 3.5 b3 model). Wizard b3_no_predicate
  // OVERRIDES readiness_card.novel_or_predicate.
  const novelOrPredicate =
    wa.b3_no_predicate === true
      ? "novel"
      : (wa.b3_predicate_devices?.length ?? 0) > 0
        ? "has_predicate"
        : (card.classification.novel_or_predicate ?? "(unspecified)");

  // ai_extracted regulatory signals are non-load-bearing here; we
  // surface them for the LLM's situational awareness only.
  const aiSummary = ai
    ? `AI extraction: device_class=${ai.suggested_wizard_answers?.device_class ?? "null"}, ai_ml=${ai.suggested_wizard_answers?.ai_ml ?? "null"}, suggested_classification=${ai.suggested_classification ?? "null"}.`
    : "AI extraction: not run (one-liner-only intake).";

  return [
    "Generate Section 4 (Classification & Grouping) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: anchor the classification call by walking through the IMDRF significance × situation derivation BEFORE invoking MDR 2017 Schedule II. Substance before citation. Use varied sentence structure — do not start three consecutive sentences with 'Per MDR 2017' or 'Based on published CDSCO guidance'.",
    "",
    "## Applicant data",
    `Product (one-liner): ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not yet captured)"}`,
    "",
    "## Risk Card classification (authoritative — do NOT contradict)",
    `cdsco_class: ${card.classification.cdsco_class ?? "(null — not a medical device)"}`,
    `class_qualifier: ${card.classification.class_qualifier ?? "(none)"}`,
    `imdrf_category: ${card.classification.imdrf_category ?? "(null)"}`,
    `medical_device_status: ${card.classification.medical_device_status}`,
    `ai_ml_flag: ${card.classification.ai_ml_flag}`,
    `acp_required: ${card.classification.acp_required}`,
    `novel_or_predicate (effective): ${novelOrPredicate}`,
    "",
    "## IMDRF matrix inputs",
    `Q1 clinical state (wizard.q1): ${q1Label} (${q1})`,
    `Q2 decision influence (wizard.q2): ${q2Label} (${q2})`,
    "",
    "## Other context",
    aiSummary,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Aim for the lower end of word bands; Class C/D + novel earns expansion (heightened scrutiny), most other cases do not.",
    "```",
    "{",
    `  "imdrf_rationale": "80-150 words. Walk through the significance × situation derivation (${q2Label} × ${q1Label}) → Category ${card.classification.imdrf_category ?? "X"}. Cite IMDRF SaMD WG/N12 where relevant — once.",`,
    `  "cdsco_rationale": "80-150 words. Tie the IMDRF category to CDSCO Class ${card.classification.cdsco_class ?? "X"}. Cite MDR 2017 Schedule II or the Oct 2025 SaMD draft — once each, where they earn their place.",`,
    `  "grouping_statement": "40-100 words. If the source data does not name variants or accessories, write one sentence stating the single-product assumption and mark variants with \"[NEEDS INPUT: model variants, SKU codes, accessories if any]\"."`,
    "}",
    "```",
    "",
    "Apply softening rules from the system prompt. Do not contradict the Risk Card's classification; expand on it. Do not invent applicant facts — use only what's above.",
    sources.readiness_card.classification.cdsco_class === "D"
      ? "Note: Class D — heightened scrutiny. cdsco_rationale should be ≥ 150 words and reference Schedule II line-by-line examination basis."
      : "",
    novelOrPredicate === "novel"
      ? "Note: novel device (no predicate). cdsco_rationale must reference the MD-26 → MD-27 pre-permission requirement before MD-7."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMarkdown(args: {
  llm: LlmOutput;
  sources: SourceData;
  novelOrPredicate: string;
}): string {
  const card = args.sources.readiness_card;
  const cls = card.classification;
  const q1 = args.sources.wizard_answers.q1 ?? "(not answered)";
  const q2 = args.sources.wizard_answers.q2 ?? "(not answered)";

  const lines: string[] = [];
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| CDSCO class | ${cls.cdsco_class ?? "[TBD]"} |`);
  lines.push(`| Class qualifier | ${cls.class_qualifier ?? "—"} |`);
  lines.push(`| IMDRF category | ${cls.imdrf_category ?? "[TBD]"} |`);
  lines.push(`| Medical device status | ${cls.medical_device_status} |`);
  lines.push(`| AI/ML flag | ${cls.ai_ml_flag ? "Yes" : "No"} |`);
  lines.push(`| ACP required | ${cls.acp_required ? "Yes" : "No"} |`);
  lines.push(`| Novel or predicate | ${args.novelOrPredicate} |`);
  lines.push("");

  lines.push("## IMDRF significance × situation");
  lines.push("");
  lines.push(`Wizard Q1 (clinical state): **${q1}**`);
  lines.push(`Wizard Q2 (decision influence): **${q2}**`);
  lines.push("");
  lines.push(args.llm.imdrf_rationale);
  lines.push("");

  lines.push("## CDSCO classification rationale");
  lines.push("");
  lines.push(args.llm.cdsco_rationale);
  lines.push("");

  lines.push("## Medical device grouping");
  lines.push("");
  lines.push(args.llm.grouping_statement);
  lines.push("");

  // Conditional sub-blocks per Section 4.C of the matrix.
  if (cls.cdsco_class === "D") {
    lines.push("## Class D — heightened scrutiny note");
    lines.push("");
    lines.push(
      "Class D devices undergo line-by-line Essential Principles examination per CDSCO MDR 2017. Clinical evidence (Section 12) is effectively required at submission. Cross-reference: Section 9 — Essential Principles Conformity, Section 12 — Clinical Evidence."
    );
    lines.push("");
  }
  if (cls.ai_ml_flag && cls.class_qualifier === "AI-CDS") {
    lines.push("## Algorithm Change Protocol — pathway note");
    lines.push("");
    lines.push(
      "This device is flagged as AI-CDS. Under the October 2025 CDSCO Software-as-a-Medical-Device draft guidance, an Algorithm Change Protocol (ACP) is expected as part of the Risk Management File (Section 10) and the Design & Manufacturing file (Section 8). Cross-reference: Section 8 — Design & Manufacturing."
    );
    lines.push("");
  }
  if (cls.class_qualifier === "scoped") {
    lines.push("## Sub-feature scoping disclosure");
    lines.push("");
    lines.push(
      "The parent platform is not in regulatory scope; only the scoped sub-feature described in Section 3 (Intended Use & Indications) carries the medical-device classification."
    );
    lines.push("");
  }
  if (args.novelOrPredicate === "novel") {
    lines.push("## Novel device — pre-permission note");
    lines.push("");
    lines.push(
      "No predicate device is claimed. Per MDR 2017, novel devices require MD-26 → MD-27 pre-permission **before** the MD-3 / MD-7 manufacturing licence application. Cross-reference: Section 6 — Predicate Device Comparison."
    );
    lines.push("");
  }
  if (
    cls.class_qualifier === "IVD" ||
    cls.class_qualifier === "IVD-SaMD"
  ) {
    lines.push("## IVD path — Sprint 3 stub");
    lines.push("");
    lines.push(
      "[TBD] IVD-specific classification (Class A/B IVD via MD-3; Class C/D IVD via MD-7 with separate IVD Master File per Appendix II) will be added in Sprint 3. This Sprint 2 Draft Pack covers the medical-device path framework only."
    );
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection04: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const novelOrPredicate =
    sources.wizard_answers.b3_no_predicate === true
      ? "novel"
      : (sources.wizard_answers.b3_predicate_devices?.length ?? 0) > 0
        ? "has_predicate"
        : (sources.readiness_card.classification.novel_or_predicate ??
            "unknown");

  const sourceFields = [
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.imdrf_category",
    "readiness_card.classification.medical_device_status",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.classification.acp_required",
    "readiness_card.classification.novel_or_predicate",
    "wizard.q1",
    "wizard.q2",
    "wizard.b1_intended_use_statement",
    "wizard.b3_no_predicate",
    "wizard.b3_predicate_devices",
    "intake.one_liner",
    "ai_extracted.fields.suggested_wizard_answers.device_class",
    "ai_extracted.fields.suggested_wizard_answers.ai_ml",
  ];

  const dryRun = opts.dry_run;
  const log = opts.log;

  let llmOutput: LlmOutput;
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;

  try {
    const userMessage = buildUserMessage(sources);
    const llmResult = await callLlm({
      assessmentId: sources.assessment_id,
      callLayer: "draft_pack_v2",
      model: SECTION_MODEL,
      userMessage,
      systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      dryRun,
      log,
    });
    cost = llmResult.costUsd;
    usage = llmResult.usage;
    llmOutput = LlmSchema.parse(parseStrictJson(llmResult.rawText));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section ${sectionNumberFromKey(SECTION_KEY)} generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        source_fields: sourceFields,
        model: SECTION_MODEL,
        llm_cost_usd: cost,
        generated_at: startedAt,
        dry_run: dryRun,
        error_message: msg,
        usage,
      },
    };
  }

  const content = formatMarkdown({
    llm: llmOutput,
    sources,
    novelOrPredicate,
  });
  const wordCount = content.trim().split(/\s+/).length;

  // Citations cite the regulatory anchors actually used in this section.
  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR 2017 — Medical Devices Rules, 2017 (Schedule II)",
      quote:
        "Classification of medical devices into Class A, B, C or D based on risk and intended use.",
      exact_reference: "MDR 2017 Second Schedule",
    },
    {
      citation_id: "[2]",
      source_doc: "IMDRF SaMD framework — significance × situation matrix",
      quote:
        "IMDRF categorizes software-as-a-medical-device by the significance of information provided × the state of the healthcare situation.",
      exact_reference: "IMDRF SaMD WG/N12 (2014)",
    },
  ];
  if (sources.readiness_card.classification.ai_ml_flag) {
    citations.push({
      citation_id: "[3]",
      source_doc:
        "CDSCO Draft Guidance — Software-as-a-Medical-Device (October 2025)",
      quote:
        "Adaptive AI/ML devices are expected to file an Algorithm Change Protocol (ACP) describing modification scope, retraining triggers, validation thresholds, and human oversight.",
      exact_reference: "CDSCO Oct 2025 SaMD Draft §4.2.D",
    });
  }
  if (novelOrPredicate === "novel") {
    citations.push({
      citation_id: "[4]",
      source_doc: "MDR 2017 — Medical Devices Rules, 2017 (MD-26 / MD-27)",
      quote:
        "Pre-permission Form MD-26 is required for novel devices without an Indian predicate; grant is on Form MD-27 before manufacturing licence application.",
      exact_reference: "MDR 2017 Form MD-26, MD-27",
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
      dry_run: dryRun,
      error_message: null,
      usage,
    },
  };
};
