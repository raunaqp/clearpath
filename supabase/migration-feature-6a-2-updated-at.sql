-- Feature 6a follow-up: track updated_at on tier2_orders for stuck-order
-- recovery. Run once in Supabase SQL Editor. Idempotent.

ALTER TABLE tier2_orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing rows: use the most recent known timestamp per row so
-- the stuck-detection threshold (>3 min on generating) treats already-
-- delivered orders correctly even if status logic gets re-run later.
UPDATE tier2_orders
SET updated_at = COALESCE(delivered_at, verified_at, created_at, now())
WHERE updated_at IS NULL OR updated_at < created_at;
