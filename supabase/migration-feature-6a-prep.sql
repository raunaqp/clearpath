-- Feature 6a (Draft Pack with QR payment) prep — run in Supabase Dashboard → SQL Editor.
-- Idempotent: safe to re-run.
--
-- Why a separate tier2_orders table (vs the existing `orders` table in schema.sql)?
-- The existing `orders` table is wired for Razorpay (razorpay_payment_id column).
-- Feature 6a uses manual UPI-QR verification: the user pays via QR, uploads a
-- screenshot + transaction ID, an operator verifies, then we generate the pack.
-- The two flows have different state machines so they live in separate tables.

CREATE TABLE IF NOT EXISTS tier2_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              TIMESTAMPTZ DEFAULT now(),
  assessment_id           UUID REFERENCES assessments(id) NOT NULL,
  amount_inr              INTEGER NOT NULL DEFAULT 499,
  status                  TEXT NOT NULL DEFAULT 'pending_verification',
    -- pending_verification → verified → generating → delivered → failed
  payment_screenshot_url  TEXT,
  transaction_id          TEXT,
  payment_method          TEXT,                  -- 'upi_qr' for now
  verified_at             TIMESTAMPTZ,
  verified_by             TEXT,
  delivered_at            TIMESTAMPTZ,
  draft_pack_pdf_url      TEXT,
  notes                   TEXT,
  email_sent_to           TEXT
);

CREATE INDEX IF NOT EXISTS idx_tier2_orders_status_created
  ON tier2_orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tier2_orders_assessment
  ON tier2_orders (assessment_id);

ALTER TABLE tier2_orders ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS. Add user-facing policies in Feature 6a proper.
