-- Sprint 2 Story 2.5 Phase 1 — AI extraction column + path detection foundation
-- Run this in Supabase Dashboard → SQL Editor
--
-- Adds the storage column for the pitch-deck AI extraction output
-- (ported in Phase 2 from cdsco-reviewer-tool's lib/intake/ai-extract.ts).
-- The path-detection half of Phase 1 is TS-only (readiness-card schema +
-- synthesizer prompt) — no DDL needed because recommended_path lives
-- inside the existing readiness_card jsonb column.
--
-- Schema shape stored in assessments.ai_extracted (Phase 2 wires it):
--   {
--     "device_name": string | null,
--     "intended_use_one_liner": string | null,
--     "suggested_classification": "A"|"B"|"C"|"D"|"unknown" | null,
--     "suggested_wizard_answers": { intended_use, device_class, ai_ml,
--                                   data_sensitivity, target_market[] },
--     "company": { legal_name, constitution, cin, registered_address,
--                  manufacturing_address, founded_year, team_size },
--     "product_meta": { model_number, sterile, patient_population,
--                       user_population, setting_of_use },
--     "confidence": "high" | "medium" | "low",
--     "notes": string,
--     "cost_usd": number,
--     "extracted_at": ISO 8601 timestamp,
--     "source_sha256": string  -- file hash for cache key
--   }
--
-- RLS: assessments already has RLS enabled (schema.sql line 94). New
-- column inherits the table-level service-role-only policy. No policy
-- changes needed.
--
-- Idempotent: safe to re-run.

alter table assessments
  add column if not exists ai_extracted jsonb;

comment on column assessments.ai_extracted is
  'Pitch-deck AI extraction output (Story 2.5 Phase 2). Cached by source_sha256.';
