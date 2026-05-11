# ClearPath — Venture Center briefing · design specification

> **Internal draft v1 — design reference for the Venture Center regulatory team briefing deck.**
>
> Authored 2026-05-12. Companion to `clearpath-venture-center-briefing.html` (rendered source) and `clearpath-venture-center-briefing.pdf` (Wed-demo artifact). This file is the design specification: slide-by-slide intent, layouts, copy decisions, presenter notes. Useful for (a) the founder rehearsing the deck, (b) a designer rebuilding in Figma/Keynote at higher fidelity, (c) revising the deck post-Wed feedback.

---

## Global design choices

**Palette.** ClearPath Teal Trust — `--teal-700 #075f54` (primary), `--teal-600 #0d8676` (interactive), `--teal-50 #effaf7` (surface tint). Gray scale `--gray-50` through `--gray-900` for typographic hierarchy. Accents: amber for `UNCERTAIN` callouts, indigo for "roadmap" flags. No reds — reads as alarm; this deck is calm.

**Typography.** System font stack with Inter preference. Hierarchy:
- Deck title (slide 1): 38pt semibold, -0.02em tracking, teal accent on key noun
- Slide title: 22pt semibold, gray-900
- Slide subtitle: 12pt regular, gray-600, max 220mm width — never let the subtitle wrap to >3 lines
- Body / mockup content: 9-10.5pt
- Mockup UI elements: 7.5-8pt to match real product proportions
- Labels: 8.5pt uppercase, 0.08em letter-spacing, gray-500

**Page geometry.** A4 landscape (297×210mm). 14mm top/bottom margin; 18mm left/right. Header bar (brand + section tag + separator) + body + footer (slide name · INTERNAL DRAFT chip · page X/14). Edge-to-edge for the title slide; framed for content slides.

**Mockup convention.** Every product screen is a *mockup* — built in HTML/CSS from the actual ClearPath UI vocabulary (RadioCard, WizardStepper, progress dots, badge styles). Production surfaces are shown clean; Sprint 3+ surfaces carry a small `Sprint 3+` tag in the top-right corner to avoid implying they exist today. Each mockup has:
1. A browser-bar header with the route URL
2. A body matching real component spacing
3. An italic caption explaining what the reader is looking at (where helpful)

**Tone rules** (every slide).
- Calm, regulatory, systems-aware.
- No "disrupt", no "instant", no "fully automated".
- Numbers carry sources inline (never invented).
- "We" not "I" throughout.
- Acknowledge uncertain areas openly.

**Anti-patterns** the deck avoids by construction.
- No TAM bar charts.
- No team-photo grid.
- No competitor matrix.
- No bombastic claims of replacing experts. An explicit "What ClearPath is NOT" trust block sits on slide 9.
- No "AI" hype. Vocabulary tightened deck-wide: "AI extracts" → "structured extraction"; "AI extraction" → "structured extraction"; "AI reasoning" → "rules + workflow logic"; "AI generation" → "workflow-assisted drafting". Slide 6 subtitle anchors the framing: "rules + ontology + workflow engine — deterministic reasoning over CDSCO rule structure, not generative AI invention."
- No autonomous-output framing. Outputs are positioned as "editable submission scaffolds" or "structured submission workspaces" rather than "Draft Packs". The internal "Draft Pack" term is preserved only in the markdown source bible, not in this regulator-facing deck.
- No score-led readiness verdict. Readiness is described in qualitative tiers ("Early pilot stage", "Indicative — not a validated benchmark") rather than a numeric "62 / 100" headline.

---

## Slide-by-slide specification

### Slide 1 — Title

**Layout.** Edge-to-edge title with soft teal radial gradients top-right + bottom-left. Title stack pushed to vertical center; metadata row at the foot of the body; small SVG workflow doodle bottom-right at 50% opacity.

**Copy (final).**
- Eyebrow: "Regulatory readiness infrastructure"
- Title: "Regulatory readiness for *Indian medtech*." (em on "Indian medtech" in teal-700)
- Subtitle: "A workflow simplification layer for founders navigating CDSCO. This briefing is for the Venture Center regulatory team — context ahead of Wednesday's live demo."
- Meta: Date · Audience · Format (3 columns)

**Visual hierarchy.** Eyebrow (small, teal, ALL CAPS) → Title (large, dual-weight via em) → Subtitle (mid, gray-600) → Meta (small, structured).

