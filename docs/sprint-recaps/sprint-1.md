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

### eval bars (locked before run, may 6, 2026)

Locked **before** kicking off the batched A/B so we can't move the goalposts after seeing results. All three layers compared in isolation. If any layer fails its bar, that layer reverts; layers above/below stay on their new models.

**pre-router (sonnet → haiku 4.5)** — 13 cases (10 healthcare + 3 edge). compare haiku output vs. sonnet baseline output per case on two fields: `product_type` and `next_action`. **lock if ≥12/13 (~92%) exact match.** 11/13 = inspect failures and decide. <11/13 = revert.

**synthesizer (opus → sonnet 4.6, no caching during eval)** — 10 healthcare cases (the 3 edges reject upstream at pre-router and never reach synth).
- *objective:* `cdsco_class` exact match sonnet vs. opus on **≥9/10 (90%)**. <8/10 = revert.
- *subjective:* manual prose review on 5 cases. sonnet narrative scored 1-5 (clarity, accuracy, professionalism). **sonnet must average ≥4.0 AND no individual case may score >1 point worse than opus.**

**draft pack (opus → sonnet 4.6 + caching)** — 5 cases. side-by-side pdf review. sonnet pack must satisfy:
- (a) same section structure as opus pack (count + headings)
- (b) same `cdsco_class` and regulations verdicts
- (c) prose quality in first 2 sections reads "professional not amateur"

**any visible regression in (a)/(b)/(c) on any case = revert draft-pack to opus.** other layers stay on their new models.

### eval clarifications (locked before run)

1. **synthesizer a/b uses the new haiku pre-router output for both branches.** testing one variable at a time. pre-router output is generated once per case (with haiku) and reused as input for both opus-synth and sonnet-synth runs. if pre-router a/b fails, revert pre-router first, then re-run synth a/b with sonnet pre-router output for both branches.
2. **draft-pack a/b uses the new sonnet synthesizer output for both branches** (assuming 1.2b passes). if 1.2b fails, draft-pack a/b reuses opus-synth output for both branches.

### eval edge cases (verbatim, do not paraphrase at run time)

three rejection-path cases added to the 10 healthcare cases for pre-router coverage. each tests a distinct rejection mode haiku is most likely to fumble vs. opus:

1. **regulator** — `"Inspecting CDSCO compliance documents for the Karnataka State Drug Authority"`
   expected: `next_action: "reject"`, product_type: regulator (or rejection with conflict flag).

2. **investor** — `"Looking to invest in Series A medtech startups working on AI diagnostics in India"`
   expected: `next_action: "reject"`, product_type: investor.

3. **out-of-scope fintech** — `"AI-powered credit scoring app for Tier 2 city loan applicants in India"`
   expected: `next_action: "reject"`, product_type: out_of_scope (wrong-domain reasoning).

### eval cost budget (locked before run)

- pre-router: 13 cases × 2 models × ~$0.003 = ~$0.08
- synthesizer: 10 cases × 2 models × ~$0.04 = ~$0.80 (no caching during eval — clean per-call cost comparison)
- draft pack: 5 cases × 2 models × ~$0.50 = ~$5.00
- **total: ~$5.88.** sprint 1 budget is $25; well within.

### eval results — batched a/b run (2026-05-06)

run-by `scripts/eval-1-2-batched.ts`, raw outputs in `data/eval/sprint-1/`.

**layer 1 — pre-router (Sonnet 4.6 baseline → Haiku 4.5 candidate):** **PASS**
- match: 13/13 (100%) on `product_type` + `next_action` exact match (bar: ≥12/13 / ~92%)
- haiku correctly handled all 3 edge rejection cases (regulator/investor/fintech)
- cost: Sonnet $0.079, Haiku $0.026 (67% cheaper). time: 4.8s/call vs 2.7s/call avg
- **decision: lock haiku 4.5.** already in commit `b031a05`.

