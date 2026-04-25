-- Feature 7: concierge form refactor.
-- Run once in Supabase SQL Editor. Idempotent.
--
-- Changes:
--   1. Drop NOT NULL on tier3_waitlist.target_submission_date — the form
--      no longer collects a target date. Existing rows stay; new rows are
--      written without this field.
--   2. Add tier3_waitlist.journey_stage TEXT — captures the multi-choice
--      "Since when have you been on this regulatory journey?" answer.
--      Values: not_started | 0_3_months | 3_6_months | 6_12_months |
--      12_24_months | over_24_months.

ALTER TABLE tier3_waitlist
  ALTER COLUMN target_submission_date DROP NOT NULL;

ALTER TABLE tier3_waitlist
  ADD COLUMN IF NOT EXISTS journey_stage TEXT;
