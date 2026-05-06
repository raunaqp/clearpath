# ClearPath Sprint Plan

**Last updated:** May 6, 2026
**Founder:** Raunaq Pradhan (raunaq@artpark.in)
**Velocity assumption:** ~3 productive engineering days/week (solo founder)
**Sprint length:** 2 weeks (~6 productive days each)
**Total runway covered:** 12 weeks / 6 sprints

---

## Strategic context

- YC application: submitted (no longer optimization deadline)
- Founder runway: ₹2L/month opportunity cost over 3 years; bear-case exit beats this
- Investability verdict: seed/angel/RBF tier (not Sequoia-tier); India-first, FDA/EU expansion in year 2
- Legal: ship and accept risk; rely on disclaimers and ToU. Documented in `docs/decisions/2026-05-06-legal-risk-acceptance.md`
- Strategic moat (per advisor feedback): clinical trial readiness + experts in team, then DPDP expansion

## Hard constraints (every sprint)

1. No prod deploys without preview smoke test green first.
2. No restructuring pricing further without 5-10 founder + 3-5 incubator conversations validating new numbers.
3. **Cost discipline per `docs/model-and-cost-policy.md`** — that doc is the single source of truth for which Claude model goes where, exact API IDs, prompt caching strategy, max_tokens caps, and cost calculation. Reference it before any Anthropic API code change.
4. No code changes after midnight.
5. Eval bar: ≥90% on cdsco_class accuracy across 35-case calibration set before any production accuracy claim.

---

## Pricing structure (locked May 6, 2026)

| Tier | Price | Rollout |
|---|---|---|
| Tier 0 — Free Risk Card | ₹0 | Live |
| Tier 1 — Self-serve Draft Pack | ₹4,999 (was ₹499) | Sprint 3 |
| Tier 2 — Filled forms + expert review | ₹50K-1L per filing (B/C/D scaled) | Sprint 5 |
| Tier 3 — Annual subscription | ₹50K-1L tiered to filings count | Sprint 6 validation, Sprint 7 rollout |
| Tier 4a — Incubator partner (regulator provided) | ~₹3-10L/year | Sprint 4 conversation |
| Tier 4b — B2B pharma/medtech enterprise | ~₹15-50L/year | Sprint 4 conversation |

**Validation gate before Tier 3/4 lock:** ≥10 paying Tier 1 customers + 3 partner conversations.

---

## Draft Pack restructuring (Sprint 2)

### Cut from main body → move to appendix
- Section 04 extended regulatory landscape narrative
- Repeat CDSCO classification tables
- Generic "why this matters" framing duplicated across sections
- Long timeline narrative (replaced by phase-visual roadmap)

### Keep / restructure in main body
- Section 1: Risk Card (1 page, same as Tier 0)
- Section 2: Filing Roadmap (phased: Foundation → Pre-clinical → Clinical → License → Post-market, with forms + partners + templates per phase)
- Section 3: Forms (sample forms with sample text in Tier 1; filled forms in Tier 2 from Sprint 5)
- Section 4: Templates (CIP outline, ACP, DPIA, predicate analysis memo, intended use)
- Section 5: Partner Directory (shell in Sprint 2, populated Sprint 5)
- Section 6: Cost & Timeline Worksheet (gov fees + partner ranges + ClearPath fees)
- "What CDSCO provides for free" callout

### Appendix
- Full regulatory narratives moved here
- Class-specific deep-dives, DPDP/ABDM/ICMR detail, glossary, references

---

## Strategic decisions (locked)

- Tier 2 stays narrative + forms (not consultant-replacement form-only)
- Tier 3 stays expert-review-first (regulator + clinician + scientific expert)
- ClearPath = customer-facing; CDSCO Reviewer Tool = back-office QA powering Concierge
- Clinical trial moat priority over DPDP breadth until Sprint 6+
- Solo founder; advisor recruitment by Sprint 6

---

# SPRINT 1 — Foundation (Weeks 1-2, ~6 productive days)

**Theme:** Fix prod, calibrate engine, optimize cost.
**Sprint goal:** Demo on production with confidence; costs tracked; engine ≥90% on calibration.

## Stories

### 1.1 Polling architecture for Draft Pack generation (1.5 days)

**Why:** Vercel Hobby has 60s function timeout. Opus Draft Pack takes 60-90s. Currently times out on prod.

**Approach:**
- Modal handles the heavy job (existing modal-services repo, no Vercel timeout, ~$5/month at low volume)
- API endpoint queues Modal job, returns assessment_id immediately
- Frontend uses Supabase realtime on `assessments` table, watches `draft_pack_url` field
- UX: "Generating your pack — typically 60 seconds" with progress feedback
- Error handling: surface Modal job failures on UI

