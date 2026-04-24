# ClearPath docs

All ClearPath specifications, change logs, and reference artifacts. Live alongside the code they describe.

## Folder structure

```
docs/
├── specs/         — authoritative specifications (Claude Code reads these)
├── change-logs/   — versioned spec change history (oldest → newest)
└── reference/     — non-markdown artifacts (deck, risk matrix, journey image)
```

## `specs/`

The source of truth for anything a new contributor or Claude Code needs to understand, build, or extend. When these and the code disagree, the code is wrong until we decide otherwise.

Current specs:

- `clearpath_build_plan.md` — authoritative end-to-end build plan (Features 0–6)
- `clearpath_copy_scope.md` — all user-visible text, by feature
- `clearpath_screens_spec.md` — screen-by-screen wireframes
- `clearpath_engine_spec_v3.md` — classification + regulation logic
- `clearpath_output_schemas.md` — JSON / TypeScript schemas for every output
- `clearpath_posthog_events.md` — analytics events + payloads
- `clearpath_regulations.md` — the 9 regulations reference
- `clearpath_user_journeys.md` — end-to-end flow decisions
- `clearpath_timeline_model.md` — time-to-approval estimation model
- `clearpath_landing_copy.md` — landing-page copy source
- `clearpath_landing_changes.md` — landing-page change list
- `clearpath_decomposer_spec.md` — platform decomposer (Phase 2)
- `clearpath_landing_page_questions.md` — open questions pre-build
- `clearpath_pricing_and_market_strategy.md` — pricing + GTM thinking
- `CLAUDE_CODE_HANDOFF.md` — the handoff prompt for Claude Code
- `SKILL.md` — coding conventions
- `README.md` — product overview

## `change-logs/`

Every material change to the specs is appended here, numbered in the order applied. Treat them as append-only history — the patched content lives in `specs/`, not here.

- `v1_tier2_cta.md` — Tier 2 CTA framing on the Readiness Card
- `v2_wizard_conflict.md` — conflict disclosure card on wizard Q1
- `v3_intake_signals.md` — intake PDF helper + pre-router detected_signals

## `reference/`

Supporting artifacts that aren't markdown.

- `ClearPath_Deck.pptx` — pitch deck
- `ClearPath_Risk_Matrix.xlsx` — IMDRF × CDSCO class matrix
- `clearpath_founder_journey.jpg` — 6-step founder-journey visual
