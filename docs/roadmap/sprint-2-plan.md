# Sprint 2 Plan — Draft Pack Upgrade + Tier 2 Setup

**Duration:** 2 weeks (May 11 - May 24, 2026)
**Sprint goal:** Ship upgraded Draft Pack experience (sectioned + editable + citations) per investor deck mockup. Add customer auth. Polish cdsco-reviewer-tool for upcoming demos. Set up Tier 2 demand capture.

---

## Locked decisions (2026-05-10)

- **Pricing model:** 3 customer-facing tiers, deck-aligned
  - Tier 0 — Risk Card (Free)
  - Tier 1 — Draft Pack (Sprint 2: ₹499 production · Sprint 3 target: ₹4,999 list / ₹2,499 launch — see `pricing-strategy-v1.md`)
  - Tier 2 — Reviewer Concierge (₹75,000) — Sprint 3 launch, Sprint 2 captures demand
- **Architecture:** clearpath (consumer + expert flow) and cdsco-reviewer-tool (regulator tool) stay separate repos
- **Auth:** Email + password, gated at Risk-Card-to-Draft-Pack transition
- **Mockups:** investor deck pages 1-4 are the design target for Story 2.5
- **Tier 3-5:** Institute/Pharma/Regulator — deck-level scope, NOT customer-facing in Sprint 2-4

Reference docs:
- `docs/roadmap/pricing-strategy-v1.md`
- Investor deck (clearpath_deck) — slides 3, 4, 7 for tier structure
- Journey mockup (clearpath_journey) — pages 1-4 for UX target

---

## Sprint 2 stories (8 stories, priority order)

### Story 2.0 — Reviewer tool polish (cdsco-reviewer-tool repo)

**Priority:** Highest. Demo-blocking.
**Repo:** `~/my-weekender-project/cdsco-reviewer-tool/`
**Effort:** 1.5 days

**Scope:**
1. Three-tab evaluation lifecycle UI per application:
   - Tab 1 — TL;DR (device name, company, applied class, AI summary)
   - Tab 2 — Document review (completion %, summary, drilldown)
   - Tab 3 — Decision + thread (approve/reject/query, comment thread)
2. Home page (queue) enhancements:
   - Per-row data: device name, 1-line description, applied class, completion %
   - Ctrl+select for bulk auto-approve

**Execution sequence:**
1. Pull latest cdsco-reviewer-tool, verify build is clean locally
2. Deploy current state as baseline (rollback point)
3. Make polish changes (3-tab + queue enhancements)
4. Deploy polished version
5. Smoke test on preview URL

**Acceptance:**
- Baseline deploys cleanly before polish work begins
- Polished version demo-ready by Mon May 11 morning IST for IndiaAI demo
- Existing engine/data layer untouched
- 3-4 screenshots of new UI confirmed

**Dependencies:** None — runs parallel to clearpath work

---

### Story 2.1 — Pricing strategy reconciliation (docs only) [REVISED 2026-05-11]

**Priority:** High. Unblocks Sprint 3 pricing change.
**Effort:** 0.5 day

**Why scope changed:** Original Story 2.1 assumed ₹4,999 baseline and Cashfree integration. Audit on 2026-05-11 found production is at ₹499 with manual UPI payment proof flow (no Cashfree in `clearpath` repo). Bare price change without product upgrade was rejected — price increase will ship with the sectioned/editable Draft Pack in Sprint 3.

**Scope:**
- Update `docs/roadmap/pricing-strategy-v1.md` to reflect actual production state (₹499) vs target launch pricing (₹4,999/₹2,499)
- Add "Production vs target pricing" transition plan
- Update Tier 1 section with current state / target state / migration triggers
- Defer Tier 1 launch pricing change to Sprint 3, alongside upgraded Draft Pack ship
- Update revenue projections to reflect ₹499 baseline for Sprint 2
- Add note in resolved decisions log
- **No code changes in `clearpath` repo. Production pricing stays at ₹499.**

