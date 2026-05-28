# Wizard architecture audit — gap analysis for Story 2.5

**Date:** 2026-05-12
**Status:** drafted (Sprint 2 Story 2.5 prerequisite). Founder review required before Story 2.5 starts.
**Owner:** Raunaq Pradhan
**Related:** `docs/roadmap/sprint-2-plan.md` (Story 2.5), `docs/decisions/2026-05-11-reviewer-port-strategy.md`, `lib/wizard/questions.ts`, `lib/engine/draft-pack-prompts.ts`

---

## TL;DR

Founder direction: clearpath has **one** intake flow. Questions asked once, upfront, before Risk Card. Same set serves both Risk Card and Draft Pack. This audit surfaces what's missing.

**Headline finding: the current 7-Q wizard is sufficient for the Risk Card but materially insufficient for the upgraded 12-section Draft Pack.** The current wizard captures *clinical context* (state, decision influence, users, scale, integrations, data type, commercial stage) — useful for classification + regulation evaluation. It does NOT capture the *device-specific structured fields* needed to populate Sections 1–12 of the CDSCO MDR Draft Pack (intended use specificity, indications, predicate device, manufacturing site, ISO 13485 status, AI/ML mode, cybersecurity model, post-market plan, labeling claims).

**The reviewer repo solves this with a parallel data source: pitch deck → AI extraction → 30+ pre-filled fields.** That's a strong UX pattern but it doesn't replace the wizard — it pre-fills *into* a wizard with more questions than clearpath's 7.

**Recommendation: a two-tier wizard structure** — keep the current 7-Q wizard as the "free intake tier" (powers Risk Card, ~3 minutes), and add a "Draft Pack intake tier" (8–10 additional regulatory questions, gated to Tier 2 customers, AI-prefilled from pitch deck and Risk Card outputs, ~5 more minutes). Total intake: ~8 minutes for paying customers, unchanged 3 minutes for free Risk Card users.

**Pre-flight clarification needed:** founder spec mentions "10-section list (current cdsco-reviewer-tool sidebar)". Reviewer repo has no 10-section sidebar. Customer-facing reviewer flow has 3 build steps (predicates/documents/draft-pack tabs). Reviewer back-office has variable-count CollapsibleSections + a per-class doc CHECKLIST with 10–15 items. The "12-section CDSCO MDR" target from Sprint 2 plan is the closest fit — see Section C, where I align gap analysis to that target.

---

## Section A — Current clearpath wizard inventory

### Intake (one-time, before wizard)
**Route:** `/start` → `POST /api/intake` → creates `assessments` row → redirects to `/wizard/{id}/q/1`
**Source:** `app/api/intake/route.ts`, `app/start/page.tsx`

| Field | Required | Validation | Storage |
|---|---|---|---|
| `name` | yes | min 1 char | `assessments.name` |
| `email` | yes | regex `[^\s@]+@[^\s@]+\.[^\s@]+` | `assessments.email` |
| `mobile` | no | 10 digits after `+91` strip | `assessments.mobile` |
| `one_liner` | yes | 20–300 chars, no `e.g.` placeholder | `assessments.one_liner` |
| `url` | no | `https?://.+\..+` regex | `assessments.url`, `assessments.url_fetched_content` (server-fetched body) |
| `uploaded_docs` | no | up to 3 files, ≤ 5MB each, with optional `doc_type` tag | `assessments.uploaded_docs` (jsonb) |
| `demo_packet_id` | no | matches known packet | pre-fills `wizard_answers`, sets `meta.is_demo` |

**Side effects:**
- `assessments.status` set to `draft`
- Optional URL fetch + PDF text extraction kicks off (powers Risk Card and Q2 follow-up)

### Wizard (7 questions)
**Route:** `/wizard/{id}/q/{1..7}` (one per page)
**Source:** `lib/wizard/questions.ts`, `lib/wizard/types.ts`, `components/wizard/WizardClient.tsx`
**Storage:** `assessments.wizard_answers` (jsonb, shape `{q1..q7, q2_defended}`); merged on each save

