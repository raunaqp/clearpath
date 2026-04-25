# ClearPath — Build Plan (v3, Final)

Authoritative execution plan for Claude Code. Supersedes all earlier build docs. Every optimisation decided in the thread is folded in.

**Read before starting:**
- `README.md` — product overview
- `SKILL.md` — coding conventions
- `clearpath_engine_spec_v3.md` — engine logic reference
- `clearpath_output_schemas.md` — JSON schemas
- `clearpath_regulations.md` — 9 regulations
- `clearpath_screens_spec.md` — screen wireframes
- `clearpath_user_journeys.md` — flow decisions
- `clearpath_posthog_events.md` — base analytics spec
- `clearpath_copy_scope.md` — all user-visible text
- `clearpath_landing_changes.md` — landing page change list (if landing already shipped)

---

## Stack snapshot (locked)

| Layer | Service | Why |
|---|---|---|
| Frontend + API | Next.js 14 App Router | Best Claude Code support |
| Hosting | Vercel Pro ($20/mo) | Required for commercial use |
| DB + Storage | Supabase (free → Pro $25/mo) | Postgres portability |
| Analytics | PostHog EU Cloud (free <1M events/mo) | DPDP alignment |
| Payments | Razorpay Payment Links | India-native |
| Email | Resend (free <3K emails/mo) | Modern API |
| AI (dev) | Claude Max 5x ($100/mo) | Covers Claude Code terminal |
| AI (prod) | Anthropic API | Sonnet 4.6 + Opus 4.7 |
| PDF output | React-PDF | Branded, reusable |

**Explicitly dropped:** Firecrawl, cheerio, OCR libraries, Convex, session recording, feature flags.

## Cost summary at 1,000 intakes/month

| Journey | Users | API cost | Other | Revenue |
|---|---|---|---|---|
| Free card (cache miss) | 680 | $102 | $0 | $0 |
| Free card (cache hit) | 170 | $0 | $0 | $0 |
| ₹499 upgrade | 100 | $45 | $14 Razorpay | $600 |
| ₹50K waitlist | 10 | $0 | $0 | $0 (deferred) |
| Polite decline | 40 | $0.50 | $0 | $0 |
| **Monthly totals** | **1,000** | **~$148** | **~$14** | **$600** |

Fixed infra: $120/mo (Max + Vercel Pro) + ~$148 API = **$268/mo gross at 1,000 intakes.**

**Top up $75 API credits before launch. Set $20 + $50 usage alerts. No auto-reload yet.**

---

# Phase 0 — Infrastructure (half day)

| Task | Time | Blocks |
|---|---|---|
| Domain purchase | 15 min | Feature 1 |
| Vercel Pro | 15 min | Feature 1 |
| Supabase project | 15 min | Feature 0 |
| Anthropic API $75 top-up + alerts | 30 min | Feature 0 |
| Razorpay merchant (test keys) | 1 hr | Feature 6 |
| Resend + domain DNS (start Day 1) | 30 min + 4–24 hr | Feature 6 |
| PostHog EU Cloud | 15 min | Feature 0 |
| Privacy Policy + ToS drafts | 2 hr | Feature 1 |

Resend DNS verification takes hours of wall-clock time. **Start on Day 1.**

**`.env.local`:**

```
ANTHROPIC_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
POSTHOG_KEY=
POSTHOG_HOST=https://eu.posthog.com
NEXT_PUBLIC_APP_URL=https://clearpath.in
CACHE_VERSION=1
```

`CACHE_VERSION` is bumped manually when regulation reference changes. All cached cards with older versions regenerate.

---

# Feature 0 — POC / infra verification

**Goal:** prove every piece of infra works before building real features.

**Verify:**
1. Next.js 14 deploys to Vercel on git push
2. Supabase `assessments` table created, row insertable from a form
3. Supabase Storage bucket `assessment-docs` created with signed-URL policy
4. PostHog captures custom event, visible in Live Events dashboard
5. Vercel Analytics captures page views
6. Anthropic API call to Sonnet returns response (use API key, not Max)

Build throwaway `/poc` page. Delete once all six green.

---

# Feature 1 — Landing page

**Goal:** static landing with working intake CTA, section analytics, all copy from `clearpath_copy_scope.md`.

## 1a — Build 14 sections in order

1. Header (fixed, CTA)
2. Hero (headline + subhead + CTA + expert trust strip + social proof)
3. Problem stats (3 cards)
4. Regulatory maze (9-reg grid)
5. Founder journey (6 steps)
6. Sample Readiness Card (EkaScribe)
7. Pricing (3 tiers — moved AFTER sample card)
8. Why ClearPath (5 moats — NO Karnataka Medtech Cluster)
9. Who built this
10. Testimonials (3 quotes)
11. FAQ (including uploaded doc privacy question)
12. Global vision strip (India first, global 2027+)
13. Final CTA
14. Footer with Privacy + Terms + disclaimer

## 1b — Brand tokens (from SKILL.md §4)

- Background: `#F7F6F2`
- Ink: `#0E1411`
- Teal primary: `#0F6E56`
- Amber: `#BA7517`
- Coral: `#993C1D`
- Fonts: Georgia/Source Serif 4 (headings), Inter/Geist (body)
- Mobile-first at 375px
- Lighthouse >90 mobile

## 1c — Readiness Card visual with risk tint

| Risk | Background | Border |
|---|---|---|
| High | `bg-coral-light` | `border-coral-brand` |
| Medium | `bg-amber-light` | `border-amber-brand` |
| Low | `bg-green-light` | `border-green-dark` |
| N/A | `bg-gray-100` | `border-gray-line` |

Readiness circle color:
- 0–3: coral
- 4–6: amber
- 7–10: green

Reference slide 9 of `ClearPath_Deck.pptx` for composition.

