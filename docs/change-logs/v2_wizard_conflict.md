# ClearPath — Change Log v2: Conflict disclosure in wizard

**What changed:** When pre-router (Feature 3) detects a high or medium severity conflict between one-liner, URL content, and PDFs, the wizard (Feature 4) shows an **inline card on Q1 only** (not a persistent banner). Transparent disclosure that documents are being prioritised. User acknowledges once, then proceeds.

**Why it changed:** Silent conflict handling is opaque. Founders should know when their stated description and their uploaded documents diverge — that affects which classification they'll get. Being upfront builds trust and lets them self-correct before spending time on 7 questions.

**Key decisions locked in this patch:**
- **Option B**: Inline card on Q1 only (not persistent banner across all 7 questions)
- **Edit path = Option 3a**: "Edit my description" re-opens full intake form at `/start?resume={id}` with fields pre-filled; re-submit triggers new pre-router call
- **Severity threshold**: only high + medium trigger the card; low + none proceed silently
- **PDF constraints confirmed**: 3 PDFs × 5MB × **10 pages** max (not 20 — protects token budget + caching benefits)
- **Platforms**: still treated as products for MVP (no decomposer in v1)

**Files to patch (surgical edits, NOT full regeneration):**
1. `clearpath_build_plan.md` — §3e (pre-router conflict detection) + §4 (wizard conditional card)
2. `clearpath_copy_scope.md` — new §4.0 (conflict disclosure copy)
3. `clearpath_screens_spec.md` — new Screen 5.0 (conflict disclosure wireframe)
4. `clearpath_output_schemas.md` — assessment meta schema additions
5. `clearpath_posthog_events.md` — 3 new wizard_conflict events

---

## Patch 1 — `clearpath_build_plan.md` §3e (pre-router routing)

### Find this section header in the build plan:

```markdown
## 3e — Routing
```

### Add NEW subsection BEFORE §3e (insert as new §3d-bis or relabel):

```markdown
## 3e — Conflict severity detection (during pre-router)

The Sonnet pre-router evaluates whether one-liner, URL content, and PDF 
summaries describe meaningfully different products. Four severity levels:

- **high**: one source classifies as medical device, another doesn't 
  (or they suggest different CDSCO classes, e.g. Class B vs C)
- **medium**: same classification direction, but notably different 
  product descriptions (e.g. "fitness tracker" vs "cardiac monitoring 
  device" — both could be Class B but very different intended use)
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

Authority hierarchy for resolution (locked): **PDFs > URL content > one-liner.**
When conflicts exist, Sonnet picks authority automatically based on this 
hierarchy and stores reasoning in `authority_used`.

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

### Then continue with existing routing logic (the original §3e renamed to §3f):
```

Relabel existing §3e as §3f (rejection/routing logic). No other changes to routing.

---

## Patch 2 — `clearpath_build_plan.md` §4.0 (new subsection for wizard entry)

### Add NEW subsection 4.0 BEFORE existing §4a (wizard questions):

```markdown
## 4.0 — Conflict disclosure on Q1 (conditional)

Before rendering the wizard stepper for Q1, check `assessments.meta`:

```ts
const shouldShowConflictCard = 
  meta.conflict_detected === true &&
  ['high', 'medium'].includes(meta.conflict_details?.severity) &&
  meta.conflict_acknowledged !== true;
```

**If true**: render the conflict disclosure card at the TOP of the Q1 page
(above the question stepper). Render ONCE on Q1 only — does NOT persist 
across Q2-Q7. User scrolls past or dismisses via "Continue to questions."

**If false**: proceed directly to Q1 questions.

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
// Redirect to intake form with assessment_id pre-loaded
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
- **If new conflict severity is high/medium**: card appears again on Q1. 
  Copy is slightly different (see §4.0 in copy scope): "Your description 
  still classifies differently from your documents. Continue with 
  documents as primary source, or edit again."
- **If severity drops to low/none**: card skipped, user goes straight to Q1

Edit cost: one additional Sonnet call per edit (~$0.015). Acceptable — 
gives users control without breaking cost model.

### Events fired

```
wizard_conflict_shown
  properties: { severity, authority_used }

wizard_conflict_continued
  properties: { severity }

wizard_conflict_edit_clicked
  properties: { severity }

wizard_conflict_reappeared
  properties: { severity, edit_attempt_count }
  (fires when card shows again after edit, if conflict persists)
```

### When the card does NOT render

- `conflict_detected === false` (sources agree)
- `severity === 'low' || severity === 'none'`
- `conflict_acknowledged === true` (user already continued past)
- User is back-navigating within wizard (Q3 → Q2 → Q1 → card already acknowledged)
```

---