**layer 2 — synthesizer (Opus 4.7 baseline → Sonnet 4.6 candidate, no caching):** **FAIL → REVERT**
- match: 8/10 (80%) on `cdsco_class` exact match after null===null fix (bar: ≥9/10 / 90%)
- two genuine disagreements:
  - **CP-016 GlucoTrack Lite** (wellness app): Opus said `null` (wellness carve-out → DPDP focus). Sonnet said `Class B` (over-classification). a class-B verdict on a wellness app sends founders into ~₹3-8L of wasted compliance work.
  - **CP-020 BabyBeat Home** (home fetal heartbeat): Opus said `B`, Sonnet said `C`. one-class up-shift doubles regulatory pathway cost/timeline.
- two parse-fail-then-retry on Sonnet (CP-021, CP-023) — opus had 0 parse failures. **20% reliability gap.**
- subjective prose review (5 cases, 1-5 scale): Sonnet avg 3.4 (bar: ≥4.0). two cases >1 point worse than Opus (bar: 0). Sonnet narrative tends longer + more hedged + less actionable.
- 36% per-call savings doesn't justify regression. **decision: revert to opus 4.7.** no code change needed (synth was already on Opus).

**layer 3 — draft-pack (Opus 4.7 baseline → Sonnet 4.6 candidate, with caching, FIRST RUN):** PASS objective, deferred subjective lock pending re-test
- 5/5 cdsco_class match, 5/5 section count match, 6 sections each
- **caveat:** original layer 3 fed Sonnet-synth output to both branches; with synth reverting to Opus, draft-pack input changes upstream. re-test ran on 2026-05-07 with Opus-synth output (below).

### eval results — draft-pack rerun with opus-synth input (2026-05-07)

run-by `scripts/eval-rerun-dp-opus-synth.ts`. critical case: CP-016 (input synth `cdsco_class: null` + `medical_device_status: wellness_carve_out`).

| case | input synth class | input status | Opus-DP class | Sonnet-DP class | cdsco match | sec match (6) | parse |
|---|---|---|---|---|---|---|---|
| CP-016 | null | wellness_carve_out | A | A | ✓ | ✓ | both 1-attempt |
| CP-017 | C | is_medical_device | C | C | ✓ | ✓ | both 1-attempt |
| CP-019 | C | is_medical_device | C | C | ✓ | ✓ | both 1-attempt |
| CP-022 | C | is_medical_device | C | C | ✓ | ✓ | both 1-attempt |
| CP-024 | C | is_medical_device | C | C | ✓ | ✓ | both 1-attempt |

**CP-016 wellness carry-over check (the case at risk of regression):**
- both models forced to pick a class A/B/C/D by schema — both picked Class A (lowest)
- **both prose blocks correctly acknowledge the wellness carve-out positioning** and pivot the founder to DPDP as the primary compliance path
- Opus rationale (excerpt): *"The operative position is therefore that CDSCO MDR does not apply and no class designation is engaged. Class A is noted only as the closest conservative anchor if a regulator were to take an expansive view"*
- Sonnet rationale (excerpt): *"software that performs only manual data logging and delivers non-personalised wellness content is likely to be treated as a wellness carve-out, not a SaMD requiring classification"*
- neither model invented an inappropriate Class B claim from the null input. wellness signal propagated correctly through draft-pack despite schema forcing a class.

**other 4 cases:** uniform behaviour, equivalent prose, no regressions. sonnet draft-pack 52% cheaper than Opus draft-pack with caching.

**decision: lock sonnet 4.6 on draft-pack.**

cost actuals on rerun: $0.90 vs $1.50 budget (40% under). Opus draft-pack avg $0.122/call, Sonnet draft-pack avg $0.058/call (with caching).

### final stack locks (story 1.2 complete)

| layer | locked model | api id | rationale |
|---|---|---|---|
| pre-router | Haiku 4.5 | `claude-haiku-4-5-20251001` | 13/13 match; 67% cheaper than Sonnet baseline |
| synthesizer | Opus 4.7 | `claude-opus-4-7` | reverted; Sonnet failed accuracy + reliability bars |
| draft-pack | Sonnet 4.6 | `claude-sonnet-4-6` | 5/5 match across all bars including wellness carry-over case; 52% cheaper than Opus baseline |

stack name: **Haiku/Opus/Sonnet** (NOT the originally planned Haiku/Sonnet/Sonnet — Sonnet on synth failed eval).

