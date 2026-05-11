# ClearPath Draft Pack Document Matrix

**Sprint 2 Story 2.5 Phase 4a deliverable.**

**Purpose:** programmatically-actionable spec consumed by the Phase 4b
v2 generator (`lib/engine/draft-pack-v2-generator.ts`) and the Phase 4c
validator (`scripts/validate-draft-pack-coverage.ts`). The bible
(`docs/specs/cdsco-regulatory-forms-reference.md`) is the regulatory
reference; this matrix is the engineering spec derived from it.

**Scope:** MD-7 / MD-3 manufacturing license path only (Sprint 2 lock
per `docs/roadmap/sprint-2-plan.md`). IVD path (MD-24/25), clinical
investigation path (MD-22/23), and pharma path are explicitly OUT OF
SCOPE for Sprint 2 and tracked separately in the bible §27 expansion
roadmap.

**Canonical 12 sections:** the structure below maps to CDSCO MD-7
checklist §8 (Device Master File, Appendix II of Fourth Schedule
MDR-2017) — the bible enumerates 20 DMF sub-sections (§8.1–§8.20),
but the upgraded Draft Pack consolidates them into 12 customer-facing
sections per the Sprint 2 plan. The conditional sub-sections (§8.11
biocompatibility, §8.12 medicinal substances, §8.13 biological safety,
§8.14 sterilisation, §8.15 software V&V, §8.16 animal studies, §8.17
stability) are absorbed as **conditional content rules** inside the
relevant top-level section (see each section's part C).

---

## How to read this matrix

Each of the 12 sections below has four blocks:

- **A. Section meta** — number, name, source authority, target word
  count, required vs conditional flag.
- **B. Sub-content requirements** — table of fields with their
  `Source within clearpath`, which uses one of the following
  vocabularies (single source of truth for the Phase 4b generator):

| Source token | Meaning |
|---|---|
| `intake.*` | Fields captured at `POST /api/intake` (name, email, mobile, one_liner, url, uploaded_docs). |
| `wizard.q1`–`q7` | Tier A Risk Card wizard answers (free tier). |
| `wizard.b1`–`b6`, `c1`–`c2` | Tier B Draft Pack wizard answers (paid tier). |
| `ai_extracted.fields.*` | Pitch-deck or one-liner AI extraction output (`lib/intake/ai-extract.ts`). |
| `readiness_card.*` | Risk Card synthesizer output (`lib/engine/synthesizer.ts`). |
| `derived(...)` | Computed deterministically from other fields. The arguments cite the inputs. |
| `llm_synthesized(...)` | Requires an Opus call. The arguments cite the inputs the synthesis prompt sees. |
| `gap` | Data not captured by clearpath today. Cross-references the bible §26-27 roadmap; Phase 4b uses `[TBD]` placeholder or low-confidence LLM-fill. |

- **C. Conditional content rules** — `if {device characteristic}
  then {content variant}`. Mostly drawn from bible §33 (form +
  document trigger matrices) and §4.4 (class-specific variations).
- **D. Validation criteria** — what the Phase 4c validator (and the
  Phase 4b regen UX) checks before a section can be marked
  `completion_status: 'complete'`. Three layers: field-level (per
  field), section-level (per section), document-level (cross-section
  in the final "Cross-section validation rules" block).

---

# Section 1 — Executive Summary

## A. Section meta

| | |
|---|---|
| **Section number** | 1 |
| **Maps to DMF** | §8.1 Executive Summary |
| **Source authority** | MD-7 checklist Appendix A, line §8.1; bible §4.B Block 4 |
| **Target word count** | 250–350 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | `llm_synthesized` consolidating §2–§12 outputs after they generate |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `body` | text (250–350 words) | `llm_synthesized(intake.one_liner, wizard.q1, wizard.q2, wizard.b1_intended_use_statement, readiness_card.classification, readiness_card.recommended_path, readiness_card.top_gaps)` | Synthesizer composes after §2–§12 generate (last to render so it reflects final content). |
| `product_class` | string (e.g., "Class C SaMD", "Class B medical device") | `derived(readiness_card.classification.cdsco_class, readiness_card.classification.class_qualifier)` | Plain formatter — no LLM. |
| `pathway` | string | `derived(readiness_card.classification.cdsco_class, readiness_card.recommended_path)` | Maps `{cdsco_class, recommended_path} → "MD-7 → MD-9 (Central Licensing Authority)"` etc. per bible §33.1. |
| `headline_gaps` | array of 3 strings | `derived(readiness_card.top_gaps)` | Take `top_gaps[0..2].gap_title` softened to action items. |
| `intended_use_statement` | string (1–2 sentences) | `wizard.b1_intended_use_statement` (preferred) → `ai_extracted.fields.intended_use_one_liner` → `intake.one_liner` | Direct copy from highest-priority source. |
| `company_name` | string | `ai_extracted.fields.company.legal_name` → `intake.name` (with caveat) | Plain formatter; `[TBD]` if both null. |
| `recommended_path_note` | string \| null | `derived(readiness_card.recommended_path)` | Non-null only when `recommended_path === "clinical_investigation"` — surfaces the MD-22 advisory journey note per `docs/decisions/2026-05-12-wizard-architecture-audit.md`. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `readiness_card.recommended_path === "clinical_investigation"` | Add `recommended_path_note` paragraph: *"Per the Risk Card analysis, this device may need MD-22 clinical investigation approval before manufacturing license. The Reviewer Concierge tier can guide the dual-pathway sequencing."* |
| `readiness_card.classification.medical_device_status === "wellness_carve_out"` | Replace section body with carve-out justification (rare for Draft Pack purchasers; surface a warning). |
| `wizard.b3_no_predicate === true` | Add inline note: *"No predicate device claimed. Section 6 (Predicate Comparison) details the MD-26/MD-27 permission path required before MD-7."* |
| `readiness_card.classification.ai_ml_flag === true && classification.cdsco_class IN ['C','D']` | Add ACP-pathway note: *"Algorithm Change Protocol (ACP) per Oct 2025 CDSCO SaMD draft to be filed alongside MD-7."* |

## D. Validation criteria

- **Field-level**
  - `body.length` between 1500 and 2500 chars (rough 250–350 word band)
  - `product_class` non-empty and matches `^(Class [A-D])( SaMD)?( IVD)?$` format
  - `pathway` non-empty and matches one of: `MD-3 → MD-5 (State Licensing Authority)` / `MD-7 → MD-9 (Central Licensing Authority)` / `MD-7 → MD-9 with MD-26/MD-27 pre-permission` / `MD-14 → MD-15 (import)` — extend per bible §33.1 as new paths land
  - `headline_gaps.length === 3` exactly
- **Section-level**
  - `body` text references `product_class` value verbatim at least once
  - `body` text references the pathway form (e.g., "MD-7") at least once
  - No banned-certainty phrases per `lib/engine/soften-certainty.ts` (must/always/definitely/etc.)
- **Cross-section** (enforced in document-level validator)
  - `product_class` matches `Section 4.classification_summary.cdsco_class`
  - `pathway` matches the form path implied by `Section 4` + `Section 6.has_predicate`

---

# Section 2 — Device Description

## A. Section meta

| | |
|---|---|
| **Section number** | 2 |
| **Maps to DMF** | §8.2 Descriptive information of the device |
| **Source authority** | MD-7 checklist Appendix A §8.2; bible §4.B Block 4 |
| **Target word count** | 350–550 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | `llm_synthesized` from pitch-deck extraction + intake + wizard signals |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `components_architecture` | text (60–180 words) | `llm_synthesized(intake.one_liner, ai_extracted.fields.product_meta, intake.url_fetched_content)` | Opus call describing physical/logical components, interfaces, modules. |
| `principle_of_operation` | text (60–180 words) | `llm_synthesized(intake.one_liner, ai_extracted.fields.suggested_wizard_answers.intended_use, intake.url_fetched_content)` | Opus call. Must avoid banned certainty phrases. |
| `materials_standards` | text (60–180 words) | `llm_synthesized(ai_extracted.fields.product_meta, gap(patient_contact_type))` | If software-only, output "Not applicable — software-only product. No physical materials." |
| `variants_accessories` | text (60–180 words) | `ai_extracted.fields.product_meta` + `llm_synthesized(intake.one_liner)` | If no variants in deck, render `[TBD]` placeholder with model_number stub. |
| `lifecycle_disposal` | text (60–180 words) | `derived(readiness_card.classification.cdsco_class)` + `llm_synthesized(intake.one_liner)` | Software products → SDLC + decommission framing; hardware → expected service life + disposal. |
| `model_number` | string | `ai_extracted.fields.product_meta.model_number` → `[TBD]` | Plain formatter. |
| `device_class_declared` | string | `readiness_card.classification.cdsco_class` | Plain formatter. |
| `sterile_status` | enum: `sterile \| non_sterile \| not_applicable` | `ai_extracted.fields.product_meta.sterile` (parsed) → `derived(readiness_card.classification: software_only → "not_applicable")` → `gap` | Phase 4b: if neither extraction nor derivation yields, emit `[TBD]` + cross-link Sprint 3 question. |
| `patient_contact` | enum: `none \| surface_intact_skin \| surface_mucosal \| blood_path_indirect \| blood_path_direct \| invasive_transient \| invasive_long_term \| implant` | `gap` (bible §26.3 Sprint 3 question 7) | Phase 4b: `[TBD]` + Sprint 3 expansion reference. LLM-fill at low confidence from one_liner keywords ("wearable patch" → surface_intact_skin, etc.). |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `sterile_status === "sterile"` | Cross-reference Section 8 (Design & Manufacturing) §8.14 Sterilization Validation sub-block. Add note: *"Sterilization method and validation evidence detailed in Section 8."* |
| `patient_contact !== "none"` (or `gap` resolves to body-contacting) | Cross-reference Section 11 (V&V) biocompatibility sub-block (DMF §8.11). Add: *"Biocompatibility evidence per ISO 10993 series detailed in Section 11."* |
| `readiness_card.classification.class_qualifier startsWith "IVD-SaMD"` or `wizard.b1_intended_use_statement` references "in-vitro" | Add IVD characteristic block: analyte / specimen / diagnostic level. *(Sprint 2 stub — full IVD path Sprint 3 per bible §27.2)* |
| `readiness_card.classification.ai_ml_flag === true` | `principle_of_operation` must include adaptive-vs-static model statement (drives Section 8 ACP block). |
| `wizard.q5 === "abdm"` or `wizard.q5 === "both"` | Add ABDM integration declaration sentence per bible §5 (SaMD persona). |

## D. Validation criteria

- **Field-level**
  - Each text sub-field 60–180 words (the `*_words` band)
  - `model_number` non-empty OR explicit `[TBD]` placeholder rendered (do not silently omit)
  - `sterile_status` ∈ enum (never null in Sprint 2; resolves to `not_applicable` for software)
- **Section-level**
  - Total section length 1500–3500 chars
  - At least one of {`components_architecture`, `principle_of_operation`} mentions either the intended user (HCP/patient per `wizard.q3`) or the use environment (per `wizard.b2_use_environment`)
- **Cross-section**
  - `sterile_status` matches Section 7 (Labelling) sterility marks
  - `sterile_status` matches Section 8 (Design & Manufacturing) §8.14 inclusion flag
  - `patient_contact` matches Section 11 (V&V) §8.11 biocompatibility inclusion flag

---

# Section 3 — Intended Use & Indications

## A. Section meta

| | |
|---|---|
| **Section number** | 3 |
| **Maps to DMF** | §8.2 (Descriptive information — intended-use portion) |
| **Source authority** | MD-7 checklist Appendix A §8.2 (consolidates with Section 2 in CDSCO structure); clearpath promotes to top-level section per upgraded Draft Pack spec |
| **Target word count** | 200–400 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Direct copy from `wizard.b1_intended_use_statement` + structured derivation of user/environment/population |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `indication` | text (60–180 words) | `wizard.b1_intended_use_statement` (preferred) → `ai_extracted.fields.suggested_wizard_answers.intended_use` → `intake.one_liner` | Direct copy from highest-priority source. |
| `intended_user` | enum + descriptor | `derived(wizard.q3, ai_extracted.fields.product_meta.user_population)` | `q3=hcps → "Healthcare professionals (specify: " + product_meta.user_population + ")"`; same pattern for patients/both/admin. |
| `use_environment` | enum + descriptor | `wizard.b2_use_environment` → `ai_extracted.fields.product_meta.setting_of_use` → `gap` | Plain enum + sentence framing. |
| `patient_population` | text (60–180 words) | `ai_extracted.fields.product_meta.patient_population` + `llm_synthesized(intake.one_liner)` | If both null → `[TBD]`. |
| `contraindications` | text (60–180 words) | `llm_synthesized(intake.one_liner, readiness_card.classification, ai_extracted.fields.suggested_wizard_answers.data_sensitivity)` | LLM derives reasonable contraindications from intent + class. Allowed to say "to be confirmed during clinical validation" — that's honest. |
| `intended_use_decision_role` | enum: `informs_only \| drives \| diagnoses_treats` | `wizard.q2` (with `wizard.q2_defended` softening when applicable) | Plain formatter into a sentence describing autonomy. |
| `ai_ml_role_statement` | text (≤ 60 words) \| null | `derived(readiness_card.classification.ai_ml_flag, classification.acp_required, wizard.c1_software_lifecycle_model)` | Non-null only when `ai_ml_flag === true`. Documents human-oversight + clinician-as-final-decider per bible §6 (AI/ML developer persona §6.B). |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `readiness_card.classification.ai_ml_flag === true` | Mandate `ai_ml_role_statement`. Body MUST include the explicit statement: *"This device does NOT perform autonomous diagnosis or treatment. The clinician remains the responsible decision-maker for every recommendation."* (or equivalent — required by Oct 2025 CDSCO SaMD draft framing) |
| `wizard.q1 === "critical"` | `intended_use_decision_role` softened to one band lower than raw `q2` answer if `q2 === "diagnoses_treats"` AND `wizard.q2_defended !== true`. Per bible §4.4 Class D heightened-scrutiny framing. |
| `wizard.b2_use_environment === "home"` | Add lay-user warning: *"Lay-user (non-HCP) operation. Instructions for Use (Section 7) must address comprehension at general-public reading level per Fifth Schedule labelling guidance."* |
| `ai_extracted.fields.suggested_wizard_answers.data_sensitivity === "identifiable"` AND `wizard.q6` includes any of `["phi", "imaging", "genomic", "prescription"]` | Add data-handling intent sentence per bible §5 SaMD persona §5.B (DPDP framing). |
| `wizard.q3 === "patients"` AND `q1 !== "non_serious"` | Add caregiver supervision sentence if applicable per bible §6.D. |

## D. Validation criteria

- **Field-level**
  - `indication.length` ≥ 100 chars
  - `intended_user` non-null
  - `use_environment` ∈ enum (the Phase 2 wizard always saves a value; resolve `gap` → `[TBD]`)
  - `contraindications` non-empty
- **Section-level**
  - Section MUST contain at least one sentence per: (intended_user, use_environment, patient_population)
  - If `ai_ml_flag === true`, `ai_ml_role_statement` non-null
- **Cross-section**
  - `intended_user` matches Section 7 (Labelling) IFU target-user statement
  - `use_environment` matches Section 7 (Labelling) intended-environment statement
  - `intended_use_decision_role` matches Section 4 (Classification) IMDRF significance dimension (q2 informs / drives / diagnoses_treats)

---

# Section 4 — Classification & Grouping

## A. Section meta

| | |
|---|---|
| **Section number** | 4 |
| **Maps to DMF** | §8.3 Justification for the Medical Device Grouping |
| **Source authority** | MD-7 checklist Appendix A §8.3; bible §2 (device classification foundation), §3 (device type taxonomy), §33.1 (form-triggering matrix) |
| **Target word count** | 300–500 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Mostly `derived` from Risk Card; rationale paragraph is `llm_synthesized` |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `cdsco_class` | enum `A \| B \| C \| D` | `readiness_card.classification.cdsco_class` | Plain copy. |
| `class_qualifier` | enum \| null | `readiness_card.classification.class_qualifier` | Plain copy. `null` for plain devices. |
| `imdrf_category` | enum `I \| II \| III \| IV` | `readiness_card.classification.imdrf_category` | Plain copy. |
| `imdrf_significance` | string | `derived(wizard.q2)` | Plain formatter: `informs_only → "Inform clinical management"`, `drives → "Drive clinical management"`, `diagnoses_treats → "Diagnose / treat"`. |
| `imdrf_situation` | string | `derived(wizard.q1)` | Plain formatter: `non_serious → "Non-serious"`, `serious → "Serious"`, `critical → "Critical"`. |
| `imdrf_rationale` | text (80–200 words) | `llm_synthesized(wizard.q1, wizard.q2, readiness_card.classification, intake.one_liner)` | Opus narrative mapping the matrix cell. |
| `cdsco_rationale` | text (80–200 words) | `llm_synthesized(readiness_card.classification, wizard.b1_intended_use_statement, MDR-2017-class-rules)` | Opus narrative tying IMDRF category to CDSCO class per MDR 2017. |
| `grouping_statement` | text (60–120 words) | `derived(ai_extracted.fields.product_meta.model_number, intake.one_liner)` + `llm_synthesized` | Single-product vs family declaration. Default: "Single product, single SKU." Family grouping is a `gap`. |
| `ai_ml_flag` | boolean | `readiness_card.classification.ai_ml_flag` | Plain copy. |
| `acp_required` | boolean | `readiness_card.classification.acp_required` | Plain copy. |
| `novel_or_predicate` | enum: `novel \| has_predicate \| null` | `derived(wizard.b3_predicate_devices, wizard.b3_no_predicate, readiness_card.classification.novel_or_predicate)` | If `b3_no_predicate === true → "novel"`; else if predicate list non-empty → `"has_predicate"`; else fall back to Risk Card value. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `cdsco_class IN ["C", "D"]` AND `novel_or_predicate === "novel"` | Mandate detailed `cdsco_rationale` (lower bound 150 words). Must reference MD-26/MD-27 pre-permission requirement per bible §33.1. |
| `cdsco_class === "D"` | Heightened scrutiny note: *"Class D devices undergo line-by-line Essential Principles examination per bible §4.4. Clinical evidence (Section 12) is effectively mandatory even with predicate."* |
| `ai_ml_flag === true` AND `class_qualifier === "AI-CDS"` | Add ACP-trigger paragraph referencing Oct 2025 CDSCO SaMD draft per bible §5, §6. |
| `class_qualifier === "scoped"` | Add sub-feature scoping disclosure: parent platform N/A; only scoped sub-feature carries the class. |
| `class_qualifier === "wellness"` OR `medical_device_status === "wellness_carve_out"` | Carve-out paragraph; remainder of Draft Pack acknowledges N/A regulatory exposure. |
| `class_qualifier === "IVD"` OR `class_qualifier === "IVD-SaMD"` | **Sprint 3 path** — IVD-specific classification rules differ (Class A/B IVD via MD-3; Class C/D IVD via MD-7 but Master File is Appendix II for IVD per bible §22). Render Sprint 2 stub with `gap` annotation. |

## D. Validation criteria

- **Field-level**
  - `cdsco_class` ∈ {A, B, C, D} (never null when `medical_device_status === "is_medical_device"`)
  - `imdrf_category` ∈ {I, II, III, IV} when `cdsco_class` non-null
  - `acp_required === true` iff `ai_ml_flag === true` AND `cdsco_class IN ["C", "D"]`
- **Section-level**
  - `cdsco_rationale` references the IMDRF cell explicitly
  - `imdrf_rationale.length` ≥ 80 words
- **Cross-section**
  - `cdsco_class` matches `Section 1.product_class`
  - `novel_or_predicate` matches `Section 6.has_predicate` boolean
  - `ai_ml_flag` matches `Section 9.essential_principles.software_subsection.ai_ml_declared`

---

# Section 5 — Product Specification & Variants

## A. Section meta

| | |
|---|---|
| **Section number** | 5 |
| **Maps to DMF** | §8.4 Product Specification, including variants and accessories |
| **Source authority** | MD-7 checklist Appendix A §8.4 |
| **Target word count** | 250–450 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Largely `[TBD]` placeholders + LLM-synthesized stubs in Sprint 2; depends on Sprint 3 question expansion for full coverage |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `model_number` | string | `ai_extracted.fields.product_meta.model_number` → `[TBD]` | Plain. |
| `device_family` | text (≤ 60 words) | `derived(ai_extracted.fields.product_meta, intake.one_liner)` + `llm_synthesized` | Default: "Single product, no family variants in scope of this application." Family grouping is a `gap` (bible §26.2 model variants line). |
| `physical_specifications` | text (80–200 words) | `llm_synthesized(intake.one_liner, ai_extracted.fields.product_meta, intake.url_fetched_content)` + `gap` markers for missing dims | Hardware → dimensions, weight, materials placeholders; software → "Not applicable — software-only product." |
| `performance_specifications` | text (80–200 words) | `llm_synthesized(intake.one_liner, ai_extracted.fields, wizard.b1_intended_use_statement)` | Functional spec — what the device does, accuracy/sensitivity placeholders if not in source. |
| `variants_listed` | array of {name, description} | `gap` (Sprint 3 family question) | Sprint 2: array of length 0 OR single entry "primary variant". |
| `accessories` | array of strings | `gap` (Sprint 3 question) | Sprint 2: empty array OR placeholder. |
| `intended_lifetime` | string (e.g., "5 years", "Software lifecycle: ongoing") | `derived(readiness_card.classification.cdsco_class, ai_extracted)` | Hardware → `[TBD]` if unknown; software → "Continuous updates per SDLC; major-version retirements per IEC 62304 lifecycle plan." |
| `packaging_summary` | text (≤ 80 words) | `gap` (Sprint 3 question) + `derived(sterile_status from Section 2)` | If `sterile_status === "sterile"` → reference sterile packaging requirements. Else: `[TBD]`. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| Software-only product (derived from `ai_extracted.fields.product_meta.sterile === "Non-sterile"` AND `class_qualifier startsWith "AI-CDS"` or `samd_*`) | `physical_specifications` → "Not applicable — software-only product." `variants_listed` → array of software variants if present (cloud/desktop/mobile per bible §5 deployment-mode gap). |
| `class_qualifier === "IVD"` | Spec must enumerate analyte / specimen / diagnostic level per bible §7 (IVD persona). **Sprint 3 path.** |
| `Section 2.patient_contact` resolves to body-contact tier | `physical_specifications` must mention contact material class. Cross-reference Section 11 (V&V) biocompatibility evidence. |
| `Section 2.sterile_status === "sterile"` | `packaging_summary` MUST describe sterile barrier system + shelf life. Cross-reference Section 8 (Design & Manufacturing) §8.14. |
| `wizard.b5_clinical_evidence_status === "multi_center_trial"` | `performance_specifications` may cite the trial's reported sensitivity/specificity if extracted from deck. |

## D. Validation criteria

- **Field-level**
  - `model_number` non-empty OR explicit `[TBD]` (never silently omit)
  - At least one of {`physical_specifications`, `performance_specifications`} ≥ 80 words
- **Section-level**
  - `[TBD]` count ≤ 4 (Phase 4c validator flags higher counts as Sprint 3 expansion blocking)
- **Cross-section**
  - `model_number` matches Section 1, 2, 7 references
  - `intended_lifetime` framing matches Section 2 `lifecycle_disposal`

---

# Section 6 — Predicate Device Comparison

## A. Section meta

| | |
|---|---|
| **Section number** | 6 |
| **Maps to DMF** | §8.5 Substantial equivalence with reference to the predicate device |
| **Source authority** | MD-7 checklist Appendix A §8.5; bible §4.B Block 6 (predicate inter-form dependency) |
| **Target word count** | 300–600 words (or 100-word "novel device" statement when no predicate) |
| **Required vs conditional** | **Required (always present — variant differs by `b3_no_predicate`)** |
| **Generation strategy** | Mostly `wizard.b3_*` direct copy + LLM-synthesized substantial-equivalence narrative |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `has_predicate` | boolean | `derived(wizard.b3_no_predicate, wizard.b3_predicate_devices)` | `false` iff `b3_no_predicate === true` OR `b3_predicate_devices.length === 0`. |
| `predicate_list` | array of `{device_name, manufacturer?, rationale?}` | `wizard.b3_predicate_devices` | Plain copy. Up to 3 entries per Tier B B3 cap. |
| `substantial_equivalence_table` | structured table (rows = comparison axes) | `llm_synthesized(wizard.b3_predicate_devices, wizard.b1_intended_use_statement, readiness_card.classification)` | Axes: intended_use, device_class, technology, materials, performance, indications. Rows compare claimed device vs each predicate. |
| `differences_explanation` | text (100–250 words) | `llm_synthesized(wizard.b3_predicate_devices, wizard.b1_intended_use_statement)` | Documents material differences and why they don't affect safety/effectiveness equivalence. |
| `pathway_implication` | string | `derived(has_predicate, readiness_card.classification.cdsco_class)` | If `has_predicate === false` → "MD-26 → MD-27 pre-permission required before MD-7" per bible §33.1. Else → "Substantial equivalence basis sufficient; direct MD-7 path." |
| `md27_application_note` | text (60–120 words) \| null | `derived(has_predicate, novel_or_predicate)` | Non-null only when `has_predicate === false`. Surfaces the MD-26 application requirement and points the customer to the Reviewer Concierge tier for the MD-27 pathway. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `has_predicate === false` (wizard.b3_no_predicate === true) | Body replaces substantial-equivalence narrative with **novel device declaration**. Includes `md27_application_note`. Pathway downstream (Section 1 + Section 4) reflects MD-26/MD-27 dependency per bible §33.1. |
| `predicate_list[*].rationale` empty | Trigger `[TBD]` placeholder per row and an LLM-synthesized rationale stub from intended_use comparison. |
| `Section 4.cdsco_class === "D"` | Heightened comparison rigor: `substantial_equivalence_table` MUST cover all six axes; `differences_explanation.length ≥ 150 words`. |
| `class_qualifier === "AI-CDS"` AND predicate is non-AI | Add note about algorithm-specific differences not covered by traditional substantial equivalence; cross-reference Section 9 (Essential Principles) AI/ML subsection. |
| Predicate is foreign (e.g., FDA 510(k)) — heuristically inferred from `manufacturer` field | Add note about CDSCO acceptance of foreign predicates per bible §4.B Block 6 (MD-7 checklist §11.0 + Addendum FAQ §19). |

## D. Validation criteria

- **Field-level**
  - `has_predicate` matches the Tier B wizard state exactly (no drift)
  - If `has_predicate === true`: `predicate_list.length ≥ 1` AND each entry has non-empty `device_name`
  - If `has_predicate === false`: `md27_application_note` non-null
- **Section-level**
  - When `has_predicate === true`: `substantial_equivalence_table` non-empty
  - When `has_predicate === false`: section body length ≥ 100 words (novel-device statement)
- **Cross-section**
  - `has_predicate` matches `Section 1.pathway` (no-predicate variant)
  - `has_predicate` matches `Section 4.novel_or_predicate` (`novel` ↔ `false`)

---

# Section 7 — Labelling

## A. Section meta

| | |
|---|---|
| **Section number** | 7 |
| **Maps to DMF** | §8.6 Labelling information (Labels, Instruction for Use, etc.) |
| **Source authority** | MD-7 checklist Appendix A §8.6; MDR-2017 Fifth Schedule Annexure for label content; bible §4.4 (class-specific labelling) |
| **Target word count** | 400–700 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Mix of `derived` (manufacturer details from ai_extracted) + LLM-synthesized IFU summary + Sprint 3 gaps for label-specific fields |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `manufacturer_name` | string | `ai_extracted.fields.company.legal_name` → `[TBD]` | Plain. |
| `manufacturer_address` | string | `ai_extracted.fields.company.registered_address` → `ai_extracted.fields.company.manufacturing_address` → `[TBD]` | Plain. |
| `product_name_brand` | string | `ai_extracted.fields.device_name` → `intake.one_liner` snippet | Plain or LLM extract from one-liner. |
| `model_number_label` | string | `Section 2.model_number` | Plain. |
| `intended_use_label` | text (≤ 80 words) | `derived(Section 3.indication)` | Direct condensation of Section 3. Plain-language. |
| `target_user_label` | string | `derived(Section 3.intended_user)` | Plain formatter. |
| `intended_environment_label` | string | `derived(Section 3.use_environment)` | Plain formatter. |
| `contraindications_label` | text (≤ 120 words) | `derived(Section 3.contraindications)` | Short condensation. |
| `regulatory_marks` | array of strings | `derived(Section 2.sterile_status, Section 4.class_qualifier, Section 4.ai_ml_flag)` | Adds "Sterile — single use", "Software medical device", "For use by qualified clinicians only", etc. |
| `ifu_summary` | text (200–400 words) | `llm_synthesized(Section 3, Section 2, wizard.b2_use_environment)` | Full IFU structure: indication, contraindications, warnings, directions for use, storage, disposal. Lay-user reading level when `b2_use_environment === "home"`. |
| `cdsco_registration_marks` | text (≤ 60 words) | `derived(Section 4.cdsco_class)` | Placeholder for: licence number (post-grant), CDSCO MD-7/MD-9 mark, MDR-2017 conformance statement. Sprint 2: render template with `[TBD]` for licence number. |
| `expiry_or_revision` | string | Hardware → `[TBD]` (Section 5 `intended_lifetime`); software → "Software version N.N.N, release date YYYY-MM-DD" | Plain. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `Section 2.sterile_status === "sterile"` | `regulatory_marks` MUST include "Sterile — single use unless otherwise specified". `ifu_summary` MUST cover sterile-barrier inspection + expiry. |
| `wizard.b2_use_environment === "home"` | `ifu_summary` reading level: lay user. Add caregiver/parent-supervised section if `wizard.q3` includes "patients" AND Section 4 `cdsco_class IN ["B", "C", "D"]`. |
| `Section 4.class_qualifier === "AI-CDS"` OR `ai_ml_flag === true` | Add AI/ML disclosure label: *"This device incorporates AI/ML. The device DOES NOT perform autonomous diagnosis or treatment. The clinician remains the responsible decision-maker."* Mirrors Section 3 statement. |
| Veterinary use (gap — Sprint 3 question) | `regulatory_marks` MUST include "For veterinary use only — not for human use" per bible §4.B Block 5. |
| `Section 4.class_qualifier === "IVD"` | Different label fields per IVD MDR labelling rules. **Sprint 3 path.** |
| Contains drug/biologic (gap — Sprint 3 question) | Add medicinal-substance disclosure per bible §4.B Block 5; cross-reference Section 8 DMF §8.12. |

## D. Validation criteria

- **Field-level**
  - `manufacturer_name` non-empty OR `[TBD]`
  - `manufacturer_address` non-empty OR `[TBD]`
  - `intended_use_label.length ≤ 600 chars` (label space constraint)
- **Section-level**
  - `ifu_summary` ≥ 200 words AND ≤ 400 words
  - At least one regulatory mark present
- **Cross-section**
  - `intended_use_label` consistent with Section 3 `indication`
  - `target_user_label` consistent with Section 3 `intended_user`
  - Sterility marks consistent with Section 2 `sterile_status`

---

# Section 8 — Design & Manufacturing

## A. Section meta

| | |
|---|---|
| **Section number** | 8 |
| **Maps to DMF** | §8.7 Device Design and Manufacturing Information (+ §8.16 Animal preclinical conditional, + §8.20 Batch release conditional) |
| **Source authority** | MD-7 checklist Appendix A §8.7, §8.16, §8.20; bible §4.B Block 3 (QMS), Block 4 (DMF) |
| **Target word count** | 500–800 words |
| **Required vs conditional** | **Required (always present); animal studies sub-block conditional** |
| **Generation strategy** | LLM-synthesized narrative anchored to ISO 13485 status + manufacturing site address; conditional sterilisation/software sub-blocks per Sprint 3 gaps |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `design_history_summary` | text (150–300 words) | `llm_synthesized(intake.one_liner, intake.url_fetched_content, wizard.q7, ai_extracted)` | Design controls per ISO 13485 §7.3 framing. References commercial stage from `wizard.q7`. |
| `manufacturing_process_summary` | text (150–300 words) | `llm_synthesized(ai_extracted.fields.company.manufacturing_address, wizard.b6_iso_13485_status, intake.one_liner)` | If software-only: SDLC + release engineering framing. |
| `manufacturing_site` | structured `{type, address}` | `derived(ai_extracted.fields.company.manufacturing_address, ai_extracted.fields.company.registered_address)` + `gap` (Sprint 3 own-vs-contract question) | `type` defaults to `[TBD]`; address from extraction. |
| `iso_13485_status` | enum | `wizard.b6_iso_13485_status` | Plain copy. |
| `iso_13485_evidence` | text (60–120 words) | `derived(wizard.b6_iso_13485_status)` + `llm_synthesized` | If `certified` → "Certificate # [TBD], issued by [TBD], valid through [TBD]"; if `in_progress` → "Stage 1 audit scheduled [TBD]"; if `not_started` → "Engagement plan: [TBD]"; if `not_applicable` → exemption rationale. |
| `quality_management_overview` | text (200–400 words) | `llm_synthesized(wizard.b6_iso_13485_status, ai_extracted, readiness_card.readiness.dimensions.quality_system)` | Mirrors DMF §7 QMS Block (Quality Manual, doc/record control, mgmt resp, resource mgmt, production controls, internal audit, NCP, CAPA, env requirements). |
| `software_development_lifecycle` | text (150–300 words) \| null | `wizard.c1_software_lifecycle_model` + `llm_synthesized` | Non-null only when software present (`Section 4.class_qualifier startsWith samd` OR `ai_ml_flag === true`). Maps `c1` value → IEC 62304 SDLC framing. |
| `algorithm_change_protocol` | text (150–300 words) \| null | `derived(readiness_card.classification.ai_ml_flag, readiness_card.classification.acp_required)` + `gap` (Sprint 4 ACP 5-components question) | Non-null only when `acp_required === true`. Sprint 2 stub with 5-component placeholder per bible §6.B (AI/ML developer persona); full ACP elements gap-marked. |
| `sterilization_validation` | text (150–300 words) \| null | `gap` (Sprint 3 sterilisation-mode question) + `llm_synthesized` | Non-null only when `Section 2.sterile_status === "sterile"`. Method-specific narrative when Sprint 3 question lands; Sprint 2: `[TBD]` block. |
| `animal_studies_preclinical` | text (≤ 200 words) \| null | `gap` (Sprint 4 preclinical question) | Non-null only when preclinical data exists (gap today; Sprint 2: omitted unless extraction surfaces). |
| `batch_release_documentation` | text (60–120 words) | `derived(wizard.b6_iso_13485_status)` + `llm_synthesized` | Hardware → 3-batch consistency framing per DMF §8.20; software → "Software version release certificate per IEC 62304 §5.8". |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `wizard.c1_software_lifecycle_model` set | Activate `software_development_lifecycle` sub-block. Maps: `waterfall → "phased V-model with formal stage gates per IEC 62304 §5"`; `agile → "iterative sprints with risk-based regression test cadence"`; `hybrid → "scaled-agile with pre-defined release gates"`. |
| `readiness_card.classification.acp_required === true` | Activate `algorithm_change_protocol` sub-block. Stub 5-component skeleton per bible §6: (1) modification scope, (2) retraining triggers, (3) validation thresholds, (4) human oversight, (5) re-submission triggers. **Sprint 4 will provide full ACP elements question.** |
| `Section 2.sterile_status === "sterile"` | Activate `sterilization_validation` sub-block. **Sprint 3 question** for sterilisation mode (EtO / steam / radiation / aseptic) — Sprint 2: `[TBD]` placeholder. |
| `wizard.b5_clinical_evidence_status === "multi_center_trial"` AND preclinical signal in extraction | Activate `animal_studies_preclinical` sub-block. |
| `Section 4.cdsco_class === "D"` | `quality_management_overview.length ≥ 300 words` (heightened scrutiny per bible §4.5). Include explicit reference to internal audit cadence and CAPA SLA. |
| `wizard.b6_iso_13485_status === "not_started"` AND `Section 4.cdsco_class IN ["C", "D"]` | Add **risk callout**: ISO 13485 certification is effectively required pre-grant for Class C/D under MDR-2017 per bible §4.4. Cross-reference Section 1 `headline_gaps`. |
| Manufacturing address absent | `manufacturing_site.type → "[TBD]"`, `address → "[TBD]"`. Add Sprint 3 expansion note. |

## D. Validation criteria

- **Field-level**
  - `iso_13485_status` ∈ enum; matches Section 12 PMS reference
  - `software_development_lifecycle` non-null iff software present
  - `algorithm_change_protocol` non-null iff `acp_required === true`
- **Section-level**
  - `quality_management_overview` references all 11 DMF §7 sub-blocks (or explicit rationale for omission)
  - Total section length 2500–6000 chars
- **Cross-section**
  - `iso_13485_status` matches Section 1 `headline_gaps` (when `not_started` or `not_applicable`)
  - `algorithm_change_protocol` activation matches Section 4 `acp_required`
  - `software_development_lifecycle` activation matches Section 9 software conformance block
  - `sterilization_validation` activation matches Section 2 `sterile_status` AND Section 7 sterility marks

---

# Section 9 — Essential Principles Conformity

## A. Section meta

| | |
|---|---|
| **Section number** | 9 |
| **Maps to DMF** | §8.8 Essential Principles checklist for demonstrating conformity to the Safety and Performance |
| **Source authority** | MD-7 checklist Appendix A §8.8; MDR-2017 First Schedule (Essential Principles); IEC 62304 / 81001-5-1 / 62366-1 for software; bible §33.2 (conditional document triggers) |
| **Target word count** | 600–1000 words (table-heavy) |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Largely `derived` from class + qualifier; rows of First Schedule mapping; LLM-synthesized rationale per row |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `essential_principles_table` | structured table (rows = Essential Principles 1–N from First Schedule) | `derived(readiness_card.classification, Section 2, Section 3)` + `llm_synthesized` rationale per row | Each row: principle name, applicability (yes/no/n_a), conformance evidence reference (cross-section), rationale. |
| `software_conformance_subsection` | structured \| null | `derived(Section 4.class_qualifier startsWith "samd" OR ai_ml_flag)` + `wizard.c1_software_lifecycle_model` | Non-null when software present. Documents IEC 62304 (lifecycle) + IEC 81001-5-1 (cybersecurity) + IEC 62366-1 (usability) conformance evidence. |
| `cybersecurity_subsection` | structured \| null | `wizard.c2_cybersecurity_posture` + `llm_synthesized` | Non-null when `wizard.q6` has any non-`none` data type OR `ai_extracted.data_sensitivity !== "none"`. Documents data-at-rest / data-in-transit / authentication per IEC 81001-5-1 + DPDP. |
| `usability_engineering_summary` | text (100–200 words) | `derived(Section 3.intended_user, Section 3.use_environment)` + `llm_synthesized` | IEC 62366-1 mapping. Lay-user environment → higher usability burden. |
| `non_applicability_justifications` | array of `{principle, rationale}` | `derived(readiness_card.classification)` | For each Essential Principle marked `n_a` (e.g., sterility for software-only), one-line rationale. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| Software present (`Section 4.class_qualifier startsWith "samd"` OR `ai_ml_flag === true`) | Activate `software_conformance_subsection`. Mandate IEC 62304 conformance row in `essential_principles_table`. |
| `ai_ml_flag === true` AND `wizard.suggested_wizard_answers.ai_ml === "adaptive"` (from Tier A or extraction) | Activate ACP cross-reference (Section 8 `algorithm_change_protocol`). Add adaptive-AI Essential Principle row covering algorithm change governance. |
| `wizard.q6` includes any of `["phi", "imaging", "genomic", "prescription", "insurance"]` OR `ai_extracted.data_sensitivity !== "none"` | Activate `cybersecurity_subsection`. **Required** when `wizard.c2_cybersecurity_posture` is set. |
| `Section 2.sterile_status === "sterile"` | Mandate sterility Essential Principle row. Cross-reference Section 8 `sterilization_validation`. |
| `Section 2.patient_contact !== "none"` | Mandate biocompatibility Essential Principle row. Cross-reference Section 11 (V&V) biocompatibility evidence (DMF §8.11). |
| `wizard.q5 === "abdm"` OR `wizard.q5 === "both"` | Add ABDM integration conformance row per bible §5.B (FHIR R4 + OAuth 2.0 + CERT-In Safe-to-Host). Cross-reference Section 12 PMS. |
| `Section 4.cdsco_class === "D"` | Heightened scrutiny: every Essential Principle row's rationale ≥ 50 words. Line-by-line examination basis. |

## D. Validation criteria

- **Field-level**
  - `essential_principles_table.length ≥ 8` (Essential Principles in First Schedule have 8+ baseline rows)
  - Each row's `applicability` ∈ {yes, no, n_a}
  - When `n_a`, `non_applicability_justifications` MUST contain a matching entry
- **Section-level**
  - When software present: `software_conformance_subsection` non-null AND `essential_principles_table` includes IEC 62304 row
  - When `cybersecurity_subsection` non-null: all three c2 sub-fields (data_at_rest, data_in_transit, auth_model) referenced
- **Cross-section**
  - `software_conformance_subsection` activation matches Section 8 `software_development_lifecycle` activation
  - `cybersecurity_subsection` activation matches Tier B C2 trigger (data_sensitivity)
  - Sterility row activation matches Section 2 `sterile_status`
  - Biocompatibility row activation matches Section 2 `patient_contact`

---

# Section 10 — Risk Management (ISO 14971)

## A. Section meta

| | |
|---|---|
| **Section number** | 10 |
| **Maps to DMF** | §8.9 Risk analysis and control summary |
| **Source authority** | MD-7 checklist Appendix A §8.9; ISO 14971:2019 (Risk Management for Medical Devices); for AI/ML adaptive systems: ISO/IEC 23894 + Oct 2025 CDSCO SaMD draft §4.2.D |
| **Target word count** | 500–900 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | Direct copy from `wizard.b4_risks_and_mitigations` (which prefills from `readiness_card.top_gaps`); LLM expansion to full ISO 14971 framing |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `risk_register` | array of `{risk_id, hazard, hazardous_situation, harm, severity, probability, mitigation, residual_severity, residual_probability}` | `wizard.b4_risks_and_mitigations` (top 3–5) + `llm_synthesized` for ISO 14971 fields | Tier B B4 captures `{risk, mitigation}` pairs. Phase 4b expands each to ISO 14971's hazard → situation → harm chain. |
| `risk_summary_narrative` | text (200–400 words) | `llm_synthesized(risk_register, readiness_card.risk.rationale, Section 4.cdsco_class)` | Narrative overview tying highest residual risks to clinical state (`wizard.q1`) and intended use (Section 3). |
| `residual_risk_assessment` | text (100–200 words) | `llm_synthesized(risk_register)` | Statement that residual risks have been evaluated and mitigations are documented. Honest framing: cite specific high-residual-risk items as "monitored under PMS" (cross-ref Section 12). |
| `risk_management_file_reference` | text (≤ 60 words) | `derived(wizard.b6_iso_13485_status)` | If ISO 13485 certified → "RMF maintained per ISO 14971 §3 and integrated with QMS"; else → `[TBD]` + Sprint 3 question note. |
| `ai_ml_specific_risks` | array of `{risk, mitigation}` \| null | `derived(readiness_card.classification.ai_ml_flag, classification.acp_required)` + `llm_synthesized` | Non-null only when AI/ML present. Includes: drift, distribution shift, false positive/negative rates, subgroup performance, adversarial inputs per bible §6.D AI/ML gaps. |
| `sterility_risks` | array \| null | `derived(Section 2.sterile_status)` | Non-null when sterile. Sterilisation failure modes, EOS shelf life, single-use compliance. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `readiness_card.classification.ai_ml_flag === true` | Activate `ai_ml_specific_risks`. Must include drift detection mitigation referenced to Section 8 ACP and Section 9 IEC 62304. |
| `wizard.c1_software_lifecycle_model === "agile"` | Add release-risk paragraph in `risk_summary_narrative` covering regression test cadence and risk-based testing prioritisation. |
| `Section 2.sterile_status === "sterile"` | Activate `sterility_risks` sub-block. Cross-reference Section 8 `sterilization_validation`. |
| `wizard.q1 === "critical"` | `risk_summary_narrative.length ≥ 300 words` AND each register row's severity field must be evaluated explicitly. |
| `Section 6.has_predicate === false` (novel device) | Add "first-in-class" risk paragraph: unknown failure modes; mitigations include enhanced PMS (Section 12), clinical investigation (cross-ref MD-22 path if `recommended_path === "clinical_investigation"`). |
| `Section 4.cdsco_class === "D"` | Risk register ≥ 5 rows. `residual_risk_assessment.length ≥ 150 words`. |
| `wizard.b4_risks_and_mitigations.length < 3` | Phase 4b generator MUST LLM-fill missing rows from `readiness_card.top_gaps` (and emit low-confidence flag if `top_gaps.length < 3`). |

## D. Validation criteria

- **Field-level**
  - `risk_register.length ≥ 3` (Tier B B4 default min)
  - Each row has non-empty `hazard` AND `mitigation`
  - `severity` and `probability` ∈ enum (e.g., negligible / minor / serious / critical / catastrophic)
- **Section-level**
  - `risk_summary_narrative` references at least one specific risk from `risk_register` by name
  - `ai_ml_specific_risks` non-null iff `ai_ml_flag === true`
  - `sterility_risks` non-null iff `sterile_status === "sterile"`
- **Cross-section**
  - Risk register entries are consistent with Section 1 `headline_gaps`
  - `ai_ml_specific_risks` activation matches Section 8 ACP activation
  - `sterility_risks` activation matches Section 2 sterility + Section 8 sterilization_validation

---

# Section 11 — Verification & Validation

## A. Section meta

| | |
|---|---|
| **Section number** | 11 |
| **Maps to DMF** | §8.10 Verification and validation of the medical device (+ §8.11 Biocompatibility conditional, + §8.13 Biological safety conditional, + §8.15 Software V&V conditional, + §8.17 Stability data) |
| **Source authority** | MD-7 checklist Appendix A §8.10–§8.17 (excluding clinical evidence which goes in Section 12); bible §33.2 (conditional document triggers) |
| **Target word count** | 500–1000 words |
| **Required vs conditional** | **Required (always present); sub-blocks conditional** |
| **Generation strategy** | LLM-synthesized verification protocol + validation summary; conditional biocompatibility/software-V&V/stability sub-blocks per device characteristics |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `verification_protocol_summary` | text (150–300 words) | `llm_synthesized(Section 2, Section 5, Section 9.essential_principles_table)` | What was tested (functional, safety, performance) and against what specs/standards. References Section 9 Essential Principles rows. |
| `validation_summary` | text (150–300 words) | `llm_synthesized(wizard.b5_clinical_evidence_status, Section 3, readiness_card.readiness.dimensions.clinical_evidence)` | Real-world performance against intended use. Honest framing for `b5 === "none"` and `b5 === "pilot_data"`. |
| `biocompatibility_evidence` | text (150–300 words) \| null | `derived(Section 2.patient_contact)` + `gap` (Sprint 3 question for tier specifics) | Non-null when patient-contact. ISO 10993 series mapping by tier. Sprint 2: `[TBD]` for specific test panel; references planned test plan. |
| `biological_safety_summary` | text (≤ 200 words) \| null | `gap` (Sprint 4 biologics/tissue-derived question) | Non-null only when biological/tissue-derived signal present in extraction. |
| `software_verification_validation` | structured \| null | `wizard.c1_software_lifecycle_model` + `llm_synthesized` | Non-null when software present. IEC 62304 §5.5 (Software Unit V&V) + §5.6 (System V&V) + §5.7 (Software Release) mapping. |
| `stability_data_summary` | text (100–200 words) | `gap` (Sprint 3 stability-status question) + `llm_synthesized` | Hardware: real-time + accelerated stability per ICH Q1A framing. Software: "not applicable — version-specific stability". Sprint 2: `[TBD]` if hardware AND no extraction signal. |
| `vv_evidence_references` | array of references | `derived(wizard.b5_clinical_evidence_status)` + `llm_synthesized` | List of test reports, publications, study protocols. Pulls from `wizard.b5` enum + extraction signals. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `Section 2.patient_contact !== "none"` | Activate `biocompatibility_evidence`. Map patient_contact tier → ISO 10993 panel per bible §4.D gap #2. **Sprint 3 question** for full tier resolution; Sprint 2 default to lowest tier (`surface_intact_skin`) if unspecified. |
| `Section 4.class_qualifier startsWith "samd"` OR `ai_ml_flag === true` | Activate `software_verification_validation`. Mandate IEC 62304 §5.5/§5.6/§5.7 sub-fields. |
| `readiness_card.classification.acp_required === true` | `software_verification_validation` MUST include adaptive-AI specific validation: subgroup performance, drift detection thresholds (cross-ref Section 8 ACP, Section 10 ai_ml_specific_risks). |
| `wizard.b5_clinical_evidence_status === "none"` | `validation_summary` MUST acknowledge clinical-validation gap and reference Section 12 evidence plan. Cross-link Section 10 residual-risk-monitored framing. |
| `wizard.b5_clinical_evidence_status === "multi_center_trial"` | `vv_evidence_references` MUST cite the multi-centre study (or `[TBD]` placeholder + Sprint 3 study-citation question). |
| Hardware product (not software-only) | Activate `stability_data_summary` mandatorily. Software-only → "Not applicable". |
| `Section 4.cdsco_class === "D"` | Heightened V&V rigor: `verification_protocol_summary` ≥ 250 words; `validation_summary` ≥ 250 words. |
| Biologics/tissue-derived signal in extraction | Activate `biological_safety_summary`. **Sprint 4 question.** |

## D. Validation criteria

- **Field-level**
  - `verification_protocol_summary` non-empty; ≥ 150 words
  - `validation_summary` non-empty; ≥ 150 words
  - `biocompatibility_evidence` non-null iff `patient_contact !== "none"`
  - `software_verification_validation` non-null iff software present
- **Section-level**
  - When `b5 === "none"`: `validation_summary` explicitly references the gap and Section 12 evidence plan
  - When `acp_required === true`: `software_verification_validation` includes drift validation
- **Cross-section**
  - `biocompatibility_evidence` activation matches Section 2 `patient_contact`
  - `software_verification_validation` activation matches Section 8 `software_development_lifecycle` AND Section 9 software conformance
  - `validation_summary.b5_status` matches Section 12 `clinical_evidence_status`

---

# Section 12 — Clinical Evidence & Post-Market Surveillance

## A. Section meta

| | |
|---|---|
| **Section number** | 12 |
| **Maps to DMF** | §8.18 Clinical evidence + §8.19 Post-Marketing Surveillance data (Vigilance reporting) |
| **Source authority** | MD-7 checklist Appendix A §8.18, §8.19; MDR-2017 PMS framework; for IVDs (out of Sprint 2 scope) — IVD FAQ §60 NIB performance thresholds |
| **Target word count** | 500–900 words |
| **Required vs conditional** | **Required (always present)** |
| **Generation strategy** | `wizard.b5_clinical_evidence_status` direct copy + LLM-synthesized clinical evidence narrative + PMS plan template |

## B. Sub-content requirements

| Field | Type | Source within clearpath | Generation strategy |
|---|---|---|---|
| `clinical_evidence_status` | enum | `wizard.b5_clinical_evidence_status` | Plain copy. |
| `clinical_evidence_summary` | text (200–400 words) | `llm_synthesized(wizard.b5_clinical_evidence_status, ai_extracted, intake.one_liner, intake.url_fetched_content)` | Narrative mapping b5 enum to study description. For `none`: honest gap statement + evidence plan (cross-ref Section 11). |
| `evidence_plan` | text (150–300 words) | `derived(wizard.b5_clinical_evidence_status, readiness_card.recommended_path)` + `llm_synthesized` | Sprint 3 prospective study plan, CTRI registration intent (gap — Sprint 4 question), EC engagement (gap). |
| `pms_plan_summary` | text (250–500 words) | `llm_synthesized(readiness_card.classification, Section 10.risk_register)` | Active vigilance reporting plan per MDR-2017. Includes: complaint handling, adverse event reporting (MD-43 framework), periodic safety updates, post-market clinical follow-up (PMCF). |
| `vigilance_reporting_framework` | text (100–200 words) | `derived(readiness_card.classification.cdsco_class)` | Form references: MD-42 (manufacturer adverse event reporting), MD-43 (post-market surveillance), Form-25 (medical device adverse event report). |
| `clinical_investigation_pathway_note` | text (60–120 words) \| null | `derived(readiness_card.recommended_path, wizard.b5_clinical_evidence_status, Section 6.has_predicate)` | Non-null when `recommended_path === "clinical_investigation"` OR (`has_predicate === false` AND `b5 === "none"`). Surfaces MD-22 CI path advisory. |
| `post_market_clinical_followup` | text (≤ 200 words) | `llm_synthesized(Section 10.risk_register, wizard.q1, Section 4.cdsco_class)` | PMCF triggers + cadence. Heightened for Class C/D + critical clinical state. |

## C. Conditional content rules

| Trigger | Content variant |
|---|---|
| `wizard.b5_clinical_evidence_status === "none"` | `clinical_evidence_summary` MUST acknowledge the gap; `evidence_plan` MUST describe planned prospective study; if `Section 6.has_predicate === false` → activate `clinical_investigation_pathway_note` with MD-22 advisory. |
| `wizard.b5_clinical_evidence_status === "pilot_data"` | `clinical_evidence_summary` describes pilot study + acknowledges pivotal trial dependency. `evidence_plan` outlines pivotal-trial design. |
| `wizard.b5_clinical_evidence_status === "multi_center_trial"` | `clinical_evidence_summary` cites the trial (or `[TBD]` for study ID + sample size). `evidence_plan` may reference PMCF + post-approval study. |
| `readiness_card.recommended_path === "clinical_investigation"` | Activate `clinical_investigation_pathway_note`. Sequence: MD-26 → MD-27 → MD-22 → MD-23 → CI → MD-7 → MD-9. |
| `Section 4.cdsco_class === "D"` | Clinical evidence effectively mandatory per bible §4.5. `clinical_evidence_summary` ≥ 300 words. `b5 === "none"` triggers high-priority gap callout in Section 1. |
| `Section 4.class_qualifier === "IVD"` | Switch to IVD-specific evidence framework: Clinical Performance Evaluation (CPE) per MD-24/25; 3-batch consistency; NIB thresholds for HIV/HBsAg/HCV. **Sprint 3 path.** |
| `readiness_card.classification.ai_ml_flag === true` | `pms_plan_summary` MUST include drift monitoring + periodic algorithm performance reports. Cross-reference Section 8 ACP. |
| `wizard.q1 === "critical"` AND `cdsco_class IN ["C", "D"]` | `post_market_clinical_followup` ≥ 150 words; PMCF cadence quarterly minimum. |

## D. Validation criteria

- **Field-level**
  - `clinical_evidence_status` ∈ enum
  - `clinical_evidence_summary` non-empty; ≥ 200 words
  - `pms_plan_summary` non-empty; ≥ 250 words
  - `clinical_investigation_pathway_note` non-null when `recommended_path === "clinical_investigation"`
- **Section-level**
  - Vigilance reporting forms (MD-42 / MD-43) explicitly named
  - When `b5 === "none"`: gap acknowledgement + `evidence_plan` present
- **Cross-section**
  - `clinical_evidence_status` matches Section 11 `validation_summary` framing
  - `clinical_investigation_pathway_note` matches Section 1 `recommended_path_note`
  - Drift monitoring (when AI/ML) matches Section 8 ACP AND Section 10 ai_ml_specific_risks

---

# Cross-section validation rules (document-level)

The Phase 4c validator enforces these after all 12 sections generate. Failures
surface as `matrix_compliance: { passed: false, missing_fields: [...] }` on the
final document. The Phase 4b regen UX uses the same checks to gate
section-level `completion_status` transitions.

## Consistency invariants

| Invariant | Validator check |
|---|---|
| **Classification consistency** | `Section 1.product_class === Section 4.cdsco_class + classification.class_qualifier (formatted) === Section 7.regulatory_marks (when class-derived)` |
| **Pathway consistency** | `Section 1.pathway === derived(Section 4.cdsco_class, Section 6.has_predicate)`. When `has_predicate === false`, pathway MUST include "MD-26 → MD-27". |
| **Predicate consistency** | `Section 4.novel_or_predicate ("novel" iff Section 6.has_predicate === false)`. `Section 1.recommended_path_note` activation matches `Section 12.clinical_investigation_pathway_note` activation. |
| **Sterility consistency** | `Section 2.sterile_status === "sterile"` ⇒ `Section 7.regulatory_marks` includes sterility mark ⇒ `Section 8.sterilization_validation` non-null ⇒ `Section 10.sterility_risks` non-null ⇒ `Section 9.essential_principles_table` includes sterility row. |
| **Software consistency** | `Section 4.class_qualifier startsWith "samd"` OR `Section 4.ai_ml_flag === true` ⇒ `Section 8.software_development_lifecycle` non-null ⇒ `Section 9.software_conformance_subsection` non-null ⇒ `Section 11.software_verification_validation` non-null. |
| **AI/ML consistency** | `Section 4.ai_ml_flag === true` AND `Section 4.acp_required === true` ⇒ `Section 8.algorithm_change_protocol` non-null ⇒ `Section 10.ai_ml_specific_risks` non-null ⇒ `Section 12.pms_plan_summary` includes drift monitoring language. |
| **Cybersecurity consistency** | `wizard.c2_cybersecurity_posture` is set ⇒ `Section 9.cybersecurity_subsection` non-null AND references all 3 c2 sub-fields. |
| **Patient-contact consistency** | `Section 2.patient_contact !== "none"` ⇒ `Section 9.essential_principles_table` includes biocompatibility row ⇒ `Section 11.biocompatibility_evidence` non-null. |
| **Intended-use consistency** | `Section 3.indication` text appears (verbatim or near-verbatim) in `Section 1.intended_use_statement` AND `Section 7.intended_use_label`. |
| **Class-D heightened-scrutiny consistency** | `Section 4.cdsco_class === "D"` ⇒ each of (Section 4 rationale ≥ 150 words, Section 6 differences ≥ 150 words, Section 8 quality_management ≥ 300 words, Section 10 risk_register ≥ 5 rows, Section 11 verification + validation each ≥ 250 words, Section 12 clinical_evidence ≥ 300 words). |

## Document-level metrics

| Metric | Target |
|---|---|
| Total `[TBD]` count | ≤ 12 across all 12 sections (Phase 4c flags higher counts as Sprint 3 blocking) |
| Total word count | 4000–8000 words (varies by class — Class A/B closer to lower bound; Class C/D closer to upper) |
| Section completion (sections with `completion_status: 'complete'`) | ≥ 10 of 12 before user can request final PDF export |
| Cross-section invariant failures | 0 (any failure blocks PDF export; surfaces inline in the sectioned view) |

---

# Gap inventory — Sprint 3+ question expansion required

Cross-referenced to bible §26.3 (Sprint priority) and §27 (expansion roadmap).
Phase 4b generator handles each gap by emitting `[TBD]` placeholder + a
low-confidence LLM-fill stub (configurable per gap). Phase 4c validator
flags `[TBD]` counts against the Sprint 3 question expansion list below.

## Sprint 3 critical (gap-fills mandatory before Class C/D Draft Pack is submission-ready)

| Bible §26.3 # | Question | Affects sections | Phase 4b behaviour |
|---|---|---|---|
| 1 | IVD-vs-MD flag | Section 4, 6, 11, 12 (entire path differs for IVD) | Sprint 2: assume MD path (default). Sprint 3 question required. |
| 5 | Predicate device binary (Tier A early) | Section 6, 1 (pathway), 4 (novel_or_predicate) | Sprint 2: derived from Tier B B3 only. Tier A users skip this section. |
| 6 | Sterilisation mode (EtO / steam / radiation / aseptic) | Section 2, 7, 8 §8.14, 10 (sterility_risks) | Sprint 2: `[TBD]` block. Sprint 3 Tier B conditional question (triggers on sterile). |
| 7 | Patient-contact type (ISO 10993 tier) | Section 2, 9 (biocompatibility row), 11 (§8.11) | Sprint 2: `[TBD]` with default to lowest tier when ambiguous. Sprint 3 Tier B core question. |
| 8 | Drug content / combination product | Section 2, 8 §8.12, 9 (medicinal substance row), Section 4 (combination flag) | Sprint 2: assume no drug content. Sprint 3 Tier B core question. |
| 9 | Veterinary intended use | Section 1, 3, 7 (label), 4 (Block 5 DAHD NOC) | Sprint 2: assume human-only. Sprint 3 question. |
| 11 | Country of origin (if imported) | Section 4 (path: MD-7 vs MD-14), Section 8 (manufacturing_site) | Sprint 2: assume Indian mfg. Sprint 3 question. |

## Sprint 3 high-value (IVD-specific — defer entire IVD path to Sprint 3)

| Bible §26.3 # | Question | Affects sections |
|---|---|---|
| 13 | Analyte + specimen + diagnostic level + output type | Section 2, 11, 12 (CPE evidence) |
| 14 | New-IVD-vs-predicate | Section 6 |
| 15 | MDTL engagement status | Section 11 (CPE), 12 |
| 17 | Three-batch consistency | Section 8 §8.20, 11 |
| 18 | Performance evaluation evidence | Section 11, 12 |

## Sprint 4 valuable (depth)

| Bible §26.3 # | Question | Affects sections |
|---|---|---|
| 24 | Algorithm type + training data | Section 8 ACP, 11 software V&V |
| 25 | Subgroup / bias validation | Section 11 software V&V, 10 ai_ml_specific_risks |
| 27 | Foreign regulatory approval (multi-select) | Section 11 V&V, 6 predicate (foreign predicates) |
| 28 | Pilot vs pivotal stage | Section 12 |

## Sprint 4+ defer

| Bible §26.3 # | Question | Affects sections |
|---|---|---|
| 31 | ACP 5-component descriptions | Section 8 algorithm_change_protocol (Sprint 2 stub only) |
| 33 | Radioactive content / AERB | Section 2, 7 (label), 4 (Block 5 BARC NOC) |

## Phase 4b generator policy for gaps

- **Mandatory gaps with no fallback** (e.g., `Section 6.has_predicate` when `b3_no_predicate` not set): emit `[TBD]` placeholder, do NOT attempt LLM fill.
- **Gaps with reasonable heuristic** (e.g., patient_contact_type inferable from intended use): emit LLM-fill at `low` confidence AND mark in `matrix_compliance.missing_fields`. User can override in the sectioned view.
- **Gaps that block submission** (per bible §33.2 severity column): trigger high-priority `headline_gaps` entry in Section 1 + per-section warning banner.

---

# Source mapping reference

Quick reference for Phase 4b implementers. All sources cited above resolve to these
runtime structures:

| Source token | Runtime location |
|---|---|
| `intake.name`, `intake.email`, `intake.mobile`, `intake.one_liner`, `intake.url`, `intake.url_fetched_content`, `intake.uploaded_docs` | `assessments` table columns |
| `wizard.q1`–`q7`, `wizard.q2_defended` | `assessments.wizard_answers.q*` (jsonb) |
| `wizard.b1`–`b6`, `wizard.c1`, `wizard.c2` | `assessments.wizard_answers.b*` / `c*` (jsonb) — see `lib/wizard/types.ts` |
| `wizard.b3_no_predicate` | `assessments.wizard_answers.b3_no_predicate` (Phase 3.5 Bug E) |
| `ai_extracted.fields.*` | `assessments.ai_extracted.fields.*` (jsonb) — schema in `lib/intake/ai-extract.ts` `PitchAiExtractedSchema` |
| `ai_extracted.fields.regulatory_signals.*` | Phase 3.5 INV-2 addition (iso_13485_status + clinical_evidence_level) |
| `readiness_card.*` | `assessments.readiness_card` (jsonb) — schema in `lib/schemas/readiness-card.ts` `ReadinessCardSchema` |
| `readiness_card.recommended_path` | Phase 1 Story 2.5 addition |
| `draft_pack_sections.*` (Phase 4b storage) | New rows in the `draft_pack_sections` table (migration 009) |
| `draft_pack_citations.*` | `draft_pack_citations` (migration 009) — populated by Phase 4b when citations are inline-rendered |

---

# Notes for Phase 4b implementer

1. **Generation order matters.** Section 1 (Executive Summary) MUST generate AFTER §2–§12 — it consolidates their outputs. Sections 2–11 can generate in parallel; Section 12 needs Section 10 (risk register cross-reference). The recommended order: §4 (classification anchor) → {§2, §3, §5, §6, §7} parallel → {§8, §9} parallel → §10 → §11 → §12 → §1.

2. **Class-D heightened scrutiny is a real cross-cutting concern.** When `cdsco_class === "D"`, six different sections have stricter word-count floors. Implement as a single class-D flag passed to every section's LLM prompt.

3. **The `[TBD]` policy.** Visible placeholders are intentional UX — the bible's §4.B Block 4 Phase 1 spec literally says "every [TBD] in the rendered form is a clear placeholder the applicant can fix in place rather than a confusing raw {{}} string". Phase 4b should render `[TBD]` as a small visual chip, not buried in body text, and link it to the Sprint 3 question that will fill it.

4. **Sprint 3 path expansion** (IVD / CI / pharma / importer) will require this matrix to grow. Sprint 2 covers MD-7/MD-3 manufacturing license path only. Future paths get their own matrix doc (cdsco-document-matrix-ivd.md, etc.) OR this doc gets expanded with path-specific sections — TBD per bible §27 roadmap commitments.

5. **Validation severity tiers** (for Phase 4c reporting):
   - **blocker**: cross-section invariant fail (e.g., sterile in Section 2 but no sterilisation_validation in Section 8) — must fix before any user-facing flag changes to "complete"
   - **warning**: `[TBD]` count above section threshold; LLM-fill at `low` confidence
   - **info**: word counts slightly out of band; Phase 4c logs but doesn't block

6. **No new schema migrations needed.** This matrix is consumed by the Phase 4b generator at runtime; it writes to the existing `draft_pack_sections` + `draft_pack_citations` tables (migration 009).

---

**Version:** 1.0 (Sprint 2 Story 2.5 Phase 4a)
**Sources:** `docs/specs/cdsco-regulatory-forms-reference.md` (Stream D bible), `docs/roadmap/sprint-2-plan.md`, `docs/decisions/2026-05-12-wizard-architecture-audit.md`, MD-7 Fresh Application Checklist (Pages 1-2 of `7MD.pdf`)
**Out of scope:** IVD path, clinical investigation path, pharma path, importer path. All tracked in bible §27 expansion roadmap.