## 1d — PostHog landing instrumentation

In `app/providers/posthog-provider.tsx`:

```ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: 'https://eu.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: false,  // CRITICAL — named events only
});
```

Create `lib/analytics/useSectionTracking.ts` hook using `IntersectionObserver` at 50% threshold. Fires `section_viewed` once per section per session.

Section IDs: `hero`, `problem`, `regulatory_maze`, `how_it_works`, `sample_card`, `pricing`, `moats`, `founder_profile`, `testimonials`, `faq`, `global_vision`, `final_cta`.

CTA button events:
```ts
posthog.capture('cta_clicked', {
  cta_location: 'hero' | 'journey_end' | 'card_bottom' | 'pricing_free' 
              | 'pricing_499' | 'pricing_50k' | 'final_cta' | 'header',
  cta_text, destination: '/start',
});
```

FAQ accordion open (not close):
```ts
posthog.capture('faq_opened', { question });
```

## 1e — Exit criteria

- `clearpath.in` HTTPS + 14 sections render
- PostHog events visible in Live Events
- Lighthouse >90 mobile
- Privacy + ToS at `/privacy` and `/terms`
- **Don't start Feature 2 until Feature 1 ships and gets feedback.**

---

# Feature 2 — Intake form (`/start`)

**Goal:** collect one-liner + optional URL + optional PDFs with defensive validation.

## 2a — Form fields

```
Your name                           [required]
Your email                          [required, validated]
Mobile (optional, +91 format)

What does your product do?          [required, 20–200 chars]
  Placeholder: E.g. "AI tool that flags early-stage Alzheimer's 
  from MRI scans for radiologists"
  Helper: One sentence. What the product does, for whom, using what.
  Counter: {n} / 200 chars

Product website (optional)
  Placeholder: https://
  Helper: We'll fetch your homepage to cross-check your description.

Upload product docs (optional, recommended)
  [Drop PDFs here — up to 3 files, 5MB each]
  Helper: Pitch decks · product briefs · tech specs · prior filings
  Subhelper: Up to 3 files, 5MB each, 10 pages each. PDF only.

At least one of URL or documents recommended.

DPDP notice: We use your submission to generate your Readiness Card. 
Uploaded files deleted after 90 days. [Read more]

[Start analysis →]
```

## 2b — PDF upload (critical)

**Don't route PDFs through Next.js API routes.** Vercel has 4.5MB body limit — uploads will fail.

Pattern:
1. Client requests signed upload URL from `/api/storage/signed-url`
2. Server returns `signedUrl` + `storagePath`
3. Client uploads directly to Supabase Storage via `PUT`
4. Client shows progress, sends `storagePath` to form submission

Hard client-side caps (enforce before upload):
- Max 3 files
- Max 5MB per file
- Max 10 pages per PDF (`pdfjs-dist` client-side check)
- PDF mime only

## 2c — DB schema

```sql
CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text,
  one_liner text NOT NULL,
  url text,
  url_fetched_content text,
  uploaded_docs jsonb,         -- [{ filename, storage_path, size_bytes, sha256 }]
  product_type text,
  wizard_answers jsonb,
  readiness_card jsonb,
  share_token text UNIQUE,
  cache_key text,
  cache_version int DEFAULT 1,
  status text DEFAULT 'draft',
  meta jsonb
);

CREATE INDEX idx_assessments_cache_key ON assessments(cache_key);
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_share_token ON assessments(share_token);

-- Global PDF cache (shared across all users)
CREATE TABLE pdf_content_cache (
  pdf_sha256 text PRIMARY KEY,
  extracted_summary text NOT NULL,
  token_count int,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  hit_count int DEFAULT 1
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id),
  tier text NOT NULL,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'pending',
  amount_paid numeric,
  created_at timestamptz DEFAULT now(),
  delivered_at timestamptz
);

CREATE TABLE tier2_draft_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  assessment_id uuid REFERENCES assessments(id),
  draft_pack_json jsonb,
  pdf_url text,
  forms_zip_url text,
  guide_pdf_url text,
  delivered_at timestamptz
);

CREATE TABLE tier3_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id),
  name text NOT NULL,
  email text NOT NULL,
  product_name text,
  cdsco_app_number text,
  target_date date,
  context text,
  status text DEFAULT 'waitlist',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  retry_count int DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);
```

## 2d — Events

```
intake_form_started    (page load)
intake_form_submitted  { has_url, docs_uploaded_count, one_liner_length }
```

## 2e — Exit criteria

- Validation works
- PDF direct upload to Supabase Storage
- Assessment row created on submit
- Redirect to `/analysing/{assessment_id}`

---

# Feature 3 — Pre-router + PDF + URL fetch (ONE Sonnet call)

**Goal:** classify product type, process PDFs, fetch URL — all in ONE Sonnet call.

## 3a — URL fetch (~30 lines, no dependencies)

```ts
// lib/engine/fetch-url.ts
export async function fetchUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'ClearPath/1.0' }
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000) || null;
  } catch {
    return null;  // Silent failure
  }
}
```

No Firecrawl. JS-heavy sites return null; engine proceeds with PDF + one-liner.

## 3b — PDF cache check before Claude call

```ts
// lib/engine/check-pdf-cache.ts
async function checkPdfCache(sha256: string) {
  const { data } = await supabase
    .from('pdf_content_cache')
    .select('*')
    .eq('pdf_sha256', sha256)
    .maybeSingle();
  
  if (data) {
    // Update usage stats
    await supabase
      .from('pdf_content_cache')
      .update({ 
        hit_count: data.hit_count + 1, 
        last_used_at: new Date().toISOString() 
      })
      .eq('pdf_sha256', sha256);
    return { cached: true, summary: data.extracted_summary };
  }
  return { cached: false };
}
```

