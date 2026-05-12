#!/usr/bin/env tsx
/**
 * Story 3.1 — migration 016 validator.
 *
 * Run AFTER applying supabase/migration-016-tier-choice.sql.
 * Run: npx tsx --env-file=.env.local scripts/validate-migration-016.ts
 *
 * Checks:
 *   1. tier_choice column is selectable
 *   2. existing rows backfilled to 'draft_pack'
 *   3. CHECK constraint rejects 'bogus' tier values (23514)
 *   4. valid values 'draft_pack' / 'draft_editor' are accepted
 *
 * Test rows are cleaned up.
 */
import { getServiceClient } from "../lib/supabase";

type Check = { name: string; pass: boolean; detail?: string };
const supabase = getServiceClient();

async function pickAssessmentId(): Promise<string | null> {
  const { data } = await supabase
    .from("assessments")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function check1_columnExists(): Promise<Check> {
  const { error } = await supabase
    .from("tier2_orders")
    .select("id, tier_choice")
    .limit(0);
  return error
    ? { name: "tier2_orders.tier_choice exists", pass: false, detail: error.message }
    : { name: "tier2_orders.tier_choice exists", pass: true };
}

async function check2_backfilled(): Promise<Check> {
  const { count: total } = await supabase
    .from("tier2_orders")
    .select("*", { count: "exact", head: true });
  const { count: nullCount } = await supabase
    .from("tier2_orders")
    .select("*", { count: "exact", head: true })
    .is("tier_choice", null);
  if (total === 0) {
    return {
      name: "tier_choice backfilled (skipped — table empty)",
      pass: true,
    };
  }
  return {
    name: `tier_choice backfilled (${total} rows, ${nullCount} nulls)`,
    pass: (nullCount ?? 0) === 0,
    detail:
      (nullCount ?? 0) > 0
        ? `${nullCount} rows still have null tier_choice`
        : undefined,
  };
}

async function check3_rejectBogus(assessmentId: string): Promise<Check> {
  const { error } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: assessmentId,
      status: "created",
      amount_inr: 1,
      tier_choice: "bogus",
    })
    .select("id")
    .single();
  if (!error) {
    return {
      name: "CHECK constraint rejects bogus tier_choice",
      pass: false,
      detail: "insert with tier_choice='bogus' was accepted",
    };
  }
  const code = (error as { code?: string }).code;
  return code === "23514"
    ? { name: "CHECK rejects bogus tier_choice", pass: true }
    : {
        name: "CHECK rejects bogus tier_choice (wrong code)",
        pass: false,
        detail: `${code}: ${error.message}`,
      };
}

async function check4_acceptValid(
  assessmentId: string,
  tier: "draft_pack" | "draft_editor"
): Promise<Check> {
  const { data, error } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: assessmentId,
      status: "created",
      amount_inr: tier === "draft_editor" ? 2499 : 499,
      tier_choice: tier,
    })
    .select("id")
    .single();
  if (error || !data) {
    return {
      name: `accepts tier_choice='${tier}'`,
      pass: false,
      detail: error?.message,
    };
  }
  await supabase.from("tier2_orders").delete().eq("id", data.id);
  return { name: `accepts tier_choice='${tier}'`, pass: true };
}

async function main() {
  console.log("\nSprint 3 Story 3.1 — migration 016 validator\n");

  const assessmentId = await pickAssessmentId();
  if (!assessmentId) {
    console.log("  ⚠ no assessments to test FK-dependent checks");
    process.exit(1);
  }
  console.log(`  using assessment_id = ${assessmentId}\n`);

  const checks: Check[] = [];
  checks.push(await check1_columnExists());
  checks.push(await check2_backfilled());
  checks.push(await check3_rejectBogus(assessmentId));
  checks.push(await check4_acceptValid(assessmentId, "draft_pack"));
  checks.push(await check4_acceptValid(assessmentId, "draft_editor"));

  for (const c of checks) {
    const mark = c.pass ? "✓" : "✗";
    console.log(`  ${mark} ${c.name}`);
    if (!c.pass && c.detail) console.log(`      ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed.`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
