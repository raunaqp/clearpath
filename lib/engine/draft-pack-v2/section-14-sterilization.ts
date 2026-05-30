/**
 * Section 14 — Sterilization Validation.
 *
 * Maps to: DMF §8.14 Sterilization validation (Bible §4.B Block 4
 * line 301). Gated on the `sterile` inference marker via the
 * calibrated trigger (`section-gating.ts`).
 *
 * Strategy: HYBRID — same pattern as §13 Biocompatibility.
 *
 *   - **Deterministic** owns the method panels. Bible §4.D #1
 *     records "sterilisation mode" as a Sprint-3 wizard-question
 *     gap, so we don't know which method the founder will use;
 *     §14 emits ALL FOUR method blocks (EtO / radiation / steam /
 *     aseptic). Founder picks the applicable one in the editor and
 *     removes the rest. Blast-radius safe: a wrong-omitted method
 *     is invisible; a wrong-included one is removable.
 *
 *   - **LLM (Sonnet, 1 call)** writes the device-specific narrative —
 *     opening framing, method-selection guidance (drug-eluting +
 *     bioresorbable constraints from
 *     `METHOD_SELECTION_CONSTRAINTS`), sequencing notes tying §14 to
 *     §13 (leachables-profile change), §15 (sterile-barrier shelf
 *     life), §16 (per-batch release records).
 *
 * Founder-review handoff: docs/seed-tables/iso-sterilization-method-
 * matrix.md is the moat-content artifact. Every [REVIEW]-marked cell
 * targets founder + CDSCO consultant sign-off.
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
  STERILIZATION_METHODS,
  METHOD_SELECTION_CONSTRAINTS,
  CROSS_CUTTING_CONCERNS,
  type SterilizationMethod,
  type SterilizationMethodBlock,
} from "./iso-sterilization-method-matrix";

const SECTION_KEY = "14_sterilization_validation" as const;
const TITLE = "Sterilization Validation";
const MAX_TOKENS = 1400;

// ────────────────────────────────────────────────────────────────────
// Add-on detection — same as §13's helpers; intentionally duplicated
// here so each section owns its trigger logic explicitly.
// ────────────────────────────────────────────────────────────────────

function drugElutingTriggered(sources: SourceData): boolean {
  const m = sources.readiness_card.inference_markers?.find(
    (x) => x.field === "drug_content"
  );
  return m !== undefined && /^\s*yes\b/i.test(m.value);
}

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
// Method-block rendering — deterministic markdown
// ────────────────────────────────────────────────────────────────────

function renderMethodSummaryTable(): string {
  const order: SterilizationMethod[] = ["eto", "radiation", "steam", "aseptic"];
  const lines: string[] = [];
  lines.push("| Method | Primary standard | SAL convention | Material-compat constraint | Key gotcha |");
  lines.push("|---|---|---|---|---|");
  for (const k of order) {
    const m = STERILIZATION_METHODS[k];
    lines.push(
      `| ${m.display_name} | ${m.primary_standard} | ${m.sal_convention} | ${m.material_compat_note} | ${m.key_gotcha} |`
    );
  }
  return lines.join("\n");
}

function renderMethodBlock(
  key: SterilizationMethod,
  block: SterilizationMethodBlock
): string {
  const lines: string[] = [];
  lines.push(`## Method block — ${block.display_name} (${block.primary_standard})`);
  lines.push("");
  lines.push(
    `_Tick this block if your device uses ${block.display_name.toLowerCase()}. Otherwise remove this block in your editor — only your selected method should remain in the final dossier._`
  );
  lines.push("");
  lines.push(`**SAL convention:** ${block.sal_convention}`);
  lines.push("");
  lines.push(`**Material-compatibility constraint:** ${block.material_compat_note}`);
  lines.push("");
  lines.push(`**Key gotcha:** ${block.key_gotcha}`);
  lines.push("");

  lines.push("### Validation steps");
  for (const v of block.validation_steps) {
    lines.push(`- [ ] **${v.label}** — ${v.rationale}`);
  }
  lines.push("");

  lines.push("### Byproduct concerns");
  for (const b of block.byproduct_concerns) {
    lines.push(`- ${b}`);
  }
  lines.push("");

  lines.push("### Sterile barrier expectations");
  for (const s of block.sterile_barrier_notes) {
    lines.push(`- [ ] ${s}`);
  }
  lines.push("");

  if (block.review_note) {
    lines.push(`**[REVIEW]** ${block.review_note}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

// ────────────────────────────────────────────────────────────────────
// LLM narrative — single Sonnet call, structured JSON
// ────────────────────────────────────────────────────────────────────

// See §13 narrative schema for empirical calibration notes — Sonnet
// hardware-narrative paragraphs land at 1000–1700 chars when device
// context is rich (drug-eluting + bioresorbable). 2000 absorbs the
// variance.
const NarrativeSchema = z.object({
  opening_framing: z.string().min(120).max(2000),
  method_selection_guidance: z.string().min(80).max(2000).nullable(),
  cross_cutting_summary: z.string().min(80).max(2000),
  sequencing_note: z.string().min(80).max(2000),
});
type Narrative = z.infer<typeof NarrativeSchema>;

function buildNarrativeUserMessage(args: {
  sources: SourceData;
  drugEluting: boolean;
  bioresorbable: boolean;
  assumed: boolean;
}): string {
  const { sources, drugEluting, bioresorbable, assumed } = args;
  const card = sources.readiness_card;
  const productName = card.meta.product_name || card.meta.company_name;
  const sterileMarker = sources.readiness_card.inference_markers?.find(
    (x) => x.field === "sterile"
  );
  const sterileValue = sterileMarker?.value ?? "[Not inferred]";
  const sterileStatus = sterileMarker?.status ?? "[Not inferred]";

  const sections: string[] = [
    "Write the narrative wrapper for Section 14 (Sterilization Validation) of a CDSCO MD-7/MD-3 hardware Submission Pack.",
    "",
    `Opening framing: anchor the section in this device's facts. Do NOT pick a sterilization method for the founder — the four method blocks below the narrative present all four (EtO / radiation / steam / aseptic) and the founder selects in the editor. Your job is to explain the selection problem in this device's context, not solve it.`,
    "",
    "## Applicant data",
    `Product: ${productName}`,
    `One-liner: ${sources.intake.one_liner}`,
    `sterile inference marker: value="${sterileValue}", status=${sterileStatus}`,
    `Assumed-yes safeguard active: ${assumed ? "yes — marker status was 'assumed' (no signal); founder must confirm sterile=yes in editor" : "no — synthesizer had a signal"}`,
    `Drug-eluting trigger fired: ${drugEluting}`,
    `Bioresorbable trigger fired: ${bioresorbable}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. Aim for the lower end of word bands.",
    "```",
    "{",
    `  "opening_framing": "120-200 words. Why §14 applies to this device (sterile per the inference marker), how the method-selection problem is structured, and that all four method blocks below present alternatives the founder selects from. Cross-reference ISO 11135 / 11137 / 17665 / 13408 series once. Mention NABL-accredited test reports for validation evidence. ${assumed ? "Important: the sterile marker carried [ASSUMED YES] status — call this out so the founder verifies sterility applicability before doing any of the validation work below." : ""}",`,
    drugEluting || bioresorbable
      ? `  "method_selection_guidance": "80-200 words. Method-selection constraints for THIS device profile. ${drugEluting ? "Drug-eluting devices: high-dose gamma typically degrades the drug; EtO leaves residual concerns; aseptic is the industry default for drug-eluting coronary stents and similar." : ""} ${bioresorbable ? "Bioresorbable polymers (PLA, PLGA, magnesium alloys) accelerate degradation under gamma; e-beam at lower validated doses may work with bridging studies; aseptic or low-dose e-beam are typical." : ""} Cross-reference §13 for the leachables-profile change implication.",`
      : `  "method_selection_guidance": null,`,
    `  "cross_cutting_summary": "80-150 words. Walk through the cross-cutting concerns that apply regardless of method: bioburden control (ISO 11737-1), sterility testing in validation (ISO 11737-2), sterile barrier system qualification (ISO 11607-1/-2) tied to §15 Stability shelf-life. Do NOT enumerate the method-specific validation steps — those are in the tables below.",`,
    `  "sequencing_note": "80-200 words. Sequencing with adjacent sections: §14 validation precedes final §13 ISO 10993-17 / -18 leachables runs because sterilization alters the leachables profile (pre-sterilization leachables data requires a bridging justification); §14 sterile-barrier shelf-life claim ties to §15 Stability; per-batch sterility-validation record lands in §16 Batch Release; sterilization-failure modes feed §10 Risk Management hazard register."`,
    "}",
    "```",
    "",
    "Apply softening rules from the system prompt. Do not invent applicant facts (specific dose values, cycle times, lab names) — use [NEEDS INPUT: …] for genuinely-missing specifics. Do not reference IMDRF / SaMD framing or Q1×Q2 significance×situation — this is a hardware section.",
  ];
  return sections.join("\n");
}

async function fetchNarrative(args: {
  sources: SourceData;
  drugEluting: boolean;
  bioresorbable: boolean;
  assumed: boolean;
  opts: SectionOpts;
}): Promise<
  | { narrative: Narrative; cost: number; usage: SectionOutput["meta"]["usage"] }
  | { error: string; cost: number; usage: SectionOutput["meta"]["usage"] }
> {
  try {
    const userMessage = buildNarrativeUserMessage({
      sources: args.sources,
      drugEluting: args.drugEluting,
      bioresorbable: args.bioresorbable,
      assumed: args.assumed,
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
    console.error(`[§14] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    args.opts.log?.(`  [§14] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    return { error: msg, cost: 0, usage: null };
  }
}

// ────────────────────────────────────────────────────────────────────
// Content assembly
// ────────────────────────────────────────────────────────────────────

function assembleContent(args: {
  assumed: boolean;
  drugEluting: boolean;
  bioresorbable: boolean;
  narrative: Narrative | null;
}): string {
  const lines: string[] = [];

  // 1. Header + assumed-yes notice
  if (args.assumed) {
    lines.push(
      "_**[ASSUMED YES — confirm in editor]** The synthesizer had no explicit signal that this device is sterile; it defaulted to sterile=yes under the blast-radius safeguard. Before doing any of the validation work below, confirm sterility applies. If your device is non-sterile, remove this section in the editor._"
    );
    lines.push("");
  }

  // 2. Opening framing (LLM narrative or fallback)
  lines.push("## Why §14 applies + the method-selection problem");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.opening_framing));
  } else {
    lines.push(
      softenCertainty(
        "DMF §8.14 sterilization validation applies because your device is sterile (per the synthesizer's inference marker). CDSCO recognises four sterilization methods, each tied to a different ISO standard. Your founder selects the applicable method in the editor; the other three method blocks should be removed before submission. NABL-accredited validation reports are expected for the chosen method. [NEEDS INPUT: device-specific framing paragraph — narrative LLM call did not complete this run]"
      )
    );
  }
  lines.push("");

  // 3. Summary table of all four methods
  lines.push("## Method matrix");
  lines.push("");
  lines.push(renderMethodSummaryTable());
  lines.push("");

  // 4. Method-selection guidance for this device's specific profile
  if (args.drugEluting || args.bioresorbable) {
    lines.push("## Method-selection guidance for this device");
    lines.push("");
    if (args.narrative?.method_selection_guidance) {
      lines.push(softenCertainty(args.narrative.method_selection_guidance));
    } else {
      const fallbackParts: string[] = [];
      for (const c of METHOD_SELECTION_CONSTRAINTS) {
        if (c.trigger === "drug_eluting" && args.drugEluting) {
          fallbackParts.push(c.guidance);
        }
        if (c.trigger === "bioresorbable" && args.bioresorbable) {
          fallbackParts.push(c.guidance);
        }
      }
      lines.push(softenCertainty(fallbackParts.join("\n\n")));
    }
    lines.push("");
  }

  // 5. Per-method blocks — all four, founder picks one
  lines.push("## Method blocks (founder picks one in the editor)");
  lines.push("");
  for (const k of ["eto", "radiation", "steam", "aseptic"] as const) {
    lines.push(renderMethodBlock(k, STERILIZATION_METHODS[k]));
    lines.push("");
  }

  // 6. Cross-cutting concerns
  lines.push("## Cross-cutting concerns — apply regardless of method");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.cross_cutting_summary));
    lines.push("");
  }
  for (const c of CROSS_CUTTING_CONCERNS) {
    lines.push(`- ${c}`);
  }
  lines.push("");

  // 7. Sequencing notes
  lines.push("## Sequencing with adjacent sections");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.sequencing_note));
  } else {
    lines.push(
      softenCertainty(
        "§14 sterilization validation precedes final §13 ISO 10993-17 / -18 leachables runs — sterilization can alter the leachables profile; pre-sterilization leachables data requires a bridging justification. The sterile-barrier shelf-life claim ties to §15 Stability Data. Per-batch sterility-validation records land in §16 Batch Release. Sterilization-failure modes feed §10 Risk Management hazard register."
      )
    );
  }
  lines.push("");

  // 8. Cross-references
  lines.push("## Cross-references");
  lines.push("");
  lines.push("- §13 Biocompatibility — leachables profile changes with sterilization method");
  lines.push("- §15 Stability Data — sterile-barrier shelf-life claim");
  lines.push("- §16 Batch Release — per-batch sterility-validation record");
  lines.push("- §10 Risk Management — sterilization-failure modes feed hazard register");
  lines.push("- §8 Design & Manufacturing — material selection drives method compatibility");

  return lines.join("\n").trimEnd();
}

// ────────────────────────────────────────────────────────────────────
// SectionGenerator entry
// ────────────────────────────────────────────────────────────────────

export const generateSection14: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
): Promise<SectionOutput> => {
  const startedAt = new Date().toISOString();

  // Section-gating predicate gates on the `sterile` marker. The
  // calibrated trigger sets `assumed_yes_framing` on opts when status
  // was "assumed" (no synthesizer signal) — we surface that to the
  // founder at the top of the section.
  const assumed = opts.assumed_yes_framing === true;
  const drugEluting = drugElutingTriggered(sources);
  const bioresorbable = bioresorbableTriggered(sources);

  // 1. Sonnet narrative call.
  const narrativeResult = await fetchNarrative({
    sources,
    drugEluting,
    bioresorbable,
    assumed,
    opts,
  });
  const narrative =
    "narrative" in narrativeResult ? narrativeResult.narrative : null;
  const llmError =
    "error" in narrativeResult ? narrativeResult.error : null;
  const cost = narrativeResult.cost;
  const usage = narrativeResult.usage;

  // 2. Assemble final content (deterministic skeleton wraps narrative).
  const content = assembleContent({
    assumed,
    drugEluting,
    bioresorbable,
    narrative,
  });

  const citations: SectionOutput["citations"] = [
    {
      citation_id: "[1]",
      source_doc: "ISO 11135:2014",
      quote: "Sterilization of health-care products — Ethylene oxide.",
      exact_reference: "ISO 11135:2014",
    },
    {
      citation_id: "[2]",
      source_doc: "ISO 11137-1/-2/-3",
      quote: "Sterilization of health-care products — Radiation.",
      exact_reference: "ISO 11137 series",
    },
    {
      citation_id: "[3]",
      source_doc: "ISO 17665:2024",
      quote: "Sterilization of health-care products — Moist heat.",
      exact_reference: "ISO 17665:2024 (rev. of 17665-1:2006)",
    },
    {
      citation_id: "[4]",
      source_doc: "ISO 13408 series",
      quote: "Aseptic processing of health-care products.",
      exact_reference: "ISO 13408-1:2008 + part series",
    },
    {
      citation_id: "[5]",
      source_doc: "MDR-2017 Fourth Schedule Appendix II",
      quote: "Sterilization validation data.",
      exact_reference: "DMF §8.14",
    },
    {
      citation_id: "[6]",
      source_doc: "ISO 10993-7:2008",
      quote: "Ethylene oxide sterilization residuals — limits for EtO + ECH.",
      exact_reference: "ISO 10993-7:2008",
    },
    {
      citation_id: "[7]",
      source_doc: "ISO 11607-1:2019 / -2:2019",
      quote: "Sterile barrier system for terminally-sterilized devices.",
      exact_reference: "ISO 11607-1/-2:2019",
    },
  ];

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
        "readiness_card.inference_markers.sterile",
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
