# ClearPath Landing — Change List for Claude Code

The landing page at `clearpath-lake-xi.vercel.app` is 80% right. These are targeted edits, not a rewrite.

Apply in the order below. Each change is self-contained — ship after each one if you want to.

---

## Change 1 — Add expert trust strip to hero

**Where:** Hero section, between the subhead and the social-proof line that currently says *"Built on real CDSCO submissions · Aligned to the Oct 2025 SaMD draft · Tested on 15+ Indian healthtech products"*.

**Insert ABOVE that line:**

```
Backed by experts from ABDM · Karnataka Government · Indian healthtech founders
```

Style: small caps, letter-spacing wide, muted ink (`text-gray-muted`), centered, `text-xs` or `text-sm`.

Visual: a single line, no icons, just text. It should feel like institutional validation, not a logo parade.

---

## Change 2 — Make CDSCO timeline reference explicit

**Where:** The problem section or the hero subhead.

**Current:** *"CDSCO changed what counts as a medical device. Your product might be one you didn't know about."*

**Replace the subhead paragraph with:**

```
CDSCO's Medical Device Rules 2017 and the Oct 2025 SaMD draft changed what 
counts as a medical device. Your product might be one you didn't know about.
```

This grounds the claim in specific regulation names + dates. Investors and founders both notice.

---

## Change 3 — Reorder sections (move pricing below sample card)

**Current order:**
1. Hero
2. Problem (3 stats)
3. Regulatory maze (9 regulations)
4. **Pricing (3 tiers)** ← too early
5. 6-step founder journey
6. Sample Readiness Card
7. Moats (Why ClearPath)
8. Founder profile
9. Testimonials
10. FAQ
11. Final CTA
12. Footer

**New order:**
1. Hero
2. Problem (3 stats)
3. Regulatory maze (9 regulations)
4. 6-step founder journey
5. Sample Readiness Card
6. **Pricing (3 tiers)** ← moved here
7. Moats (Why ClearPath)
8. Founder profile
9. Testimonials
10. FAQ
11. Global vision strip ← NEW, see Change 6
12. Final CTA
13. Footer

**Why:** Founders need to feel the pain (problem), see the journey (how it works), see what they get (sample card) BEFORE they see the price. Current flow asks them to commit to price tiers before they understand the value. Reversing this is a standard conversion pattern.

---

## Change 4 — Remove Karnataka Medtech Cluster mention

**Where:** Moat #1 ("Trained on 15+ real products, validated with experts").

**Current body:**
> *"Calibrated on 15 real Indian healthtechs — CerviAI filings, EkaScribe, Neodocs, Niramai, Forus, plus Karnataka Medtech Cluster network review."*

**Replace with:**
> *"Calibrated on 15 real Indian healthtechs — CerviAI filings, EkaScribe, Neodocs, Niramai, Forus Health. Reviewed with ABDM architects and founders who have filed CDSCO applications."*

Reason: Karnataka Medtech Cluster isn't a confirmed partnership; referencing it as calibration input overstates the relationship. "ABDM architects + founders who have filed" is honest and still strong.

---

## Change 5 — Readiness Card visual improvements

**Where:** Sample Readiness Card section.

**Current issues:**
- The card has a white/cream background regardless of risk level — visually flat
- Readiness circle (the "4") is present but doesn't dominate the composition
- No risk-based visual signal

**Changes to make:**

### 5a. Background tint based on risk level

Add a subtle background tint to the card based on the `risk_level` field:

| Risk | Background | Border |
|---|---|---|
| High | `bg-coral-light` (`#FAECE7`) | `border-coral-brand` (`#993C1D`) |
| Medium | `bg-amber-light` (`#FAEEDA`) | `border-amber-brand` (`#BA7517`) |
| Low | `bg-green-light` (`#EAF3DE`) | `border-green-dark` (`#3B6D11`) |
| N/A (wellness carve-out) | `bg-gray-100` | `border-gray-line` |

Keep the tint very subtle — think 10-15% opacity of the accent, not saturated. The page background is already warm off-white `#F7F6F2`; the card tint should feel like a gentle wash, not a bold panel.

