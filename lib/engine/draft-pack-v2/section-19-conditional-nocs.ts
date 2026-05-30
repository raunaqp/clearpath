/**
 * Section 19 — Conditional NOCs & Adjacent Permissions.
 *
 * Maps to: Bible §4.B Block 5 (DAHD / BARC / PNDT / DCG(I) NOCs) +
 * Block 6 (inter-form dependencies). Gated at the section level on
 * "at least one NOC trigger fires" (`section-gating.ts`).
 *
 * Strategy: HYBRID — deterministic per-NOC blocks + 1 Sonnet narrative.
 *
 *   - **Deterministic** owns which NOC sub-blocks appear. §19 is a
 *     single section with conditional sub-blocks — only the NOCs whose
 *     trigger fires are emitted. Wrong-included NOC rows are clear
 *     noise to a regulator, not a safety win, so the standing blast-
 *     radius safeguard does NOT apply to §19; triggers gate strictly
 *     on marker values.
 *   - **Trigger functions are imported from section-gating.ts** —
 *     single source of truth shared with the section-level gating
 *     predicate.
 *   - **LLM (Sonnet, 1 call)** writes the device-specific narrative:
 *     opening framing (which NOCs apply for this device), per-NOC
 *     rationale paragraph (only for fired NOCs), and sequencing notes.
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
  drugContentNocTrigger,
  veterinaryNocTrigger,
  radiationNocTrigger,
  pndtNocTrigger,
} from "./section-gating";
import { NOC_BLOCKS, type NocKey, type NocBlock } from "./cdsco-conditional-nocs-matrix";

const SECTION_KEY = "19_conditional_nocs" as const;
const TITLE = "Conditional NOCs & Adjacent Permissions";
const MAX_TOKENS = 1500;

// ────────────────────────────────────────────────────────────────────
// Per-NOC block rendering — deterministic markdown
// ────────────────────────────────────────────────────────────────────

function renderNocBlock(key: NocKey, block: NocBlock): string {
  const lines: string[] = [];
  lines.push(`## ${block.display_name}`);
  lines.push("");
  lines.push(`**Authority:** ${block.authority}`);
  lines.push("");
  lines.push(`**Applicable rule:** ${block.applicable_rule}`);
  lines.push("");
  lines.push(`**Trigger basis:** ${block.trigger_description}`);
  lines.push("");

  lines.push("### Evidence package");
  for (const e of block.evidence_package) {
    lines.push(`- [ ] ${e}`);
  }
  lines.push("");

  lines.push("### Timeline placement");
  for (const t of block.timeline_placement) {
    lines.push(`- ${t}`);
  }
  lines.push("");

  lines.push("### Cross-references");
  for (const c of block.cross_refs) {
    lines.push(`- ${c}`);
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

// Per founder's Day-5 calibration: 2000-char cap is the ceiling for
// tier-matched complex generators (§13 / §14). §19's per-NOC narrative
// paragraphs are simpler — 1500 cap fits typical Sonnet output for
// 1-3 fired NOCs without inviting padding.
const NarrativeSchema = z.object({
  opening_framing: z.string().min(120).max(1500),
  dcg_i_rationale: z.string().min(80).max(1500).nullable(),
  dahd_rationale: z.string().min(80).max(1500).nullable(),
  barc_aerb_rationale: z.string().min(80).max(1500).nullable(),
  pndt_rationale: z.string().min(80).max(1500).nullable(),
  sequencing_note: z.string().min(80).max(1500),
});
type Narrative = z.infer<typeof NarrativeSchema>;

function buildNarrativeUserMessage(args: {
  sources: SourceData;
  firedTriggers: NocKey[];
}): string {
  const { sources, firedTriggers } = args;
  const card = sources.readiness_card;
  const productName = card.meta.product_name || card.meta.company_name;
  const wantDcg = firedTriggers.includes("dcg_i");
  const wantDahd = firedTriggers.includes("dahd");
  const wantBarc = firedTriggers.includes("barc_aerb");
  const wantPndt = firedTriggers.includes("pndt");

  const sections: string[] = [
    "Write the narrative wrapper for Section 19 (Conditional NOCs & Adjacent Permissions) of a CDSCO MD-7/MD-3 hardware Submission Pack.",
    "",
    "Opening framing: anchor in this device's facts. Identify which NOC sub-block(s) apply and frame them as overlays on the main manufacturing-licence path. Do NOT enumerate the evidence packages — those are in the structured blocks below. Do NOT add or remove NOC sub-blocks — the blocks below are deterministically selected by the trigger logic.",
    "",
    "## Applicant data",
    `Product: ${productName}`,
    `One-liner: ${sources.intake.one_liner}`,
    "",
    "## NOC triggers (deterministic — do not contradict)",
    `DCG(I) joint review fires: ${wantDcg}`,
    `DAHD NOC fires: ${wantDahd}`,
    `BARC + AERB fires: ${wantBarc}`,
    `PNDT fires: ${wantPndt}`,
    "",
    "## Output (STRICT JSON)",
    "Return ONLY this JSON object. For every rationale field where the corresponding trigger is FALSE, return null — do NOT fill it.",
    "```",
    "{",
    `  "opening_framing": "120-200 words. Which NOCs apply for this specific device and why. Frame as overlays on the main MD-3/MD-7 path. Reference §4 Pathway once.",`,
    wantDcg
      ? `  "dcg_i_rationale": "80-180 words. Why the DCG(I) joint review applies to THIS device — anchor in the drug component. Reference the §8.12 medicinal-substances cross-block and §13 ISO 10993-17 allowable-limits cross-reference. Combination-product framing.",`
      : `  "dcg_i_rationale": null,`,
    wantDahd
      ? `  "dahd_rationale": "80-180 words. Why the DAHD NOC applies — anchor in the veterinary scope (veterinary-only or dual-use). Reference §3 Intended Use + §7 Labelling cross-references.",`
      : `  "dahd_rationale": null,`,
    wantBarc
      ? `  "barc_aerb_rationale": "80-180 words. Why BARC NOC + AERB approval apply — anchor in the radiation source. Reference §10 Risk Management and the §4 Pathway timeline implication.",`
      : `  "barc_aerb_rationale": null,`,
    wantPndt
      ? `  "pndt_rationale": "80-180 words. Why PCPNDT Act compliance applies. Reference §3 Intended Use exclusion + §7 Labelling compliance statement.",`
      : `  "pndt_rationale": null,`,
    `  "sequencing_note": "80-180 words. Most NOC documents accompany the MD-3 / MD-7 submission rather than being separate pre-licence applications. DCG(I) review is parallel and typically gates grant; BARC NOC is pre-application; AERB is operational. Frame the practical sequencing for this device's specific fired NOCs."`,
    "}",
    "```",
    "",
    "Apply softening rules. Do not invent applicant facts — use [NEEDS INPUT: …] where genuinely missing. Do not reference IMDRF / SaMD framing — this is a hardware section.",
  ];
  return sections.join("\n");
}

async function fetchNarrative(args: {
  sources: SourceData;
  firedTriggers: NocKey[];
  opts: SectionOpts;
}): Promise<
  | { narrative: Narrative; cost: number; usage: SectionOutput["meta"]["usage"] }
  | { error: string; cost: number; usage: SectionOutput["meta"]["usage"] }
> {
  try {
    const userMessage = buildNarrativeUserMessage({
      sources: args.sources,
      firedTriggers: args.firedTriggers,
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
    console.error(`[§19] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    args.opts.log?.(`  [§19] narrative call failed — falling back to deterministic skeleton: ${msg}`);
    return { error: msg, cost: 0, usage: null };
  }
}

// ────────────────────────────────────────────────────────────────────
// Content assembly
// ────────────────────────────────────────────────────────────────────

function rationaleForNoc(
  key: NocKey,
  narrative: Narrative | null
): string | null {
  if (!narrative) return null;
  switch (key) {
    case "dcg_i":
      return narrative.dcg_i_rationale;
    case "dahd":
      return narrative.dahd_rationale;
    case "barc_aerb":
      return narrative.barc_aerb_rationale;
    case "pndt":
      return narrative.pndt_rationale;
  }
}

function assembleContent(args: {
  firedTriggers: NocKey[];
  narrative: Narrative | null;
}): string {
  const lines: string[] = [];

  // 1. Opening framing
  lines.push("## Which NOCs apply to this device");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.opening_framing));
  } else {
    const firedList = args.firedTriggers
      .map((k) => NOC_BLOCKS[k].display_name)
      .join(", ");
    lines.push(
      softenCertainty(
        `Based on the device profile, the following conditional NOCs apply: ${firedList || "(none — this section would not have been included if no trigger fired)"}. Each is an overlay on the main MD-3 / MD-7 manufacturing-licence path; the evidence packages and timing notes follow. [NEEDS INPUT: device-specific framing paragraph — narrative LLM call did not complete this run]`
      )
    );
  }
  lines.push("");

  // 2. Per-fired-NOC sub-blocks. Order is matrix order: DCG(I), DAHD,
  //    BARC/AERB, PNDT — keeps the rendered output stable across runs.
  for (const key of ["dcg_i", "dahd", "barc_aerb", "pndt"] as const) {
    if (!args.firedTriggers.includes(key)) continue;
    lines.push(renderNocBlock(key, NOC_BLOCKS[key]));
    lines.push("");
    const rationale = rationaleForNoc(key, args.narrative);
    if (rationale) {
      lines.push("### Device-specific rationale");
      lines.push("");
      lines.push(softenCertainty(rationale));
      lines.push("");
    }
  }

  // 3. Sequencing notes
  lines.push("## Sequencing notes");
  lines.push("");
  if (args.narrative) {
    lines.push(softenCertainty(args.narrative.sequencing_note));
  } else {
    lines.push(
      softenCertainty(
        "Most NOC documents accompany the MD-3 / MD-7 submission rather than being separate pre-licence applications. DCG(I) review runs in parallel with the main application; BARC NOC is filed before MD-3 / MD-7; AERB approval is operational and follows post-grant. Identify the applicable NOC blocks above, gather the evidence packages in parallel with QMS / DMF / PMF work, and file together with the manufacturing-licence application."
      )
    );
  }
  lines.push("");

  // 4. Cross-references aggregated from the fired blocks (no duplicate)
  const crossRefs = new Set<string>();
  for (const key of args.firedTriggers) {
    for (const c of NOC_BLOCKS[key].cross_refs) crossRefs.add(c);
  }
  lines.push("## Cross-references");
  lines.push("");
  for (const c of crossRefs) {
    lines.push(`- ${c}`);
  }
  lines.push("- §4 Pathway — main MD-3 / MD-7 manufacturing-licence path");

  return lines.join("\n").trimEnd();
}

// ────────────────────────────────────────────────────────────────────
// SectionGenerator entry
// ────────────────────────────────────────────────────────────────────

export const generateSection19: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
): Promise<SectionOutput> => {
  const startedAt = new Date().toISOString();

  // 1. Evaluate triggers using the same functions the gating predicate
  //    uses — single source of truth.
  const firedTriggers: NocKey[] = [];
  if (drugContentNocTrigger(sources)) firedTriggers.push("dcg_i");
  if (veterinaryNocTrigger(sources)) firedTriggers.push("dahd");
  if (radiationNocTrigger(sources)) firedTriggers.push("barc_aerb");
  if (pndtNocTrigger(sources)) firedTriggers.push("pndt");

  // 2. Defensive guard — section-gating already verified ≥1 trigger.
  //    If we somehow run with zero triggers, emit a pending marker
  //    rather than crash.
  if (firedTriggers.length === 0) {
    return {
      section_key: SECTION_KEY,
      section_number: sectionNumberFromKey(SECTION_KEY),
      title: TITLE,
      content:
        "_§19 not applicable: no NOC trigger fired for this device._",
      citations: [],
      completion_status: "pending",
      word_count: 0,
      meta: {
        generation_strategy: "deterministic",
        source_fields: [
          "readiness_card.inference_markers.drug_content",
          "readiness_card.inference_markers.veterinary_use",
          "readiness_card.inference_markers.ionising_radiation",
        ],
        model: null,
        llm_cost_usd: null,
        generated_at: startedAt,
        dry_run: opts.dry_run,
        error_message: null,
        usage: null,
      },
    };
  }

  // 3. Sonnet narrative call.
  const narrativeResult = await fetchNarrative({
    sources,
    firedTriggers,
    opts,
  });
  const narrative =
    "narrative" in narrativeResult ? narrativeResult.narrative : null;
  const llmError =
    "error" in narrativeResult ? narrativeResult.error : null;
  const cost = narrativeResult.cost;
  const usage = narrativeResult.usage;

  // 4. Assemble content.
  const content = assembleContent({
    firedTriggers,
    narrative,
  });

  // 5. Citations — only for fired NOCs.
  const citations: SectionOutput["citations"] = [];
  if (firedTriggers.includes("dcg_i")) {
    citations.push({
      citation_id: `[${citations.length + 1}]`,
      source_doc: "Drugs and Cosmetics Act 1940 §3(b)",
      quote:
        "Definition of 'drug' covering combination products under joint DCG(I) review.",
      exact_reference:
        "Drugs and Cosmetics Act §3(b); MD-7 checklist §11-12",
    });
  }
  if (firedTriggers.includes("dahd")) {
    citations.push({
      citation_id: `[${citations.length + 1}]`,
      source_doc: "Bible Addendum FAQ §1-2",
      quote: "Veterinary devices require DAHD NOC.",
      exact_reference: "Bible §4.B Block 5 (DAHD)",
    });
  }
  if (firedTriggers.includes("barc_aerb")) {
    citations.push({
      citation_id: `[${citations.length + 1}]`,
      source_doc: "Bible Addendum §7",
      quote:
        "Ionising-radiation devices require BARC NOC + AERB approval before patient use.",
      exact_reference: "Bible Addendum §7; IVD FAQ §53(c)",
    });
  }
  if (firedTriggers.includes("pndt")) {
    citations.push({
      citation_id: `[${citations.length + 1}]`,
      source_doc: "PCPNDT Act 1994 §3 + §4",
      quote:
        "Pre-Conception and Pre-Natal Diagnostic Techniques Act bans pre-natal sex determination.",
      exact_reference: "PCPNDT Act 1994",
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
        "readiness_card.inference_markers.drug_content",
        "readiness_card.inference_markers.veterinary_use",
        "readiness_card.inference_markers.ionising_radiation",
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
