# ClearPath — Screen Specs

Every screen Claude Code needs to build, with layout sketch, components, copy, and interactions. Reads alongside `clearpath_user_journeys.md` and `SKILL.md`.

---

## Layout conventions

All screens:
- Max content width: `max-w-6xl` (Tailwind, ~1152px)
- Horizontal padding: `px-4 md:px-8`
- Vertical rhythm: sections separated by `py-16 md:py-24`
- Font: Georgia (serif) for headings, Inter (sans) for body
- Colors: teal primary `#0F6E56`, amber accent `#BA7517`, backgrounds white

---

## Screen 1 — Landing hero + below-fold

**Purpose.** First impression. Convert visitor to intake form.

**Layout sketch:**
```
┌─────────────────────────────────────────────────────────────┐
│  ClearPath                                    [Sign in]     │  ← header
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    INDIAN DIGITAL HEALTH · REGULATORY READINESS              │  ← eyebrow (amber)
│                                                              │
│    CDSCO changed what counts as                              │  ← H1 (Georgia, 56-72pt)
│    a medical device.                                         │
│                                                              │
│    Your product might be one                                 │
│    you didn't know about.                                    │
│                                                              │
│    Get your free Readiness Card in 5 minutes — no consultant,│  ← subhead (gray-700, 18pt)
│    no consultation call, no guesswork.                       │
│                                                              │
│    [  Start my Readiness Card →  ]                           │  ← primary CTA (teal-deep bg)
│                                                              │
│    Trained on 15+ real Indian healthtech products            │  ← social proof (small gray)
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         ↓ scroll ↓
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│    The regulatory maze Indian healthtech founders navigate   │  ← H2
│                                                              │
│    [9 regulations grid — same as deck slide 3]              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Three stages. One product. Progressive commitment.       │  ← H2
│                                                              │
│    [Free card]    [₹499 draft]    [₹50K concierge]          │  ← 3 tier cards
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    What a Readiness Card looks like                         │  ← H2
│                                                              │
│    [Screenshot of sample card — EkaScribe example]          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Why ClearPath (not a consultant, not a search)           │  ← H2
│                                                              │
│    [5 moat items]                                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    FAQ                                                       │  ← H2
│    > Does my product need CDSCO approval?                    │
│    > How is this different from hiring a consultant?         │
│    > What happens after I pay ₹499?                          │
│    > Is my data safe?                                        │
│    > Who's behind ClearPath?                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    [  Get your Readiness Card →  ]   ← end-of-page CTA      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Privacy · Terms · About · Contact     Made in Bangalore    │  ← footer
└─────────────────────────────────────────────────────────────┘
```

**Components used:** Hero block, eyebrow tag, H1, subhead, primary button, tier card (3x), screenshot frame, FAQ accordion, footer.

**Copy guidance:**
- Eyebrow: ALL CAPS, small, amber, letter-spacing wide
- H1: Georgia serif, 56-72pt desktop / 40pt mobile, line-height 1.1
- Subhead: Inter, 18pt, gray-700, max 2 lines
- CTA: primary teal background, white text, rounded-lg, generous padding

**Interactions:**
- CTA click → scroll to/navigate to intake form (`/start`)
- FAQ click → accordion expand
- Sign in: deferred, hide for MVP

**Responsive:**
- Mobile: H1 collapses to 40pt, full-width cards, single-column everywhere
- Tablet: 2-column tier cards, 2-column FAQ
- Desktop: 3-column tier cards, full layout

---

## Screen 2 — Intake form (/start)

