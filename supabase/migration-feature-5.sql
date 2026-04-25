-- Run once in Supabase SQL Editor. Idempotent. Adds tracking columns for Feature 5 user-intent capture (Tier 2 / ABDM / DPDP).

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tier2_intent_clicked TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS abdm_intent_captured_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS dpdp_intent_captured_at TIMESTAMPTZ;
