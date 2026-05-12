-- Sprint 3 Story 3.1 — two-tier pricing.
--
-- Customer picks one of two products at /upgrade/[id]:
--   draft_pack   ₹499   AI-generated PDF emailed to the customer
--   draft_editor ₹2,499 Full in-app /draft/[id] editor with the same
--                       AI content + inline editing + attachments
--
-- Storing the choice on tier2_orders.tier_choice lets the rest of the
-- flow branch on it:
--   - email-verification gate fires only for draft_pack (delivery is
--     by email)
--   - post-delivery routing (status panel) sends draft_editor
--     customers straight to /draft/[id]
--   - amount_inr is already on the row, set per-tier at order creation
--
-- Existing rows from Sprint 2 default to draft_pack via a backfill
-- (that was the only product, ₹499 PDF). Forward-looking rows must
-- specify a tier — the CHECK constraint enforces it.
--
-- Idempotent: safe to re-run.

alter table tier2_orders
  add column if not exists tier_choice text;

update tier2_orders
  set tier_choice = 'draft_pack'
  where tier_choice is null;

alter table tier2_orders
  drop constraint if exists tier2_orders_tier_choice_check;

alter table tier2_orders
  add constraint tier2_orders_tier_choice_check
  check (tier_choice in ('draft_pack', 'draft_editor'));

comment on column tier2_orders.tier_choice is
  'Sprint 3 Story 3.1 — draft_pack (₹499 PDF via email) or draft_editor (₹2,499 in-app editor). Drives the email-verify gate, payment amount, and post-delivery UX.';
