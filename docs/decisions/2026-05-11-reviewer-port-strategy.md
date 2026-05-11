# Reviewer-flow port strategy for Story 2.5 (upgraded Draft Pack)

**Date:** 2026-05-11
**Status:** drafted (Sprint 2 Story 2.4). Founder review required before Story 2.5 starts.
**Owner:** Raunaq Pradhan
**Related:** `docs/roadmap/sprint-2-plan.md` (Stories 2.3, 2.5), `supabase/migration-009-upgraded-draft-pack-schema.sql`

---

## TL;DR

The `cdsco-reviewer-tool` repo's customer-facing flow is **partially portable**, not a clean lift. Three structural mismatches make it a porting decision rather than a copy:

1. **Different draft-pack model.** Reviewer = template-based (MD-7, MD-3, DMF, RMF, IFU, ACP — markdown templates with `{{}}` field substitution). Story 2.5 = sectioned (12 sections per CDSCO MDR with editable content + citations). The reviewer's templates are useful as *source material* for AI-generated section content, but they're not the section structure.
2. **Different schema.** Reviewer collapses applicant + status + scores into one `applications` table; clearpath splits across `assessments` + `orders` + the new `draft_pack_*` tables (Story 2.3). The split should stay.
3. **Different question axes.** Reviewer wizard is regulatory-forward (5 Qs: intended_use, device_class, ai_ml, data_sensitivity, target_market). Clearpath wizard is clinical-context-forward (7 Qs: clinical state, decision influence, users, scale, integrations, data type, commercial stage). Neither is a strict superset.

What's worth porting: predicate matching infrastructure (with a schema shim), the predicate selection UI components, the `[TBD]` placeholder pattern, and the `EditableDraft.tsx` editor pattern as a reference.

What's not worth porting: the `applications` table model, document versioning + anonymization, thread messages, reviewer/inspector/SAE/SEC modules, HTTP Basic auth.

---

## a. What customer-facing components exist in cdsco-reviewer-tool

**Routes (`app/apply/`):**

| Route | Purpose | LOC |
|---|---|---|
| `apply/page.tsx` | Intake (application submission, pitch deck upload) | 236 |
| `apply/[id]/wizard/page.tsx` | 5-question regulatory wizard | 157 |
| `apply/[id]/card/page.tsx` | Readiness card view (post-wizard) | 178 |
| `apply/[id]/build/page.tsx` | Build-flow shell | 14 |
| `apply/[id]/build/predicates/page.tsx` | Step 1 — pick predicate devices | 116 |
| `apply/[id]/build/documents/page.tsx` | Step 2 — upload checklist documents | 113 |
| `apply/[id]/build/draft-pack/page.tsx` | Step 3 — fill MD-7 / MD-3 / DMF / RMF / IFU forms | 208 |
| `apply/[id]/build/preview/page.tsx` | Final review + completeness gate | 372 |
| `apply/[id]/submitted/page.tsx` | Post-submission confirmation | 171 |
| `apply/[id]/status/page.tsx` | Status tracker (queries from reviewer) | 203 |

**Components (`components/applicant/` — 1,750 LOC total):**

| Component | LOC | Notes |
|---|---|---|
| `WizardForm.tsx` | 246 | 5-Q form, save state per question |
| `BuildStepNav.tsx` | 54 | Step 1/2/3 + preview header |
| `PredicatesPanel.tsx` | 253 | AI suggestions + manual entry, save & continue |
| `DocumentsPanel.tsx` | 222 | Per-checklist-item upload with versioning |
| `DocumentsSummary.tsx` | 83 | Sidebar/preview of uploaded docs |
| `BuildSubmitPanel.tsx` | 369 | Final-stage submit (split out of preview) |
| `PreviewSubmitPanel.tsx` | 262 | Pre-submit completeness gate |
| `ReviewerQueryBanner.tsx` | 61 | Banner shown when reviewer raises a query |
| `SubmittedHeaderActions.tsx` | 90 | Post-submission actions |

**Components (`components/draft-pack/` — 1,372 LOC total):**

