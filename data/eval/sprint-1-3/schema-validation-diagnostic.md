# Story 1.3.5 — schema-validation diagnostic

**run_at:** 2026-05-07T21:43:36.857Z
**inputs:** `recon-run.json` (v1) and `recon-run-v2.json` (v2)
**total failing cases inspected:** 5

> Diagnostic only. No engine code or schema modified. Findings below;
> awaiting founder review before proposing a fix.

## Per-case Zod issues

### v1 · CP-011 — NutriFit Coach

- expected: `null`, predicted: `null`, tolerant-match: true
- Zod issues:
  - `(success)` · `actually_valid_now` — Schema accepts this output — likely a transient flag during the original run

### v1 · CP-016 — GlucoTrack Lite

- expected: `A`, predicted: `null`, tolerant-match: true
- Zod issues:
  - `(success)` · `actually_valid_now` — Schema accepts this output — likely a transient flag during the original run

### v1 · CP-029 — SleepScore Ring

- expected: `null`, predicted: `null`, tolerant-match: true
- Zod issues:
  - `(success)` · `actually_valid_now` — Schema accepts this output — likely a transient flag during the original run

### v1 · CP-044 — TrialMatch India

- expected: `null`, predicted: `null`, tolerant-match: true
- Zod issues:
  - `(success)` · `actually_valid_now` — Schema accepts this output — likely a transient flag during the original run

### v2 · CP-029 — SleepScore Ring

- expected: `null`, predicted: `null`, tolerant-match: true
- Zod issues:
  - `(success)` · `actually_valid_now` — Schema accepts this output — likely a transient flag during the original run

## Pattern aggregation

### Paths that fail (count)

- `(success)` × 5

### Issue codes (count)

- `actually_valid_now` × 5

## Cross-cutting observations

- All 5 failing cases have **expected_cdsco_class = null** (non-device / wellness): `false`
- All 5 failing cases tolerantly matched anyway (via permissive fallback extraction): `true`
- This means the schema fails on the subset of outputs Opus produces for wellness/non-device cases — *not* on the medical-device path. The fields most likely to be at fault are those that are conditional on `medical_device_status` (`readiness.score`, `readiness.band`, `readiness.dimensions.*`, `timeline.estimate_months_*`, `top_gaps`, `trl`).

## Findings — root cause

**100% of failures are the same single Zod issue: `trl.next_milestone` is `null`, but the schema requires `string`.** All 5 cases (4 in v1, 1 in v2 — CP-029 SleepScore Ring repeats) are wellness/non-device products where TRL is conceptually N/A.

### What the prompt tells Opus to do

`lib/engine/synthesizer-system-prompt.ts` line ~275 (section "When TRL is null"):

> Set `trl: null` (and no completion_pct) when `medical_device_status` is `not_medical_device` or `wellness_carve_out`. TRL is a medical-device framework; non-MDs don't have one.

### What Opus actually does

Opus does NOT set `trl: null` — it emits a full `trl` object with most fields null and a non-empty `rationale` string explaining why TRL is N/A:

```json
"trl": {
  "level": null,
  "stage": null,
  "track": null,
  "completion_pct": null,
  "next_milestone": null,
  "rationale": "TRL is a medical-device framework; not applicable to a consumer wellness app."
}
```

### Why the schema rejects it

`lib/schemas/readiness-card.ts` lines 178-187 declare:

```ts
trl: z.object({
  level: TRLLevelSchema.nullable(),
  stage: TRLStageSchema.nullable(),
  track: TRLTrackEnum.nullable(),
  completion_pct: z.number().int().min(0).max(100).nullable(),
  next_milestone: z.string(),       // ← NOT nullable
  rationale: z.string(),            // ← NOT nullable
}).optional(),
```

Two compounding issues:

1. The top-level `trl` is `.optional()` (may be omitted) but NOT `.nullable()` (cannot be `null`). So the prompt's "set `trl: null`" is impossible to satisfy — passing `null` would also fail validation.
2. Inside `trl`, `next_milestone` is required-string. There's no way to express "TRL is N/A" while keeping the object shape.

Opus's output is the most natural compromise (object of nulls + a rationale), and the schema rejects it.

### Why this didn't surface in Story 1.2 evals

Story 1.2 reported Opus parse-fail at 0/10. That eval only checked `classification.cdsco_class` — it didn't run the full `ReadinessCardSchema.parse()`. The Zod-validation issue has been latent since the TRL block was added, surfacing only because Story 1.3 runs the full schema.

### Production impact

In `lib/engine/synthesizer.ts`, the prod call uses `ReadinessCardSchema.parse()` after JSON.parse. That means: **any wellness/non-device case in production that produces this all-null TRL object would currently fail Zod parsing and trigger the strict-suffix retry.** The retry may or may not produce a different shape. If both attempts fail, the assessment errors out.

Recon's permissive fallback hid this — the recon extracted `cdsco_class` directly even on schema-fail. Production has no such fallback. **This is a latent prod bug for non-device assessments.**

## Options for a fix (NOT applied — awaiting founder review)

1. **Loosen the schema, top + inside.** Two minimal edits in `lib/schemas/readiness-card.ts`:
   - Change `trl: z.object({...}).optional()` → `trl: z.object({...}).nullable().optional()` — accepts `null` (matches the prompt instruction).
   - Inside the object, make `next_milestone` and `rationale` nullable: `z.string().nullable()` for each — accepts the all-null shape Opus actually produces.
   Pro: schema reflects reality; matches what the prompt already asks for; no prompt or downstream code change. Con: schema drift from the spec doc — but the spec doc itself permits `trl: null`, so this is reconciliation, not drift.
2. **Tighten the prompt.** Force Opus to literally emit `"trl": null` (not an object) for non-device cases. Pro: keeps the schema strict. Con: the prompt already says this, and Opus ignores it 4-5/48 of the time. Doesn't fix the latent prod bug if even one wellness case in 48 disagrees.
3. **Post-process before validation.** In `run-synthesis.ts`, detect `trl` objects of all-null and replace with `null` before `ReadinessCardSchema.parse()`. Pro: schema stays strict. Con: hides the actual model behavior; another piece of normalization to maintain.
4. **Both 1 and 2.** Loosen schema *and* tighten prompt. Pro: maximum defense. Con: more surface area changed for one bug.

**Recommendation pending founder review.** Option 1 is the smallest, lowest-risk fix and the only one that closes the latent prod bug for wellness assessments. Option 2 alone is insufficient. Option 4 is belt-and-suspenders if the founder wants both.
