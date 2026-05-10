# ClearPath TRL Spec — v1

Authoritative spec for the TRL (Technology Readiness Level) feature.
Read this before touching any TRL-related code.

**Status:** Shipped on `feat/trl-completion-card` as of 6 May 2026.
Deterministic Tier 1 + Opus-grounded Tier 2 architecture.

---

## 1. Why TRL is in ClearPath

Three reasons:

1. **MAHA MedTech Mission is live.** ANRF + ICMR + Gates Foundation, ₹750 cr
   over 5 years, ₹5–25 cr per project (up to ₹50 cr exceptional). TRL 3–8
   eligible. **Mandatory deliverable: a TRL Stage Certificate.** ClearPath
   now produces this framing automatically — no other Indian tool does.

2. **BIRAC, DST, IKP all speak TRL.** When a founder talks to an incubator,
   "I'm at TRL 4 with MD-12 in hand" is more legible than "Class C novel
   IVD-SaMD with pre-submission consult done."

3. **It separates two things founders conflate:** "How prepared are my docs"
   (Readiness /10) vs "How far am I down the actual CDSCO journey" (TRL %).

## 2. The framework — anchored to SERB / ANRF

We use the SERB / ANRF "Technology Readiness Levels for Medical Devices and
IVDs" framework (Annexure-II), not NASA-TRL or EU-TRL. Three reasons:

- It's the framework MAHA MedTech evaluators use directly
- Each level is **anchored to a specific CDSCO form/license**, making claims
  objectively verifiable rather than vibes-based
- It distinguishes investigational (no predicate) from has-predicate paths,
  which matches our existing `classification.novel_or_predicate` field

### 2.1 Two tracks

**Investigational track** (no predicate device — full 9 levels):

| TRL | Stage | Anchor (objective evidence) |
|-----|-------|----------------------------|
| 1 | Ideation | Problem statement documented |
| 2 | Proof of Principle | Spec + FTO search, no prototype |
| 3 | Early-stage PoC | In-house prototype + analytical perf tested |
| 4 | Advanced PoC (Design Freeze) | MD-12 (Test License) submitted |
| 5 | Test-batch Evaluation | MD-13 obtained + MD-22/MD-24 submitted |
| 6 | Pilot CI/CPE | MD-23/MD-25 obtained, pilot data |
| 7 | Pivotal CI/CPE | Pivotal complete, MD-26/MD-28 submitted |
| 8 | Pre-commercialisation | MD-27/MD-29 obtained, ISO 13485 line up |
| 9 | Commercialisation + PMS | Live in market with PMS |

**Has-predicate track** (substantial-equivalence path):

TRL 1–5 identical. Then:

| TRL | Stage | Anchor |
|-----|-------|--------|
| 6 | Clinical evaluation (predicate) | Substantial equivalence established |
| 7 | Mfg license application | MD-3 (Class A/B) or MD-7 (Class C/D) submitted |
| 8 | Pre-commercialisation | MD-3/MD-7 granted, ISO 13485 line up |
| 9 | Commercialisation + PMS | Live in market with PMS |

### 2.2 Track selection

