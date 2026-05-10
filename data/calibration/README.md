# Calibration data

## Primary calibration set (current)

**`clearpath_synthetic_50_full_schema_v2_1.json`** — 50 synthetic medtech/SaMD cases.
Added 2026-05-08. **Authoritative for Story 1.3 eval.**

### Distribution
- `null` (wellness / non-device): 15
- Class A: 3
- Class B: 12
- Class C: 17
- Class D: 3

39 of 50 cases carry at least one `or_acceptable` alternate, reflecting real
regulatory ambiguity in the labels.

### Schema (per case)

Existing fields (carried over from earlier synthetic packs):
- `case_id`, `product_name`, `one_liner`, `product_type`, `intended_use`,
  `claims`, `cdsco_risk`, `regulatory_pathway`, `applicable_frameworks`
- `trl`, `trl_label`, `readiness_score`, `risk_score`, `missing_documents`,
  `training_label`

Labeling fields (new in v2.1):
- `expected_cdsco_class` — one of `"A" | "B" | "C" | "D" | null` (JSON `null`,
  not the string `"null"`). `null` means non-device or wellness carve-out.
- `or_acceptable` — array of alternative classifications that would also be
  defensible. Must NOT include the value already in `expected_cdsco_class`.
- `rationale` — non-empty string explaining the call.
- `labeled_by` — annotator handle.
- `labeled_at` — `YYYY-MM-DD`.

### Labeling provenance

LLM-generated (OpenAI), founder-validated (Raunaq), cross-validated against
Gemini. Disagreements between OpenAI and Gemini were resolved by the founder
on case-by-case judgment. This is **synthetic + AI-assisted labeling** —
treated as a working ground truth, not regulatory truth.

### Validator

`scripts/validate-calibration-50.ts` — checks count (exactly 50), schema
shape, value enums, and the no-self-duplication rule on `or_acceptable`.
Run before any eval that scores against this set.

### Eval matching modes

The Story 1.3 eval reports two scores:
- **TOLERANT** (gates the ≥90% bar): predicted == expected OR predicted ∈ `or_acceptable`.
- **STRICT** (internal monitoring only): predicted == expected exactly.

Strict <90% with tolerant ≥90% is acceptable. Tolerant <90% triggers prompt
iteration.

### Backlog: advisor re-labeling

This calibration set will be re-labeled by a regulatory advisor (former CDSCO
official) when one is recruited (Sprint 6+ per advisor recruitment plan).
Expected divergence: 3–5 cases out of 50. Cases where the advisor disagrees
with founder + LLMs become high-signal eval data (genuine ambiguity surface).

---

## Archived (historical reference only)

**`clearpath_additional_35_with_trl.json`** — 35-case synthetic pack added
2026-05-06. Used for the Sprint 1.2 model-rightsizing A/B (results in
`data/eval/sprint-1/`). Cases overlap with the 50-case set; not used for
Story 1.3 forward.

`scripts/verify-trl.ts` (4-case TRL calibration) and
`scripts/verify-completeness.ts` (5-case completeness calibration) continue
to gate every commit. Those are unchanged.
