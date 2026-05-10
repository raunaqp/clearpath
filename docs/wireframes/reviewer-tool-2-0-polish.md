# Story 2.0 — Reviewer Workflow Polish: Understand → Verify → Decide

**Version:** 2.0
**Date:** 2026-05-10
**Repo:** `cdsco-reviewer-tool`
**Source video:** Product_Video-_ClearPath_AI_-_CDSCO_tool.mp4 (3:15)

---

## Goal · Scope · Demo Value

**Goal:** Reduce reviewer cognitive load by turning the application detail page into a 3-step review workflow — Summary → Documents → Decision — and make the queue page support bulk action on low-risk applications.

**Scope:** Reviewer-side UI polish only. No engine changes, no schema changes, no auth changes. Applicant-facing views out of scope.

**Demo value:** Faster comprehension (5-second device understanding via Summary tab), focused decision-making (decision toolbar only on Decision tab), bulk clearance for low-risk applications (regulator time saver).

---

## Current state — what exists today

### Page 1: Application queue (`/reviewer`)

**What's good:**
- Tab navigation: Pending / Acted / High risk / All — clean, useful
- Filter bar: Risk Level / Completeness / Category / Received — comprehensive
- Risk score column with color-coded badges (red 92, amber 35) — strong glance signal
- SLA column with time-since indicator (1h, 23h)
- "X matches on this tab" count — useful

**What's missing or weak:**
- **No 1-line description of what each device DOES** — currently shows only product name (e.g., "Pedscribe Listen") and applicant name (e.g., "Dr Ananya Iyer"). Reviewer must click into the application to understand what the device is.
- No bulk-action affordance for low-risk applications
- No active filter count indicator (easy to lose track of applied filters during long sessions)
- "Severity (SAE) filter lands with Module 4 wiring" — technical jargon that doesn't help reviewers

### Page 2: Application detail (`/reviewer/applications/[id]`)

**What's good:**
- Status timeline at top (Submitted → Under review → Query raised → Resubmitted → Decision) — clear progression
- Submission Sections sidebar (left) — completion ✓/✗ per document
- AI Copilot panel (right) with CDSCO Risk score + Top 3 Risks — high-value
- Document anonymization explicit ("No PII" labels, "10 files · anonymized")
- Document drilldown modal with "Summarize" + "View" actions

**What's overloaded or scattered:**
- **One long scroll mixing "what is this" + "what documents" + "what discussion happened" + "what should I do"** — no visual sectioning between phases of the reviewer's task
- **Decision toolbar has 6 actions:** Approve / Reject / Send query / Coordinate / Schedule inspection / Request SEC review — most don't apply to most applications
- TL;DR card and AI Copilot Top 3 Risks are visually separated (left-center vs right) requiring eye-flick to compare
- No breadcrumbs — reviewer can lose context when deep in scroll

### Page 3: Applicant view (`/apply/[id]/submitted`)

**Out of scope for Story 2.0** — applicant-side, polish only the reviewer side per Sprint 2 plan.

---

## Story 2.0 changes — what we build

### Change 1: Application detail page → 3-tab structure

**Concept:** Restructure the long scroll into 3 task-focused tabs matching the reviewer's mental flow:
- **Tab 1 — Summary:** "What is this device? What's the risk?" (5-second comprehension)
- **Tab 2 — Documents:** "What did they submit? Is it complete?" (review + drilldown)
- **Tab 3 — Decision:** "What's the history? What should I do?" (action + thread)

**Status timeline stays at top** above all 3 tabs (always visible — workflow context never lost).

**Breadcrumbs added** at top: `Queue > [Product Name] (CDSCO-XXXX-XXX-XXXX)`

#### Tab 1 — Summary

**Layout (single column, full width, below status timeline):**

```
+--------------------------------------------------------------+
| Queue > Pedscribe Listen (CDSCO-2026-PEDS-633E)              |
+--------------------------------------------------------------+
| STATUS TIMELINE (always visible above tabs)                  |
+--------------------------------------------------------------+
| [Summary] [Documents] [Decision]   ← tab nav                 |
+--------------------------------------------------------------+
|                                                              |
|  PRODUCT SUMMARY                            CDSCO RISK       |
|  Pedscribe Listen                           ┌─────────────┐  |
|  CDSCO-2026-PEDS-633E                       │   92 / 100  │  |
|  Dr Ananya Iyer (Applicant)                 │  HIGH RISK  │  |
|                                             └─────────────┘  |
|                                                              |
|  ONE-LINE                                   TOP 3 RISKS      |
|  Class C adaptive pediatric SaMD with       • Class C SaMD   |
|  PHI and zero documentation on file           with clinical  |
|                                                claim         |
|  DESCRIPTION                                • Adaptive AI    |
|  AI-powered pediatric clinical scribe          with no ACP   |
|  that listens to outpatient consultations     disclosed      |
|  between pediatricians and patients...      • Sensitive PHI  |
|                                                without DPDP  |
|  CATEGORY: SaMD Class C/D                                    |
|  STAGE: Pending Review · 78% complete                        |
|                                                              |
+--------------------------------------------------------------+
```

