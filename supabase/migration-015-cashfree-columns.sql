-- Sprint 2 Story 2.8 — Cashfree sandbox base rails.
--
-- Adds three columns to tier2_orders for the Cashfree payment flow:
--   - cashfree_order_id          our order id sent to Cashfree (we
--                                keep our own UUID; this is the
--                                stringified version Cashfree echoes
--                                back on webhooks)
--   - cashfree_payment_session_id the session id Cashfree returns
--                                when an order is created; the
--                                checkout URL is derived from it
--   - cashfree_payment_id        the payment id once captured (from
--                                webhook). Useful for reconciliation.
--
-- The existing payment_method column is reused — values shift to
-- 'cashfree' for orders created through this flow ('upi_qr' for the
-- legacy manual-screenshot flow).
--
-- Idempotent.

alter table tier2_orders
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_payment_session_id text,
  add column if not exists cashfree_payment_id text;

create index if not exists idx_tier2_orders_cashfree_order_id
  on tier2_orders (cashfree_order_id);