**Presenter note.** Open with one sentence: "Before we walk through the live demo on Wednesday, we wanted to give your team context on what they'll see." Skip the slide quickly.

---

### Slide 2 — What you'll see Wednesday

**Layout.** 4-column horizontal flow with arrow separators. Each column = one stage: Intake / Readiness reading / Tier B Wizard / Editable submission scaffold. Each column shows a stage label (numbered 01-04), stage name, one-line description, and a small mockup of the actual screen. Below the flow: a teal-tinted disclaimer band.

**Mockups embedded.**
- **Intake mockup**: drag-drop zone (teal-50 background, dashed teal border) + "✓ cardiorhythm-deck.pdf · 4.2 MB" line beneath
- **Readiness reading mockup**: "Readiness tier · Early pilot stage" textual label (softened from a 62/100 numeric score) + "Class C SaMD" badge + italic "Indicative · not a validated benchmark" line + 3 top-gap bullets
- **Tier B Wizard mockup**: 6-dot progress + B3 step + predicate input rows
- **Submission scaffold mockup**: section list ("Submission scaffold · MD-7") with status icons (✓ / ◐ / ○)

**Disclaimer copy (verbatim, with newly-added trust line emphasised).**
> "ClearPath structures readiness workflows. It does not replace regulatory consultants or guarantee approvals. **Outputs are designed to support founder preparedness and expert review — not autonomous regulatory decision-making.** Every section is editable and intended as a starting point for qualified regulatory experts."

**Language tightening.** "AI extracts ~22 structured fields" → "Structured extraction surfaces ~22 fields". Step 02 label changed from "Risk / readiness card" to "Readiness reading" to reduce the connotation of a scored verdict.

**Presenter note.** "These are the four touchpoints. The disclaimer band is deliberately prominent — the system is a preparedness layer, not an autonomous decision-maker. Wednesday's demo walks each touchpoint with a real founder profile — CardioRhythm, a Class C SaMD."

---

### Slide 3 — Current scope of structured workflows

**Layout.** Subtitle → 3-item legend → 4×2 grid of 8 scope tiles. Each tile is colour-coded by maturity: green/teal border = production, amber border + cream fill = experimental, gray = roadmap.

**Eight tiles.**
| Tile | Status | Forms covered |
|---|---|---|
| Medical device — Class A/B/C/D mfg | Production | MD-3 → MD-5; MD-7 → MD-9 |
| Software as Medical Device (SaMD) | Production | MD-3 / MD-7 + SaMD overlay |
| In-vitro diagnostics (IVD) | Experimental | MD-3 / MD-7 + MD-24/25 + MD-28/29 |
| Clinical investigation (pre-commercial) | Experimental | **MD-12 → MD-13 + MD-22 → MD-23 + MD-26 → MD-27** |
| Combination products | Sprint 3+ roadmap | PMOA-dependent + DCG(I) joint review |
| Import pathways | Sprint 3+ roadmap | MD-14/15 + MD-16/17 + MD-18/20 |
| Pharma-linked workflows | Sprint 3+ roadmap | CT-04/04A/06 + NDCT 2019 + Form 22/25 |
| Loan licence + personal import | Sprint 3+ roadmap | MD-4/6 + MD-8/10 + MD-20/21 |

**Critical:** Clinical investigation tile must explicitly list both **MD-12/13 (test licence to manufacture)** AND **MD-22/23 (CI permission)** — per founder feedback. Currently does.

**Presenter note.** "This is honest about what's in product today. The colour split — green production, amber experimental, gray roadmap — is the same labelling we use internally. We are not implying full coverage."

---

### Slide 4 — TRL-aligned workflow architecture

**Layout.** Subtitle → TRL ladder (7 cells, TRL 3 through 9) with teal underline on covered stages → below, 4 phase tiles in a row mapped to TRL ranges.

**Four phase tiles.** Intake (TRL 3-4) · Tier A + Risk Card (TRL 5-6) · Tier B + Draft Pack (TRL 7-8) · Submission readiness (TRL 9).

**Each tile.** Phase name (large) + brief description + "Shows:" line listing the outputs at that stage.

**Visual cue.** The TRL ladder cell positions visually anchor the phase tiles below — the reader's eye follows TRL → phase. The "covered" underline tells the reader where ClearPath is active; TRL 3 and TRL 9 are not the primary surface.

**Presenter note.** "Progressive disclosure is the design principle here. A team at TRL 4 should not see Tier B — they don't need predicate questions yet. ClearPath shows depth only when the team has the evidence to engage with it."