| Component | LOC | Notes |
|---|---|---|
| `DraftPackTabs.tsx` | 35 | Tab nav across templates |
| `EditableDraft.tsx` | 309 | Markdown editor with save + AI assist |
| `MD3Form.tsx` | 504 | Form-based MD-3 application |
| `MD7Form.tsx` | 508 | Form-based MD-7 application |
| `PrintButton.tsx` | 16 | window.print() trigger |

**Components (`components/predicates/` — 271 LOC total):**

| Component | LOC | Notes |
|---|---|---|
| `PredicatePanel.tsx` | 86 | Reviewer-side predicate detail |
| `PredicateSuggestions.tsx` | 129 | Suggestion list with select/dismiss |
| `SelectedPredicateList.tsx` | 56 | Selected items + remove |

**Lib (`lib/draft-pack/`, `lib/predicates/`, `lib/applicant/`):**

| File | LOC | Purpose |
|---|---|---|
| `lib/applicant/wizard-questions.ts` | 68 | 5-Q wizard schema |
| `lib/draft-pack/template-fill.ts` | 187 | `{{path.dot.notation}}` filler with `[TBD]` fallback |
| `lib/draft-pack/template-doc-types.ts` | 60 | Maps checklist type → template |
| `lib/draft-pack/templates-bundled.ts` | 12 | Bundles markdown templates as TS strings |
| `lib/draft-pack/templates/*.md` | 7 files | MD-3, MD-7, DMF outline, RMF outline, IFU, IU statement, ACP |
| `lib/draft-pack/md3-form.ts` / `md7-form.ts` | 113 / 211 | Form-shape definitions |
| `lib/predicates/match.ts` | 76 | pgvector RPC `match_predicates` + 1hr in-memory cache |
| `lib/predicates/embed.ts` | 30 | Query embedding (Modal endpoint, 384-dim MiniLM) |
| `lib/predicates/selected.ts` | 107 | Selection state helpers |

---

## b. Section structure and naming conventions used

**Reviewer's draft pack is template-based, NOT section-based.** Templates are:

```
MD-7.md                            (manufacturing licence form, Class C/D)
MD-3.md                            (manufacturing licence form, Class A/B)
device-master-file-outline.md      (DMF skeleton)
risk-management-file-outline.md    (RMF skeleton)
intended-use-statement.md          (single-page IU declaration)
indications-for-use.md             (clinical indications)
algorithm-change-protocol.md       (only when AI/ML adaptive)
```

Each template uses `{{namespace.field}}` placeholders (e.g. `{{company.name}}`, `{{product.intended_use_summary}}`). `lib/draft-pack/template-fill.ts` resolves them from intake + wizard + AI extraction; unresolved fields render as `[TBD]` (visible placeholder, applicant fills in-place).

**Tab order** is computed from the per-class checklist (`lib/upload/checklist.ts` → `generatableChecklistForCategory`) so adding a checklist item flows automatically into the tabs.

**This is orthogonal to the 12-section CDSCO MDR structure clearpath needs.** MD-7 is one *form* the applicant submits, not one of the 12 sections of the technical dossier. The reviewer repo never represents "Section 4 — Predicate Comparison" as its own editable surface; predicates live in their own Step 1 page (`build/predicates`) and feed into multiple templates downstream.

**Implication for Story 2.5:** clearpath defines its own `section_key` taxonomy in `draft_pack_sections`. The 12 sections per Sprint 2 plan: Device Description, Intended Use, Classification Justification, Predicate Comparison, Risk Management, Clinical Evidence, Software Lifecycle, Cybersecurity Plan, Labeling, plus 3 more (TBD — open question 1 below).

---

## c. Question set comparison: reviewer vs clearpath wizard

| Axis | Reviewer (5 Qs) | Clearpath (7 Qs) |
|---|---|---|
| Q1 | `intended_use` (free text) | `clinical_state` — critical / serious / non-serious / varies |
| Q2 | `device_class` — class_a_b / class_c_d / samd_class_a_b / samd_class_c_d / wellness | `decision_influence` — informs only / drives / diagnoses-treats |
| Q3 | `ai_ml` — none / static / adaptive | `users` — HCPs / patients / both / admin |
| Q4 | `data_sensitivity` — none / deidentified / identifiable | `scale` — under 10k / 10k–1L / 1L–10L / over 10L |
| Q5 | `target_market` (multi) — india / us / eu / other | `integrations` — ABDM / hospital systems / both / neither |
| Q6 | — | `data_type` (multi) — PHI / imaging / genomic / prescription / insurance |
| Q7 | — | `commercial_stage` — pre-MVP / MVP / scaling / filed |

