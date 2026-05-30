/**
 * Section 12 — Clinical Evidence & Post-Market Surveillance.
 *
 * Maps to: DMF §8.18 Clinical evidence + §8.19 PMS (Vigilance) +
 * conditional §8.16 Animal preclinical sub-block (long-term contact
 * or drug-combination).
 *
 * SaMD path (Sprint 2 default): includes AI/ML drift-monitoring +
 * ACP retraining triggers; references "Reviewer Concierge tier" in
 * the CI pathway note (a ClearPath product name that shouldn't appear
 * in regulatory submission content — same leak class as §6).
 *
 * Hardware path (Sprint 3 Day 5 afternoon): strips AI/ML + ACP +
 * Reviewer-Concierge framing. Adds §8.16 animal preclinical sub-block
 * code-gated via `shouldIncludeSubBlock("animal_preclinical", sources)`
 * — fires for long-term contact (Q9 wizard-explicit) OR drug-content
 * trigger (calibrated). GLP toxicology + pharmacokinetic + in-vivo
 * implant-model framing for combination implants. Class D + novel
 * cases get explicit MD-22 / MD-23 clinical-investigation framing
 * with CTRI registration + EC approval expectations.
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

const SECTION_KEY = "12_clinical_evidence_pms" as const;
const TITLE = "Clinical Evidence & Post-Market Surveillance";
const MAX_TOKENS = 4000;

// Phase 4b iteration — bounds relaxed.
const LlmSchema = z.object({
  clinical_evidence_summary: z.string().min(150).max(6000),
  evidence_plan: z.string().min(100).max(5000),
  pms_plan_summary: z.string().min(200).max(7000),
  vigilance_reporting_framework: z.string().min(60).max(2500),
  clinical_investigation_pathway_note: z.string().nullable(),
  post_market_clinical_followup: z.string().min(60).max(3000),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;

  const hasPredicate =
    wa.b3_no_predicate !== true &&
    (wa.b3_predicate_devices ?? []).some(
      (p) => p.device_name.trim().length > 0
    );
  const triggerCiPath =
    card.recommended_path === "clinical_investigation" ||
    (!hasPredicate && wa.b5_clinical_evidence_status === "none");

  return [
    "Generate Section 12 (Clinical Evidence & Post-Market Surveillance) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: lead with the clinical evidence STATUS — what exists today, what's planned — and the PMS operational model. This section is where deployment realism matters most. Name specific cadences (e.g., 'quarterly trend report'), specific roles ('RA Officer notified within 24h of a Serious AE'), specific forms (MD-42, MD-43, Form-25). Where applicant data is silent, write \"[NEEDS INPUT: <what>]\" — do not fabricate cadences or roles.",
    "",
    "## Applicant data",
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    `Recommended path: ${card.recommended_path ?? "(not set)"}`,
    `B5 clinical evidence status: ${wa.b5_clinical_evidence_status ?? "[TBD]"}`,
    `Has predicate: ${hasPredicate ? "yes" : "no (novel device)"}`,
    `Q1 clinical state: ${wa.q1 ?? "[TBD]"}`,
    `Trigger CI pathway note: ${triggerCiPath}`,
    "",
    "## Output (STRICT JSON)",
    "```",
    "{",
    `  "clinical_evidence_summary": "150-300 words. Map B5 status (${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT: clinical evidence status]"}) to a concrete description. For 'pilot_data': describe the pilot + acknowledge pivotal dependency. Where source data anchors specific numbers (sample size, sensitivity), cite them as preliminary. For 'published_study' or 'multi_center_trial' without source-data IDs, write \"[NEEDS INPUT: study ID / DOI / CTRI registration]\". ${card.classification.cdsco_class === "D" ? "Class D — clinical evidence effectively mandatory; be explicit." : ""}",`,
    `  "evidence_plan": "120-220 words. Prospective study plan + CTRI registration intent + EC engagement. Use \"[NEEDS INPUT: pivotal trial design — primary endpoint, sample size, comparator]\" for unknowns; do not fabricate study parameters.",`,
    `  "pms_plan_summary": "200-400 words. Active vigilance per MDR 2017. Three paragraphs: (1) complaint handling — intake → triage → CAPA workflow, naming the typical SLA (24h ack, 30 days root-cause); (2) adverse event reporting — MD-42 / MD-43 / Form-25 — name the form for each event class and the regulatory timing (Serious AE: 15-day reporting per MDR 2017); (3) periodic reporting + post-market clinical follow-up. ${card.classification.ai_ml_flag ? "AI/ML — name the drift-monitoring metric (calibration drift, performance drift) + cadence (monthly) + escalation (clinical reviewer → ACP retraining trigger)." : ""}",`,
    `  "vigilance_reporting_framework": "60-150 words. Forms (MD-42 manufacturer AE, MD-43 PMS, Form-25 device AE) + their triggering events + their reporting windows. Cite the MDR 2017 vigilance schedule once.",`,
    triggerCiPath
      ? '  "clinical_investigation_pathway_note": "60-130 words. Surface the MD-22 / MD-23 clinical-investigation pathway with the full sequence: MD-26 → MD-27 → MD-22 (CI permission) → MD-23 (CI grant) → CI conduct → MD-7 → MD-9. Mention that the Reviewer Concierge tier supports dual-pathway sequencing.",'
      : '  "clinical_investigation_pathway_note": null,',
    `  "post_market_clinical_followup": "60-150 words. PMCF triggers and cadence. ${wa.q1 === "critical" && (card.classification.cdsco_class === "C" || card.classification.cdsco_class === "D") ? "Q1=critical + Class C/D — quarterly cadence minimum, with a sentence on how PMCF reports feed back into the RMF (Section 10)." : "Annual default cadence; tighten for high-risk subgroups."}"`,
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

  lines.push("## Clinical evidence status");
  lines.push("");
  lines.push(`**Tier B B5 status:** ${wa.b5_clinical_evidence_status ?? "[TBD]"}`);
  lines.push("");

  lines.push("## Clinical evidence summary");
  lines.push("");
  lines.push(llm.clinical_evidence_summary);
  lines.push("");

  lines.push("## Evidence plan");
  lines.push("");
  lines.push(llm.evidence_plan);
  lines.push("");

  lines.push("## Post-market surveillance plan");
  lines.push("");
  lines.push(llm.pms_plan_summary);
  lines.push("");

  lines.push("## Vigilance reporting framework");
  lines.push("");
  lines.push(llm.vigilance_reporting_framework);
  lines.push("");

  lines.push("## Post-market clinical follow-up (PMCF)");
  lines.push("");
  lines.push(llm.post_market_clinical_followup);
  lines.push("");

  if (llm.clinical_investigation_pathway_note) {
    lines.push("## Clinical investigation pathway");
    lines.push("");
    lines.push(llm.clinical_investigation_pathway_note);
    lines.push("");
  }

  return lines.join("\n");
}

const generateSection12Samd: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "wizard.q1",
    "wizard.b3_no_predicate",
    "wizard.b3_predicate_devices",
    "wizard.b5_clinical_evidence_status",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.recommended_path",
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
      content: `[Section 12 generation failed: ${msg}]`,
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
        source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.18, §8.19",
        quote:
          "Clinical evidence + Post-Marketing Surveillance data (vigilance reporting).",
        exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.18, §8.19",
      },
      {
        citation_id: "[2]",
        source_doc: "MDR 2017 — Forms MD-42 / MD-43 / Form-25",
        quote:
          "Vigilance reporting forms for manufacturer adverse events, post-market surveillance, and medical device adverse event reports.",
        exact_reference: "MDR 2017 Forms MD-42, MD-43, Form-25",
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

// ────────────────────────────────────────────────────────────────────
// Hardware variant — Sprint 3 Day 5 afternoon
// ────────────────────────────────────────────────────────────────────

// Schema cap calibration per `feedback-schema-cap-calibration`:
//   clinical_evidence + evidence_plan + animal_preclinical:
//     tier-matched complex (multi-axis content) → 2500
//   pms_plan + vigilance + pmcf + ci_pathway: single-concern → 1500
const HardwareLlmSchema = z.object({
  clinical_evidence_summary: z.string().min(150).max(2500),
  evidence_plan: z.string().min(120).max(2500),
  pms_plan_summary: z.string().min(150).max(2500),
  vigilance_reporting_framework: z.string().min(60).max(1500),
  post_market_clinical_followup: z.string().min(60).max(1500),
  clinical_investigation_pathway_note: z.string().min(80).max(1500).nullable(),
  // §8.16 animal preclinical sub-block — only when shouldIncludeSubBlock
  // "animal_preclinical" fires. Combination-product implant context →
  // GLP toxicology + PK + in-vivo implant model dense → 2500.
  animal_preclinical_subblock: z.string().min(80).max(2500).nullable(),
});
type HardwareLlmOutput = z.infer<typeof HardwareLlmSchema>;

function buildHardwareUserMessage(args: {
  sources: SourceData;
  includeAnimalPreclinical: boolean;
  animalPreclinicalAssumed: boolean;
  isNovel: boolean;
  drugEluting: boolean;
}): string {
  const {
    sources,
    includeAnimalPreclinical,
    animalPreclinicalAssumed,
    isNovel,
    drugEluting,
  } = args;
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;

  return [
    "Generate Section 12 (Clinical Evidence & Post-Market Surveillance) for a CDSCO MD-7 / MD-3 hardware Submission Pack.",
    "",
    "This is the HARDWARE persona. DO NOT use:",
    "- AI/ML drift monitoring framing",
    "- Algorithm Change Protocol (ACP) or PCCP retraining triggers",
    "- IMDRF SaMD significance × situation matrix",
    "- ClearPath product names like 'Reviewer Concierge' — those are platform marketing and do not belong in CDSCO submission content",
    "- Software-as-comparator or algorithm-validation-as-clinical framing",
    "",
    "Hardware §12 covers DMF §8.18 Clinical Evidence + §8.19 PMS. For a physical medical device, clinical evidence is anchored in human-subject investigations (pivotal study with CTRI registration + EC approval), not software-validation cohorts. Operational realism welcomed: cite specific reporting forms (MD-42 / MD-43 / Form-25), regulatory windows (Serious AE: 15-day reporting per MDR 2017 Sixth Schedule), and typical PMS cadences. NO drift / retraining metrics.",
    "",
    MDR_2017_VERIFIED_CITATIONS_BLOCK,
    "",
    "## Applicant data",
    `Intake one-liner: ${sources.intake.one_liner}`,
    `Class: ${card.classification.cdsco_class ?? "[TBD]"}${card.classification.class_qualifier ? ` (qualifier: ${card.classification.class_qualifier})` : ""}`,
    `Q1 clinical state: ${wa.q1 ?? "[NEEDS INPUT]"}`,
    `Q9 patient contact: ${wa.q9 ?? "[NEEDS INPUT]"}`,
    `Q8 predicate (wizard-explicit): ${wa.q8 ?? "[NEEDS INPUT]"} (novel = ${isNovel})`,
    `Drug-eluting trigger fired: ${drugEluting}`,
    `B5 clinical evidence status: ${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT: clinical evidence status]"}`,
    `§8.16 animal preclinical sub-block gate: ${includeAnimalPreclinical ? `INCLUDE${animalPreclinicalAssumed ? " [ASSUMED YES — confirm in editor]" : ""}` : "OMIT (suppressed by section-gating predicate)"}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object.",
    "```",
    "{",
    `  "clinical_evidence_summary": "150-280 words. Map B5 status (${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT]"}) to a concrete description for this hardware device. ${card.classification.cdsco_class === "D" ? "Class D — clinical evidence is the primary safety / performance evidence basis; be explicit." : ""} ${isNovel ? "Novel device (Q8=no) — substantial-equivalence basis unavailable; clinical evidence is effectively mandatory (cross-reference §6 Predicate Comparison for the no-predicate consequence)." : ""} Use [NEEDS INPUT: ...] for study identifiers / DOIs / sample sizes — do not invent.",`,
    `  "evidence_plan": "120-260 words. Prospective pivotal investigation plan: primary endpoint, target patient population, anticipated sample size band, follow-up duration appropriate to the device class. For a Class D + novel implantable, anticipate a pivotal CI conducted under MD-22 (CI permission) → MD-23 (CI grant) sequence with CTRI registration and EC approval, multi-site preferred for generalisability. Cross-reference §3 Intended Use (target population) + §6 Predicate Comparison (no-predicate consequence). Use [NEEDS INPUT: ...] for protocol-specific parameters.",`,
    `  "pms_plan_summary": "150-280 words. Active vigilance per MDR-2017 Sixth Schedule. Three paragraphs: (1) complaint handling — intake → triage → CAPA workflow, name typical SLAs (24-hour acknowledgement, 30-day root-cause closure target); (2) adverse-event reporting — name specific forms (MD-42 manufacturer AE, MD-43 PMS report, Form-25 device adverse event) with their triggering events and regulatory windows (Serious AE within 15 days per Sixth Schedule); (3) periodic reporting + PSUR cadence (6-monthly first 2 years post-launch, then annual). NO drift / ACP / retraining metrics.",`,
    `  "vigilance_reporting_framework": "60-150 words. Forms MD-42 / MD-43 / Form-25 — name the form for each event class and its reporting window. Cite the Sixth Schedule once.",`,
    `  "post_market_clinical_followup": "60-150 words. PMCF triggers and cadence appropriate to the device profile. ${card.classification.cdsco_class === "D" || card.classification.cdsco_class === "C" ? "Class C/D — quarterly cadence minimum for the first 24 months post-launch, with PMCF reports feeding back into §10 Risk Management." : "Annual default cadence."}",`,
    isNovel
      ? `  "clinical_investigation_pathway_note": "80-180 words. Surface the MD-22 → MD-23 clinical-investigation pathway in the full sequence: MD-26 (novel-device pre-permission) → MD-27 (pre-permission grant) → MD-22 (CI permission application) → MD-23 (CI grant) → CI conduct under the protocol → MD-7 → MD-9. CTRI registration required before subject enrolment. EC approval required per ICMR 2023 ethics framework. Cross-reference §4 Classification & Pathway for the full sequence and §6 Predicate Comparison for the novel-device basis. NO 'Reviewer Concierge' or platform-marketing language."`
      : `  "clinical_investigation_pathway_note": null,`,
    includeAnimalPreclinical
      ? `  "animal_preclinical_subblock": "150-280 words. DMF §8.16 animal preclinical sub-block. For ${wa.q9 === "implant_gt_30d" ? "this long-term implantable device" : "the device profile"}${drugEluting ? " (combination product with active drug component)" : ""}, describe the GLP-compliant animal preclinical programme: (1) implantation model — appropriate species + study design (e.g., overlapping coronary stenting in porcine model for cardiovascular implants; subcutaneous or intramuscular implantation per ISO 10993-6 for other long-term implants); (2) duration of follow-up matched to the intended implant duration; (3) pharmacokinetic + toxicokinetic data if drug-eluting, characterising local and systemic drug exposure profiles; (4) chronic histopathology endpoints feeding §13 biocompatibility under ISO 10993-6 / -11. Cross-reference §13 Biocompatibility + §10 Risk Management. ${animalPreclinicalAssumed ? "Important: the animal preclinical gate was set by the assumed-yes safeguard (no signal); founder confirms applicability before doing any of this work." : ""} Use [NEEDS INPUT: ...] for specific study parameters."`
      : `  "animal_preclinical_subblock": null,`,
    "}",
    "```",
    "",
    "Apply softening rules. Do not invent study IDs, sample sizes, or CTRI registration numbers. Hardware framing only.",
  ].join("\n");
}

function formatHardwareMarkdown(args: {
  llm: HardwareLlmOutput;
  sources: SourceData;
  includeAnimalPreclinical: boolean;
  animalPreclinicalAssumed: boolean;
  isNovel: boolean;
}): string {
  const {
    llm,
    sources,
    includeAnimalPreclinical,
    animalPreclinicalAssumed,
    isNovel,
  } = args;
  const wa = sources.wizard_answers;
  const lines: string[] = [];

  lines.push("## Clinical evidence status");
  lines.push("");
  lines.push(`**Tier B B5 status:** ${wa.b5_clinical_evidence_status ?? "[NEEDS INPUT]"}`);
  lines.push("");

  lines.push("## Clinical evidence summary");
  lines.push("");
  lines.push(softenCertainty(llm.clinical_evidence_summary));
  lines.push("");

  lines.push("## Evidence plan");
  lines.push("");
  lines.push(softenCertainty(llm.evidence_plan));
  lines.push("");

  // §8.16 animal preclinical sub-block — code-gated. When the
  // calibrated trigger fires under assumed-status safeguard, surface
  // the [ASSUMED YES] tag prominently (heading + preamble) so the
  // founder sees the safeguard at sub-block top, not buried in
  // narrative. Same pattern as §8.12 in section-08-design-manufacturing.
  if (includeAnimalPreclinical && llm.animal_preclinical_subblock) {
    if (animalPreclinicalAssumed) {
      lines.push(
        "## §8.16 Animal preclinical (conditional sub-block) — [ASSUMED YES — confirm in editor]"
      );
      lines.push("");
      lines.push(
        "_The synthesizer had no explicit signal that this device requires animal preclinical data; the standing blast-radius safeguard included this sub-block by default via the drug-combination route. Before doing any of the work below, confirm whether your device's profile actually requires animal preclinical evidence. If not, remove this sub-block in the editor._"
      );
      lines.push("");
    } else {
      lines.push("## §8.16 Animal preclinical (conditional sub-block)");
      lines.push("");
    }
    lines.push(softenCertainty(llm.animal_preclinical_subblock));
    lines.push("");
    lines.push("### Animal preclinical attestation");
    lines.push("- [ ] GLP-compliant animal study protocol on file");
    lines.push("- [ ] Implant-model + species rationale documented");
    lines.push("- [ ] Follow-up duration aligned with intended-use exposure");
    lines.push("- [ ] Chronic histopathology endpoints linked to §13 biocompatibility");
    lines.push("- [ ] Pharmacokinetic / toxicokinetic data (if drug-eluting) linked to §13 ISO 10993-16/-17");
    lines.push("- [ ] EC + IAEC clearances on file (where applicable)");
    lines.push("");
  }

  // Clinical investigation pathway for novel devices
  if (isNovel && llm.clinical_investigation_pathway_note) {
    lines.push("## Clinical investigation pathway (MD-22 → MD-23)");
    lines.push("");
    lines.push(softenCertainty(llm.clinical_investigation_pathway_note));
    lines.push("");
  }

  lines.push("## Post-market surveillance plan");
  lines.push("");
  lines.push(softenCertainty(llm.pms_plan_summary));
  lines.push("");

  lines.push("## Vigilance reporting framework");
  lines.push("");
  lines.push(softenCertainty(llm.vigilance_reporting_framework));
  lines.push("");

  lines.push("## Post-market clinical follow-up (PMCF)");
  lines.push("");
  lines.push(softenCertainty(llm.post_market_clinical_followup));
  lines.push("");

  // Cross-references — hardware-specific
  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §3 Intended Use — target population + intended-use claim");
  lines.push("- §6 Predicate Comparison — no-predicate / has-predicate basis for clinical evidence expectation");
  lines.push("- §10 Risk Management — clinical findings + PMCF feed the ISO 14971 hazard register");
  lines.push("- §13 Biocompatibility — chronic toxicity + leachables data");
  lines.push("- §4 Classification & Pathway — MD-22 / MD-23 sequence for novel devices");

  return lines.join("\n");
}

const generateSection12Hardware: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();

  // §8.16 animal preclinical sub-block gating — single source of
  // truth from section-gating.ts. Mixed gate: Q9 long-term contact
  // is wizard-explicit (strict); drug-content path uses calibrated
  // trigger.
  const animalDecision = shouldIncludeSubBlock("animal_preclinical", sources);
  const includeAnimalPreclinical = animalDecision.included;
  const animalPreclinicalAssumed = animalDecision.assumed;

  // Predicate + drug-eluting flags for prompt routing.
  const isNovel = sources.wizard_answers.q8 === "no";
  const drugMarker = sources.readiness_card.inference_markers?.find(
    (x) => x.field === "drug_content"
  );
  const drugEluting = drugMarker !== undefined && /^\s*yes\b/i.test(drugMarker.value);

  const sourceFields = [
    "wizard.q1",
    "wizard.q8",
    "wizard.q9",
    "wizard.b5_clinical_evidence_status",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.inference_markers.drug_content",
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
        includeAnimalPreclinical,
        animalPreclinicalAssumed,
        isNovel,
        drugEluting,
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
    console.error(`[§12 hardware] failed: ${msg}`);
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content: `[Section 12 hardware generation failed: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        // Gate metadata set before the LLM call lands, so it survives
        // a Zod / API failure. Downstream assertions can confirm the
        // gate decision independent of narrative completion.
        source_fields: [
          ...sourceFields,
          `_animal_preclinical_gate:${includeAnimalPreclinical ? "included" : "excluded"}`,
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

  const content = formatHardwareMarkdown({
    llm: llmOutput,
    sources,
    includeAnimalPreclinical,
    animalPreclinicalAssumed,
    isNovel,
  });
  const wordCount = content.trim().split(/\s+/).length;

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "MDR-2017 Fourth Schedule Appendix II",
      quote: "Clinical evidence requirements.",
      exact_reference: "DMF §8.18",
    },
    {
      citation_id: "[2]",
      source_doc: "MDR-2017 Sixth Schedule",
      quote: "Post-market surveillance + vigilance reporting framework.",
      exact_reference: "Sixth Schedule",
    },
    {
      citation_id: "[3]",
      source_doc: "MDR-2017 Forms MD-42 / MD-43 / Form-25",
      quote: "Manufacturer AE / PMS / device-AE reporting forms.",
      exact_reference: "MDR-2017 vigilance reporting schedule",
    },
    ...(isNovel
      ? [
          {
            citation_id: "[4]",
            source_doc: "MDR-2017 Forms MD-22 / MD-23",
            quote:
              "Clinical investigation permission (MD-22) + grant (MD-23) for novel devices.",
            exact_reference: "MDR-2017 Forms MD-22, MD-23",
          },
          {
            citation_id: "[5]",
            source_doc: "ICMR 2023 ethics guidelines",
            quote:
              "Ethics Committee approval framework for clinical investigations.",
            exact_reference: "ICMR National Ethical Guidelines 2023",
          },
        ]
      : []),
    ...(includeAnimalPreclinical
      ? [
          {
            citation_id: `[${isNovel ? 6 : 4}]`,
            source_doc: "MDR-2017 Fourth Schedule Appendix II",
            quote:
              "Animal preclinical data — sub-block of DMF Appendix II for long-term contact and combination-product devices.",
            exact_reference: "DMF §8.16",
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
        `_animal_preclinical_gate:${includeAnimalPreclinical ? "included" : "excluded"}`,
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
export const generateSection12: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  if (sources.wizard_answers.persona === "manufacturer_hardware") {
    return generateSection12Hardware(sources, opts);
  }
  return generateSection12Samd(sources, opts);
};