---

### Slide 5 — Representative founder journeys

**Layout.** Subtitle → 2×2 grid of 4 persona cards.

**Four personas.**
1. **AI/ML SaMD founder** — Class B or C, MD-7→MD-9 + ACP overlay, ~6-9 mo (no-predicate adds 12-24)
2. **Implantable device startup** — Class D, MD-7→MD-9, 3-6 mo published; longer in practice
3. **Clinical investigation pathway** — **MD-12/13 (pre-trial) + MD-22/23 (trial) + MD-26/27 (no-predicate)** — three paired permissions; common rejection cause is wrong sequencing
4. **IVD diagnostics startup** — own scale + MD-24/25 + MD-28/29 + marketing licence; in-country CPE mandatory; TB serology + malaria-antibody RDTs are prohibited categories

**Critical:** Persona 3 (CI pathway) must explicitly split MD-12/13 from MD-22/23 per founder feedback — the design now lists `Pre-trial · MD-12 → MD-13 test licence to manufacture` and `Trial · MD-22 → MD-23 CI permission` as separate dt/dd rows. Pain line specifically calls out the sequencing rejection cause.

**Each card.** Icon chip (3-letter code) + name + tagline + 3-row dl with class/forms/timeline + italic "Pain:" footer.

**Presenter note.** "Four shapes from a set of fourteen we cover in the source document. The pain line per card is from real ClearPath user research and CDSCO FAQ patterns — not invented."

---

### Slide 6 — Regulatory reasoning compression (the moat)

**Subtitle copy.** "~44 structured fields drive a graph of dozens of forms and documents. **Rules + ontology + workflow engine** — deterministic reasoning over CDSCO rule structure, not generative AI invention."

**Layout.** Subtitle → 2-column: left is the 5-layer system stack (each layer is a coloured bar with name + description + monospace example); right is a card showing a small SVG branching-decision tree under the label "Branching decisions encoded in rules".

**Five layers (top → bottom).**
1. Founder input (gray accent)
2. Ontology mapping (teal-500)
3. Workflow engine (teal-600)
4. Document graph (teal-700)
5. **Workflow-assisted drafting** (indigo) — renamed from "Draft generation". Layer description: "Per-section scaffold with explicit uncertainty flags. Founder-editable. Auditable provenance back to input fields. Expert review remains in the loop."

Each separated by a `▾` arrow. The teal escalation in colour conveys depth-of-reasoning.

**Right column — SVG branching diagram.** Two sequential decisions, each with yes/no branches, leading to concrete pathway outcomes:
1. **Is it SaMD?** yes → SaMD overlay + ACP if AI/ML adaptive; no → Standard MDR hardware MD pathway.
2. **Predicate exists?** yes → Direct submission (MD-3/5 SLA or MD-7/9 CLA); no → Novel device pathway (MD-13 → MD-26/27 + MD-22/23 if CI needed).

The two decisions merge into a single converging branch in the middle of the diagram. Decision pills are rounded rectangles with `Is it SaMD?` / `Predicate exists?` labels; outcome boxes are teal-filled. Footer micro-label: "Two of many decision branches encoded in the engine".

**Caption under SVG.** "A small slice of the deterministic decision tree. The same shape applies to dozens of other branches (sterile / patient-contact / drug content / veterinary / no-predicate)."

**Presenter note.** "This is the slide where we want to give your team confidence that the system isn't generative AI guessing. Each answer is a deterministic input into an encoded rule structure. The model layer is used for structured extraction and drafting at the edges — the core reasoning is encoded as rules + ontology + workflow engine."

---

### Slide 7 — Worked example (Class C AI/ML SaMD)

**Layout.** Subtitle → 3×2 grid of 6 numbered example steps. Each step has a pin (teal circle with number) + step title + mockup + italic "what just happened" note. Below the grid: a teal-tinted closing line.

**Six steps.**
1. Pitch deck upload (intake mockup)
2. **Structured extraction** (renamed from "AI extraction") — monospace field-extract mockup
3. Tier A — prefilled (wizard mockup with "4 of 7 prefilled" badge)
4. **Readiness reading** (renamed from "Risk Card") — readiness-tier textual label (softened from a 54/100 numeric score) + "Class C SaMD" badge + italic "Readiness tier · indicative only" + recommended path
5. Tier B — prefilled (wizard mockup with "B1, B2, B5, B6 prefilled" badge)
6. **Submission scaffold** (renamed from "Draft Pack") — 12-section list mockup with `Sprint 3+` corner tag and "MD-7 submission scaffold · 9 of 12 sections ready" label