**Purpose.** Collect one-liner + URL + email. Enters engine.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│    Tell us about your product                   │  ← H2
│    We'll analyse it against 9 regulations in    │
│    about 5 minutes.                              │  ← subhead
│                                                  │
│    ┌───────────────────────────────────────┐   │
│    │ What does your product do?            │   │  ← label
│    │ ┌─────────────────────────────────┐   │   │
│    │ │ One sentence. E.g. "AI tool that│   │   │  ← textarea placeholder
│    │ │ flags early Alzheimer's from    │   │   │
│    │ │ MRI scans"                      │   │   │
│    │ └─────────────────────────────────┘   │   │
│    │                         0 / 200 chars │   │  ← char counter
│    │                                        │   │
│    │ Product website (optional)            │   │
│    │ ┌─────────────────────────────────┐   │   │
│    │ │ https://                         │   │   │
│    │ └─────────────────────────────────┘   │   │
│    │                                        │   │
│    │ Your email                            │   │
│    │ ┌─────────────────────────────────┐   │   │
│    │ │ founder@domain.com               │   │   │
│    │ └─────────────────────────────────┘   │   │
│    │ We'll email your Readiness Card      │   │  ← helper text
│    │ within 5 minutes. No spam.           │   │
│    │                                        │   │
│    │ ☐ Also send me weekly updates on     │   │  ← optional newsletter opt-in
│    │   Indian digital-health regulation    │   │
│    │                                        │   │
│    │   [  Start analysis →  ]             │   │  ← primary CTA
│    │                                        │   │
│    │ 🔒 Your data is used to generate     │   │  ← DPDP notice
│    │   your card only. Deleted after 90   │   │
│    │   days. Never shared. [Read more]    │   │
│    └───────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Form card, textarea with char counter, URL input with protocol helper, email input, checkbox, primary button, DPDP notice.

**Copy guidance:**
- Keep form copy conversational. Avoid "Please provide..." — use "What does your product do?"
- Placeholder text should read like an example, not instructions.
- DPDP notice: required for compliance, but keep short and linkable.

**Validation:**
- One-liner: required, 20–200 chars.
- URL: optional, must be valid URL if entered.
- Email: required, valid format.
- On submit: disable button, show loading state inline.

**Responsive:** Single column always; form takes full viewport on mobile.

---

## Screen 3 — Pre-route / Decomposer scope picker

**Purpose.** For platforms, let user pick which sub-feature to scope.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│    HealthHub looks like a platform with         │  ← H2
│    multiple features                            │
│    Each feature may have different regulatory   │
│    treatment. Pick which to assess first.       │
│                                                  │
│    ┌───────────────────────────────────────┐   │
│    │ Patient records platform              │   │
│    │ ─────────────────────                 │   │
│    │ Likely not a medical device.          │   │
│    │ DPDP + ABDM core compliance applies.  │   │
│    │                                        │   │
│    │ [ Scope this feature → ]               │   │  ← CTA per card
│    └───────────────────────────────────────┘   │
│                                                  │
│    ┌───────────────────────────────────────┐   │
│    │ Teleconsultation                      │   │
│    │ ─────────────────────                 │   │
│    │ MCI Telemedicine guidelines apply.    │   │
│    │ Not a medical device.                 │   │
│    │                                        │   │
│    │ [ Scope this feature → ]               │   │
│    └───────────────────────────────────────┘   │
│                                                  │
│    ┌───────────────────────────────────────┐   │
│    │ AI symptom checker        ⚠ HIGH RISK │   │  ← badge
│    │ ─────────────────────                 │   │
│    │ Likely Class B/C SaMD.                │   │
│    │ CDSCO MDR applies.                    │   │
│    │                                        │   │
│    │ [ Scope this feature → ]               │   │
│    └───────────────────────────────────────┘   │
│                                                  │
│    — or —                                       │
│                                                  │
│    [ Analyse all three — ₹1,497 ]               │  ← bulk upgrade
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Stacked feature cards, risk badge (when high), per-card CTA, secondary CTA for bulk.

**Copy guidance:**
- Headers on feature cards are the decomposer's feature names.
- Body is 2 lines: regulatory treatment + key regulation.
- High-risk features get a small amber/coral badge.
- "Analyse all three" pricing = N × ₹499 (bulk analysis not discounted at MVP).

**Interactions:**
- Per-feature CTA: scope to that feature, proceed to 7-Q wizard.
- Bulk CTA: add all features to cart, pay ₹499 × N, run each through engine sequentially, deliver N cards.

---

## Screen 4 — Conflict resolution modal

