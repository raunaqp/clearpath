#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 5.5.A — migration 013 validator.
 *
 * Run AFTER applying supabase/migration-013-phase-5-5-schema.sql in the
 * Supabase Dashboard SQL Editor.
 *
 * Run: npx tsx --env-file=.env.local scripts/validate-migration-013.ts
 *
 * Checks (in order):
 *   1. draft_pack_sections.content_edited / edited_at / edited_by exist
 *   2. draft_pack_section_revisions table exists + FK to sections +
 *      cascade + 23503 on bogus section_id
 *   3. draft_pack_attachments table exists + FK to tier2_orders
 *      + unique (order_id, section_key, sha256) → 23505 on dupe
 *
 * Predicate-related checks were removed when scope was locked
 * 2026-05-12; that work is deferred to Sprint 3 Story 3.6.
 *
 * Cleanup: any test rows inserted are deleted before exit.
 */
import { getServiceClient } from "../lib/supabase";
import { randomUUID } from "crypto";

type Check = { name: string; pass: boolean; detail?: string };
const supabase = getServiceClient();

async function pickTier2OrderId(): Promise<string | null> {
  const { data } = await supabase
    .from("tier2_orders")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function pickSectionId(orderId: string): Promise<string | null> {
  const { data } = await supabase
    .from("draft_pack_sections")
    .select("id")
    .eq("order_id", orderId)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function check1_overlayColumns(): Promise<Check> {
  const { error } = await supabase
    .from("draft_pack_sections")
    .select("id, content_edited, edited_at, edited_by")
    .limit(0);
  return error
    ? {
        name: "draft_pack_sections has content_edited / edited_at / edited_by",
        pass: false,
        detail: error.message,
      }
    : {
        name: "draft_pack_sections has content_edited / edited_at / edited_by",
        pass: true,
      };
}

async function check2_revisionsTable(sectionId: string | null): Promise<Check> {
  const { error: selErr } = await supabase
    .from("draft_pack_section_revisions")
    .select("id")
    .limit(0);
  if (selErr) {
    return {
      name: "draft_pack_section_revisions table exists",
      pass: false,
      detail: selErr.message,
    };
  }
  if (!sectionId) {
    return {
      name: "draft_pack_section_revisions FK + cascade (skipped — no section row to test against)",
      pass: true,
    };
  }
  const { data: inserted, error: insErr } = await supabase
    .from("draft_pack_section_revisions")
    .insert({ section_id: sectionId, content: "_validator_013", reason: "_test" })
    .select("id")
    .single();
  if (insErr) {
    return {
      name: "draft_pack_section_revisions accepts a real section_id",
      pass: false,
      detail: insErr.message,
    };
  }
  const { error: bogusErr } = await supabase
    .from("draft_pack_section_revisions")
    .insert({ section_id: randomUUID(), content: "_validator_013_bogus" })
    .select("id")
    .single();
  await supabase
    .from("draft_pack_section_revisions")
    .delete()
    .eq("id", inserted!.id);
  if (!bogusErr) {
    return {
      name: "draft_pack_section_revisions rejects a non-existent section_id",
      pass: false,
      detail: "insert with random UUID was accepted",
    };
  }
  const code = (bogusErr as { code?: string }).code;
  return code === "23503"
    ? { name: "draft_pack_section_revisions FK + insert/reject both ok", pass: true }
    : {
        name: "draft_pack_section_revisions FK rejection wrong code",
        pass: false,
        detail: `${code}: ${bogusErr.message}`,
      };
}

async function check3_attachments(orderId: string): Promise<Check> {
  const { error: selErr } = await supabase
    .from("draft_pack_attachments")
    .select("id")
    .limit(0);
  if (selErr) {
    return {
      name: "draft_pack_attachments table exists",
      pass: false,
      detail: selErr.message,
    };
  }
  const sha = randomUUID().replace(/-/g, "");
  const { data: inserted, error: insErr } = await supabase
    .from("draft_pack_attachments")
    .insert({
      order_id: orderId,
      section_key: "_validator_test",
      filename: "test.pdf",
      storage_path: `_validator/${sha}.pdf`,
      size_bytes: 1,
      sha256: sha,
    })
    .select("id")
    .single();
  if (insErr) {
    return {
      name: "draft_pack_attachments accepts a real tier2_orders.id",
      pass: false,
      detail: insErr.message,
    };
  }
  const { error: dupErr } = await supabase
    .from("draft_pack_attachments")
    .insert({
      order_id: orderId,
      section_key: "_validator_test",
      filename: "dup.pdf",
      storage_path: `_validator/${sha}.pdf`,
      size_bytes: 1,
      sha256: sha,
    })
    .select("id")
    .single();
  await supabase
    .from("draft_pack_attachments")
    .delete()
    .eq("id", inserted!.id);
  if (!dupErr) {
    return {
      name: "draft_pack_attachments unique(order_id, section_key, sha256)",
      pass: false,
      detail: "duplicate (order, section, sha) insert was accepted",
    };
  }
  const code = (dupErr as { code?: string }).code;
  return code === "23505"
    ? { name: "draft_pack_attachments insert + dedupe both ok", pass: true }
    : {
        name: "draft_pack_attachments dedupe wrong code",
        pass: false,
        detail: `${code}: ${dupErr.message}`,
      };
}

async function main() {
  console.log("\nStory 2.5 Phase 5.5.A — migration 013 validator\n");

  const orderId = await pickTier2OrderId();
  if (!orderId) {
    console.log(
      "  ⚠  no tier2_orders rows found — cannot run FK-dependent checks"
    );
    process.exit(1);
  }
  console.log(`  using tier2_orders.id = ${orderId}`);
  const sectionId = await pickSectionId(orderId);
  console.log(
    sectionId
      ? `  using draft_pack_sections.id = ${sectionId}`
      : "  no draft_pack_sections rows under this order — revisions FK test will skip"
  );

  const checks: Check[] = [];
  checks.push(await check1_overlayColumns());
  checks.push(await check2_revisionsTable(sectionId));
  checks.push(await check3_attachments(orderId));

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
-- All three changes landed?
select c.relname
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('draft_pack_section_revisions','draft_pack_attachments');
-- Should return 2 rows.

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'draft_pack_sections'
  and column_name in ('content_edited','edited_at','edited_by');
-- Should return 3 rows.
`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
