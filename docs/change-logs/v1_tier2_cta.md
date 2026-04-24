# ClearPath — Change Log v1: Tier 2 CTA framing

**What changed:** The Readiness Card page needed clearer, four-pillar framing of what the ₹499 Draft Pack delivers. Previous spec had full 11-item checklist on the card page itself, which overwhelms founders and hurts conversion.

**Why it changed:** Card page is the single biggest conversion surface in the funnel. A scannable four-pillar preview converts better than a dense checklist. Full checklist is preserved on the dedicated `/upgrade/{id}` page where founders have committed to learning more.

**Files to patch:**
1. `clearpath_copy_scope.md` — §6.1 structure updated + new §6.0.5 added
2. `clearpath_build_plan.md` — §5g exit criteria line added

**For Claude Code:** Apply the patches below to the source docs. Don't generate new full files. Keep original formatting and voice rules intact.

---

## Patch 1 — `clearpath_copy_scope.md`

### Add NEW section BEFORE §6.1

Insert a new section §6.0.5 titled "Tier 2 CTA on the Readiness Card page." Place it between §5.9 (card CTAs) and §6.1 (upgrade page).

```markdown
## 6.0.5 Tier 2 CTA block (on the Readiness Card page)

**Where:** Below the Readiness Card, above any share actions. The primary 
conversion surface.

**Section divider + heading:**
```
Ready to file? Get your Draft Pack — ₹499
```

**Four-pillar preview (the key visual):**

Each pillar is one icon/emoji + one line of primary copy + one line of 
elaboration in muted grey. Arranged in a 2x2 grid on desktop, stacked on 
mobile.

```
📋  The regulations that apply to your product
    3-5 of 9 — specific to your classification

📄  The blank CDSCO forms you'll need to fill
    MD-12, MD-9, etc. — real government PDFs

🗺  A submission guide
    Which form goes where, in what order

✍  Drafted content for each section
    Intended Use, Device Description, Risk Justification, Clinical 
    Context — tailored to your product
```

**Primary CTA:**
```
[ Get the Draft Pack — ₹499 → ]
```

**CTA helper line (small, muted):**
```
10 minutes. Emailed to you. Replaces ₹50K-3L of consultant work.
```

**Divider, then Tier 3 secondary link:**
```
──────────────────────

Or want an expert to review + refine before you file?
Submission Concierge · ₹50,000 · 2-3 weeks →
```

Tier 3 link is a text link, not a button. Smaller font than Tier 2 CTA. 
Sits below with a line break and divider above. Clicking takes founder 
to `/concierge` waitlist form.

**Why this order matters:**
- Tier 2 is the recommended default path for 85%+ of founders
- Tier 3 is visible but deliberately secondary — for sophisticated 
  founders who want expert help immediately
- Neither tier is hidden behind the other
```

### Keep §6.1 as-is (don't change it)

§6.1 already has the correct full upgrade page copy. The 11-item checklist lives there. No changes needed.

---

## Patch 2 — `clearpath_build_plan.md`

### In §5g (Feature 5 exit criteria)

Add ONE new checklist item after the existing ones:

**Before:**
```markdown
## 5g — Exit criteria

- End-to-end (intake → card) under 60s
- Cache hit path: re-submit identical form → instant redirect, no API call
- All 5 test cases pass
- Share URL with OG preview on WhatsApp/LinkedIn
- Mobile 375px works
- PostHog funnel 1→2→3 fires
```

**After:**
```markdown
## 5g — Exit criteria

- End-to-end (intake → card) under 60s
- Cache hit path: re-submit identical form → instant redirect, no API call
- All 5 test cases pass
- Share URL with OG preview on WhatsApp/LinkedIn
- Mobile 375px works
- PostHog funnel 1→2→3 fires
- **Tier 2 CTA block rendered per clearpath_copy_scope.md §6.0.5 
  (four-pillar preview + primary CTA + secondary Tier 3 link)**
```

---

## Implementation notes for Claude Code

When building the Readiness Card page (Feature 5):

1. The Tier 2 CTA block is a **separate component** from the Readiness Card itself — don't merge them visually. Use a horizontal rule / generous whitespace to separate.

2. The four-pillar preview should use **flex layout on desktop (2x2 grid) and stack on mobile** (single column, each pillar on its own row).

3. Each pillar emoji should be rendered as an actual emoji, not an SVG icon. Keeps it simple and mobile-native.

4. The Tier 3 secondary link should be visually recessive — 70% opacity, smaller font (`text-sm` instead of `text-base`), muted color. It should be findable but not competitive with the Tier 2 CTA.

5. Both CTAs fire PostHog events on click:
   - Tier 2: `tier2_cta_clicked` with `source: 'card_bottom'`
   - Tier 3: `tier3_cta_clicked` with `source: 'card_bottom'` ← NEW event, add to `clearpath_posthog_events.md`

6. Don't make the Tier 2 CTA a form submit — it should navigate to `/upgrade/{assessment_id}` where the full pitch copy and Razorpay button live.

---

## New PostHog event (add to instrumentation)

```
tier3_cta_clicked
  properties: { card_id, source: 'card_bottom' | 'draft_pack_email' | 'follow_up_email' }
```

Add to `clearpath_posthog_events.md` under "Funnel (Features 2-6)" event list.

---

## Summary for Claude Code

1. Read `clearpath_copy_scope.md` — add new §6.0.5 per Patch 1
2. Read `clearpath_build_plan.md` — update §5g per Patch 2
3. Read `clearpath_posthog_events.md` — add `tier3_cta_clicked` event
4. When building Feature 5, render the Tier 2 CTA block per §6.0.5
5. Test: Tier 2 CTA is prominent, Tier 3 link is visible but secondary

**No other changes required. Don't regenerate any full files.**