Privacy Policy must state: *"Uploaded document content may be summarized and cached anonymously to improve performance. Summaries cannot be linked to your original document."*

## 3c — Sonnet call (pre-router + PDF processing + URL analysis)

**Model:** `claude-sonnet-4-6`

```ts
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2000,
  system: [
    {
      type: 'text',
      text: PRE_ROUTER_SYSTEM_PROMPT,  // Cached ~4K tokens
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: `One-liner: ${oneLiner}\nURL content: ${urlContent || 'N/A'}\nCached PDF summaries: ${JSON.stringify(cachedSummaries)}` },
        ...uncachedPdfs.map(pdf => ({
          type: 'document' as const,
          source: { type: 'base64', media_type: 'application/pdf', data: pdf.base64 }
        }))
      ]
    }
  ]
});
```

System prompt contains:
- Role: ClearPath pre-router
- Classification categories (product, platform, hardware_software, export_only, regulator, investor, out_of_scope)
- Authority hierarchy: PDFs > URL > one-liner
- Output JSON schema with examples
- Rejection criteria
- **Detected signals extraction** (added v3) — see below

### Added to PRE_ROUTER_SYSTEM_PROMPT (v3)

Along with product classification, extract any certifications, partnerships, or regulatory signals mentioned in uploaded documents or URL content. Add to the output JSON schema:

```json
{
  "detected_signals": {
    "certifications": [
      {
        "name": "ISO 13485 | IEC 62304 | ISO 14971 | NABL | ...",
        "source": "pdf | url | one_liner",
        "confidence": "high | medium | low",
        "evidence_quote": "string — exact phrase that triggered detection"
      }
    ],
    "partnerships": [
      { "type": "clinical_site | testing_lab | manufacturer | tech_partner",
        "name": "string", "source": "pdf | url",
        "confidence": "high | medium | low" }
    ],
    "prior_regulatory_work": [
      { "type": "cdsco_filing | clinical_trial | cdsco_test_license | fda_submission",
        "reference": "string — e.g. MD-12 number, CTRI number",
        "source": "pdf | url",
        "confidence": "high | medium | low" }
    ],
    "has_physical_facility": "yes | no | unclear",
    "facility_details": "string | null — brief description if detected"
  }
}
```

**Confidence rules:**
- `high`: explicit mention with specific detail (e.g. "ISO 13485 certified, cert number ABC123" or "Tested at NABL-accredited SRL Diagnostics")
- `medium`: mention without detail (e.g. "ISO 13485 compliant" or "works with NABL labs")
- `low`: ambiguous or forward-looking (e.g. "planning to get ISO 13485" or "could partner with NABL labs")

Only `high` and `medium` confidence certs are treated as present. `low` confidence is treated as a gap (same as absent). Store result in `assessments.meta.detected_signals`.

**Cost:** ~$0.015/call (cached PDFs) or ~$0.04/call (fresh PDFs).

## 3d — Save new PDF summaries to global cache

```ts
for (const [i, pdf] of uncachedPdfs.entries()) {
  await supabase.from('pdf_content_cache').upsert({
    pdf_sha256: pdf.sha256,
    extracted_summary: response.pdf_summaries[i],
    token_count: response.usage.input_tokens,
  });
}
```

## 3d-bis — Conflict severity detection (during pre-router)

The Sonnet pre-router evaluates whether one-liner, URL content, and PDF summaries describe meaningfully different products. Four severity levels:

- **high**: one source classifies as medical device, another doesn't (or they suggest different CDSCO classes, e.g. Class B vs C)
- **medium**: same classification direction, but notably different product descriptions (e.g. "fitness tracker" vs "cardiac monitoring device" — both could be Class B but very different intended use)
- **low**: minor wording or detail differences, same classification
- **none**: sources agree substantially

Pre-router output must include conflict evaluation:

```json
{
  "conflict_detected": true,
  "conflict_details": {
    "one_liner_interpretation": "string — paraphrase of one-liner",
    "pdf_interpretation": "string — paraphrase of PDF content",
    "url_interpretation": "string | null",
    "authority_used": "pdf | url | one_liner",
    "severity": "high | medium | low | none"
  }
}
```

Authority hierarchy for resolution (locked): **PDFs > URL content > one-liner.** When conflicts exist, Sonnet picks authority automatically based on this hierarchy and stores reasoning in `authority_used`.

Store in `assessments.meta`:

```ts
await supabase.from('assessments').update({
  ...,
  meta: {
    ...response.meta,
    conflict_detected: response.conflict_detected || false,
    conflict_details: response.conflict_details || null,
  }
}).eq('id', assessmentId);
```

## 3e — Routing

```ts
if (response.next_action === 'reject') {
  await supabase.from('assessments').update({ 
    status: 'rejected', 
    product_type: response.product_type,
    meta: { rejection_reason: response.rationale }
  }).eq('id', assessmentId);
  return redirect(`/declined/${assessmentId}`);
}

if (response.product_type === 'platform') {
  // MVP: treat as product, flag for Phase 2 decomposer
  await supabase.from('assessments').update({ 
    product_type: 'product',
    meta: { should_decompose: true, original_type: 'platform' }
  }).eq('id', assessmentId);
}

await supabase.from('assessments').update({ 
  product_type: response.product_type, 
  url_fetched_content: urlContent,
  status: 'routing_complete',
  meta: response.meta 
}).eq('id', assessmentId);

return redirect(`/wizard/${assessmentId}/q1`);
```

## 3f — Loading UI

`/analysing/{assessment_id}` with rotating copy (2s intervals):
- "Reading your description..."
- "Cross-checking your website..." (if URL)
- "Reading through your documents..." (if PDFs)
- "Mapping against 9 regulations..."
- "Almost ready..."