**Key differences:**

- **Different framing.** Reviewer asks "what regulatory class do you think you are?" — applicant self-classifies. Clearpath asks "what clinical context?" — engine derives the class.
- **No direct overlap on AI/ML or data sensitivity.** Clearpath captures these implicitly via `decision_influence` (proxy for AI/ML severity) and `data_type` (proxy for data sensitivity), but the reviewer asks them directly.
- **Clearpath captures scale + commercial stage.** Reviewer doesn't. These feed clearpath's TRL scoring and DPDP-SDF threshold logic.
- **Reviewer captures target market.** Clearpath doesn't (yet).

**Implication for Story 2.5:** Story 2.5 needs answers to several wizard outputs the current 7-Q wizard doesn't capture (e.g. self-asserted device class, AI/ML mode for ACP generation, ISO 13485 status). Two paths:

- **(A) Augment clearpath wizard** with ~3 reviewer-style Qs as a second pass (post Risk Card, pre Draft Pack generation). Clean separation: free 7-Q Risk Card stays unchanged; paid Draft Pack adds regulatory specificity.
- **(B) Derive everything from existing 7 Qs + AI extraction.** Less applicant friction, but quality drops for fields the wizard never asks about.

Recommendation: **A.** The Tier 2 customer is paying — they expect to fill out more. Friction is acceptable in exchange for accuracy. (Open question 2 below — needs founder call.)

---

## d. Schema mapping between repos

| Reviewer table/field | Clearpath equivalent | Notes |
|---|---|---|
| `applications` (single) | `assessments` + `orders` (split) | Keep clearpath's split. Single-table model in reviewer is hackathon-grade. |
| `applications.applicant_email` | `assessments.email` | Direct map. |
| `applications.product_name` | derived from `assessments.one_liner` | Different shape. |
| `applications.application_category` | `assessments.readiness_card.classification.cdsco_class` | Different storage. |
| `applications.user_submitted_predicates` (jsonb) | `draft_pack_predicates` (Story 2.3) where `submitted_by_applicant=true` | Direct map after schema change. |
| `applications.selected_predicate_ids` (uuid[]) | `draft_pack_predicates.is_primary` (bool) + `draft_pack_predicates` rows where `submitted_by_applicant=false` | Different relational model. |
| `applications.metadata.wizard_state` (jsonb) | `assessments.wizard_answers` (jsonb) | Direct map. |
| `applications.metadata.ai_extracted` (jsonb) | **NOT YET** — needs new column or new table for Story 2.5 | Open question 3. |
| `applications.metadata.draft_pack` (jsonb of saved markdown per template) | `draft_pack_sections.content` (per section, text) | Different granularity (template vs section). |
| `applications.metadata.draft_pack_forms` (jsonb of MD-7/MD-3 form data) | N/A — clearpath section model doesn't represent forms separately | Form-fill happens inside the relevant section's content. |
| `documents` (separate table, versioned, anonymized) | `assessments.uploaded_docs` (jsonb) | Different model. Story 2.5 does not need versioning. |
| `predicates` (global, vector) | **NOT YET** — would need a new global table | Open question 4. |
| `thread_messages` | N/A | Out of scope. |
| `access_tokens`, `sae_events`, `inspection_reports`, `sec_summaries` | N/A | Reviewer-side only. |

---

## e. List of files / logic to port for Story 2.5

**Direct port (with namespace/import adjustments):**