**Acceptance:**
- `pricing-strategy-v1.md` reflects two-phase pricing reality
- `sprint-2-plan.md` Story 2.1 + Sprint 3 outline reflect deferred change
- Resolved decisions log updated with the discovery and decision
- Zero `clearpath` app code changes

---

### Story 2.2 — Customer authentication (clearpath repo)

**Priority:** High. Blocks Story 2.5.
**Effort:** 1.5-2 days

**Scope:**
- Email + password signup flow
- Login flow
- Session management via Supabase Auth (existing infra)
- Password reset flow (forgot password → email → reset link)
- Customer dashboard at `/dashboard`:
  - List of submissions (Risk Cards generated, Draft Packs purchased)
  - Quick links to view/edit each
- Auth gate placement:
  - Risk Card flow: NO auth (email-gated only)
  - Click "Generate Draft Pack" → auth required (signup if new, login if existing)
  - Post-purchase: customer lands on Draft Pack experience
  - Returning customer: dashboard shows their work in progress
- Logout flow

**Acceptance:**
- New customer can signup → pay → access Draft Pack
- Returning customer logs in → sees dashboard → resumes Draft Pack
- Password reset works end-to-end
- Sessions persist (no re-login per visit)
- Mobile + desktop tested

**Dependencies:** Story 2.1 (pricing reconciliation docs)

---

### Story 2.3 — Schema for upgraded Draft Pack (clearpath repo)

**Priority:** High. Foundational for Story 2.5.
**Effort:** 1 day

**Scope:**
- New tables for sectioned Draft Pack:
  - `draft_pack_sections` — per-order section content (12 sections per CDSCO MDR)
  - `draft_pack_citations` — source references with quotes, doc refs, IDs
  - `draft_pack_predicates` — predicate device matches per order
- Migration file `supabase/migration-story-2-3-draft-pack-sections.sql`
- Validator script `scripts/validate-draft-pack-schema.ts`
- RLS policies (customer reads own, admin writes via service)

**Acceptance:**
- Migration applies cleanly to Supabase
- All 3 tables created with FKs
- Validator confirms schema integrity
- No regressions on existing Sprint 1 schema

**Dependencies:** None — runs parallel to Story 2.2

---

### Story 2.4 — Reviewer customer-flow reconnaissance

**Priority:** Medium. Prep for Story 2.5.
**Effort:** 1 day

**Scope:**
- Read cdsco-reviewer-tool repo's customer flow code
- Document `docs/decisions/2026-05-XX-reviewer-port-strategy.md`:
  - What customer-facing components exist (predicate finder, doc generation, section editor)
  - Section structure and naming conventions
  - Schema mapping between reviewer-repo and clearpath
  - List of files/components to port for Story 2.5
- Question set comparison: customer-flow vs. reviewer-flow questions; unify
- No code changes — pure reconnaissance

**Acceptance:**
- Decision doc committed
- Port plan clear enough for Story 2.5 to execute
- Founder reviews and approves port strategy
- Question unification approach documented for Sprint 3

**Dependencies:** Story 2.0 substantially done

---

### Story 2.5 — Upgraded Draft Pack experience (clearpath repo) [KEYSTONE]

**Priority:** Highest in Week 2. Core Sprint 2 deliverable.
**Effort:** 4-5 days

**Scope (per investor journey deck mockup page 3):**
- Section-based Draft Pack web view:
  - 12-section sidebar (Device Description, Intended Use, Classification Justification, Predicate Comparison, Risk Management, Clinical Evidence, Software Lifecycle, Cybersecurity Plan, Labeling, plus 3 more per CDSCO MDR)
  - Per-section editable content (proper UI, NOT .md files)
  - AI-generated baseline content per section using existing engine
  - Citation-traceable references with [1] [2] inline
  - Citation cards (right panel): source quote, document reference, exact citation ID
  - "Last regenerated 2 min ago" timestamp
