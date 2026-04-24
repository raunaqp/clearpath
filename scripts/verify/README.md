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

## stage-2-wizard.ts

12-case test harness for Feature 4 (wizard + conflict disclosure). Seeds Supabase rows directly to control `meta.conflict_detected` / severity / acknowledged / edit_attempts, then exercises the wizard page + API routes and asserts DB + rendered-HTML state. Covers: clean flow, low/high severity card rendering, ack persistence, edit redirect + prefill shape, resolve vs persist, Q2 follow-up (shown vs skipped), drop-off resume at q/5, skip-completion with counts, full 7-question completion.

Runs against the **local** dev server on :3000 and cleans up every assessment it creates. Safe to re-run.

```
npm run test:f4
# or
npx tsx scripts/verify/stage-2-wizard.ts
```

## stage-2-production.ts

End-to-end walkthrough of a clean healthcare intake against **production** (`clearpath-medtech.vercel.app`). Submits intake → hits `/assess/[id]` (triggers pre-router) → confirms redirect into `/wizard/[id]/q/1` → walks Q1–Q7 via `/api/wizard/save` → completes via `/api/wizard/complete` → reads final state from Supabase.

Asserts: redirect target correct, Q1 prompt renders, no conflict card for a clean intake, all 7 answers persist, status transitions to `wizard_complete`, `wizard_started_at` + `wizard_completed_at` timestamps set, post-completion `/assess/[id]` shows the Feature 5 placeholder panel.

Cleans up the created row on exit.

```
npx tsx scripts/verify/stage-2-production.ts
```

## debug-conflict-output.ts

Inspects the raw pre-router output for a CerviAI-style conflict case (one-liner "women's health data platform" + URL content describing cervical cancer screening). Prints the full `PreRouterResult` including `raw_model_response` so you can see exactly what the model returned before parsing.

No DB writes. Costs ~$0.015 per run (one Sonnet call).

```
npx tsx scripts/verify/debug-conflict-output.ts
```