**Purpose.** When one-liner and website disagree, surface the conflict and let user choose.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│   ⚠ Your description and website classify       │  ← H3 with warning icon
│     very differently                             │
│                                                  │
│   ┌─────────────────┐   ┌─────────────────┐   │
│   │ You said        │   │ Your website    │   │  ← two columns
│   │                 │   │ said            │   │
│   │ "healthcare     │   │ "AI-powered     │   │
│   │  analytics      │   │ arrhythmia      │   │
│   │  platform"      │   │ detection"      │   │
│   │                 │   │                 │   │
│   │ Typically NOT   │   │ Likely Class C  │   │
│   │ a medical device│   │ SaMD            │   │
│   └─────────────────┘   └─────────────────┘   │
│                                                  │
│   Which one should we scope?                    │
│                                                  │
│   [ Scope the SaMD ] [ Scope the platform ]     │
│   [ Scope both features (₹998) ]                │
│                                                  │
│   Close [X]                                     │
└─────────────────────────────────────────────────┘
```

**Components:** Modal, side-by-side comparison cards, action buttons (3).

**Interactions:**
- Primary path: pick one, proceed to wizard with scoped feature.
- "Both": add both to cart, bulk analyze.
- Close: cancel, return to intake form.
- Card meta records the conflict and user's choice for transparency.

---

## Screen 5.0 — Conflict disclosure (conditional, appears on Q1 only)

**Purpose.** Transparent disclosure when one-liner and documents/URL classify the product differently. Appears once on Q1, not persistent across Q2–Q7.

**When it appears:**
- `assessments.meta.conflict_detected === true`
- `assessments.meta.conflict_details.severity in ['high', 'medium']`
- `assessments.meta.conflict_acknowledged !== true`

**Layout sketch:**

```
┌───────────────────────────────────────────────────┐
│                                                    │
│   {Product name} · Question 1 of 7                 │
│   [|        |        |        |        |        ]  │  ← 7 segments, all upcoming
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
- H3 heading ("Quick heads up" first time, "Still a mismatch" on reappearance)
- Two-column comparison sub-cards with small-caps labels
- Explanation paragraph (readable prose)
- Primary + secondary CTAs in a row
- Helper text (muted, italic)

**Interactions:**

| Element | Action |
|---|---|
| "Continue to questions →" | Set `meta.conflict_acknowledged = true`, fire `wizard_conflict_continued`, scroll card out, render Q1 below |
| "← Edit my description" | Fire `wizard_conflict_edit_clicked`, redirect to `/start?resume={assessment_id}` |

**Desktop layout:** two-column comparison side-by-side.
**Mobile (375px):** columns stack vertically, CTAs stack with primary first.

**Back-navigation behaviour:** once acknowledged (Continue clicked), the card does NOT re-render on Q2 → Q1 back-nav, nor on later resume of the same assessment. It only re-renders if the user edits via the intake form AND the new pre-router run still detects high/medium-severity conflict — in that case the heading changes to "Still a mismatch" and a `wizard_conflict_reappeared` event fires.

---

## Screen 5 — 7-Q wizard

**Purpose.** Gather 7 structured answers that drive classification.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│   NeuroScan · Question 2 of 7                   │  ← progress header (teal)
│   [████████|████████|         |         |       │  ← 7 equal-width segments
│    |         |         |         ]               │    teal for reached, #E5E5E5 upcoming
│                                                  │
│   How much does your product influence          │  ← question H2
│   clinical decisions?                            │
│                                                  │
│   Helper: "Inform" = displays data. "Drive" =    │  ← italic helper
│   suggests action. "Diagnose/treat" = makes      │
│   or executes clinical decisions.                │
│                                                  │
│   ┌───────────────────────────────────────┐   │
│   │ ○ Informs — displays information      │   │  ← radio option
│   │   only. Clinician makes decisions.    │   │
│   └───────────────────────────────────────┘   │
│                                                  │
│   ┌───────────────────────────────────────┐   │
│   │ ● Drives — flags or suggests          │   │  ← selected radio
│   │   something the clinician should act  │   │
│   │   on.                                  │   │
│   └───────────────────────────────────────┘   │
│                                                  │
│   ┌───────────────────────────────────────┐   │
│   │ ○ Diagnoses or treats — makes or      │   │
│   │   executes clinical decisions.        │   │
│   └───────────────────────────────────────┘   │
│                                                  │
│                                                  │
│   [← Back]                    [Next →]          │  ← nav
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Progress stepper (7 equal-width segments with 4px gaps between them, 6px tall, 2px rounded corners; reached segments filled teal `#0F6E56`, upcoming segments `#E5E5E5`; full bar spans container width — clearer spatial progress cue than floating dots, reads better at 375px), H2 question, helper text, radio card list, nav buttons.