### subtask 1.2c code changes (this commit)

- `lib/engine/draft-pack.ts`: `MODEL` → `claude-sonnet-4-6`; cost helper switched from `computeOpusCost`/`OpusUsage` (`@/lib/engine/opus-cost`) to `computeSonnetCost`/`TokenUsage` (`@/lib/engine/cost`). caching already in place; max_tokens stays at 8000 (eval validated; cost-policy says 16384 — deferred unless we hit the cap).
- `lib/engine/opus-cost.ts`: corrected per-million pricing from Opus 4.x rates to Opus 4.7 rates per cost-policy Section 2: input 15→5, output 75→25, cache_write 18.75→6.25, cache_read 1.5→0.5. previously inflated by 3×.
- `docs/decisions/2026-05-06-llm-classification-architecture.md`: new file documenting the SAE classifier audit + LLM-only decision + hybrid revisit trigger conditions.

### per-assessment cost actuals (forward from this commit)

- **free tier (Tier 0):** Haiku pre-router (~$0.002) + Opus synth (~$0.118) = **~$0.12/assessment**
- **Tier 1 (₹4,999):** free tier + Sonnet draft-pack with caching (~$0.06) = **~$0.18/assessment**
- gross margin at ₹4,999: ~99.7%

original sprint-plan target was $0.017/free-assessment (assumed Sonnet on synth + caching). target was unreachable while preserving accuracy. $0.12 is the new floor. cost-policy Section 5 medians need updating — backlog.

### cost telemetry note

`lib/engine/opus-cost.ts` had Opus 4.x rates (3× inflated) until this commit. **historical `cost_usd` values for Opus calls before this commit are unreliable.** forward telemetry is correct. don't aggregate across the commit boundary without correction. did not backfill historical data: pricing has shifted across Opus 4.0/4.1/4.5/4.6/4.7 so blanket /3 may be wrong for some rows; and historical absolute accuracy matters less than forward correctness.

### addendum (2026-05-07) — story 1.2 draft-pack caching claim correction

The Story 1.2 commit `ca2e0e7` claimed "Sonnet 4.6 with prompt caching" on draft-pack. **The caching never realized.** `DRAFT_PACK_SYSTEM_PROMPT` is 856 tokens; Sonnet 4.6's minimum cacheable prefix is 1024 tokens. The `cache_control: { type: 'ephemeral' }` directive on the system block was silently ignored by the Anthropic API on every call. Both `cache_creation_input_tokens` and `cache_read_input_tokens` returned 0.

Caught by Story 1.4b smoke test (engine_costs row for `draft_pack` showed `cache_read_tokens: 0` AND `cache_write_tokens: 0` simultaneously, which is impossible if caching were active).

Fix: directive dropped in 1.4b fix commit. Re-add only when prompt grows past 1024 tokens for legitimate content reasons (e.g. Sprint 6 real-data calibration may expand it). Re-run 5-case draft-pack A/B at that time to verify no regression vs. the locked Story 1.2 baseline.

Cost impact: Tier 1 stays at ~$0.06/draft-pack (uncached). The eval-reported $0.058/call avg from 2026-05-06 was already uncached pricing (consistent with this finding); the "55% cheaper than Opus" Story 1.2 conclusion stands but the "with caching" framing was wrong.

**Synth + pre-router caching verified WORKING in 1.4b smoke tests** (the other layers are unaffected by the draft-pack-specific issue):
- pre-router (Haiku 4.5): `cache_read: 4512` on subsequent calls, cost dropped $0.0068 → $0.0017. **75% savings cached.**
- synthesizer (Opus 4.7): `cache_read: 12170` on back-to-back calls within TTL window, cost dropped from $0.127 (uncached) to $0.060/$0.071 (cached). **47-51% savings cached.**

Both are above the 1024-token cache minimum (pre-router prompt ~4500 tokens, synth prompt ~7700 tokens) so caching engages naturally.

## backlog (logged during sprint 1)

