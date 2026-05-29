/**
 * Draft Pack v2 orchestrator.
 *
 * Runs the 12 section generators in matrix-specified order:
 *   §4 anchor → {§2, §3, §5, §6, §7} parallel → {§8, §9} parallel →
 *   §10 → §11 → §12 → §1 consolidator.
 *
 * Failure isolation: a section that throws OR returns failed status
 * does not stop the pack — orchestrator collects the failure and
 * continues. Section 1 still runs and synthesises whatever sections
 * succeeded.
 */

import { loadSourceData, persistSection } from "./persist";
import type {
  RunV2Input,
  RunV2Result,
  SectionGenerator,
  SectionKey,
  SectionOpts,
  SectionOutput,
  SourceData,
} from "./types";
import { hardwarePackSectionPlan } from "./section-gating";

import { generateSection01 } from "./section-01-executive-summary";
import { generateSection02 } from "./section-02-device-description";
import { generateSection03 } from "./section-03-intended-use";
import { generateSection04 } from "./section-04-classification";
import { generateSection05 } from "./section-05-product-specification";
import { generateSection06 } from "./section-06-predicate-comparison";
import { generateSection07 } from "./section-07-labelling";
import { generateSection08 } from "./section-08-design-manufacturing";
import { generateSection09 } from "./section-09-essential-principles";
import { generateSection10 } from "./section-10-risk-management";
import { generateSection11 } from "./section-11-verification-validation";
import { generateSection12 } from "./section-12-clinical-pms";
import { generateSection15 } from "./section-15-stability-data";
import { generateSection16 } from "./section-16-batch-release";
import { generateSection17 } from "./section-17-pmf-attestation";
import { generateSection18 } from "./section-18-qms-attestation";

const COST_GUARD_USD = 1.5;

/** Section-key → generator dispatch table for the hardware pack.
 *
 *  §1–§12 reuse the SaMD generators directly; the per-section hardware
 *  overlays live inside each generator's prompt (dispatched on
 *  wizard_answers.persona). Day-4 wires §4 overlay only (Stream C);
 *  Day-5 morning adds overlays for §6, §8, §11, §12.
 *
 *  §15–§18 are new generators (Stream B) and registered here as they
 *  land. §13, §14, §19 will land Day-5 morning — for Day-4 those keys
 *  intentionally don't appear in this map, and the dispatcher falls
 *  back to `stubSection()` so the orchestrator can still emit a row in
 *  the right slot. */
const HARDWARE_GENERATORS: Partial<Record<SectionKey, SectionGenerator>> = {
  // §1 is NOT in this map — it's the Opus consolidator that needs the
  // already-generated section list, handled inline at end of
  // runHardwarePack() the same way the SaMD path does it.
  "02_device_description": generateSection02,
  "03_intended_use": generateSection03,
  "04_classification_grouping": generateSection04,
  "05_product_specification": generateSection05,
  "06_predicate_comparison": generateSection06,
  "07_labelling": generateSection07,
  "08_design_manufacturing": generateSection08,
  "09_essential_principles": generateSection09,
  "10_risk_management": generateSection10,
  "11_verification_validation": generateSection11,
  "12_clinical_evidence_pms": generateSection12,
  // Stream B — Day 4 (deterministic templates + attestation checklists)
  "15_stability_data": generateSection15,
  "16_batch_release": generateSection16,
  "17_pmf_attestation": generateSection17,
  "18_qms_attestation": generateSection18,
  // §13, §14, §19 land Day-5 morning. Until then the dispatcher falls
  // back to stubSection() which emits a clearly-marked "pending" row
  // in the correct slot.
};

/** Day-4 placeholder for a section whose real generator lands Day-5.
 *  Emits a clearly-marked "pending" SectionOutput so the row exists in
 *  draft_pack_sections (in live runs) and the smoke test can assert
 *  presence. Content is explicit about its non-finality so it can't
 *  leak into a regulator-facing deliverable. */