**Acceptance:**
- [ ] Draft Pack generates without 504 timeout on Vercel preview
- [ ] User sees progress feedback (not silent spinner)
- [ ] Failure visible to user, not silent
- [ ] Modal cost <$10 for first 100 generations

**Risk:** Modal cold-start may take >1.5 days. Fallback: extend to 2 days, slip 1.6 GST application to founder personal time.

---

### 1.2 Model rightsizing + prompt caching (1.5 days, was 1 day)

**Authoritative reference:** `docs/model-and-cost-policy.md` (Section 1, 3, 4, 8). All exact model IDs, API parameters, caching code templates, and migration checklist live there.

**Why:** Currently running Opus 4.7 everywhere. Per-assessment cost can drop **75-85%** with model rightsizing **plus** prompt caching (was previously estimated 60-75% with model rightsizing alone — caching adds another ~50%).

**Summary of targets:**
| Task | Current | New | API ID |
|---|---|---|---|
| Pre-router | Opus 4.7 | Haiku 4.5 | `claude-haiku-4-5-20251001` |
| Synthesizer | Opus 4.7 | Sonnet 4.6 | `claude-sonnet-4-6` |
| Draft Pack | Opus 4.7 | Sonnet 4.6 | `claude-sonnet-4-6` |
| Form-fill (Sprint 5) | TBD | Opus 4.7 | `claude-opus-4-7` |

**Approach (full checklist in model-and-cost-policy.md Section 8):**
- Verify `@anthropic-ai/sdk` version ≥0.30.0
- Update model strings per cost-policy
- **Add prompt caching** to synthesizer + draft-pack system blocks (NOT pre-router — too small to matter)
- Set explicit `max_tokens` caps per call site (defense against runaway cost)
- Set `temperature: 0` for pre-router and form-fill, `0.3` for narrative
- A/B test each switch with 5-10 cases before locking in (calibration data already exists)
- If Sonnet quality on Draft Pack insufficient, revert to Opus 4.7 for Draft Pack only