## 3g — Events

```
pre_router_completed  { product_type, pdf_cache_hits, pdf_cache_misses, url_fetch_success }
pre_router_rejected   { reason }
api_cost_tracked      { feature: 'pre_router', model: 'sonnet-4-6', tokens, cost, cache_hit }
```

## 3h — Exit criteria

- All 4 calibration test cases classify correctly (CerviAI, HealthifyMe, EkaScribe, ABDM)
- PDF cache hit/miss works (re-upload same file → cache hit on second submission)
- URL fetch returns text or null within 5s
- Polite decline screen renders for regulator/investor
- `api_cost_tracked` fires after every call

---

# Feature 4 — 7-Q Wizard

**Goal:** collect 7 structured answers. No LLM. Partial state saves.

## 4.0 — Conflict disclosure on a dedicated route (v4 Patch 4)

The disclosure lives at its own route: **`/wizard/[id]/conflict`**. The wizard step pages (`/wizard/[id]/q/[n]`) never render the card — they always serve the question cleanly. Gating happens in `/assess/[id]` after pre-router and on the `/conflict` page itself.

### Routing branch (in `/assess/[id]`)

```ts
const meta = assessment.meta ?? {};
const severity = meta.conflict_details?.severity;
const showConflictScreen =
  meta.conflict_detected === true &&
  (severity === 'high' || severity === 'medium') &&
  meta.conflict_acknowledged !== true;

if (showConflictScreen) redirect(`/wizard/${id}/conflict`);
redirect(`/wizard/${id}/q/${firstUnansweredStep(assessment.wizard_answers)}`);
```

### `/wizard/[id]/conflict` page