function stubSection(key: SectionKey, dryRun: boolean): SectionOutput {
  const sectionNumber = parseInt(key.slice(0, 2), 10);
  const titleMap: Partial<Record<SectionKey, string>> = {
    "13_biocompatibility": "Biocompatibility (ISO 10993)",
    "14_sterilization_validation": "Sterilization Validation",
    "19_conditional_nocs": "Conditional NOCs & Adjacent Permissions",
  };
  return {
    section_key: key,
    section_number: sectionNumber,
    title: titleMap[key] ?? key,
    content: `_[Generator pending — Day-5 morning. This section was gated into the pack by the section-gating predicate and will receive real content tomorrow.]_`,
    citations: [],
    completion_status: "pending",
    word_count: 0,
    meta: {
      generation_strategy: "deterministic",
      source_fields: [],
      model: null,
      llm_cost_usd: null,
      generated_at: new Date().toISOString(),
      dry_run: dryRun,
      error_message: null,
      usage: null,
    },
  };
}

async function runOne(
  gen: SectionGenerator,
  label: string,
  sources: Parameters<SectionGenerator>[0],
  opts: SectionOpts
): Promise<SectionOutput> {
  try {
    return await gen(sources, opts);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    opts.log?.(`  [${label}] threw — wrapping as failed: ${msg}`);
    // Generators are expected to wrap their own errors; this is a
    // belt-and-suspenders fallback.
    return {
      section_key: "04_classification_grouping", // placeholder — overridden in normal flow
      section_number: 0,
      title: label,
      content: `[${label} threw: ${msg}]`,
      citations: [],
      completion_status: "failed",
      word_count: 0,
      meta: {
        generation_strategy: "llm_synthesized",
        source_fields: [],
        model: null,
        llm_cost_usd: null,
        generated_at: new Date().toISOString(),
        dry_run: opts.dry_run,
        error_message: msg,
        usage: null,
      },
    };
  }
}

/** Hardware-pack orchestration. Same failure-isolation discipline as the
 *  SaMD path — a section that throws or fails doesn't stop the pack;
 *  §1 still consolidates whatever succeeded.
 *
 *  Two things this function owns that the SaMD path doesn't:
 *   1. Per-section gating via `shouldIncludeSection()`. Gated-out
 *      sections are silently skipped (no row, no LLM cost).
 *   2. Threading the gating `assumed` flag through to each generator
 *      via `SectionOpts.assumed_yes_framing`, so the generator can
 *      prefix content with [ASSUMED YES — confirm in editor].
 *
 *  Sections without a registered generator (Day-4: §13, §14, §19) get
 *  a `stubSection()` placeholder so the row appears in the correct
 *  slot. Day-5 morning swaps stubs for real generators by adding
 *  entries to `HARDWARE_GENERATORS`. */
/** Exported for the smoke harness in `scripts/smoke-hardware-pack.ts`
 *  — bypasses `loadSourceData` so smoke can run from a JSON fixture
 *  without Supabase. Production paths go through `runDraftPackV2`. */
