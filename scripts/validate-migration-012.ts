#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 5/6 — migration 012 validator.
 *
 * Run AFTER applying supabase/migration-012-retarget-draft-pack-fks-to-tier2-orders.sql
 * in the Supabase Dashboard SQL Editor.
 *
 * Run: npx tsx --env-file=.env.local scripts/validate-migration-012.ts
 *
 * Checks (behavioural, via service-role client):
 *   1. Inserting into draft_pack_sections with a valid tier2_orders.id succeeds.
 *      Proves the FK now points at tier2_orders.
 *   2. Inserting with a non-existent UUID fails with 23503 (FK violation).
 *      Proves the constraint is active.
 *   3. Same two checks for draft_pack_predicates.
 *
 * Cleanup: any test rows inserted are deleted before exit.
 */
import { getServiceClient } from "../lib/supabase";
import { randomUUID } from "crypto";

type Check = { name: string; pass: boolean; detail?: string };
const supabase = getServiceClient();

async function pickTier2OrderId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("tier2_orders")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

async function fkToTier2OrdersOnSections(orderId: string): Promise<Check> {
  const { data: inserted, error } = await supabase
    .from("draft_pack_sections")
    .insert({
      order_id: orderId,
      section_key: `_validator_012_${Date.now()}`,
      title: "_validator",
      completion_status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return {
      name: "draft_pack_sections.order_id accepts a real tier2_orders.id",
      pass: false,
      detail: `${error.code}: ${error.message}`,
    };
  }
  if (inserted?.id) {
    await supabase.from("draft_pack_sections").delete().eq("id", inserted.id);
  }
  return {
    name: "draft_pack_sections.order_id accepts a real tier2_orders.id",
    pass: true,
  };
}

async function fkRejectsBogusOnSections(): Promise<Check> {
  const fakeId = randomUUID();
  const { error } = await supabase
    .from("draft_pack_sections")
    .insert({
      order_id: fakeId,
      section_key: `_validator_012_bogus_${Date.now()}`,
      title: "_validator",
      completion_status: "draft",
    })
    .select("id")
    .single();

  if (!error) {
    return {
      name: "draft_pack_sections.order_id rejects a non-existent UUID",
      pass: false,
      detail: "insert with fake order_id was accepted — FK is not active",
    };
  }
  const code = (error as { code?: string }).code;
  if (code === "23503") {
    return {
      name: "draft_pack_sections.order_id rejects a non-existent UUID",
      pass: true,
    };
  }
  return {
    name: "draft_pack_sections.order_id rejects a non-existent UUID",
    pass: false,
    detail: `unexpected error code ${code}: ${error.message}`,
  };
}

async function fkToTier2OrdersOnPredicates(orderId: string): Promise<Check> {
  const { data: inserted, error } = await supabase
    .from("draft_pack_predicates")
    .insert({
      order_id: orderId,
      predicate_name: "_validator",
      manufacturer: "_validator",
    })
    .select("id")
    .single();

  if (error) {
    return {
      name: "draft_pack_predicates.order_id accepts a real tier2_orders.id",
      pass: false,
      detail: `${error.code}: ${error.message}`,
    };
  }
  if (inserted?.id) {
    await supabase
      .from("draft_pack_predicates")
      .delete()
      .eq("id", inserted.id);
  }
  return {
    name: "draft_pack_predicates.order_id accepts a real tier2_orders.id",
    pass: true,
  };
}

async function fkRejectsBogusOnPredicates(): Promise<Check> {
  const fakeId = randomUUID();
  const { error } = await supabase
    .from("draft_pack_predicates")
    .insert({
      order_id: fakeId,
      predicate_name: "_validator_bogus",
      manufacturer: "_validator",
    })
    .select("id")
    .single();

  if (!error) {
    return {
      name: "draft_pack_predicates.order_id rejects a non-existent UUID",
      pass: false,
      detail: "insert with fake order_id was accepted — FK is not active",
    };
  }
  const code = (error as { code?: string }).code;
  if (code === "23503") {
    return {
      name: "draft_pack_predicates.order_id rejects a non-existent UUID",
      pass: true,
    };
  }
  return {
    name: "draft_pack_predicates.order_id rejects a non-existent UUID",
    pass: false,
    detail: `unexpected error code ${code}: ${error.message}`,
  };
}

async function main() {
  console.log("\nStory 2.5 Phase 5/6 — migration 012 validator\n");

  const orderId = await pickTier2OrderId();
  if (!orderId) {
    console.log(
      "  ⚠  no tier2_orders rows found — cannot run behavioural checks"
    );
    console.log(
      "    create at least one tier2_orders row and re-run.\n"
    );
    process.exit(1);
  }
  console.log(`  using tier2_orders.id = ${orderId} for FK tests`);

  const checks: Check[] = [];
  checks.push(await fkToTier2OrdersOnSections(orderId));
  checks.push(await fkRejectsBogusOnSections());
  checks.push(await fkToTier2OrdersOnPredicates(orderId));
  checks.push(await fkRejectsBogusOnPredicates());

  console.log("");
  for (const c of checks) {
    const mark = c.pass ? "✓" : "✗";
    console.log(`  ${mark} ${c.name}`);
    if (!c.pass && c.detail) console.log(`      ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed.`);

  console.log(`
--- Sanity SQL (paste into Supabase Dashboard → SQL Editor) ---
select tc.constraint_name,
       tc.table_name,
       kcu.column_name,
       ccu.table_name as references_table,
       ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema    = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema    = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name in ('draft_pack_sections','draft_pack_predicates')
  and kcu.column_name = 'order_id';

-- Expected: both FKs point at references_table = 'tier2_orders'.
`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