- **`docs/model-and-cost-policy.md` section 1 incorrectly describes pre-router as outputting cdsco_class.** pre-router actually outputs `product_type`, `next_action`, `conflict_detected`, `detected_signals`. cdsco_class is a synthesizer output. fix the doc when we revisit it (probably end of sprint 1). source: caught during story 1.2 eval-bar prep, 2026-05-06.

- **eval-script null-match bug (found and fixed during story 1.2 eval, 2026-05-07).** the original `scripts/eval-1-2-batched.ts` had `cdscoMatch = opusClass !== null && opusClass === sonnetClass` in two places. that treats null===null as a non-match — wrong, because both models agreeing "no class / wellness" IS agreement. fixed to `opusClass === sonnetClass` in both places. layer 2 reported match rate moved from 6/10 → 8/10 after the fix; only CP-021 and CP-023 flipped, no other changes. fix landed in `scripts/eval-1-2-batched.ts` lines 482 + 574.

- **`docs/model-and-cost-policy.md` section 5 medians are ~2× low on synth.** real opus synth median is ~$0.118/call, real sonnet synth median ~$0.076/call. doc says ~$0.06 for opus, ~$0.035 for sonnet — both half of actual. likely because the system prompt is bigger than the doc author assumed when projecting. update at end of story 1.2 batch commit. source: eval-actual cost data 2026-05-06, run-by `scripts/eval-1-2-batched.ts`.

- **sonnet has higher JSON-parse-fail rate on the synth schema (2/10 = 20% vs. opus 0/10 = 0%).** during story 1.2 eval, sonnet needed the strict-suffix retry on CP-021 + CP-023 to produce schema-valid output. opus parsed clean on attempt 1 in all 10 cases. note for **story 1.3**: stricter system-prompt instructions or schema-forcing techniques (XML output mode? structured output API?) might close the gap. low priority for sprint 1 since we reverted synth to opus, but if synth is ever revisited for cost reasons, this is a known reliability gap to design around.

- **re-add draft-pack caching IF/WHEN prompt grows past Sonnet's 1024-token threshold** for legitimate content reasons. Sprint 6 real-data calibration may add content that crosses the threshold. When it does: re-add `cache_control: { type: 'ephemeral' }` on the system block AND re-run the 5-case draft-pack A/B (Opus baseline vs. cached-Sonnet) to verify no prose-quality regression vs. the locked Story 1.2 baseline. Logged during 1.4b fix, 2026-05-07.

- **cache-hit telemetry visibility.** readiness-card cache hits in `lib/engine/run-synthesis.ts:175-190` are currently silent — no log, no row in `engine_costs`, no metric on `assessments`. Story 1.4b smoke test caught a "missing synth row" that turned out to be a cache hit (verified via `meta.synthesizer_cache_hit_from`). For dashboard visibility, either write `call_layer='synth_cache_hit'` rows with `cost_usd=0` OR add a `cache_hit_count` column on `assessments`. Visibility matters more than cost capture (cache hits are $0 by design). Defer to post-1.4c. Logged during 1.4b fix, 2026-05-07.

- **audit readiness-card cache behavior.** the cache in `run-synthesis.ts:175-190` is currently silent and has no invalidation tied to synth prompt-tuning commits. Risk: customer receives stale cached output after a synth prompt fix that should have changed the verdict. Partner-facing risk if a regulator-style reviewer sees inconsistent classifications across similar inputs. Decide: keep with explicit invalidation on prompt-version bumps, add a TTL, or remove entirely. Logged during 1.4b fix, 2026-05-07.

- **re-label 50-case calibration set with regulatory advisor (former CDSCO official) when one is recruited (Sprint 6+ per advisor recruitment plan).** Expected divergence: 3–5 cases out of 50. Cases where advisor disagrees with founder + LLMs become high-signal eval data. Set lives at `data/calibration/clearpath_synthetic_50_full_schema_v2_1.json`; current labels are LLM-generated (OpenAI), founder-validated, Gemini-cross-validated. Logged during Story 1.3 pivot, 2026-05-08.