Pick the track from `classification.novel_or_predicate`:
- `"novel"` → `investigational`
- `"has_predicate"` → `has_predicate`
- `null` (unclear) → default to `investigational` (more conservative — honest
  about uncertainty, doesn't promise a faster path)

### 2.3 Completion percentage

Non-linear, weighted toward later stages because each post-TRL-5 step is
materially more expensive and time-consuming:

| TRL | % | Why this number |
|-----|---|-----------------|
| 1 | 5 | Ideation only — most work ahead |
| 2 | 12 | Spec done, no prototype |
| 3 | 22 | Prototype + bench data — first tangible asset |
| 4 | 35 | MD-12 filed — first regulatory checkpoint |
| 5 | 50 | Test license + clinical study application — halfway gate |
| 6 | 65 | Pilot data — clinical signal exists |
| 7 | 78 | Pivotal data — efficacy proven |
| 8 | 92 | License granted, line up — pre-launch |
| 9 | 100 | Commercialised |

Calibration intent: a founder at TRL 3 reads as "~22% complete" because
most of the regulatory and clinical work lies ahead. A founder at TRL 7
reads as "~78%" because they're past the hardest gates.

### 2.4 When TRL is null

Set `trl: null` when:
- `medical_device_status === "not_medical_device"`
- `medical_device_status === "wellness_carve_out"`

TRL is a medical-device framework. Non-medical-devices don't have a TRL.
Don't try to assign one — that confuses founders.

---

## 3. Tiered architecture

### 3.1 Tier 1 (free) — Deterministic derivation

**File:** `lib/engine/trl.ts` → `deriveTRL(card)`

Takes the existing `readiness.dimensions` (5 dims × 0/1/2) plus
`classification.novel_or_predicate` and outputs a TRL level + completion %
+ next-milestone copy. **Zero Claude API cost.** Runs in <1ms.

Logic anchored to:
- `submission_maturity = 0` + no clinical = TRL 1–3
- `submission_maturity = 1` (pre-sub / SUGAM / MD-12 prep) = TRL 4
- `submission_maturity = 2` (MD-12 issued) + `clinical_evidence ≥ 1` = TRL 5
- `clinical_evidence = 2` (published validation, MD-23/25) = TRL 6–7
- `quality_system = 2` + active mfg license + clinical = TRL 8

When in doubt, anchor LOWER (honesty over confidence rule).

### 3.2 Tier 2 (₹499) — Opus-grounded TRL

**File:** `lib/engine/draft-pack-generator.ts` (existing) + new TRL section

When the user pays ₹499, the Draft Pack runs a TRL-specific Opus call with:
- The full scrape content (not just the readiness card)
- Uploaded documents (DHF, V&V protocols, EC approvals, etc.)
- Wizard answers

Opus produces:
- A TRL number with **citations** ("TRL 5 because the V&V protocol you
  uploaded references MD-13 issuance on 12 Jan 2026")
- A **TRL Stage Certificate** draft — the document MAHA MedTech requires
  ([template at `docs/reference/trl-sources/`])
- Specific next-milestone language with timelines and forms

This justifies the ₹499 pricing: Tier 1 says "likely TRL 4" — Tier 2 says
"TRL 4 with citations to your uploaded MD-12 acknowledgement, here's your
draft Stage Certificate ready to attach to the MAHA MedTech application."

### 3.3 Tier 3 (₹50K) — Expert-validated TRL

The concierge stage. Human regulatory expert reviews the Opus output, signs
the TRL Stage Certificate as a verified third-party. This is what actually
holds up under MAHA MedTech evaluation.

---

## 4. Data model

### 4.1 Readiness card schema (additive)

In `lib/schemas/readiness-card.ts`:

```ts
trl: z
  .object({
    level: TRLLevelSchema.nullable(),       // 1-9 or null
    stage: TRLStageSchema.nullable(),       // "ideation" | "early_poc" | ...
    track: TRLTrackEnum.nullable(),         // "investigational" | "has_predicate"
    completion_pct: z.number().int().min(0).max(100).nullable(),
    next_milestone: z.string(),
    rationale: z.string(),
  })
  .optional(),
```

`.optional()` is critical — existing cards without TRL must continue to parse.

### 4.2 Supabase migration (additive)

```sql
alter table assessments
  add column if not exists trl_level smallint check (trl_level between 1 and 9),
  add column if not exists trl_track text check (trl_track in ('investigational','has_predicate')),
  add column if not exists trl_completion_pct smallint check (trl_completion_pct between 0 and 100);

create index if not exists idx_assessments_trl_level on assessments(trl_level) where trl_level is not null;

-- Idempotent backfill from existing JSONB:
update assessments
  set trl_level = (readiness_card->'trl'->>'level')::smallint,
      trl_track = readiness_card->'trl'->>'track',
      trl_completion_pct = (readiness_card->'trl'->>'completion_pct')::smallint
  where readiness_card->'trl' is not null and trl_level is null;
```

The TRL data itself lives in the `readiness_card` JSONB. The new columns are
**convenience indexes** for admin queries ("show me all TRL 5 cards") and
analytics. They are nullable so old cards don't break.

---

## 5. Visual layout

The TRL block sits **between the score-and-badges row and the verdict block**.

Three independent metrics on the card (preserves "Readiness ≠ Risk" rule):

1. **Readiness /10** — paperwork preparedness (existing, unchanged)
2. **TRL X / 9 + completion %** — technical/clinical maturity (new)
3. **Risk H/M/L** — patient/regulatory risk (existing, unchanged)

Plus a small **Regulation count chip** ("4/9 apply") near the badge row —
not a composite score, just a count.

Component file: `components/card/TRLBlock.tsx`

Visual: bordered card, neutral background (#FAF8F2), TRL number in serif
with "/9" subscript, completion % on the right with a horizontal bar
(amber → teal → green by stage). Anchor form (e.g., "MD-12 submitted")
shown in mono, next-milestone copy below.

---

## 6. Banned phrases

Per the certainty-language enforcement rule, never say:
- "TRL 4" (bare) — say "likely TRL 4"
- "You are TRL 4" — say "appears to be TRL 4 based on detected signals"
- "MAHA MedTech-eligible" — say "may qualify for MAHA MedTech (TRL 3–8)"
- "You will receive ₹X cr" — say "MAHA MedTech grants typically range
  ₹5–25 cr per project"

The post-processor `softenCertainty()` will catch these. Add new mappings
to `lib/engine/soften-certainty.ts` if needed.

---

## 7. Test cases (already in `scripts/verify-trl.ts`)

| Case | Expected TRL | Track | Why |
|------|-------------|-------|-----|
| EkaScribe (early SaMD, novel) | 3 | investigational | Sub-feature in market, no MD-12, novel AI-CDS |
| CerviAI (pre-MD-12, novel) | 3 | investigational | Prototype + pilot data, no submission yet |
| Forus Health (Class D, predicate) | 8 | has_predicate | Mfg license + ISO line + pivotal data |
| HealthifyMe (wellness) | null | — | Not a medical device |

Run: `npx tsx scripts/verify-trl.ts` — should output `4/4 passed`.

---

## 8. Future extensions (not in v1)

- **TRL corpus from real Indian medtechs** (~100 examples, hand-labelled)
  for retrieval-augmented TRL classification on Tier 2
- **TRL Stage Certificate PDF generation** for direct attachment to MAHA
  MedTech applications
- **MAHA MedTech eligibility matcher** — combines TRL + national health
  priority alignment + DSIR/DPIIT status into a "MAHA MedTech ready" verdict
- **BIRAC / SBIRI / SBIPP eligibility** mapped from TRL ranges
- **Predicate matching infrastructure** — when a founder claims
  has-predicate, surface the predicate matches that justify the track choice

---

## 9. References

Source documents in `docs/reference/trl-sources/`:
- `serb_trl_health_priority.pdf` — SERB Annexure-II + III (canonical framework)
- `maha_medtech_faqs.html` — MAHA MedTech eligibility, evidence requirements
- `national_health_priorities.md` — Annexure-III priority list

External:
- SERB: https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf
- MAHA MedTech: https://anrfonline.in/ANRF/maha_medTech?HomePage=New
- CDSCO MDR 2017 (the form numbers we anchor to)

Calibration: 4/4 calibration archetypes pass deterministic derivation.
Pre-shipping check: 15-product calibration suite (existing).