**Interactions:**
- Selecting an option → card fills with teal border + light teal background, checkmark appears.
- Next button enabled once option selected.
- Back navigates to previous question without losing state.
- Q2 special: if user picks "inform" but scrape shows decision-support language, trigger Q2 follow-up screen before Next.

**Q2 follow-up screen:**
```
┌─────────────────────────────────────────────────┐
│   Quick check                                    │
│                                                  │
│   You said "informs only." But your website      │
│   mentions phrases like:                         │
│                                                  │
│     "flags early-stage Alzheimer's"              │
│     "suggests diagnosis"                         │
│                                                  │
│   These sound more like "drives" — the tool      │
│   nudges the clinician toward an action.         │
│                                                  │
│   Should we update your answer?                  │
│                                                  │
│   [ Yes, change to "drives" ]                    │
│   [ No, keep "informs only" ]                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

If user keeps "informs," card meta notes: *"User-declared: inform. Website suggests: drive. Honored user choice."*

---

## Screen 6 — Readiness Card (Tier 0 output)

**Purpose.** THE core output. Screenshot-worthy. Drives Tier 2 upsell.

**Layout sketch:**
```
┌─────────────────────────────────────────────────────────────┐
│   REGULATORY RISK PROFILE                                    │  ← eyebrow (small, gray)
│                                                              │
│   NeuroScan                                                  │  ← product name (Georgia, 28pt)
│   AI tool that flags early-stage Alzheimer's from MRI scans  │  ← descriptor (small gray)
│                                                              │
│   ┌────┐   ┌──────────┐ ┌──────────┐                        │
│   │ 4  │   │ Risk: Hi │ │ MD?: Yes │                        │  ← readiness circle + 4 badges
│   │/10 │   ├──────────┤ ├──────────┤                        │
│   └────┘   │ Class C  │ │ 9-14 mo  │                        │
│    amber   └──────────┘ └──────────┘                        │
│                                                              │
│   Verdict                                                    │
│   ────────                                                   │
│   Likely Class C SaMD under CDSCO's evolving 2025 draft.     │  ← soft certainty
│   Your AI-driven flagging of Alzheimer's crosses into        │
│   clinical decision-influence territory. Approval likely     │
│   required; pathway evolving.                                │
│                                                              │
│   Why this may be regulated                                  │
│   ─────────────────────────                                 │
│   Your product interprets imaging data and outputs a         │
│   clinical suggestion. CDSCO's Oct 2025 SaMD draft classifies│
│   such tools as Class B/C depending on criticality.          │
│                                                              │
│   Fix first · Top 3 gaps                                     │
│   ─────────────────────                                     │
│   ⚠ HIGH  ISO 13485 Quality Management System not in place   │
│   ⚠ HIGH  Clinical validation study pending                  │
│   ⚠ MED   CDSCO MD-12 test license not filed                 │
│                                                              │
│   Regulation snapshot                                        │
│   ────────────────────                                      │
│   CDSCO MDR · required                                       │  ← 9 pills, color-coded
│   CDSCO Pharmacy · N/A                                       │
│   DPDP Act · required_SDF                                    │
│   ICMR AI · required                                         │
│   ABDM · conditional                                         │
│   NABH · conditional                                         │
│   MCI Telemed · N/A                                          │
│   IRDAI · N/A                                                │
│   NABL · conditional                                         │
│                                                              │
│   Time to approval                                           │
│   ────────────────────                                      │
│   9-14 months (baseline) · 7-12 months with ClearPath        │
│                                                              │
│   Based on CDSCO published SLAs for Class C + your current   │
│   prototype stage + typical 1.5 query iterations.            │
│                                                              │
│   ─────────────────────────────────────                     │
│                                                              │
│   Next step                                                  │
│   ──────────                                                 │
│                                                              │
│   Generate your CDSCO-ready Regulatory Draft Pack for ₹499   │
│                                                              │
│   ┌─────────────────────────────────────┐                   │
│   │  Get the Draft Pack · ₹499 →       │  ← primary CTA    │
│   └─────────────────────────────────────┘                   │
│                                                              │
│   Or share this card with your co-founder / advisor          │
│   [ Copy link ]   [ Download PDF ]   [ Email me ]            │
│                                                              │
│   Talk to an expert instead (Tier 3 · ₹50K)  →              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components:** Card shell (white, border, rounded), readiness circle, badge row (4 badges), section headers, verdict text, gap list with severity pills, 9 regulation pills, timeline block, primary CTA, share actions row, Tier 3 secondary CTA.

