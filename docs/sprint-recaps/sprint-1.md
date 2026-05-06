# sprint 1 recap

**dates:** weeks 1-2 (started may 6, 2026)
**branch:** feat/trl-completion-card (no merge to main this sprint)

## story 1.1 — polling architecture for draft pack — DONE

**outcome:** no modal needed. vercel fluid compute now defaults to 300s function timeout (sprint plan was written assuming 60s hobby cap; that constraint no longer holds). the existing draft-pack flow fits comfortably.

**change:** raised `maxDuration` 60 → 300 in `app/api/admin/generate-draft-pack/route.ts`. statuspanel polling already in place. no schema changes. no modal service built.

**commit:** 32411c9

**savings:** ~1.5 days vs. building a node container on modal.

## story 1.2 — model rightsizing + prompt caching — IN PROGRESS

following migration checklist in `docs/model-and-cost-policy.md` section 8.

### checklist progress

- [x] sdk version verified: `@anthropic-ai/sdk ^0.91.0` (>= 0.30.0 required for caching)
- [x] audit existing model strings (`grep -rn "claude-"`):
  - `lib/engine/pre-router.ts` → was sonnet-4-6, target haiku-4-5
  - `lib/engine/synthesizer.ts` → was opus-4-7, target sonnet-4-6
  - `lib/engine/draft-pack.ts` → was opus-4-7, target sonnet-4-6
  - `scripts/poc-prerouter.ts` → poc artifact, not in prod path, leaving alone
- [x] **subtask 1.2a — pre-router migrated to haiku-4-5-20251001** (this commit)
- [ ] subtask 1.2a — a/b verify 10 calibration cases (cost confirmation pending)
- [ ] subtask 1.2b — synthesizer to sonnet + caching
- [ ] subtask 1.2b — a/b verify 5 cases
- [ ] subtask 1.2c — draft-pack to sonnet + caching
- [ ] subtask 1.2c — a/b verify 3 demo packets
- [ ] verify cost drop in `/admin/costs` (after story 1.4)

### deviations from cost-policy doc (and why)

1. **kept prompt caching on pre-router.** doc section 3 says "pre-router (haiku 4.5): skip caching." but the existing code already caches the system prompt, which is the cacheable prefix the doc said didn't exist. caching is correctly attached to the long, stable system prompt (not user content), so it pays off on every cache hit. removing it would lose money, not save it.

2. **kept `max_tokens: 2000` on pre-router, not the 1024 the doc suggests.** the doc treats pre-router as classification-only ("classification needs <500"). actual pre-router output also includes structured signals (`detected_signals`, `pdf_summaries`) which can exceed 1024. setting `max_tokens` higher does not increase cost — only realised output tokens cost money — so 2000 stays as a runaway-defense ceiling without a cost penalty.

### subtask 1.2a code changes

- `lib/engine/cost.ts`: added `computeHaikuCost` alongside `computeSonnetCost`. shared helper for both. story 1.4 will refactor to a per-model lookup table per cost-policy section 6.
- `lib/engine/pre-router.ts`: `MODEL` → haiku-4-5-20251001; `temperature: 0` added; cost call uses `computeHaikuCost`.

## stories 1.3-1.6 — not yet started

- 1.3 35-case eval — depends on 1.2 lock-in
- 1.4 cost dashboard — depends on 1.2 lock-in (per-model split needs real data)
- 1.5 production deploy — gated on 1.1-1.4
- 1.6 gst application — founder task, parallel
