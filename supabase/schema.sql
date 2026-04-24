-- Run this in Supabase Dashboard → SQL Editor

create table if not exists assessments (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  company_name      text,
  product_name      text,
  one_liner         text not null,
  url               text,
  email             text not null,
  newsletter_opt_in boolean default false,
  status            text default 'draft',      -- draft | processing | completed | abandoned
  product_type      text,                       -- product | platform | hardware_software | regulator | investor
  scoped_feature    text,
  wizard_answers    jsonb,
  readiness_card    jsonb,
  share_token       text unique
);

create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  assessment_id         uuid references assessments(id),
  tier                  text,                   -- tier_1_draft | tier_3_concierge
  razorpay_payment_id   text,
  status                text default 'pending', -- pending | paid | delivered | refunded
  amount_paid           numeric
);

create table if not exists tier1_draft_packs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  order_id      uuid references orders(id),
  draft_pack    jsonb,
  pdf_url       text,
  delivered_at  timestamptz
);

create table if not exists tier3_waitlist (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz default now(),
  assessment_id           uuid references assessments(id),
  email                   text not null,
  target_submission_date  date,
  notes                   text,
  status                  text default 'waitlist' -- waitlist | contacted | active | completed
);

-- Enable RLS (Row Level Security) — service role bypasses this anyway
alter table assessments enable row level security;
alter table orders enable row level security;
alter table tier1_draft_packs enable row level security;
alter table tier3_waitlist enable row level security;
