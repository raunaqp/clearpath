/**
 * Section 13 — Biocompatibility (ISO 10993).
 *
 * Maps to: DMF §8.11 Biocompatibility validation data (Bible §4.B
 * Block 4 line 298). Gated on Q9 patient_contact ≠ no_contact at the
 * orchestrator level (`section-gating.ts`).
 *
 * Strategy: HYBRID.
 *   - **Deterministic** owns *which* ISO 10993 tests appear in the panel.
 *     Selection comes from BIOCOMP_TIER_MATRIX[q9] + conditional add-ons
 *     for drug-eluting (drug_content marker affirmative) and bioresorbable
 *     (one-liner / pitch-extract keyword scan). This is the highest-
 *     blast-radius signal in the pack — an LLM picking the panel could
 *     miss 10993-13 for a bioresorbable implant or call for wrong-tier
 *     10993-23 mucosal on an intact-skin device. The editor can't fix
 *     either; the recommendation logic itself would be wrong.
 *   - **LLM (Sonnet, 1 call)** writes the narrative wrapper — device-
 *     specific tier rationale, drug-eluting / bioresorbable explanation,
 *     and sequencing notes. Narrative cannot add or remove rows from
 *     the table.
 *
 * Founder-review handoff: docs/seed-tables/iso-10993-tier-matrix.md is
 * the moat-content artifact (per `feedback_moat_content_reviewable.md`).
 * Founder + CDSCO consultant sign off the [REVIEW] cells there before
 * launch; each row flips review_status estimate → reviewed.
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
import {
  BIOCOMP_TIER_MATRIX,
  DRUG_ELUTING_ADDON,
  BIORESORBABLE_ADDON,
  mergePanel,
  type BiocompTier,
  type IsoTest,
} from "./iso-10993-tier-matrix";
import type { PatientContact } from "@/lib/wizard/types";

const SECTION_KEY = "13_biocompatibility" as const;
const TITLE = "Biocompatibility (ISO 10993)";
const MAX_TOKENS = 1400;

// ────────────────────────────────────────────────────────────────────
// Add-on detection — deterministic
// ────────────────────────────────────────────────────────────────────

/** Drug-eluting trigger uses the same calibrated rule the gating module
 *  applies for §8.12. Marker affirmative → fires. Marker absent or
 *  parses negative → does NOT fire (deterministic decision; we do not
 *  apply the assumed-yes safeguard inside §13 because the section is
 *  already gated). */
function drugElutingTriggered(sources: SourceData): boolean {
  const m = sources.readiness_card.inference_markers?.find(
    (x) => x.field === "drug_content"
  );
  return m !== undefined && /^\s*yes\b/i.test(m.value);
}

/** Bioresorbable trigger: keyword scan against the one-liner and the
 *  pitch-extracted intended-use string + device name. Conservative
 *  regex — matches the four most common terms in this product
 *  category. Material class (polymer / ceramic / metal) is not on
 *  the PitchAiExtracted schema; founder names it in the editor. */
