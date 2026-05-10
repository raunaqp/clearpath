# Story 1.3 recon — disagreements

**run_at:** 2026-05-07T20:57:40.414Z
**stack:** Haiku 4.5 pre-router → Opus 4.7 synth (Batch API)
**calibration:** data/calibration/clearpath_synthetic_50_full_schema_v2_1.json

## Headline

- **Tolerant match:** 49/50 (98.0%) — bar ≥90%: **PASS**
- **Strict match:** 40/50 (80.0%) — internal monitoring only
- **Disagreements:** 1/50
- **Pre-router errors:** 0, parse fails: 0
- **Synth parse fails:** 1/48 (Story 1.2 expectation: 0%)
- **Cost (Batch API, 50%-off):** pre-router $0.0433 + synth $2.6607 = **$2.7039**
- **Elapsed:** 709s

## Disagreement bucket distribution

- AGREE: 49
- OPUS_WRONG: 0
- LABEL_WRONG: 0
- BORDERLINE: 0
- UNSURE: 1

*Initial bucketing is heuristic — all non-tolerant-matches default to UNSURE. Founder must re-bucket manually below.*

## Disagreements (1)

### CP-038 — Insulin Advisor

**One-liner:** App that recommends insulin dose changes based on CGM and meal logs.

- **Expected:** `D`
- **Predicted:** `C`
- **Pre-router:** product_type=product, next_action=run_wizard
- **Label rationale:** Insulin dose recommendation directly drives therapy for a potentially life-threatening condition. This should be treated as Class D SaMD.
- **Initial bucket:** UNSURE _(re-bucket manually: OPUS_WRONG / LABEL_WRONG / BORDERLINE / UNSURE)_


## Categorization legend

- **OPUS_WRONG** — Opus made a clear mistake; the label (and `or_acceptable`) is correct.
- **LABEL_WRONG** — Opus's prediction is regulatorily defensible; the label is the issue.
- **BORDERLINE** — Genuinely ambiguous; neither call is wrong; `or_acceptable` should probably include the prediction.
- **UNSURE** — Need regulatory advisor to break the tie.