Server component. On load:
- Status-based redirects apply first (draft → `/assess`, rejected → `/declined`, completed → `/c/{token}`).
- If `!conflict_detected` or `severity` is low/none → redirect to `/wizard/[id]/q/1` (defensive; this page shouldn't be reachable in those cases).
- If `conflict_acknowledged === true` → redirect to `/wizard/[id]/q/1` (one-way gate; revisits auto-forward).
- Otherwise render `<ConflictDisclosureCard />` full-viewport — no stepper, no question header.

### Card CTAs (unchanged component, new context)

`"Continue to questions →"`:
- Client calls `POST /api/wizard/ack-conflict` → `meta.conflict_acknowledged = true`.
- Fires `wizard_conflict_continued{severity}`.
- Calls `router.refresh()` — server re-evaluates `/conflict`, sees `conflict_acknowledged === true`, redirects to `/wizard/[id]/q/1`.

`"← Edit my description"`:
- Fires `wizard_conflict_edit_clicked{severity}`.
- `router.push('/start?resume={id}')`.

### Card interactions

**"Continue to questions →"** button:
```ts
await supabase.from('assessments').update({
  meta: { ...meta, conflict_acknowledged: true }
}).eq('id', assessmentId);
posthog.capture('wizard_conflict_continued', {
  severity: meta.conflict_details.severity
});
// Proceed to Q1 questions
```

**"← Edit my description"** button:
```ts
posthog.capture('wizard_conflict_edit_clicked', {
  severity: meta.conflict_details.severity
});
router.push(`/start?resume=${assessmentId}`);
```

### Edit re-flow (Option 3a — re-open full intake form)

On `/start?resume={assessment_id}`:
1. Fetch existing `assessments` row by ID
2. Pre-populate all form fields (name, email, mobile, one_liner, url, uploaded_docs)
3. User edits any fields (typically the one-liner)
4. On submit, update SAME assessment_id row (do NOT create new row)
5. Re-run Feature 3 pre-router with updated inputs
6. Redirect back to wizard (`/wizard/{assessment_id}/q1`)

Outcomes after edit:
- **If new conflict severity is high/medium**: user lands on `/wizard/[id]/conflict` again with heading `Still a mismatch` (driven by `meta.conflict_edit_attempts > 0`). Fires `wizard_conflict_reappeared`.
- **If severity drops to low/none**: `/assess` redirects straight to `/wizard/[id]/q/1`; `/conflict` is never hit.

Edit cost: one additional Sonnet call per edit (~$0.015). Acceptable — gives users control without breaking the cost model.

### Events fired

```
wizard_conflict_shown          { severity, authority_used }
wizard_conflict_continued      { severity }
wizard_conflict_edit_clicked   { severity }
wizard_conflict_reappeared     { severity, edit_attempt_count }
```

### When the `/conflict` route is bypassed

- `conflict_detected === false`
- `severity === 'low' || 'none'`
- `conflict_acknowledged === true` (user already continued past; the page itself also auto-redirects as a safety net)

Direct navigation to `/wizard/[id]/q/[n]` always renders the question — the Q pages never gate on conflict state.

## 4a — Questions

All 7 questions + options in `clearpath_copy_scope.md` §4.2–4.8:

1. Clinical state (critical/serious/non-serious/varies)
2. Information significance (inform/drive/diagnose-treat) + Q2 follow-up
3. User type (HCPs/patients/both/admin)
4. User scale (<10K / 10K-1L / 1L-10L / 10L+)
5. Integrations (ABDM/hospital/both/neither)
6. Data sensitivity (multi-select checkboxes)
7. Commercial stage (pre-MVP/MVP/scaling/filed)

Skippable from Q4 onward (flag incomplete in meta).

## 4b — State saves on every Next click (optimistic)

```ts
await supabase.from('assessments').update({
  wizard_answers: { q1, q2, q2_followup, q3, q4, q5, q6, q7 },
  status: 'wizard'
}).eq('id', assessmentId);
```

**Optimistic navigation pattern (v4 Patch 2):**

1. On Next click, route IMMEDIATELY to the next question — no awaiting the save.
2. In parallel, fire `POST /api/wizard/save` as fire-and-forget. The save closure captures the answer snapshot at click time (not current state).
3. On save success: silent.
4. On save failure: a bottom-of-page toast appears — `Couldn't save your answer — Retry?`. The Retry button re-fires the same captured save; success dismisses the toast. Auto-dismiss after 10s if ignored.
5. Only one toast visible at a time — newest replaces older.
6. Drop-off edge case: if the user closes the tab while a save is still in flight (or after ignoring a failed toast), they resume at the last SUCCESSFULLY persisted question — i.e. one step behind where they were actually sitting. Acceptable: they re-answer one question, flow continues.
7. **Q2 follow-up exception**: when the user picks `informs_only` on Q2, the client still awaits `/api/wizard/check-q2-followup` before routing, because the check decides whether to render the inline follow-up or advance to Q3. Save fires in parallel (optimistic); follow-up check is the only blocking piece.
8. **Q7 Generate**: routes to `/assess/{id}` immediately; final save + `/api/wizard/complete` + `wizard_completed` event fire in background. If the final complete fails, the toast appears on `/assess/{id}` (the user can retry from there — in practice they typically reach the placeholder panel and see the toast briefly).

## 4c — Q2 follow-up logic

If Q2 = "informs_only" AND URL/PDF content contains decision-support phrases:

```ts
// Client calls /api/check-q2-followup on Q2 Next click
// Backend returns { show_followup: true, extracted_phrases: [...] }
// If true, render inline follow-up before advancing to Q3
```

Copy in `clearpath_copy_scope.md` §4.3.

## 4d — Events

```
wizard_step_completed  { step_number, time_on_step }
wizard_completed       { product_type, time_total, answers }
```

## 4e — Exit criteria

- All 7 questions render
- Back/Next preserves state
- Q2 follow-up triggers correctly
- Drop-off → return → resume works

---

# Feature 5 — Synthesizer + Readiness Card (Opus with caching)

**Goal:** generate Tier 0 JSON via ONE Opus call with prompt caching, check cache first, render card.

## 5a — Readiness card cache check (before API call)

```ts
import { createHash } from 'crypto';

function computeCacheKey(input): string {
  const normalized = {
    email: input.email.toLowerCase().trim(),
    oneLiner: input.oneLiner.trim(),
    url: input.url?.trim() || null,
    pdfHashes: input.pdfHashes.sort(),
    wizardAnswers: input.wizardAnswers,
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

const cacheKey = computeCacheKey({ ... });
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

const { data: cached } = await supabase
  .from('assessments')
  .select('id, share_token, readiness_card')
  .eq('cache_key', cacheKey)
  .eq('cache_version', parseInt(process.env.CACHE_VERSION || '1'))
  .eq('status', 'completed')
  .gte('created_at', thirtyDaysAgo)
  .limit(1)
  .maybeSingle();

if (cached) {
  // CACHE HIT — no API call
  posthog.capture('card_cache_hit', { 
    original_assessment_id: cached.id,
    new_assessment_id: assessmentId 
  });
  
  await supabase.from('assessments').update({ 
    readiness_card: cached.readiness_card, 
    share_token: cached.share_token,
    cache_key: cacheKey,
    status: 'completed' 
  }).eq('id', assessmentId);
  
  return redirect(`/c/${cached.share_token}`);
}
```

## 5b — Synthesizer Opus call with prompt caching

**Model:** `claude-opus-4-7`

```ts
const response = await anthropic.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 4000,
  system: [
    {
      type: 'text',
      text: SYNTHESIZER_SYSTEM_PROMPT,  // ~8K tokens CACHED
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content: `
        Product: ${oneLiner}
        Product type: ${productType}
        URL content: ${urlContent || 'N/A'}
        PDF summaries: ${JSON.stringify(pdfSummaries)}
        Wizard answers: ${JSON.stringify(wizardAnswers)}
        Detected signals: ${JSON.stringify(detected_signals)}    // NEW v3

        Generate full Tier 0 Readiness Card per output schema.

        When computing Top 3 gaps:
        - If classification is Class B/C/D and no high/medium confidence
          ISO 13485 detected → include as HIGH gap
        - If classification is Class B/C/D and no high/medium confidence
          IEC 62304 detected AND product has software → include as HIGH gap
        - If IVD classification and no NABL lab partnership detected →
          include as HIGH gap
        - If product_type is hardware_software and no facility detected →
          add to verdict: "Since your product has a hardware component,
          state FDA approval may also apply depending on your manufacturing
          setup."
      `
    }
  ]
});
```

This replaces the need for wizard questions on certifications or facility status. Classification stays at 7 questions.

**CACHED system prompt (~8K tokens):**
- Role definition
- 9 regulations with verdicts + rationale templates
- IMDRF matrix
- CDSCO Oct 2025 SaMD excerpts
- Classification heuristics
- Calibration examples (EkaScribe, CerviAI, HealthifyMe, Niramai, Forus, etc.)
- Output JSON schema
- Certainty language rules ("likely", never "must")

**UNCACHED user message (~2K tokens):**
- Product specifics
- User content + wizard answers

Expected cache hit rate at launch: 60–70%.

**Cost:**
- Cache hit: ~$0.18
- Cache miss: ~$0.30
- Weighted avg: ~$0.22

## 5c — Certainty post-processor

Apply `softenCertainty()` from `SKILL.md` §1 to every user-visible text field before saving.

## 5d — Save + render

```ts
const shareToken = generateShareToken();  // 6-char slug

await supabase.from('assessments').update({ 
  readiness_card: softenedResponse,
  share_token: shareToken,
  cache_key: cacheKey,
  cache_version: parseInt(process.env.CACHE_VERSION || '1'),
  status: 'completed'
}).eq('id', assessmentId);

posthog.capture('card_generated', { 
  card_id: assessmentId,
  medical_device_status: response.medical_device_status,
  cdsco_class: response.cdsco_class,
  readiness_score: response.readiness_score,
  risk_level: response.risk_level,
  cache_hit: false
});

posthog.capture('api_cost_tracked', { 
  feature: 'synthesizer', 
  model: 'opus-4-7', 
  input_tokens: response.usage.input_tokens,
  cached_tokens: response.usage.cache_read_input_tokens || 0,
  output_tokens: response.usage.output_tokens,
  estimated_cost_usd: calculateCost(...)
});

redirect(`/c/${shareToken}`);
```

## 5e — Card rendering

Per screen 6 of `clearpath_screens_spec.md` with risk-based tint per Change 5 of `clearpath_landing_changes.md`. Reference slide 9 of deck.

Share URL `clearpath.in/c/{share_token}` with OG preview (Vercel OG image).

## 5f — Required test cases

| Test | Expected output |
|---|---|
| EkaScribe | Class B/C, risk high, readiness 4/10 |
| CerviAI (one-liner says "data platform", site says cancer screening) | Class C, risk high, conflict flagged |
| HealthifyMe (wellness app) | wellness_carve_out, readiness null |
| Niramai (breast screening) | Class C IVD-SaMD, readiness 5/10 |
| ABDM | Rejected by pre-router, polite decline |

## 5g — Exit criteria

- End-to-end (intake → card) under 60s
- Cache hit path: re-submit identical form → instant redirect, no API call
- All 5 test cases pass
- Share URL with OG preview on WhatsApp/LinkedIn
- Mobile 375px works
- PostHog funnel 1→2→3 fires
- **Tier 2 CTA block rendered per clearpath_copy_scope.md §6.0.5 (four-pillar preview + primary CTA + secondary Tier 3 link)**

---

# Feature 5.5 — Concierge waitlist

**Goal:** capture Tier 3 intent (~30 min of work).

## 5.5a — Form

`/concierge` page with copy from `clearpath_copy_scope.md` §5.5.

Fields: name, email, product name, CDSCO app number (optional), target date, context (200 words).

Submit → `tier3_waitlist` row (status = 'waitlist') → confirmation screen.

## 5.5b — Email

On submit:
- Customer: confirmation email (Resend)
- You (founder): alert email with waitlist details

## 5.5c — Manual follow-up for MVP

1. You get alert
2. Email customer within 48h
3. Calendly link for kickoff call
4. Razorpay link sent manually if fit confirmed
5. Expert review · 12-month engagement

**Full automated flow (Razorpay + expert routing) is Phase 2.**

## 5.5d — Event

```
concierge_waitlist_submitted  { has_cdsco_number, days_until_target_date }
```

---

# Feature 6 — ₹499 payment + Draft Pack (async job pattern)

**Goal:** take ₹499, generate Draft Pack via ONE Opus call using Supabase data (NO re-running earlier calls), deliver email with 3 attachments.

## 6a — CDSCO forms mirror (one-time setup)

Download blank CDSCO forms from cdscomdonline.gov.in. Upload to Supabase Storage bucket `cdsco-forms/`.

```ts
// lib/forms/form-index.ts
export const CDSCO_FORMS = {
  'MD-12': { name: 'Test License Application', storage_path: 'cdsco-forms/MD-12.pdf' },
  'MD-9': { name: 'Manufacturing License', storage_path: 'cdsco-forms/MD-9.pdf' },
  'MD-14': { name: 'Import License', storage_path: 'cdsco-forms/MD-14.pdf' },
  // ... etc
};
```

Refresh monthly via cron. **Never hot-link to cdscomdonline.gov.in.**

## 6b — Static submission guide content

Write a stitchable content block per regulation:

```
lib/regulations/guides/
  cdsco-mdr.md
  dpdp-act.md
  icmr-ai.md
  abdm.md
  nabh.md
  ...
```

At Draft Pack time, stitch the applicable guides (based on `readiness_card.regulation_snapshot`) into one guide PDF. **NO Claude call — pure string concatenation.** Saves ~40% on Opus costs per Draft Pack.

## 6c — Upgrade page + Razorpay link

`/upgrade/{assessment_id}` with pitch copy from `clearpath_copy_scope.md` §6.1. CTA opens Razorpay Payment Link (₹499).

Razorpay Payment Links are simpler than Razorpay Checkout for MVP. UPI + cards + net banking.

## 6d — Webhook handler (CRITICAL: async pattern)

`/api/webhooks/razorpay/route.ts`:

```ts
export async function POST(req: Request) {
  // Verify signature
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  if (signature !== expected) return new Response('Invalid signature', { status: 401 });
  
  const payload = JSON.parse(body);
  if (payload.event !== 'payment.captured') return Response.json({ ok: true });
  
  // Idempotent upsert
  const { data: order } = await supabase.from('orders').upsert({
    id: payload.payload.payment.entity.notes.order_id,
    assessment_id: payload.payload.payment.entity.notes.assessment_id,
    tier: 'tier_2_draft_pack',
    razorpay_payment_id: payload.payload.payment.entity.id,
    status: 'paid',
    amount_paid: payload.payload.payment.entity.amount / 100,
  }).select().single();
  
  // Server-side PostHog event
  await posthogServer.capture({
    distinctId: payload.payload.payment.entity.email,
    event: 'tier2_payment_completed',
    properties: { 
      card_id: order.assessment_id, 
      order_id: order.id, 
      amount_paid: order.amount_paid 
    },
  });
  await posthogServer.shutdown();
  
  // Enqueue Draft Pack job (DO NOT generate synchronously)
  await supabase.from('job_queue').insert({
    job_type: 'generate_draft_pack',
    payload: { order_id: order.id },
    status: 'pending',
  });
  
  return Response.json({ ok: true });  // <5s response
}
```

**Webhook returns 200 in under 5s. Razorpay timeout is 15s.** Draft Pack takes 5–10 min — MUST run in separate worker.

## 6e — Worker (Vercel Cron)

`app/api/jobs/generate-draft-pack/route.ts`:

```ts
export async function POST() {
  const { data: job } = await supabase
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .eq('job_type', 'generate_draft_pack')
    .order('created_at')
    .limit(1)
    .maybeSingle();
  
  if (!job) return Response.json({ status: 'no_jobs' });
  
  await supabase.from('job_queue').update({ 
    status: 'running', 
    started_at: new Date().toISOString() 
  }).eq('id', job.id);
  
  try {
    const order = await getOrder(job.payload.order_id);
    const assessment = await getAssessment(order.assessment_id);
    
    // READ from Supabase — NO re-running pre-router/synthesizer
    const { readiness_card, wizard_answers, one_liner, uploaded_docs, url_fetched_content } = assessment;
    
    // ONE Opus call for Draft Pack content
    const draftPackContent = await generateDraftPackContent({
      readiness_card, wizard_answers, one_liner, uploaded_docs, url_fetched_content
    });
    
    const softened = softenCertainty(draftPackContent);
    
    // Render PDFs
    const draftPackPdfUrl = await renderDraftPackPdf(softened, assessment);       // React-PDF
    const guidePdfUrl = await stitchSubmissionGuide(readiness_card);              // Static
    const formsZipUrl = await bundleApplicableForms(readiness_card);              // Static
    
    // Save
    await supabase.from('tier2_draft_packs').insert({
      order_id: order.id,
      assessment_id: assessment.id,
      draft_pack_json: softened,
      pdf_url: draftPackPdfUrl,
      forms_zip_url: formsZipUrl,
      guide_pdf_url: guidePdfUrl,
    });
    
    // Email via Resend
    await sendDraftPackEmail({
      to: assessment.email,
      name: assessment.name,
      productName: assessment.one_liner,
      attachments: [
        { filename: `${productName}_DraftPack.pdf`, url: draftPackPdfUrl },
        { filename: 'CDSCO_Forms.zip', url: formsZipUrl },
        { filename: 'SubmissionGuide.pdf', url: guidePdfUrl },
      ],
      shareUrl: `https://clearpath.in/c/${assessment.share_token}`,
    });
    
    await supabase.from('orders').update({ 
      status: 'delivered', 
      delivered_at: new Date().toISOString() 
    }).eq('id', order.id);
    
    await supabase.from('job_queue').update({ 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    }).eq('id', job.id);
    
  } catch (err) {
    await supabase.from('job_queue').update({ 
      status: job.retry_count < 2 ? 'pending' : 'failed',
      retry_count: (job.retry_count || 0) + 1,
      last_error: err.message,
    }).eq('id', job.id);
  }
  
  return Response.json({ status: 'done' });
}
```

Vercel Cron in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/jobs/generate-draft-pack",
    "schedule": "* * * * *"
  }]
}
```

