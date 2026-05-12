-- Sprint 2 Story 2.5 Phase 5.5.A — schema for the iterative Draft Pack workflow.
--
-- Three concerns, one transaction:
--   1. Section editing overlay  → adds content_edited / edited_at /
--      edited_by to draft_pack_sections. AI baseline stays in `content`;
--      customer overlay lives in `content_edited` and survives regens.
--   2. Revision history         → draft_pack_section_revisions, append
--      on every save (lightweight undo + audit trail).
--   3. Per-section attachments  → draft_pack_attachments, keyed on
--      (order_id, section_key, sha256) so regens don't drop evidence
--      and identical re-uploads dedupe.
--
-- Predicate work (predicates table, pgvector, match_predicates RPC,
-- draft_pack_predicates_v2) is deferred to Sprint 3 Story 3.6 per
-- founder lock 2026-05-12.
--
-- RLS: every new table has RLS enabled with zero policies. Service
-- role bypasses; everything else is locked. Matches the existing
-- pattern in migrations 009, 011, 012.
--
-- Idempotent: every statement uses IF NOT EXISTS or similar guards.

begin;

-- ============================================================
-- 1. Section editing overlay
-- ============================================================
alter table draft_pack_sections
  add column if not exists content_edited text,
  add column if not exists edited_at timestamptz,
  add column if not exists edited_by text;

comment on column draft_pack_sections.content_edited is
  'Phase 5.5 customer overlay over the AI-generated `content`. When non-null, the reader displays this instead of `content`. Regens always write to `content`; this column survives them. Null = use AI baseline.';
comment on column draft_pack_sections.edited_at is
  'Phase 5.5 timestamp of the most recent edit to content_edited. Null when overlay is null.';
comment on column draft_pack_sections.edited_by is
  'Phase 5.5 auth.uid() (or "admin") of the most recent editor.';

-- ============================================================
-- 2. Revision history
-- ============================================================
create table if not exists draft_pack_section_revisions (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references draft_pack_sections(id) on delete cascade,
  content     text not null,
  edited_by   text,
  reason      text,
  created_at  timestamptz default now()
);

create index if not exists idx_dpsr_section_created
  on draft_pack_section_revisions (section_id, created_at desc);

alter table draft_pack_section_revisions enable row level security;

-- ============================================================
-- 3. Per-section attachments
-- ============================================================
-- Keyed on (order_id, section_key) NOT (section_id) so that
-- regenerating a section doesn't cascade-delete the evidence. The
-- (order_id, section_key, sha256) unique tuple dedupes identical
-- re-uploads.
create table if not exists draft_pack_attachments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references tier2_orders(id) on delete cascade,
  section_key   text not null,
  filename      text not null,
  storage_path  text not null,
  content_type  text,
  size_bytes    integer not null,
  sha256        text not null,
  notes         text,
  uploaded_by   text,
  uploaded_at   timestamptz default now(),
  unique (order_id, section_key, sha256)
);

create index if not exists idx_dpa_order_section
  on draft_pack_attachments (order_id, section_key);

alter table draft_pack_attachments enable row level security;

commit;