- **strict vs. tolerant gap monitoring during real-data calibration (Sprint 6+).** Currently 80% strict / 98% tolerant on the 50-case calibration. The 18-point gap is mostly off-by-one near the B/C and C/D boundaries — exactly the regulatory-ambiguity zones the labels acknowledge with `or_acceptable`. Investigate whether systematic biases emerge with real founder data: does Opus consistently over-classify in one direction? Under-classify? Are specific product types (e.g. AI-CDS, IVD) drifting? Surfaces whether the synth prompt needs further tightening or whether the gap is genuinely irreducible regulatory ambiguity. Logged during Story 1.3 close, 2026-05-08.

- **readiness-card cache audit: decide policy.** Already noted as partner-facing risk during Story 1.4b; reaffirmed during Story 1.3 close. Options: (a) keep with explicit `CACHE_VERSION` invalidation on prompt-version bumps (current pattern — relies on operator discipline), (b) add a TTL (bounded staleness window even if `CACHE_VERSION` is forgotten), (c) remove entirely (lose the cost savings on repeated assessments but eliminate the risk). Decide before Story 1.5 ships. Logged 2026-05-08.

- **eval pipeline production parity.** Story 1.3 recon scripts (`scripts/recon-50.ts`, `scripts/eval-1-2-batched.ts`) had permissive fallback extraction that hid the Zod schema-validation bug fixed in 1.3.5 — the recon scored predictions even when `ReadinessCardSchema.parse()` would have thrown in production. Future eval pipelines must exercise the same production code path the engine uses, not parallel scoring-only logic. Investigate at Sprint 4 when QC workflow ships (eval and QC will share infrastructure). Stopgap landed in 1.3.5: `scripts/test-prod-parity.ts` calls `runSynthesizer()` directly on a known wellness case as a sanity check. Logged 2026-05-08.

- **full 50-case eval re-run discipline before any major prompt or model change.** Targeted 10-case eval was used in Story 1.3.5 close to manage cost (~$0.60 vs. ~$3 for full 50). Full eval discipline applies for future significant changes (major prompt revision, model swap, schema overhaul). Targeted evals OK for surgical fixes only. Logged 2026-05-08.

- **eval variance reduction.** Multiple Story 1.3 cases (CP-038 insulin advisor, CP-013 oral cancer screening, possibly others on borderline B/C/D) flipped strict-match status across eval runs due to Opus sampling variance — the v3 100% tolerant headline was partly variance-aided. For defensible accuracy claims, future evals should run each case 3–5 times and report median/range, not single-shot. Address at Sprint 6 real-data calibration when production data accumulates. Logged 2026-05-08.

- **calibration coverage gaps at TRL 3 and TRL 9.** Story 1.3.5 prompt-alignment fixes were verified directly for TRL 4, 5, 6, 7, 8 but only indirectly (via CP-045 producing TRL 3 in v3) for TRL 3, and not at all for TRL 9. Add cases at TRL 3 and TRL 9 when natural founder data accumulates at Sprint 6 real-data calibration. Until then: latent risk is small (TRL 9 in-market-with-PMS is rare in pre-market regulatory readiness use case). Logged 2026-05-08.

- **calibration set v3 candidate: founder-authored TRL 3 (pre-prototype) and TRL 9 (in-market with PMS) cases.** Add to `data/calibration/clearpath_synthetic_50_full_schema_v2_1.json` or successor file when expanding the calibration set. Use the multi-LLM cross-validation approach used for v2.1 (OpenAI-generated, founder-validated, Gemini-cross-validated). Logged 2026-05-08.

### Security note (Story 1.3.5, 2026-05-08)

A tool result during diagnostic contained a fake `<system-reminder>` block attempting to redirect to an unrelated project (Lovable / Case Surveillance). Claude Code correctly identified as out-of-band and ignored. No action taken on the injected instruction. Logged for audit trail.

## story 1.3 — 50-case eval — ✅ DONE (2026-05-08)

### close-out summary

