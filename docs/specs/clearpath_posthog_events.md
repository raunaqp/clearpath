# ClearPath — PostHog Analytics Spec

Five events. Instrument during build. ~2 hours of work, un-recoverable if skipped.

---

## The 5 events

| # | Event name | Fires | Source | Why |
|---|---|---|---|---|
| 1 | `intake_started` | User lands on `/start` | Client | Measures landing → intake |
| 2 | `wizard_completed` | User submits Q7 answer | Client | Measures intake → full wizard |
| 3 | `card_generated` | Readiness Card renders for the first time | Client | Measures wizard → output success |
| 4 | `tier2_cta_clicked` | User clicks the "Get Draft Pack · ₹499" button | Client | Measures intent to convert |
| 5 | `tier2_payment_completed` | Razorpay webhook fires `payment.captured` | **Server** | Ground truth on revenue |
| 6 | `tier3_cta_clicked` | User clicks secondary "Submission Concierge" link on the card or in email | Client | Measures Tier 3 interest separate from waitlist submits |
| 7 | `wizard_conflict_shown` | Conflict disclosure card renders on wizard Q1 | Client | Measures how often pre-router surfaces a conflict |
| 8 | `wizard_conflict_continued` | User clicks "Continue to questions" on conflict card | Client | Measures proceed-vs-edit decision |
| 9 | `wizard_conflict_edit_clicked` | User clicks "Edit my description" on conflict card | Client | Measures users who opt to edit |
| 10 | `wizard_conflict_reappeared` | Card re-shows after edit because conflict persisted | Client | Measures whether edits resolve conflicts |

**Critical:** event 5 MUST fire server-side from the Razorpay webhook handler, not from the client success page. Client success pages miss ~15% of real payments (user closes tab, network hiccup, etc.) and can be spoofed.

---

## Event payloads

### 1. `intake_started`
```ts
posthog.capture('intake_started', {
  referrer: document.referrer,
  utm_source: searchParams.get('utm_source'),
  utm_medium: searchParams.get('utm_medium'),
  utm_campaign: searchParams.get('utm_campaign'),
});
```

### 2. `wizard_completed`
```ts
posthog.capture('wizard_completed', {
  product_type: 'product' | 'platform' | 'hardware_software' | 'export_only',
  scoped_feature: string | null,           // non-null only for platforms
  has_url: boolean,                         // did user provide a URL
  time_spent_seconds: number,               // from intake_started to here
  q2_followup_triggered: boolean,           // did Q2 conflict detection fire
});
```

### 3. `card_generated`
```ts
posthog.capture('card_generated', {
  card_id: string,                          // internal assessment UUID
  medical_device_status: 'is_medical_device' | 'not_medical_device' | 'hybrid' | 'wellness_carve_out',
  cdsco_class: 'A' | 'B' | 'C' | 'D' | null,
  class_qualifier: string | null,           // "AI-CDS" | "IVD" | "scoped" | null
  readiness_score: number | null,           // 0-10, null for non-medical
  risk_level: 'high' | 'medium' | 'low' | 'not_applicable',
  timeline_months_low: number,
  timeline_months_high: number,
  applicable_regulations_count: number,     // out of 9
});
```

### 4. `tier2_cta_clicked`
```ts
posthog.capture('tier2_cta_clicked', {
  card_id: string,
  source: 'card_bottom' | 'email_nudge' | 'share_page' | 'tracking_dashboard',
  time_since_card_gen_seconds: number,
});
```

### 5. `tier2_payment_completed` (server-side only)
```ts
// In your Razorpay webhook handler
posthogServer.capture({
  distinctId: customer.email,               // set via identify
  event: 'tier2_payment_completed',
  properties: {
    card_id: order.assessment_id,
    order_id: order.id,
    razorpay_payment_id: payload.payment.id,
    amount_paid: payload.payment.amount / 100,  // paise → ₹
    tier: 'tier_2_draft_pack',
  },
});
```

### 6. `tier3_cta_clicked` (v1 — added with Tier 2 CTA change log)
```ts
posthog.capture('tier3_cta_clicked', {
  card_id: string,
  source: 'card_bottom' | 'draft_pack_email' | 'follow_up_email',
});
```

Distinct from `concierge_waitlist_submitted` (which only fires once the waitlist form is submitted). `tier3_cta_clicked` measures **intent / surface performance**; `concierge_waitlist_submitted` measures **conversion**.

### 7–10. Wizard conflict events (v2 — added with wizard conflict disclosure change log)

```ts
posthog.capture('wizard_conflict_shown', {
  severity: 'high' | 'medium',
  authority_used: 'pdf' | 'url' | 'one_liner',
});

posthog.capture('wizard_conflict_continued', {
  severity: 'high' | 'medium',
});

posthog.capture('wizard_conflict_edit_clicked', {
  severity: 'high' | 'medium',
});

posthog.capture('wizard_conflict_reappeared', {
  severity: 'high' | 'medium',
  edit_attempt_count: number,
});
```