export async function runHardwarePack(
  sources: SourceData,
  baseOpts: SectionOpts,
  log: (msg: string) => void,
  dryRun: boolean
): Promise<SectionOutput[]> {
  const plan = hardwarePackSectionPlan(sources);
  const decisionByKey = new Map(plan.map((p) => [p.key, p.decision]));

  // Log the gating decisions up-front so log readers can see why a
  // given section did or didn't run, without grepping through interleaved
  // generator output.
  log(`  Hardware-pack gating plan:`);
  for (const p of plan) {
    const mark = p.decision.included
      ? p.decision.assumed
        ? "  +"
        : "  ✓"
      : "  −";
    log(`${mark} ${p.key} — ${p.decision.reason}`);
  }

  const completed: SectionOutput[] = [];

  // Dispatch one section: applies gating, calls generator (or stub),
  // pushes onto `completed`, persists if live.
  const persistOne = async (
    key: SectionKey,
    label: string
  ): Promise<void> => {
    const decision = decisionByKey.get(key);
    if (!decision) {
      log(`  [${label}] no gating plan — skipping`);
      return;
    }
    if (!decision.included) {
      log(`  [${label}] gated out — ${decision.reason}`);
      return;
    }
    const sectionOpts: SectionOpts = {
      ...baseOpts,
      assumed_yes_framing: decision.assumed,
    };
    const gen = HARDWARE_GENERATORS[key];
    let s: SectionOutput;
    if (gen) {
      s = await runOne(gen, label, sources, sectionOpts);
    } else {
      log(`  [${label}] stub (generator lands Day-5)`);
      s = stubSection(key, dryRun);
    }
    completed.push(s);
    if (!dryRun && sources.order_id) {
      await persistSection(sources.order_id, s, false, log);
    }
  };

  // §4 anchor — runs first, hardware overlay derives class deterministically
  log(`[1/7] Anchor — §4 Classification & Pathway`);
  await persistOne("04_classification_grouping", "§4");

  // Parallel group 1: §2, §3, §5, §6, §7
  log(`[2/7] Parallel — §2, §3, §5, §6, §7`);
  await Promise.all([
    persistOne("02_device_description", "§2"),
    persistOne("03_intended_use", "§3"),
    persistOne("05_product_specification", "§5"),
    persistOne("06_predicate_comparison", "§6"),
    persistOne("07_labelling", "§7"),
  ]);

  // Parallel group 2: §8, §9
  log(`[3/7] Parallel — §8, §9`);
  await Promise.all([
    persistOne("08_design_manufacturing", "§8"),
    persistOne("09_essential_principles", "§9"),
  ]);

  // Sequential §10 → §11 → §12
  log(`[4/7] Sequential — §10, §11, §12`);
  for (const [key, label] of [
    ["10_risk_management", "§10"],
    ["11_verification_validation", "§11"],
    ["12_clinical_evidence_pms", "§12"],
  ] as const) {
    await persistOne(key, label);
  }

  // Parallel new hardware sections: §13, §14 (Day-5 stubs)
  log(`[5/7] Parallel — §13 Biocomp, §14 Sterilization`);
  await Promise.all([
    persistOne("13_biocompatibility", "§13"),
    persistOne("14_sterilization_validation", "§14"),
  ]);

  // Parallel templates: §15, §16
  log(`[5/7] Parallel — §15 Stability, §16 Batch Release`);
  await Promise.all([
    persistOne("15_stability_data", "§15"),
    persistOne("16_batch_release", "§16"),
  ]);

  // Parallel attestations: §17, §18
  log(`[6/7] Parallel — §17 PMF, §18 QMS`);
  await Promise.all([
    persistOne("17_pmf_attestation", "§17"),
    persistOne("18_qms_attestation", "§18"),
  ]);

  // §19 NOCs (Day-5 stub)
  log(`        §19 Conditional NOCs`);
  await persistOne("19_conditional_nocs", "§19");

  // §1 Opus consolidator — sees all completed sections. Inline because
  // its 3-arg signature doesn't fit SectionGenerator.
  //
  // Skipped in dry-run mode: §1 costs ~$0.12 (Opus) and is purely a
  // summarisation of the prior sections. For smoke tests with stub
  // §13/§14/§19 content there's nothing meaningful to summarise.
  // Production paths (dry_run=false) always run §1.
  log(`[7/7] Consolidator — §1 Executive Summary${dryRun ? " (skipped in dry-run)" : ""}`);
  const s1Decision = decisionByKey.get("01_executive_summary");
  if (s1Decision?.included && !dryRun) {
    const s1 = await (async () => {
      try {
        return await generateSection01(sources, baseOpts, completed);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  [§1] threw — wrapping as failed: ${msg}`);
        return {
          section_key: "01_executive_summary" as const,
          section_number: 1,
          title: "Executive Summary",
          content: `[§1 threw: ${msg}]`,
          citations: [],
          completion_status: "failed" as const,
          word_count: 0,
          meta: {
            generation_strategy: "llm_synthesized" as const,
            source_fields: [],
            model: null,
            llm_cost_usd: null,
            generated_at: new Date().toISOString(),
            dry_run: dryRun,
            error_message: msg,
            usage: null,
          },
        };
      }
    })();
    completed.push(s1);
    if (!dryRun && sources.order_id) {
      await persistSection(sources.order_id, s1, false, log);
    }
  }

  return completed;
}

export async function runDraftPackV2(input: RunV2Input): Promise<RunV2Result> {
  const startedAt = Date.now();
  const log = input.log ?? ((m: string) => console.log(m));
  const dryRun = !!input.dry_run;

  log(`▶ Draft Pack v2 generation for assessment ${input.assessment_id}${dryRun ? " (dryRun)" : ""}`);

  // 1. Load source data
  let sources;
  try {
    sources = await loadSourceData(input.assessment_id);
    log(`  loaded sources · order_id=${sources.order_id ?? "(none — dryRun-only)"}`);
  } catch (err) {
    return {
      ok: false,
      assessment_id: input.assessment_id,
      order_id: null,
      dry_run: dryRun,
      sections: [],
      totals: {
        cost_usd: 0,
        duration_ms: Date.now() - startedAt,
        sections_generated: 0,
        sections_failed: 0,
      },
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (!dryRun && !sources.order_id) {
    return {
      ok: false,
      assessment_id: input.assessment_id,
      order_id: null,
      dry_run: false,
      sections: [],
      totals: {
        cost_usd: 0,
        duration_ms: Date.now() - startedAt,
        sections_generated: 0,
        sections_failed: 0,
      },
      error:
        "Live mode requires an order_id but none found. Run with dry_run=true for smoke tests.",
    };
  }

  const opts: SectionOpts = { dry_run: dryRun, log };

  // 2. Persona dispatch — hardware persona uses runHardwarePack which
  //    applies per-section gating + threads the [ASSUMED] flag through
  //    to each generator. SaMD persona (and any unset persona, for
  //    backwards compatibility with pre-Phase-2a orders) falls through
  //    to the 12-section flow below.
  const persona = sources.wizard_answers.persona;
  if (persona === "manufacturer_hardware") {
    log(`  persona = manufacturer_hardware → hardware pack (19 sections w/ gating)`);
    const hardwareCompleted = await runHardwarePack(sources, opts, log, dryRun);
    const orderedHw = [...hardwareCompleted].sort(
      (a, b) => a.section_number - b.section_number
    );
    const costHw = orderedHw.reduce(
      (sum, s) => sum + (s.meta.llm_cost_usd ?? 0),
      0
    );
    const failedHw = orderedHw.filter((s) => s.completion_status === "failed").length;
    const generatedHw = orderedHw.length - failedHw;
    if (costHw > COST_GUARD_USD) {
      log(`⚠ COST GUARD: $${costHw.toFixed(4)} exceeded $${COST_GUARD_USD} for ${input.assessment_id}`);
    }
    log(
      `\n✓ Hardware Pack done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s — ${generatedHw}/${orderedHw.length} sections, $${costHw.toFixed(4)} total, ${failedHw} failed`
    );
    return {
      ok: true,
      assessment_id: input.assessment_id,
      order_id: sources.order_id,
      dry_run: dryRun,
      sections: orderedHw,
      totals: {
        cost_usd: costHw,
        duration_ms: Date.now() - startedAt,
        sections_generated: generatedHw,
        sections_failed: failedHw,
      },
      error: null,
    };
  }

  const completed: SectionOutput[] = [];

  // 2. §4 (anchor) — runs first; other sections cross-reference its outputs
  log(`[1/4] Anchor — Section 4 (Classification & Grouping)`);
  const s4 = await runOne(generateSection04, "§4", sources, opts);
  completed.push(s4);
  if (!dryRun && sources.order_id) await persistSection(sources.order_id, s4, false, log);

  // 3. Parallel group 1: §2, §3, §5, §6, §7
  log(`[2/4] Parallel group 1 — Sections 2, 3, 5, 6, 7`);
  const group1 = await Promise.all([
    runOne(generateSection02, "§2", sources, opts),
    runOne(generateSection03, "§3", sources, opts),
    runOne(generateSection05, "§5", sources, opts),
    runOne(generateSection06, "§6", sources, opts),
    runOne(generateSection07, "§7", sources, opts),
  ]);
  for (const s of group1) {
    completed.push(s);
    if (!dryRun && sources.order_id) await persistSection(sources.order_id, s, false, log);
  }

  // 4. Parallel group 2: §8, §9
  log(`[3/4] Parallel group 2 — Sections 8, 9`);
  const group2 = await Promise.all([
    runOne(generateSection08, "§8", sources, opts),
    runOne(generateSection09, "§9", sources, opts),
  ]);
  for (const s of group2) {
    completed.push(s);
    if (!dryRun && sources.order_id) await persistSection(sources.order_id, s, false, log);
  }

  // 5. Chain: §10 → §11 → §12 (sequential — each section can reference prior ones)
  log(`[4/4] Sequential chain — Sections 10, 11, 12, then Section 1 consolidator`);
  for (const [label, gen] of [
    ["§10", generateSection10],
    ["§11", generateSection11],
    ["§12", generateSection12],
  ] as const) {
    const s = await runOne(gen, label, sources, opts);
    completed.push(s);
    if (!dryRun && sources.order_id) await persistSection(sources.order_id, s, false, log);
  }

  // 6. Section 1 consolidator — Opus, sees all prior sections
  const s1 = await (async () => {
    try {
      return await generateSection01(sources, opts, completed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  [§1] threw — wrapping as failed: ${msg}`);
      return {
        section_key: "01_executive_summary" as const,
        section_number: 1,
        title: "Executive Summary",
        content: `[§1 threw: ${msg}]`,
        citations: [],
        completion_status: "failed" as const,
        word_count: 0,
        meta: {
          generation_strategy: "llm_synthesized" as const,
          source_fields: [],
          model: null,
          llm_cost_usd: null,
          generated_at: new Date().toISOString(),
          dry_run: dryRun,
          error_message: msg,
          usage: null,
        },
      };
    }
  })();
  completed.push(s1);
  if (!dryRun && sources.order_id) await persistSection(sources.order_id, s1, false, log);

  // 7. Sort by section_number for final output ordering (1-12)
  const ordered = [...completed].sort(
    (a, b) => a.section_number - b.section_number
  );

  // 8. Totals + cost guard
  const cost = ordered.reduce(
    (sum, s) => sum + (s.meta.llm_cost_usd ?? 0),
    0
  );
  const failed = ordered.filter((s) => s.completion_status === "failed").length;
  const generated = ordered.length - failed;

  if (cost > COST_GUARD_USD) {
    log(
      `⚠ COST GUARD: $${cost.toFixed(4)} exceeded $${COST_GUARD_USD} budget for assessment ${input.assessment_id}`
    );
  }

  log(
    `\n✓ Draft Pack v2 done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s — ${generated}/${ordered.length} sections, $${cost.toFixed(4)} total, ${failed} failed`
  );

  return {
    ok: true,
    assessment_id: input.assessment_id,
    order_id: sources.order_id,
    dry_run: dryRun,
    sections: ordered,
    totals: {
      cost_usd: cost,
      duration_ms: Date.now() - startedAt,
      sections_generated: generated,
      sections_failed: failed,
    },
    error: null,
  };
}