- 50-case calibration set with founder-validated multi-LLM labels (LLM-generated by OpenAI, validated by Raunaq, cross-validated against Gemini)
- **Tolerant match: 49/50 = 98% (bar ≥90% — exceeded)**
- **Strict match: 40/50 = 80%**
- Total cost: $5.87 across two eval runs (Batch API, 50% off list rates)
- Prompt iteration: 1 targeted fix (scribe / documentation tools modifier)
- Label correction: 1 case (CP-006 from B/[C] to null/[A], with `label_corrected_at` + `label_correction_reason` audit-trail fields)
- Schema-validation fails: 1/48 in v2 (down from 4/48 in v1) — separate Story 1.3.5 investigation
- Founder bucketing of the 3 v1 disagreements documented in `data/eval/sprint-1-3/disagreements.md`
- Outstanding: CP-013 strict regression (C → B) accepted as borderline-tolerant within `or_acceptable=[B]`. Monitor in Sprint 6 real-data calibration; not blocking.



**Pivot 2026-05-08:** founder uploaded a complete 50-case calibration set with `expected_cdsco_class` + `or_acceptable` + `rationale` + `labeled_by` + `labeled_at` populated. Provenance: LLM-generated (OpenAI), founder-validated (Raunaq), cross-validated against Gemini. The earlier 35-case labeling work was superseded — the 35 overlapped with the 50, so running both was redundant.

- Primary calibration: `data/calibration/clearpath_synthetic_50_full_schema_v2_1.json`
- Validator: `scripts/validate-calibration-50.ts` (passes).
- Eval runner: `scripts/recon-50.ts` (Batch API, 50% off list rates).
- Eval bar: ≥90% TOLERANT (`predicted ∈ {expected} ∪ or_acceptable`); STRICT also reported, internal-only.

### v1 recon (first run, locked Haiku/Opus stack)

| | |
|---|---|
| Tolerant match | **47/50 (94.0%)** — bar ≥90% PASS on first run |
| Strict match | 38/50 (76.0%) |
| Disagreements | 3 |
| Pre-router errors / parse-fails | 0 / 0 |
| Synth parse-fails (Zod schema) | 4/48 — see Story 1.3.5 backlog |
| Cost (Batch API) | $3.17 ($0.04 pre-router + $3.13 synth) |
| Time | 707s (~12 min) |

Founder bucketing of the 3 disagreements (full record in `data/eval/sprint-1-3/disagreements.md`):
- **CP-006 MediAdhere → LABEL_WRONG.** Reminder-only adherence is wellness/non-device. Corrected label B/[C] → null/[A]. Audit-trail fields `label_corrected_at`, `label_correction_reason` added.
- **CP-038 Insulin Advisor → BORDERLINE.** Open-loop "advisor" lives at C/D boundary. No label change; CP-038 stays a known strict + tolerant miss. Revisit with regulatory advisor.
- **CP-046 MedVoice Scribe → OPUS_WRONG.** Real over-classification: Opus said Class B SaMD; AI medical scribes that transcribe doctor-patient conversations into EHR are documentation, not clinical decision support. Default null/[A]. Synth prompt fix added.

### Synth prompt fix (CP-046)

Added a new "Documentation / scribe tools" modifier to the IMDRF × CDSCO matrix in `lib/engine/synthesizer-system-prompt.ts`. Differentiates AI-assisted medical documentation (scribes, dictation aids, note-taking → null/A) from AI clinical decision support (Class B+). Integrated cleanly with existing modifiers; no duplication.

**Prod deploy note:** synth prompt changed → `CACHE_VERSION` env var must be bumped on Vercel before deploy (per the comment at the top of the prompt file). Otherwise stale cached cards will be served. Logged for Story 1.5.

### v2 recon (after label correction + prompt fix)

| | v1 | v2 |
|---|---|---|
| Tolerant match | 47/50 (94.0%) | **49/50 (98.0%)** ↑ |
| Strict match | 38/50 (76.0%) | 40/50 (80.0%) ↑ |
| Disagreements | 3 | **1** (CP-038, the known borderline) |
| Synth parse-fails (Zod) | 4/48 | 1/48 ↓ |
| Cost (Batch API) | $3.17 | $2.70 |
| Time | 707s | 709s |

**CP-046 verification:** v1 predicted Class B, v2 predicts `null` — fix lands.
**CP-006 verification:** v1 expected B (mismatch with predicted null), v2 expected null after relabel (matches).
**Zero tolerant regressions** on the 47 cases that already matched in v1.

