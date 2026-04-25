-- Run once in Supabase SQL Editor. Idempotent.
-- Feature 5.5: extends tier3_waitlist to the spec form (mobile, prefill
-- tracking, expert-assignment columns, indexes). The earlier shape from
-- schema.sql kept the table minimal; this brings it to the post-MVP shape.

-- Renames (no-op if already done)
ALTER TABLE tier3_waitlist RENAME COLUMN cdsco_app_number TO cdsco_application_number;
ALTER TABLE tier3_waitlist RENAME COLUMN target_date TO target_submission_date;
ALTER TABLE tier3_waitlist RENAME COLUMN assessment_id TO source_assessment_id;

-- Required-now columns. Backfill values for any pre-existing rows so the
-- NOT NULL constraints can apply cleanly.
UPDATE tier3_waitlist SET product_name = 'unspecified' WHERE product_name IS NULL;
UPDATE tier3_waitlist SET target_submission_date = CURRENT_DATE WHERE target_submission_date IS NULL;
UPDATE tier3_waitlist SET context = '' WHERE context IS NULL;

ALTER TABLE tier3_waitlist ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE tier3_waitlist ALTER COLUMN target_submission_date SET NOT NULL;
ALTER TABLE tier3_waitlist ALTER COLUMN context SET NOT NULL;

-- New columns
ALTER TABLE tier3_waitlist ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE tier3_waitlist ADD COLUMN IF NOT EXISTS assigned_expert_email TEXT;
ALTER TABLE tier3_waitlist ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE tier3_waitlist ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tier3_waitlist ADD COLUMN IF NOT EXISTS prefilled BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_tier3_waitlist_created_at ON tier3_waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tier3_waitlist_status_created_at ON tier3_waitlist (status, created_at DESC);