### 5b. Readiness circle emphasis

- Current: small amber circle with the number "4"
- Change: make it `w-24 h-24` minimum, bold number centered
- Colour the circle fill based on score:
  - 0-3: coral (`#993C1D`)
  - 4-6: amber (`#BA7517`)
  - 7-10: green (`#3B6D11`)
- Readiness label "/10" below or inside circle, smaller

### 5c. Badge row tightening

- Current: 4 badges in a row
- Change: put them in a compact 2×2 grid aligned to the right of the readiness circle
- Each badge: small rounded-pill shape, label + value

Reference: Slide 9 of the deck (`ClearPath_Deck.pptx`) — open that for visual reference. Match that composition.

---

## Change 6 — Add global vision strip

**Where:** New section between FAQ and final CTA.

**Content:**

```
[Section with warm off-white bg, moderate vertical padding]

  (small caps, wide-letter-spaced, amber)
  WHAT'S NEXT

  (serif heading, center-aligned)
  India first. Global regulatory backbone next.

  (body, muted)
  ClearPath is built for India's 14,000 healthtech companies today. 
  Expansion to USA, EU, UK, and Japan planned 2027+. The India 
  regulatory playbook is becoming the template for emerging markets.
```

Layout: centered column, max-width `max-w-3xl`, text-only (no visuals). Keep it brief — 3 lines. This signals vision to investors without hijacking the founder-conversion flow.

---

## Change 7 — Minor copy tightening

### 7a. Hero secondary CTA context line

**Current:** *"5 minutes. No sign-up. Screenshot-worthy verdict."*

**Change to:** *"5 minutes. No sign-up required. Share-ready verdict."*

"Screenshot-worthy" is colloquial; "share-ready" is cleaner.

### 7b. Stat 3 wording

**Current:** *"70-80% of first-time submissions come back with deficiency letters"*

**Keep as-is** — this is strong. Don't change.

### 7c. Moat 5 pricing reference

**Current:** *"Stage 3 leverages Indian regulatory experts. Software can't fully replace human review at ₹50K value."*

**Change to:** *"Stage 3 leverages 20–30 Indian regulatory experts. Software doesn't replace human judgement at ₹50K value. The network is the defensibility."*

Reason: "20–30 experts" makes the network concrete. Current is vague.

---

## Change 8 — FAQ addition

**Add one FAQ item** — currently missing an important founder question:

**Q: Will my uploaded documents stay private?**

A: Yes. Any PDFs you upload during intake are stored encrypted in Supabase, accessible only via signed URLs, and deleted after 90 days. We never share uploaded documents. See our Privacy Policy for details.

Insert between "Is my data safe?" and "Do you file the application for me?"

---

## Priority order

If you can't do all 8 in one pass, do them in this order:

1. **Change 3** (reorder sections) — biggest conversion impact
2. **Change 1** (expert trust strip) — adds credibility in hero
3. **Change 4** (remove KMC, replace framing) — accuracy
4. **Change 5** (Readiness Card redesign) — visual polish
5. **Change 6** (global vision strip) — stakeholder signal
6. **Change 2** (CDSCO explicit naming) — precision
7. **Change 7** (copy tightening) — polish
8. **Change 8** (FAQ addition) — completeness

Ship after each change. Don't batch for a single "v2 release" — ship incrementally, verify on staging, promote.

---

## What NOT to change

Don't touch these — they're working:
- Hero H1 ("CDSCO changed what counts as a medical device...")
- The 3 problem stats
- The 9-regulation grid
- The 6-step founder journey numbering and content
- Testimonial content (Bhaskar, Dhritiman, Sohit quotes)
- Founder profile section
- Footer disclaimer
- Meta tags / OG preview
- Brand palette (warm off-white, teal, amber, coral)
- Georgia serif for headings, Geist/Inter for body

---

## Reference files

- `clearpath_screens_spec.md` — Screen 6 (Readiness Card) has the full component spec
- `clearpath_landing_copy.md` — original copy doc
- `ClearPath_Deck.pptx` slide 9 — Readiness Card visual reference
- `clearpath_build_plan.md` — Feature 1 (Landing page) in context