| Step | Field | Type | Required | Options | Conditional logic |
|---|---|---|---|---|---|
| Q1 | `q1` (`ClinicalState`) | radio | **yes** | critical / serious / non_serious / varies | none |
| Q2 | `q2` (`InfoSignificance`) | radio | **yes** | informs_only / drives / diagnoses_treats | **If `informs_only` and intake content (URL or PDFs) contains decision-support phrases** (`recommends`, `prompts`, `guides`, `suggests action`, `alerts`, `flags`, `escalates`, `notifies clinician`, `suggests referral`) → `Q2FollowupCard` is shown. User picks: keep informs_only (sets `q2_defended=true`) or change to `drives`. See `lib/wizard/q2-phrases.ts` + `app/api/wizard/check-q2-followup/route.ts`. |
| Q3 | `q3` (`UserType`) | radio | **yes** | hcps / patients / both / admin | none |
| Q4 | `q4` (`UserScale`) | radio | no (skippable) | under_10k / 10k_to_1l / 1l_to_10l / over_10l | none |
| Q5 | `q5` (`Integrations`) | radio | no (skippable) | abdm / hospital / both / neither | none |
| Q6 | `q6` (`DataSensitivity[]`) | checkbox (multi) | no (skippable) | phi / imaging / genomic / prescription / insurance / none | none |
| Q7 | `q7` (`CommercialStage`) | radio | no (skippable, auto-skips on Generate click if blank) | pre_mvp / mvp / scaling / filed | none |

**Skipped questions** are tracked in `meta.wizard_skipped_questions` (number[]) and finalized at `POST /api/wizard/complete`.

**Conflict-detection layer** (separate gating step before wizard):
- If pre-router detects a conflict between `one_liner` and intake content (PDF/URL) at high/medium severity, applicant is routed to `/wizard/{id}/conflict` first
- Must acknowledge before reaching `/wizard/{id}/q/1`
- Storage: `meta.conflict_detected`, `meta.conflict_details`, `meta.conflict_acknowledged`, `meta.conflict_edit_attempts`
- Source: `app/wizard/[id]/conflict/page.tsx`, `app/api/wizard/ack-conflict/route.ts`

### Data flow into the engine (Risk Card synthesizer)
**Source:** `lib/engine/run-synthesis.ts`, `lib/engine/synthesizer-system-prompt.ts`

The synthesizer reads from `assessments`:
- `id, email, one_liner, url, url_fetched_content, uploaded_docs, product_type, wizard_answers, meta, status, share_token, readiness_card`

Output (Readiness Card JSON, persisted to `assessments.readiness_card`):
- meta, classification (8 fields), readiness (score + 5 dimensions + band + note), risk, timeline, regulations (9 verdicts), top_gaps[], verdict, why_regulated, post_2025_samd_gap, tier0_card_tagline, tier1_teaser, tier2_teaser

### Data flow into the Draft Pack (Tier 2)
**Source:** `lib/engine/draft-pack-prompts.ts`, `lib/engine/draft-pack-generator.ts`

Draft Pack synthesizer (separate Sonnet 4.6 call) receives:
- `product_name, one_liner, url_content, wizard_answers, readiness_card`

Output schema (current ₹499 PDF — `DraftPackContentSchema`):

| Section | Sub-fields |
|---|---|
| `executive_summary` | body, product_class, pathway, headline_gaps[] |
| `intended_use` | indication, intended_user, use_environment, contraindications |
| `device_description` | components_architecture, principle_of_operation, materials_standards, variants_accessories, lifecycle_disposal |
| `risk_classification` | imdrf_significance, imdrf_situation, imdrf_category, imdrf_rationale, cdsco_class, cdsco_rationale |
| `clinical_context` | clinical_need, **predicate_devices (free text)**, evidence_plan |
| `algorithm_change_protocol` | applicable, pccp, change_protocol, real_world_monitoring (only when AI/ML) |

**Key observation:** the current Draft Pack already has 6 sections (not 1) and its sub-fields cover ~60% of what the 12-section upgrade target needs — but it's all generated from the same 7-Q wizard + intake fields. The LLM compensates for missing structured input by inferring from `one_liner` + `url_fetched_content` + uploaded PDFs. Quality is therefore bounded by what the LLM can infer.