## 6f — Draft Pack Opus call (ONE call, with caching)

```ts
const response = await anthropic.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 8000,
  system: [
    {
      type: 'text',
      text: DRAFT_PACK_SYSTEM_PROMPT,  // ~8K tokens CACHED
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content: `
        Generate Draft Pack content for this product.
        
        Readiness Card: ${JSON.stringify(readiness_card)}
        Wizard Answers: ${JSON.stringify(wizard_answers)}
        Product one-liner: ${one_liner}
        URL content: ${url_fetched_content || 'N/A'}
        PDF summaries: ${JSON.stringify(pdf_summaries)}
        
        Output sections:
        - Intended Use Statement
        - Device Description + technical summary
        - Risk Classification Justification + IMDRF mapping
        - Clinical Context narrative
        - Essential Principles checklist
        - Algorithm Change Protocol (if AI/ML product)
      `
    }
  ]
});
```

**Cost:** ~$0.45 per Draft Pack with caching.

## 6g — Events

```
tier2_cta_clicked          (client, upgrade button on card)
tier2_payment_completed    (SERVER — from webhook)
draft_pack_delivered       (server — after email sent, { order_id, generation_time_ms })
api_cost_tracked           { feature: 'draft_pack', ... }
```

## 6h — Failure handling

Retry Draft Pack generation 3x. On final failure:
- Mark `orders.status = 'failed'`
- Email customer: "We hit a snag. No charge. Try again or email us."
- Manual refund via Razorpay dashboard

