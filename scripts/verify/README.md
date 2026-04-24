# Verification + debug scripts

Dev-only scripts that call the running app / Supabase / Anthropic API directly. Not part of the production build — `scripts/` is excluded in `tsconfig.json`.

Run with `npx tsx <path>` from the project root. All scripts load `.env.local` manually.

## stage-1-pre-router.ts

Verifies the Stage 1 pre-router deploy on **production** (`clearpath-medtech.vercel.app`). Submits a mismatched one-liner + PDF containing ISO 13485 + NABL + IEC 62304 mentions, then reads `assessments.meta` from Supabase and asserts:

- `conflict_detected === true`
- `conflict_details.severity` is `high` or `medium`
- `conflict_details.authority_used === 'pdf'`
- `detected_signals.certifications` contains ISO 13485 at high confidence

Creates a real row + storage object, then cleans up both. Safe to re-run.

```
npx tsx scripts/verify/stage-1-pre-router.ts
```

## debug-conflict-output.ts

Inspects the raw pre-router output for a CerviAI-style conflict case (one-liner "women's health data platform" + URL content describing cervical cancer screening). Prints the full `PreRouterResult` including `raw_model_response` so you can see exactly what the model returned before parsing.

No DB writes. Costs ~$0.015 per run (one Sonnet call).

```
npx tsx scripts/verify/debug-conflict-output.ts
```
