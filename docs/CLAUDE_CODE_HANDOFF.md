# ClearPath — Claude Code Handoff

**This is your master instruction file.** Everything Claude Code needs, in the order to use it.

---

## Step 1 — Copy all files into your project

Move all files from `/mnt/user-data/outputs/` into your ClearPath project's root directory (or a `/docs` subdirectory if you prefer):

```
clearpath/
├── CLAUDE.md                              ← Rename README.md to this
├── SKILL.md
├── clearpath_build_plan.md                ← THE master execution plan
├── clearpath_build_scope.md
├── clearpath_engine_spec_v3.md            ← Use v3, not v2
├── clearpath_regulations.md
├── clearpath_output_schemas.md
├── clearpath_decomposer_spec.md           ← Phase 2 only
├── clearpath_screens_spec.md
├── clearpath_user_journeys.md
├── clearpath_landing_copy.md
├── clearpath_landing_changes.md           ← Applies to deployed landing page
├── clearpath_landing_page_questions.md
├── clearpath_posthog_events.md
├── clearpath_pricing_and_market_strategy.md
├── clearpath_timeline_model.md
├── clearpath_tier2_cta_changes.md         ← Change log v1
├── clearpath_wizard_conflict_changes.md   ← Change log v2
├── clearpath_intake_signals_changes.md    ← Change log v3
├── ClearPath_Deck.pptx                    ← Reference for card visual (slide 9)
└── ClearPath_Risk_Matrix.xlsx             ← Calibration reference
```

Delete `clearpath_engine_spec_v2.md` — superseded by v3.

---

## Step 2 — Read order (what Claude Code should read first, second, third)

When you start a Claude Code session for this project, Claude Code reads `CLAUDE.md` first automatically. The rest is loaded on demand based on what it needs for the current feature.

**Foundation docs (read first, every session):**
1. `CLAUDE.md` — product overview, context, conventions
2. `SKILL.md` — coding conventions, certainty post-processor
3. `clearpath_build_plan.md` — the ordered execution plan

**Apply surgical patches (read in order, apply to source docs):**
4. `clearpath_tier2_cta_changes.md` — v1 patches
5. `clearpath_wizard_conflict_changes.md` — v2 patches
6. `clearpath_intake_signals_changes.md` — v3 patches

**Feature-specific docs (read when building that feature):**

| When building | Read these |
|---|---|
| Feature 0 (POC) | Build plan §0, no specs |
| Feature 1 (Landing) | Landing copy + landing changes + screens spec Screen 1 |
| Feature 2 (Intake) | Screens spec Screen 2 + user journeys + output schemas |
| Feature 3 (Pre-router) | Engine spec v3 + regulations + output schemas + intake signals changes |
| Feature 4 (Wizard) | Screens spec Screen 5 + wizard conflict changes + user journeys |
| Feature 5 (Synthesizer + Card) | Engine spec v3 + output schemas + screens spec Screen 6 + tier2 cta changes |
| Feature 5.5 (Concierge waitlist) | User journeys flow 5 + screens spec Screen 10 |
| Feature 6 (Draft Pack + payment) | Build plan §6 + output schemas + regulations |

**Reference docs (consult as needed):**
- `clearpath_posthog_events.md` — analytics taxonomy
- `clearpath_user_journeys.md` — flow logic
- `clearpath_screens_spec.md` — wireframes
- `clearpath_timeline_model.md` — timeline math for cards
- `clearpath_pricing_and_market_strategy.md` — pricing reasoning