## Patch 3 — `clearpath_copy_scope.md` §4.0 (new section)

### Add NEW section BEFORE existing §4.1 (wizard header):

```markdown
## 4.0 Conflict disclosure card (appears on Q1 only, when severity = high/medium)

### First-time appearance

**Card heading:**
```
Quick heads up
```

**Two-column comparison layout:**

Left column label (small caps, muted): `WHAT YOU SAID`
Left column body (bold): `"{one_liner_interpretation}"`

Right column label (small caps, muted): `WHAT YOUR DOCUMENTS SAY`
Right column body (bold): `"{pdf_interpretation}"` 
  (or URL interpretation if no PDFs uploaded)

**Explanation paragraph:**
```
Your uploaded documents usually have more detail than a short 
description, so we're using them as the primary source for your 
classification. If your description is actually correct, you can 
go back and edit it now.
```

**Two CTAs side by side:**

Primary (teal, outlined, left-aligned): `← Edit my description`
Secondary (teal solid button, right-aligned): `Continue to questions →`

**Helper text below CTAs (small, muted, italic):**
```
For this assessment, our priority is: uploaded documents first, 
website content second, your description third.
```

### Second+ appearance (after user edited but conflict persists)

**Same layout as above, but change heading to:**
```
Still a mismatch
```

**Change explanation paragraph to:**
```
Your updated description still classifies differently from your 
documents. This is fine — we'll continue using your documents as 
the primary source. You can edit again, or proceed.
```

All other elements (comparison, CTAs, helper) identical.
```

---

## Patch 4 — `clearpath_screens_spec.md` Screen 5.0 (new)

### Add NEW section BEFORE existing Screen 5 (wizard questions):

```markdown
## Screen 5.0 — Conflict disclosure (conditional, appears on Q1 only)

**Purpose:** transparent disclosure when one-liner and documents/URL 
classify the product differently. Appears once on Q1, not persistent.

**When it appears:**
- `assessments.meta.conflict_detected === true`
- `assessments.meta.conflict_details.severity in ['high', 'medium']`
- `assessments.meta.conflict_acknowledged !== true`

**Layout sketch:**

```
┌───────────────────────────────────────────────────┐
│                                                    │
│   {Product name} · Question 1 of 7                 │
│   [□ □ □ □ □ □ □]                                  │
│                                                    │
│   ┌─────────────────────────────────────────────┐ │
│   │                                              │ │
│   │   Quick heads up                             │ │
│   │                                              │ │
│   │   ┌──────────────┐   ┌──────────────┐     │ │
│   │   │ WHAT YOU     │   │ WHAT YOUR    │     │ │
│   │   │ SAID         │   │ DOCS SAY     │     │ │
│   │   │              │   │              │     │ │
│   │   │ "healthcare  │   │ "AI-powered  │     │ │
│   │   │  analytics   │   │  arrhythmia  │     │ │
│   │   │  platform"   │   │  detection"  │     │ │
│   │   └──────────────┘   └──────────────┘     │ │
│   │                                              │ │
│   │   Your uploaded documents usually have      │ │
│   │   more detail than a short description,     │ │
│   │   so we're using them as the primary        │ │
│   │   source for your classification. If your   │ │
│   │   description is actually correct, you can  │ │
│   │   go back and edit it now.                  │ │
│   │                                              │ │
│   │   [ ← Edit description ]  [ Continue → ]    │ │
│   │                                              │ │
│   │   For this assessment, our priority is:     │ │
│   │   uploaded documents first, website content │ │
│   │   second, your description third.           │ │
│   │                                              │ │
│   └─────────────────────────────────────────────┘ │
│                                                    │
│   [Q1 content renders below once user clicks       │
│    Continue, or immediately if no conflict]        │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Components:**
- Card container (rounded, light border, white/off-white background)
- H3 heading ("Quick heads up" or "Still a mismatch")
- Two-column comparison sub-cards with small-caps labels
- Explanation paragraph (readable prose)
- Primary + secondary CTAs in a row
- Helper text (muted, italic)

**Interactions:**

| Element | Action |
|---|---|
| "Continue to questions →" | Set `meta.conflict_acknowledged = true`, fire `wizard_conflict_continued`, scroll card out, render Q1 below |
| "← Edit my description" | Fire `wizard_conflict_edit_clicked`, redirect to `/start?resume={assessment_id}` |

**Desktop layout:** Two-column comparison side-by-side
**Mobile layout (375px):** Columns stack vertically, CTAs stack with primary first

