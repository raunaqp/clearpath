-- Run this in Supabase Dashboard → SQL Editor
-- Aligned with clearpath_build_plan v3 §2c. Safe to run on an empty DB —
-- drops prior tables so naming/keys match the plan exactly.

drop table if exists tier3_waitlist cascade;
drop table if exists tier1_draft_packs cascade;
drop table if exists tier2_draft_packs cascade;
drop table if exists pdf_content_cache cascade;
drop table if exists orders cascade;
drop table if exists assessments cascade;

create table assessments (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  name                  text not null,
  email                 text not null,
  mobile                text,
  one_liner             text not null,
  url                   text,
  url_fetched_content   text,
  uploaded_docs         jsonb,                      -- [{filename, storage_path, size_bytes, sha256}]
  product_type          text,                       -- product | platform | hardware_software | export_only | regulator | investor
  wizard_answers        jsonb,
  readiness_card        jsonb,
  share_token           text unique,
  cache_key             text,
  cache_version         int default 1,
  status                text default 'draft',       -- draft | routing | wizard | completed | rejected | abandoned
  meta                  jsonb,
  -- Feature 5 tracking columns (also in supabase/migration-feature-5.sql for in-place updates)
  tier2_intent_clicked      timestamptz,
  abdm_intent_captured_at   timestamptz,
  dpdp_intent_captured_at   timestamptz
);

create index idx_assessments_cache_key    on assessments(cache_key);
create index idx_assessments_email        on assessments(email);
create index idx_assessments_share_token  on assessments(share_token);

create table orders (
  id                    uuid primary key default gen_random_uuid(),
  assessment_id         uuid references assessments(id),
  tier                  text not null,              -- tier_2_draft_pack | tier_3_concierge
  razorpay_payment_id   text,
  status                text not null default 'pending', -- pending | paid | generating | delivered | failed | refunded
  amount_paid           numeric,
  created_at            timestamptz default now(),
  delivered_at          timestamptz
);

create table tier2_draft_packs (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid references orders(id),
  assessment_id         uuid references assessments(id),
  draft_pack_json       jsonb,
  pdf_url               text,
  forms_zip_url         text,
  guide_pdf_url         text,
  delivered_at          timestamptz
);

create table tier3_waitlist (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz default now(),
  name                      text not null,
  email                     text not null,
  mobile                    text,
  product_name              text not null,
  cdsco_application_number  text,
  target_submission_date    date not null,
  context                   text not null,
  status                    text default 'waitlist',    -- waitlist | contacted | active | completed
  assigned_expert_email     text,
  contacted_at              timestamptz,
  notes                     text,
  source_assessment_id      uuid references assessments(id),
  prefilled                 boolean default false
);

create index idx_tier3_waitlist_created_at        on tier3_waitlist (created_at desc);
create index idx_tier3_waitlist_status_created_at on tier3_waitlist (status, created_at desc);

create table pdf_content_cache (
  pdf_sha256        text primary key,
  extracted_summary text not null,
  token_count       int,
  created_at        timestamptz default now(),
  last_used_at      timestamptz default now(),
  hit_count         int default 1
);

-- Enable RLS (service role bypasses this)
alter table assessments        enable row level security;
alter table orders             enable row level security;
alter table tier2_draft_packs  enable row level security;
alter table tier3_waitlist     enable row level security;
alter table pdf_content_cache  enable row level security;
