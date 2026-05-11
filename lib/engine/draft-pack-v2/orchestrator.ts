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
  SectionOpts,
  SectionOutput,
} from "./types";

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

const COST_GUARD_USD = 1.5;

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