**Done when:**
- Device name, ID, applicant, one-liner, full description, CDSCO Risk score, and Top 3 Risks all visible without scrolling on standard desktop viewport (1366×768 minimum)
- Right-side risk panel takes ~40% of tab width on desktop
- Reviewer can comprehend "what is this device + what's the risk" in 5 seconds

**Component reuse:**
- TL;DR text + description: reuse existing components, relocate
- CDSCO Risk badge: reuse existing
- Top 3 Risks list: reuse existing
- Submission % indicator: reuse existing

**New work:**
- Tab navigation component (3 tabs)
- Visual layout grouping (left product summary + right risk panel as paired view)
- Breadcrumb component

#### Tab 2 — Documents

**Layout:**

```
+--------------------------------------------------------------+
| Queue > Pedscribe Listen                                     |
+--------------------------------------------------------------+
| STATUS TIMELINE                                              |
+--------------------------------------------------------------+
| [Summary] [Documents] [Decision]                             |
+--------------------------------------------------------------+
|                                                              |
| SUBMISSION SECTIONS (left sidebar)  | SUBMITTED DOCUMENTS    |
|                                     |                        |
| 78% complete                        | Each section expanded: |
| ✓ 5 / ✗ 5                           | - Document name        |
|                                     | - Files attached       |
| ✓ MD-7: App for licence (Class C/D) | - "View" + "Summarize" |
| ✓ Device Master Record / DMF        |   actions              |
| ✗ ISO 13485 quality system cert     | - Completion badge     |
| ✓ Risk Management File (ISO 14971)  |                        |
| ✓ Clinical Evaluation Report        | (right pane scrolls    |
| ✗ Essential Principles checklist    | through documents)     |
| ✓ Instructions for Use (IFU)        |                        |
| ✗ Test Reports                      |                        |
| ✗ IEC 62304 software lifecycle      |                        |
| ✗ Algorithm Change Protocol         |                        |
|                                     |                        |
+--------------------------------------------------------------+
```

**Done when:**
- Submission Sections sidebar identical to current behavior (no regression on completion %, ✓/✗ markers)
- Submitted Documents list shows all current data
- Document drilldown modal still functional (click "View" → modal opens with anonymized content)
- "Summarize" action still functional

**Component reuse:** ~95% existing components

**New work:** ~5% — placement only (move from current single-scroll into Tab 2 container)

#### Tab 3 — Decision

**Layout:**

```
+--------------------------------------------------------------+
| Queue > Pedscribe Listen                                     |
+--------------------------------------------------------------+
| STATUS TIMELINE                                              |
+--------------------------------------------------------------+
| [Summary] [Documents] [Decision]                             |
+--------------------------------------------------------------+
|                                                              |
|  PREDICATE MATCHES                                           |
|  (existing component as-is)                                  |
|                                                              |
|  ADVERSE-EVENT REPORTS                                       |
|  (existing component as-is)                                  |
|                                                              |
|  THREAD + TIMELINE                          [2 events]       |
|  ┌────────────────────────────────────────────────────────┐ |
|  │ Today                                                  │ |
|  │                                                        │ |
|  │ [Avatar] Dr Ananya Iyer · Applicant · 1:00 PM          │ |
|  │ Pedscribe Listen formally submitted to CDSCO via       │ |
|  │ the readiness portal.                                  │ |
|  │                                                        │ |
|  │ [Avatar] Reviewer · CDSCO Reviewer · 2:21 PM           │ |
|  │ "Please provide ISO 13485:2016 quality management..."  │ |
|  │                                                        │ |
|  │ [Avatar] System · 2:21 PM                              │ |
|  │ Status changed from applied to query_raised.           │ |
|  └────────────────────────────────────────────────────────┘ |
|                                                              |
|  Ask a clarifying question or post a status update...        |
|  + attach document                          [Send] button    |
|                                                              |
+--------------------------------------------------------------+
| DECISION TOOLBAR (visible only on Decision tab)              |
| [Approve] [Reject] [Send query]   Coordinate ▼               |
|                                   ├ Schedule inspection      |
|                                   └ Request SEC review       |
+--------------------------------------------------------------+
```