**Closing line copy (verbatim).** "Compresses initial documentation readiness significantly. The submission scaffold is a starting point for review by qualified regulatory experts — not a substitute for one."

**Critical:** The closing line is *not* "30 min vs 3-6 months" per the user's anti-overclaim guidance. The mockup #6 has the explicit `Sprint 3+` corner tag because the submission scaffold surface is in active development.

**Language note.** Step 2 caption changed from "Claude reads pitch deck. Suggested fields prefill the wizard…" to "Pitch deck parsed via structured extraction. Suggested fields prefill the wizard…". The model layer is named in Slide 9, not foregrounded here.

**Presenter note.** "If you only remember one slide, this is the one. Six steps, real surfaces, honest tagging of what's shipped vs what's coming."

---

### Slide 8 — Why this matters for translational medtech ecosystems

**Layout.** Subtitle → 2-column: left is a 5-item pain list with numbered amber bullets; right is a gray "Indian medtech context (secondary)" card with two compressed-display stats + a closing block on BIG / Venture Center fit.

**Five pain points** (left, refreshed to be operational and regulator-native). The middle three are now concrete founder-confusion examples sourced from CDSCO FAQ patterns + regulatory-consultant anecdote:
1. **Founders discover regulation too late** — device-class implications surfaced only after first investor diligence or hospital pilot
2. **TRL ladder and regulatory readiness are disconnected** — technical TRL frameworks rarely surface MDR-2017 prerequisites
3. **Teams may initiate MD-22 clinical investigation discussions before obtaining MD-13 test manufacturing permissions** — the MD-12/13 ↔ MD-22/23 sequencing dependency is a recurring source of rework
4. **AI/ML SaMD founders often underestimate ACP / change-management documentation requirements** — the Oct 2025 draft guidance frames ACP as a five-component file teams discover late
5. **Consultant access doesn't scale to every cohort member** — programme-level support needs structured pre-consultant prep

**Right column de-emphasised per founder feedback.** Stat numbers no longer use 17pt teal display; reduced to 12pt gray-700 inline text. Header explicitly labelled "(secondary)". Two stats:
- ~1,000 medical-device startups (broader medtech + health-tech: 3,000-6,000) — BioSpectrum Asia, Accorp 2025
- 600+ devices under mandatory CDSCO registration · market ~$12B FY24 → projected ~$50B by 2050 (~15% CAGR) — ORF, Accorp 2025

**Closing block** (right, below stats — retained as primary anchor of the right column). "BIG / incubator fit. BIRAC's BIG cohort scope explicitly includes medical devices, diagnostics, and drug-delivery — exactly the founders who hit MDR-2017 navigation at TRL 5-7. Venture Center is BIRAC's 3rd Regional Centre."

**Critical:** Not a TAM slide. The left-column pain list is now operational, not generic. Right-column stats are visibly de-emphasised.

**Presenter note.** "We led with concrete founder confusions rather than market size. Items 3 and 4 are specific patterns we see — MD-12/13 sequencing and ACP under-scoping. The numbers on the right are secondary calibration only."

---

### Slide 9 — Privacy, auditability, and governance posture

**Layout.** Subtitle → 5 trust tiles in a row. Each tile has icon + name + description + italic status line ("In place today" / "Default policy; configurable" / "In progress; on schedule"). Below: a small italic sources line.

**Five tiles.**
1. **No model training on uploads** — Anthropic API non-training policy
2. **India-hosted data** — Supabase Mumbai region
3. **Time-bound retention** — 90-day purge default; per-customer override
4. **Audit logs** — every Draft Pack generation logged
5. **DPDP-aligned roadmap** — Board operational from 13 Nov 2025; substantive provisions effective 13 May 2027

**Sources.** DLA Piper · Lexology · Rödl Insights for DPDP timeline. Anthropic legal commercial-terms for non-training.

**"What ClearPath is NOT" trust block (new).** A subtle horizontal band under the 5-tile grid, framed as `What ClearPath is NOT` (uppercase label) followed by three short disclaimers separated by middle dots:
> Not a regulatory approval platform · Not a substitute for notified bodies or regulatory consultants · Not legal advice

The block uses gray-50 background, gray-200 border, gray-600 text — visually subtle. Designed to read as ground rules, not as a banner.