| Source | Target | Notes |
|---|---|---|
| `lib/predicates/match.ts` (76 LOC) | `clearpath/lib/predicates/match.ts` | Drop the `match_predicates` RPC if no global predicates table; replace with LLM call (open question 4). |
| `lib/predicates/embed.ts` (30 LOC) | `clearpath/lib/predicates/embed.ts` | Only needed if porting vector pipeline. Skip if going LLM-only. |
| `lib/predicates/selected.ts` (107 LOC) | `clearpath/lib/predicates/selected.ts` | Selection state helpers — generic, ports cleanly. |
| `components/predicates/PredicateSuggestions.tsx` (129 LOC) | `clearpath/components/draft-pack/PredicateSuggestions.tsx` | UI component. Strip reviewer-specific wiring. |
| `components/predicates/SelectedPredicateList.tsx` (56 LOC) | same | Direct port. |
| `components/applicant/PredicatesPanel.tsx` (253 LOC) | `clearpath/components/draft-pack/PredicatePicker.tsx` | Adapt to clearpath route shape (`/draft-pack/{id}/predicates` or inline within Section 4). |

**Reference port (study, then write fresh against `draft_pack_sections`):**

| Source | Why study it |
|---|---|
| `components/draft-pack/EditableDraft.tsx` (309 LOC) | Strong reference for save-on-blur + AI-assist editor pattern. Don't lift wholesale — clearpath's section UI per investor deck mockup p.3 has different chrome (citation right-panel, "Last regenerated" timestamp, completion %). |
| `lib/draft-pack/template-fill.ts` (187 LOC) | The `{{namespace.field}}` resolver + `[TBD]` fallback pattern is a winner. Use it for field-level fill *within* a section's AI-generated content (e.g. company name, model number, intended use string). |
| `lib/draft-pack/templates/*.md` (7 files) | Use as **source material for AI section prompts** — MD-7's tabular fields are largely the contents of multiple MDR sections. Don't ship the templates as section content; feed them to the synthesizer prompt as structural hints. |

**Concept port (no code, just patterns):**

- `[TBD]` visible placeholder pattern → use everywhere a field can't be auto-filled
- "Save & continue" flow with router transition → use for section-to-section navigation
- Per-class checklist driving downstream visibility → use to drive which of the 12 sections are required vs optional per CDSCO class
- AI extraction from pitch deck (`lib/intake/pitch-extractor.ts`) → optional Sprint 2.5 enhancement, not required for V1

---

## f. What should NOT be ported

- **`app/reviewer/`** — entire reviewer console. Out of scope.
- **`app/inspection/`, `app/sae/`, `app/sec/`** — reviewer-side personas. Out of scope.
- **`lib/anonymization/`, `lib/sae/`, `lib/sec/`, `lib/thread/`, `lib/applications/`, `lib/inspection/`, `lib/reviewer/`, `lib/duplicate-detection/`, `lib/summarize/`** — all reviewer-side or back-office.
- **`middleware.ts` (HTTP Basic auth)** — clearpath uses Supabase Auth (Story 2.2), don't port the Basic Auth pattern.
- **`supabase/migration-001..007`** — clearpath schema is not a superset; do not lift wholesale. Only the `predicates` table pattern (with vector embedding column) is potentially worth a targeted port.
- **`applications` single-table model** — clearpath's `assessments` + `orders` split is intentional and should stay.
- **`documents` table with versioning + anonymization** — clearpath stores uploaded docs as JSONB on `assessments.uploaded_docs` and that's sufficient for Tier 2 V1.
- **MD-3 / MD-7 form components as the primary draft-pack surface** — they're a SUBSET artifact (Section 1 + 2 of the dossier ≈ MD-7 form). Don't make them the model.
- **`thread_messages`, reviewer query banner** — applicant ↔ reviewer messaging is a Tier 2 (concierge) feature for Sprint 3, not Tier 1 V1.
- **`access_tokens`** — no-login persona URLs solve a problem clearpath doesn't have.
- **The XGBoost SAE classifier (`services/sae-classifier`)** — already ruled out per `docs/decisions/2026-05-06-llm-classification-architecture.md`.

---

## g. Open questions for Story 2.5 implementation

1. **Section taxonomy.** Sprint 2 plan lists 9 of 12 sections explicitly: Device Description, Intended Use, Classification Justification, Predicate Comparison, Risk Management, Clinical Evidence, Software Lifecycle, Cybersecurity Plan, Labeling. **Need the canonical 3 remaining** to lock the `section_key` enum at synthesis time. Candidates from CDSCO MDR Schedule II: Quality System (ISO 13485), Manufacturing & Site Information, Post-Market Surveillance. Founder confirmation needed.