**Decision toolbar consolidation:**
- Currently 6 actions: Approve / Reject / Send query / Coordinate / Schedule inspection / Request SEC review
- New: 4 primary actions + 1 dropdown
  - **[Approve]** primary green
  - **[Reject]** primary red
  - **[Send query]** primary amber
  - **Coordinate ▼** dropdown containing:
    - Schedule inspection
    - Request SEC review
- Reasoning: Approve/Reject/Send query are 95% of actions. The other two are workflow coordination — group them.

**Done when:**
- Predicate Matches component renders with same data as current state
- Adverse-Event Reports component renders with same data as current state
- Thread + Timeline shows all current message types (applicant, reviewer, system) with correct avatars and timestamps
- Reply input + attachment + Send still functional
- Decision toolbar shows 4 buttons + Coordinate dropdown
- Coordinate dropdown reveals Schedule inspection + Request SEC review on click
- All 6 original actions remain functional (no behavior change, just placement)

**Component reuse:** ~85%
**New work:** Decision dropdown consolidation, decision toolbar visibility logic (only on Tab 3)

---

### Change 2: Queue page enhancements

**Five additions to existing queue page:**

#### Addition 1: Per-row 1-line description

**Current row layout:**
```
[Risk]  [Product Name + ID]                [Category]    [Stage]      [Completeness]   [SAE]   [SLA]
        [Applicant]
```

**New row layout:**
```
[Risk]  [Product Name + ID]                [Category]    [Stage]      [Completeness]   [SAE]   [SLA]
        [Applicant]
        [1-line description]               ← NEW
```

**Data source caveat:** Use existing TL;DR/summary field if available in DB (likely on `applications.summary` or within `ai_synthesis_output` jsonb). If field doesn't exist or isn't populated for current demo applications, derive from MD-7 application form intended-use field, OR seed mock summaries for the 2 demo applications. Don't block on schema work — surface to founder if neither path works.

**Visual treatment:**
- Smaller text, lighter color (text-zinc-600 or equivalent)
- Truncate at ~80 chars with "..." if longer
- Hover shows full description in tooltip

**Done when:**
- Both demo applications (Pedscribe Listen + VitalSign Connect) show 1-line descriptions in queue rows
- Truncation works for long descriptions
- Hover tooltip reveals full text
- Filters still work without breaking

#### Addition 2: Bulk approve low-risk applications

**Behavior:**
- Cmd/Ctrl+click row: toggle row selection (checkbox appears in row)
- Shift+click row: range select between two rows
- When 1+ rows selected, action bar appears at top of queue:
  ```
  3 selected   [Bulk approve low-risk] [Clear selection]
  ```
- Bulk approve enabled only for: Pending tab + Risk score ≤ 40 (matches existing "Low" filter threshold)
- If selection contains any application with Risk > 40, bulk approve button disabled with tooltip: "Bulk approve only available for low-risk applications (≤40)"
- Confirmation modal: "You are approving N low-risk applications. This action cannot be undone. Confirm?"

**Implementation notes:**
- Reuse existing approve action (just batched)
- Don't enable bulk reject (reject needs reason per application — keep one at a time)
- Don't enable bulk query (queries are application-specific)

**Visual treatment:**
- Row checkbox appears on hover (clean state)
- Selected rows highlighted with subtle background
- Action bar slides in from top when selection > 0

**Naming choice:** "Bulk approve low-risk" (NOT "auto-approve") — explicit about what's being approved, requires confirmation. "Auto-approve" sounds like the system is approving without human oversight, which is wrong framing for a regulator.

**Done when:**
- Ctrl/cmd+click toggles row selection
- Shift+click range-selects rows
- Action bar appears with selection count
- Bulk approve only enabled when all selected rows have Risk ≤ 40
- Confirmation modal appears before action commits
- Selected applications successfully approved (status updates)
- Clear selection resets state

#### Addition 3: Active filter count + Clear all

When any filter is applied, show count + clear-all link above filter bar:

```
FILTERS (3 active) [Clear all]
─────────────────────────────────
RISK LEVEL: High
COMPLETENESS: ≤50%
RECEIVED: Last 24h
```