**Note on back-navigation:**
Once user acknowledges (clicks Continue), the card does NOT re-render 
when they back-navigate from Q2 to Q1. It also does NOT re-render if 
the assessment is revisited later via resume link. Only re-renders if 
user edits via intake form AND new pre-router run detects severity 
high/medium conflict.
```

---

## Patch 5 — `clearpath_output_schemas.md`

### Add to assessment meta schema (find the existing meta schema and extend):

```markdown
## Assessment meta fields — extended

```typescript
interface AssessmentMeta {
  // ... existing fields preserved ...
  
  // Conflict detection (added v2)
  conflict_detected?: boolean;
  conflict_details?: {
    one_liner_interpretation: string;
    pdf_interpretation: string | null;
    url_interpretation: string | null;
    authority_used: 'pdf' | 'url' | 'one_liner';
    severity: 'high' | 'medium' | 'low' | 'none';
  };
  conflict_acknowledged?: boolean;
  conflict_edit_attempts?: number;  // increments each time user edits
  
  // ... existing fields preserved ...
}
```

Fields are all optional. Absence means conflict check hasn't run yet 
(e.g., old assessments from before this feature shipped).
```

---

## Patch 6 — `clearpath_posthog_events.md`

### Add to Funnel events list (Features 2-6 section):

```markdown
### Wizard conflict events (added v2)

```
wizard_conflict_shown
  Fires when Screen 5.0 renders on Q1
  Properties: severity ('high' | 'medium'), authority_used ('pdf' | 'url' | 'one_liner')

wizard_conflict_continued
  Fires when user clicks "Continue to questions"
  Properties: severity

wizard_conflict_edit_clicked
  Fires when user clicks "Edit my description"
  Properties: severity

wizard_conflict_reappeared
  Fires when card re-shows after edit (conflict persisted)
  Properties: severity, edit_attempt_count
```

Dashboard to add: "Conflict outcomes" — shows percentage of users who 
see the card, how many continue vs edit, and of those who edit, how 
many resolve the conflict vs persist.
```

---

## PDF upload constraints — re-confirmed

Per the existing build plan §2b, the PDF upload cap is:

- **Max 3 files**
- **Max 5MB per file**
- **Max 10 pages per file** (NOT 20)

10 pages is the right cap because:
- Pitch decks are typically 10-15 slides; first 10 captures the important stuff
- Product briefs are 3-5 pages
- Technical specs are usually frontloaded with intended use + description
- 20 pages × 3 PDFs = 60 pages → blows up prompt caching token budget
- 10 pages × 3 PDFs = 30 pages → fits cleanly within cached/uncached split

Client-side enforcement via `pdfjs-dist` page counting, as currently specified.

This cap is NOT changing — just re-confirmed here since it came up in 
the discussion.

---

## Implementation order for Claude Code

**Critical order — edit source docs BEFORE building Feature 4:**

1. Read `clearpath_build_plan.md` → apply Patch 1 (§3e conflict detection) and Patch 2 (§4.0 wizard card logic)
2. Read `clearpath_copy_scope.md` → apply Patch 3 (new §4.0 disclosure copy)
3. Read `clearpath_screens_spec.md` → apply Patch 4 (new Screen 5.0 wireframe)
4. Read `clearpath_output_schemas.md` → apply Patch 5 (meta schema fields)
5. Read `clearpath_posthog_events.md` → apply Patch 6 (4 new events)

**Then build Feature 4 with:**
- 7-Q wizard stepper (existing spec)
- Conditional Screen 5.0 render on Q1 (new from this patch)
- Edit re-flow routing (`/start?resume={id}`)
- All 4 new PostHog events wired

**Test cases Feature 4 must pass:**

| Test | Setup | Expected |
|---|---|---|
| No conflict | PDF + one-liner agree | Card does NOT render, Q1 shows immediately |
| Low conflict | Minor wording differences | Card does NOT render, Q1 shows |
| High conflict | "analytics platform" vs "cancer screening" | Card renders on Q1 with comparison |
| Continue past | Click Continue on high conflict | Card disappears, Q1 shows, back-nav doesn't re-show |
| Edit resolves | Edit description to match PDF | On return to wizard, card does NOT render |
| Edit persists | Edit but still conflicts | Card re-renders with "Still a mismatch" heading |
| Back-nav from Q3 | Go Q1 → Q2 → Q3 → Q2 → Q1 | Card does NOT re-render (already acknowledged) |

---

## No other changes required

All other earlier specs remain valid:
- Feature 5 (synthesizer) reads from stored meta, no changes needed
- Feature 6 (draft pack) reads from stored meta, no changes needed
- Tier 2 CTA framing (from change log v1) unchanged
- Tier 3 waitlist flow unchanged
- 10-page PDF cap maintained
- Platform → product simplification for MVP maintained

Don't regenerate any full documentation files. All 6 patches are surgical.