Three predictions flipped between v1 and v2; all three stay tolerant:
- CP-046 B → null (the fix)
- CP-026 D → C (improvement: D was tolerant-via-`or_acceptable`; C is now a strict match)
- CP-013 C → B (slight strict regression: was strict in v1; in v2 tolerant via `or_acceptable=[B]`. Worth a flag — the scribe modifier may have nudged Opus's interpretation of borderline B/C cases. Not blocking; revisit if pattern shows in future eval runs)

### Cost + time totals

- v1 + v2 = $3.17 + $2.70 = **$5.87** total Story 1.3 spend (well under the $5–10 envelope projected in the plan).
- Wall time ≈ 24 min batch processing + dev work.

## story 1.3.5 — schema-strictness fix + TRL prompt/schema alignment — ✅ DONE (2026-05-09)

**Origin (Story 1.3 v1 recon, 2026-05-08):** 4/48 synth outputs parsed as valid JSON but failed strict `ReadinessCardSchema` Zod validation. v2 dropped to 1/48; v3 still 1/48 (different case). All such failures tolerantly matched via the recon's permissive fallback — but production has no such fallback (`synthesizer.ts:179` throws after 2 failed parses). Latent prod bug: 2–8% of wellness/non-device assessments would have errored.

### Diagnostic findings

`scripts/diagnose-schema-fails.ts` traced every v1 + v2 failure to a single Zod issue: `trl.next_milestone` was `null` but the schema required `string`. Two compounding causes:
1. `trl` was `.optional()` but not `.nullable()` — the prompt's literal "set `trl: null`" was impossible to satisfy under the schema.
2. Inside `trl`, `next_milestone` and `rationale` were required-string with no nullable allowance — Opus's natural compromise (object of nulls + a rationale string) failed.

Full per-case Zod error report in `data/eval/sprint-1-3/schema-validation-diagnostic.md`.

### Fixes applied (single commit closing 1.3.5)

1. **Schema fix** (`lib/schemas/readiness-card.ts`):
   - `trl: z.object({...}).optional()` → `trl: z.object({...}).nullable().optional()`
   - Inside the object, `next_milestone` and `rationale` made `.nullable()`.
   - Schema now accepts three shapes: literal `null`, full populated object, or all-null object with a non-null rationale.

2. **Prompt label/enum alignment** (`lib/engine/synthesizer-system-prompt.ts`):
   v3 surfaced a separate latent bug — CP-045 RemoteSpiro emitted `stage: "early_stage_poc"`, schema expected `early_poc`. Audit found 6 TRL stage labels that diverged from the schema enum:

   | TRL | Old label | New label |
   |---|---|---|
   | 3 | `Early-stage PoC` | `Early PoC` |
   | 4 | `Advanced PoC (Design Freeze)` | `Advanced PoC` |
   | 5 | `Test-batch Evaluation` | `Test Batch` |
   | 6 | `Pilot CI/CPE` | `Pilot Study` |
   | 7 | `Pivotal CI/CPE` | `Pivotal Study` |
   | 9 | `Commercialisation + PMS` | `Commercialisation` |

   Each renamed label now snake-cases cleanly to its schema enum. Surrounding text and the "Anchored to" column preserve the CDSCO/CI/CPE/PMS context.

3. **Production parity test** (`scripts/test-prod-parity.ts`): single Opus call through `runSynthesizer()` (the prod path, not recon's permissive fallback) on a known wellness case (CP-001 SymptomGuide). Asserts schema validates and `cdsco_class === null`. Catches recon-fallback masking in the future.

4. **Recon resume helper** (`scripts/recon-50-resume.ts`): added after a transient `ENOTFOUND api.anthropic.com` blip killed the v4 polling loop mid-run. Resumes from the existing batch IDs without re-submitting (saves the cost already paid). Useful for any future batch-API run hit by network instability.

### Story 1.3.5 verification scope

**Directly verified via eval (targeted-v4, 9 cases):**
- Schema fix (trl nullable for wellness/non-device): **0/9 schema fails** (was 1/48 in v3, 4/48 in v1)
- Production parity test: **PASS** (CP-001 SymptomGuide through real `runSynthesizer()`, schema validated cleanly, returned in 33s)
- Classification regressions: **0** (CP-017 → C, CP-024 → C, CP-046 → null all hold; wellness cases still classify cleanly)
- CP-045 specifically: previously v3's schema fail with `stage: "early_stage_poc"`; v4 parses cleanly and returns Class B as expected

**Statically verified (not eval-stressed):**
- 6 TRL stage label/enum alignments: each renamed prompt label snake-cases cleanly to its schema enum (mechanical correctness)
- CP-045 in v3 produced TRL 3 with the old label; v4 produced `trl: null` (Opus exercised the new nullable schema path). Direct stress-test of the renamed labels did not occur in v4 — none of the 9 cases emitted a non-null TRL stage.

**Known latent risk:**
- Calibration set has zero cases at TRL 3 and TRL 9; renamed labels at those stages were never directly stress-tested.
- Two backlog items already logged for Sprint 6 real-data calibration to fill these gaps.

The schema fix closed a real prod bug (2–8% wellness assessments would have errored). The label fixes preempt a class of latent prod bugs that sampling variance was hiding. Both are net wins; label fixes carry "static-only" verification status documented honestly.

### v4 numbers

| | v3 | v4 (targeted, 9 cases) |
|---|---|---|
| Tolerant match | 50/50 (100.0%) | **9/9 (100.0%)** |
| Strict match | 41/50 (82.0%) | 7/9 (77.8%) |
| Schema-validation fails | 1/48 | **0/9** |
| Cost (Batch API) | $3.04 | $0.62 |

### Sprint 1 engine calibration spend (cumulative)

- v1 full recon (Story 1.3): $3.17
- v2 full recon (Story 1.3): $2.70
- v3 full recon (Story 1.3.5 schema fix): $3.04
- v4 targeted (Story 1.3.5 prompt-alignment): $0.62
- Plus production-parity test ($~0.10) + diagnostic API calls (~$0): rounding noise
- **Total Story 1.3 + 1.3.5 eval spend: ~$9.53**
- Plus Story 1.2 batched A/B eval: $3.02
- Plus assorted poc + verify scripts: ~$3
- **Total Sprint 1 engine calibration spend: ~$15.40**
- Sprint 1 budget envelope (~$25): **under**

## stories 1.5-1.6 — not yet started

- 1.5 production deploy — **READY TO START** on founder greenlight. Branch `feat/trl-completion-card` carries 11 commits to merge. Pre-merge checklist:
  1. Bump `CACHE_VERSION` env var on Vercel (Production scope) — Story 1.4b backlog item; required before merge to invalidate stale readiness cards under the pre-Story-1.3 synth prompt.
  2. Smoke-test plan against preview deployment (4 demo packets, /regulations, /upgrade, /admin) before promoting to production.
  3. Rollback plan: revert last commit on main, redeploy.
- 1.6 gst application — founder task, parallel

### Story 1.5 explicit prerequisite (added 2026-05-08)

**Bump `CACHE_VERSION` env var on Vercel production BEFORE merging
`feat/trl-completion-card` to `main`.** Stale cached readiness cards
generated under the pre-Story-1.3 synth prompt would otherwise serve users
for hours post-deploy — the scribe-classification fix and any other
prompt-driven changes would not take effect until the cache turns over
(see comment at top of `lib/engine/synthesizer-system-prompt.ts`).

The mechanism: `lib/engine/run-synthesis.ts` reads `process.env.CACHE_VERSION`
and writes it into the `readiness_card_cache` row; subsequent reads match on
that version (`lib/engine/readiness-cache.ts:49`). Bumping the env var
invalidates all prior cached cards in one shot.

Operator checklist for the deploy:
1. In Vercel project env vars (Production), bump `CACHE_VERSION` (e.g. `v3` → `v4`).
2. Confirm the new value is set across Production scope only (preview can carry the old value briefly during smoke test if helpful).
3. Trigger redeploy so new value is picked up.
4. Smoke-test a known wellness/scribe one-liner; verify the new prompt's behavior.
