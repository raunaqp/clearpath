/**
 * Section 4 — Classification & Grouping (SaMD) / Classification &
 * Pathway (hardware).
 *
 * SaMD path (Sprint 2 default): IMDRF significance × situation matrix
 * → CDSCO class derivation, one Sonnet call for the rationale prose.
 * Maps to DMF §8.3 Justification for the Medical Device Grouping.
 *
 * Hardware path (Sprint 3 Day 4): deterministic. The synthesizer
 * already computes cdsco_class for the hardware persona using bible
 * §4 sub-case rules (contact + sterile + drug + radiation + measuring
 * — see synthesizer-system-prompt.ts §275+). This generator emits a
 * structured-markdown summary table + class-derivation walkthrough
 * + pathway statement + conditional MD-26/27 callout when q8 = "no".
 * Maps to bible §4 sub-case table (lines 167–173) + DMF §8.1, NOT
 * §8.4 (matrix v2 reconciliation, 2026-05-29).
 *
 * Dispatch is by `wizard_answers.persona`. The exported
 * `generateSection04` routes to the hardware variant when persona
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

const SECTION_KEY = "04_classification_grouping" as const;
const TITLE_SAMD = "Classification & Grouping";
const TITLE_HARDWARE = "Classification & Pathway";
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

const generateSection04Samd: SectionGenerator = async (
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
      title: TITLE_SAMD,
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
    title: TITLE_SAMD,
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

// ────────────────────────────────────────────────────────────────────
// Hardware variant — Sprint 3 Day 4
// ────────────────────────────────────────────────────────────────────

/** Bible §4 sub-case → form pair + authority + audit timing. Indexed
 *  by cdsco_class, with the Class A "non-sterile non-measuring" carve-
 *  out resolved by a flag because both Class A sub-cases share class="A".
 *
 *  Source: docs/specs/cdsco-regulatory-forms-reference.md lines 167-173
 *  and lines 326-330 (class-specific variations). */
type HardwareSubCase = {
  pathway_label: string;
  authority: string;
  forms: ReadonlyArray<string>;
  audit_timing: string;
};

function hardwareSubCase(args: {
  cdscoClass: "A" | "B" | "C" | "D" | null;
  sterileLikely: boolean;
  measuringLikely: boolean;
}): HardwareSubCase {
  if (args.cdscoClass === "A" && !args.sterileLikely && !args.measuringLikely) {
    return {
      pathway_label: "Portal self-notification (no MD form pair)",
      authority: "State Licensing Authority — portal registration",
      forms: [],
      audit_timing: "No audit pre-grant; system-generated registration number",
    };
  }
  if (args.cdscoClass === "A") {
    return {
      pathway_label: "MD-3 → MD-5 (Class A measuring/sterile)",
      authority: "State Licensing Authority (SLA)",
      forms: ["MD-3", "MD-5"],
      audit_timing:
        "Notified-Body audit within 120 days post-grant (no pre-grant audit)",
    };
  }
  if (args.cdscoClass === "B") {
    return {
      pathway_label: "MD-3 → MD-5",
      authority: "State Licensing Authority (SLA)",
      forms: ["MD-3", "MD-5"],
      audit_timing:
        "Notified-Body QMS audit within 90 days of application (pre-grant)",
    };
  }
  if (args.cdscoClass === "C") {
    return {
      pathway_label: "MD-7 → MD-9",
      authority: "Central Licensing Authority (CDSCO HQ / Zonal)",
      forms: ["MD-7", "MD-9"],
      audit_timing:
        "CDSCO MD Officer team inspection within 60 days of application (pre-grant)",
    };
  }
  if (args.cdscoClass === "D") {
    return {
      pathway_label: "MD-7 → MD-9 (heightened scrutiny)",
      authority: "Central Licensing Authority (CDSCO HQ / Zonal)",
      forms: ["MD-7", "MD-9"],
      audit_timing:
        "Same as Class C, plus line-by-line Essential Principles examination and effectively-mandatory clinical evidence",
    };
  }
  return {
    pathway_label: "[Pathway pending — class undetermined]",
    authority: "[TBD — class undetermined]",
    forms: [],
    audit_timing: "[TBD]",
  };
}

/** Look up an inference-marker value by field name. Hardware markers
 *  are human English (e.g., "Yes (drug-eluting)") — parse with
 *  affirmative/negative regex like section-gating does. Returns null
 *  when the marker isn't present. */
function findMarker(
  sources: SourceData,
  field: string
): { value: string; status: string } | null {
  const m = (sources.readiness_card.inference_markers ?? []).find(
    (x) => x.field === field
  );
  return m ? { value: m.value, status: m.status } : null;
}

function isAffirmative(v: string): boolean {
  return /^\s*yes\b/i.test(v);
}

