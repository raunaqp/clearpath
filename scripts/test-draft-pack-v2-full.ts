#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 4b/4c — full Draft Pack v2 dry-run + validation.
 *
 * Run: npx tsx --env-file=.env.local scripts/test-draft-pack-v2-full.ts [assessment_id]
 *      (defaults to CardioRhythm 39c844a1-...)
 *
 * Output: orchestrator log + per-section summary + validation report.
 * Sample full markdown for each section is written to
 *   /tmp/draft-pack-v2-<short-id>.md
 * so the founder can read the whole pack in one place.
 */
import { writeFileSync } from "node:fs";
import { runDraftPackV2 } from "../lib/engine/draft-pack-v2/orchestrator";
import { loadSourceData } from "../lib/engine/draft-pack-v2/persist";
import { validateDraftPackV2 } from "../lib/engine/draft-pack-v2-validator";

const DEFAULT_ID = "39c844a1-9091-45d0-af5f-c17c431fc734";

async function main() {
  const id = process.argv[2] ?? DEFAULT_ID;
  console.log(`\n=== Draft Pack v2 full dry-run: ${id} ===\n`);

  const result = await runDraftPackV2({
    assessment_id: id,
    dry_run: true,
    log: (m) => console.log(m),
  });

  if (!result.ok) {
    console.error(`\nORCHESTRATOR FAILED: ${result.error}`);
    process.exit(1);
  }

  // Per-section summary
  console.log("\n=== Per-section summary ===");
  console.log("  # | key                          | status   | words | cost   | model");
  for (const s of result.sections) {
    console.log(
      `  ${String(s.section_number).padStart(2)} | ${s.section_key.padEnd(28)} | ${s.completion_status.padEnd(8)} | ${String(s.word_count).padStart(5)} | $${(s.meta.llm_cost_usd ?? 0).toFixed(4)} | ${s.meta.model ?? "—"}`
    );
  }

  // Totals
  console.log("\n=== Totals ===");
  console.log(`  cost:                $${result.totals.cost_usd.toFixed(4)}`);
  console.log(`  duration:            ${(result.totals.duration_ms / 1000).toFixed(1)}s`);
  console.log(`  sections generated:  ${result.totals.sections_generated}/12`);
  console.log(`  sections failed:     ${result.totals.sections_failed}`);

  // Run validator
  const sources = await loadSourceData(id);
  const report = validateDraftPackV2(result.sections, sources);
  console.log("\n=== Validation report ===");
  console.log(`  total_word_count: ${report.total_word_count}`);
  console.log(`  total_tbd_count:  ${report.total_tbd_count}`);
  console.log(`  critical:         ${report.critical_failures.length}`);
  console.log(`  warnings:         ${report.warnings.length}`);
  console.log(`  gaps (info):      ${report.gaps.length}`);

  if (report.critical_failures.length > 0) {
    console.log("\n--- Critical failures ---");
    for (const f of report.critical_failures) {
      console.log(`  [${f.invariant}] ${f.section_keys.join(",")} — ${f.message}`);
    }
  }
  if (report.warnings.length > 0) {
    console.log("\n--- Warnings ---");
    for (const f of report.warnings) {
      console.log(`  [${f.invariant}] ${f.section_keys.join(",")} — ${f.message}`);
    }
  }
  if (report.gaps.length > 0) {
    console.log("\n--- Gaps (info) ---");
    for (const f of report.gaps) {
      console.log(`  [${f.invariant}] ${f.section_keys.join(",")} — ${f.message}`);
    }
  }

  // Write full markdown to /tmp for easy reading
  const md: string[] = [];
  md.push(`# Draft Pack v2 — ${id}`);
  md.push(``);
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(`Total cost: $${result.totals.cost_usd.toFixed(4)}`);
  md.push(`Sections: ${result.totals.sections_generated}/12 generated`);
  md.push("");
  md.push("---");
  md.push("");
  for (const s of result.sections) {
    md.push(`# Section ${s.section_number} — ${s.title}`);
    md.push("");
    md.push(`_Status:_ ${s.completion_status} · _Words:_ ${s.word_count} · _Cost:_ $${(s.meta.llm_cost_usd ?? 0).toFixed(4)} · _Model:_ ${s.meta.model ?? "—"}`);
    md.push("");
    md.push(s.content);
    if (s.citations.length > 0) {
      md.push("");
      md.push("**Citations:**");
      for (const c of s.citations) {
        md.push(`- ${c.citation_id} ${c.source_doc} — _${c.exact_reference}_`);
      }
    }
    md.push("");
    md.push("---");
    md.push("");
  }
  const outPath = `/tmp/draft-pack-v2-${id.slice(0, 8)}.md`;
  writeFileSync(outPath, md.join("\n"));
  console.log(`\nFull pack written to: ${outPath}`);
}

main().catch((err) => {
  console.error("\ncrashed:", err);
  process.exit(1);
});