**Language note.** Trust-tile #1 changed "governs the AI layer" → "governs the model layer" to align with the deck-wide language tightening.

**Presenter note.** "Five concrete commitments plus three explicit non-commitments. Where something is shipped, we say so. Where something is in-progress (DPDP Phase 3 by May 2027), we say that too. Founders share regulated information through ClearPath; we owe them this specificity, and we owe your team an honest list of what we are and are not."

---

### Slide 10 — UNCERTAIN flags — transparent by design

**Layout.** Subtitle → 2-column: left is a 5-item list of consequential UNCERTAIN flags (amber-bordered cards); right is a label + mockup showing how uncertainty surfaces in-product (Draft Pack §8 ACP section with an inline yellow callout).

**Five UNCERTAIN items.**
1. IVD Master File appendix conflict (Appendix II vs III)
2. ACP bridge regime (Oct 2025 Draft, finalisation pending)
3. CTRI registration for medical device CI
4. SEC composition and convening
5. Combination product PMOA determination

**Mockup on right.** Draft Pack section view showing an in-line `⚠ UNCERTAIN — ACP bridge regime` callout with explanatory text, followed by the actual draft content beneath. Caption emphasises that uncertainty surfaces in-line at the point where it applies, with a reference back to the source bible.

**Presenter note.** "We don't have a clean answer for everything. The source bible carries 85 UNCERTAIN flags. The five on this slide are the ones that cascade hardest — IVD appendix conflict alone affects every IVD persona. Surfacing rather than hiding uncertainty is part of what we'd value your team's review on."

---

### Slide 11 — Where your feedback would be invaluable

**Layout.** Subtitle → 2-column: left is a 5-item numbered ask list with teal circle pins; right is a label + SVG feedback-loop diagram + caption.

**Five asks.**
1. Edge cases we are missing
2. Workflow gaps in our persona coverage
3. Reviewer heuristics we should encode
4. 2-3 sample cohort pathways for end-to-end validation
5. Interpretation corrections where our reading of MDR-2017 is wrong

**Each ask** has an italic micro-example beneath in gray-500.

**SVG diagram** (right). Three-node triangle: Founders (top) ↔ Regulatory team (bottom-left) ↔ Workflow engine (bottom-right). Arrows labelled "intake", "feedback", "drafts". Built inline in SVG; no external assets.

**Caption** (under diagram). "A small amount of regulator-team feedback compounds across thousands of founder workflows. That is the asymmetry we are trying to use carefully."

**Presenter note.** "This is the slide where we shift from briefing to ask. We're not looking for a sign-off — we're looking for the kind of correction and pattern-sharing that improves a regulator-facing tool meaningfully."

---

### Slide 12 — Wednesday demo flow

