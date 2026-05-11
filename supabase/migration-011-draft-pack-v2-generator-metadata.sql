-- Sprint 2 Story 2.5 Phase 4b — generator metadata for draft_pack_sections
-- Run this in Supabase Dashboard → SQL Editor
--
-- Two additive changes to support the Phase 4b v2 generator:
--   1. `meta jsonb` column carries per-section generator metadata
--      (generation_strategy, source_fields, llm_cost_usd, model,
--      generated_at, dry_run, error_message). Optional — null for any
--      section not produced by the v2 pipeline.
--   2. `completion_status` check constraint relaxed to allow 'failed'
--      so the generator can mark a section as failed without crashing
--      the whole pack.
--
-- RLS unchanged. No new policies. Service-role-only continues.
-- Idempotent: safe to re-run.

-- 1. Add the meta column (idempotent via IF NOT EXISTS)
alter table draft_pack_sections
  add column if not exists meta jsonb;

comment on column draft_pack_sections.meta is
  'Phase 4b generator metadata: { generation_strategy: deterministic|templated|llm_synthesized, source_fields: jsonb, llm_cost_usd: number, model: string, generated_at: timestamptz, dry_run: boolean, error_message: string|null }. Optional — null when section was not produced by the v2 generator.';

-- 2. Relax completion_status to permit 'failed'. The original constraint
-- was auto-named by Postgres (default pattern: <table>_<col>_check).
-- Drop conditionally then re-create with the expanded enum.
alter table draft_pack_sections
  drop constraint if exists draft_pack_sections_completion_status_check;

alter table draft_pack_sections
  add constraint draft_pack_sections_completion_status_check
  check (completion_status in ('draft', 'complete', 'pending', 'failed'));
