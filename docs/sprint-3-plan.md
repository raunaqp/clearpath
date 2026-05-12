# Sprint 3 plan

**Dates:** May 26 – June 6 2026 (12 working days)
**Theme:** revenue + differentiation + expert collaboration + persona expansion
**Status:** locked 2026-05-12 at Sprint 2 closeout

---

## P0 — must ship (~14 days; some compression expected)

### 3.1 Two-tier pricing (Cashfree SKUs)  ·  1.5 days

Founder-locked structure:

| Tier | Price | Delivery channel | Email verify required? |
|---|---|---|---|
| Draft Pack | ₹499 | Email link (PDF download) | **Yes** — delivery uses the email |
| Draft Editor | ₹2,499 | In-app at `/draft/[id]` | No — editor doesn't need email |

Work:

- Customer picks tier on `/upgrade/[id]`
- Two Cashfree payment links / SKUs (Cashfree dashboard config + env vars per tier)
- Conditional post-payment routing per tier
- Email verification gate is tier-conditional (Sprint 2's blanket gate becomes tier-aware)

### 3.2 Auto-trigger generation on payment (no admin verify gate)  ·  1 day

- Cashfree webhook `PAYMENT_SUCCESS_WEBHOOK` fires v2 generation directly
- Status flow: `paid → generating → delivered` (skip the `verified` intermediate state)
- Postgres trigger as backup for direct SQL UPDATE scenarios
- Kills the v1 legacy admin "Generate Draft Pack" button path entirely
- Migration to remove or guard the `/api/admin/generate-draft-pack` endpoint

### 3.4 Status panel auto-redirect on delivery  ·  0.5 day

- `/upgrade/[id]` when `status='delivered'`:
  - ₹499 tier: "Your Draft Pack is ready — sent to {email}" + download CTA
  - ₹2,499 tier: "Open your Draft Editor →" link **OR** auto-redirect to `/draft/[id]`

### 3.7 Cashfree production switchover  ·  1 day

- Sandbox keys → production keys
- ₹499 + ₹2,499 production launch
- Customer-facing launch announcement (landing copy, social posts)
- KYC pending — verify before scheduling

### 3.10 Dashboard UX rework  ·  1 day

- Current application prominent + collapsible "Previous applications" section
- Better empty states
- Mobile responsive polish

### 3.NEW Expert portal v1 + messaging thread  ·  6–7 days

**Scope: option (b) per founder — admin-managed.** No public expert directory yet; founder onboards experts manually via Supabase Auth.

Build:

- Expert auth role (separate from customer)
- Admin-created expert accounts (no self-registration)
- Expert dashboard listing Draft Packs they've been granted access to
- Customer "Grant access to expert" flow on `/draft/[id]` (select from existing expert accounts)
- Expert view of `/draft/[id]` in expert mode:
  - Read full Draft Pack
  - Add comments per section
  - Edit sections (expert edits visible immediately; customer can accept / revert)
  - View customer-uploaded attachments
- Messaging thread per Draft Pack:
  - Async only — no real-time chat
  - Per-section context (comment on §6 or "general")
  - In-app notifications only (email notifications deferred to Story 4.2)
- Reuses existing `/draft/[id]` reader UI with expert-mode variations

Deferred to Sprint 4:

- Public expert directory + self-registration + profile pages
- Email notifications on thread activity
- Payment / escrow / marketplace mechanics

### 3.NEW2 MD-22 / MD-23 clinical-investigation path  ·  3 days

Per bible Part II §9. Adds the clinical-investigation researcher persona alongside the existing SaMD-manufacturer flow.

Build:

- Tier 1 wizard path detection: SaMD manufacturer vs CI researcher (new B1 wizard question)
- New wizard questions for CI scope: study type, sites, sample size, endpoints, IRB approval status
- Document matrix expansion for MD-22 (CI permission) and MD-23 (CI permission certificate)
- Draft Pack v2 generator extension — either:
  - existing 12 sections + new CI-specific sections, OR
  - separate Draft Pack template for CI persona
- Section content tuned for CI persona — distinct from manufacturer Draft Pack:
  - Study design rationale
  - Endpoints + outcome measures
  - Patient eligibility + safety considerations
  - Site management plan
  - Data monitoring + interim analyses

---

**P0 subtotal: ~14 days work · 12 days available**

## P1 — stretch

### 3.5 Generator robustness (silent-failure protection)  ·  1 day

Hardens the path that broke at Sprint 2 closeout (the v1/v2 race that left an order in `delivered` with zero sections).

- Validate intake completeness before marking `delivered`
- Refuse delivery if `draft_pack_sections` rowcount ≠ 12
- Better error logging when section persistence fails
- Admin dashboard health check: orders with `status='delivered'` but 0 sections flagged

---

## Likely cuts if P0 runs hot

- 3.5 → Sprint 4 (low risk, easy defer)
- 3.7 Cashfree production switchover → late Sprint 3 or early Sprint 4 (depends on Cashfree KYC readiness)

## Parallel non-blocking work (no code; founder-driven)

- **CDSCO consultant validation** — send `docs/specs/cdsco-regulatory-forms-reference.html` to Venture Center regulatory team; iterate on bible based on feedback; update product based on validated regulatory logic
- **Demo packets / sales materials** — 3–4 sample Draft Packs for the landing page (was Phase 7 of Sprint 2); marketing artifact, can produce when capacity allows

---

## Sprint 4 backlog (recorded, not committed)

- **4.1** Production SMTP + email delivery (real transactional emails; domain registration; Resend or similar)  ·  1.5 days
- **4.2** Expert-portal email notifications (depends on 4.1)  ·  0.5 day
- **4.3** Expert directory (public list + self-registration + profiles + admin approval)  ·  2 days
- **4.4** Predicate DB port from `cdsco-reviewer-tool` + side-by-side comparison UI (pgvector port, §6 overhaul, SE narrative editor, linkified citations)  ·  2.5 days
- **4.5** MD-12 manufacturing-license path (hardware/physical-device manufacturer persona)  ·  2 days
- **4.6** IVD path full implementation (in-vitro diagnostic devices per bible Part II §7)  ·  3 days
- **4.7** Per-section attachment PDF text extraction (D3 Phase 2)  ·  1 day
- **4.8** Real-time regeneration on edit (auto-regenerate sections when wizard answers change)  ·  2 days
- **4.9** Cross-journey roadmap view (CI → manufacturing license → post-market)  ·  2 days
- **4.10** Rich-text editor in `/draft/[id]` (vs current markdown textarea)  ·  1 day

## Sprint 5 preview

- Pharma manufacturer + clinical researcher paths
- Combination products
- AI/ML adaptive ACP framework
- Expert marketplace v1 (hiring, payment, escrow)
- Predicate depth refinement
- More predicate sources (EU CE, Japan PMDA, ROW)
