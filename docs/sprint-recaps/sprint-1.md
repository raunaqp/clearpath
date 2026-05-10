# sprint 1 retrospective (may 6 – may 10, 2026)

## what shipped

8 stories closed, 12 commits on `feat/trl-completion-card`, merged to `main` via PR #1 (`ddd999f`) on May 10. Production live at clearpath-medtech.vercel.app.

| story | title | status |
|---|---|---|
| 1.1 | polling architecture for draft pack | ✅ done — Vercel Fluid Compute 300s timeout removed need for Modal |
| 1.2 | model rightsizing + prompt caching | ✅ done — Haiku/Opus/Sonnet stack locked |
| 1.3 | 50-case eval to ≥90% tolerant | ✅ done — 49–50/50 = 98–100% tolerant |
| 1.3.5 | schema-strictness fix + TRL alignment | ✅ done — closed latent prod bug for wellness path |
| 1.4a | engine_costs table refactor | ✅ done |
| 1.4b | per-call cost capture | ✅ done |
| 1.4c | /admin/costs dashboard | ✅ done |
| 1.5 | production deploy | ✅ done — PR #1 merged, live |

(1.6 GST application is the parallel founder track — not engineering.)

## latent bugs caught and fixed

5 real bugs surfaced and closed during sprint:

1. **3× Opus pricing inflation** in `lib/engine/opus-cost.ts` — held legacy Opus 4.x rates against Opus 4.7 traffic. Caught during the 1.2 batched A/B review (commit `ca2e0e7`). Forward telemetry now accurate; pre-fix Opus telemetry is unreliable.
2. **Polymorphic FK anti-pattern** proposed for the `engine_costs` table (single FK to either assessments or unspecified-future-thing). Rejected during 1.4a design in favor of a proper FK to `assessments(id)` with `on delete cascade`. No prod code touched the bad design.
3. **Draft-pack `cache_control` directive was a no-op** since the 1.2 model swap to Sonnet — Sonnet's prompt was just under the 1024-token cache minimum, so caching never engaged. Smoke-test of `/admin/costs` showed 0 cache hits on draft-pack; investigation confirmed (commit `b8591f5`).
4. **Wellness schema rejection on null TRL fields** (Story 1.3.5). 4/48 v1 + 1/48 v2 + 1/48 v3 wellness assessments produced `trl.next_milestone: null`, but the schema required `string`. Production has no permissive fallback (`synthesizer.ts:179` throws after retry) — would have errored 2–8% of wellness assessments. Recon scripts had a permissive fallback that masked it.
5. **6 TRL prompt/schema enum mismatches.** CP-045 RemoteSpiro v3 surfaced one (`Early-stage PoC` → `early_stage_poc` ≠ schema's `early_poc`). Audit found 5 more latent (`Advanced PoC (Design Freeze)`, `Test-batch Evaluation`, `Pilot CI/CPE`, `Pivotal CI/CPE`, `Commercialisation + PMS`). All 6 prompt labels realigned in one commit (`42a456a`).

## process patterns established

- **eval discipline** — every prompt or model change validated against the calibration set before lock; no "ship-and-watch."
- **verify-before-build** — empirical checks before assuming. Saved real time on Story 1.1 (Vercel timeout was already 300s — no Modal needed) and surfaced bug #3 above.
- **smoke testing** — preview deployment exercised end-to-end before merge to `main`. 1.5 smoke caught a `/upgrade` route assumption mismatch (the route doesn't exist in the user-facing app); pre-flight grep added to checklist for next time.
- **decision docs** in `docs/decisions/` for high-impact architectural choices (auth strategy, polymorphic FK rejection, legal-risk acceptance).
- **single-commit story closes** — each story closes with one atomic commit. Prevented mid-flight scope creep.
- **founder bucketing of eval disagreements** — A (Opus wrong) / B (label wrong) / C (borderline) / unsure. Used on 3 Story 1.3 disagreements; produced 1 prompt fix + 1 label correction + 1 accepted borderline.

## engine calibration outcomes

- **calibration set:** 50 cases, founder-validated, multi-LLM cross-validated (OpenAI-generated, Gemini-checked).
- **tolerant match:** 49–50/50 (98–100%, variance-aided on borderline cases — flagged for multi-shot eval in Sprint 6).
- **strict match:** 40–41/50 (78–82%) — 18-point gap is mostly off-by-one near B/C and C/D boundaries.
- **schema-validation failures:** 0 after 1.3.5 fixes.
- **production parity test** (`scripts/test-prod-parity.ts`) passing — calls real `runSynthesizer()`, not recon's permissive fallback.

## cost discipline

- **sprint 1 engine eval spend:** ~$15.40 (under $25 envelope).
  - 1.2 batched A/B: $3.02
  - 1.3 v1+v2: $5.87
  - 1.3.5 v3+v4: $3.66
  - misc poc + verify scripts: ~$3
- **per-assessment cost actuals (post-rightsizing):**
  - Tier 0 (Risk Card): ~$0.06–0.13
  - Tier 1 (Risk Card + Draft Pack): ~$0.12–0.18
- **cache effectiveness (smoke-test conditions):** pre-router 75%, synth 47–51%. Production figures will be lower than the 94% the smoke test induced — real-user request distribution is more diverse.

## time taken

- May 6 — sprint planning + Story 1.1 closed
- May 7 — 1.2 batched A/B + 1.4a/b
- May 8 — 1.3 close + 1.3.5 schema fix + 1.4c
- May 9 — 1.3.5 prompt-alignment + cache verification
- May 10 — PR #1 merged + production deploy

~3.5–4 productive engineering days across 5 calendar days.

## what worked

- **stopping at decision points to verify** — Vercel timeout, schema state, cache implementation. Each verification either saved time (Modal not needed) or caught a real bug (cache_control no-op, schema strictness).
- **honest verification framing** in commit messages and recap. e.g., 1.3.5 close-out explicitly says "label fixes static-correct only, not eval-stressed" — keeps confidence claims tight.
- **single-commit story closes** prevented scope creep mid-story.
- **cost-policy doc evolved** as costs were measured (not assumed). Section 5 medians revealed 2× under-projection on synth; corrected forward.
- **prompt-injection caught** during 1.3.5 diagnostic — fake `<system-reminder>` redirected to an unrelated project; identified as out-of-band, ignored, logged.

## what to adjust for sprint 2+

- **smoke-test checklist accuracy** — pre-flight grep routes against the actual codebase before adding to the checklist. The `/upgrade` mismatch in 1.5 was avoidable.
- **eval pipeline production parity** — recon scripts had permissive fallback that hid the wellness schema bug. Sprint 4 fix per backlog (eval and QC will share infra).
- **eval variance reduction** — single-shot evals on borderline B/C/D cases are noisy. Sprint 6+ multi-shot (3–5 runs per case, median/range).
- **calibration coverage gaps at TRL 3 and TRL 9** — Sprint 6+ real-data fill.
- **auth UX** — founder feedback during 1.5 smoke: prefer custom login form over the Basic Auth browser popup. Sprint 2+.

## backlog items added during sprint 1

- **`docs/model-and-cost-policy.md` doc fixes:** Section 1 incorrectly attributes `cdsco_class` to pre-router (it's a synth output); Section 5 cost medians are ~2× low on synth.
- **sonnet JSON-parse-fail rate** (20% on synth schema vs. 0% for Opus) — note for if synth is ever revisited for cost reasons.
- **draft-pack caching re-add** if/when the prompt grows past Sonnet's 1024-token cache minimum.
- **cache-hit telemetry visibility** — readiness-card cache hits are silent; need a metric or zero-cost row for `/admin/costs`.
- **readiness-card cache audit policy** — keep with `CACHE_VERSION` discipline, add TTL, or remove. Decide before next prompt-touching deploy.
- **re-label 50-case calibration set with regulatory advisor** when one is recruited (Sprint 6+). Expected divergence: 3–5 cases.
- **strict vs. tolerant gap monitoring** during real-data calibration (Sprint 6+) — currently 78–82% strict / 98–100% tolerant.
- **eval pipeline production parity** — Sprint 4 alongside QC workflow.
- **full 50-case eval discipline** before any major prompt or model change (targeted evals only for surgical fixes).
- **eval variance reduction** — multi-shot per case at Sprint 6.
- **calibration coverage gaps at TRL 3 and TRL 9** (Sprint 6+ real-data fill).
- **calibration set v3 candidate** — founder-authored TRL 3 (pre-prototype) and TRL 9 (in-market + PMS) cases when expanding.

## sprint 2 starting state

- engine calibrated at 98% tolerant on 50-case set; production parity test passing.
- cost telemetry end-to-end: `engine_costs` table populated per call, `/admin/costs` dashboard shipping.
- production live at clearpath-medtech.vercel.app.
- roadmap feedback parked at `docs/roadmap/sprint-2-plus-feedback.md` (6 items + operational signals).
- ready for sprint 2 planning session.

### security note (sprint 1)

A tool result during the Story 1.3.5 diagnostic contained a fake `<system-reminder>` block attempting to redirect to an unrelated project (Lovable / Case Surveillance). Identified as out-of-band and ignored. No action taken on the injected instruction. Logged for audit trail.
