-- Story 1.4a: engine_costs table for per-Anthropic-call cost tracking.
--
-- Single audit-trail table. One row per Anthropic API call across all
-- engine layers (pre-router, synthesizer, draft-pack, future form-fill).
--
-- Per-tier FK: each row references either an assessment (Tier 0
-- pre-router + synth) or a tier-specific order (Tier 1+ draft-pack,
-- future form-fill). Per-tier FK columns instead of a polymorphic
-- (order_id + order_type) pair — real referential integrity, no
-- typo risk on order_type, no orphaned rows.
--
-- Tier 3 ships in Sprint 7: that migration adds `order_id_tier3 uuid
-- references tier3_orders(id)` + updates the `must_have_parent` CHECK.
-- 1-line additions per tier.
--
-- Run once in Supabase Dashboard → SQL Editor. Idempotent.
--
-- NOTE: replaces the cost-policy Section 6 design (per-call cost columns
-- on assessments) — that approach doesn't scale to Tier 2/3 + form-fill
-- without schema churn. Decision logged in
-- docs/sprint-recaps/sprint-1.md backlog: update cost-policy Section 6
-- at end of Story 1.4 to match this engine_costs table approach.

create table if not exists engine_costs (
  id                  uuid primary key default gen_random_uuid(),
  assessment_id       uuid references assessments(id),
  order_id_tier2      uuid references tier2_orders(id),
  -- order_id_tier3 added in Sprint 7 migration
  call_layer          text not null,                      -- 'pre_router' | 'synthesizer' | 'draft_pack' | 'form_fill'
  model               text not null,                      -- exact API ID, e.g. 'claude-sonnet-4-6'
  input_tokens        int not null,
  output_tokens       int not null,
  cache_read_tokens   int default 0,
  cache_write_tokens  int default 0,
  cost_usd            numeric(10, 6) not null,
  created_at          timestamptz default now(),
  constraint must_have_parent
    check (assessment_id is not null or order_id_tier2 is not null)
);

create index if not exists idx_engine_costs_assessment on engine_costs(assessment_id);
create index if not exists idx_engine_costs_order_tier2 on engine_costs(order_id_tier2);
create index if not exists idx_engine_costs_created    on engine_costs(created_at desc);
create index if not exists idx_engine_costs_model      on engine_costs(model);

-- RLS: service role bypasses; this table is admin-only via service key
-- (matches the project pattern from supabase/schema.sql).
alter table engine_costs enable row level security;
