-- Sprint 2 Story 2.5 Phase 5.5.D — attachment doc_type column.
--
-- Adds a per-attachment classification (e.g. "Test reports", "IFU",
-- "Predicate datasheet"). The taxonomy is enforced client-side via a
-- per-section dropdown; the DB column accepts any string so we can
-- extend the taxonomy without DDL churn.
--
-- Idempotent.

alter table draft_pack_attachments
  add column if not exists doc_type text;

comment on column draft_pack_attachments.doc_type is
  'Phase 5.5.D customer-selected doc type for this attachment, e.g. "Test reports", "IFU", "Other". Taxonomy is section-scoped, enforced in the client; column is plain text so the taxonomy can evolve without migrations.';
