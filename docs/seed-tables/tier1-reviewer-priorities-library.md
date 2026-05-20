# Tier 1 reviewer priorities — seed values for review

**Purpose:** drives Section 5 (Reviewer Insights) of the ₹499
Regulatory Readiness Report. Each priority below either triggers
for a given product profile or doesn't; the report renders the
top 5 by weight.

**Review status:** every priority is `estimate`. Founder or the
CDSCO consultant signs off on each row's title + the "what
reviewers will likely look for" framing before launch.

**Mechanics:**
- The generator builds a `ReviewerContext` from the readiness card
  + wizard answers, then evaluates each priority's trigger.
- Matched priorities are sorted by weight and the top 5 are kept.
- The Opus call in the generator tailors each priority's seed
  framing to the specific product (its name, indication, AI/ML
  specifics) — but the titles + triggers are static.
- Source of truth for live values: `lib/engine/tier1-reviewer-priorities-library.ts`.

---

## Library (ordered by default weight)

| Key | Title | Weight | Trigger | Status |
|---|---|---|---|---|
| `clinical_validation` | Strength of clinical validation evidence | 10 | Class C/D OR novel | estimate |
| `intended_use_consistency` | Intended Use consistency across documents | 9 | Always | estimate |
| `ai_update_controls` | AI/ML update controls (ACP / PCCP) | 9 | ai_ml_flag AND (Class C/D OR acp_required) | estimate |
| `indian_population_relevance` | Indian-population validity | 8 | Class B/C/D AND novel | estimate |
| `cybersecurity_data_handling` | Cybersecurity & data handling | 8 | data_sensitivity ∈ {medium, high} | estimate |
| `explainability` | Explainability of AI recommendations | 7 | ai_ml_flag AND drives/diagnoses | estimate |
| `risk_management_maturity` | Risk management maturity (ISO 14971) | 7 | Class B/C/D | estimate |
| `predicate_narrative` | Predicate / substantial-equivalence narrative | 7 | has_predicate | estimate |
| `abdm_interoperability` | ABDM / interoperability conformance | 6 | abdm_in_scope | estimate |
| `usability_lay_user` | Usability + lay-user safeguards | 6 | home-use environment | estimate |

---

## Worked example — Alzheimer's MRI screening (Class B/C SaMD · AI-CDS · novel)

Profile:
- cdsco_class: C (leaning)
- ai_ml_flag: true, acp_required: true
- novel_or_predicate: novel
- recommended_path: clinical_investigation
- data_sensitivity: high (MRI)
- drives_or_diagnoses: true (AI flags suspected disease, radiologist reviews)
- abdm_in_scope: false (no ABDM milestone declared)
- use_environment_home: false (radiology suite)

Top 5 priorities returned by `selectReviewerPriorities(ctx, 5)`:

1. **Strength of clinical validation evidence** (weight 10)
2. **Intended Use consistency across documents** (weight 9)
3. **AI/ML update controls (ACP / PCCP)** (weight 9)
4. **Indian-population validity** (weight 8)
5. **Cybersecurity & data handling** (weight 8)

(Explainability at weight 7 would be #6; the spec asks for 4–6 so
this is configurable per case.)

---

## Per-row review notes

- `clinical_validation` weight is the highest because it's the
  single longest item on most critical paths and the strongest
  reviewer signal for novel Class C/D devices.
- `intended_use_consistency` triggers always because it's
  cheap-to-fix yet a frequent source of submission delays.
- `ai_update_controls` framing references the Oct 2025 CDSCO SaMD
  draft — re-check this when the draft normalises or gets
  superseded. **[REVIEW PRIORITY when the draft is final.]**
- `indian_population_relevance` is a softer expectation today but
  hardening in 2026 procurement cycles per recent NABH circulars.
- `cybersecurity_data_handling` triggers on data sensitivity, not
  on class — adjust the trigger if you want to scope it tighter.
- `explainability` is more reviewer culture than codified rule —
  worth a consultant gut-check on the seed wording.

---

## How to flip a priority to `reviewed`

1. Open `lib/engine/tier1-reviewer-priorities-library.ts`.
2. Find the entry by `key`.
3. Adjust `title`, `what_reviewers_look_for_seed`, `triggers`, or
   `weight` if needed.
4. Change `review_status: "estimate"` → `review_status: "reviewed"`.
5. Update the corresponding row in this table.