**Layout.** Subtitle → a clean 4-column table (# · Stage · What it shows · Time). 6 rows: 5 demo stages + Q&A.

**Six rows.**
| # | Stage | Time |
|---|---|---|
| 01 | Pitch deck upload + structured extraction | 5 min |
| 02 | Tier A wizard end-to-end | 10 min |
| 03 | Readiness reading review | 3 min |
| 04 | Tier B wizard — prefill + completion | 10 min |
| 05 | Submission scaffold output structure | 5 min |
| Q&A | Reserved for your team | — open |

**Visual rule.** Table headers in uppercase 8pt gray-500. Time column right-aligned, monospace, teal-700. Stage column in semibold gray-900. "What it shows" in gray-600.

**Presenter note.** "Thirty-three minutes scheduled, fifteen reserved. We can drill into any stage your team wants more time on."

---

### Slide 13 — Founder + institutional context

**Layout.** Subtitle → 2-column: left is a minimal profile block (name, role, short body, contact info pushed to bottom); right is a list of 4 context blocks each with a teal-tagged label.

**Profile.** Name + role + short paragraph + email. The previous "Programme · GrowthX AI Weekender · Sprint 2" line has been removed per founder direction; ClearPath is now framed as independent regulatory infrastructure.

**Four context blocks.**
- Why this problem
- Adjacent ecosystem familiarity
- Build posture (refreshed wording — no sprint-number references)
- **Institutional posture** (renamed from "Sponsor / programme context") — frames ClearPath as independent regulatory infrastructure open to incubator partnerships, cohort pilots, and institutional collaboration

**Critical:** Avoid resume-style bullet list. Context blocks are short paragraphs in body-prose, not bullets. Each starts with a teal eyebrow tag. No external programme branding on this slide.

**Presenter note.** "Brief context — we are not selling our team. We are giving you enough to know who you'll be talking to on Wednesday and where this work sits. The framing is independent infrastructure rather than tying ClearPath to any specific sponsor programme."

---

### Slide 14 — Extended reference architecture (available on request)

**Layout.** Subtitle → 2-column: left is a 2×2 grid of 4 stat tiles + format note below; right is a teal "closing card" with the closing quote.

**Four stats.** 14 personas · 24+ forms · 7 device taxonomies · 85 UNCERTAIN flags.

**Format note.** "Three formats. Markdown source (3,800 lines) · single-file HTML (sidebar TOC, shareable anchors) · 102-page A4 PDF for offline reading. All derived from one canonical source."

**Closing card** (right). Dark teal background; eyebrow "Closing"; large quote: **"Designed to reduce avoidable regulatory friction for Indian medtech founders."**; meta block beneath with deck context.

**Presenter note.** "Close with the closing quote. Then: 'The full reference document is available on request — we can share it after Wednesday if your team would find it useful for deeper review.'"

---

## Render pipeline

```
clearpath-venture-center-briefing.html
        ↓  Chrome --headless --print-to-pdf --print-to-pdf-no-header
clearpath-venture-center-briefing.pdf  (1.5 MB · 14 pages · A4 landscape)
```

To regenerate after edits:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-sandbox \
  --print-to-pdf="docs/specs/clearpath-venture-center-briefing.pdf" \
  --print-to-pdf-no-header \
  "file:///abs/path/to/docs/specs/clearpath-venture-center-briefing.html"
```

The HTML is the canonical source. Edits go there; PDF re-rendered.

---

## Open design questions for future revision

1. **Live screenshots vs CSS mockups.** Mockups match the production UI vocabulary but are HTML/CSS-built, not photographic. If a higher-fidelity revision is wanted post-Wed, capturing real screenshots of the wizard + intake + readiness-reading flows would tighten visual realism.
2. **Slide 13 founder details.** Currently uses what's verifiable from the project context, framed as independent regulatory infrastructure. If specific institutional affiliations (ARTPARK, IISc, etc.) apply and are appropriate to surface, they can be added inline to the body paragraph or as an additional context block.
3. **Slide 8 stat sourcing depth.** Numbers are sourced from public secondary research and visibly de-emphasised on the slide. A primary-source cohort statistic from Venture Center itself (if shareable) would replace these cleanly.
4. **Demo R2 framing.** Slide 11 asks for "Demo R2 follow-up" implicitly via the validation asks. If a more explicit demo-R2 commit is wanted, slide 12 could be expanded to include "Demo R2 — follow-up walkthrough on cohort sample pathways" as a 7th row.
5. **Readiness-tier wording.** Current tier label is "Early pilot stage" (paired with `Indicative · not a validated benchmark`). Alternative tiers ("Pre-clinical readiness", "Pivotal readiness", "Submission-ready") may be considered if a validated tier framework emerges.

---

## Change log

**v2 (2026-05-12) — revisions after first review pass.**
- Removed all GrowthX AI Weekender references; reframed slide 13 as independent infrastructure
- Renamed "Draft Pack" → "Editable submission scaffold" / "Submission scaffold" / "Submission workspace" throughout regulator-facing surfaces
- Added explicit human-review trust line to slide 2 disclaimer
- Replaced numeric readiness score (62 / 100, 54 / 100) with qualitative tier label ("Early pilot stage") + indicative-only caveat
- Strengthened slide 6 with a branching-decision SVG (Is it SaMD? + Predicate exists?); subtitle now emphasises "rules + ontology + workflow engine"
- Refreshed slide 8 pain list with two concrete founder-confusion examples (MD-12/13 ↔ MD-22/23 sequencing; ACP under-scoping); de-emphasised ecosystem stats
- Added "What ClearPath is NOT" subtle trust block on slide 9 (three non-commitments)
- Tightened deck-wide AI vocabulary ("AI extracts" → "structured extraction" etc.)
- Renamed slide 6 layer 5 from "Draft generation" → "Workflow-assisted drafting"
- Renamed slide 2 step 02 from "Risk / readiness card" → "Readiness reading"
- Renamed slide 7 step 4 from "Risk Card" → "Readiness reading", and step 6 from "Draft Pack" → "Submission scaffold"

---

*End of design specification.*