**Done when:**
- Count accurately reflects number of applied filter chips
- "Clear all" link removes all filters and returns to default state
- Count updates dynamically as filters added/removed

#### Addition 4: Multi-select clarity within filter categories

Currently unclear if filters within a category are AND or OR.

**New behavior:** Within a filter category = OR (multi-select union). Across categories = AND (intersection).

Example: Selecting "High" AND "Moderate" risk shows applications matching either. Selecting "High" risk AND "≤50%" completeness shows applications matching both.

**Visual change:** Filter chips become checkbox-style (multi-select) where applicable. Selected state stays clear.

**Done when:**
- Multiple chips within same category can be selected simultaneously
- Result list reflects OR-within-category, AND-across-categories logic
- Visual treatment makes multi-select obvious (not radio-button look)

#### Addition 5: Helper text simplification

**Current:** "Severity (SAE) filter lands with Module 4 wiring."

**New:** Remove this line entirely. It's technical jargon that doesn't help reviewers.

**Done when:**
- Helper text removed from queue page
- No regression on SAE filter functionality

---

### Change 3: Tab keyboard shortcuts (application detail page)

**Behavior:**
- Pressing `1` switches to Summary tab
- Pressing `2` switches to Documents tab
- Pressing `3` switches to Decision tab
- Shortcuts disabled when text input has focus (so typing in reply field doesn't trigger tab switch)
- Visual hint on tab labels: small "1", "2", "3" subtext or tooltip

**Done when:**
- Keyboard shortcuts work on application detail page
- Don't trigger when reviewer is typing in input fields
- Visual hint discoverable but not distracting

**Out of scope for Story 2.0 (Sprint 3 candidates):**
- `J`/`K` next/previous application navigation
- `A`/`R`/`Q` action focus shortcuts
- Searchable command palette

---

## What we are NOT changing in Story 2.0

Listing explicitly to prevent scope creep:

- **Engine layer** (no AI changes)
- **Data model** (no schema changes; if TL;DR field doesn't exist, seed mock data instead)
- **Filter bar core logic** (Risk Level / Completeness / Category / Received) — adding presets in future
- **Status timeline component** (already good)
- **Submission Sections sidebar** (already good)
- **Document drilldown modal** (already good)
- **AI Copilot risk + top 3 risks** (already good, just relocating into Tab 1)
- **Predicate Matches component** (already good)
- **Adverse-Event Reports component** (already good)
- **Thread + Timeline component** (already good)
- **Approve / Reject / Send query** behavior (no change to action handlers)
- **Color scheme** (defer to Sprint 3 — government-grade visual identity refresh)
- **"Mark for follow-up" flag** (defer to Sprint 3)
- **Power-user keyboard shortcuts beyond tab nav** (defer to Sprint 3)
- **Filter presets** ("Needs my attention" etc. — defer to Sprint 3)
- **Applicant-side views** (out of scope for Story 2.0)
- **Auth/login** (no change)

---

## Default decisions (no escalation needed)

Claude Code uses these defaults unless implementation reveals a blocker:

| Decision | Default | Escalate if |
|---|---|---|
| Tab persistence | Tab 1 (Summary) opens fresh on every visit | Testing shows reviewers heavily favor a non-default tab |
| Risk panel width on Tab 1 | 40% of tab width on desktop | Layout breaks at common viewport sizes |
| Bulk approve threshold | Risk ≤ 40 (matches existing "Low" filter) | Founder explicitly wants different threshold |
| Decision toolbar position | Visible only on Decision (Tab 3) | Visual feedback shows reviewer confusion |
| TL;DR field source | Existing DB field if available; else seed mock data for demo | Both paths blocked |
| Keyboard shortcut visual hint | Tooltip on hover (not always-visible subtext) | UX testing shows hints aren't discoverable |
| Bulk approve confirmation | Modal with explicit count + irreversible warning | None — always require confirmation |
| Status timeline visibility | Always visible above all tabs | Vertical space concerns at small viewports |

**Surface-to-founder triggers (not in default table above):**
- Component refactor turns out to be more invasive than placement-only
- Existing data model conflicts with proposed UI
- Vercel/build infra issue
- Anything that pushes Story 2.0 effort past 8 hours

---

## Implementation sequence

**Phase 1 — Setup (~30 min)**
1. Pull latest cdsco-reviewer-tool, verify clean build locally (`npm run build`)
2. Run dev server, confirm current state works (`npm run dev`)
3. Push HEAD to origin, deploy current state to Vercel preview
4. Smoke test deployed baseline — confirm rollback point exists
5. Create feature branch: `git checkout -b story-2-0-workflow-polish`

**Phase 2 — Application detail 3-tab restructure (~2-3 hours)**
1. Add tab navigation component (3 tabs: Summary / Documents / Decision)
2. Add breadcrumb component at top
3. Move TL;DR + Description + AI Copilot CDSCO Risk + Top 3 Risks into Tab 1 (Summary) layout
4. Move Submission Sections sidebar + Submitted Documents into Tab 2 (Documents) layout
5. Move Predicate Matches + Adverse-Event Reports + Thread + Timeline into Tab 3 (Decision) layout
6. Consolidate decision toolbar (4 primary + Coordinate dropdown)
7. Make decision toolbar visible only on Decision tab
8. Add tab keyboard shortcuts (1/2/3)

**Phase 3 — Queue enhancements (~1-2 hours)**
1. Add 1-line description per row (with truncation + tooltip)
2. Add active filter count indicator + Clear all link
3. Convert filter chips to multi-select where applicable
4. Add ctrl/shift+click row selection state
5. Add bulk approve action bar (top of queue when selection > 0)
6. Add bulk approve confirmation modal
7. Remove "Severity (SAE) filter lands with Module 4 wiring" helper text

**Phase 4 — Smoke test + deploy (~30 min)**
1. Test 3-tab navigation across both demo applications
2. Test keyboard shortcuts (1/2/3)
3. Test bulk approve flow with low-risk applications
4. Test active filter count + clear all
5. Test all 6 decision actions still work (placement-only change)
6. Verify "Sign out" still works (no regression)
7. Commit changes
8. Push to origin (triggers Vercel deploy)
9. Smoke test polished version on preview URL

**Total estimated: 4-6 hours.**

**Conditional: scope balloons to 8-10 hours if existing components don't reuse cleanly.** Surface to founder if hitting this threshold.

---

## Demo readiness checklist (Mon May 11 morning)

Before considering Story 2.0 complete:

- [ ] Both demo applications (Pedscribe Listen + VitalSign Connect) load cleanly on /reviewer
- [ ] Queue rows show 1-line descriptions
- [ ] Active filter count + Clear all works
- [ ] Bulk approve works for low-risk applications
- [ ] Bulk approve disabled (with tooltip) when high-risk selected
- [ ] 3-tab navigation works on application detail page
- [ ] Tab 1 Summary readable in 5 seconds (visual check)
- [ ] Tab 2 Documents shows existing sidebar + document list correctly
- [ ] Tab 3 Decision shows thread + timeline + decision toolbar
- [ ] Decision toolbar visible only on Tab 3
- [ ] Approve / Reject / Send query buttons functional
- [ ] Coordinate dropdown shows Schedule inspection + Request SEC review
- [ ] Keyboard shortcuts 1/2/3 switch tabs
- [ ] Breadcrumbs visible above status timeline
- [ ] No regressions on existing features (data still loads, filters work, status timeline works)
- [ ] Mobile/tablet rendering acceptable (desktop primary, tablet usable)
- [ ] 3-4 screenshots captured for Sprint 2 retrospective + demo prep

---

## What this gives the IndiaAI demo

**Before:**
- "Here's a long scroll page where you review applications"

**After:**
- "Here's a 3-step evaluation workflow: Summary → Documents → Decision. Reviewer focuses on one task per tab."
- "Bulk approve for low-risk applications saves regulator time."
- "Keyboard shortcuts for power users — 1 / 2 / 3 switches between workflow steps."
- "Active filter count keeps reviewer aware of applied filters during long sessions."

**Honest framing for demo:**
- "Submission video shows Iteration 1. Today's demo is Iteration 2 — same engine, polished workflow based on user feedback."
- Demonstrates iteration discipline post-submission
- Shows team is shipping based on reviewer feedback

---

## Sprint 3 backlog (deferred from Story 2.0)

Items intentionally deferred:

1. **Color scheme refresh** — government-grade visual identity (saffron/navy palette, status color differentiation, institutional header treatment)
2. **Filter presets** — "Needs my attention" / "Stale" / "Ready to clear" one-click filters
3. **"Mark for follow-up" flag** — bookmark icon on applications, sortable in queue
4. **Power-user keyboard shortcuts** — `J`/`K` next/previous application, `A`/`R`/`Q` action focus
5. **Searchable command palette** — cmd+K to navigate any application or action

These are real improvements but each deserves its own story with proper design thinking. Don't half-ship in Story 2.0.
