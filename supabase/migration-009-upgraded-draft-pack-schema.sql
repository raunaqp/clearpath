-- Sprint 2 Story 2.3 — Upgraded Draft Pack schema
-- Run this in Supabase Dashboard → SQL Editor
--
-- Foundation for the upgraded Draft Pack experience (Story 2.5):
--   - draft_pack_sections    : per-order, per-section editable content
--                              (12 sections per CDSCO MDR structure)
--   - draft_pack_citations   : source quotes + exact references, scoped to a section
--   - draft_pack_predicates  : predicate device matches per order
--                              (AI-surfaced + applicant-submitted)
--
-- RLS: enabled on all 3 tables, no policies = service-role-only access.
-- This matches the existing codebase pattern (every table in schema.sql
-- has RLS enabled with no public policies; access is gated by API routes
-- using the service-role key via lib/supabase.ts).
--
-- TODO (Story 2.2): once auth lands and orders.user_id exists, add
-- user-scoped read policies (chain: section.order_id → orders.user_id =
-- auth.uid()). Until then, only the service role can touch these tables.
--
-- Idempotent: safe to re-run.

-- 1. Sections — per-order, per-section editable Draft Pack content
create table if not exists draft_pack_sections (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders(id) on delete cascade,
  section_key           text not null,
  title                 text not null,
  content               text,
  completion_status     text not null default 'draft'
                          check (completion_status in ('draft', 'complete', 'pending')),
  word_count            int,
  last_regenerated_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (order_id, section_key)
);

create index if not exists idx_draft_pack_sections_order_id
  on draft_pack_sections(order_id);

-- 2. Citations — source references with quotes, scoped to a section
create table if not exists draft_pack_citations (
  id                    uuid primary key default gen_random_uuid(),
  section_id            uuid not null references draft_pack_sections(id) on delete cascade,
  citation_id           text not null,
  source_doc            text not null,
  quote                 text not null,
  exact_reference       text not null,
  created_at            timestamptz not null default now(),
  unique (section_id, citation_id)
);

create index if not exists idx_draft_pack_citations_section_id
  on draft_pack_citations(section_id);

-- 3. Predicates — predicate device matches per order
create table if not exists draft_pack_predicates (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references orders(id) on delete cascade,
  predicate_name           text not null,
  manufacturer             text,
  match_strength           numeric,
  match_rationale          text,
  is_primary               boolean not null default false,
  submitted_by_applicant   boolean not null default false,
  created_at               timestamptz not null default now()
);

create index if not exists idx_draft_pack_predicates_order_id
  on draft_pack_predicates(order_id);

-- At most one primary predicate per order
create unique index if not exists ux_draft_pack_predicates_one_primary_per_order
  on draft_pack_predicates(order_id)
  where is_primary;

-- Enable RLS on all 3 tables. No policies = service_role only access.
alter table draft_pack_sections   enable row level security;
alter table draft_pack_citations  enable row level security;
alter table draft_pack_predicates enable row level security;

-- Sanity comments for future readers
comment on table draft_pack_sections   is 'Per-order, per-section editable Draft Pack content (Story 2.3 / Story 2.5).';
comment on table draft_pack_citations  is 'Source citations [n] for a Draft Pack section, with quote + exact reference (Story 2.3).';
comment on table draft_pack_predicates is 'Predicate device matches per order. AI-surfaced + applicant-submitted (Story 2.3).';