function bioresorbableTriggered(sources: SourceData): boolean {
  const haystack = [
    sources.intake.one_liner,
    sources.ai_extracted?.intended_use_one_liner,
    sources.ai_extracted?.device_name,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .toLowerCase();
  if (!haystack) return false;
  return /\b(bioresorbable|biodegradable|absorbable|resorbable)\b/.test(
    haystack
  );
}

// ────────────────────────────────────────────────────────────────────
// Panel rendering — markdown table + checkbox rows
// ────────────────────────────────────────────────────────────────────

function renderPanelTable(panel: IsoTest[]): string {
  const lines: string[] = [];
  lines.push(`| ISO part | Test | Applicability | Rationale |`);
  lines.push(`|---|---|---|---|`);
  for (const t of panel) {
    const reviewMark = t.review_status === "reviewed" ? "" : " [REVIEW]";
    lines.push(
      `| ${t.iso_part} | ${t.test_name} | ${t.applicability}${reviewMark} | ${t.rationale} |`
    );
  }
  return lines.join("\n");
}

function renderPanelChecklist(panel: IsoTest[]): string {
  const lines: string[] = [];
  for (const t of panel) {
    lines.push(`### ${t.iso_part} — ${t.test_name}`);
    lines.push(`- [ ] Test report on file (NABL-accredited lab)`);
    lines.push(`- [ ] Results meet acceptance criteria`);
    lines.push(`- [ ] Linked to §10 Risk Management hazard analysis`);
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

// ────────────────────────────────────────────────────────────────────
// LLM narrative — single Sonnet call, structured JSON
// ────────────────────────────────────────────────────────────────────

// Empirical calibration (Day-5 morning, 2 runs):
//   - Sonnet's substantive regulatory narrative for an implant + drug-
//     eluting + bioresorbable + sterile case lands at 1000–1700 chars
//     per field. Initial 800-char cap clipped sequencing_note; 1200-char
//     cap clipped tier_rationale on a separate roll. 2000 absorbs the
//     variance without inviting padding.
const NarrativeSchema = z.object({
  tier_rationale: z.string().min(120).max(2000),
  drug_eluting_rationale: z.string().min(80).max(2000).nullable(),
  bioresorbable_rationale: z.string().min(80).max(2000).nullable(),
  sequencing_note: z.string().min(80).max(2000),
});
type Narrative = z.infer<typeof NarrativeSchema>;

function buildNarrativeUserMessage(args: {
  sources: SourceData;
  q9: Exclude<PatientContact, "no_contact">;
  tier: BiocompTier;
  panel: IsoTest[];
  drugEluting: boolean;
  bioresorbable: boolean;
}): string {
  const { sources, q9, tier, panel, drugEluting, bioresorbable } = args;
  const card = sources.readiness_card;
  const productName = card.meta.product_name || card.meta.company_name;

  const panelSummary = panel
    .map((t) => `- ${t.iso_part} ${t.test_name} (${t.applicability})`)
    .join("\n");

  const sections: string[] = [
    "Write the narrative wrapper for Section 13 (Biocompatibility) of a CDSCO MD-7/MD-3 hardware Submission Pack.",
    "",
    "Opening framing: anchor the tier in the device-specific facts (what the device is, what it contacts, for how long). Substance before citation. Do NOT add or remove tests from the panel — the panel was selected deterministically from ISO 10993-1:2018 Annex A and you are explaining it, not deciding it.",
    "",
    "## Applicant data",
    `Product: ${productName}`,
    `One-liner: ${sources.intake.one_liner}`,
    `Q9 patient_contact (wizard-explicit): ${q9}`,
    `ISO 10993-1 category: ${tier.iso_10993_1_category}`,
    `Default contact duration: ${tier.duration_default}`,
    `Drug-eluting trigger fired: ${drugEluting}`,
    `Bioresorbable trigger fired: ${bioresorbable}`,
    "",
    "## Selected test panel (deterministic — do not modify this list in your output)",
    panelSummary,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Aim for the lower end of word bands.",
    "```",
    "{",
    `  "tier_rationale": "120-220 words. Why this device lands in the ${tier.iso_10993_1_category} category. Reference Q9 = ${q9} once. Reference ISO 10993-1:2018 Annex A as the selection authority once. Mention NABL-accredited lab evidence requirement. Do NOT enumerate the test panel — that's the table immediately below this paragraph.",`,
    drugEluting
      ? `  "drug_eluting_rationale": "80-150 words. Why drug-eluting devices require additional -17 allowable-limits, extended -18 chemical characterization, and -16 toxicokinetic. Cross-reference §8.12 (medicinal substances sub-block in §8 Design & Manufacturing) and §19 (DCG(I) joint review NOC). Combination-product framing.",`
      : `  "drug_eluting_rationale": null,`,
    bioresorbable
      ? `  "bioresorbable_rationale": "80-150 words. Why bioresorbable devices add -9, -13/-14/-15 (matrix-class-specific), and -16 toxicokinetic. Acknowledge that matrix material class (polymer / ceramic / metal) is required to pick between -13/-14/-15. Suggest founder names the material in the editor.",`
      : `  "bioresorbable_rationale": null,`,
    `  "sequencing_note": "80-120 words. §13 testing typically begins AFTER material selection in §8 Design & Manufacturing, runs IN PARALLEL with §15 Stability (accelerated-aging samples double as leachables source), and FEEDS §10 Risk Management. For sterile devices, §14 Sterilization Validation MUST precede final §13 testing because sterilization can change leachables profiles."`,
    "}",
    "```",
    "",
    "Apply softening rules from the system prompt. Do not invent applicant facts (no specific lab names, no certificate numbers, no study IDs). Use [NEEDS INPUT: …] for genuinely-missing specifics.",
  ];
  return sections.join("\n");
}

async function fetchNarrative(args: {
  sources: SourceData;
  q9: Exclude<PatientContact, "no_contact">;
  tier: BiocompTier;
  panel: IsoTest[];
  drugEluting: boolean;
  bioresorbable: boolean;
  opts: SectionOpts;
}): Promise<{ narrative: Narrative; cost: number; usage: SectionOutput["meta"]["usage"] } | { error: string; cost: number; usage: SectionOutput["meta"]["usage"] }> {
  try {
    const userMessage = buildNarrativeUserMessage({
      sources: args.sources,
      q9: args.q9,
      tier: args.tier,
      panel: args.panel,
      drugEluting: args.drugEluting,
      bioresorbable: args.bioresorbable,
    });
    const llmResult = await callLlm({
      assessmentId: args.sources.assessment_id,
      callLayer: "draft_pack_v2",
      model: SECTION_MODEL,
      userMessage,
      systemPrompt: SHARED_SECTION_SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      dryRun: args.opts.dry_run,
      log: args.opts.log,
    });
    const narrative = NarrativeSchema.parse(parseStrictJson(llmResult.rawText));
    return {
      narrative,
      cost: llmResult.costUsd,
      usage: llmResult.usage,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Surface to stderr too — the orchestrator log can be tail-trimmed
    // by callers, but stderr survives.
    console.error(`[§13] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    args.opts.log?.(`  [§13] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    return { error: msg, cost: 0, usage: null };
  }
}

// ────────────────────────────────────────────────────────────────────
// Content assembly
// ────────────────────────────────────────────────────────────────────

function assembleContent(args: {
  q9: Exclude<PatientContact, "no_contact">;
  tier: BiocompTier;
  panel: IsoTest[];
  drugEluting: boolean;
  bioresorbable: boolean;
  narrative: Narrative | null;
}): string {
  const lines: string[] = [];

  // 1. Tier overview
  lines.push("## Tier overview");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(`| ISO 10993-1 category | ${args.tier.iso_10993_1_category} |`);
  lines.push(`| Q9 patient_contact (wizard-explicit) | ${args.q9} |`);
  lines.push(`| Default contact duration | ${args.tier.duration_default} |`);
  const addonList: string[] = [];
  if (args.drugEluting) addonList.push("drug-eluting");
  if (args.bioresorbable) addonList.push("bioresorbable / biodegradable");
  lines.push(
    `| Add-on panels applied | ${addonList.length > 0 ? addonList.join(", ") : "none"} |`
  );
  lines.push(`| Lab-evidence requirement | NABL-accredited test reports |`);
  lines.push("");

  // 2. Tier rationale (LLM narrative or fallback)
  lines.push("## Why this tier applies");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.tier_rationale));
  } else {
    lines.push(
      softenCertainty(
        `Patient-contact value Q9 = \`${args.q9}\` places this device in the ISO 10993-1:2018 Annex A category "${args.tier.iso_10993_1_category}". The test panel below is the selection that category requires; CDSCO reviewers cross-check against ISO 10993-1 Annex A and expect test reports from a NABL-accredited lab. [NEEDS INPUT: device-specific rationale paragraph — narrative LLM call did not complete this run]`
      )
    );
  }
  lines.push("");

  // 3. Selected panel — table view
  lines.push("## Selected ISO 10993 test panel");
  lines.push("");
  lines.push(renderPanelTable(args.panel));
  lines.push("");

  // 4. Per-test attestation rows — founder ticks once data on file
  lines.push("## Per-test attestation");
  lines.push("");
  lines.push(
    "Tick once the test report is on file and reviewed against acceptance criteria. Reports from a NABL-accredited lab are expected by CDSCO reviewers."
  );
  lines.push("");
  lines.push(renderPanelChecklist(args.panel));
  lines.push("");

  // 5. Drug-eluting rationale (conditional)
  if (args.drugEluting) {
    lines.push("## Drug-eluting overlay");
    lines.push("");
    if (args.narrative?.drug_eluting_rationale) {
      lines.push(softenCertainty(args.narrative.drug_eluting_rationale));
    } else {
      lines.push(
        softenCertainty(
          "Drug-eluting devices add ISO 10993-17 (allowable limits) and -18 (extended chemical characterization) for drug + carrier extractables, plus 10993-16 toxicokinetic study design. The device is also treated as a combination product — see §8 Design & Manufacturing for the §8.12 medicinal substances sub-block and §19 Conditional NOCs for the DCG(I) joint review."
        )
      );
    }
    lines.push("");
  }

  // 6. Bioresorbable rationale (conditional)
  if (args.bioresorbable) {
    lines.push("## Bioresorbable overlay");
    lines.push("");
    if (args.narrative?.bioresorbable_rationale) {
      lines.push(softenCertainty(args.narrative.bioresorbable_rationale));
    } else {
      lines.push(
        softenCertainty(
          "Bioresorbable devices add ISO 10993-9 (degradation framework), -13/-14/-15 (degradation products per matrix class — polymeric / ceramic / metallic), and -16 (toxicokinetic study design). The matrix material class is required to pick between -13/-14/-15. [NEEDS INPUT: device matrix material class — polymer / ceramic / metal]"
        )
      );
    }
    lines.push("");
  }

  // 7. Sequencing notes
  lines.push("## Sequencing with adjacent sections");
  lines.push("");
  if (args.narrative?.sequencing_note) {
    lines.push(softenCertainty(args.narrative.sequencing_note));
  } else {
    lines.push(
      softenCertainty(
        "§13 testing typically begins after material selection in §8 Design & Manufacturing, runs in parallel with §15 Stability Data (accelerated-aging samples often double as the leachables source for -17 / -18), and feeds §10 Risk Management (ISO 14971 hazard analysis). For sterile devices, §14 Sterilization Validation precedes final §13 testing because the sterilization process can change leachables profiles."
      )
    );
  }
  lines.push("");

  // 8. Cross-references
  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §8 Design & Manufacturing — materials list + manufacturing process");
  lines.push("- §10 Risk Management — ISO 14971 hazard register receives biocomp findings");
  lines.push("- §14 Sterilization Validation — must precede final biocomp testing for sterile devices");
  lines.push("- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source");
  if (args.drugEluting) {
    lines.push("- §8.12 Medicinal substances sub-block (in §8) — drug component dossier");
    lines.push("- §19 Conditional NOCs — DCG(I) joint review for combination product");
  }

  return lines.join("\n").trimEnd();
}

// ────────────────────────────────────────────────────────────────────
// SectionGenerator entry
// ────────────────────────────────────────────────────────────────────

export const generateSection13: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
): Promise<SectionOutput> => {
  const startedAt = new Date().toISOString();
  const q9 = sources.wizard_answers.q9;

  // Section-gating predicate guarantees q9 is set + ≠ no_contact for
  // hardware persona. Defensive guard in case this is invoked outside
  // the orchestrator.
  if (!q9 || q9 === "no_contact") {
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content:
        "_§13 not applicable: Q9 patient_contact = no_contact or missing._",
      citations: [],
      completion_status: "pending",
      word_count: 0,
      meta: {
        generation_strategy: "deterministic",
        source_fields: ["wizard.q9"],
        model: null,
        llm_cost_usd: null,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: null,
        usage: null,
      },
    };
  }

  // 1. Look up the deterministic base panel.
  const tier = BIOCOMP_TIER_MATRIX[q9];
  const drugEluting = drugElutingTriggered(sources);
  const bioresorbable = bioresorbableTriggered(sources);

  // 2. Merge add-on panels deterministically.
  const addons: IsoTest[][] = [];
  if (drugEluting) addons.push(DRUG_ELUTING_ADDON);
  if (bioresorbable) addons.push(BIORESORBABLE_ADDON);
  const panel = mergePanel(tier.panel, ...addons);

  // 3. One Sonnet call for the narrative wrapper. The deterministic
  //    skeleton is the fallback if the LLM call fails.
  const narrativeResult = await fetchNarrative({
    sources,
    q9,
    tier,
    panel,
    drugEluting,
    bioresorbable,
    opts,
  });
  const narrative = "narrative" in narrativeResult ? narrativeResult.narrative : null;
  const llmError = "error" in narrativeResult ? narrativeResult.error : null;
  const cost = narrativeResult.cost;
  const usage = narrativeResult.usage;

  // 4. Assemble the final markdown content.
  const content = assembleContent({
    q9,
    tier,
    panel,
    drugEluting,
    bioresorbable,
    narrative,
  });

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "ISO 10993-1:2018",
      quote:
        "Biological evaluation of medical devices — Part 1: Evaluation and testing within a risk management process (Annex A test selection matrix).",
      exact_reference: "ISO 10993-1:2018 Annex A",
    },
    {
      citation_id: "[2]",
      source_doc: "MDR-2017 Fourth Schedule Appendix II",
      quote: "Biocompatibility validation data",
      exact_reference: "DMF §8.11",
    },
  ];
  if (drugEluting) {
    citations.push({
      citation_id: "[3]",
      source_doc: "MDR-2017 Forms MD-26 / MD-27 + bible §4.B Blocks 5–6",
      quote:
        "Drug-eluting devices: combination-product treatment with DCG(I) joint review.",
      exact_reference: "Bible §4.B Block 5 (DCG(I) NOC), Block 6 (MD-27 path)",
    });
  }

  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations,
    completion_status: narrative ? "complete" : "pending",
    word_count: content.split(/\s+/).filter(Boolean).length,
    meta: {
      generation_strategy: "llm_synthesized",
      source_fields: [
        "wizard.q9",
        "readiness_card.inference_markers.drug_content",
        "intake.one_liner",
        "ai_extracted.intended_use_one_liner",
        "ai_extracted.device_name",
      ],
      model: SECTION_MODEL,
      llm_cost_usd: cost,
      generated_at: startedAt,
      dry_run: opts.dry_run,
      error_message: llmError,
      usage,
    },
  };
};
