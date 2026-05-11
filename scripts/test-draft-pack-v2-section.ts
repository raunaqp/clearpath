#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 4b — Section 4 checkpoint test.
 *
 * Runs Section 4 (Classification & Grouping) as a dry-run against a
 * named assessment. No DB writes, no cost tracking. Prints the
 * markdown body, citations, and cost figure for founder review.
 *
 * Run: npx tsx --env-file=.env.local scripts/test-draft-pack-v2-section.ts [assessment_id]
 *      (defaults to CardioRhythm test assessment 39c844a1-...)
 */
import { loadSourceData } from "../lib/engine/draft-pack-v2/persist";
import { generateSection04 } from "../lib/engine/draft-pack-v2/section-04-classification";

const DEFAULT_ID = "39c844a1-9091-45d0-af5f-c17c431fc734";

async function main() {
  const id = process.argv[2] ?? DEFAULT_ID;
  console.log(`\n=== Phase 4b Section 4 dry-run: ${id} ===\n`);

  let sources;
  try {
    sources = await loadSourceData(id);
  } catch (err) {
    console.error("loadSourceData failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log(`Loaded sources:`);
  console.log(`  intake.one_liner: ${sources.intake.one_liner.slice(0, 100)}...`);
  console.log(
    `  readiness_card.classification: ${sources.readiness_card.classification.cdsco_class} / ${sources.readiness_card.classification.class_qualifier ?? "—"} / ai_ml=${sources.readiness_card.classification.ai_ml_flag}`
  );
  console.log(
    `  wizard.q1: ${sources.wizard_answers.q1}, q2: ${sources.wizard_answers.q2}, b3_no_predicate: ${sources.wizard_answers.b3_no_predicate}`
  );
  console.log(`  ai_extracted: ${sources.ai_extracted ? "complete" : "(null)"}`);
  console.log("");

  const startedAt = Date.now();
  const section = await generateSection04(sources, {
    dry_run: true,
    log: (msg) => console.log(msg),
  });
  const durationMs = Date.now() - startedAt;

  console.log("\n=== Section 4 output ===");
  console.log(`section_key:        ${section.section_key}`);
  console.log(`section_number:     ${section.section_number}`);
  console.log(`title:              ${section.title}`);
  console.log(`completion_status:  ${section.completion_status}`);
  console.log(`word_count:         ${section.word_count}`);
  console.log(`citations:          ${section.citations.length}`);
  console.log(`model:              ${section.meta.model}`);
  console.log(`llm_cost_usd:       $${(section.meta.llm_cost_usd ?? 0).toFixed(4)}`);
  console.log(`duration_ms:        ${durationMs}`);
  if (section.meta.usage) {
    console.log(
      `usage:              ${section.meta.usage.input_tokens}in / ${section.meta.usage.output_tokens}out / cache_read=${section.meta.usage.cache_read} cache_write=${section.meta.usage.cache_write}`
    );
  }
  if (section.meta.error_message) {
    console.log(`ERROR:              ${section.meta.error_message}`);
  }

  console.log("\n=== Markdown body ===\n");
  console.log(section.content);

  console.log("\n=== Citations ===\n");
  for (const c of section.citations) {
    console.log(`${c.citation_id} ${c.source_doc}`);
    console.log(`   ref: ${c.exact_reference}`);
    console.log(`   quote: ${c.quote.slice(0, 120)}${c.quote.length > 120 ? "..." : ""}`);
  }
}

main().catch((err) => {
  console.error("\ncrashed:", err);
  process.exit(1);
});