**Deferred (Phase 2, don't read now):**
- `clearpath_decomposer_spec.md`
- `clearpath_build_scope.md` (superseded by build plan)
- `clearpath_engine_spec_v2.md` (superseded by v3)
- `clearpath_landing_page_questions.md` (decisions already made)

---

## Step 3 — Staged Claude Code instructions

Run these one at a time in your Claude Code terminal. Wait for completion and verify before moving to the next.

### Stage 0 — Apply change log patches (first, before any build work)

```
Read CLAUDE.md, then SKILL.md, then clearpath_build_plan.md to understand 
the project.

Then apply three change logs in order:

1. Read clearpath_tier2_cta_changes.md. Apply Patches 1 and 2 surgically 
   to clearpath_copy_scope.md and clearpath_build_plan.md. Add the 
   tier3_cta_clicked event to clearpath_posthog_events.md.

2. Read clearpath_wizard_conflict_changes.md. Apply Patches 1 through 6 
   surgically to clearpath_build_plan.md, clearpath_copy_scope.md, 
   clearpath_screens_spec.md, clearpath_output_schemas.md, and 
   clearpath_posthog_events.md.

3. Read clearpath_intake_signals_changes.md. Apply Patches 1 through 6 
   surgically to clearpath_copy_scope.md, clearpath_build_plan.md, and 
   clearpath_output_schemas.md.

Do NOT regenerate any full files. Surgical edits only. After all patches 
applied, confirm by showing me a diff summary of each source doc.
```

### Stage 1 — Feature 0 (POC / infra verification)

```
Execute Feature 0 from clearpath_build_plan.md.

Goal: prove every piece of infrastructure works before building real 
features.

Build a throwaway /poc page that verifies:
1. Next.js 14 App Router scaffolded and deploys to Vercel on git push
2. Supabase 'assessments' table created, one row insertable from a form
3. Supabase Storage bucket 'assessment-docs' created with signed-URL policy
4. PostHog fires a custom event on button click, visible in Live Events
5. Vercel Analytics captures page views
6. One Anthropic API call to claude-sonnet-4-6 returns a response

Once all six are green, delete the /poc page and commit.

Tell me when Feature 0 is complete and all six checks passed.
```

### Stage 2 — Feature 1 (Landing page)

```
Execute Feature 1 from clearpath_build_plan.md.

Before building, also apply the landing changes from 
clearpath_landing_changes.md (since there's an existing deployed landing 
at clearpath-lake-xi.vercel.app — these 8 changes refine it).

Read in order:
1. clearpath_build_plan.md §1 (Feature 1 spec)
2. clearpath_landing_copy.md (original copy)
3. clearpath_landing_changes.md (8 refinements)
4. clearpath_screens_spec.md Screen 1 (layout)
5. clearpath_posthog_events.md (section_viewed, cta_clicked, faq_opened)

Build all 14 sections in order listed in the build plan. Apply:
- Brand tokens from SKILL.md §4
- Risk-based background tint on sample Readiness Card
- autocapture: false in PostHog config
- Section tracking via IntersectionObserver hook

Priority order for landing changes (if any are already applied, skip):
1. Change 3 (reorder sections — pricing after sample card)
2. Change 1 (expert trust strip)
3. Change 4 (remove Karnataka Medtech Cluster)
4. Change 5 (Readiness Card visual with risk tint)
5. Change 6 (global vision strip)
6. Change 2 (CDSCO explicit naming)
7. Change 7 (copy tightening)
8. Change 8 (FAQ on uploaded doc privacy)

Exit criteria:
- clearpath.in resolves with HTTPS
- All 14 sections render correctly on desktop + mobile (375px)
- PostHog events fire and visible in Live Events dashboard
- Lighthouse score >90 on mobile
- Privacy + ToS pages at /privacy and /terms

Deploy to production. Tell me when Feature 1 is live and share the URL.
```

### Stage 3 — Feature 2 (Intake form)

```
Execute Feature 2 from clearpath_build_plan.md.

Read:
1. clearpath_build_plan.md §2 (Feature 2 spec)
2. clearpath_copy_scope.md §2 (form copy — will now include the expanded 
   PDF helper text from intake signals change log)
3. clearpath_screens_spec.md Screen 2 (intake form layout)
4. clearpath_output_schemas.md (assessments schema)

Build:
- /start page with form (name, email, mobile, one-liner, URL, PDF upload)
- Client-side validation (email, mobile +91, one-liner 20-200 chars)
- PDF upload: direct-to-Supabase-Storage via signed URL (bypass Vercel 
  4.5MB body limit)
- Hard caps: 3 PDFs × 5MB × 10 pages each, PDF mime only
- Client-side page counting via pdfjs-dist
- Progress bars per file
- DPDP notice with privacy link
- On submit: create assessments row, redirect to /analysing/{id}

Expanded PDF helper text (from intake signals changes v3):
  💡 What to include for best results:
    · What your product does (intended use)
    · How it works technically (AI model, data flow, integrations)
    · Who uses it (clinicians, patients, admins)
    · Any prior regulatory work (filings, tests, clinical studies)
    · Certifications or partners (ISO 13485, IEC 62304, NABL labs)
  No need for polished decks — internal docs work great.

Events: intake_form_started, intake_form_submitted

Exit criteria:
- Form validates all fields
- PDF upload works end-to-end (direct to Supabase Storage)
- Invalid PDFs rejected with helpful error
- Assessment row created on submit with status = 'draft'
- Redirect to /analysing/{assessment_id}

Deploy. Tell me when Feature 2 is complete.
```

### Stage 4 — Feature 3 (Pre-router + PDF processing + URL fetch)

```
Execute Feature 3 from clearpath_build_plan.md.

Read:
1. clearpath_build_plan.md §3 (now includes intake signals changes for 
   detected_signals extraction)
2. clearpath_engine_spec_v3.md (engine logic)
3. clearpath_regulations.md (9-reg reference)
4. clearpath_output_schemas.md (pre-router output schema, now includes 
   detected_signals and conflict_details)

Build:
- /api/engine/pre-router endpoint
- URL fetch utility (~30 lines, 5s timeout, text extraction, 5K char cap, 
  silent failure)
- PDF content cache check (global, by SHA-256)
- Single Sonnet call for: pre-routing + PDF processing + URL analysis + 
  conflict detection + detected_signals extraction
- Save new PDF summaries to pdf_content_cache
- Routing logic:
  - reject → /declined/{id}
  - platform → treat as product, flag meta.should_decompose (MVP 
    simplification)
  - product → /wizard/{id}/q1
- /analysing/{id} loading UI with rotating messages

Model: claude-sonnet-4-6

Cached system prompt includes:
- Classification categories
- Authority hierarchy (PDFs > URL > one-liner)
- Output JSON schema (with conflict_details AND detected_signals)
- Rejection criteria
- Certification/partnership/regulatory signal extraction rules

Fire api_cost_tracked event after the call.

Test cases (from build plan §3h):
1. EkaScribe description → Class B/C, risk high (test synthesizer too)
2. CerviAI (one-liner "data platform" + PDF cancer screening) → 
   conflict_detected: true, severity: high
3. HealthifyMe wellness → medical_device_status: wellness_carve_out
4. Niramai breast screening → Class C IVD-SaMD
5. ABDM description → pre-router rejects → polite decline

Exit criteria:
- All 5 test cases pass
- PDF cache hit works on re-upload of same file
- URL fetch returns text or null within 5s
- Conflict severity evaluated (high/medium/low/none)
- detected_signals populated when evidence exists in PDFs/URL
- api_cost_tracked fires

Deploy. Tell me when Feature 3 is complete.
```

### Stage 5 — Feature 4 (7-Q Wizard with conflict disclosure)

```
Execute Feature 4 from clearpath_build_plan.md (now includes wizard 
conflict changes v2).

Read:
1. clearpath_build_plan.md §4 (includes §4.0 conflict disclosure)
2. clearpath_copy_scope.md §4.0 and §4.1-4.8 (wizard copy)
3. clearpath_screens_spec.md Screen 5.0 (conflict card) and Screen 5 
   (wizard layout)

Build:
- 7-Q wizard at /wizard/{assessment_id}/q{N}
- Teal progress stepper
- Partial state saves on every Next click (so drop-off → resume works)
- Q2 follow-up logic (if answer is 'informs_only' and scrape/PDFs show 
  decision-support language)
- Back/Next navigation preserving state

NEW: Conditional conflict disclosure card on Q1 only:
- Renders if meta.conflict_detected === true AND severity in 
  ['high', 'medium'] AND conflict_acknowledged !== true
- Shows two-column comparison (one-liner vs PDFs)
- Two CTAs: "← Edit my description" and "Continue to questions →"
- "Edit" redirects to /start?resume={id} with fields pre-filled
- "Continue" sets meta.conflict_acknowledged = true, shows Q1
- Does NOT re-render on back-navigation from Q2/Q3 → Q1
- Does NOT render for severity 'low' or 'none'

Edit re-flow (Option 3a):
- /start?resume={id} loads existing assessment, pre-fills form
- On submit, updates SAME assessment_id (no new row)
- Re-runs Feature 3 pre-router
- Redirects back to /wizard/{id}/q1
- If conflict still high/medium, card re-renders with "Still a mismatch" 
  heading

Events:
- wizard_step_completed { step_number, time_on_step }
- wizard_completed { product_type, time_total, answers }
- wizard_conflict_shown { severity, authority_used }
- wizard_conflict_continued { severity }
- wizard_conflict_edit_clicked { severity }
- wizard_conflict_reappeared { severity, edit_attempt_count }

Test cases:
1. No conflict → card doesn't render, Q1 shows immediately
2. Low severity → card doesn't render
3. High severity → card renders on Q1
4. Click Continue → card disappears, Q1 shows, back-nav doesn't re-show
5. Click Edit → redirect to /start?resume, fields pre-filled
6. Edit resolves → return to wizard, no card
7. Edit persists → card re-renders with "Still a mismatch"

Exit criteria: all 7 test cases pass, partial save works, Q2 follow-up 
triggers correctly.

Deploy. Tell me when Feature 4 is complete.
```

### Stage 6 — Feature 5 (Synthesizer + Readiness Card)

```
Execute Feature 5 from clearpath_build_plan.md (now includes Tier 2 CTA 
framing from v1 changes and gap templates from v3 changes).

Read:
1. clearpath_build_plan.md §5 (synthesizer spec)
2. clearpath_engine_spec_v3.md (classification logic)
3. clearpath_regulations.md (9-reg reference for cached prompt)
4. clearpath_output_schemas.md (Tier 0 JSON schema)
5. clearpath_screens_spec.md Screen 6 (Readiness Card layout)
6. clearpath_copy_scope.md §5 (card copy) and §6.0.5 (Tier 2 CTA block) 
   and §5.5a (gap templates)
7. clearpath_timeline_model.md (timeline math for cards)
8. SKILL.md §1 (softenCertainty utility)

Build:
- Readiness card cache check (cache_key = sha256 of email + one_liner + 
  url + pdf_hashes + wizard_answers)
- Cache TTL: 30 days, version-gated by CACHE_VERSION env var
- If cache hit: redirect to /c/{existing_share_token}, fire 
  card_cache_hit event, NO API call
- If cache miss: Opus call with prompt caching

Opus call structure:
- Model: claude-opus-4-7
- System prompt (cached, ~8K tokens): 9 regulations + IMDRF matrix + 
  CDSCO SaMD draft + classification heuristics + calibration examples + 
  output schema + certainty rules
- User message (uncached, ~2K tokens): one-liner, URL content, PDF 
  summaries, wizard answers, detected_signals, conflict_details
- cache_control: 'ephemeral' on system prompt

Synthesizer uses detected_signals to compute gaps:
- If Class B/C/D and no ISO 13485 detected (high/medium confidence) → 
  HIGH gap: "ISO 13485 QMS not evidenced in provided materials"
- If Class B/C/D + software and no IEC 62304 detected → HIGH gap
- If IVD class and no NABL partnership detected → HIGH gap
- If product_type is hardware_software → add verdict line about state 
  FDA approval

Apply softenCertainty() to all user-visible text before saving.

Save to Supabase:
- readiness_card JSONB
- share_token (6-char slug)
- cache_key, cache_version
- status = 'completed'

Render /c/{share_token} per Screen 6:
- Readiness Card with risk-based background tint (coral/amber/green/gray)
- Readiness circle colored by score (0-3 coral, 4-6 amber, 7-10 green)
- 4-badge row (Risk, MD?, Class, Timeline)
- Verdict + Why regulated + Top 3 gaps + 9-reg snapshot + Timeline
- Share actions row (copy link, download PDF, email me)
- Tier 2 CTA block per §6.0.5 with four-pillar preview:
  * 📋 regulations · 📄 forms · 🗺 guide · ✍ drafted content
  * Primary CTA: "Get the Draft Pack — ₹499 →"
  * Secondary Tier 3 link (muted, smaller)
- OG image (Vercel OG) for proper preview on WhatsApp/LinkedIn

Events:
- card_generated { card_id, medical_device_status, cdsco_class, 
  readiness_score, risk_level, cache_hit: false }
- card_cache_hit { original_assessment_id, new_assessment_id }
- share_link_copied { card_id }
- tier2_cta_clicked { card_id, source: 'card_bottom' }
- tier3_cta_clicked { card_id, source: 'card_bottom' }
- api_cost_tracked { feature: 'synthesizer', model, tokens, cost, 
  cache_hit }

Test cases:
1. EkaScribe → Class B/C, risk high, readiness 4/10
2. CerviAI (conflict flagged from Feature 3) → Class C, risk high
3. HealthifyMe → wellness_carve_out, readiness null
4. Niramai → Class C IVD-SaMD, readiness 5/10
5. Cache hit: re-submit identical form → instant redirect, no API call

Exit criteria:
- End-to-end (intake → wizard → card) under 60s
- All 5 test cases pass
- Share URL with correct OG preview on WhatsApp + LinkedIn
- Mobile 375px works
- PostHog funnel 1→2→3 fires
- Tier 2 CTA block renders with four-pillar preview + Tier 3 secondary

Deploy. Tell me when Feature 5 is complete.
```

### Stage 7 — Feature 5.5 (Concierge waitlist)

```
Execute Feature 5.5 from clearpath_build_plan.md.

Read:
1. clearpath_build_plan.md §5.5
2. clearpath_copy_scope.md §5.5
3. clearpath_screens_spec.md Screen 10

Build:
- /concierge page with form (name, email, product name, CDSCO app 
  number, target date, context 200 words)
- Submit writes to tier3_waitlist table (status = 'waitlist')
- Confirmation screen
- Resend email to customer (confirmation) + to you (founder alert)

Event: concierge_waitlist_submitted { has_cdsco_number, 
days_until_target_date }

NO Razorpay integration for Tier 3 in MVP — manual follow-up.

Exit criteria:
- Form validates
- Row created in tier3_waitlist
- Both emails delivered
- Event fires

Deploy. Tell me when 5.5 is complete — this finishes Weekender scope.
```

### Stage 8 — Feature 6 (Razorpay + Draft Pack)

```
Execute Feature 6 from clearpath_build_plan.md.

Read:
1. clearpath_build_plan.md §6 (the entire feature spec)
2. clearpath_regulations.md (for static submission guide content)
3. clearpath_copy_scope.md §6.1 (upgrade page copy) and §6.4 (delivery 
   email)
4. clearpath_output_schemas.md (orders, tier2_draft_packs schemas)

Build in this order:

6a. CDSCO forms mirror
- Download MD-12, MD-9, MD-14 etc. from cdscomdonline.gov.in
- Upload to Supabase Storage cdsco-forms/
- Create lib/forms/form-index.ts with form metadata

6b. Static submission guide content
- Write lib/regulations/guides/*.md files (one per regulation)
- Build stitchSubmissionGuide function (string concatenation, NO Claude 
  call)

6c. /upgrade/{assessment_id} page
- Copy from §6.1 (full 11-item checklist)
- "Pay ₹499" button → Razorpay Payment Link

6d. Razorpay webhook /api/webhooks/razorpay
- Verify signature
- Update orders row (idempotent)
- Fire tier2_payment_completed PostHog event (SERVER-SIDE)
- Enqueue job to job_queue
- Return 200 in <5s

6e. Worker /api/jobs/generate-draft-pack + Vercel Cron (every minute)
- Pick up pending jobs
- Read assessment + readiness_card + wizard_answers from Supabase 
  (NO re-running earlier calls)
- ONE Opus call for Draft Pack content (with prompt caching)
- Render 3 PDFs via React-PDF:
  * Draft Pack (branded, with drafted content)
  * Submission Guide (stitched static content)
  * Forms ZIP (pre-bundled applicable CDSCO forms)
- Send email via Resend with 3 attachments
- Update orders.status = 'delivered'
- Retry 3x on failure, then mark 'failed'

6f. Draft Pack Opus call
- Model: claude-opus-4-7
- Cached system prompt (~8K tokens): templates + CDSCO format rules
- Uncached user message: readiness_card, wizard_answers, one_liner, 
  PDFs, URL content
- Output: Intended Use, Device Description, Risk Justification, Clinical 
  Context, Essential Principles, Algorithm Change Protocol (if AI)
- Apply softenCertainty()
- Fire api_cost_tracked event

6g. Post-payment loading screen /generating/{order_id}
- "Your pack is generating. We'll email you in ~10 minutes."

Events:
- tier2_cta_clicked { card_id, source } (client)
- tier2_payment_completed { ... } (SERVER from webhook)
- draft_pack_delivered { order_id, generation_time_ms } (server from 
  worker)
- api_cost_tracked { feature: 'draft_pack', ... }

Exit criteria:
- Webhook verifies signature, returns 200 in <5s
- Worker picks up job within 2 minutes
- Draft Pack delivered within 10 minutes of payment
- Email has 3 valid attachments
- Order status updates correctly
- tier2_payment_completed fires server-side

Before deploying, top up Anthropic API credits to at least $75 so 
production engine calls don't fail.

Deploy. Tell me when Feature 6 is complete.
```

---

## Step 4 — Verification after each stage

After each stage, run these checks before moving to the next:

1. **Vercel deployment succeeded** — check vercel.com dashboard, latest deployment green
2. **PostHog events firing** — check eu.posthog.com → Activity → Live Events for expected event names
3. **Supabase data correct** — check app.supabase.com → Tables → query for expected rows
4. **Manual smoke test** — click through the flow as a user would
5. **Mobile check** — resize browser to 375px, verify layout works

---

## Step 5 — When something goes wrong

If Claude Code gets stuck or produces broken output:

**First**, check if it read the right doc. Ask:
> *"Which spec doc did you reference for this feature? Read it again and compare your implementation against the exit criteria."*

**Second**, if it's drifting from the spec, constrain it:
> *"Only make the minimum change needed to match the spec in clearpath_build_plan.md §X. Don't add features. Don't modify unrelated code."*

**Third**, if it keeps adding complexity, force simplification:
> *"Remove all code you added that isn't strictly required by the exit criteria. Show me a diff of what you kept vs what you removed."*

---

## Step 6 — What to send me when a feature is done

Paste:
1. Git commit hash of the deploy
2. Vercel deployment URL
3. Any test case output (e.g. for Feature 3, the 5 calibration results)
4. PostHog screenshot showing expected events firing

I'll verify against the spec and either green-light the next stage or give specific fixes.

---

## Stage complete checklist

- [ ] Stage 0 — Patches applied (3 change logs)
- [ ] Stage 1 — Feature 0 POC verified
- [ ] Stage 2 — Feature 1 Landing live
- [ ] Stage 3 — Feature 2 Intake working
- [ ] Stage 4 — Feature 3 Pre-router calibrated
- [ ] Stage 5 — Feature 4 Wizard with conflict flow
- [ ] Stage 6 — Feature 5 Synthesizer + Card shipping
- [ ] Stage 7 — Feature 5.5 Concierge waitlist (end of Weekender target)
- [ ] Stage 8 — Feature 6 Razorpay + Draft Pack (May 2 target)

---

## Summary of all 23 files

**Core execution docs (read every session):**
1. CLAUDE.md (rename of README.md)
2. SKILL.md
3. clearpath_build_plan.md

**Specification docs (reference as needed):**
4. clearpath_engine_spec_v3.md
5. clearpath_regulations.md
6. clearpath_output_schemas.md
7. clearpath_screens_spec.md
8. clearpath_user_journeys.md
9. clearpath_landing_copy.md
10. clearpath_posthog_events.md
11. clearpath_pricing_and_market_strategy.md
12. clearpath_timeline_model.md

**Change logs (apply first, then resume build):**
13. clearpath_tier2_cta_changes.md (v1)
14. clearpath_wizard_conflict_changes.md (v2)
15. clearpath_intake_signals_changes.md (v3)

**Landing-specific:**
16. clearpath_landing_changes.md (for existing deployed version)

**Visual references (don't read, use when prompted):**
17. ClearPath_Deck.pptx (slide 9 = Readiness Card visual)
18. ClearPath_Risk_Matrix.xlsx (15-startup calibration)
19. clearpath_founder_journey.jpg (6-step journey image)

**Phase 2 / deferred (don't read now):**
20. clearpath_decomposer_spec.md
21. clearpath_build_scope.md (superseded)
22. clearpath_landing_page_questions.md (decisions made)
23. clearpath_engine_spec_v2.md (superseded by v3, can delete)

---

## Final words

You've made every substantive decision. The specs are locked. Everything 
Claude Code needs is in these docs. Your job is to:

1. Hand this master instruction to Claude Code
2. Run the 8 staged instructions one at a time
3. Verify each stage before moving on
4. Ship by April 27 (Weekender goal): Stages 0-7 complete

Feature 6 lands April 28 – May 2. Phase 2 lands May 3-15.

Ship it.
