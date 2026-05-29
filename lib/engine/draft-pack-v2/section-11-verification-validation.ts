/**
 * Section 11 — Verification & Validation.
 *
 * Maps to: DMF §8.10 V&V + DMF §8.15 Software V&V (conditional sub-block).
 *
 * SaMD path (Sprint 2 default): emits verification_protocol +
 * validation_summary + biocompatibility_evidence (inline) +
 * software_verification_validation (when isSoftware) +
 * stability_data_summary (inline).
 *
 * Hardware path (Sprint 3 Day 5 afternoon): emits hardware bench V&V
 * (mechanical, electrical, performance per device-class standard —
 * e.g., ISO 25539 family for cardiovascular implants, ISO 14708 for
 * active implants), validation against intended use, design-input
 * traceability matrix. Biocompatibility evidence cross-references
 * §13 instead of duplicating; stability evidence cross-references
 * §15 instead of duplicating; sterilization evidence cross-references
 * §14.
 *
 * §8.15 software V&V sub-block is CODE-GATED via
 * `shouldIncludeSubBlock("software_vv", sources)` from
 * section-gating.ts (calibrated trigger on the `software_in_device`
 * inference marker). Stent → SUPPRESSED; connected glucometer →
 * INCLUDED. The gate is at the orchestrator/generator level — not a
 * stent-specific accident.
 *
 * Dispatch is by `wizard_answers.persona`. SaMD path unchanged.
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
import { shouldIncludeSubBlock } from "./section-gating";

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
    "Opening framing: lead with the V&V structure — what was verified, against what, with what outcome. Be concrete about evidence references. Where applicant data names studies/sites/sample sizes, cite them and label as preliminary subject to pivotal confirmation. Otherwise \"[NEEDS INPUT: <what>]\" — do not invent.",
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
    `  "verification_protocol_summary": "120-220 words. What was tested (functional, safety, performance), against what specs/standards, and which Essential Principles (Section 9) each test maps to. Concrete test categories (functional bench, software unit V&V, performance under load, etc.) — not a generic overview.",`,
    `  "validation_summary": "120-220 words. Real-world performance against intended use. Honest about B5 = ${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT: clinical evidence status]"}. For 'none' or 'pilot_data': acknowledge gap + cross-reference Section 12 evidence plan. Where source data anchors specific numbers (e.g., AIIMS pilot 94% sensitivity), cite them and label preliminary subject to pivotal confirmation.",`,
    `  "biocompatibility_evidence": "80-180 words OR null. Render the sub-block unless software-only with no patient contact. Map to ISO 10993 series — \"[NEEDS INPUT: ISO 10993 test panel — anchored to confirmed patient-contact tier]\" rather than fabricating specifics. Default to surface_intact_skin tier when ambiguous.",`,
    sw
      ? `  "software_verification_validation": "140-260 words. IEC 62304 §5.5 (Software Unit V&V) + §5.6 (System V&V) + §5.7 (Software Release). Anchor to C1 = ${wa.c1_software_lifecycle_model ?? "[NEEDS INPUT: software lifecycle model]"} for SDLC. ${card.classification.acp_required ? "ACP-required AI/ML — name SPECIFIC validation metrics: held-out cohort accuracy, drift-detection threshold (Brier or KL), subgroup performance bounds, threshold-based retraining triggers. Cross-ref Section 8 ACP + Section 10 ai_ml risks." : ""}",`
      : '  "software_verification_validation": null,',
    `  "stability_data_summary": "60-150 words. ${sw ? "Software: not applicable in the classical hardware-stability sense — version-specific change-control under Section 8 batch_release covers analogous obligations." : "Hardware: real-time + accelerated stability per ICH Q1A framing. \"[NEEDS INPUT: specific shelf life]\" pending Sprint 3 stability-status question."}"`,
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

const generateSection11Samd: SectionGenerator = async (
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

// ────────────────────────────────────────────────────────────────────
// Hardware variant — Sprint 3 Day 5 afternoon
// ────────────────────────────────────────────────────────────────────

// Schema cap calibration per `feedback-schema-cap-calibration`:
//   verification + validation + software_vv sub-block:
//     tier-matched complex → 2000
//   traceability + cross-cutting + clinical reference:
//     single-concern → 1500
const HardwareLlmSchema = z.object({
  // Multi-axis bench V&V (mechanical / electrical / performance /
  // environment / packaging) is dense for complex device profiles —
  // empirical cap 2500 absorbs Sonnet variance per the schema-cap-
  // calibration memory.
  verification_protocol_summary: z.string().min(120).max(2500),
  validation_summary: z.string().min(120).max(2500),
  design_input_traceability: z.string().min(80).max(1500),
  test_program_summary: z.string().min(100).max(1500),
  // §8.15 software V&V sub-block — only when shouldIncludeSubBlock
  // "software_vv" fires. LLM is instructed to return null when the
  // gate is off (we ALSO enforce gating in generator code; this is
  // belt-and-suspenders).
  software_vv_subblock: z.string().min(80).max(2500).nullable(),
});
type HardwareLlmOutput = z.infer<typeof HardwareLlmSchema>;

function buildHardwareUserMessage(args: {
  sources: SourceData;
  includeSoftwareVv: boolean;
  softwareVvAssumed: boolean;
}): string {
  const { sources, includeSoftwareVv, softwareVvAssumed } = args;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;

  return [
    "Generate Section 11 (Verification & Validation) for a CDSCO MD-7 / MD-3 hardware Submission Pack.",
    "",
    "This is the HARDWARE persona. DO NOT use:",
    "- IMDRF SaMD significance × situation matrix",
    "- AI/ML autonomous-diagnosis disclaimer",
    "- Algorithm Change Protocol (ACP) or PCCP",
    "- ClearPath platform marketing language (e.g., 'Reviewer Concierge')",
    "- Biocompatibility evidence DETAIL inline (§13 owns the ISO 10993 panel — cross-reference §13 only)",
    "- Stability evidence DETAIL inline (§15 owns the real-time + accelerated programme — cross-reference §15 only)",
    "- Sterilization validation DETAIL inline (§14 owns it — cross-reference §14 only)",
    "",
    "Hardware §11 covers DMF §8.10 V&V. Focus on bench V&V (mechanical, electrical, performance), validation against intended use, and design-input traceability. Pick the appropriate device-class standard family — e.g., ISO 25539 for cardiovascular implants, ISO 14708 for active implants, ISO 14242/-3/-4 for orthopaedic, IEC 60601-family for general electromedical safety, IEC 60068 for environmental — based on the device profile. Do not invent specific test values; flag device-specific numbers as [NEEDS INPUT: ...].",
    "",
    MDR_2017_VERIFIED_CITATIONS_BLOCK,
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Tier B intended use: ${wa.b1_intended_use_statement ?? "(not captured)"}`,
    `Class: ${card.classification.cdsco_class ?? "[TBD]"}${card.classification.class_qualifier ? ` (qualifier: ${card.classification.class_qualifier})` : ""}`,
    `Q9 patient contact: ${wa.q9 ?? "[NEEDS INPUT]"}`,
    `B5 clinical evidence status: ${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT: clinical evidence status]"}`,
    `Software-in-device sub-block gate (§8.15): ${includeSoftwareVv ? `INCLUDE${softwareVvAssumed ? " [ASSUMED YES — confirm in editor]" : ""}` : "OMIT (suppressed by section-gating predicate)"}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Aim for lower end of word bands.",
    "```",
    "{",
    `  "verification_protocol_summary": "120-260 words. What bench V&V was performed against what specifications and standards. Hardware-specific test categories: dimensional integrity, mechanical performance under simulated physiological loading (where relevant), fatigue / wear, electrical safety (when active), environmental robustness, packaging integrity. Cite the relevant device-class standard family ONCE (e.g., ISO 25539-2 for intravascular implants, IEC 60601-1 for general electromedical safety) — pick based on the device profile. Flag specific test parameters / acceptance criteria as [NEEDS INPUT: ...].",`,
    `  "validation_summary": "120-260 words. Real-world performance against intended use (cross-reference §3 Intended Use). Anchor to B5 clinical-evidence status (${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT]"}). Where validation depends on clinical data, cross-reference §12 Clinical Evidence & PMS. Honest about gaps. NO IMDRF / SaMD significance-dimension framing.",`,
    `  "design_input_traceability": "80-180 words. Design inputs → design outputs → V&V acceptance criteria traceability matrix narrative. Reference §8 Design & Manufacturing for the design-controls framework that owns the traceability matrix itself; §11 reflects the V&V column. Mention that V&V failure modes feed §10 Risk Management.",`,
    `  "test_program_summary": "100-180 words. Test programme structure — qualification testing (one-time per design), routine release testing (per-batch, ties to §16 Batch Release), and design-verification testing during change control. Cite the relevant ISO / IEC family ONCE if not already cited. Cross-reference: §13 Biocompatibility (biocomp evidence is in §13, not duplicated here), §14 Sterilization Validation, §15 Stability Data.",`,
    includeSoftwareVv
      ? `  "software_vv_subblock": "120-260 words. DMF §8.15 software V&V sub-block. Cover IEC 62304 lifecycle phases applied to the software component of this hardware device — software safety classification (Class A/B/C per IEC 62304 §4.3), unit V&V (§5.5), system V&V (§5.6), and software release (§5.7). Anchor to C1 = ${wa.c1_software_lifecycle_model ?? "[NEEDS INPUT: software lifecycle model — C1 wizard answer]"}. Cross-reference §8 Design & Manufacturing for the SDLC framework. ${softwareVvAssumed ? "Important: the software_in_device marker carried [ASSUMED YES] status — call this out so the founder confirms software presence before doing any of the V&V work below; if the device has no software, remove this sub-block in the editor." : ""}"`
      : `  "software_vv_subblock": null,`,
    "}",
    "```",
    "",
    "Apply softening rules. Do not invent test parameters, sample sizes, or acceptance criteria. Hardware framing only.",
    !includeSoftwareVv
      ? "IMPORTANT: This device has no software_in_device signal — software_vv_subblock MUST be null. Do not mention IEC 62304 in any other field; if you would otherwise reference it, write '[N/A — no software component in this device]' instead and continue."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatHardwareMarkdown(args: {
  llm: HardwareLlmOutput;
  sources: SourceData;
  includeSoftwareVv: boolean;
}): string {
  const { llm, sources, includeSoftwareVv } = args;
  const wa = sources.wizard_answers;

  const lines: string[] = [];

  lines.push("## Verification protocol");
  lines.push("");
  lines.push(softenCertainty(llm.verification_protocol_summary));
  lines.push("");

  lines.push("## Validation summary");
  lines.push("");
  lines.push(softenCertainty(llm.validation_summary));
  lines.push("");

  lines.push("## Design-input traceability");
  lines.push("");
  lines.push(softenCertainty(llm.design_input_traceability));
  lines.push("");

  lines.push("## Test programme");
  lines.push("");
  lines.push(softenCertainty(llm.test_program_summary));
  lines.push("");

  // §8.15 software V&V sub-block — code-gated. The LLM is also
  // instructed to return null, but we DO NOT trust the LLM as the
  // gate; this check is the source of truth.
  if (includeSoftwareVv && llm.software_vv_subblock) {
    lines.push("## §8.15 Software V&V (conditional sub-block)");
    lines.push("");
    lines.push(softenCertainty(llm.software_vv_subblock));
    lines.push("");
    lines.push("### Software V&V attestation");
    lines.push("- [ ] Software safety classification (IEC 62304 §4.3) documented");
    lines.push("- [ ] Software unit V&V records (IEC 62304 §5.5) on file");
    lines.push("- [ ] Software system V&V records (IEC 62304 §5.6) on file");
    lines.push("- [ ] Software release certificate (IEC 62304 §5.7) on file");
    lines.push("");
  }

  // V&V evidence references — derived from B5 (kept from SaMD path
  // structure but with hardware-appropriate wording)
  lines.push("## V&V evidence references");
  lines.push("");
  const b5 = wa.b5_clinical_evidence_status;
  if (b5 === "multi_center_trial") {
    lines.push(
      "- Multi-centre prospective study referenced (citation: [NEEDS INPUT: study identifier, registry ID])."
    );
  } else if (b5 === "published_study") {
    lines.push("- Peer-reviewed publication referenced [NEEDS INPUT: DOI / journal]");
  } else if (b5 === "pilot_data") {
    lines.push(
      "- Pilot data / retrospective analysis on file [NEEDS INPUT: internal report ID]. Pivotal-trial design in §12 Clinical Evidence."
    );
  } else if (b5 === "none") {
    lines.push(
      "- No external clinical-validation evidence yet. Evidence plan in §12 Clinical Evidence."
    );
  } else {
    lines.push("- [NEEDS INPUT: V&V evidence references pending B5 capture]");
  }
  lines.push("");

  // Cross-references — hardware-specific
  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §3 Intended Use — validation grounds in intended-use claims");
  lines.push("- §8 Design & Manufacturing — design-controls framework + traceability matrix");
  lines.push("- §10 Risk Management — V&V failure modes feed the ISO 14971 hazard register");
  lines.push("- §12 Clinical Evidence & PMS — clinical validation");
  lines.push("- §13 Biocompatibility — biological-safety evidence (ISO 10993 panel)");
  lines.push("- §14 Sterilization Validation — sterilization process validation");
  lines.push("- §15 Stability Data — shelf-life + accelerated-ageing programme");
  lines.push("- §16 Batch Release Certificates — per-batch routine release testing");
  if (includeSoftwareVv) {
    lines.push("- §8 Design & Manufacturing — SDLC framework for the software component");
  }

  return lines.join("\n");
}

const generateSection11Hardware: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();

  // §8.15 software_vv sub-block gating — single source of truth from
  // section-gating.ts. Calibrated trigger:
  //   - marker absent → exclude
  //   - status=assumed → include with [ASSUMED YES] framing
  //   - status=estimated/extracted + value=yes → include
  //   - status=estimated/extracted + value=no → exclude
  // Stent fixture (sterile=yes, drug=yes, software_in_device=no
  // status=estimated) → suppressed.
  // Glucometer fixture (software_in_device=yes status=estimated) →
  // included.
  const swDecision = shouldIncludeSubBlock("software_vv", sources);
  const includeSoftwareVv = swDecision.included;
  const softwareVvAssumed = swDecision.assumed;

  const sourceFields = [
    "wizard.b1_intended_use_statement",
    "wizard.b5_clinical_evidence_status",
    "wizard.c1_software_lifecycle_model",
    "wizard.q9",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.inference_markers.software_in_device",
    "intake.one_liner",
  ];

  let llmOutput: HardwareLlmOutput;
  let cost = 0;
  let usage: SectionOutput["meta"]["usage"] = null;

  try {
    const r = await callLlm({
      assessmentId: sources.assessment_id,
      callLayer: "draft_pack_v2",
      model: SECTION_MODEL,
      userMessage: buildHardwareUserMessage({
        sources,
        includeSoftwareVv,
        softwareVvAssumed,
      }),
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
    console.error(`[§11 hardware] failed: ${msg}`);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 11 hardware generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        // Gate metadata is set BEFORE the LLM call lands, so it survives
        // an LLM failure. Downstream assertions can confirm the gate
        // decision independent of whether the narrative completed.
        source_fields: [
          ...sourceFields,
          `_software_vv_gate:${includeSoftwareVv ? "included" : "excluded"}`,
        ],
        model: SECTION_MODEL,
        llm_cost_usd: cost,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: msg,
        usage,
      },
    };
  }

  // Defensive: if the gate says exclude but the LLM emitted content
  // anyway, the rendering still suppresses it (the formatter checks
  // `includeSoftwareVv`). The LLM's `software_vv_subblock` value is
  // ignored when gate is off — code is the source of truth.
  const content = formatHardwareMarkdown({
    llm: llmOutput,
    sources,
    includeSoftwareVv,
  });
  const wordCount = content.trim().split(/\s+/).length;

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR-2017 Fourth Schedule Appendix II",
      quote: "Verification and validation data for the device.",
      exact_reference: "DMF §8.10",
    },
    {
      citation_id: "[2]",
      source_doc: "ISO 14971:2019",
      quote:
        "Risk management for medical devices — V&V outputs feed the hazard register.",
      exact_reference: "ISO 14971:2019",
    },
    ...(includeSoftwareVv
      ? [
          {
            citation_id: "[3]",
            source_doc: "IEC 62304:2006/AMD1:2015",
            quote:
              "Medical-device software lifecycle processes — software safety classification, unit V&V, system V&V, software release.",
            exact_reference: "IEC 62304 §4.3, §5.5, §5.6, §5.7",
          },
          {
            citation_id: "[4]",
            source_doc: "MDR-2017 Fourth Schedule Appendix II",
            quote: "Software V&V — sub-block of DMF Appendix II.",
            exact_reference: "DMF §8.15",
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
      source_fields: [
        ...sourceFields,
        `_software_vv_gate:${includeSoftwareVv ? "included" : "excluded"}`,
      ],
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: null,
      usage,
    },
  };
};

// Dispatcher — persona-aware. SaMD behaviour unchanged.
export const generateSection11: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  if (sources.wizard_answers.persona === "manufacturer_hardware") {
    return generateSection11Hardware(sources, opts);
  }
  return generateSection11Samd(sources, opts);
};
