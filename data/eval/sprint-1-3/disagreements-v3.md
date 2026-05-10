# Story 1.3 recon — disagreements

**run_at:** 2026-05-07T21:42:25.476Z
**stack:** Haiku 4.5 pre-router → Opus 4.7 synth (Batch API)
**calibration:** data/calibration/clearpath_synthetic_50_full_schema_v2_1.json

## Headline

- **Tolerant match:** 50/50 (100.0%) — bar ≥90%: **PASS**
- **Strict match:** 41/50 (82.0%) — internal monitoring only
- **Disagreements:** 0/50
- **Pre-router errors:** 0, parse fails: 0
- **Synth parse fails:** 1/48 (Story 1.2 expectation: 0%)
- **Cost (Batch API, 50%-off):** pre-router $0.0435 + synth $3.0010 = **$3.0445**
- **Elapsed:** 743s

## Disagreement bucket distribution

- AGREE: 50
- OPUS_WRONG: 0
- LABEL_WRONG: 0
- BORDERLINE: 0
- UNSURE: 0

*Initial bucketing is heuristic — all non-tolerant-matches default to UNSURE. Founder must re-bucket manually below.*

## Disagreements (0)

_None — all 50 cases tolerant-match._


## Categorization legend

- **OPUS_WRONG** — Opus made a clear mistake; the label (and `or_acceptable`) is correct.
- **LABEL_WRONG** — Opus's prediction is regulatorily defensible; the label is the issue.
- **BORDERLINE** — Genuinely ambiguous; neither call is wrong; `or_acceptable` should probably include the prediction.
- **UNSURE** — Need regulatory advisor to break the tie.
