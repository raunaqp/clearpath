# Calibration data

`clearpath_additional_35_with_trl.json` — 35-case synthetic pack added 2026-05-06.
Each case has product_name, one_liner, claims, expected TRL, readiness/risk scores,
expected missing docs, training_label.

Use with `scripts/verify-classifier.ts` (TBD Wednesday) — runs intake → synthesis →
readiness pipeline against each case and scores TRL match, completeness match,
classification match. Builds a confusion matrix vs the training_label categories.

Existing 4-case calibration in scripts/verify-trl.ts and 5-case calibration in
scripts/verify-completeness.ts continue to gate every commit. The 35-case set is
larger-scale eval, run periodically.
