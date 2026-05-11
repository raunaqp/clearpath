/**
 * Section 10 — Risk Management (ISO 14971).
 *
 * Maps to: DMF §8.9 Risk analysis and control summary.
 * Spec: docs/specs/draft-pack-document-matrix.md Section 10.
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

const SECTION_KEY = "10_risk_management" as const;
const TITLE = "Risk Management (ISO 14971)";
const MAX_TOKENS = 4500;

// Phase 4b iteration — severity/probability accept free-form strings
// (Sonnet returns variants like "moderate", "low-medium" not in our
// 5-tier enum). risk_management_file_reference max bumped 4x.
const RiskRegisterRowSchema = z.object({
  risk_id: z.string(),
  hazard: z.string(),
  hazardous_situation: z.string(),
  harm: z.string(),
  severity: z.string(),
  probability: z.string(),
  mitigation: z.string(),
  residual_severity: z.string(),
  residual_probability: z.string(),
});
const LlmSchema = z.object({
  risk_register: z.array(RiskRegisterRowSchema).min(3),
  risk_summary_narrative: z.string().min(150).max(6000),
  residual_risk_assessment: z.string().min(80).max(3000),
  risk_management_file_reference: z.string().min(20).max(1600),
  ai_ml_specific_risks: z
    .array(z.object({ risk: z.string(), mitigation: z.string() }))
    .nullable(),
  sterility_risks: z
    .array(z.object({ risk: z.string(), mitigation: z.string() }))
    .nullable(),
});
type LlmOutput = z.infer<typeof LlmSchema>;

function isSterile(sources: SourceData): boolean {
  const s = (sources.ai_extracted?.product_meta?.sterile ?? "").toLowerCase();
  return s.includes("sterile") && !s.includes("non-sterile");
}

function buildUserMessage(sources: SourceData): string {
  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const b4 = wa.b4_risks_and_mitigations ?? [];
  const topGaps = card.top_gaps ?? [];
  const sterile = isSterile(sources);

  return [
    "Generate Section 10 (Risk Management — ISO 14971) for a CDSCO MD-7/MD-3 Draft Pack.",
    "Opening framing: the risk register is the centrepiece. Lead with how the register was built (clinical hazard analysis + applicant-declared risks + Risk Card top-gap items) and HOW residual risk is being managed operationally — review cadence (e.g., quarterly RMF review), who owns it (RA lead / clinical reviewer), how new field reports feed back in. This is the section where consultant credibility lives or dies; make it specific.",
    "",
    "## Applicant data",
    `Q1 clinical state: ${wa.q1 ?? "[TBD]"}`,
    `Class: ${card.classification.cdsco_class} / qualifier: ${card.classification.class_qualifier ?? "—"}`,
    `AI/ML flag: ${card.classification.ai_ml_flag}`,
    `C1 software lifecycle: ${wa.c1_software_lifecycle_model ?? "(not captured)"}`,
    `Sterile: ${sterile ? "yes" : "no/[TBD]"}`,
    `Has predicate: ${wa.b3_no_predicate ? "false (novel)" : (wa.b3_predicate_devices ?? []).length > 0 ? "true" : "[TBD]"}`,
    `ISO 13485 status (B6): ${wa.b6_iso_13485_status ?? "[TBD]"}`,
    "",
    "## Applicant-declared risks (Tier B B4):",
    ...b4.map((r, i) => `  ${i + 1}. risk: ${r.risk} | mitigation: ${r.mitigation}`),
    "",
    "## Risk Card top_gaps (cross-anchor):",
    ...topGaps
      .slice(0, 5)
      .map(
        (g, i) =>
          `  ${i + 1}. [${g.severity}] ${g.gap_title} → ${g.fix_action}`
      ),
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Expand each B4 row to ISO 14971's hazard → hazardous_situation → harm chain. Add 1-2 additional rows derived from top_gaps if needed to reach ≥ 3 total.",
    "```",
    "{",
    `  "risk_register": [`,
    `    { "risk_id": "R1", "hazard": "...", "hazardous_situation": "...", "harm": "...", "severity": "serious|critical|...", "probability": "rare|occasional|...", "mitigation": "...", "residual_severity": "...", "residual_probability": "..." }`,
    `    /* ≥ 3 rows; Class D → ≥ 5 rows */`,
    "  ],",
    `  "risk_summary_narrative": "150-300 words. Tight overview tying highest residual risks to clinical state (${wa.q1 ?? "[NEEDS INPUT: clinical state]"}) and intended use. Reference at least one register row by risk_id. Specific operational detail welcomed: who reviews the RMF (typical RA lead + clinical reviewer), cadence (quarterly), how field reports flow in. ${card.classification.cdsco_class === "D" ? "Class D — explicit on the heightened review cadence (monthly during pilot, quarterly post-grant)." : ""}",`,
    `  "residual_risk_assessment": "80-150 words. Document the evaluation outcome. Where residual is elevated for specific rows, name them (R3, R5 etc.) and explain why post-market monitoring is sufficient — what specific signal flips them into a CAPA.",`,
    `  "risk_management_file_reference": "20-80 words. ${wa.b6_iso_13485_status === "certified" ? "RMF maintained per ISO 14971 §3 and integrated with the QMS." : "[NEEDS INPUT: RMF formalisation timeline tied to ISO 13485 engagement (see Section 8)]."}",`,
    card.classification.ai_ml_flag
      ? `  "ai_ml_specific_risks": "GENERATE 3-5 rows in the array form below. Each mitigation should sound like someone who has actually deployed an ML model — name a specific metric, a monitoring cadence, an escalation path. Avoid generic statements like 'continuous monitoring'. Examples (DO NOT copy verbatim — write fresh, anchored to this device): { risk: 'Calibration drift in deployed cohort (output probability vs observed rate)', mitigation: 'Weekly Brier-score check on a held-out monitoring cohort; > 0.05 drift flagged to clinical reviewer; if confirmed, retraining cycle triggered under ACP §4.' }, { risk: 'Subgroup performance disparity (age, sex, comorbidity strata)', mitigation: 'Pre-deployment subgroup validation at launch; quarterly fairness audit on prospective data. [NEEDS INPUT: specific subgroup strata in scope]' }, { risk: 'Adversarial / out-of-distribution inputs', mitigation: 'Input sanity checks at inference boundary; OOD score thresholding with rejection path. Clinician notified on rejection.' }",`
      : '  "ai_ml_specific_risks": null,',
    sterile
      ? `  "sterility_risks": "Generate 2-3 rows. Examples: { risk: 'Sterilisation process failure / SAL not achieved', mitigation: 'Process validation per ISO 11135/11137/17665; routine bio-burden monitoring per release schedule; non-conforming lots quarantined under CAPA.' }, { risk: 'Sterile-barrier breach in transit', mitigation: 'Packaging validation per ISO 11607; user inspection step in IFU (Section 7) before clinical use.' }"`
      : '  "sterility_risks": null',
    "}",
    "```",
    "",
    wa.b4_risks_and_mitigations && wa.b4_risks_and_mitigations.length < 3
      ? "Note: B4 is < 3 entries; LLM should fill missing rows from top_gaps. Mark filler rows with risk_id starting with 'AUTO-'."
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
  const lines: string[] = [];

  lines.push("## Risk register (ISO 14971)");
  lines.push("");
  lines.push(
    "| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |"
  );
  lines.push("|---|---|---|---|---|---|---|---|---|");
  llm.risk_register.forEach((r) => {
    const trunc = (s: string, n: number) =>
      s.length > n ? s.slice(0, n) + "..." : s;
    lines.push(
      `| ${r.risk_id} | ${trunc(r.hazard, 60).replace(/\|/g, "\\|")} | ${trunc(r.hazardous_situation, 80).replace(/\|/g, "\\|")} | ${trunc(r.harm, 60).replace(/\|/g, "\\|")} | ${r.severity} | ${r.probability} | ${trunc(r.mitigation, 100).replace(/\|/g, "\\|")} | ${r.residual_severity} | ${r.residual_probability} |`
    );
  });
  lines.push("");

  lines.push("## Risk summary narrative");
  lines.push("");
  lines.push(llm.risk_summary_narrative);
  lines.push("");

  lines.push("## Residual risk assessment");
  lines.push("");
  lines.push(llm.residual_risk_assessment);
  lines.push("");

  lines.push("## Risk Management File reference");
  lines.push("");
  lines.push(llm.risk_management_file_reference);
  lines.push("");

  if (llm.ai_ml_specific_risks) {
    lines.push("## AI/ML-specific risks");
    lines.push("");
    lines.push("| Risk | Mitigation |");
    lines.push("|---|---|");
    for (const r of llm.ai_ml_specific_risks) {
      lines.push(`| ${r.risk.replace(/\|/g, "\\|")} | ${r.mitigation.replace(/\|/g, "\\|")} |`);
    }
    lines.push("");
  }

  if (llm.sterility_risks) {
    lines.push("## Sterility risks");
    lines.push("");
    lines.push("| Risk | Mitigation |");
    lines.push("|---|---|");
    for (const r of llm.sterility_risks) {
      lines.push(`| ${r.risk.replace(/\|/g, "\\|")} | ${r.mitigation.replace(/\|/g, "\\|")} |`);
    }
    lines.push("");
  }

  // First-in-class note when novel
  if (sources.wizard_answers.b3_no_predicate === true) {
    lines.push("## First-in-class risk note");
    lines.push("");
    lines.push(
      "This is a novel device with no predicate. Unknown failure modes are an inherent first-in-class risk. Mitigations include enhanced Post-Market Surveillance (Section 12) and the MD-22/MD-23 clinical-investigation pathway where the recommended path indicates."
    );
    lines.push("");
  }

  return lines.join("\n");
}

export const generateSection10: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
) => {
  const startedAt = new Date().toISOString();
  const sourceFields = [
    "wizard.q1",
    "wizard.b3_no_predicate",
    "wizard.b3_predicate_devices",
    "wizard.b4_risks_and_mitigations",
    "wizard.b6_iso_13485_status",
    "wizard.c1_software_lifecycle_model",
    "readiness_card.classification.cdsco_class",
    "readiness_card.classification.class_qualifier",
    "readiness_card.classification.ai_ml_flag",
    "readiness_card.top_gaps",
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
      content: `[Section 10 generation failed: ${msg}]`,
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
        source_doc:
          "ISO 14971:2019 — Medical devices — Application of risk management",
        quote:
          "Risk management framework: hazard identification, risk analysis, evaluation, control, residual-risk assessment, post-market activities.",
        exact_reference: "ISO 14971:2019",
      },
      {
        citation_id: "[2]",
        source_doc: "MDR 2017 — Fourth Schedule, Appendix II §8.9",
        quote: "Risk analysis and control summary in the Device Master File.",
        exact_reference: "MDR 2017 Fourth Schedule Appendix II §8.9",
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