---

## Section B — cdsco-reviewer-tool wizard comparison

### Reviewer intake (one-time, before wizard)
**Route:** `/apply` → `POST /api/applications/intake` → redirects to `/apply/{id}/wizard`
**Source:** `app/apply/page.tsx`

| Field | Required | Notes |
|---|---|---|
| `applicant_name` | yes | |
| `applicant_email` | yes | |
| `applicant_mobile` | no | |
| `product_name` | yes | separate from product description |
| `product_description` | yes | min 10 chars |
| `pitch_deck` | no | **PDF/PPTX/TXT — triggers AI extraction (Opus, ~$0.05/call) that pre-fills 30+ fields** |

**Important:** the optional pitch deck is the difference. When uploaded, `lib/intake/ai-extract.ts` extracts:

- `device_name`, `intended_use_one_liner`, `suggested_classification` (A/B/C/D/unknown)
- `suggested_wizard_answers` for all 5 wizard Qs
- `company` (legal_name, constitution, CIN, registered_address, manufacturing_address, founded_year, team_size)
- `product_meta` (model_number, sterile, patient_population, user_population, setting_of_use)
- `confidence` (high/medium/low) + `notes`

These pre-fill the wizard AND populate downstream draft-pack `[TBD]` fields.

### Reviewer wizard (5 questions)
**Route:** `/apply/{id}/wizard` (single page, save-on-blur)
**Source:** `lib/applicant/wizard-questions.ts`, `components/applicant/WizardForm.tsx`

| ID | Type | Required | Options |
|---|---|---|---|
| `intended_use` | text (free) | yes | placeholder example: "Continuous monitoring of glucose levels in adults with diabetes via a wearable subcutaneous patch." |
| `device_class` | radio | yes | class_a_b / class_c_d / samd_class_a_b / samd_class_c_d / wellness |
| `ai_ml` | radio | yes | none / static / adaptive |
| `data_sensitivity` | radio | yes | none / deidentified / identifiable |
| `target_market` | multi | no | india / us / eu / other |

**No conditional logic, no skippable questions, no follow-up cards.**

### Reviewer build flow (post-wizard, before submit)
**Routes:** `/apply/{id}/build/{predicates|documents|draft-pack|preview}`

This is where the reviewer captures additional structured data the wizard doesn't:

- **Step 1 — Predicates** (`build/predicates`): pgvector-matched suggestions from a global `predicates` table (CDSCO + FDA 510(k)) + applicant can add manual predicates with rationale. Saved to `applications.selected_predicate_ids` + `applications.user_submitted_predicates`.
- **Step 2 — Documents** (`build/documents`): per-class checklist (10–15 doc types from `lib/upload/checklist.ts`), upload + tag with `doc_type`. Powers completeness %.
- **Step 3 — Draft Pack** (`build/draft-pack`): per-class form fills for MD-7 / MD-3 / DMF / RMF / IFU / IU / ACP, with `[TBD]` placeholders for fields not auto-filled. Saved to `applications.metadata.draft_pack_forms`.

### Comparison summary

| Capability | Clearpath | Reviewer |
|---|---|---|
| **Intake fields** | 7 (incl. file upload + URL) | 5 + pitch deck |
| **Pitch-deck AI extraction** | ❌ none | ✅ extracts 30+ fields |
| **Wizard questions** | 7 (clinical-context-forward) | 5 (regulatory-forward) |
| **Self-asserted device class** | ❌ engine derives | ✅ Q2 in wizard |
| **Direct AI/ML question** | ❌ inferred from Q2 | ✅ Q3 in wizard |
| **Direct data-sensitivity question** | partial — Q6 captures *types* (PHI/imaging/etc.) but not identifiability tier | ✅ Q4 (none/deidentified/identifiable) |
| **Target market question** | ❌ none | ✅ Q5 (multi) |
| **Predicate device capture** | ❌ none — Draft Pack synthesizer infers from `one_liner` only | ✅ Step 1 of build flow with vector-matched suggestions |
| **Document tagging by type** | partial — `uploaded_docs[].doc_type` exists but UX doesn't surface it | ✅ per-checklist-item upload with `doc_type` |
| **Per-class document checklist** | ❌ none in customer flow | ✅ `lib/upload/checklist.ts` drives docs + draft-pack tabs |
| **Conditional question logic** | ✅ Q2 follow-up | ❌ none |
| **Conflict-detection between sources** | ✅ one_liner ↔ PDF/URL conflict gate | ❌ none |
| **Optional/skippable questions** | ✅ Q4–Q7 | ❌ all required |
| **Question routing** | one Q per page | single page, all Qs at once |
| **Save state persistence** | per-question save + skipped[] tracking | save-on-blur whole-form |