**Acceptance (updated 2026-05-07 post-eval — see `docs/sprint-recaps/sprint-1.md` for evidence):**
- [x] Locked stack: pre-router → Haiku 4.5; synthesizer stays Opus 4.7 (eval-validated revert from Sonnet candidate); draft-pack → Sonnet 4.6. **Stack: Haiku/Opus/Sonnet** (NOT the originally planned Haiku/Sonnet/Sonnet — Sonnet failed accuracy bar on synth).
- [x] **Per-assessment cost (free tier): ~$0.12 actual** (Haiku pre-router ~$0.002 + Opus synth ~$0.118). Original target of ~$0.017 assumed Sonnet on synth + caching; that path failed eval. $0.12 is the new floor for the locked stack.
- [x] **Per-assessment cost (Tier 1): ~$0.18 actual** (free tier + Sonnet draft-pack with caching). 99.7% gross margin at ₹4,999. Healthy.
- [ ] Cache hit rate >40% visible in `/admin/costs` (deferred to Story 1.4)
- [x] Eval scores: 13/13 pre-router match, 8/10 synth match (Sonnet candidate failed 9/10 bar → reverted), 5/5 draft-pack match on rerun with Opus-synth input.
- [x] Draft Pack quality maintained — manual prose review on 5 cases passed; CP-016 wellness carry-over case explicitly verified (both Opus-DP and Sonnet-DP acknowledged wellness positioning, picked Class A as conservative anchor with explicit caveat — neither invented an inappropriate Class B).
- [x] `max_tokens` caps in code: pre-router 2000, synth 4000, draft-pack 8000. Cost-policy Section 4 says 1024/4096/16384 — deviations documented in sprint-1 recap (pre-router needs >1024 for structured signals; draft-pack 8000 was eval-validated, raising to 16384 deferred unless we hit the cap).
- [x] `lib/engine/opus-cost.ts` corrected to Opus 4.7 rates (was holding Opus 4.x rates, 3× inflated). Forward telemetry now accurate. Historical Opus telemetry pre-commit is unreliable.
- [ ] `docs/model-and-cost-policy.md` Section 1 + Section 5 updates (separate backlog: pre-router doesn't output cdsco_class; synth medians are ~2× low).

---

### 1.3 35-case eval and prompt tuning to ≥90% (2 days, may bleed)

**Authoritative reference for cost optimization:** `docs/model-and-cost-policy.md` Section 9 — "Don't use Batch API for user-facing requests, but DO use it for nightly evals and prompt-tuning iteration cycles."

**Why:** Eval bar set at 90% on cdsco_class. Currently calibrated against 4 cases. 35 more cases exist; need to be wired into eval pipeline and synthesizer tested against all.

**Approach:**
- Build eval runner: `scripts/run-eval.ts` (reads `data/calibration/clearpath_additional_35_with_trl.json`, runs each through pre-router + synthesizer, dumps results)
- **Use Batch API for eval runs** — 50% cheaper, 24h SLA acceptable for nightly iteration
- Manual scoring rubric:
  - cdsco_class accuracy (target: 90%+)
  - regulation verdicts accuracy (target: 80%+)
  - gaps reasonable (target: 80%+ subjective)
  - TRL reasonable (target: 80%+ subjective)
- Iterate `lib/engine/synthesizer-system-prompt.ts` 3-7 cycles
- Output artifact: `data/eval/run-001.json` with scores + improvements log
- Lock prompt only after 90% on cdsco_class

**Acceptance:**
- [ ] All 39 cases (35 new + 4 calibration) score against expected outputs
- [ ] cdsco_class accuracy ≥90%
- [ ] Eval script committed and re-runnable
- [ ] Improvements log in `data/eval/improvements-log.md`

**Risk:** May need 3-4 days. If so, slip 1.4 cost-tracking dashboard polish to Sprint 2.

---

### 1.4 Cost tracking infrastructure (0.5 day)

**Authoritative reference:** `docs/model-and-cost-policy.md` Section 6 — contains exact migration SQL, `cost-calculator.ts` utility code, and dashboard requirements.

**Why:** Need per-assessment cost rollup for engineering decisions and future investor narrative.

**Approach (full schema in cost-policy Section 6):**
- Add columns to `assessments` table: synthesizer + draft_pack input/output/cache_read/cache_write tokens, costs in USD, generated total_cost_usd
- Implement `lib/engine/cost-calculator.ts` per cost-policy Section 6 template
- Wire cost capture into each Anthropic call (token usage in API response includes cache fields)
- Build `/admin/costs` page (admin-only, private):
  - Today's spend
  - 30-day trend (line chart)
  - Per-model breakdown (Haiku vs Sonnet vs Opus split)
  - Cache effectiveness (cache_read / total_input — target: >40%)
  - Per-assessment table (last 50, sortable)
  - Cost per Tier (avg cost per Tier 0, 1, 2)

**Acceptance:**
- [ ] `/admin/costs` exists, gated behind ADMIN_PASSWORD
- [ ] Per-assessment costs visible (sortable)
- [ ] Daily aggregate chart functional
- [ ] Cache effectiveness metric visible
- [ ] Per-model breakdown matches expected (Haiku < Sonnet < Opus spend)

---

### 1.5 Production deploy (0.5 day)

**Why:** Production runs `9716781` (synth-prompt commit pre-this-sprint). All recent work — TRL, regulations, expert-in-loop, document completeness — on `feat/trl-completion-card`, not in prod.

**Gate:** All of 1.1-1.4 complete and preview smoke test green.

**Approach:**
- Smoke test full flow on preview (4 demo packets, /regulations, /upgrade, admin)
- Merge `feat/trl-completion-card` → `main`
- Vercel auto-deploys
- Verify prod (same smoke test)

**Acceptance:**
- [ ] All 4 demo packets work end-to-end on prod
- [ ] /regulations renders with filter chips functional
- [ ] /upgrade renders with coral expert-in-loop block
- [ ] Draft Pack generation works on prod via polling

**Rollback:** If prod regression, revert last commit on main, redeploy.

---

### 1.6 GST application started (0.5 day, parallel founder task)

**Why:** Cashfree/Razorpay/Paytm all require GST. ~2 weeks for approval. Don't block Sprint 3 on this.

**Approach (founder, not engineering):**
- Apply at gst.gov.in
- Voluntary registration (services <₹20L threshold but will cross fast)
- 30-60 min online form
- Track approval status

**Acceptance:**
- [ ] Application submitted before end of Sprint 1
- [ ] Tracking number captured

---

## Sprint 1 exit criteria

- [ ] Prod runs `feat/trl-completion-card` cleanly
- [ ] Draft Pack generates without timeout
- [ ] Eval ≥90% cdsco_class accuracy
- [ ] Cost dashboard exists
- [ ] Per-assessment cost reduced 60%+ via model rightsizing
- [ ] GST application submitted

## Sprint 1 risks

- Eval may take 3-4 days (slip cost-dashboard polish to Sprint 2)
- Modal setup learning curve (slip GST to founder personal time)
- Sonnet quality on Draft Pack (revert to Opus if needed)

---

# SPRINT 2 — Draft Pack restructure + email + landing (Weeks 3-4)

**Theme:** Better product (Draft Pack IA), real email, refreshed landing.

## Stories

### 2.1 Draft Pack IA restructure (3 days)

**Approach:**
- Update `lib/engine/draft-pack-generator.ts` to new section structure (per Draft Pack section above)
- Sample forms include sample text from a similar product profile (e.g., AI scribe sample text for an AI scribe applicant)
- Sample forms NOT filled with founder's company data in Tier 1 (that's Tier 2 in Sprint 5)
- Multi-touchpoint framing: "covers your typical 4-6 CDSCO touchpoints per year" in Concierge copy