## 6i — Exit criteria

- Webhook verifies signature, returns 200 in <5s
- Worker picks up job within 2 minutes
- Draft Pack delivered within 10 minutes of payment
- Email arrives with 3 attachments
- Order status updates in Supabase
- `tier2_payment_completed` fires server-side

---

# Caching strategy (consolidated)

## Global PDF content cache
- **Key:** SHA-256 of PDF binary content
- **Value:** Claude-extracted summary
- **Scope:** Global across all users
- **TTL:** None (retained indefinitely, `last_used_at` tracked)
- **Privacy:** Anonymous, can't link to uploader (stated in Privacy Policy)

## Readiness card cache (per email + inputs)
- **Key:** SHA-256 of `(email + one_liner + url + pdf_hashes + wizard_answers)`
- **Value:** Full Readiness Card JSON + share_token
- **TTL:** 30 days
- **Invalidation:** Bump `CACHE_VERSION` env var when regulations change

## Opus prompt caching (Anthropic-native)
- Cached block: ~8K tokens (regulations + schema + examples)
- Uncached block: ~2K tokens (user-specific)
- Cache window: 5 minutes
- Expected hit rate: 60–70%
- Cached reads ~10% of uncached price

---

# PostHog complete event list

## Landing (Feature 1)
```
section_viewed   { section_name }
cta_clicked      { cta_location, cta_text, destination }
faq_opened       { question }
```

