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

## stories 1.3-1.6 — not yet started

- 1.3 35-case eval — depends on 1.2 lock-in
- 1.4 cost dashboard — depends on 1.2 lock-in (per-model split needs real data)
- 1.5 production deploy — gated on 1.1-1.4
- 1.6 gst application — founder task, parallel