**Acceptance:**
- [ ] All 4 demo packets produce restructured PDF
- [ ] Cover page with product name, classification, key dates, 5-line exec summary
- [ ] Phased Filing Roadmap (Phase 1-5) visible
- [ ] Sample forms section shows form names + sample text
- [ ] Templates section with 5+ templates
- [ ] Cost worksheet renders with realistic ranges
- [ ] Appendix paginated, regulatory narratives moved fully out of main body

### 2.2 Resend domain verification (1 day)
- Verify domain in Resend
- SPF, DKIM, DMARC DNS records
- Test 5 email flows: intake confirmation, Risk Card ready, Tier 2 payment, Draft Pack ready, Concierge inquiry
- Check spam folder

### 2.3 Landing page copy refresh (1.5 days)
- Hero: TRL + 9 regulations explicit
- Tier ladder: free → ₹4,999 → ₹50K-1L
- Demo packets callout (4 sample products)
- "What CDSCO provides for free" trust block
- Multi-touchpoint Concierge framing
- CDSCO advisory note (free since Nov 2025) — trust signal

### 2.4 Disclaimer + ToU copy (0.5 day)
- /upgrade disclaimer block
- Draft Pack PDF cover footer
- Tier 2 receipt email when launched
- Documented in `docs/decisions/2026-05-06-legal-risk-acceptance.md`

## Sprint 2 exit criteria
- [ ] Restructured Draft Pack PDF in production
- [ ] Real email from your domain
- [ ] Landing reflects current product
- [ ] Disclaimers visible everywhere required

---

# SPRINT 3 — Pricing rollout + Cashfree (Weeks 5-6)

**Theme:** Real money, validated pricing.

## Stories

### 3.1 Pricing restructure rollout (1 day)
- Replace ₹499 → ₹4,999 across landing, /upgrade, Draft Pack PDF, emails, /faq
- Tier 2 ₹50K-1L visible
- Tier 3/4 still "coming soon"

### 3.2 Cashfree integration (2 days, gated on GST)
- Cashfree merchant account (founder, requires GST)
- Payment link generation API
- Replace manual upload flow on /upgrade
- Webhook for payment confirmation → triggers Modal Draft Pack generation
- First test payment

**Fallback if GST not approved by Sprint 3:** Skip Cashfree, do Sprint 4 work earlier. Reschedule Cashfree to Sprint 4.

### 3.3 Section cross-reference audit (0.5 day)
- Grep `Section \d+` patterns post-renumber
- Fix mismatches

### 3.4 "Demo:" prefix replacement (0.5 day)
- ProductName fallback uses packet metadata flow

### 3.5 Pricing validation conversations (0.5 day, founder)
- 5-10 founders + 3-5 incubators
- Output: `docs/research/pricing-conversations.md`

### 3.6 Buffer (1.5 days)

---

# SPRINT 4 — Mobile + IA + B2B foundation (Weeks 7-8)

**Theme:** Mobile-friendly, /faq IA, partner-ready architecture.

## Stories

### 4.1 Responsive UI on top 5 pages (2 days)
- Landing, /start, Risk Card, /faq, /upgrade

### 4.2 /faq with sections — Model A (1 day)
- Migrate /regulations content into /faq?section=regulations
- Add About, How it works, Pricing sections

### 4.3 Tab/chip design polish (0.5 day)

### 4.4 PostHog real token + funnel events (1 day)
- intake submitted → wizard complete → card view → upgrade click → payment intent

### 4.5 B2B partner login + roles infrastructure (1.5 days)
- Supabase Auth: founder, partner, regulator_qc, admin roles
- Partner-only routes shell

---