**Predicate matching question (founder confirmed gap):**
- Reviewer: solved with `findPredicates(intended_use, limit)` → pgvector RPC against global predicates table → applicant picks from suggestions + adds manual ones with `rationale`
- Clearpath: NOT captured — current Draft Pack's `clinical_context.predicate_devices` is a free-text LLM output with no applicant input

---

## Section C — Section-by-section data coverage analysis

**Note on the "10-section list" reference:** the founder spec references "10-section list (current cdsco-reviewer-tool sidebar)" via `2026-05-11-reviewer-port-strategy.md`. The reviewer repo does NOT have a 10-section sidebar. The closest analogues:
- Reviewer's customer-facing build flow: 3 steps (predicates / documents / draft-pack)
- Reviewer's draft-pack tabs: variable per class (3–7 templates from `lib/upload/checklist.ts`)
- Reviewer's master CHECKLIST: 10–15 doc types per class
- Reviewer-side back-office: variable-count `CollapsibleSection`s

I've aligned this gap analysis to the **12-section CDSCO MDR target from Sprint 2 plan + Story 2.4 port-strategy doc** (9 explicit + 3 candidates). Founder should confirm the canonical section list before Story 2.5 starts.

### Coverage matrix

For each target section: data needed → current sources → coverage verdict → gap-fill question(s).