- Predicate finding flow (port from reviewer repo via Story 2.4):
  - AI surfaces 3-5 predicate device matches with rationales
  - Customer selects primary predicate
  - Selection persists, drives Section 4 content
- PDF download option from sectioned view
- Save state per section, resume later
- Section completion % visible
- Header navigation: Readiness · Drafts · Reviews · Filings (per mockup)

**Acceptance:**
- Existing Tier 1 customers post-payment see sectioned view (not just PDF)
- All 12 sections render with AI-generated baseline content
- All fields editable, save state works
- Citations clickable, source visible in right panel
- PDF download produces same content as web view
- 5 demo cases tested end-to-end

**Dependencies:** Story 2.2 (auth), Story 2.3 (schema), Story 2.4 (port plan)

**Why this matters:** This is the product upgrade that justifies ₹4,999 list price. Sprint 2's headline deliverable.

---

### Story 2.6 — Tier 2 Coming Soon + demand capture (clearpath repo)

**Priority:** Medium. Sets up Sprint 3 launch.
**Effort:** 0.5 day

**Scope:**
- Upgrade page adds Tier 2 Reviewer Concierge card:
  - "Tier 2 — AI + Senior Reviewer Concierge — ₹75,000"
  - Description from deck
  - "Request Early Access" CTA → email capture form
- Form captures: name, email, device description, urgency
- Stored in Supabase `tier2_early_access` table
- Email notification to founder for new submissions
- Auto-confirmation email to customer

**Acceptance:**
- Tier 2 visible on upgrade page with clear "Coming Soon" framing
- Form submits and persists
- Founder gets notified per submission
- Customer gets auto-confirmation

---

### Story 2.7 — Disclaimer / ToU / legal (clearpath repo)

**Priority:** Medium. Required before paying customers grow.
**Effort:** 0.5 day

**Scope:**
- Disclaimer text on Risk Card output
- Disclaimer in Draft Pack PDF cover page
- Disclaimer in sectioned Draft Pack web view (footer per page)
- ToU page at `/terms` (founder-drafted v1)
- Privacy Policy page at `/privacy` (DPDP-compliant baseline)
- Footer links from all consumer-facing pages

**Acceptance:**
- All output artifacts carry disclaimer
- /terms and /privacy render
- Footer links present
- Founder reviewed for legal-defensibility

**Dependencies:** None

---

## Sprint 2 timeline

```
Week 1 (May 11-17)
Sun May 10: Plan locks. Story 2.0 starts (afternoon).
Mon May 11: Story 2.0 polish + IndiaAI demo. Story 2.1 (parallel).
Tue May 12: Story 2.1 done. Story 2.2 (auth) + 2.6 start.
Wed May 13: Story 2.2 + 2.3 + 2.4 in parallel. Venture Center demo.
Thu May 14: Story 2.2 + 2.3 done. Story 2.4 done. IKP + applicant demos.
Fri May 15: Story 2.7 (legal) done. Buffer.
Sat-Sun:    Buffer.

Week 2 (May 18-24)
Mon May 18: Story 2.5 starts.
Tue May 19: Story 2.5 continues.
Wed May 20: Story 2.5 continues.
Thu May 21: Story 2.5 continues.
Fri May 22: Story 2.5 done. Smoke test.
Sat May 23: Buffer / Sprint 2 wrap.
Sun May 24: Sprint 2 retrospective. Sprint 3 planning.
```

**Total: ~10-11 productive days across 14 calendar days.**

**Risk: 3 demos eat 1-1.5 days. Story 2.5 (keystone) gets priority — slip Story 2.6/2.7 first if needed, never Story 2.5.**

---

## What ships at end of Sprint 2

