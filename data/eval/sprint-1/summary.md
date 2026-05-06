# sprint 1.2 batched a/b eval — results

**run date:** 2026-05-06T18:18:33.757Z
**run-by:** scripts/eval-1-2-batched.ts

## cost actuals (vs. budget)

| layer | model | total cost | total elapsed | avg per call |
|---|---|---|---|---|
| pre-router | Sonnet 4.6 (baseline) | $0.0789 | 62.5s | $0.0061 |
| pre-router | Haiku 4.5 (new) | $0.0263 | 35.0s | $0.0020 |
| synthesizer | Opus 4.7 (baseline) | $1.1798 | 320.0s | $0.1180 |
| synthesizer | Sonnet 4.6 (new) | $0.7615 | 558.6s | $0.0761 |
| draft-pack | Opus 4.7 (baseline) | $0.6702 | 335.3s | $0.1340 |
| draft-pack | Sonnet 4.6 (new) | $0.3039 | 359.6s | $0.0608 |
| **grand total** | | **$3.0206** | | |

**Budget approved:** $5.88. **Actual:** $3.0206.

## layer 1 — pre-router (Sonnet → Haiku 4.5)

| case | one-liner (truncated) | Sonnet | Haiku | match |
|---|---|---|---|---|
| CP-016 | Mobile app that logs glucose readings and gives lifestyle... | product/run_wizard | product/run_wizard | ✓ |
| CP-017 | AI model that reads ECG images and flags possible myocard... | product/run_wizard | product/run_wizard | ✓ |
| CP-018 | Smartphone-based skin lesion classifier for suspicious mo... | product/run_wizard | product/run_wizard | ✓ |
| CP-019 | XR-based surgical planning tool for orthopedic implant pl... | product/run_wizard | product/run_wizard | ✓ |
| CP-020 | Home fetal heartbeat listening device connected to a mobi... | hardware_software/run_wizard | hardware_software/run_wizard | ✓ |
| CP-021 | AI chatbot for stress journaling and mental wellness supp... | product/run_wizard | product/run_wizard | ✓ |
| CP-022 | AI model that analyzes CT brain scans to detect possible ... | product/run_wizard | product/run_wizard | ✓ |
| CP-023 | Tool that helps clinics create ABHA-linked digital health... | product/run_wizard | product/run_wizard | ✓ |
| CP-024 | AI tool that suggests likely cancer grading from patholog... | product/run_wizard | product/run_wizard | ✓ |
| CP-025 | Computer vision app that tracks physiotherapy exercise ad... | product/run_wizard | product/run_wizard | ✓ |
| EDGE-1-regulator | Inspecting CDSCO compliance documents for the Karnataka S... | regulator/reject | regulator/reject | ✓ |
| EDGE-2-investor | Looking to invest in Series A medtech startups working on... | investor/reject | investor/reject | ✓ |
| EDGE-3-fintech | AI-powered credit scoring app for Tier 2 city loan applic... | out_of_scope/reject | out_of_scope/reject | ✓ |

**match rate: 13/13 (100%)** — bar: ≥12/13 (~92%) for lock

## layer 2 — synthesizer (Opus → Sonnet 4.6, no caching)

| case | product | Opus cdsco_class | Sonnet cdsco_class | match | parse |
|---|---|---|---|---|---|
| CP-016 | GlucoTrack Lite | null | B | ✗ | O:✓/1att S:✓/1att |
| CP-017 | CardioAI Triage | C | C | ✓ | O:✓/1att S:✓/1att |
| CP-018 | DermaLens | C | C | ✓ | O:✓/1att S:✓/1att |
| CP-019 | SurgiPlan XR | C | C | ✓ | O:✓/1att S:✓/1att |
| CP-020 | BabyBeat Home | B | C | ✗ | O:✓/1att S:✓/1att |
| CP-021 | MentalWell Chat | null | null | ✗ | O:✓/1att S:✗/2att |
| CP-022 | StrokeFast | C | C | ✓ | O:✓/1att S:✓/1att |
| CP-023 | ABHA SyncPro | null | null | ✗ | O:✓/1att S:✗/2att |
| CP-024 | OncoPath Assist | C | C | ✓ | O:✓/1att S:✓/1att |
| CP-025 | PhysioMove | B | B | ✓ | O:✓/1att S:✓/1att |

**cdsco_class match: 6/10 (60%)** — bar: ≥9/10 (90%) for lock

Subjective prose review (5 cases) is human-only — see raw cards in `layer-2-synthesizer.json` field `_opus_card.gaps[*]` and similar narrative fields. Compare side-by-side.

## layer 3 — draft-pack (Opus → Sonnet 4.6, with caching)

| case | Opus cdsco | Opus sec | Sonnet cdsco | Sonnet sec | cdsco match | sec match | parse |
|---|---|---|---|---|---|---|---|
| CP-016 | B | 6 | B | 6 | ✓ | ✓ | O:✓/1att S:✓/1att |
| CP-017 | C | 6 | C | 6 | ✓ | ✓ | O:✓/1att S:✓/1att |
| CP-019 | C | 6 | C | 6 | ✓ | ✓ | O:✓/1att S:✓/1att |
| CP-022 | C | 6 | C | 6 | ✓ | ✓ | O:✓/1att S:✓/1att |
| CP-024 | C | 6 | C | 6 | ✓ | ✓ | O:✓/1att S:✓/1att |

Manual PDF/prose review on first 2 sections is human-only. Raw structured packs in `layer-3-draft-pack.json`.

## next steps

1. Founder reviews subjective prose calls (synth narrative on 5 cases, draft-pack first 2 sections).
2. Decide locks per bar criteria in sprint-1.md.
3. If pre-router locks: stays as-is (already committed in b031a05).
4. If synth locks: apply model swap to claude-sonnet-4-6 + add caching back. (Caching was disabled FOR EVAL ONLY; prod should re-enable.)
5. If draft-pack locks: apply model swap to claude-sonnet-4-6 (caching already in code).
6. Single batched commit: `feat(engine): rightsize models — Haiku/Sonnet/Sonnet — eval validated`.