| # | Section | Data needed | Current source | Coverage | Gap-fill question(s) |
|---|---|---|---|---|---|
| 1 | **Device Description** | components/architecture, principle of operation, materials/standards, variants, lifecycle/disposal | `one_liner`, `url_fetched_content`, `uploaded_docs`, LLM inference | **Partial** — LLM infers from intake; ~50% `[TBD]` rate likely | Add: device form factor (hardware/software/hybrid), key components list, materials of construction (for hardware) |
| 2 | **Intended Use** | indication, intended_user, use_environment, contraindications | `one_liner`, Q3 (users), LLM inference | **Partial** — `intended_user` covered via Q3, but indication/environment/contraindications inferred | Add: intended use statement (free text, 2–4 sentences, à la reviewer's `intended_use`), use environment (home/OPD/inpatient/surgical/pre-hospital), contraindications |
| 3 | **Classification Justification** | imdrf_significance, imdrf_situation, imdrf_category, cdsco_class | Q1 (clinical state), Q2 (decision influence), `one_liner`, LLM | **Strong** — already populated via Risk Card synthesizer | (none) |
| 4 | **Predicate Comparison** | 1–3 predicate devices with manufacturer + rationale | LLM inference only | **Weak** — no applicant input, no vector match | Add: predicate picker (LLM suggestions + manual entry, mirroring reviewer's `PredicatesPanel`) |
| 5 | **Risk Management** | risk identification, risk evaluation, mitigations, residual risk (ISO 14971 framework) | `risk.rationale` from Risk Card, LLM inference | **Weak** — no structured risk capture | Add: top 3 known risks (free text), known mitigations in place (free text). Optional: link to uploaded RMF doc if present |
| 6 | **Clinical Evidence** | clinical_need, evidence_plan, existing trials/studies | LLM inference, optional uploaded clinical docs | **Partial** — depends on uploaded documents | Add: clinical evidence status (none / pilot data / published study / multi-center trial), study summary (free text if applicable) |
| 7 | **Software Lifecycle** | SDLC model, version control approach, release cadence (IEC 62304) | none in current wizard | **Weak** — only relevant if SaMD; needs new question | Add: software lifecycle model (waterfall / agile / hybrid / not_applicable_hardware_only). Conditional: only show if `device_class` is SaMD or AI/ML. |
| 8 | **Cybersecurity Plan** | data flow, threat model, encryption posture, vulnerability disclosure (FDA cyber guidance + IT-Act 2000) | partial — Q5 (integrations), Q6 (data types) | **Partial** — Q5 + Q6 give signal but no concrete cyber posture | Add: data-at-rest encryption (yes/no/partial), data-in-transit encryption (yes/no/partial), authentication model (none / local / federated / SSO). Conditional: only show if Q6 includes any data type other than `none`. |
| 9 | **Labeling** | indications for use, instructions for use, warnings, manufacturer details | none in current wizard | **Weak** — labeling depends on company info that's not captured | Add: company legal name, registered address, manufacturer-of-record (self / contract). The reviewer's `company` extraction is the right model — port that field set via pitch-deck AI extraction. |
| 10 | **Quality System** (candidate) | ISO 13485 status, certificate number, QMS maturity | none in current wizard | **Weak** | Add: ISO 13485 status (certified / in-progress / not started / not applicable), certificate number + valid-until date (conditional on certified) |
| 11 | **Manufacturing & Site Information** (candidate) | site type, manufacturing address, site role (own / contract) | none | **Weak** | Add: manufacturing site type (own / contract / virtual / N/A — software only), manufacturing address (text), facility certifications held |
| 12 | **Post-Market Surveillance** (candidate) | adverse event handling, recall plan, complaint handling | none | **Weak** | Add: post-market surveillance model (formal SOP / informal / not yet defined / not applicable — pre-launch) |

### Sections at high `[TBD]` risk without intervention

If Story 2.5 ships against the current 7-Q wizard with no augmentation: **Sections 1, 2, 4, 5, 7, 8, 9, 10, 11, 12** would all generate with material `[TBD]` density. The Tier 2 customer pays for completed regulatory drafts; high `[TBD]` density is a quality regression vs. the current ₹499 Draft Pack which already covers 6 sections cleanly (because LLM is allowed to infer freely without surfacing missing fields).

### Gap-fill question count

To bring all 12 sections to acceptable coverage with applicant-supplied structured data:

- **8 new core questions** (intended use statement, use environment, contraindications, predicate picker, top risks + mitigations, clinical evidence status, ISO 13485 status, manufacturing site type)
- **3 conditional questions** (software lifecycle model, encryption posture, authentication model)
- **Plus pitch-deck AI extraction** (company info, product meta, model number) to cover Section 9 (Labeling) without adding more questions

---

## Section D — Recommended canonical question set for clearpath

### Architecture: two-tier wizard

**Tier A — Free Risk Card intake** (current 7 Qs, unchanged):
- Powers Risk Card. Free. ~3 minutes.
- No friction added for the lead-gen funnel.

**Tier B — Draft Pack intake** (new, gated to Tier 2 paying customers):
- Powers upgraded Draft Pack. Paid. ~5 additional minutes.
- AI-prefilled from pitch deck (if uploaded) AND from Tier A answers + Risk Card output.
- Applicant reviews + edits prefilled answers (à la reviewer's pattern).

**Why two tiers and not one merged tier:**
1. Adding 8–10 Qs to the free Risk Card wizard breaks the `<3 minute lead-gen` promise — drops conversion at the top of funnel.
2. Tier 2 customers have already paid; they expect to fill more.
3. Tier B can be AI-pre-filled aggressively because intake context is richer post-Risk-Card (the LLM already has `one_liner` + URL + PDFs + 7-Q answers + readiness_card).
4. Operationally: Tier A is a one-time "yes/no, am I regulated?" decision; Tier B is "give me draft submission docs". Different intent → different question set is honest UX.

### Tier B — proposed question set (10 Qs)

**Section coverage targets in `[brackets]`. All required unless noted.**

| # | Field | Type | Pre-fill source | Section coverage |
|---|---|---|---|---|
| B1 | `intended_use_statement` (2–4 sentences) | textarea | Pitch deck OR Tier A `one_liner` | [Sec 2] |
| B2 | `use_environment` | radio | Pitch deck `product_meta.setting_of_use` | home / OPD / inpatient / surgical / pre-hospital / mixed → [Sec 2] |
| B3 | `contraindications` (free text, optional) | textarea | Pitch deck | [Sec 2] |
| B4 | `predicate_devices` | picker | LLM suggestions from one_liner (Story 2.5 chooses LLM-driven vs vector port) | array of {device_name, manufacturer?, rationale} → [Sec 4] |
| B5 | `top_3_risks_and_mitigations` (paired free text, ≤300 chars each) | structured | LLM-suggested from Risk Card `top_gaps`, applicant edits | [Sec 5] |
| B6 | `clinical_evidence_status` | radio | Document classifier (if uploaded) | none / pilot data / published study / multi-center trial → [Sec 6] |
| B7 | `iso_13485_status` | radio | Pitch deck `company` | certified / in-progress / not started / not applicable → [Sec 10] |
| B8 | `manufacturing_site` | structured | Pitch deck `company.manufacturing_address` | {site_type, address} → [Sec 11] |
| B9 | `software_lifecycle_model` (conditional — show only if device is SaMD or has AI/ML) | radio | none | waterfall / agile / hybrid / not applicable → [Sec 7] |
| B10 | `cybersecurity_posture` (conditional — show only if Q6 has any data type ≠ `none`) | structured | none | {data_at_rest_encryption, data_in_transit_encryption, authentication_model} → [Sec 8] |

**Plus pitch-deck AI extraction** (port from reviewer):
- Company info (legal name, constitution, CIN, registered address, founded year, team size) → [Sec 9 Labeling]
- Product meta (model number, sterile, patient population, user population, setting of use) → fills B2 default + [Sec 1]
- This requires no applicant question — runs server-side on pitch deck upload at intake time.

### Final wizard answer shape (for `assessments.wizard_answers`)

```ts
type WizardAnswers = {
  // Tier A — current (unchanged)
  q1?: ClinicalState;
  q2?: InfoSignificance;
  q2_defended?: boolean;
  q3?: UserType;
  q4?: UserScale;
  q5?: Integrations;
  q6?: DataSensitivity[];
  q7?: CommercialStage;

  // Tier B — new (Story 2.5)
  b1_intended_use_statement?: string;
  b2_use_environment?: "home" | "opd" | "inpatient" | "surgical" | "pre_hospital" | "mixed";
  b3_contraindications?: string;
  b4_predicate_devices?: Array<{ device_name: string; manufacturer?: string; rationale?: string }>;
  b5_risks_and_mitigations?: Array<{ risk: string; mitigation: string }>;
  b6_clinical_evidence_status?: "none" | "pilot_data" | "published_study" | "multi_center_trial";
  b7_iso_13485_status?: "certified" | "in_progress" | "not_started" | "not_applicable";
  b8_manufacturing_site?: { site_type: "own" | "contract" | "virtual" | "na_software_only"; address?: string };
  b9_software_lifecycle_model?: "waterfall" | "agile" | "hybrid" | "not_applicable";
  b10_cybersecurity_posture?: {
    data_at_rest_encryption: "yes" | "no" | "partial";
    data_in_transit_encryption: "yes" | "no" | "partial";
    authentication_model: "none" | "local" | "federated" | "sso";
  };
};
```

**Plus a new `assessments.ai_extracted` jsonb column** (Story 2.3 schema does not yet have this — would need a migration in Story 2.5):

```ts
type AiExtracted = {
  company?: { legal_name?: string; constitution?: string; cin?: string; ... };
  product_meta?: { model_number?: string; sterile?: string; ... };
  confidence: "high" | "medium" | "low";
  notes?: string;
  cost_usd: number;
  extracted_at: string;
};
```

### Conditional logic to enforce

- **B9 shown only if** `q2 === "diagnoses_treats"` OR pitch-deck extraction sets device_class to SaMD-flavored
- **B10 shown only if** `q6` includes any value other than `none`
- **B3 contraindications** is the only optional Tier B question (rest are required for paying customers)
- **B5 mitigation field** allowed empty per row (some risks may not have mitigations yet)

### UX placement

Two viable shapes:

- **Shape 1: Inline in upgrade flow.** After Risk Card → click "Generate Draft Pack" → Tier B wizard (10 Qs, single page or paginated) → payment → generation. Friction is upfront, payment is at the end (post-investment of effort).
- **Shape 2: Post-payment.** After Risk Card → click "Generate Draft Pack" → payment → Tier B wizard → generation. Customer commits before filling the long form.

Shape 1 has higher abandonment but better-quality Draft Packs because applicant has already invested. Shape 2 has lower abandonment but more `[TBD]` density because applicants who paid feel the work is done.

**Recommend Shape 1.** Tier 2 is high-intent ("I want a draft pack") and the questions are short. The payment commitment matters less than the data completeness for the product to be valuable.

---

## Section E — Open questions for founder decision

1. **Section taxonomy lock.** The Sprint 2 plan and Story 2.4 port-strategy doc reference 9 + 3 candidate sections (12 total). Founder spec references "10-section list" without naming source. Confirm the canonical 12-section list before Story 2.5 starts. My candidates for the 3 unnamed: Quality System (ISO 13485), Manufacturing & Site, Post-Market Surveillance. Approve or revise.

2. **Two-tier wizard structure (recommended).** Approve adding Tier B as a paid-only second wizard, OR direct alternative (e.g., merge into one larger wizard for everyone, or reduce Tier B scope).

3. **Tier B question count.** 10 Qs proposed (8 core + 2 conditional). Reduce to N if friction concern; expand if any of Sections 5/7/8 deserve more granularity.

4. **Pitch-deck AI extraction port.** Strongly recommended for Story 2.5 — it's the difference between "every section has [TBD] for company name" and "draft is ready to read on first generation". Effort: ~1 day to port `lib/intake/ai-extract.ts` + add `assessments.ai_extracted` column. Approve or defer to Sprint 3.

5. **Predicate matching strategy** (carryover from Story 2.4 port doc, Q4): LLM-driven (cheap, V1) or vector DB port (deck-aligned, ongoing infra). B4 question shape works for either; the difference is what populates the `Suggestions` list.

6. **UX placement (Shape 1 vs Shape 2).** Tier B before payment (recommended) or after payment.

7. **Risk Card wizard changes.** I recommend NO changes to Tier A. But consider: should Q6 (data sensitivity) split `phi` into `identifiable_phi` vs `deidentified_phi` to better feed Section 8? Small change, useful signal. Founder call.

8. **Demo packets.** Current `assessments.wizard_answers` prefill in demo packets only covers q1–q7. For Story 2.5 to demo well, demo packets need to also pre-fill b1–b10. Workplan: extend `lib/demo-packets/*` with the new fields. Effort: ~half day.

9. **Wizard rebuild cost.** The current 7-Q wizard is 555 LOC of `WizardClient.tsx` plus supporting components. Tier B adds ~10 more Qs with conditional logic + structured inputs. Estimate: 1.5 days to extend cleanly without forking the wizard component. Confirm budget allocation in Story 2.5 plan (currently 4–5 days; this would push to 6–7 days unless pitch-deck extraction port absorbs some of the data-completeness work).

10. **Conflict detection for Tier B inputs.** Today we detect conflict between `one_liner` and PDF/URL content. Should we also detect conflict between Tier A answers and Tier B answers? E.g., Tier A `q2 = "informs_only"` but Tier B `b1_intended_use_statement` describes a diagnostic system. Likely a Sprint 3 follow-up; flag here so it doesn't get lost.

---

## What this doc does NOT decide

This is an audit + recommendation. The 10 questions in Section E need founder calls before Story 2.5 starts. Schedule a focused 30-min review session covering Q1 + Q2 + Q4 + Q5 + Q6 (the hard blockers); the rest can resolve mid-sprint without blocking Story 2.5 kickoff.