**On clearpath-medtech.vercel.app:**
1. Pricing strategy reconciled in docs — production stays at ₹499; target launch pricing (₹4,999/₹2,499) deferred to Sprint 3 alongside upgraded Draft Pack. Tier 2 ₹75K Coming Soon.
2. Customer authentication (email + password, dashboard, password reset)
3. Upgraded Draft Pack experience — sectioned, editable, citation-traceable per mockup
4. Tier 2 demand signal capture — early access form
5. Legal foundation — disclaimer, ToU, Privacy Policy

**On cdsco-reviewer-tool:**
6. Reviewer tool polished — 3-tab evaluation lifecycle + enhanced queue
7. Demo-ready for IndiaAI (Mon), Venture Center (Wed), CDSCO

**Not shipped (Sprint 3):**
- Tier 2 Reviewer Concierge actual product build
- Cashfree integration for Tier 2 ₹75K
- Expert recruitment + onboarding
- Question unification across customer + expert flows
- Mobile responsive across all flows

---

## Sprint 3-6 outline

### Sprint 3 (May 25 - Jun 7) — Tier 1 launch pricing + Tier 2 Reviewer Concierge launch
- **Tier 1 launch pricing change** (₹499 → ₹4,999 list / ₹2,499 effective) shipped alongside upgraded Draft Pack
- Cashfree integration for Tier 1 (₹2,499) + Tier 2 (₹75K) — replaces UPI payment proof flow
- Build Tier 2 experience per mockup page 4 (named reviewer bench, engagement timeline, maker-checker)
- Expert recruitment + onboarding
- First 2-3 paying Tier 2 customers
- Question unification
- Existing ₹499 customers tagged in DB for Tier 2 upgrade discount

### Sprint 4 (Jun 8 - Jun 21) — Polish + scaling
- Mobile responsive Tier 1 + Tier 2
- Custom expert login (replace Basic Auth)
- Lawyer-reviewed ToU + Privacy v2
- Real-data calibration
- Sprint 1 backlog: cache audit, eval pipeline parity

### Sprint 5 (Jun 22 - Jul 5) — B2B foundations
- Tier 3 Institute/Incubator framework
- Singapore expansion prep (NTU → JUMPstart)
- Pricing iteration based on Tier 1 + Tier 2 actuals

### Sprint 6 (Jul 6 - Jul 19) — IndiaAI outcome dependent
- IF CDSCO awards: cdsco-reviewer-tool full build
- IF not: Tier 2 customer growth + Tier 3 sales motion

---

## Backlog inherited from Sprint 1

1. Cache-hit telemetry visibility — Sprint 4
2. Audit readiness-card cache behavior — Sprint 5
3. Re-add draft-pack caching when prompt grows past 1024 tokens — Sprint 6+
4. Eval pipeline production parity — Sprint 4
5. Eval variance reduction — Sprint 6+
6. Calibration coverage gaps TRL 3 + TRL 9 — Sprint 6+
7. Founder-authored TRL cases — Sprint 6+
8. Re-label 50-case set with regulatory advisor — Sprint 6+
9. Hybrid LLM + classical ML architecture — Sprint 8+
10. Strict/tolerant gap pattern — Sprint 6+
11. Engine output `or_acceptable` array — Sprint 5+
12. Cost-policy doc update with eval actuals — Sprint 3
13. /admin/costs date format docs — Sprint 4
14. Full 50-case eval discipline — process
15. Smoke test checklist accuracy review — Sprint 2 stretch

---

## Sprint 2 success criteria

Sprint 2 closes successfully when:

1. cdsco-reviewer-tool polished and demo-ready
2. Customer auth (email + password) live
3. Upgraded Draft Pack experience live — sectioned, editable, citation-traceable
4. Pricing strategy reconciled in docs (price change deferred to Sprint 3)
5. Tier 2 Coming Soon + demand capture live
6. Disclaimer/ToU live
7. Sprint 2 retrospective documented

**Story 2.5 is non-negotiable.** Story 2.0 is non-negotiable for demos. Story 2.2 is non-negotiable as Story 2.5 prerequisite. Slip Stories 2.6/2.7 if needed.