## Funnel (Features 2–6)
```
intake_form_started
intake_form_submitted          { has_url, docs_uploaded_count, one_liner_length }
pre_router_completed           { product_type, pdf_cache_hits, url_fetch_success }
pre_router_rejected            { reason }
wizard_step_completed          { step_number, time_on_step }
wizard_completed               { product_type, time_total }
card_generated                 { card_id, medical_device_status, cdsco_class, 
                                 readiness_score, risk_level, cache_hit }
card_cache_hit                 { original_assessment_id, new_assessment_id }
share_link_copied              { card_id }
tier2_cta_clicked              { card_id, source, time_since_card_gen }
tier2_payment_completed        { card_id, order_id, amount_paid }  ← SERVER
draft_pack_delivered           { order_id, generation_time_ms }
concierge_waitlist_submitted   { has_cdsco_number, days_until_target_date }
```

## Cost monitoring (every Anthropic call)
```
api_cost_tracked   { feature, model, input_tokens, output_tokens, 
                     cached_tokens, estimated_cost_usd, cache_hit }
```

---

# PostHog dashboards (build after Feature 1 ships)

1. **Landing → Intake funnel** — `$pageview` → `section_viewed(pricing)` → `cta_clicked` → `$pageview(/start)` → `intake_form_submitted`
2. **Full funnel** — `intake_form_submitted` → `wizard_completed` → `card_generated` → `tier2_cta_clicked` → `tier2_payment_completed`
3. **Section engagement** (bar) — `section_viewed` by `section_name`
4. **CTA performance** (pie) — `cta_clicked` by `cta_location`
5. **FAQ concerns** (bar) — `faq_opened` by `question`
6. **Card distribution** — `card_generated` by `medical_device_status`, `cdsco_class`, `risk_level`
7. **Cache hit rate** — `card_cache_hit` / `card_generated`
8. **API cost by feature** — `api_cost_tracked` summed by `feature`

Pin to "ClearPath Performance" dashboard. Weekly Monday 9am IST subscription.

---

# Phase 2 — Deferred items

Build after Weekender (Apr 27+):

1. Decomposer (platform → scope picker → scoped wizard)
2. Conflict resolution modal (one-liner vs URL vs PDFs disagree)
3. Tracking dashboard (9-regulation status tracker — slide 8 of deck)
4. Tier 3 concierge Razorpay integration + expert assignment workflow
5. Email nudges (48h upgrade, 2-week Tier 3 follow-up)
6. Regenerate button on Readiness Card (bypasses cache, 1/24h limit)
7. Cache warmer cron (if hit rate <30%, keep cache hot every 4 min)

### Phase 2 additions (added v3)

- Physical facility question — conditional Q8 when `product_type === 'hardware_software'`. Three options: own-facility, contract-manufacturer, overseas.
- Pre-router confidence check — when PDFs are weak signal, prompt user to upload more before proceeding to wizard.
- Tier 2 "Anything else to know?" textarea — lets founders add context they forgot to upload (certifications in progress, clinical trials underway, etc.)

---

# What NOT to build in MVP

- Auth / login / accounts
- Multi-product per user
- Admin panel (use Supabase dashboard directly)
- Tier 3 automated workflow
- Complex scraping / JS-rendered SPA handling
- Multi-language
- Session recording / feature flags / A/B testing
- OCR library (Claude native PDF vision handles it)
- Decomposer / scope picker
- Conflict modal
- Tracking dashboard

---

# Review checklist (every feature before shipping)

- [ ] Zod schemas for outputs where applicable
- [ ] Certainty post-processor applied to user-visible text
- [ ] Calibration test cases pass
- [ ] No hardcoded "required / must / definitely"
- [ ] 9 regulations evaluated (even if N/A)
- [ ] Readiness and Risk surfaced separately
- [ ] Brand colors from Tailwind tokens, not inline
- [ ] Mobile 375px responsive
- [ ] PostHog events visible in Live Events
- [ ] DPDP notice on any new forms
- [ ] `api_cost_tracked` fires after every Claude call

---

# Model selection per feature (locked)

| Feature | Model | Cache | Cost per call |
|---|---|---|---|
| Pre-router + PDF + URL | Sonnet 4.6 | PDF content global cache + prompt cache | $0.015 (hit) / $0.04 (miss) |
| Synthesizer (Readiness Card) | Opus 4.7 | Readiness card cache + 8K prompt cache | $0.18 (hit) / $0.30 (miss) |
| Draft Pack | Opus 4.7 | 8K prompt cache | $0.45 (with cache) |

**Never use Opus for routing. Never use Sonnet for synthesis/drafts.**

---

# Weekender milestone (Apr 27)

Ship by end of Weekender: **Features 0 + 1 + 2 + 3 + 4 + 5 + 5.5.**

Feature 6: Apr 28 — May 2.
Phase 2: May 3 — 15.

Success metric: 20+ free cards, 5+ concierge signups, landing live with clear messaging.

---

# Hand-off to Claude Code

Initial prompt:

> *Read README.md, then SKILL.md, then clearpath_build_plan.md. Execute features 0 through 6 in order. For each feature, consult the spec docs listed in "Read before starting." Apply prompt caching per §5b and §6f. Apply global PDF cache per §3b. Apply readiness card cache per §5a. Fire `api_cost_tracked` after every Anthropic call. Don't invent UX decisions — they're locked in clearpath_user_journeys.md and clearpath_screens_spec.md. Ship each feature independently. Test calibration cases before marking complete.*

Ship it.
