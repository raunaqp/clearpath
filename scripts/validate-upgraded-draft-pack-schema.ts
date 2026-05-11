#!/usr/bin/env tsx
/**
 * Story 2.3 schema validator.
 *
 * Run AFTER applying supabase/migration-009-upgraded-draft-pack-schema.sql
 * in the Supabase Dashboard SQL Editor.
 *
 * Run: npx tsx scripts/validate-upgraded-draft-pack-schema.ts
 *
 * Checks (behavioural, via service-role client):
 *   1. All 3 tables exist and are queryable
 *   2. All expected columns exist (selectable)
 *   3. FK constraints enforced (insert with bogus FK rejected with 23503)
 *
 * Prints a RLS verification SQL snippet at the end — paste it into the
 * Supabase Dashboard SQL Editor to confirm rls_enabled=true and
 * policy_count=0 for all three tables (service-role-only access).
 */
import { getServiceClient } from "../lib/supabase";

type Check = { name: string; pass: boolean; detail?: string };

const supabase = getServiceClient();

const SECTIONS_COLUMNS = [
  "id",
  "order_id",
  "section_key",
  "title",
  "content",
  "completion_status",
  "word_count",
  "last_regenerated_at",
  "created_at",
  "updated_at",
];

const CITATIONS_COLUMNS = [
  "id",
  "section_id",
  "citation_id",
  "source_doc",
  "quote",
  "exact_reference",
  "created_at",
];

const PREDICATES_COLUMNS = [
  "id",
  "order_id",
  "predicate_name",
  "manufacturer",
  "match_strength",
  "match_rationale",
  "is_primary",
  "submitted_by_applicant",
  "created_at",
];

const FAKE_UUID = "00000000-0000-0000-0000-000000000000";

async function tableExists(table: string): Promise<Check> {
  const { error } = await supabase.from(table).select("id").limit(0);
  return error
    ? { name: `table ${table} exists`, pass: false, detail: error.message }
    : { name: `table ${table} exists`, pass: true };
}

async function columnsExist(table: string, cols: string[]): Promise<Check> {
  const { error } = await supabase.from(table).select(cols.join(",")).limit(0);
  return error
    ? {
        name: `${table}: all ${cols.length} columns selectable`,
        pass: false,
        detail: error.message,
      }
    : { name: `${table}: all ${cols.length} columns selectable`, pass: true };
}

async function fkEnforced(
  table: string,
  payload: Record<string, unknown>,
  fkColumn: string
): Promise<Check> {
  const { error } = await supabase.from(table).insert(payload).select();
  if (!error) {
    return {
      name: `${table}: FK on ${fkColumn} enforced`,
      pass: false,
      detail: "insert with bogus FK was accepted (constraint missing?)",
    };
  }
  const code = (error as { code?: string }).code;
  if (code === "23503") {
    return { name: `${table}: FK on ${fkColumn} enforced`, pass: true };
  }
  return {
    name: `${table}: FK on ${fkColumn} enforced`,
    pass: false,
    detail: `unexpected error code ${code ?? "none"}: ${error.message}`,
  };
}

async function main() {
  const checks: Check[] = [];

  // 1. Tables exist
  const tableChecks = [
    await tableExists("draft_pack_sections"),
    await tableExists("draft_pack_citations"),
    await tableExists("draft_pack_predicates"),
  ];
  checks.push(...tableChecks);

  // 2. Columns exist (only meaningful if tables exist)
  if (tableChecks.every((c) => c.pass)) {
    checks.push(await columnsExist("draft_pack_sections", SECTIONS_COLUMNS));
    checks.push(await columnsExist("draft_pack_citations", CITATIONS_COLUMNS));
    checks.push(await columnsExist("draft_pack_predicates", PREDICATES_COLUMNS));
  }

  // 3. FK constraints enforced via bogus-FK insert
  checks.push(
    await fkEnforced(
      "draft_pack_sections",
      { order_id: FAKE_UUID, section_key: "_validator_test", title: "_test" },
      "order_id"
    )
  );
  checks.push(
    await fkEnforced(
      "draft_pack_citations",
      {
        section_id: FAKE_UUID,
        citation_id: "[_test]",
        source_doc: "_test",
        quote: "_test",
        exact_reference: "_test",
      },
      "section_id"
    )
  );
  checks.push(
    await fkEnforced(
      "draft_pack_predicates",
      { order_id: FAKE_UUID, predicate_name: "_test" },
      "order_id"
    )
  );

  // Report
  console.log("\nStory 2.3 — Upgraded Draft Pack schema validator\n");
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
  and c.relname in ('draft_pack_sections', 'draft_pack_citations', 'draft_pack_predicates')
order by c.relname;

-- Expected: rls_enabled = true, policy_count = 0 for all 3 rows.
`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