function buildHardwareContent(sources: SourceData): string {
  const cls = sources.readiness_card.classification;
  const wa = sources.wizard_answers;

  const sterileMarker = findMarker(sources, "sterile");
  const sterileLikely = sterileMarker !== null && isAffirmative(sterileMarker.value);
  const measuringMarker = findMarker(sources, "measuring_function");
  const measuringLikely =
    measuringMarker !== null && isAffirmative(measuringMarker.value);
  const drugMarker = findMarker(sources, "drug_content");
  const radiationMarker = findMarker(sources, "ionising_radiation");
  const contactValue = wa.q9 ?? "(Q9 not answered)";

  const subcase = hardwareSubCase({
    cdscoClass: cls.cdsco_class,
    sterileLikely,
    measuringLikely,
  });

  const novelByQ8 = wa.q8 === "no";

  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(`| CDSCO class | ${cls.cdsco_class ?? "[TBD]"} |`);
  lines.push(`| Class qualifier | ${cls.class_qualifier ?? "—"} |`);
  lines.push(`| Manufacturing pathway | ${subcase.pathway_label} |`);
  lines.push(`| Licensing authority | ${subcase.authority} |`);
  lines.push(`| Audit timing | ${subcase.audit_timing} |`);
  lines.push(
    `| Patient contact (Q9) | ${contactValue} |`
  );
  lines.push(`| Sterile | ${sterileMarker?.value ?? "[Not inferred]"} |`);
  lines.push(`| Drug content | ${drugMarker?.value ?? "[Not inferred]"} |`);
  lines.push(`| Ionising radiation | ${radiationMarker?.value ?? "[Not inferred]"} |`);
  lines.push(`| Measuring function | ${measuringMarker?.value ?? "[Not inferred]"} |`);
  lines.push(`| Predicate (Q8) | ${wa.q8 ?? "(not answered)"} |`);
  lines.push("");

  lines.push("## Class derivation");
  lines.push("");
  lines.push(
    softenCertainty(
      `Per Bible §4 (medical device manufacturer — hardware persona), CDSCO class is derived from the device profile inputs above. The synthesizer applied the §4 sub-case rules to arrive at Class ${cls.cdsco_class ?? "[TBD]"}. The licensing authority and form pair follow directly from class (Bible §4 sub-case table, lines 167-173):`
    )
  );
  lines.push("");
  lines.push("- Class A (non-sterile, non-measuring) → SLA portal self-notification");
  lines.push("- Class A (measuring or sterile) + Class B → MD-3 → MD-5 (SLA)");
  lines.push("- Class C + Class D → MD-7 → MD-9 (CLA)");
  lines.push("");
  if (cls.cdsco_class === "D") {
    lines.push(
      softenCertainty(
        "Class D adds heightened scrutiny: Essential Principles checklist examined line-by-line, and clinical evidence (§12 Clinical Evidence & PMS) is effectively mandatory even with a predicate."
      )
    );
    lines.push("");
  }

  lines.push("## Pathway");
  lines.push("");
  lines.push(
    softenCertainty(
      `Manufacturing pathway: **${subcase.pathway_label}**. ${subcase.audit_timing}.`
    )
  );
  lines.push("");

  if (novelByQ8) {
    lines.push("## MD-26 / MD-27 pre-permission required");
    lines.push("");
    lines.push(
      softenCertainty(
        "Per your Q8 answer, no predicate device exists in the Indian market for this device. MDR-2017 requires MD-26 pre-permission **before** the MD-3 / MD-7 manufacturing-licence application is filed; the grant arrives on Form MD-27. The §6 Predicate Comparison section walks through this in detail."
      )
    );
    lines.push("");
  }

  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §6 Predicate Comparison — substantial-equivalence analysis and MD-26/27 path detail");
  lines.push("- §8 Design & Manufacturing — hardware BOM + process steps (no software lifecycle for pure-hardware devices)");
  lines.push("- §10 Risk Management — ISO 14971 risk file (owns risk analysis; not duplicated here)");
  lines.push("- §13 Biocompatibility — present when Q9 patient contact ≠ no_contact");
  lines.push("- §14 Sterilization Validation — present when device is sterile");

  return lines.join("\n");
}

const generateSection04Hardware: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const content = buildHardwareContent(sources);
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE_HARDWARE,
    content,
    citations: [
      {
        citation_id: "[1]",
        source_doc: "MDR-2017 — Medical Devices Rules, 2017",
        quote:
          "Class A/B → State Licensing Authority on Form MD-3 → grant on MD-5; Class C/D → Central Licensing Authority on Form MD-7 → grant on MD-9.",
        exact_reference: "Bible §4 sub-case table (lines 167–173)",
      },
      {
        citation_id: "[2]",
        source_doc: "MDR-2017 Fourth Schedule Appendix II",
        quote: "Device Master File Executive Summary statement of class",
        exact_reference: "DMF §8.1",
      },
      ...(sources.wizard_answers.q8 === "no"
        ? [
            {
              citation_id: "[3]",
              source_doc: "MDR-2017 Forms MD-26 / MD-27",
              quote:
                "Novel devices without an Indian predicate require MD-26 pre-permission before MD-7; grant is on MD-27.",
              exact_reference: "Bible §4.B Block 6 + MD-7 checklist §11.0",
            },
          ]
        : []),
    ],
    completion_status: "complete",
    word_count: content.split(/\s+/).filter(Boolean).length,
    meta: {
      generation_strategy: "deterministic",
      source_fields: [
        "readiness_card.classification.cdsco_class",
        "readiness_card.classification.class_qualifier",
        "readiness_card.inference_markers.sterile",
        "readiness_card.inference_markers.drug_content",
        "readiness_card.inference_markers.ionising_radiation",
        "readiness_card.inference_markers.measuring_function",
        "wizard.q8",
        "wizard.q9",
      ],
      model: null,
      llm_cost_usd: null,
      generated_at: new Date().toISOString(),
      dry_run: opts.dry_run,
      error_message: null,
      usage: null,
    },
  };
};

// Dispatcher — persona-aware. The orchestrator imports this; SaMD
// behaviour is unchanged from Sprint 2.
export const generateSection04: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  if (sources.wizard_answers.persona === "manufacturer_hardware") {
    return generateSection04Hardware(sources, opts);
  }
  return generateSection04Samd(sources, opts);
};