**Copy guidance:**
- Verdict = 1-2 sentences. Must use soft certainty language.
- Top 3 gaps = short imperative, severity-tagged.
- Regulation snapshot = 9 pills, always all 9, color-coded by verdict.
- Timeline = range, anchored explicitly.

**Interactions:**
- Readiness circle: hover → tooltip showing 5 sub-dimensions (regulatory clarity, QMS, technical docs, clinical evidence, submission maturity).
- Regulation pill: click → side drawer with full verdict + rationale + forms.
- Gap: click → drawer with detailed "how to fix."
- Share: copies `clearpath.in/c/{slug}` to clipboard + toast confirmation.
- Download PDF: generates print-friendly PDF of the card.
- Email me: if user has no email, open email capture modal.

**Responsive:**
- Mobile: badges wrap to 2x2 grid; regulation snapshot becomes 3-column grid of pills; verdict/gaps/regs stack vertically.
- Desktop: 1-column layout with all sections visible.

**Edge content:**
- If MD status = `not_medical_device`: replace readiness circle with a check-badge; body copy: *"CDSCO does not apply. Your primary compliance burden is DPDP at scale."*
- If product rejected (regulator/investor): this screen isn't reached — see Screen 11 (polite decline).

---

## Screen 7 — Tier 2 upgrade flow

**Purpose.** After free card, convert to ₹499 purchase.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│   Your Regulatory Draft Pack                    │  ← H2
│                                                  │
│   For NeuroScan — delivered in ~10 minutes      │
│   to your email                                  │
│                                                  │
│   What's inside:                                │
│   ─────────────                                 │
│   ✓ Intended Use Statement (CDSCO MDR format)   │  ← checklist
│   ✓ Risk Classification Justification           │
│   ✓ Clinical Context narrative                  │
│   ✓ Device Description + technical summary      │
│   ✓ Essential Principles checklist              │
│   ✓ CDSCO form mapping (MD-12, MD-9 sections)   │
│   ✓ Algorithm Change Protocol draft             │
│   ✓ Pathway + 9-step timeline                   │
│                                                  │
│   This typically costs ₹50K-1L at consultants.  │  ← anchoring
│                                                  │
│   ┌─────────────────────────────────────┐     │
│   │                                       │     │
│   │  Pay ₹499 · Get Draft Pack → 10 min  │     │  ← primary CTA (teal bg)
│   │                                       │     │
│   └─────────────────────────────────────┘     │
│                                                  │
│   Secure payment via Razorpay. UPI, card, net    │
│   banking accepted.                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Section card, checklist with check icons, CTA button, payment provider note.

**Interactions:**
- CTA → opens Razorpay Payment Link modal.
- On success → redirect to "Generating your pack..." loading screen (5-10 min simulated progress).
- On completion → Draft Pack email + redirect to dashboard view.

---

## Screen 8 — Draft Pack email + PDF

**Purpose.** Deliver Tier 2 output.

**Email (transactional, plain text or minimal HTML):**
```
Subject: Your CDSCO Draft Pack for NeuroScan is ready

Hi Arjun,

Your Regulatory Draft Pack is attached to this email
(NeuroScan_DraftPack.pdf — 18 pages).

What to do next:
1. Review the pack for accuracy — especially the Clinical
   Context and Intended Use sections. These are drafted
   from your answers; they may need refinement.
2. Hand to your regulatory consultant, or use as a
   starting template for CDSCO submission.
3. Consider Tier 3 Submission Concierge if you want
   expert review + iteration (2-3 weeks, ₹50K).

Your Readiness Card is still accessible at:
https://clearpath.in/c/abc123

Questions? Reply to this email.

— The ClearPath team
```

**PDF structure:**
- Cover page (product name, date, ClearPath logo)
- Executive Summary (150-200 words)
- Each section (as listed in Screen 7) on its own page with drafted content
- Footer on each page: "ClearPath Draft Pack — Not legal advice. Review with a regulatory expert before submission."

