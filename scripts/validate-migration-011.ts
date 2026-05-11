#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 4b — migration 011 validator.
 *
 * Run AFTER applying supabase/migration-011-draft-pack-v2-generator-metadata.sql
 * in the Supabase Dashboard SQL Editor.
 *
 * Run: npx tsx --env-file=.env.local scripts/validate-migration-011.ts
 *
 * Checks (behavioural, via service-role client):
 *   1. draft_pack_sections.meta column exists and is selectable
 *   2. completion_status check constraint accepts 'failed'
 *   3. completion_status check constraint rejects bogus values
 *
 * Note: checks 2 + 3 need an order_id to satisfy the FK. They auto-skip
 * if no tier2_orders row exists; check (1) proves the migration applied.
 */
import { getServiceClient } from "../lib/supabase";

type Check = { name: string; pass: boolean; detail?: string };

const supabase = getServiceClient();

async function metaColumnExists(): Promise<Check> {
  const { error } = await supabase
    .from("draft_pack_sections")
    .select("id, meta")
    .limit(0);
  return error
    ? {
        name: "draft_pack_sections.meta column exists",
        pass: false,
        detail: error.message,
      }
    : { name: "draft_pack_sections.meta column exists", pass: true };
}

async function failedStatusAccepted(): Promise<Check> {
  const { data: orderRow } = await supabase
    .from("tier2_orders")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!orderRow) {
    return {
      name: "completion_status accepts 'failed' (skipped — no orders to test against)",
      pass: true,
    };
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("draft_pack_sections")
    .insert({
      order_id: orderRow.id,
      section_key: `_validator_failed_${Date.now()}`,
      title: "_validator",
      completion_status: "failed",
      meta: { _validator: true, error_message: "synthetic test" },
    })
    .select("id")
    .single();

  if (insertErr) {
    return {
      name: "completion_status accepts 'failed'",
      pass: false,
      detail: insertErr.message,
    };
  }

  if (inserted?.id) {
    await supabase
      .from("draft_pack_sections")
      .delete()
      .eq("id", inserted.id);
  }
  return { name: "completion_status accepts 'failed'", pass: true };
}

async function bogusStatusRejected(): Promise<Check> {
  const { data: orderRow } = await supabase
    .from("tier2_orders")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!orderRow) {
    return {
      name: "completion_status rejects bogus values (skipped — no orders)",
      pass: true,
    };
  }

  const { error } = await supabase
    .from("draft_pack_sections")
    .insert({
      order_id: orderRow.id,
      section_key: `_validator_bogus_${Date.now()}`,
      title: "_validator",
      completion_status: "bogus_value_must_fail",
    })
    .select("id")
    .single();

  if (!error) {
    return {
      name: "completion_status rejects bogus values",
      pass: false,
      detail:
        "insert with bogus completion_status was accepted (check constraint missing)",
    };
  }
  const code = (error as { code?: string }).code;
  if (code === "23514") {
    return { name: "completion_status rejects bogus values", pass: true };
  }
  return {
    name: "completion_status rejects bogus values",
    pass: false,
    detail: `unexpected error code ${code}: ${error.message}`,
  };
}

async function main() {
  const checks: Check[] = [];
  checks.push(await metaColumnExists());
  if (checks[0].pass) {
    checks.push(await failedStatusAccepted());
    checks.push(await bogusStatusRejected());
  }

  console.log("\nStory 2.5 Phase 4b — migration 011 validator\n");
  for (const c of checks) {
    const mark = c.pass ? "✓" : "✗";
    console.log(`  ${mark} ${c.name}`);
    if (!c.pass && c.detail) console.log(`      ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed.`);

  console.log(`
--- RLS verification (paste into Supabase Dashboard → SQL Editor) ---
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p
        where p.schemaname = 'public' and p.tablename = c.relname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'draft_pack_sections';

-- Expected: rls_enabled = true, policy_count = 0 (unchanged — meta
-- column inherits the table policy; constraint change has no RLS impact).
`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