# SPRINT 5 — Form-fill MVP + Partner Directory (Weeks 9-10)

**Theme:** Tier 2 unlocked. Filled forms ship. Partner directory live.

## Stories

### 5.1 Form-fill engine (2.5 days)
- Port templates from cdsco-reviewer-tool repo
- MD-3, MD-7, MD-12 first
- **Use Opus 4.7** (`claude-opus-4-7`) per `docs/model-and-cost-policy.md` Section 1
- Add prompt caching for form templates per cost-policy Section 3 ("Form-fill" subsection)
- `temperature: 0` (regulatory paperwork must be deterministic), `max_tokens: 4096` per form

### 5.2 Form-fill UX in markdown editor (1.5 days)
- Edit-in-place, save draft, export PDF

### 5.3 Form-fill eval (1 day)
- 10 test cases, 95%+ field accuracy on company-data
- Hard gate before Tier 2 launch

### 5.4 Partner Directory population (0.5 day)
- 5 ISO 13485 cert bodies (BSI, TÜV, BVQI, etc.)
- 8-10 NABL labs by city
- 6-8 clinical sites by therapeutic area
- 3-5 CRO services
- Wire into Draft Pack Section 5

### 5.5 Tier 2 launch (₹50K-1L per filing)
- A/B with Tier 1 conversions

### 5.6 Buffer (0.5 day)

---

# SPRINT 6 — Tier 3/4 validation + Concierge productization (Weeks 11-12)

## Stories

### 6.1 Tier 3 subscription validation (1 day)
- 3+ paid Tier 1 customers: "would you subscribe annually?"
- Lock final Tier 3 pricing

### 6.2 Tier 4 partner contracts (2 days)
- Tier 4a (incubator with regulator): pilot ARTPARK or IKP at ₹3-10L/year
- Tier 4b (B2B pharma/medtech): pilot at ₹15-50L/year
- Contract template draft

### 6.3 Concierge productization (1.5 days)
- Slack channel template per engagement
- Linear board template
- Form-fill SOP for regulatory team
- Onboarding doc for advisors (former CDSCO official, clinician, scientific expert)

### 6.4 Real production data calibration (1 day)
- Aggregate first 50+ paid orders
- Re-tune synth prompt with real founder data
- Update calibration JSON

### 6.5 Buffer (0.5 day)

---

## Backlog (post-Sprint 6, not committed)

- Demo packet expansion (5th packet with PDF upload, shows classification depth)
- Hindi UI
- Bulk batch upload for incubators
- AGENTS.md / CLAUDE.md cleanup
- AI Weekender folder reorg
- Tier 1 PDF redo (currently hidden)
- Mobile polish beyond triage
- Form-filling expansion (other CDSCO forms beyond MD-3/7/12)
- Razorpay (if Cashfree limits hit)
- Legal consultation (revisit at 100+ paid customers)
- Clinical trial moat features (pre-vetted clinical site network, CIP templates by therapeutic area, EC submission package generator)
- DPDP expansion product
- DCGI Pharma regulatory expansion
- FDA medtech expansion
- /upgrade A/B test infrastructure (PostHog flags)
- ABDM/IHIP integration depth
- **Hybrid classification architecture (LLM verdict + classical ML confidence)**
  - Trigger: ≥500 QC-reviewed cases + ≥3 months QC flowing + ONE of (QC correction rate >15% OR partner demand for confidence scores OR volume >100K/mo)
  - Earliest realistic: Month 9-12 / Sprint 8-10
  - Anti-trigger: QC correction <5%, no partner asks, no cost pressure
  - Build new XGBoost on QC-reviewed CDSCO labels (NOT port of SAE classifier)
  - See `docs/decisions/2026-05-06-llm-classification-architecture.md`

---

## Operational rhythm

- **Start of every sprint:** re-prioritize based on real data (cost, conversion, breakage)
- **End of every sprint:** sprint-recap committed to `docs/sprint-recaps/sprint-N.md` (what shipped, what slipped, what we learned)
- **Sprint plan lives in repo:** this doc, source of truth, updated continuously
- **Production deploy gate:** preview smoke test green + manual end-to-end test

---

## Success metrics by Week 12

- ≥10 paying Tier 1 customers (₹4,999 each)
- ≥3 Tier 2 customers (₹50K-1L each)
- ≥1 B2B partner contract signed
- ≥₹5L total revenue
- 35-case eval ≥90% maintained
- Per-assessment cost <$0.05
- 5+ partner directory entries with active relationships

If hit: validates the business as fundable. If missed: course-correct in Sprint 7.