---

## Screen 9 — Tracking Dashboard (Tier 2+ only)

**Purpose.** Ongoing status view across all 9 regulations for a product.

**Layout sketch:**
```
┌─────────────────────────────────────────────────────────────┐
│   NeuroScan · Regulatory Tracker       [Edit] [Settings]    │  ← header
│                                                              │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │
│   │ 4 of 9  │ │    2    │ │    1    │ │    3 mo         │  │  ← summary stats row
│   │applicbl │ │complete │ │deficiency││ to full comply  │  │
│   └─────────┘ └─────────┘ └─────────┘ └─────────────────┘  │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐ │
│   │ REGULATION            STATUS       PROGRESS          │ │  ← table header
│   │                                      SCOPE DOCS ...  │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │ CDSCO MDR 2017        Deficiency    ●──●──●──○       │ │  ← 4-stage stepper
│   │                                      ETA: 3 mo       │ │
│   │                                      Action: Respond │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │ CDSCO Pharmacy        N/A           ─ ─ ─ ─ ─ ─      │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │ DPDP Act 2023         In progress   ●──●──○──○       │ │
│   │                                      ETA: 6 wks      │ │
│   │                                      Action: DPO     │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │ ... (6 more rows)                                    │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                              │
│   ┌────────────────────────────────┐                       │
│   │ CRITICAL THIS WEEK             │                       │  ← right panel
│   │ ── ── ── ── ── ── ──           │                       │
│   │ Dec 15                          │                       │
│   │ Respond to CDSCO deficiency    │                       │
│   │ [ View deficiency letter → ]   │                       │
│   │                                 │                       │
│   │ Dec 18                          │                       │
│   │ Appoint DPO for DPDP           │                       │
│   │                                 │                       │
│   │ Dec 20                          │                       │
│   │ Schedule NABH assessor visit   │                       │
│   └────────────────────────────────┘                       │
│                                                              │
│   ┌────────────────────────────────┐                       │
│   │ Get an expert on this case    │                       │
│   │ Submission Concierge · ₹50K   │                       │
│   │ [ Request concierge → ]        │                       │
│   └────────────────────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components:** Dashboard header, 4-stat summary row, tracking table with progress steppers, status pills, critical-this-week panel, concierge upsell card.

**Progress stepper per row:** 4 dots representing (Scope → Docs → Submit → Approved). Dot states: filled green (done), filled amber (in progress), empty (not started), dashed line (N/A).

**Interactions:**
- Click regulation row → side drawer with full history + documents.
- Status pill click → filter table by status.
- "Respond to query" action → opens modal with deficiency letter + AI-drafted response button.

**Data refresh:** auto-poll every 24h for CDSCO rule changes, email users if a regulation's verdict changes.

---

## Screen 10 — Submission Concierge intake (Tier 3 · ₹50K)

**Purpose.** Capture everything an expert reviewer needs to get started.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│   Get an expert on your case                    │  ← H2
│                                                  │
│   ₹50K · 2-3 weeks · Expert-reviewed            │
│                                                  │
│   Process:                                       │
│   ──────────                                     │
│   Day 1     Upload + intake                     │
│   Day 2-3   Expert assignment + read            │
│   Day 4-7   Review + classification valid.      │
│   Day 8-14  Refinement + response draft         │
│   Day 15-21 1 iteration                         │
│                                                  │
│   Deliverables:                                 │
│   ──────────                                     │
│   ✓ Refined documents                           │
│   ✓ Classification re-validation                │
│   ✓ QMS checklist (ISO 13485)                   │
│   ✓ Clinical validation plan review             │
│   ✓ 1 iteration                                 │
│                                                  │
│   ┌───────────────────────────────────────┐   │
│   │ Product name                          │   │  ← form
│   │ [                                  ]   │   │
│   │                                        │   │
│   │ CDSCO application number (if any)     │   │
│   │ [                                  ]   │   │
│   │                                        │   │
│   │ Current submission (PDF)              │   │
│   │ [ Upload · drag or click ]             │   │
│   │                                        │   │
│   │ Deficiency letter (if any)            │   │
│   │ [ Upload · drag or click ]             │   │
│   │                                        │   │
│   │ Target submission / response date     │   │
│   │ [ Date picker ]                        │   │
│   │                                        │   │
│   │ Brief context (200 words)             │   │
│   │ [                                  ]   │   │
│   │                                        │   │
│   │ [  Pay ₹50K · Request concierge →  ] │   │
│   └───────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Process timeline, deliverables list, form with file upload, date picker, primary CTA.

**Interactions:**
- File upload: drag-drop or click. Max 10MB per file. Supports PDF only.
- Payment → Razorpay.
- On success → confirmation screen + kickoff email to customer + ticket to expert pool.

---

## Screen 11 — Polite decline (regulator / investor / non-product)

**Purpose.** When pre-router classifies as meta-entity, don't make them feel stupid.

**Layout sketch:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│   Almost — but not quite                        │  ← H2
│                                                  │
│   ClearPath assesses products. ABDM is the      │  ← explanation
│   regulatory infrastructure we assess *against*.│
│                                                  │
│   If you're evaluating an application that      │
│   integrates with ABDM, try entering that       │
│   product instead.                               │
│                                                  │
│   Or — if you're here to see how ClearPath      │
│   approaches ABDM compliance, see our guide.    │
│                                                  │
│   ┌────────────────────────┐                   │
│   │  ← Try a product        │                   │
│   └────────────────────────┘                   │
│                                                  │
│   ┌────────────────────────┐                   │
│   │  Read our ABDM guide → │                   │
│   └────────────────────────┘                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Components:** Explanation text, 2 CTAs (back to intake + content link).

**Copy variants:**
- If pre-router detected "regulator" (ABDM, CDSCO, ICMR): copy above.
- If detected "investor" (Rainmatter, accelerators): *"We assess products, not funds. Have a portfolio company in mind we can help with?"*
- If detected "service provider" (hospital chains, labs): *"We assess products built for healthcare. Your hospital may use products we can assess — intro us to your tech partner."*

---

## Design tokens (Tailwind config)

```ts
theme: {
  extend: {
    colors: {
      'teal-deep': '#0F6E56',
      'teal-light': '#E1F5EE',
      'amber-brand': '#BA7517',
      'amber-light': '#FAEEDA',
      'amber-deep': '#633806',
      'coral-brand': '#993C1D',
      'coral-light': '#FAECE7',
      'green-dark': '#3B6D11',
      'green-light': '#EAF3DE',
      'purple-dark': '#5B2B8E',
      'purple-light': '#EDE5F5',
      'blue-dark': '#0C447C',
      'blue-light': '#E6F1FB',
      'gray-ink': '#1A1A1A',
      'gray-text': '#3D3D3A',
      'gray-muted': '#5F5E5A',
      'gray-line': '#B4B2A9',
      'gray-bg': '#F1EFE8',
    },
    fontFamily: {
      serif: ['Georgia', 'Playfair Display', 'serif'],
      sans: ['Inter', 'Calibri', 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      'soft': '0.375rem',
      'card': '0.5rem',
      'pill': '9999px',
    },
  }
}
```

---

## Build order for Claude Code

**Week 1 (by Apr 27 — Weekender):**
1. Screen 1 (Landing) — static first, intake form last.
2. Screen 2 (Intake form) — wired to pre-router API.
3. Screen 6 (Readiness Card) — the most-important screen; spend effort here.
4. Screen 7 (Tier 2 upgrade) + Razorpay integration.
5. Screen 8 (Draft Pack email delivery) — basic version.
6. Screen 11 (Polite decline).

**Week 2 (post-Weekender):**
7. Screen 5 (7-Q wizard) — can be simple stepper at first.
8. Screen 3 (Scope picker) — only for platforms.
9. Screen 4 (Conflict modal) — edge case handling.

**Week 3-4:**
10. Screen 9 (Tracking dashboard).
11. Screen 10 (Concierge intake) + expert assignment workflow.

**Hard constraints Claude Code should never break:**
- Never use localStorage/sessionStorage (not supported).
- Never skip the certainty post-processor.
- Never render a card without evaluating all 9 regulations.
- Every payment must go through Razorpay (UPI + cards + net banking).
- Every form must be mobile-usable (test at 375px wide).
