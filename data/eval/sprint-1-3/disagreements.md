# Story 1.3 recon — disagreements (v1 + founder bucketing)

**run_at:** 2026-05-07T20:12:22.747Z
**stack:** Haiku 4.5 pre-router → Opus 4.7 synth (Batch API)
**calibration:** data/calibration/clearpath_synthetic_50_full_schema_v2_1.json

> This file documents the **v1 recon** and the founder's bucketing decisions
> on the 3 disagreements. Each decision drove a concrete action: prompt fix,
> label correction, or accept-as-borderline. The v2 re-eval lives in
> `recon-run-v2.json` (and `disagreements-v2.md` if any disagreements remain).

## Headline (v1)

- **Tolerant match:** 47/50 (94.0%) — bar ≥90%: **PASS**
- **Strict match:** 38/50 (76.0%) — internal monitoring only
- **Disagreements:** 3/50
- **Pre-router errors:** 0, parse fails: 0
- **Synth parse fails:** 4/48 (separately tracked — see Story 1.3.5 backlog)
- **Cost (Batch API, 50%-off):** pre-router $0.0432 + synth $3.1258 = **$3.1690**
- **Elapsed:** 707s

## Disagreement bucket distribution (post founder bucketing)

- AGREE: 47
- OPUS_WRONG: 1 (CP-046)
- LABEL_WRONG: 1 (CP-006)
- BORDERLINE: 1 (CP-038)
- UNSURE: 0

## Disagreements (3) — bucketed

### CP-006 — MediAdhere

**One-liner:** Medication adherence app that reminds patients to take prescribed medicines and alerts caregivers.

- **Expected (v1 label):** `B` (or_acceptable: C)
- **Predicted:** `null`
- **Pre-router:** product_type=product, next_action=run_wizard
- **Label rationale (v1):** Medication adherence tracking is generally low-moderate risk. Class C may apply if the system changes dosage or escalates treatment decisions.

**Bucket:** B (LABEL_WRONG)

**Decision:** Reminder-only adherence apps without active dose recommendation
are wellness/non-device. Original label expected B was too aggressive.

**Action:** Correct label in calibration JSON.
- `expected_cdsco_class`: `"B"` → `null`
- `or_acceptable`: `["C"]` → `["A"]`
- `rationale`: updated to reflect reminder-only positioning
- Audit-trail fields added: `label_corrected_at`, `label_correction_reason`

### CP-038 — Insulin Advisor

**One-liner:** App that recommends insulin dose changes based on CGM and meal logs.

- **Expected:** `D` (or_acceptable: empty)
- **Predicted:** `C`
- **Pre-router:** product_type=product, next_action=run_wizard
- **Label rationale:** Insulin dose recommendation directly drives therapy for a potentially life-threatening condition. This should be treated as Class D SaMD.

**Bucket:** C (BORDERLINE)

**Decision:** Insulin dose recommendation lives at the C/D boundary depending
on closed-loop vs. open-loop architecture. "Advisor" naming + Opus reasoning
suggest open-loop. C and D are both defensible.

**Action:** No label change. CP-038 will continue to be flagged as a
strict-and-tolerant miss in v2 (the eval rule requires
`predicted ∈ {expected} ∪ or_acceptable`, and `or_acceptable` is empty here).
Founder accepts this as a known borderline rather than relabeling — the label
encodes the conservative reading; Opus's reading is also defensible. Revisit
with the regulatory advisor (Sprint 6+) — see `or_acceptable` widening as the
likely outcome.

### CP-046 — MedVoice Scribe

**One-liner:** AI medical scribe that converts doctor-patient conversations into structured notes.

- **Expected:** `null` (or_acceptable: A)
- **Predicted:** `B`
- **Pre-router:** product_type=product, next_action=run_wizard
- **Label rationale:** AI medical scribing is documentation support if no clinical recommendations are generated. Class A may apply if summaries influence low-risk clinical management.

**Bucket:** A (OPUS_WRONG)

**Decision:** AI medical scribes that transcribe doctor-patient conversations
to populate EMR are typically wellness/null or Class A. They document; they
don't drive clinical decisions. Opus's "Class B SaMD" classification is a
real over-classification failure — not a borderline call.

**Action:** Prompt fix in `lib/engine/synthesizer-system-prompt.ts`. Added an
explicit rule (under Modifiers) differentiating AI-assisted medical
documentation tools (scribes, dictation aids, note-taking) from AI clinical
decision support (Class B+). v2 re-eval verifies the fix lands.

## Categorization legend

- **OPUS_WRONG** — Opus made a clear mistake; the label (and `or_acceptable`) is correct.
- **LABEL_WRONG** — Opus's prediction is regulatorily defensible; the label is the issue.
- **BORDERLINE** — Genuinely ambiguous; neither call is wrong; `or_acceptable` should probably include the prediction.
- **UNSURE** — Need regulatory advisor to break the tie.
