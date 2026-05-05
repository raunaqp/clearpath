-- Feature 8: TRL fields + demo flag
--
-- All changes are ADDITIVE and BACKWARD COMPATIBLE:
--  - New columns are nullable (existing inserts continue to work)
--  - TRL is also stored inside readiness_card JSONB (source of truth);
--    these columns are convenience / index targets for admin views
--  - `is_demo` flag lets us filter demo packets out of analytics
--
-- Idempotent: safe to re-run.

-- TRL convenience columns (denormalised from readiness_card JSONB for indexing)
alter table assessments
  add column if not exists trl_level smallint check (trl_level between 1 and 9),
  add column if not exists trl_track text check (trl_track in ('investigational', 'has_predicate')),
  add column if not exists trl_completion_pct smallint check (trl_completion_pct between 0 and 100);

-- Index on TRL for admin queries like "show me all TRL 3-5 assessments"
create index if not exists idx_assessments_trl_level
  on assessments(trl_level)
  where trl_level is not null;

-- Demo packet flag — for filtering analytics + admin views
alter table assessments
  add column if not exists is_demo boolean not null default false;

create index if not exists idx_assessments_is_demo
  on assessments(is_demo)
  where is_demo = true;

-- Backfill TRL columns from existing readiness_card JSONB.
-- Idempotent: only fills cells that are currently null.
update assessments
set
  trl_level = nullif(readiness_card->'trl'->>'level', '')::smallint,
  trl_track = readiness_card->'trl'->>'track',
  trl_completion_pct = nullif(readiness_card->'trl'->>'completion_pct', '')::smallint
where
  readiness_card is not null
  and readiness_card->'trl' is not null
  and trl_level is null;

-- Backfill is_demo from meta.is_demo. Idempotent.
update assessments
set is_demo = true
where (meta->>'is_demo')::boolean = true
  and is_demo = false;

-- Sanity comment for future readers
comment on column assessments.trl_level is 'TRL 1-9 (SERB/ANRF MAHA MedTech framework). Denormalised from readiness_card->trl.';
comment on column assessments.trl_track is 'investigational | has_predicate. Denormalised from readiness_card->trl.';
comment on column assessments.is_demo is 'True when assessment was seeded from a demo packet (lib/demo-packets).';