2. **Wizard augmentation.** Recommend Path A from §c (add ~3 regulatory Qs as a second-pass wizard between Risk Card and Draft Pack generation). Founder go/no-go before Story 2.5 starts. If yes, which Qs (suggested: self-asserted device class, AI/ML mode, ISO 13485 status)?

3. **AI extraction pipeline.** Reviewer has a pitch-deck → JSON extractor (`lib/intake/pitch-extractor.ts`) that fills 30+ fields and is a major UX win. Port it for V1, or defer to Sprint 3? Effort: ~1 day if ported. Without it, the `[TBD]` count in generated sections will be high.

4. **Predicate matching strategy.** Two viable approaches:
   - **(i) LLM-driven** — synthesizer suggests 3–5 predicate matches from its training data + intended use. Cost: ~$0.02/call. Quality: unknown until tested.
   - **(ii) Vector DB port** — port the reviewer's global `predicates` table + pgvector + `match_predicates` RPC + Modal embedding endpoint. Cost: ongoing Modal infra + initial seed of CDSCO + FDA 510(k) corpus. Quality: deterministic, citable.
   
   (ii) is the deck-aligned answer (citations need exact references). (i) is the V1 ship-it answer. Founder call.

5. **Citation source.** Sectioned view shows `[1] [2]` inline with right-panel citation cards (source quote, document reference, exact citation ID). Where do the citations come from?
   - From the engine's existing `lib/engine/synthesizer-system-prompt.ts` output (already cites in Risk Card)?
   - From a new regulatory-source corpus (CDSCO docs, Schedule II, IMDRF guidance)?
   - From the AI-extracted pitch deck (citing the applicant's own claims)?
   
   Schema (Story 2.3 `draft_pack_citations`) supports any of these — the open question is which to wire up first.

6. **PDF export.** Current `lib/engine/draft-pack-generator.ts` produces a single PDF from `tier2_draft_packs.draft_pack_json`. Story 2.5 sectioned view should also export PDF. Two options:
   - Concatenate `draft_pack_sections.content` in section order → render → PDF (clean, but loses formatting fidelity)
   - Keep the current generator path AND add the sectioned view as a parallel surface (more code, but no regression for existing customers paying ₹499)
   
   Recommend the second for V1 — it's the safer path with the pricing transition still pending (Sprint 3).

7. **Section regeneration UX.** Mockup shows "Last regenerated 2 min ago" timestamp. Per-section regeneration button calling the engine, or only initial-load AI generation + manual edits? Per-section regeneration adds cost (~$0.01–$0.05 per section per regen) but is a strong UX signal. Recommend per-section regeneration with a soft cap (e.g. 3 regens per section per order).

8. **Conflict with auth (Story 2.2).** Story 2.2 will add `orders.user_id` (per Story 2.3 RLS plan). Story 2.5 page routes likely include `/draft-pack/[order_id]/...` — do they require auth? Yes (post-purchase flow). Confirm Story 2.5 starts only after Story 2.2 lands the auth gate, not in parallel.

---

## Recommended sequencing for Story 2.5

Assuming the open questions resolve favorably:

1. Lock `section_key` enum (12 sections, founder confirms remaining 3) — half-day
2. Port predicate matching (LLM-driven for V1) + UI components — 1 day
3. Build sectioned view scaffolding (sidebar + content area + right-panel citations) — 1 day
4. Wire engine to generate per-section content using existing synthesizer + new section-specific prompts — 1.5 days
5. Wire save state + completion % + "Last regenerated" timestamps — half-day
6. Add wizard augmentation (3 regulatory Qs, second pass) — half-day
7. Smoke test on 5 demo cases — half-day

**Total: ~5 days.** Matches the Sprint 2 plan estimate.

---

## What this doc does NOT decide

This is reconnaissance + a recommendation. The 8 open questions above need founder calls before Story 2.5 starts. Surface them in the Sprint 2 standup or as a focused decision session.