Dashboard to add: **"Conflict outcomes"** — percentage of users who see the card, how many continue vs edit, and of those who edit, how many resolve the conflict vs persist.

---

## Identification strategy

**Goal:** link anonymous browsing events (1, 2) to identified user events (3, 4, 5) so funnels work end-to-end.

**When to identify:**
- User submits the intake form with their email → call `posthog.identify()` right there
- PostHog auto-aliases prior anonymous events to this identity

```ts
// After intake form submission, before redirect to wizard
posthog.identify(email, {
  email,
  first_seen: new Date().toISOString(),
  signup_source: utm_source || 'direct',
});
```

**Cookieless note:** Vercel Analytics is cookieless. PostHog uses cookies but only first-party. The DPDP notice on your intake form covers both — no separate banner needed.

---

## Setup code

### Client-side (Next.js 14 App Router)

Install:
```bash
npm install posthog-js
```

Create `app/providers/posthog-provider.tsx`:
```tsx
'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',  // save quota — don't create profiles for anons
      capture_pageview: false,              // we'll control pageviews manually
      capture_pageleave: true,
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

Wrap in `app/layout.tsx`:
```tsx
import { PHProvider } from './providers/posthog-provider';
// ...
<body>
  <PHProvider>{children}</PHProvider>
</body>
```

Use in components:
```tsx
'use client';
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();
posthog?.capture('intake_started', { ... });
```

### Server-side (Razorpay webhook)

Install:
```bash
npm install posthog-node
```

Create `lib/posthog-server.ts`:
```ts
import { PostHog } from 'posthog-node';

export const posthogServer = new PostHog(process.env.POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  flushAt: 1,          // flush immediately for webhooks
  flushInterval: 0,
});
```

In `app/api/webhooks/razorpay/route.ts`:
```ts
import { posthogServer } from '@/lib/posthog-server';

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();
  // verify signature...
  
  const payload = JSON.parse(body);
  if (payload.event === 'payment.captured') {
    // ... update DB order status ...
    
    posthogServer.capture({
      distinctId: payload.payload.payment.entity.email,
      event: 'tier2_payment_completed',
      properties: {
        card_id: order.assessment_id,
        order_id: order.id,
        razorpay_payment_id: payload.payload.payment.entity.id,
        amount_paid: payload.payload.payment.entity.amount / 100,
        tier: 'tier_2_draft_pack',
      },
    });
    await posthogServer.shutdown();  // ensure flush before response
  }
  return Response.json({ ok: true });
}
```

---

## PostHog dashboard — set up Day 1

Log into PostHog → create these two saved views:

### Dashboard 1 — "ClearPath Funnel"

Create a **Funnel** insight with these steps in order:
1. `intake_started`
2. `wizard_completed`
3. `card_generated`
4. `tier2_cta_clicked`
5. `tier2_payment_completed`

**Conversion window:** 7 days. **Breakdown:** by `product_type` (from event 2). Save + pin.

### Dashboard 2 — "Card Output Distribution"

Create a **Trends** insight on `card_generated`, broken down by:
- `medical_device_status` (are we seeing the expected mix?)
- `cdsco_class` (what classes are common?)
- `risk_level` (distribution of risk outcomes)

Time range: Last 30 days. Save + pin.

---

## What these events tell you in Week 1

- **Under 30% intake → wizard:** intake form friction. Fix copy, shorten.
- **Under 60% wizard → card:** engine failure or loading state too slow. Fix backend.
- **Under 5% card → tier2 click:** card is not compelling. Revisit verdict copy, CTA placement.
- **Under 60% tier2 click → payment:** Razorpay friction or pricing objection. Check payment method failure rates.

Each stage has a different fix. Without the funnel, you fix blindly.

---

## DPDP compliance note

PostHog data is personal data under DPDP Act 2023. Three things Claude Code must implement alongside:

1. **Visible privacy notice** on the intake form page: *"We use PostHog and Vercel Analytics to understand how people use ClearPath. Data is processed under our privacy policy."* Link to `/privacy`.

2. **Data deletion endpoint** at `/api/user/delete` — calls PostHog's delete-by-distinct-id API. Required under DPDP for data principal rights.

3. **Use PostHog EU Cloud** (`https://eu.posthog.com`), not US, for cleaner DPDP alignment + GDPR coverage if you ever serve EU.

Set in env:
```
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
POSTHOG_HOST=https://eu.posthog.com
```

---

## Cost ballpark

PostHog free tier: 1M events/month. Assume per customer lifecycle = ~10 events. At 1,200 customers/year that's 12,000 events/year — you will not exceed free tier for 2+ years.

Budget: **₹0** for Year 1 analytics.

---

## Out of scope for MVP (add post-Weekender)

- Session recording (useful for debugging funnel drops but adds compliance surface)
- Feature flags (useful for A/B pricing test later)
- Product analytics beyond funnel (retention, cohorts) — add once you have 100+ customers
- Marketing attribution (UTMs are captured but not deeply analysed) — add when you have a paid ads budget

Ship the 5 events. Add more only when data volume justifies it.
