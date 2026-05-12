-- Sprint 2 Story 2.5 Phase 5/6 — retarget draft-pack FKs from legacy orders → tier2_orders
-- Run this in Supabase Dashboard → SQL Editor
--
-- Background:
--   Migration 009 created draft_pack_sections and draft_pack_predicates
--   with `order_id uuid references orders(id)`. But the v2 generator
--   (lib/engine/draft-pack-v2/persist.ts) actually reads from `tier2_orders`
--   and writes that id into `order_id`. All v2 testing has been dry-run, so
--   the FK constraint never fired. The first live write would fail with a
--   foreign-key violation.
--
-- Pre-migration data audit (2026-05-11):
--   - orders                 0 rows  (legacy v0 payment table, dead code)
--   - tier2_draft_packs      0 rows  (legacy v1 delivery table, dead code)
--   - tier2_orders          22 rows  (active)
--   - draft_pack_sections    0 rows
--   - draft_pack_citations   0 rows
--   - draft_pack_predicates  0 rows
--   No application code references `orders` outside the FK definitions.
--   → Clean retarget. No data migration step needed.
--
-- This migration is idempotent (DROP CONSTRAINT IF EXISTS guards both FKs)
-- and runs in a single transaction. RLS is unchanged.

begin;

-- 1. draft_pack_sections.order_id  →  tier2_orders(id)

alter table draft_pack_sections
  drop constraint if exists draft_pack_sections_order_id_fkey;

alter table draft_pack_sections
  add constraint draft_pack_sections_order_id_fkey
  foreign key (order_id)
  references tier2_orders(id)
  on delete cascade;

-- 2. draft_pack_predicates.order_id  →  tier2_orders(id)

alter table draft_pack_predicates
  drop constraint if exists draft_pack_predicates_order_id_fkey;

alter table draft_pack_predicates
  add constraint draft_pack_predicates_order_id_fkey
  foreign key (order_id)
  references tier2_orders(id)
  on delete cascade;

-- Sanity-check comment for future archaeologists.
comment on constraint draft_pack_sections_order_id_fkey on draft_pack_sections is
  'Retargeted from orders(id) to tier2_orders(id) in migration 012 (Phase 5/6). Legacy orders table was never written to in production.';

comment on constraint draft_pack_predicates_order_id_fkey on draft_pack_predicates is
  'Retargeted from orders(id) to tier2_orders(id) in migration 012 (Phase 5/6). Legacy orders table was never written to in production.';

commit;
