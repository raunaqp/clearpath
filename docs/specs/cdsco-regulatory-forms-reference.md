# The ClearPath Regulatory Bible

**Comprehensive CDSCO + adjacent frameworks reference for medical devices, SaMD, IVDs, combination products, and pharma scope demarcation in India.**

> **⚠️ INTERNAL DRAFT — pending CDSCO consultant validation in Sprint 3.**
> **Not for external sharing until consultant review complete.**
>
> Authored 2026-05-11 from CDSCO primary sources. Every regulatory claim is cited inline; gaps are flagged `UNCERTAIN` rather than guessed.

---

## 0. About this document

**Purpose.** A single comprehensive reference covering every CDSCO regulatory pathway a digital-health, medical-device, IVD, combination-product, or pharma founder might encounter in India — organised by **persona × stage** so that a founder reading this can find their specific journey, and a ClearPath engine writer can map each persona to questions and gaps.

**Three audiences, three uses.**
1. **Founders building under MDR 2017 / NDCT 2019** — use Part II (persona journeys) to find your path
2. **ClearPath product/engine team (Sprint 3+)** — use Part IV (question coverage gap analysis) to plan question expansion
3. **CDSCO regulatory consultants** — use Part III (form-centric) for verification, Part VI §36 (consultant questions) for red-pen

**Conventions used throughout this document.**
- **Form numbers** use the *authoritative CDSCO mapping*. Some popular blogs, third-party consultants, and even some CDSCO-republished Annexure A tables contain inverted form numbers (especially MD-12 ↔ MD-16, and IVD Master File appendix number). Where I've found inconsistencies I cite both sources and use the more authoritative one. Major corrections from common errors are listed in [Appendix B: Form numbering correction table](#appendix-b-form-numbering-correction-table).
- **`UNCERTAIN`** prefix marks any claim the author could not verify from a CDSCO-issued source within the drafting session. All `UNCERTAIN` markers are aggregated in §36 as questions for the consultant.
- **`DRAFT GUIDANCE`** prefix marks claims drawn from the Oct 2025 Software Draft Guidance — current as of the comment period, but not yet finalised. Treat as forward-looking.
- **Source citations** appear inline as `[source: <short tag>]` keyed to §38 bibliography.
- **"MDR-2017"** = Medical Devices Rules, 2017 (notified GSR 78(E) dated 31 January 2017, as amended).
- **"D&C Act"** = Drugs and Cosmetics Act, 1940 and Rules 1945 made thereunder.
- **"NDCT 2019"** = New Drugs and Clinical Trials Rules, 2019.

**Doc length warning.** This document is intentionally exhaustive (~10K lines target). Use the TOC to jump rather than reading sequentially.

---

## Table of contents

### Part I — Foundation
1. [Framework overview](#1-framework-overview)
2. [Device classification foundation](#2-device-classification-foundation)
3. [Device type taxonomy](#3-device-type-taxonomy)

### Part II — Persona × Stage Journeys
4. [Persona: Medical device manufacturer (hardware)](#4-persona-medical-device-manufacturer-hardware)
5. [Persona: SaMD founder](#5-persona-samd-founder)
6. [Persona: AI/ML system developer](#6-persona-aiml-system-developer)
7. [Persona: IVD manufacturer](#7-persona-ivd-manufacturer)
8. [Persona: Combination product developer](#8-persona-combination-product-developer)
9. [Persona: Clinical investigation researcher (medical device)](#9-persona-clinical-investigation-researcher-medical-device)
10. [Persona: Clinical performance evaluation researcher (IVD)](#10-persona-clinical-performance-evaluation-researcher-ivd)
11. [Persona: Pharma manufacturer](#11-persona-pharma-manufacturer)
12. [Persona: Pharma clinical researcher (NDCT 2019)](#12-persona-pharma-clinical-researcher-ndct-2019)
13. [Persona: Importer of foreign-manufactured device](#13-persona-importer-of-foreign-manufactured-device)
14. [Persona: Importer for clinical investigation only](#14-persona-importer-for-clinical-investigation-only)
15. [Persona: Government hospital importing for unmet need](#15-persona-government-hospital-importing-for-unmet-need)
16. [Persona: Loan licensee manufacturer](#16-persona-loan-licensee-manufacturer)
17. [Persona: Personal import / patient access](#17-persona-personal-import--patient-access)

### Part III — Form-Centric Reference
18. [Manufacturing License forms](#18-manufacturing-license-forms)
19. [Import License forms](#19-import-license-forms)
20. [Test License (manufacture and import) forms](#20-test-license-manufacture-and-import-forms)
21. [Clinical Investigation forms](#21-clinical-investigation-forms)
22. [IVD-specific forms](#22-ivd-specific-forms)
23. [Sale/distribution forms](#23-saledistribution-forms)
24. [Pharma forms (NDCT 2019 and Drug Rules 1945)](#24-pharma-forms)

### Part IV — ClearPath Question Coverage (the moat)
25. [Current ClearPath question inventory](#25-current-clearpath-question-inventory)
26. [Coverage analysis per persona × stage](#26-coverage-analysis-per-persona--stage)
27. [Question expansion roadmap](#27-question-expansion-roadmap)

### Part V — Operational Details
28. [Ethics Committee approval](#28-ethics-committee-approval)
29. [Sample size determination](#29-sample-size-determination)
30. [Fees structure](#30-fees-structure)
31. [Timelines](#31-timelines)
32. [Common rejection reasons](#32-common-rejection-reasons)

### Part VI — Reference
33. [Conditional permutation matrix](#33-conditional-permutation-matrix)
34. [Cross-form dependency map](#34-cross-form-dependency-map)
35. [Worked examples — canonical demo apps + edge cases](#35-worked-examples)
36. [Open questions for CDSCO consultant](#36-open-questions-for-cdsco-consultant)
37. [Glossary and abbreviations](#37-glossary-and-abbreviations)
38. [Source bibliography](#38-source-bibliography)
39. [Appendices](#39-appendices)

---

# PART I — FOUNDATION

## 1. Framework overview

*Drafting in Phase 1b. Sub-sections:*

- **1.1** MDR 2017 (medical devices, IVDs)
- **1.2** D&C Act 1940 + Rules 1945 (drugs, pharma)
- **1.3** NDCT Rules 2019 (clinical trials, drugs only)
- **1.4** Central Licensing Authority (CDSCO HQ) vs State Licensing Authority — exact jurisdiction split per Rule 5 of MDR-2017 and FAQ §6
- **1.5** Online portals:
  - `cdscomdonline.gov.in` — MD Online portal (main licenses)
  - `nsws.gov.in` — National Single Window System (test licenses, mandated by Oct 2025 SaMD draft guidance)
  - `BharatKosh` — government payments (challan generation)
  - **SUGAM** — `UNCERTAIN: confirm whether SUGAM is the drug-side equivalent or whether MD portal is also called SUGAM in some CDSCO docs`
  - **Sahyog** — `UNCERTAIN: cannot confirm Sahyog portal scope from primary CDSCO sources during this drafting pass; flagging for consultant`
- **1.6** ICMR + DCG(I) roles (DCG(I) = Drugs Controller General of India = the CLA per FAQ §5)
- **1.7** Subject Expert Committee (SEC) meetings — when SEC consultation is mandatory (clinical investigation waiver for foreign-approved devices, novel device classification, IVD classification disputes); `UNCERTAIN: SEC composition and scheduling cadence — needs CDSCO Office Order reference`

---

## 2. Device classification foundation

*Drafting in Phase 1b. Sub-sections:*

- **2.1** Risk-based classification (A, B, C, D) — defined in Part I (devices) and Part II (IVDs) of the First Schedule of MDR-2017
- **2.2** IMDRF significance × situation matrix (for SaMD) — adopted in §4.4.1 Table 2 of the Oct 2025 Draft SaMD Guidance
- **2.3** First Schedule MDR 2017 — risk classification list (CDSCO maintains a dynamic published list; if a device is not on it, applicant submits separate request per FAQ §78)
- **2.4** Notified medical devices — the historical evolution from notified-only regulation to universal regulation (S.O. 648(E) dated 11.02.2020 brought all devices under MDR; FAQ §1)
- **2.5** Predicate device concept + substantial equivalence (Rule 51 MDR-2017; FAQ §50 lists required comparison parameters)
- **2.6** Investigational device definition (Rule 3 / FAQ §112; SaMD draft §4.1.6) — includes both "no predicate" and "licensed device with new claim/population/material/major design change"
- **2.7** Borderline products (drug vs device vs cosmetic) — primary mode of action test; combination products

---

## 3. Device type taxonomy

*Drafting in Phase 1b. Sub-sections:*

- **3.1** Hardware-only devices
- **3.2** Software as Medical Device (SaMD) — standalone, perform medical purpose on own [source: SaMD Draft §4.2.2]
- **3.3** Software in a Medical Device (SiMD) — embedded, firmware, drives/influences hardware MD [source: SaMD Draft §4.2.1]
- **3.4** AI/ML systems — static (locked) vs adaptive (continuous learning, triggers ACP)
- **3.5** Combination products (drug+device) — primary mode of action determines pathway
- **3.6** In-Vitro Diagnostic devices (IVDs) — Chapter II Rule 4(2) MDR-2017; separate classification table
- **3.7** Accessories (when treated as separate device) — defined in S.O. 648(E); needs separate license unless declared part of parent device's DMF [FAQ §60-64]
- **3.8** Implants — typically Class C or D per First Schedule
- **3.9** Wellness devices (exempt from MDR) — "soothing or general wellness" massagers explicitly NOT regulated; clinical-purpose ones are [FAQ §51]; fitness/wellness software exempt unless it meets MD definition [FAQ §68]

---

# PART II — PERSONA × STAGE JOURNEYS

For each persona below, the section follows a standard four-part structure:

**A. Journey map** — stages from pre-development → post-market (or whatever subset applies):
1. **Pre-development** — IP filing, classification determination, predicate research
2. **Development** — design controls, QMS establishment, BIS / ISO standards selection
3. **Pre-clinical** — biocompatibility, animal studies, V&V
4. **Clinical investigation / performance evaluation** (where applicable)
5. **Pre-manufacturing** — test license, plant readiness, audit prep
6. **Manufacturing/import license** — main submission
7. **Post-market** — PSUR, PAC notifications, FSCA, retention

**B. Document inventory** — every document needed, in order, with conditional triggers (sterile / patient-contact / software / AI-ML / no-predicate / etc.).

**C. ClearPath question coverage** — which existing intake, Tier A, Tier B, or pitch-deck-extraction questions capture which data point.

**D. Gap analysis** — what data is needed but not captured today, with recommended new questions for Sprint 3+ roadmap input.

---

## 4. Persona: Medical device manufacturer (hardware)

The canonical CDSCO regulatee — a company manufacturing a physical instrument, implant, apparatus, or appliance intended for human use under one of MDR-2017's intended-use definitions [source: S.O. 648(E) dated 11.02.2020 brought all medical devices under MDR-2017; MD FAQ §1].

This persona has **five sub-cases** distinguished by risk class. The class determines the licensing authority, the application form, and when site audit happens:

| Sub-case | Class | Authority | Form pair | Audit timing |
|---|---|---|---|---|
| 4.1 | A non-sterile non-measuring | SLA registration only | None (portal registration) | None [FAQ §69-71, §81(i)] |
| 4.2 | A (measuring or sterile) | SLA | MD-3 → MD-5 | Within 120 days post-grant by Notified Body [IVD FAQ §97 — pattern same for MD] |
| 4.3 | B | SLA | MD-3 → MD-5 | Within 90 days of application by Notified Body [IVD FAQ §97] |
| 4.4 | C | CLA | MD-7 → MD-9 | Within 60 days of application by MD Officer team [FAQ §27, §81(ii)] |
| 4.5 | D | CLA | MD-7 → MD-9 | Same as Class C with heightened essential-principles and clinical-evidence scrutiny |

Cross-cutting overlays that escalate documents regardless of class:
- **Sterility** triggers sterilisation-validation documents (DMF §8.14)
- **Patient-contact** triggers biocompatibility data (DMF §8.11)
- **Drug content** triggers medicinal-substances data (DMF §8.12); possible DCG(I) joint review
- **Veterinary use** triggers DAHD NOC [Addendum FAQ §1-2]
- **Radioactivity** triggers BARC NOC; AERB approval before patient use [Addendum §7]
- **No predicate** triggers MD-26 → MD-27 permission BEFORE manufacturing license [Addendum §19]

---

### 4.A Journey map

**Stage 1 — Pre-development (typically months 1-3).**
- Determine intended-use statement — the foundation of every subsequent classification decision [FAQ §50; SaMD Draft §4.3 lists the 7 elements: medical purpose, disease/condition, patient population, intended user, environment, contraindications, software function]
- Determine risk classification by looking up CDSCO published list; if device not listed, file separate request with CLA [FAQ §78]
- Predicate device research (Rule 51 substantial equivalence)
- IP filing decisions (independent of MDR)
- *Class A non-sterile non-measuring: most of stages 2-6 collapse into a single portal registration — skip to Stage 6.*

**Stage 2 — Development (months 3-12).**
- Design controls per ISO 13485
- QMS establishment per Fifth Schedule MDR-2017
- Standards selection — BIS mandatory if available; else ISO/IEC; else pharmacopoeial; else validated manufacturer standard [FAQ §25-26]
- Plant Master File (Appendix I, Fourth Schedule) preparation
- Device Master File (Appendix II, Fourth Schedule) preparation
- Risk management per ISO 14971

**Stage 3 — Pre-clinical (months 6-15, parallel with Stage 2).**
- Biocompatibility testing if patient-contact (ISO 10993 series; DMF §8.11)
- Animal studies if applicable (DMF §8.16)
- Verification & validation of finished device
- Stability — real-time + accelerated; accelerated acceptable provisionally with concurrent real-time ongoing [FAQ §34, §37]
- Sterilization validation if applicable (DMF §8.14)
- Batch release: minimum 3 consecutive batches' Certificate of Analysis required [MD-7 checklist §8.20]

**Stage 4 — Clinical investigation (conditional).**

Only required if device meets the *investigational MD* definition: no predicate, or licensed device with new intended use / new population / new material / major design change [FAQ §112; SaMD Draft §4.1.6]. Path:
- Obtain MD-13 test license to manufacture clinical batches (or MD-17 to import)
- Obtain MD-27 permission to manufacture/import for marketing
- If clinical evidence inadequate, obtain MD-23 permission to conduct CI, complete pilot + pivotal studies per Seventh Schedule [Addendum FAQ §19]
- See [§9 Clinical investigation researcher (medical device)](#9-persona-clinical-investigation-researcher-medical-device) for full detail.

**Stage 5 — Pre-manufacturing (typically months 9-18).**
- Plant readiness (Annexure A of Fifth Schedule environmental requirements)
- Personnel qualification — competent technical staff per Fourth Schedule
- Internal audit completion
- Test license MD-13 if not already obtained (recommended even when not strictly required, for QC data generation) [FAQ §59]
- For Class C/D: prepare for MD Officer inspection within 60 days of application [FAQ §27]
- For Class B: prepare for Notified Body QMS audit within 90 days of application
- For Class A measuring/sterile: prepare for post-grant Notified Body audit within 120 days

**Stage 6 — Manufacturing license submission.**
- Class A non-sterile non-measuring: portal registration at `cdscomdonline.gov.in` → system-generated number. No fee, no audit prior to grant. Must still comply with labelling (Chapter VI) and applicable standards [FAQ §69-71].
- Class A (measuring or sterile) + Class B: MD-3 to **State Licensing Authority** → MD-5 grant.
- Class C + D: MD-7 to **Central Licensing Authority (CDSCO HQ / Zonal)** → MD-9 grant.

**Stage 7 — Post-market (ongoing).**
- PMS submission per Sixth Schedule [FAQ §30]
- PSUR for novel devices — 6-monthly first 2 years, annual next 2 years from launch [FAQ §126]
- PAC notifications for major changes (45-day mfg / 60-day import deemed-approval) and minor changes (30-day post-implementation notification) [FAQ §136-137]
- Retention every 5 years (perpetual validity in between) [FAQ §55]
- SUSAR notification within 15 days [SaMD Draft §4.13.3 — same rule applies to MD generally per Sixth Schedule]
- License perpetually valid till suspension/cancellation [FAQ §55]

---

### 4.B Document inventory

Documents are listed grouped by where they appear in the submission, with the originating checklist source.

**Block 1 — Legal documentation (every class except A non-sterile non-measuring).**
| # | Document | Source |
|---|---|---|
| 1 | Covering letter | MD-7 checklist §1.0; MD-3 checklist §1.0 |
| 2 | Application form (MD-3 or MD-7) | MD-7 §2.0; MD-3 §2.0 |
| 3 | Fee challan (Second Schedule MDR-2017) | All checklists §3.0 |
| 4 | Constitution of the firm | MD-7 §4.0 |
| 5 | Establishment / site ownership / tenancy agreement | MD-7 §5.0 |

**Block 2 — Plant Master File (Appendix I, Fourth Schedule MDR-2017).**
| Sub | Section |
|---|---|
| 6.1 | General facility info |
| 6.2 | Personnel org chart |
| 6.3 | Personnel qualifications & responsibilities |
| 6.4 | Premises & facilities |
| 6.5 | Plant layout (scaled) |
| 6.6 | Equipment & instruments |
| 6.7 | Sanitation |
| 6.8 | Production |
| 6.9 | Quality Assurance |
| 6.10 | Storage |
| 6.11 | Documentation procedures |

**Block 3 — Quality Management System (Fifth Schedule).**
| Sub | Section |
|---|---|
| 7.1 | Fifth Schedule compliance undertaking |
| 7.2 | Quality Manual |
| 7.3 | Control of Documents |
| 7.4 | Control of Records |
| 7.5 | Management Responsibility |
| 7.6 | Resource Management |
| 7.7 | Control of Production & Service Provision |
| 7.8 | Internal Audit System |
| 7.9 | Control of Non-conforming Product |
| 7.10 | CAPA |
| 7.11 | Environmental requirements table (Annexure A, Fifth Schedule) |

**Block 4 — Device Master File (Appendix II, Fourth Schedule MDR-2017).**
| Sub | Section | Conditional? |
|---|---|---|
| 8.1 | Executive Summary | Always |
| 8.2 | Descriptive information | Always |
| 8.3 | Medical Device Grouping justification | Always |
| 8.4 | Product specification (variants, accessories) | Always |
| 8.5 | Substantial equivalence with predicate | Always (or marked N/A with rationale if no predicate, but then MD-27 path required) |
| 8.6 | Labelling information (labels, IFU, brochure) | Always |
| 8.7 | Device design & manufacturing information | Always |
| 8.8 | Essential Principles conformity checklist | Always |
| 8.9 | Risk analysis & control summary | Always |
| 8.10 | Verification & validation | Always |
| 8.11 | Biocompatibility validation data | **If patient-contact** |
| 8.12 | Medicinal substances data | **If device contains drug** |
| 8.13 | Biological safety | **If applicable (biologics, tissue-derived)** |
| 8.14 | Sterilization validation | **If sterile** |
| 8.15 | Software V&V | **If software used** |
| 8.16 | Animal preclinical | **If any** |
| 8.17 | Stability data (real-time + accelerated) | Always |
| 8.18 | Clinical evidence | **If any** (mandatory if no predicate) |
| 8.19 | PMS data (vigilance reporting) | Always for renewals; "if any" for first application |
| 8.20 | Batch release certificates (≥3 consecutive) / Software version release certificate | Always |

**Block 5 — Conditional regulatory NOCs.**
| Trigger | Document |
|---|---|
| Veterinary use | DAHD NOC (Department of Animal Husbandry, Dairying and Fisheries) [Addendum FAQ §1-2; IVD FAQ §53(a)] |
| Radioactive content (Radio Immuno Assay or similar) | BARC NOC [IVD FAQ §53(c); Addendum §7 for ionising-radiation MDs requiring AERB] |
| Prenatal diagnostic | PNDT department NOC [IVD FAQ §53(d)] |
| Drug content | DCG(I) consultation; if drug not pre-approved → full toxicology dossier [MD-26 checklist §11-12] |

**Block 6 — Inter-form dependencies.**
| Item | Required when |
|---|---|
| MD-13 test license (with appendix attachment) | If you used a test license to generate QC data [MD-7 checklist §10.0] — recommended for any novel device |
| MD-27 permission | **Mandatory** if no predicate exists [MD-7 checklist §11.0] |
| MD-23 CI permission | Conditional inside the MD-27 path, when clinical evidence is inadequate [Addendum FAQ §19] |

**Class-specific variations.**

- **4.1 Class A non-sterile non-measuring (self-notification):** All of Blocks 1-6 are exempt. Only portal registration with manufacturer details, device description, label, IFU, applicable standards declaration. No fee, no audit prior to grant. [FAQ §69-73]
- **4.2 Class A measuring/sterile:** Full Blocks 1-6 via MD-3 to SLA. NB audit within 120 days post-grant (no audit pre-grant).
- **4.3 Class B:** Full Blocks 1-6 via MD-3 to SLA. NB audit within 90 days of application (pre-grant).
- **4.4 Class C:** Full Blocks 1-6 via MD-7 to CLA. CDSCO MD Officer team inspection within 60 days of application (pre-grant).
- **4.5 Class D:** Same as 4.4 plus heightened scrutiny. Clinical evidence (DMF §8.18) effectively mandatory even with predicate. Essential Principles checklist examined line-by-line.

---

### 4.C ClearPath question coverage

ClearPath's current question set (intake + Tier A Q1-Q7 + Tier B B1-B6 + C1-C2 + pitch-extract) provides partial-to-strong coverage of the hardware MD manufacturer journey:

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Intended use statement | Intake `one_liner` (20-300 chars); Tier B B1 (2-4 sentences textarea, required); Pitch-extract `intended_use_one_liner` | **Strong** — three layers |
| Risk class (A/B/C/D) | Pitch-extract `suggested_classification`; derived from Tier A Q1 (clinical state) + Q2 (decision influence) via SaMD significance×situation matrix | **Medium** — derivable but not directly asked of Tier A users; explicit only for AI-extracted Tier 2 |
| User type (HCP / patient / both / admin) | Tier A Q3 | **Strong** |
| Sterile (yes/no) | Pitch-extract `product_meta.sterile` only | **Weak** — relies on deck; no wizard question |
| Patient-contact type | Not asked anywhere | **None** |
| Drug content / combination product | Not asked | **None** |
| Predicate devices | Tier B B3 (up to 3, picker) | **Strong** — Tier 2 only |
| Year-1 users | Tier A Q4 — for DPDP SDF classification | **Strong for DPDP**, not core MDR |
| ABDM/HIS integration | Tier A Q5 | **Strong** — informs ABDM consent path |
| Data types (PHI / imaging / genomic / prescription / insurance) | Tier A Q6 (multi-select) | **Strong** |
| Commercial stage | Tier A Q7 | **Strong** |
| ISO 13485 status | Tier B B6 (certified / in_progress / not_started / N/A) | **Strong** — Tier 2 |
| Clinical evidence status | Tier B B5 (none / pilot_data / published_study / multi_center_trial) | **Strong** — Tier 2 |
| Risks & mitigations | Tier B B4 (top 3 pairs) | **Strong** — Tier 2 |
| Use environment | Tier B B2 (home/opd/inpatient/surgical/pre_hospital/mixed); Pitch-extract `product_meta.setting_of_use` | **Strong** |
| Patient population | Pitch-extract `product_meta.patient_population` | **Medium** — AI extract only |
| User population | Pitch-extract `product_meta.user_population` | **Medium** — AI extract only |
| Software lifecycle | Tier B C1 (waterfall / agile / hybrid / N/A) — only if software present | **Strong** when applicable |
| Cybersecurity posture | Tier B C2 — only if identifiable PHI | **Strong** when applicable |
| Company legal name / constitution / CIN / addresses | Pitch-extract `company.*` | **Medium** — AI extract only |
| Founded year / team size | Pitch-extract `company.founded_year`, `team_size` | **Medium** |

---

### 4.D Gap analysis

**Critical gaps (blocking MDR-2017 submission; data needed but ClearPath does not capture):**

1. **Sterilisation mode.** DMF §8.14 requires the specific method (EtO / steam / radiation / aseptic). Pitch-extract only captures "Sterile / Non-sterile" binary.
   - *Recommended Sprint 3 question (Tier B conditional, triggers when pitch-extract or Tier B says sterile):* "How is your device sterilised? (EtO / Steam autoclave / Gamma radiation / Aseptic processing / Other)"

2. **Patient-contact type.** ISO 10993 biocompatibility tier (DMF §8.11) requires surface / mucosal / blood / invasive-transient / invasive-long-term / implant determination.
   - *Recommended Sprint 3 question (Tier B core):* "Does your device contact the patient's body? Select the deepest type." (radio: no_contact / surface_intact_skin / surface_mucosal / blood_path_indirect / blood_path_direct / invasive_transient_lt_24h / invasive_long_term_30d / implant_gt_30d)

3. **Drug / biological content (combination product flag).** Triggers DMF §8.12 + possibly DCG(I) joint review.
   - *Recommended Sprint 3 question (Tier B core):* "Does your device contain, release, or pre-load a drug, biological, or pharmacologically active substance?" (yes_approved_drug / yes_novel_drug / no / unsure)

4. **Veterinary intended use.** Triggers DAHD NOC.
   - *Recommended Sprint 3 question (Tier A or Tier B):* "Is this device intended for use on animals?" (humans_only / animals_only / both)

5. **Ionising radiation / radioactive content.** Triggers BARC NOC + AERB compliance.
   - *Recommended Sprint 3 question:* "Does your device emit ionising radiation or contain radioactive sources?" (yes/no/unsure)

6. **Predicate existence (binary).** Tier B B3 collects up to 3 named predicates but doesn't ask whether *any* predicate exists. Tier A users have no question on this. Critical because no-predicate → MD-26/27 path required.
   - *Recommended Sprint 3 question (Tier A early, Q-zero):* "Is there a similar device already approved in India?" (yes_indian / yes_only_foreign / no / not_sure)

7. **Manufacturing location split.** Pitch-extract captures address but doesn't classify as indigenous vs imported, which determines MD-3/7 vs MD-14 path.
   - *Recommended:* derive from `company.manufacturing_address` if confidently parseable; else add explicit radio "Manufactured in: India / Imported / Both".

**Medium gaps (would strengthen Draft Pack):**
- Specific Notified Body assignment (CDSCO assigns; applicant cannot choose [FAQ §83-84]) — not capturable as a *question* but worth noting
- Existing BIS / IEC / ISO certificates beyond ISO 13485 — could be a multi-select
- Stability data status (real-time available vs accelerated only) — affects whether provisional shelf life acceptable [FAQ §34]

**Low-priority gaps (defer to Sprint 4+):**
- Spare parts inventory (covered indirectly by DMF §8.4)
- Custom-made device flag (niche use case)
- Export-only flag (only matters for Indian-mfg-for-export-only declaration [FAQ §86-87])

---

## 5. Persona: SaMD founder

A SaMD founder builds **standalone software intended to perform a medical purpose without being part of a hardware medical device** [SaMD Draft §4.2.2]. The product is software-only: a mobile app, web app, cloud service, or desktop tool that diagnoses, screens, monitors, predicts, or recommends. The hardware-only documents (sterilisation, biocompatibility, animal studies) drop out; **software-specific documents become the centre of gravity**.

**The Oct 2025 Draft Guidance Document on Medical Device Software is the authoritative reference** for this persona. Until finalised after stakeholder comments, every claim here is `DRAFT GUIDANCE` — current practice but not yet locked rule.

This persona has **four sub-cases** distinguished by SaMD class, plus two overlays:

| Sub-case | SaMD class | Determined by | Form pair | Audit |
|---|---|---|---|---|
| 5.1 | Class A | Significance × situation matrix puts at A (e.g., Inform clinical management for serious or non-serious condition) | MD-3 → MD-5 (SLA) | NB audit post-grant or within 90 days |
| 5.2 | Class B | E.g., Drive clinical management for serious; or Inform for critical | MD-3 → MD-5 (SLA) | NB audit within 90 days of application |
| 5.3 | Class C | E.g., Treatment/diagnosis for serious; Drive for critical | MD-7 → MD-9 (CLA) | MD Officer inspection within 60 days |
| 5.4 | Class D | Treatment/diagnosis for critical situation/condition | MD-7 → MD-9 (CLA) | Same as Class C, max scrutiny |

Overlays applicable to ALL four sub-cases:
- **5.5 Oct 2025 SaMD-specific document overlay** — software description, SRS, SDS, architecture diagrams, V&V, traceability, version control, cybersecurity verification, ACP if AI/ML
- **5.6 Standards conformance** — IEC 62304 (lifecycle), ISO 14971 (risk), IEC 81001-5-1 (cybersecurity), IEC 62366-1 (usability), and IS 16124, IS/IEC 82304-1 [SaMD Draft §4.5]

> **Note on SaMD classification.** Most SaMD that *informs* clinical management for *non-serious* or *serious* situations lands at Class A; SaMD that *treats or diagnoses* in a *critical* situation lands at Class D. The full matrix is in [§2.2](#2-device-classification-foundation) and is reproduced visually in the SaMD Draft §4.4.1 Table 2. Also note the override: "SaMD intended for non-clinical users in a serious situation, without support from specialised professionals, may be considered as used in a critical situation" — i.e. consumer-facing serious-condition apps are pushed up a class [SaMD Draft §4.4.1 Note].

---

### 5.A Journey map

**Stage 1 — Pre-development (months 1-3).**
- Write intended-use statement covering all 7 SaMD-Draft elements: medical purpose / disease or condition / patient population / intended user / use environment / contraindications / software function (inputs, outputs, role in workflow) [SaMD Draft §4.3]
- Apply situation×significance matrix to estimate class (definitive class confirmed by CDSCO on review)
- Identify whether software qualifies as "medical device" at all — exclusions include HIS, LIS, IMS, generic comms, encryption-only, performance-monitoring [SaMD Draft §4.2.3]
- Check if device falls in `not regulated` category (wellness, fitness, scheduling, billing) — SaMD Draft §4.2.3 lists these explicitly

**Stage 2 — Development (months 3-9 typical for SaMD; can be faster than hardware).**
- Establish QMS covering entire software lifecycle (design, dev, planning, configuration, deployment, maintenance) [SaMD Draft §4.6]
- Conform to IEC 62304 (software lifecycle processes) — required and explicitly listed in SaMD Draft §4.5
- Conform to ISO 14971 (risk management) with software-specific guidance from IEC/TR 80002-1
- Conform to IEC 81001-5-1 (cybersecurity)
- Conform to IEC 62366-1 (usability / man-machine interface ergonomics)
- For AI/ML: also ISO/IEC 23894 (AI risk management), ISO/IEC 42001 (AI management system), ISO 24291 (ML in imaging if applicable)
- Build SRS (Software Requirement Specifications) and SDS (Software Design Specifications) [SaMD Draft §4.12.2.E]
- Architecture diagrams: state diagrams, flow charts, module-level depiction [SaMD Draft §4.12.2.E]

**Stage 3 — Pre-clinical (parallel with Stage 2).**
- No biocompatibility, no animal studies (typically — animal not applicable unless veterinary SaMD)
- V&V activities: functional, integration, system, regression
- Cybersecurity threat modeling + V&V of controls
- Software traceability matrix (requirements → design → code → tests → release)
- Stability testing for software: re-validate on each operating system / hardware platform combination supported
- Real-world data / simulated-environment testing prior to release [SaMD Draft §4.12.2.G]

**Stage 4 — Clinical investigation (conditional).**

For SaMD, "clinical evidence" can be a mix of (a) technical performance validation, (b) clinical performance validation, and (c) clinical association/scientific validity [SaMD Draft §4.12.2.H]. Indirect benefit pathways are explicitly recognised — e.g., timely care, reduced cognitive errors, earlier diagnosis are acceptable clinical-benefit framings.

If the SaMD is an Investigational MD (no predicate, or new claim on a predicate), follow Stage 4 of §4 — same MD-13/26/27/22/23 sequence. See [§9](#9-persona-clinical-investigation-researcher-medical-device).

**Stage 5 — Pre-manufacturing / pre-marketing.**
- Test license MD-13 (manufacture) submitted via **NSWS portal** (`nsws.gov.in`), not the cdscomdonline portal [SaMD Draft §4.9, §3.0]
- "Number of installations / number of copies / number of downloads" is acceptable as the "quantity" field for test license application [SaMD Draft §4.9 Note]
- Plant Master File becomes Site Master File for SaMD — outlines infrastructure (equipment, info networks, tools, physical facility supporting dev/production/maintenance) [SaMD Draft §4.12.1]
- Organisation chart + personnel qualifications

**Stage 6 — Manufacturing license submission.**
- Class A non-sterile non-measuring path is rarely applicable to SaMD (because non-measuring SaMD typically does *inform* clinical management → at least Class A in the situation×significance matrix; but conceptually a SaMD could be a non-measuring wellness adjunct that happens to qualify). When applicable: portal registration only.
- Class A measuring/Class B SaMD: MD-3 → MD-5 to SLA
- Class C/D SaMD: MD-7 → MD-9 to CLA
- All applications submit through `cdscomdonline.gov.in` (the MD online portal — distinct from NSWS used only for test licenses) [SaMD Draft §3.0]

**Stage 7 — Post-market.**
- All hardware-persona obligations apply (PMS, PSUR, PAC, retention) — plus:
- Software version updates require PAC notification — minor changes (bug fixes, security patches not affecting safety/performance/intended use) need only notification within 30 days; major changes need prior approval [SaMD Draft §4.13.2]
- ACP-approved changes for AI/ML SaMD: notification submitted for review prior to implementation; PAC approval mandatory for major changes; PAC notification for minor [SaMD Draft §4.13.2 Note]
- FSCA (Field Safety Corrective Action) initiation for software bugs, cyber alerts, patches [SaMD Draft §4.12.3]
- SUSAR within 15 days of license-holder becoming aware [SaMD Draft §4.13.3]
- Indirect harm tracking — explicitly called out as a SaMD-unique risk; bias in clinical decision-making counts as indirect harm requiring surveillance [SaMD Draft §4.D]

---

### 5.B Document inventory

Reuses the §4 backbone but with software-specific overlays. Each block notes what differs from the hardware persona.

**Block 1 — Legal documentation.** Same as §4.B Block 1 with one substitution: Site Master File (not Plant Master File for facilities that don't have manufacturing in the physical-device sense). PoA + apostille for importers.

**Block 2 — Site / Plant Master File.** Per SaMD Draft §4.12.1: infrastructure description includes equipment, information networks, tools, physical facility supporting **development, production, maintenance** of the software. Organisation chart + personnel qualifications. Any inapplicable Appendix-I item must include rationale for non-applicability.

**Block 3 — QMS.** Same Fifth Schedule structure. Notable software-specific additions: design-control evidence per IEC 62304; configuration management; software-release procedures.

**Block 4 — Device Master File (software-specific elements per SaMD Draft §4.12.2):**

| Sub | Section | Note |
|---|---|---|
| 8.1 | Executive Summary — device description, intended use, specifications including variants | Plus software/firmware description block: name, version (with version-field naming convention statement), language/compiler, hardware platform, OS, COTS use, SDLC description |
| 8.2 | Descriptive information including intended user, intended patient population, intended use environment, contraindications | |
| | (Cont.) Analysis methodology (rule-based / online test admin / AI/ML / neural networks / fixed or adaptive algorithms) | Triggers ACP if adaptive |
| | (Cont.) Role and contribution to clinical decision (autonomous / supervised autonomy / non-autonomous) | |
| | (Cont.) Software inputs/outputs, source of inputs, interoperability specs, output targets, data flow, networked behaviour, cloud usage | |
| 8.3 | Grouping justification | |
| 8.4 | Product specification | |
| 8.5 | Substantial equivalence with predicate — software characteristics including type of algorithm (self-trainable, passive, ML-based, procedural), platforms, output nature, target user, training models used | [SaMD Draft §4.12.2.B] |
| 8.6 | Labelling — for software without physical form: electronic IFU acceptable; landing-page display of regulatory info; app-store screenshot; version-display in UI splash screen | [SaMD Draft §4.12.2.I] |
| 8.7 | Device design — Architecture diagrams (state diagrams, flow charts, modules), SRS, SDS | [SaMD Draft §4.12.2.E] |
| 8.8 | Essential Principles conformity (with software-specific Essential Principles per SaMD Draft §4.12.2.C — state of art development, mobile platform considerations, IT security minimum requirements) | |
| 8.9 | Risk analysis & control summary — including indirect harms (bias in clinical decision-making) | [SaMD Draft §4.12.2.D] |
| 8.10 | V&V — including cybersecurity risk controls verified prior to implementation; evidence of validation in finished device | [SaMD Draft §4.12.2.G] |
| 8.11 | Biocompatibility | Typically **N/A** for SaMD — submit rationale for non-applicability |
| 8.12 | Medicinal substances | **N/A** for SaMD unless combination product |
| 8.13 | Biological safety | Typically **N/A** for SaMD |
| 8.14 | Sterilization | **N/A** for SaMD |
| 8.15 | Software V&V | **Always required for SaMD** — far more detailed than hardware-MD version of this field |
| 8.16 | Animal preclinical | Typically **N/A** for SaMD |
| 8.17 | Stability | Re-interpret as re-validation on each supported platform/OS combination; document |
| 8.18 | Clinical evidence | Acceptable forms: technical standards, literature, professional society guidelines, systematic review, clinical investigation, published clinical data, secondary analysis [SaMD Draft §4.12.2.H] |
| 8.19 | PMS data | Mandatory for renewals |
| 8.20 | Software version release certificate / Software version release note / Software release report | **Required for software in every submission** [SaMD Draft Annexure A item 8.20 of Class C/D checklist] |

**Block 5 — Conditional regulatory NOCs.**
- DAHD NOC if veterinary SaMD
- DPDP Act 2023 + CERT-In Safe-to-Host certificate if storing identifiable Indian health data (especially for ABDM-integrating SaMD) — note this is *adjacent* regulation, not MDR-2017, but Indian-deployed SaMD must comply

**Block 6 — Inter-form dependencies.** Same MD-13 (or MD-17) → MD-26 → MD-27 → MD-3/7 sequence as hardware-MD §4, when SaMD is investigational (no predicate) or claims new use/population/material/major design change.

---

### 5.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Software-only flag | Pitch-extract `suggested_wizard_answers.device_class` ∈ {samd_class_a_b, samd_class_c_d} | **Medium** — derivable but binary; AI-extract only |
| SaMD class (A/B/C/D) | Pitch-extract `suggested_classification` + `suggested_wizard_answers.device_class`; derivable from Tier A Q1+Q2 | **Medium** — AI suggested but not directly asked |
| Significance × situation matrix inputs | Tier A Q1 (clinical state) + Q2 (decision influence) — exactly the two axes of the SaMD matrix | **Strong** — perfect alignment |
| AI/ML presence and type (static / adaptive) | Pitch-extract `suggested_wizard_answers.ai_ml` ∈ {none, static, adaptive} | **Strong** — AI-extract |
| Software lifecycle model | Tier B C1 (waterfall / agile / hybrid / N/A) | **Strong** — Tier 2 |
| Cybersecurity posture | Tier B C2 — only if identifiable PHI | **Strong** when applicable |
| Data sensitivity | Pitch-extract `suggested_wizard_answers.data_sensitivity` ∈ {none, deidentified, identifiable}; Tier A Q6 data types | **Strong** |
| Intended use detail | Intake one-liner + Tier B B1 + pitch-extract | **Strong** (3 layers) |
| Use environment | Tier B B2 + pitch-extract `setting_of_use` | **Strong** |
| Intended user | Tier A Q3 + pitch-extract `user_population` | **Strong** |
| Intended patient population | Pitch-extract `patient_population` | **Medium** — AI only |
| Predicate / no-predicate | Tier B B3 (Tier 2 only); not asked in Tier A | **Weak for Tier A** |
| Clinical evidence | Tier B B5 | **Strong** — Tier 2 |
| ISO 13485 status | Tier B B6 | **Strong** — Tier 2 |
| Cloud / network deployment | Not asked | **None** |
| COTS / off-the-shelf components | Not asked | **None** |
| Mobile platform / hardware targets | Not asked | **None** |
| Networked / interoperable behaviour | Tier A Q5 (ABDM/HIS) covers integration broadly; specific interface partner not asked | **Weak** |
| Algorithm type / training data details | Not asked | **None** |
| Version control system / SDLC artefacts | Not asked | **None** |

---

### 5.D Gap analysis

**Critical gaps (blocking SaMD-specific MDR-2017 submission):**

1. **Deployment mode** — affects label, IFU electronic-vs-physical decision, V&V scope, cybersecurity.
   - *Recommended Sprint 3 question (Tier B core, only when device is SaMD):* "How is your software delivered to users?" (multi-select: cloud_saas / web_app / mobile_app_android / mobile_app_ios / desktop_installed / embedded_in_hardware / api_only)

2. **AI/ML algorithm specifics** — when AI/ML present, ACP requirement and DMF §8.5 substantial-equivalence demand: algorithm type, training data sources, intended deployment scope, change autonomy.
   - *Recommended Sprint 3 question (Tier B conditional, triggers when ai_ml ≠ none):* "Describe your model and training data" — multi-field block with: model type (rule-based / classical ML / deep learning / LLM / hybrid), training data size (orders of magnitude), data sources (publicly available / customer / partner / synthetic), retraining frequency (never / annual / quarterly / monthly / continuous), region of training (India / IMDRF country / mixed).

3. **Algorithm Change Protocol elements** — five ACP components per SaMD Draft §4.2.D not captured at all.
   - *Recommended Sprint 4 questions (Tier B conditional, triggers when ai_ml = adaptive):* five mini-questions on data-management plan / performance monitoring plan / retraining plan / update plan / rollback plan. Each as a textarea with "Have you defined this? Describe in 2-3 sentences." Lower priority than #2.

4. **Predicate device existence (Tier A binary)** — same gap as §4.D #6 but more acute for SaMD because most novel SaMD are no-predicate.
   - *Recommended Sprint 3 question (Tier A, possibly inserted as Q0 or Q8):* "Is there a similar software product already approved in India?" Same options as §4.

5. **Cloud / data residency** — affects DPDP Act overlay and CERT-In audit requirements.
   - *Recommended Sprint 3 question (Tier B conditional, triggers when deployment_mode includes cloud or saas):* "Where is patient data physically stored?" (india_only / india_plus_specified_countries / outside_india)

6. **Software autonomy degree** — required by SaMD Draft §4.12.2.A: autonomous / supervised autonomy / non-autonomous.
   - *Recommended Sprint 3 question (Tier B core for SaMD):* "Does your software act on its outputs without human review?" (autonomous_acts_directly / supervised_clinician_approves / non_autonomous_advisory_only). Note this is similar to Tier A Q2 but more software-specific.

**Medium gaps:**
- IEC 62304 software safety class (A / B / C) — different from MDR class
- Cybersecurity controls inventory (encryption-at-rest, encryption-in-transit, auth methods, role-based access) — Tier B C2 captures broadly, but not granular
- Version-control system in use (Git / SVN / other) — DMF §8.7 traceability

**Low-priority gaps:**
- Off-the-shelf component inventory (per SaMD Draft §4.12.2.A but rarely a top rejection driver)
- Interoperability standards used (HL7 / FHIR / DICOM / X12)
- Specific OS / hardware support matrix (often in IFU rather than DMF)

---

## 6. Persona: AI/ML system developer

This persona is a **SaMD founder with AI/ML inside**. Treat this as an overlay on [§5](#5-persona-samd-founder) — everything in §5 applies, plus the additional AI/ML-specific obligations below. The most material distinction is **static vs adaptive** algorithm change behaviour, which determines whether an **Algorithm Change Protocol (ACP)** is required.

| Sub-case | What it means | ACP required? | Key consequence |
|---|---|---|---|
| 6.1 | Static AI/ML — locked algorithm; weights frozen at release | **No** | Any retraining is a major Post-Approval Change requiring CDSCO prior approval [SaMD Draft §4.13.2] |
| 6.2 | Adaptive AI/ML — model retrains / learns post-deployment | **Yes** | ACP submitted as part of Risk Management File; approved changes can be implemented under the ACP protocol with notification, not full PAC re-submission [SaMD Draft §4.2.D Note] |

> **`DRAFT GUIDANCE` flag.** ACP itself is a concept introduced in the Oct 2025 Draft. **`UNCERTAIN: bridge regime — what enforcement applies to AI/ML SaMD between now and finalisation of the draft?`** Founders shipping AI/ML SaMD now should follow ACP best practices anticipating finalisation, but consult CDSCO for the current acceptable submission posture.

---

### 6.A Journey map

All seven stages of §5 apply. AI/ML-specific additions per stage:

**Stage 1 — Pre-development.**
- Explicit decision on static vs adaptive at the intended-use stage. This decision is hard to reverse — Pitch-extract `suggested_wizard_answers.ai_ml = "adaptive"` only if deck explicitly says model retrains/learns post-deployment, otherwise default to static.
- Determine "domain of learning" if adaptive — international / national / regional / patient-specific / site-specific [SaMD Draft §4.12.2.A.j.ii]

**Stage 2 — Development.**
- Standards conformance escalation: ISO/IEC 23894 (AI risk management) + ISO/IEC 42001 (AI management system) + ISO 24291 (ML in imaging if applicable) [SaMD Draft §4.5]
- Bias detection in training data — documented during dataset curation
- Reference standards / benchmarks selection — explicitly documented "decisions for selecting specific datasets, reference standards, parameters and metrics to justify validation processes" [SaMD Draft §4.D]

**Stage 3 — Pre-clinical.**
- External validation on dataset(s) **disjoint** from training set
- Subgroup performance analysis (age, gender, ethnicity, disease severity) — surfaces bias
- Adversarial / edge-case testing

**Stage 4 — Clinical investigation.**
- More likely to be an Investigational MD (most novel AI/ML SaMD have no predicate) → MD-26/27 path
- Indian-population data may be required even if regulatory approval exists in IMDRF countries [for IVD specifically per IVD FAQ §58; for medical-device AI/ML SaMD this is `UNCERTAIN: confirm whether CLA invokes the same in-country requirement under Rule 36 / Rule 51`]

**Stage 5 — Pre-marketing.**
- For adaptive AI/ML: ACP must be finalised before MD-7 or MD-14 submission (because ACP is part of Risk Management File submitted with DMF §8.9)

**Stage 6 — Submission.**
- Same as §5 plus ACP attachment

**Stage 7 — Post-market.**
- ACP-approved changes: notification (not full PAC) [SaMD Draft §4.13.2 Note]
- Performance drift monitoring per ACP §(b) — assessment metrics, statistical analysis plan, frequency, targets
- Indirect harm tracking — bias in clinical decision-making explicitly called out [SaMD Draft §4.D]
- FSCA initiation for model failure / drift exceeding tolerance

---

### 6.B Document inventory

All §5.B blocks apply. Additions specific to AI/ML:

**Block 4 — DMF additions (specific items):**

| Sub | Additional content for AI/ML |
|---|---|
| 8.1 Software description | Analysis methodology: explicitly state "AI/ML — neural networks — fixed algorithm" or "AI/ML — neural networks — adaptive algorithm" or similar [SaMD Draft §4.12.2.A.g] |
| 8.5 Substantial equivalence | Algorithm type details — whether self-trainable / passive / ML-based / procedural; training models used; reference standards for benchmarking [SaMD Draft §4.12.2.B] |
| 8.9 Risk management | Indirect harms — bias in clinical decision-making explicitly documented; process for identification and analysis of indirect harms iteratively over total product lifecycle [SaMD Draft §4.D] |
| 8.10 V&V | Dataset selection rationale; external validation evidence; subgroup performance |
| 8.15 Software V&V | Includes adversarial / edge-case testing |

**Block 7 — Algorithm Change Protocol (required for adaptive AI/ML only).** Five components per SaMD Draft §4.2.D:

| Component | Required content |
|---|---|
| (a) Data management plan | Data management protocol; risk assessment plan; new-data-collection protocol; QA process |
| (b) Performance evaluation and monitoring plan | Assessment metrics; statistical analysis plan; assessment frequency; performance targets; post-market monitoring overview |
| (c) Algorithm retraining plan | Retraining objectives; methods to improve performance; performance-eval approach; potential impact on intended purpose |
| (d) Software update plan | Version tracking; V&V methods; update triggers; update procedures; user-communication approach |
| (e) Rollback plan | Triggers; backup/recovery procedures; user communication |

**Block 8 — Adjacent-regulation compliance evidence (Indian-deployed AI/ML SaMD).**
- DPDP Act 2023 compliance — consent management, data principal rights, breach notification (`UNCERTAIN: enforcement-stage requirements for SDFs as of 2026-05`)
- CERT-In Safe-to-Host certificate — if integrating with ABDM
- IT Act 2000 cybersecurity — IEC 81001-5-1 verification as evidence

---

### 6.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| AI/ML present? | Pitch-extract `ai_ml` ∈ {none, static, adaptive} | **Strong** — AI extract directly captures |
| Static vs adaptive | Same field | **Strong** |
| Algorithm type (rule-based / ML / deep learning / LLM) | Not asked | **None** |
| Training data sources | Not asked | **None** |
| Training data size | Not asked | **None** |
| Bias / fairness audit completed | Not asked | **None** |
| Subgroup validation done | Not asked | **None** |
| ACP defined (5 components) | Not asked | **None** |
| Domain of learning (intl / national / regional / patient-specific / site-specific) | Not asked | **None** |
| Performance drift monitoring | Not asked | **None** |
| Cybersecurity (broad) | Tier B C2 (conditional on PHI) | **Medium** |
| DPDP / CERT-In compliance | Tier A Q5 captures ABDM (proxy for CERT-In likely) and Q6 captures data types | **Weak** — no direct DPDP/CERT-In question |

---

### 6.D Gap analysis

**Critical gaps (blocking AI/ML submission under Oct 2025 Draft):**

1. **ACP definition for adaptive AI/ML** — five elements completely uncaptured.
   - *Recommended Sprint 3 questions (Tier B conditional, triggers when ai_ml=adaptive):* Five short textareas, one per ACP component. Each 200-char max, "Describe your plan for [data management / performance monitoring / retraining / software updates / rollback] in 2-3 sentences."

2. **Algorithm type + training data** — required for DMF §8.5 substantial equivalence and §8.10 V&V.
   - *Recommended Sprint 3 question block (Tier B conditional, triggers when ai_ml ≠ none):* 4 sub-questions per [§5.D #2 — already specified above].

3. **Domain of learning (for adaptive AI/ML)** — affects regulatory scope of change-management.
   - *Recommended Sprint 4 question:* "Across what population / location does your model learn?" Five-radio. Lower priority.

4. **Subgroup validation evidence** — needed for bias / indirect-harm documentation.
   - *Recommended Sprint 3 question (Tier B conditional, triggers when ai_ml ≠ none):* "Have you validated performance across patient subgroups (age, gender, ethnicity, condition severity)?" (yes_documented / yes_pending_doc / no_planned / no_not_planned)

5. **DPDP / CERT-In overlay** — Indian-deployed AI/ML SaMD touches DPDP Act (esp. SDF designation) and possibly CERT-In Safe-to-Host.
   - *Recommended Sprint 3 question (Tier A):* "Do you have a CERT-In Safe-to-Host certificate, or are you pursuing one?" (yes / pursuing / not_required / unsure)

**Medium gaps:**
- Specific framework / library (TensorFlow / PyTorch / scikit-learn / custom) — informs reproducibility documentation
- Cloud GPU / training infrastructure provenance
- Model hosting (on-device / cloud-API / hybrid)

**Low-priority gaps:**
- Specific evaluation metrics (AUC, F1, precision-recall) — covered via free-text in ACP §(b)

---

## 7. Persona: IVD manufacturer

An IVD manufacturer makes **substances intended to be used outside human or animal bodies for the diagnosis of any disease or disorder** [IVD FAQ §6 — definition under D&C Act §3(b)(i) and the device-IVD inclusions notified from time to time]. The IVD regulatory path is structured similarly to medical-device path but with three substantive differences:

1. **Separate IVD Master File appendix** — Appendix II of Fourth Schedule per IVD FAQ §102 (NOT Appendix III as some republished checklists in SaMD Draft Annexure A state — flagged for consultant).
2. **In-country Performance Evaluation Reports (PER)** are mandatory for Class B/C/D new IVDs regardless of foreign regulatory approval [IVD FAQ §58].
3. **Different commercialisation form pair** for new IVDs: MD-28 → MD-29 (parallel to MD-26/27 for non-IVD devices).

This persona has **four primary sub-cases** by class plus several overlays:

| Sub-case | Class | Authority | Form pair (mfg) | New IVD permission | CPE permission |
|---|---|---|---|---|---|
| 7.1 | A | SLA | MD-3 → MD-5 | Only if CLA deems necessary [IVD FAQ §59] | Generally not required for Class A |
| 7.2 | B | SLA | MD-3 → MD-5 | MD-28 → MD-29 if "new" | MD-24 → MD-25 |
| 7.3 | C | CLA | MD-7 → MD-9 | MD-28 → MD-29 if "new" | MD-24 → MD-25 |
| 7.4 | D | CLA | MD-7 → MD-9 | MD-28 → MD-29 if "new" | MD-24 → MD-25 |

Definition of "new IVD" — IVD that has not been approved by CLA for marketing in India and is being tested to establish performance [IVD FAQ §69; SaMD Draft §4.1.10]. Once first applicant gets approval, it becomes a predicate for subsequent applicants.

Overlays (apply to any sub-case):
- **Veterinary IVDs** → DAHD NOC [IVD FAQ §53(a)]
- **Radio Immuno Assay Kits** → BARC NOC [IVD FAQ §53(c)]
- **Prenatal-diagnostic-related IVDs** → PNDT department NOC [IVD FAQ §53(d)]
- **Blood-bank dual-use IVDs (HIV/HBsAg/HCV)** → single license valid for both screening AND diagnostic use when manufacturer claims both on label/IFU [IVD FAQ §20]
- **Prohibited IVDs** — TB serology kits [GSR 432(E)/433(E) dt 07.06.2012, IVD FAQ §21]; Malaria antibody RDTs [GSR 1352(E) dt 23.03.2018 + GSR 1074(E) dt 30.10.2018, IVD FAQ §21]
- **NOC from DG-ICMR / NABL-accredited Lab / Govt-recognised Agency** required for certain IVDs [IVD FAQ §53(b)]

Phased mandatory-licensing timeline (key historical context for first-time-applicant founders):
- Class A & B IVDs: licensing regime from 01/10/2022 [IVD FAQ §12]
- Class C & D IVDs: licensing regime from 01/10/2023 [IVD FAQ §12]
- All currently marketed IVDs must re-register under MDR-2017 [IVD FAQ §11]

---

### 7.A Journey map

**Stage 1 — Pre-development.**
- Determine analyte / specimen / claim — exactly mirrors SaMD intended-use elements but in IVD vocabulary [SaMD Draft §4.3(h) for IVD software, same applies to IVD generally]
- Determine classification (Part II First Schedule); if unlisted, file with CLA [IVD FAQ §13]
- Establish whether device is "new IVD" (not previously approved for marketing in India) → determines whether MD-28/29 path required
- Predicate check (Rule 51 substantial equivalence)

**Stage 2 — Development.**
- IVD-specific design controls (analyte specificity, sensitivity, repeatability, reproducibility)
- IVD-specific QMS per Fifth Schedule
- Standards: BIS if available; ISO 13485; specific IVD performance standards (e.g., NIB-Noida criteria for HIV/HBsAg/HCV per IVD FAQ §60)

**Stage 3 — Pre-clinical / Performance Evaluation.**
- In-house performance evaluation (specificity, sensitivity, repeatability, reproducibility, stability) [IVD FAQ §63]
- Stability: claimed shelf-life real-time + accelerated, in-use stability, shipping stability [MD-28 checklist §20]
- For Class B/C/D **new IVD**: must conduct CPE via MD-24 → MD-25 application; CPE conducted at CMDTL or NIB/Govt-NABL lab [IVD FAQ §57]
- For HIV/HBsAg/HCV: minimum performance criteria per NIB-Noida adopted thresholds [IVD FAQ §60]:

| Analyte | ELISA / CLIA / ELFA / ECLIA / CMIA / MEIA | | Rapid Kit | |
|---|---|---|---|---|
| | Sensitivity | Specificity | Sensitivity | Specificity |
| Anti-HIV | 100% | ≥98% | 100% | ≥98% |
| HBsAg | 100% | ≥98% | 100% | ≥98% |
| HCV | 100% | ≥98% | ≥99% | ≥98% |

**Stage 4 — Clinical Performance Evaluation (CPE).**
- MD-24 → MD-25 permission required for new Class B/C/D IVDs
- Conducted at MDTL registered under Rule 83 / CMDTL / NIB / NABL-accredited lab [IVD FAQ §57]
- Three independent batches manufactured from three different lots of key raw materials (e.g., antigen, antibody) [IVD FAQ §56]
- Sample size statistically significant per protocol approved by respective MDTL [IVD FAQ §61]

**Stage 5 — Pre-manufacturing / pre-import.**
- Test license MD-13 (manufacture) / MD-17 (import) for trial-batch generation [IVD FAQ §99]
- Plant readiness, personnel qualification

**Stage 6 — License submission.**
- Class A/B (mfg): MD-3 → MD-5 to SLA
- Class C/D (mfg): MD-7 → MD-9 to CLA
- Any class (import): MD-14 → MD-15 to CLA
- New IVD (any path): MD-28 → MD-29 BEFORE mfg/import license [SaMD Draft §4.11]
- For Class B IVD import: NB audit within 90 days of application
- For Class C/D IVD import: CLA may carry out overseas-site inspection before or after grant of import license [IVD FAQ §39, §98]

**Stage 7 — Post-market.**
- Inspection during manufacturing license validity: one inspection per year [IVD FAQ §98]
- PMS, PAC notifications (Sixth Schedule)
- Major-change implementation timeline: 60 days deemed approved [IVD FAQ §33]
- Retention every 5 years
- For import: residual shelf life <60% allowed only for test license, not commercial [IVD FAQ §92]

---

### 7.B Document inventory

**Block 1 — Legal documentation.** Same as §4.B Block 1.

**Block 2 — Plant Master File** (Appendix I, Fourth Schedule MDR-2017). Same as §4.B Block 2 but for IVD-specific facility (raw-material storage with cold chain, analyte handling labs, etc.).

**Block 3 — QMS** (Fifth Schedule). Same structure, with IVD-specific Part-1 to Part-10 expansion per Class C/D IVD checklist (SaMD Draft Annexure A item M):
- 4.1-4.10 covering Quality Manual, Quality Policy, Document/Record Control, Management Responsibility, Internal Audit, Preventive/Corrective Action, Training, and Annexure A environmental requirements

**Block 4 — IVD Master File (Appendix II, Fourth Schedule MDR-2017 — IVD FAQ §102):**
- Device description (specification of raw materials and finished product, identification, IFU, labels)
- Regulatory status in other countries
- Design input, design output documents, stability data
- Device specification (specificity, sensitivity, reproducibility, repeatability)
- Product validation + software validation (for IVD software)
- Risk Management data
- Clinical Performance Evaluation data carried out in India and other countries (if any)
- Regulatory status and restriction on use in other countries
- Essential Principles checklist for IVD safety and performance
- Product Insert, Labelling, Pack Size

**Block 5 — Performance Evaluation evidence.**
- Performance Evaluation Report from MDTL registered under Rule 83 / CMDTL / NIB / NABL-accredited lab for **three batches** [MD-28 checklist §19]
- For Class B/C/D new IVD: CPE conducted in India even if foreign-approved [IVD FAQ §58]
- Stability — claimed shelf-life (≥3 lots), in-use stability (≥1 lot), shipping stability (≥1 lot) [MD-28 checklist §20]
- Specific evaluation report (if done in India) [MD-28 checklist §21]
- Specimen batch test report for ≥3 consecutive batches [MD-28 checklist §22]
- Correlation chart: products listed in MD-28 vs FSC submitted [MD-28 checklist §23]
- Testing method preferably in video [MD-28 checklist §24]

**Block 6 — Conditional regulatory NOCs.**
| Trigger | Document |
|---|---|
| Veterinary IVD | DAHD NOC [IVD FAQ §53(a)] |
| Radio Immuno Assay | BARC NOC [IVD FAQ §53(c)] |
| Prenatal diagnostic | PNDT NOC [IVD FAQ §53(d)] |
| Certain other IVDs | DG-ICMR / NABL Lab / Govt-recognised Agency NOC [IVD FAQ §53(b)] |
| Blood-bank dual use (HIV/HBsAg/HCV) | Manufacturer claim on label for both purposes (no separate NOC) [IVD FAQ §20] |
| Prohibited categories | **CANNOT APPLY** — TB serology kits, malaria antibody RDTs |

**Block 7 — Inter-form dependencies.**
| Item | Required when |
|---|---|
| MD-13 (test mfg) or MD-17 (test import) | For trial-batch generation of new IVD [IVD FAQ §99] |
| MD-24 / MD-25 CPE permission | For Class B/C/D new IVD before commercialisation |
| MD-28 / MD-29 new IVD permission | For any new IVD (no prior India approval) before MD-3/7/14 |
| MD-22 / MD-23 | Generally NOT for IVDs (MD-22 is for non-IVD investigational MD; IVDs use MD-24/25 CPE) |

---

### 7.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| IVD vs non-IVD device | Not directly asked; partially inferable from Tier A Q3 (HCPs incl. lab techs) + intake one-liner | **Weak** |
| IVD class (A/B/C/D) | Pitch-extract `suggested_classification` | **Medium** — AI only |
| Analyte / specimen type | Not asked | **None** |
| Intended diagnostic level (screening / diagnosis / staging / prognosis) | Not asked | **None** |
| Qualitative / semi-quantitative / quantitative output | Not asked | **None** |
| Performance criteria (sensitivity / specificity) | Not asked | **None** |
| In-house performance evaluation done | Tier B B5 (clinical evidence) partially captures | **Weak** |
| Three-batch consistency | Not asked | **None** |
| Prohibited category (TB serology, malaria RDT) | Not asked | **None** — silent failure risk |
| Veterinary use | Not asked | **None** |
| Radio Immuno Assay | Not asked | **None** |
| PNDT-restricted | Not asked | **None** |
| Blood-bank dual use claim | Not asked | **None** |
| Cold chain requirements | Pitch-extract may capture in general description | **None** explicit |
| Predicate / new-IVD flag | Tier B B3 (predicates), but no "is this a new IVD" question | **Weak** |

---

### 7.D Gap analysis

**Critical gaps (blocking IVD MDR-2017 submission):**

1. **IVD-vs-MD distinction at intake.** ClearPath doesn't ask whether the device is an IVD. Path divergence (MD-24/25 + MD-28/29 vs MD-22/23 + MD-26/27) is fundamental.
   - *Recommended Sprint 3 question (Tier A early or intake):* "Is your product an in-vitro diagnostic (test performed on specimens outside the body)?" (yes_ivd / yes_combination_ivd_and_device / no)

2. **Analyte + specimen + intended diagnostic level.** Required for IVD Master File and intended-use statement (per SaMD Draft §4.3(h)).
   - *Recommended Sprint 3 questions (Tier B core, only for IVD):*
     - "What does your test detect or measure?" (free-text)
     - "What specimen?" (blood_serum / blood_plasma / blood_whole / urine / stool / sputum / semen / swab / saliva / tissue / other)
     - "What's the intended diagnostic level?" (screening / diagnosis_aid / disease_staging / prognosis / monitoring)
     - "Output type?" (qualitative_yes_no / semi_quantitative / quantitative)

3. **Performance criteria evidence.** For HIV/HBsAg/HCV, IVD FAQ §60 specifies minimum thresholds. For other Class B/C/D IVDs, manufacturer-claimed performance criteria are evaluated against IFU/COA claims.
   - *Recommended Sprint 3 question (Tier B core, only for IVD):* "Have you generated performance criteria evidence — sensitivity, specificity, repeatability, reproducibility, linearity, accuracy?" (yes_documented / partial / none_yet)

4. **Three-batch consistency.** Required for PER submission.
   - *Recommended Sprint 3 question (Tier B core, only for IVD):* "Have you manufactured at least 3 batches of your IVD for consistency testing?" (yes_3_plus / 1_to_2 / none)

5. **Prohibited category check.** Hard stop — applications for TB serology / malaria antibody RDT will be rejected.
   - *Recommended Sprint 3 question (Tier B core, only for IVD; binary):* "Is your IVD a serodiagnostic test for tuberculosis, or an antibody rapid diagnostic test for malaria?" (no / yes_tb_sero / yes_malaria_ab_rdt) — if yes, immediate hard-stop with explanation, do not proceed to license path.

6. **Veterinary / RIA / PNDT flag.** Affects NOC requirements.
   - *Recommended Sprint 3 question (Tier B core, only for IVD):* "Does your IVD require any of these special clearances?" (multi-select: veterinary_dahd / radio_immuno_assay_barc / prenatal_diagnostic_pndt / none)

7. **New IVD vs predicate-exists.** Required to determine MD-28/29 path.
   - *Recommended Sprint 3 question (Tier B core, only for IVD):* "Has a similar IVD already been approved for marketing in India?" (yes_named_predicate / yes_unsure_of_predicate / no_new_ivd)

**Medium gaps:**
- Class A IVD CPE-may-be-required-case-by-case flag — minor
- Reagent vs analyzer vs kit composition — affects grouping
- Cold-chain / shelf-life specifics

**Low-priority gaps:**
- Specific MDTL preference (CDSCO routes; applicant has limited choice)

---

## 8. Persona: Combination product developer

A combination product integrates **a drug AND a device** into a single product. Examples: drug-eluting coronary stents, drug-coated balloons, hormone-releasing IUDs, fentanyl patches (drug-side dominant), prefilled syringes (device-side dominant), wound dressings with antibacterial coating.

The regulatory path **depends on primary mode of action (PMOA)** — but `UNCERTAIN: CDSCO has not published a primary-mode-of-action determination guidance equivalent to FDA's Office of Combination Products procedure. Borderline cases are referred to the **Subject Expert Committee (SEC)** for case-by-case determination. Need consultant confirmation of decision process, SEC composition, and timelines.`

This persona has **two principal sub-cases** with a third for edge cases:

| Sub-case | PMOA | Path | Adjacent regulator |
|---|---|---|---|
| 8.1 | Primarily device (drug enhances but doesn't drive primary action) | MDR-2017 manufacturing license + DMF §8.12 medicinal substances overlay | DCG(I) consultation if drug component |
| 8.2 | Primarily drug (device delivers but doesn't define primary action) | D&C Act 1940 + Drug Rules 1945 manufacturing license (Form 25) + device-element overlay | CDSCO MD Division for device aspects |
| 8.3 | Genuinely undetermined / both | SEC review → CLA decision | Both arms |

> The MD-7 (Class C/D mfg) checklist and MD-26 (investigational MD without predicate) checklist both have explicit conditional sections for drug content [MD-7 checklist §8.12 "Medicinal substances data"; MD-26 checklist §11-12 "device contains drug" — drug approval status determines toxicology dossier requirement].

---

### 8.A Journey map

**Stage 1 — Pre-development.**
- Determine PMOA. Document the intended primary clinical effect: structural/mechanical (device-dominant) vs pharmacological/immunological/metabolic (drug-dominant).
- If borderline: prepare PMOA justification documentation; anticipate SEC referral
- Predicate research on the *combination*: a drug-eluting stent with rapamycin is a different predicate set than a drug-eluting stent with everolimus
- Determine whether drug component is approved in India

**Stage 2 — Development.**
- Drug-side: stability, purity, impurity profile per ICH Q-series
- Device-side: standard DMF/PMF preparation per §4.B
- Joint specifications: dosing accuracy, release kinetics, device-drug interaction stability over shelf life
- QMS spans both arms (Fifth Schedule MDR-2017 + Schedule M Drug Rules 1945 if applicable)

**Stage 3 — Pre-clinical.**
- For drug component: full preclinical tox / teratogenicity / mutagenicity / carcinogenicity / reproductive studies if drug is novel [per MD-26 checklist §12]
- For device component: §4.B Block 4 conditional overlays (biocompatibility likely required given drug-device contact)
- For combination: drug-release kinetics from device matrix; degradation pathway studies

**Stage 4 — Clinical investigation.**
- For investigational combination (no predicate): MD-26 → MD-27 path
- If pivotal study needed: MD-22 → MD-23 in parallel
- Submit clinical investigation plan per Seventh Schedule, Table 5

**Stage 5 — Pre-manufacturing.**
- Test license MD-13 covers device side; for drug component, `UNCERTAIN: whether a separate drug-side test license is needed or whether MD-13 alone suffices for the integrated product — likely SEC determines case-by-case`

**Stage 6 — Manufacturing license submission.**
- Device-PMOA combination: MD-7 → MD-9 (typically Class C/D given the clinical-risk profile)
- Drug-PMOA combination: Form 25 (granted) under Drug Rules 1945 — `UNCERTAIN: confirm form number for combination product where drug is PMOA`
- Joint review may delay grant by 60-180 days beyond standard timeline `UNCERTAIN`

**Stage 7 — Post-market.**
- Dual-arm PMS: drug ADR reporting (PvPI for drug) AND device PSUR
- Change in drug dose / formulation → drug PAC trajectory
- Change in device material / coating → device PAC trajectory
- Recall: dual-arm coordination

---

### 8.B Document inventory

Baseline: §4.B Blocks 1-3 (legal, PMF, QMS) apply unchanged for device-PMOA combinations.

**Block 4 — DMF Section 8 (with combination-product-specific items):**

| Sub | Note |
|---|---|
| 8.11 Biocompatibility | **Always required for drug-device contact** — multiple ISO 10993 series subtests |
| 8.12 Medicinal substances data | **CRITICAL — combination-product trigger.** Per MD-26 checklist §11-12: <br>- **If drug is approved in India:** name + approval number + company name + validity. <br>- **If drug NOT approved:** full dossier — animal toxicology / reproduction studies / teratogenic / perinatal / mutagenicity / carcinogenicity / chemical & pharmaceutical info |
| 8.13 Biological safety | Often required for biologics-bearing combinations |
| 8.14 Sterilization validation | Almost always required (combination products are typically sterile) |
| 8.18 Clinical evidence | Mandatory — substantial equivalence often demands dose-response data even when predicate exists |

**Block 5 — Combination-specific evidence:**
- Drug-release kinetics characterisation
- Coating uniformity / drug-load verification
- Stability of drug within device matrix at all storage conditions
- Compatibility study (device material vs drug excipients)

**Block 6 — Regulatory NOCs / joint reviews:**
- DCG(I) consultation if novel drug `UNCERTAIN: specific process`
- SEC review if borderline PMOA `UNCERTAIN: SEC convening procedure`
- For sterile combination: Annexure A environmental requirements

---

### 8.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Combination-product flag | Not asked anywhere | **None** |
| PMOA determination | Not asked | **None** |
| Drug component identity | Not asked | **None** |
| Drug approval status in India | Not asked | **None** |
| Drug-release profile | Not asked | **None** |
| Device class | Pitch-extract `suggested_classification` | **Medium** |
| Intended use | Intake one-liner + Tier B B1 | **Strong** (but won't surface combination nature unless one-liner explicit) |

---

### 8.D Gap analysis

**Critical gaps:**

1. **Combination-product flag at intake.** Drives whole path divergence.
   - *Recommended Sprint 3 question (Tier B core, follow-up to drug-content gap from §4.D):* "Does your device deliver, contain, or pre-load a drug or biological substance whose pharmacological action contributes to the device's intended use?" (no_pure_device / yes_drug_dominant / yes_device_dominant_drug_enhances / unsure_both_significant)

2. **Drug approval status.** Determines whether full toxicology dossier required.
   - *Recommended Sprint 3 follow-up question:* "Is the drug/substance already approved for use in India?" (yes_named / yes_unsure_name / no_novel / unsure)

3. **PMOA self-declaration.** Even if SEC ultimately decides, applicant's claimed PMOA shapes the submission.

**Lower priority:** drug-release kinetics, stability matrix, coating uniformity — these are technical artefacts more than wizard questions. Defer to free-text in Tier B B1.

Note: combination products are a small fraction of CDSCO submissions. Sprint 3 prioritisation should weigh founder pipeline.

---

## 9. Persona: Clinical investigation researcher (medical device)

A CI researcher conducts a **systematic study of an investigational medical device in or on human participants to assess safety, performance, or effectiveness** [SaMD Draft §4.1.3]. The persona splits into two structurally different sub-cases:

| Sub-case | Description | Permission needed | Data usable for marketing |
|---|---|---|---|
| 9.1 | Manufacturer-sponsored CI | MD-22 → MD-23 (always, for investigational MD) [FAQ §113] | Yes |
| 9.2 | Investigator-initiated CI / academic study on **licensed** device | EC approval only; NO MD-23 needed [FAQ §121] | **No** — academic data cannot be furnished to CDSCO for marketing application |
| 9.3 | Academic study on **investigational** device | MD-22 → MD-23 still required [FAQ §122] | Yes |

Inputs needed regardless of sub-case:
- Test license to manufacture (MD-12 → MD-13) or import (MD-16 → MD-17) — for clinical batches [FAQ §59, §18]
- Ethics Committee (EC) registered with CDSCO + approved protocol
- Clinical Investigation Plan per Seventh Schedule Table 5
- Investigator agreement, informed consent, insurance certificate

Notable exemptions [FAQ §123, §128; Addendum FAQ §22]:
- **CI is NOT required for devices that have a predicate** (i.e., not investigational by definition). Direct manufacturing/import license path applies.
- **CI for Class A investigational MD is generally NOT required**, but CLA may invoke case-by-case [FAQ §128].
- **Class A non-sterile non-measuring** — no MD-23 needed [Addendum FAQ §22].

---

### 9.A Journey map

**Stage 1 — Pre-development of protocol.**
- Determine whether device is "investigational MD" — no predicate, or licensed with new claim/population/material/major design change [FAQ §112; SaMD Draft §4.1.6]
- Sponsor vs investigator-initiated decision (changes whether MD-23 required)
- Identify regulatory status in IMDRF countries (UK / USA / Australia / Canada / Japan) — if approved and marketed ≥2 years and CLA satisfied with safety/PV data, **CI may be waived** case-by-case in consultation with SEC [FAQ §117]

**Stage 2 — Pre-clinical evidence assembly.**
- For sponsor-CI: in-house design analysis, bench testing, biocompatibility, animal data, stability, risk management [MD-22 checklist §6-9]
- Investigators' brochure per Seventh Schedule
- Identify whether **pilot** clinical investigation precedes pivotal — pilot data may be required to design pivotal study [FAQ §127, Pathway flowchart "Pilot/Pivotal Study"]

**Stage 3 — Test license to generate clinical batches.**
- Manufactured-in-India device: MD-12 → MD-13 (test license to manufacture); QMS compliance required if device will be used on humans [Regulatory Pathway PDF note]
- Imported device: MD-16 → MD-17 (test license to import)
- Test license valid 3 years; can have multiple test sites in single application [FAQ §47, IVD FAQ §68]
- Submitted via **NSWS portal** `nsws.gov.in` per Rule 31/40 [SaMD Draft §3.0]

**Stage 4 — EC approval.**
- EC must be registered with CDSCO under Rule 11 of NDCT 2019 (for drug trials); for medical device CI, EC registration requirement comes from MDR-2017 Chapter VII
- `UNCERTAIN: confirm whether EC registration is at the CDSCO MD division specifically or shared with NDCT EC registry — likely shared, but flag for consultant`
- EC composition per ICMR National Ethical Guidelines for Biomedical Research Involving Human Participants
- EC reviews protocol, informed consent template, investigator brochure, insurance, compensation framework
- `UNCERTAIN: typical EC approval timeline — depends on EC scheduling; commonly 4-8 weeks based on industry experience but not codified`

**Stage 5 — CDSCO permission via MD-22.**
- Submit MD-22 application via MD online portal with full document set (Checklist §1-22 of MD-22 per SaMD Draft Annexure A E):
  - Cover letter specifying Pilot / Pivotal / Post-marketing study
  - Application form + fees (waived for govt-funded/owned institutions [FAQ §124])
  - Justification for proposed class
  - Regulatory status in other countries
  - Design analysis data
  - Risk Management Report
  - Biocompatibility + animal performance study (as applicable)
  - Proposed labelling
  - Sponsor-PI agreement
  - Insurance certificate
  - AE / SAE reporting forms
  - Investigators Brochure (Seventh Schedule)
  - Clinical Investigation Plan (Seventh Schedule Table 5)
  - Case Report Form
  - Informed Consent Form (Seventh Schedule)
  - Investigator's undertaking
  - Published technical documents / literature
  - CI data on applied device (if any from other countries)
  - EC approval letter

**Stage 6 — MD-26 → MD-27 in parallel (if intent is to commercialise).**

If the goal is eventual commercialisation, MD-26 application runs concurrently or after CI completion [Addendum FAQ §19 sequence]:
- Test license (MD-13 or MD-17) → MD-26 with clinical evidence → MD-27 permission → MD-3/7/14 marketing license

**Stage 7 — CTRI registration + execution.**
- CTRI registration **mandatory before first participant enrollment** for drug trials [NDCT FAQ §23]
- `UNCERTAIN: confirm whether CTRI registration is mandatory for medical device CI specifically — Seventh Schedule MDR-2017 references CI protocol registration but consultant should confirm CTRI-specific requirement vs alternative registries`
- MD-23 permission valid **1 year**; re-permission needed if study not initiated in time [FAQ §125]
- Conduct study per approved protocol; deviations → notify CDSCO + EC

**Stage 8 — Reporting and PSUR.**
- Clinical Investigation Report per Seventh Schedule Table 10 [FAQ §115]
- AE / SAE / SUSAR reporting per Seventh Schedule
- Post-launch PSUR: 6-monthly first 2 years, annual next 2 years [FAQ §126]
- Post-marketing CI for IMD: required as undertaking in MD-26 submission [MD-26 checklist §17]

---

### 9.B Document inventory

**Block 1 — Submission documents for MD-22 (CI permission):** Full list from MD-22 checklist §1-22 per SaMD Draft Annexure A item E. See Stage 5 above.

**Block 2 — Submission documents for MD-26 (no-predicate permission):** Per SaMD Draft Annexure A item G:
- Cover letter, MD-26 form, fees
- Justification for proposed class
- Regulatory status (UK / USA / AU / CA / JP) with notarised approval letter
- Design analysis data (input, output, control, V&V)
- Essential Principles checklist
- Device specification + test report
- Mechanical / electrical / reliability / software V&V / performance / ex-vivo tests (as applicable)
- Stability data
- Risk Management Report
- Biocompatibility + animal data (as applicable)
- Labelling info
- For drug-containing: drug approval status + (if not approved) toxicology/teratogenicity/etc. dossier
- CI data including India and other countries (if any)
- Countries where IMD sold/marketed past 2 years (for imports)
- Post-marketing surveillance data from foreign markets past 2 years
- Evidence that there's no theoretical Indian-population behaviour difference
- Undertaking to conduct post-marketing CI per CLA-approved protocol
- Overseas mfg site registration (for imports)
- Constitution of domestic mfg or authorised agent

**Block 3 — Inter-form sequencing.**
The combined sequence for novel device commercialisation, per Addendum FAQ §19 and Regulatory Pathway PDF:

```
Test License (MD-13 mfg or MD-17 import)
        ↓
MD-26 application + clinical evidence
        ↓
MD-27 permission to manufacture/import IMD
        ↓ (if clinical data inadequate)
MD-22 → MD-23 CI permission
        ↓
Pilot CI (typically) → Pivotal CI
        ↓
Submit data → consideration in MD-3/7/14 marketing license
```

---

### 9.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Clinical-evidence status | Tier B B5 (none / pilot_data / published_study / multi_center_trial) | **Strong** — exactly the right axis |
| Predicate / investigational | Tier B B3 (Tier 2 only) | **Weak for Tier A** |
| Foreign regulatory approval (UK/US/AU/CA/JP) | Pitch-extract may capture in deck content but no structured question | **Weak** |
| Sponsor vs investigator-initiated | Not asked | **None** |
| Pilot vs pivotal stage | Not asked | **None** |
| EC engagement status | Not asked | **None** |
| CTRI registered? | Not asked | **None** |
| Sample size planned | Not asked | **None** |
| Animal study status | Not asked (though Pitch-extract may capture) | **Weak** |
| Insurance for trial | Not asked | **None** |

---

### 9.D Gap analysis

**Critical gaps (for CI-pathway readiness assessment):**

1. **Sponsor vs investigator-initiated.** Determines whether MD-22 required and whether data is marketing-usable.
   - *Recommended Sprint 3 question (Tier B core, only if clinical_evidence ≠ none):* "Who sponsors / runs the study?" (manufacturer_sponsored / academic_investigator_initiated_with_licensed_device / academic_investigator_initiated_with_investigational_device)

2. **Foreign regulatory status.** Determines whether CI may be waived case-by-case [FAQ §117].
   - *Recommended Sprint 3 question (Tier B core):* "Is your device approved by any stringent regulator?" (multi-select: us_fda / uk_mhra / health_canada / tga_australia / pmda_japan / eu_ce_mdr / none) plus "How long marketed there?" (less_than_2y / 2_to_5y / more_than_5y / not_yet_marketed)

3. **Pilot vs pivotal stage.** Pilot data often required to design pivotal.
   - *Recommended Sprint 3 question (Tier B core, only if clinical_evidence ≠ none):* "What stage is your clinical evidence?" (pilot_complete / pilot_ongoing / pivotal_complete / pivotal_ongoing / post_marketing)

4. **EC engagement.** Without EC approval, MD-22 application fails outright.
   - *Recommended Sprint 3 question (Tier B core, only if planning CI):* "Have you engaged a registered Ethics Committee?" (yes_approved / yes_under_review / not_yet / not_applicable_no_human_subjects)

5. **CTRI registration status.** Mandatory for drug trials; `UNCERTAIN for MD-only`.
   - *Recommended Sprint 4 question:* "Have you registered the study in CTRI?" — pending consultant confirmation of MD-specific requirement.

6. **Sample size + statistical plan.** Required for protocol design but `UNCERTAIN whether ClearPath should ask` — could be free-text in Tier B B5 expansion.

**Medium gaps:**
- Insurance policy details
- Investigator brochure availability
- Animal study completion status (some derivable from Tier B B5)

**Low-priority gaps:**
- Specific endpoint (primary efficacy / safety / surrogate)
- Investigator network composition

---

## 10. Persona: Clinical performance evaluation researcher (IVD)

A CPE researcher conducts a **systematic performance study of a new IVD on specimens collected from human participants to assess performance** [SaMD Draft §4.1.4]. This is structurally distinct from §9's clinical investigation:

| Comparison | §9 CI (medical device) | §10 CPE (IVD) |
|---|---|---|
| What's studied | Investigational MD on/in human participants | New IVD on specimens (collected from humans, but not interventional) |
| Permission form pair | MD-22 → MD-23 | MD-24 → MD-25 |
| Commercialisation permission | MD-26 → MD-27 | MD-28 → MD-29 |
| Sample handling | Human-subject protocol | Specimen-based; bio-banking rules |
| Endpoint | Safety + performance + effectiveness | Performance (sensitivity / specificity / repeatability / reproducibility / accuracy / linearity) |
| Interventional? | Yes (typically) | No |

This persona has **two principal sub-cases**:

| Sub-case | What it covers |
|---|---|
| 10.1 | CPE on Class B/C/D new IVD prior to commercialisation — mandatory regardless of foreign approval [IVD FAQ §58] |
| 10.2 | CPE waiver attempt for Class A new IVD — may not be required unless CLA invokes case-by-case [IVD FAQ §59] |

---

### 10.A Journey map

**Stage 1 — Pre-development.**
- Determine "new IVD" status (no prior India approval for marketing)
- Design analyte specification (specificity, sensitivity, repeatability, reproducibility, accuracy targets — claimed in IFU/COA)
- Identify reference standards (panels, certified reference materials)

**Stage 2 — Development + in-house PER.**
- In-house performance evaluation: establish stability, specificity, sensitivity, repeatability, reproducibility [MD-24 checklist §4]
- Three independent batches manufactured from three different lots of key raw materials (antigen / antibody / etc.) [IVD FAQ §56]
- Manufacturer-claimed performance criteria documented in IFU / COA / product insert [IVD FAQ §62]

**Stage 3 — Test license (manufacture or import) for trial batches.**
- MD-13 (manufacture) to develop ≥3 trial batches [IVD FAQ §99]
- MD-17 (import) for foreign-mfg new IVD test samples
- Test license valid 3 years

**Stage 4 — CPE permission via MD-24.**
- Submit MD-24 application via MD online portal [SaMD Draft Annexure A item F]. Checklist:
  - Cover letter
  - Constitution of firm
  - Device description (raw material, finished product, IFU, labels, regulatory status in other countries)
  - In-house performance evaluation data (stability, specificity, sensitivity, repeatability, reproducibility)
  - EC approval
  - Clinical performance evaluation plan
  - Case Report Form
  - Investigator undertaking
  - Conformity undertaking
  - Performance evaluation report from laboratory designated under Rule 19(1)
  - Fee challan
  - Legal form

**Stage 5 — CPE execution at registered lab.**
- Conducted at CMDTL (Central Medical Device Testing Laboratory) / MDTL registered under Rule 83(3) / NIB-Noida / NABL-accredited lab / Govt hospital of national repute [IVD FAQ §57]
- For HIV / HBsAg / HCV: must meet NIB-Noida thresholds per IVD FAQ §60:
  - **Anti-HIV** — ELISA/CLIA/ELFA/ECLIA/CMIA/MEIA: 100% sensitivity, ≥98% specificity; Rapid kit: 100% sensitivity, ≥98% specificity
  - **HBsAg** — same as Anti-HIV
  - **HCV** — ELISA/CLIA etc: 100% sensitivity, ≥98% specificity; Rapid kit: ≥99% sensitivity, ≥98% specificity
- For other Class B/C/D IVDs: compliance with manufacturer-claimed performance criteria
- Sample size: statistically significant per protocol approved by respective MDTL [IVD FAQ §61]

**Stage 6 — MD-28 → MD-29 new IVD permission (in parallel or after CPE).**
- Submit MD-28 application with PER (3 batches) + CPE data + all IVD Master File contents
- MD-29 permission required BEFORE MD-3/7/14 marketing license

**Stage 7 — Marketing license submission.**
- Class A/B IVD: MD-3 → MD-5 (SLA)
- Class C/D IVD: MD-7 → MD-9 (CLA)
- For import (any class): MD-14 → MD-15 (CLA)
- All paths reference MD-29 permission as prerequisite for new IVD

**Stage 8 — Post-CPE reporting and PMS.**
- Submit final PER per Guidance on Performance Evaluation of IVDs (`guidanceperformanceivd.pdf` on CDSCO website)
- Major changes (intended use / sensitivity claim / specimen type) — PAC [IVD FAQ §22]

---

### 10.B Document inventory

**Block 1 — MD-24 application** (per SaMD Draft Annexure A item F):
- Cover letter; constitution of firm
- Device description with regulatory status, IFU, labels
- In-house performance evaluation: stability, specificity, sensitivity, repeatability, reproducibility
- EC approval
- CPE plan
- Case Report Form
- Investigator undertaking
- Conformity undertaking
- PER from designated lab
- Fee challan + legal form

**Block 2 — MD-28 application** (per SaMD Draft Annexure A item H — see §22 form-centric reference for full 24-item checklist):
- PoA (apostilled) — for imports
- Constitution + wholesale/manufacturing license copy
- Regulatory certificates (overseas mfg registration, FSC from country of origin, FSC from stringent country, latest NB/NRA audit ≤3 years)
- DAHD NOC for veterinary IVD; BARC NOC for RIA kits
- ISO 13485 QMS cert + PQA / FQA / CE design cert (if any)
- Fifth Schedule compliance undertaking
- Site / Plant Master File (Appendix I)
- IVD Master File (Appendix II — see §22.4 for appendix authority note)
- Device data: design input/output, stability, specs (specificity / sensitivity / reproducibility / repeatability), software validation
- Risk Management data
- CPE data (India + other countries)
- Regulatory status + restrictions in other countries
- Essential Principles checklist
- Product Insert, Labelling, Pack Size
- PER from CMDTL / Rule 83(3) MDTL for **three batches** [MD-28 checklist §19]
- Stability: claimed shelf-life (≥3 lots) + in-use (≥1 lot) + shipping (≥1 lot)
- Specific evaluation report (India) [MD-28 checklist §21]
- Specimen batch test report for ≥3 consecutive batches
- Correlation chart: products list vs FSC
- Testing method preferably in video

**Block 3 — Sample size and specimen handling.**
- Sample size: "statistically significant per protocol approved by respective MDTL" [IVD FAQ §61]
- `UNCERTAIN: CDSCO does not publish bright-line minimum N for IVD CPE — case-by-case`
- For HIV/HBsAg/HCV: in addition to performance thresholds (above), sample size must be sufficient for the statistical claim
- Specimen handling: `UNCERTAIN — no specific MDR-2017 guidance on bio-banking; likely ICMR Biorepository guidelines apply`

---

### 10.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| IVD-vs-MD flag | Not asked (same gap as §7.D #1) | **None** |
| New IVD vs predicate | Not asked (same gap as §7.D #7) | **None** |
| Performance evaluation completed (in-house) | Tier B B5 partially — only "clinical evidence" axis | **Weak** for IVD-specific PER vocabulary |
| Three-batch consistency | Not asked | **None** |
| Reference standards used | Not asked | **None** |
| Specimen type | Not asked | **None** |
| MDTL engagement | Not asked | **None** |
| Foreign approval status | Not asked | **None** |

---

### 10.D Gap analysis

**Critical gaps:**

1. **CPE-specific evidence status.** Different from clinical-evidence-for-MD axis.
   - *Recommended Sprint 3 question (Tier B core, only if IVD flag = yes):* "Status of performance evaluation?" (none / in_house_pe_done / 3_batch_pe_done / mdtl_pe_complete / cpe_at_mdtl_complete)

2. **MDTL engagement.** CPE must be conducted at registered lab.
   - *Recommended Sprint 3 question:* "Have you engaged a CDSCO-registered MDTL / CMDTL / NIB / NABL lab?" (yes_named / yes_unnamed / not_yet)

3. **HIV/HBsAg/HCV specific check.** Different threshold than other IVDs.
   - *Recommended Sprint 3 conditional question:* "Is your IVD intended for HIV, HBsAg, or HCV detection?" — if yes, populate threshold expectations from IVD FAQ §60.

4. **All §7 gaps apply** (IVD flag, analyte/specimen, new-IVD-vs-predicate).

**Medium gaps:**
- Reference standards / panels (often technical detail in B1)
- Specimen sample size (case-by-case per MDTL)

**Low-priority gaps:**
- Specimen procurement source (clinical lab / blood bank / commercial supplier)

---

## 11. Persona: Pharma manufacturer

A pharma manufacturer makes **drugs** as defined under Section 3(b) of the Drugs and Cosmetics Act 1940 — pharmaceutical formulations, biologics, vaccines, APIs, etc. This persona is **outline-only** in this document per the project brief (deep pharma framework is out of scope for ClearPath v1).

The pharma framework is structurally different from MDR-2017:

| Comparison | MDR-2017 (devices) | D&C Act 1940 + Drug Rules 1945 + NDCT 2019 |
|---|---|---|
| Primary rule | MDR-2017 | Drugs & Cosmetics Act + Rules 1945 + NDCT 2019 (for new drugs + CTs) |
| Manufacturing license form | MD-3 / MD-7 | Form 25 (manufacturing license — see §11.2) |
| Clinical trial form | MD-22 / MD-23 | CT-04 → CT-06 (see §12) |
| Authority for new product | CLA via MDR-2017 | CDSCO + DCG(I) (same agency, different statutory hat) |
| Manufacturing quality framework | Fifth Schedule MDR-2017 | Schedule M Drug Rules 1945 (revised 2025) |

### Sub-cases

| Sub-case | Description |
|---|---|
| 11.1 | Existing-drug manufacturer (no "new drug" status — straight to Form 25 under Drug Rules 1945) |
| 11.2 | New-drug manufacturer (NDCT 2019 applies; CT-04 → CT-06 path required first, then Form 25) |
| 11.3 | Combination product where drug is PMOA (see §8.2) |
| 11.4 | Vaccine / biologic / r-DNA / monoclonal antibody / stem-cell / gene therapy — "new drug forever" status under NDCT 2019 [NDCT FAQ §7] |

---

### 11.A Journey map (high-level only)

**Stage 1.** Determine "new drug" status under NDCT 2019 — see §11.5.

**Stage 2.** If new drug, NDCT 2019 path (see §12 for full CT researcher journey).

**Stage 3.** Manufacturing license application under Drug Rules 1945. `UNCERTAIN: form-level detail of Forms 22 (application) vs 25 (granted license) — confirmed via search but full primary-source extraction not completed in this drafting session. Pre-fill subject to consultant verification.`

**Stage 4.** Schedule M GMP compliance (revised 2025).

**Stage 5.** Post-marketing: PvPI ADR reporting; periodic re-licensing.

---

### 11.B Document inventory (outline)

`UNCERTAIN — pharma-specific deep document inventory deferred to consultant input.`

Key reference forms:
- **Form 22** — `UNCERTAIN: likely the **application** form for manufacturing license; need to confirm from Drug Rules 1945 primary text`
- **Form 25** — `UNCERTAIN: likely the **granted** manufacturing license; need to confirm`
- **Form 27** — `UNCERTAIN: likely loan license`
- **Form 28** — `UNCERTAIN: likely for restricted/Schedule X manufacturing`

### 11.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Drug-vs-device flag | Not asked | **None** — same gap as §7.D #1 (IVD flag) and §8.D #1 (combination flag) |
| "New drug" status | Not asked | **None** |
| Drug type (small molecule / biologic / vaccine / r-DNA / etc.) | Not asked | **None** |
| Indication / claim | Intake one-liner partially captures | **Weak** |

### 11.D Gap analysis

ClearPath v1 currently scopes to medical devices and SaMD. Pharma is out of scope for Sprint 2 / Sprint 3.

**Recommended (Sprint 4 or v2):**
- Intake question: "Is your product a drug, biologic, vaccine, or pharmaceutical formulation?" → if yes, route to D&C Act + NDCT 2019 pathway (or politely defer if ClearPath doesn't yet support pharma)
- Defer detailed pharma question expansion until consultant has validated medical-device side

---

### 11.5 New drug definition under NDCT 2019

Sourced from NDCT FAQ §2-7. A "new drug" includes:

1. **An API or phytopharmaceutical** not used in India to any significant extent, not approved as safe/efficacious by CLA
2. **An approved drug with modified or new claims** — including indication, route, dose, dosage form
3. **A fixed-dose combination** of two or more drugs approved separately
4. **A modified or sustained release form or NDDS** of any approved drug
5. **A vaccine, r-DNA derived product, living modified organism, monoclonal antibody, stem cell derived product, gene therapeutic product, or xenograft**

Duration of "new drug" status:
- **Forever**: modified-release / NDDS / vaccine / r-DNA / LMO / mAb / stem-cell / gene therapy / xenograft (categories 4-5 above) [NDCT FAQ §7]
- **4 years**: all other new drug categories (1-3 above) [NDCT FAQ §7]

### 11.6 Drug / device demarcation rules

From CDSCO primary sources:
- **Radiopharmaceuticals** → Drug Rules 1945 (NOT MDR-2017) [Addendum FAQ §14]
- **Disinfectants for medical device disinfection** → MDR-2017 [FAQ §57]
- **Disinfectants for other purposes** → not MDR-2017
- **Drug-eluting / drug-containing devices** → MDR-2017 with §8.12 medicinal substances overlay [MD-7 checklist; MD-26 checklist §11-12]
- **Diagnostic agents** (e.g., contrast media, barium, in-vivo radiologic) → Drug Rules 1945 (they are *in-vivo* diagnostics, not IVDs) [IVD FAQ §7-8]
- **Cosmetics** → separate cosmetic regulation (out of scope)

---

## 12. Persona: Pharma clinical researcher (NDCT 2019)

A pharma CT researcher conducts a clinical trial of a new drug or investigational new drug under NDCT Rules 2019. This is **distinct from §9 (medical device CI)** at every level: different governing statute, different forms, different timelines, different ethics infrastructure (though many ECs overlap).

### CT form numbering — authoritative mapping

This is one of the most-commonly-mis-cited form sets. Authoritative source: NDCT FAQ §14, §15, §22, §25.

| Form | Purpose | Issued by |
|---|---|---|
| **CT-04** | Application for permission to conduct clinical trial of new drug / IND [NDCT FAQ §14] | Applicant |
| **CT-04A** | Pre-initiation notification (the deemed-approval mechanism — submitted by sponsor before initiating trial; informational to CDSCO even after deemed-approval clock runs out) [NDCT FAQ §22] | Applicant |
| **CT-05** | Application for BA/BE (Bioavailability / Bioequivalence) study permission [NDCT FAQ §13] | Applicant |
| **CT-06** | Clinical trial permission grant (the form CDSCO issues) [NDCT FAQ §15, §25] | CLA |
| **CT-07** | `UNCERTAIN: likely the annual safety / status report form, but not confirmed in the NDCT FAQ excerpts available during drafting. Consultant to confirm.` | Applicant |

### Sub-cases

| Sub-case | What it covers |
|---|---|
| 12.1 | New chemical or biological entity (NCE / NBE) Phase 1-3 trial — CT-04 → CT-06 |
| 12.2 | India-discovered drug — 30-working-day deemed-approval path |
| 12.3 | Foreign-discovered drug — 90-working-day standard path; cannot start with Phase 1 in India |
| 12.4 | BA/BE study — CT-05 → CT-06 |
| 12.5 | Academic clinical trial on already-approved drug — no CT permission needed; only EC approval |
| 12.6 | Orphan drug trial (condition affecting ≤5 lakh persons in India) — same form path with relaxed data requirements possible |

---

### 12.A Journey map

**Stage 1 — Pre-development of protocol.**
- Determine "new drug" status (see §11.5)
- Determine whether trial is interventional / observational
- Identify whether drug is India-discovered or foreign-discovered (drives the 30 vs 90 working-day timeline) [NDCT FAQ §18-20]
- For foreign-discovered: cannot start with Phase 1 in India; must submit foreign Phase 1 data, then Phase 2+ in India possibly concurrent with global trials [NDCT FAQ §16]

**Stage 2 — Pre-clinical evidence assembly.**
- Animal toxicology / pharmacology / pharmacokinetics per ICH-aligned standards
- Investigators' Brochure (IB) per Second Schedule NDCT 2019

**Stage 3 — EC approval.**
- EC registered under Rule 8 of NDCT 2019
- EC composition per ICMR National Ethical Guidelines for Biomedical Research Involving Human Participants
- EC reviews protocol, IB, ICF, insurance, compensation framework
- `UNCERTAIN: typical EC approval timeline`

**Stage 4 — CDSCO permission via CT-04.**
- Submit CT-04 with Second Schedule documents + Sixth Schedule fees [NDCT FAQ §14, §15]
- Govt-funded / govt-owned institutions: **no fee** [NDCT FAQ §15]
- Timeline:
  - **30 working days** if drug is discovered + researched + proposed to be manufactured + marketed in India — deemed approved if no response [NDCT FAQ §18, §19]
  - **90 working days** for all other cases [NDCT FAQ §18]

**Stage 5 — Pre-initiation notification via CT-04A.**
- Even after deemed approval, the sponsor/investigator must file CT-04A before initiating the trial [NDCT FAQ §22]
- CDSCO takes on record; this serves as "automatic approval of CLA"
- CDSCO can still review and act for non-compliance even after deemed approval [NDCT FAQ §21]

**Stage 6 — CTRI registration.**
- **Mandatory before enrollment of first participant** [NDCT FAQ §23]
- For multi-country / global CTs where India participates, **also** required even if already registered in international registry [NDCT FAQ §24]
- Captures: Indian investigators, trial sites, Indian target sample size, date of enrollment

**Stage 7 — Trial execution.**
- CT-06 permission valid **2 years** from grant or CT-04A approval [NDCT FAQ §25]
- Compensation, medical management for trial-injured subjects per Rule 32 NDCT 2019 (academic trials follow ICMR ethical principles [NDCT FAQ §12])
- Insurance certificate required
- Phase 1 sample size: typically 20-100 healthy volunteers — `UNCERTAIN: not bright-line in NDCT 2019; statistical justification expected per protocol`
- Phase 2: typically 100-300 — `UNCERTAIN`
- Phase 3: hundreds to thousands — `UNCERTAIN`

**Stage 8 — Reporting and conclusion.**
- AE / SAE / SUSAR reporting per Second Schedule
- Annual safety report (`UNCERTAIN: form-level — likely CT-07 but pending confirmation`)
- Final CSR (Clinical Study Report)
- Data used for marketing application (NDA / subsequent new drug application)

---

### 12.B Document inventory

`UNCERTAIN — full Second Schedule NDCT 2019 document list extraction not completed in this drafting session. Key items per standard ICH and NDCT 2019:`

- CT-04 form + fees
- Investigators' Brochure (Second Schedule)
- Trial protocol (objectives, design, endpoints, sample size, stat plan)
- Case Report Form
- Informed Consent Form (in English + local language)
- EC approval letter
- Investigator CV + GCP training
- Sponsor-investigator agreement
- Insurance policy
- Compensation framework
- Animal toxicology / pharmacology / PK package
- Existing clinical data (Phase 1 from abroad for foreign-discovered drugs)
- DCG(I) Form CT-04A copy after deemed approval (for record)
- CTRI registration number (before enrollment)

---

### 12.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Pharma / device flag | Not asked | **None** |
| Discovery origin (India / foreign) | Not asked | **None** |
| Drug type (NCE / NBE / vaccine / biologic) | Not asked | **None** |
| Trial phase (1/2/3/4/BA-BE) | Not asked | **None** |
| EC status | Not asked | **None** — same gap as §9.D #4 |
| CTRI registered | Not asked | **None** |
| Sponsor type (commercial / academic / govt) | Not asked | **None** |
| Insurance / compensation in place | Not asked | **None** |

---

### 12.D Gap analysis

ClearPath v1 doesn't scope pharma. Recommendations for Sprint 4+ / v2:
- Pharma intake routing question
- Phase identification (1/2/3/4/BA-BE/observational)
- Discovery origin (India / foreign) — drives 30 vs 90 working day expectation
- Multi-country trial flag (drives dual CTRI + ICH registry registration)
- EC + insurance + compensation status

Defer prioritisation until pharma scope is committed.

---

## 13. Persona: Importer of foreign-manufactured device

An importer is an **Indian Authorised Agent (IAA)** appointed via Power of Attorney by an overseas manufacturer to import medical devices into India [FAQ §91]. Unlike §4 (Indian manufacturer), this persona never holds an MDR-2017 manufacturing license; it holds an **import license MD-15**.

Sub-cases by class — all classes go through CLA (not SLA) for imports:

| Sub-case | Class | Form pair | Adjacent path |
|---|---|---|---|
| 13.1 | Class A non-sterile non-measuring | Portal registration only [FAQ §88] | Still via notified ports [Addendum §31] |
| 13.2 | Class A (other) and Class B | MD-14 → MD-15 | NB inspection of overseas site at CLA discretion |
| 13.3 | Class C and D | MD-14 → MD-15 | CLA may inspect overseas site before or after grant [FAQ §98] |
| 13.4 | Class C/D IVD from non-stringent country | MD-14 → MD-15 + CPE in India required [IVD FAQ §91] | |

Critical distinguishing rule: **same product + same manufacturer + multiple Indian agents permitted** — each agent submits separate application [FAQ §94-95].

---

### 13.A Journey map

**Stage 1 — Pre-engagement with overseas manufacturer.**
- Confirm IAA eligibility: agent must hold a manufacturing license OR wholesale license under MDR-2017, OR a registration certificate MD-42 [FAQ §90, §144]
- Negotiate PoA terms with overseas manufacturer

**Stage 2 — Document collection from overseas manufacturer.**
- Power of Attorney — apostilled or authenticated by Magistrate First Class / Indian Embassy in country of origin [FAQ §102]
- PoA + undertaking from authorised agent must be **single bound/punched document** when apostilled or authenticated together [Addendum FAQ §3]
- Free Sale Certificate (FSC) from country of origin — must show both legal AND actual manufacturer name/address [FAQ §108, IVD FAQ §72]
- Certificate of Exportability is **NOT acceptable** as FSC [FAQ §111, IVD FAQ §90]
- Notarised QMS certificate (ISO 13485) issued by competent authority
- Notarised inspection/audit report from Notified Body or NRA within last 3 years
- For non-stringent country origin: additional in-country evaluation may be required

**Stage 3 — Application via MD-14.**
- Submit via cdscomdonline.gov.in [FAQ §89]
- Documents per Fourth Schedule Part I, II, and III (Appendix I & II) + fees per Second Schedule
- For IVD: Part III Appendix I & III (note appendix difference — `UNCERTAIN: SaMD Draft Annexure A item K and IVD FAQ §35 disagree on Appendix II vs III for IVD master file; flagged for consultant`)

**Stage 4 — CLA review and possible overseas inspection.**
- Timeline: **9 months** per MDR-2017 [FAQ §97]
- CLA may inspect overseas site before or after grant [FAQ §98]

**Stage 5 — MD-15 grant.**
- Perpetual validity with **5-year retention** [FAQ §55]
- Endorsement of additional products at same site: subsequent application with fees only [IVD FAQ §45]
- Endorsement of additional manufacturing site: same legal mfg with multiple actual sites — separate fee per site [FAQ §96]

**Stage 6 — Post-import operational.**
- Import through notified ports only [FAQ §106]
- Stock at any registered warehouse — not bound to one address on MD-15 [FAQ §107, IVD FAQ §51-52]
- India-specific labelling by sticker post-landing acceptable [FAQ §99, IVD FAQ §88]
- For class change (CLA-initiated, e.g., B→C): existing license remains valid till final decision; additional fee/docs only [IVD FAQ §40-41]

**Stage 7 — Post-market.**
- Any change in name/address of Indian agent or overseas manufacturer → notify CLA within **45 days** + fresh application within 180 days for constitution change [FAQ §22, §109]
- Change in actual mfg site name (without constitution change): PAC, not fresh license [Addendum FAQ §4]
- Major change overseas → PAC notification with 60-day deemed-approval clock [FAQ §136]

---

### 13.B Document inventory

| # | Document | Source |
|---|---|---|
| 1 | Application MD-14 | Standard |
| 2 | Fee challan | Second Schedule |
| 3 | Power of Attorney (apostilled / Magistrate / Embassy) + Undertaking from authorised agent | [FAQ §102; Addendum §3] |
| 4 | Wholesale/manufacturing/MD-42 license of IAA | [FAQ §90] |
| 5 | Free Sale Certificate from country of origin (both legal + actual mfg named) | [FAQ §108] |
| 6 | FSC from stringent country (US/UK/AU/CA/JP/EU) if available | [MD-28 checklist §5.3 for IVD; same principle for MD] |
| 7 | Notarised overseas plant/site/establishment registration | [MD-28 checklist §5.1] |
| 8 | Notarised QMS certificate (ISO 13485) | [Block 6 of MD-28 checklist] |
| 9 | Latest NB/NRA inspection or audit report within 3 years | [MD-28 §5.4] |
| 10 | Plant Master File (Appendix I, Fourth Schedule) | Required |
| 11 | Device Master File (Appendix II) | Required |
| 12 | Label specimens, IFU as per Chapter VI | |
| 13 | Performance evaluation data (for IVD) — 3 batches [IVD FAQ §56] | For Class B/C/D IVD |
| 14 | Conditional NOCs (DAHD / BARC / PNDT) as applicable | |
| 15 | Risk Management Report | |

For Class A non-sterile non-measuring imports: **only** product details, IFU, label, manufacturer info — no DMF/PMF/QMS required [FAQ §88]. Still imported through notified ports [Addendum §31].

---

### 13.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Indian-mfg vs imported | Pitch-extract `company.manufacturing_address` — derivable but not explicit | **Weak** |
| Overseas manufacturer named | Pitch-extract `company.legal_name` only captures Indian entity | **None** for overseas |
| IAA constitution / wholesale license held | Pitch-extract `company.constitution` captures Indian entity type | **Weak** |
| FSC available from country of origin | Not asked | **None** |
| Foreign regulatory approvals | Not asked | **None** (same gap as §9.D #2) |
| PoA status | Not asked | **None** |
| Stringent vs non-stringent country | Not asked | **None** |
| Apostille / authentication done | Not asked | **None** |

---

### 13.D Gap analysis

**Critical gaps for importer pathway:**

1. **Indian-mfg vs imported flag.** Same as §4.D #7 but more acute for this persona.
   - *Recommended Sprint 3 question (Tier A or Tier B core):* "Where is your device manufactured?" (indigenous_india_only / imported_only / both)

2. **Country of origin** — drives stringent-vs-non-stringent decision.
   - *Recommended Sprint 3 follow-up (if imported):* "Country of origin?" (us / uk / eu_member / australia / canada / japan / other_specify)

3. **PoA + FSC + QMS-cert availability.**
   - *Recommended Sprint 3 question:* "Do you have these documents from your overseas manufacturer?" (multi-select: poa_apostilled / fsc_from_origin / fsc_from_stringent_country / iso_13485_cert / nb_audit_report_3y)

4. **IAA license status.** Critical because IAA without wholesale/MD-42/mfg license cannot import.
   - *Recommended Sprint 3 question:* "Do you (the IAA) hold a wholesale license, manufacturing license, or MD-42 registration?" (yes_named / not_yet_applied / not_yet_planned)

**Medium gaps:**
- Number of overseas manufacturing sites (for multi-site endorsement)
- Multi-agent risk (other agents importing same product?)

**Low-priority:**
- Specific notified port preference

---

## 14. Persona: Importer for clinical investigation only

A narrow variant of §13 that imports devices solely for **clinical investigation, test, evaluation, demonstration, or training** — never for commercial sale. Operates on a different form pair with shorter validity.

| Aspect | Commercial import (§13) | Test import (§14) |
|---|---|---|
| Form pair | MD-14 → MD-15 | MD-16 → MD-17 |
| Permitted use | Sale + distribution | Trial / test / eval / demo / training ONLY [FAQ §59, §18] |
| Validity | Perpetual (5-yr retention) | **3 years from issue** [FAQ §19, IVD FAQ §67] |
| Commercial onward sale | Yes | **No** [FAQ §59 undertaking] |
| Fee (IVD) | $10-$500 product + site fee | $100 flat across all classes [IVD FAQ §66] |
| Audit overseas site | Possible at CLA discretion | Generally no |
| Documentation depth | Full DMF/PMF/QMS | Lean — declaration-based |

Sub-cases:

| Sub-case | What it covers |
|---|---|
| 14.1 | Test import for clinical investigation (with parallel MD-22 → MD-23) |
| 14.2 | Test import for technical evaluation / verification testing |
| 14.3 | Test import for demonstration / training (sales force, clinician training events) |
| 14.4 | Test import of low-residual-shelf-life IVD samples (<60% shelf life remaining — allowed under IMPORT/Misc/2015-DC dt 01.12.2015 [IVD FAQ §92]) |

---

### 14.A Journey map

**Stage 1 — Identify purpose.** One of: clinical investigation / test / evaluation / demonstration / training. Listed on Form MD-16 serial #7.

**Stage 2 — Pre-application.**
- Identify Indian testing sites + per-site quantity
- Identify whether parallel MD-22 (CI permission) is needed

**Stage 3 — MD-16 application via NSWS portal** [SaMD Draft §3.0 for SaMD; same NSWS rule for all test licenses post-Oct 2025].

**Stage 4 — Permission and import.**
- 3-year validity from issue
- Multi-site permitted in single license [FAQ §47, IVD FAQ §68]

**Stage 5 — Trial / evaluation execution.**
- Cannot onward-sell
- For low-residual-shelf-life IVD samples: special permission via Rule 44 mechanism [IVD FAQ §93]

**Stage 6 — Post-trial.**
- If commercial intent: SEPARATE MD-14 → MD-15 application required; test license cannot be upgraded
- File trial results

---

### 14.B Document inventory

Per SaMD Draft Annexure A item C (Test License import for medical devices) — 9 sections:

1. Covering letter mentioning objective
2. Brief description of applied medical device
3. Proposed package insert / IFU / literature / user manual / pack size / quality certificates
4. Justification of quantity proposed to be imported
5. Test specification and protocol
6. Undertaking: device used exclusively for purpose specified at serial #7 of MD-16; NOT commercial
7. Undertaking: facilities, equipment, instruments, personnel available
8. Fee challan
9. Legal form

For IVD test import (Annexure A item D) — 11 sections with similar pattern plus:
- Quality certificates of manufacturer
- Labels and IFU per Rule 48
- Undertaking from testing laboratory

---

### 14.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Test-import intent (vs commercial) | Not asked | **None** |
| Purpose (CI / test / eval / demo / training) | Not asked | **None** |
| Testing sites | Not asked | **None** |
| Quantity justification | Not asked | **None** |
| Residual shelf life status (for IVD) | Not asked | **None** |

### 14.D Gap analysis

Test imports are a small percentage of CDSCO submissions but a near-100% requirement for novel-device pathway. Most ClearPath users on the Tier 2 CI / novel device path will need MD-16/MD-17.

**Critical gaps:**
1. **Test vs commercial import flag.**
   - *Recommended Sprint 3 question (if importer flag = yes from §13):* "Is this for commercial sale or for trial/evaluation only?" (commercial / test_for_ci / test_for_eval / test_for_demo / both_eventually)

2. **Testing sites count.**
   - Minor — usually informational, not a gating question.

Defer detailed test-import questions to Sprint 4 unless founder pipeline includes many novel-device test-importers.

---

## 15. Persona: Government hospital importing for unmet need

A specific narrow path used only by **Government hospitals or statutory medical institutions** to import small quantities of investigational medical devices for treatment of patients with **life-threatening disease / disease causing serious permanent disability / disease requiring therapy for unmet medical need** [Addendum FAQ §11].

Form pair: **MD-18 (application) → MD-19 (permission)**. Submitted via the online MD portal at `cdscomdonline.gov.in/NewMedDev/ViewDevicePersonal` [Addendum FAQ §11].

Eligibility constraints:
- Importer must be Government hospital OR statutory medical institution
- Device must be **investigational MD** that is approved in country of origin
- Specifically for patient-level treatment under one of three indications: life-threatening / serious permanent disability / unmet medical need
- **Cannot use MD-18 for non-investigational devices** — those go through normal MD-14/15 [Addendum FAQ §12]

This persona is **narrow and operationally distinct** from §13 and §17:

| Persona | Importer type | Use | Quantity |
|---|---|---|---|
| §13 | Indian Authorised Agent | Commercial sale | Bulk |
| §15 | Government hospital | Treatment of specific patient(s) under unmet-need indication | Small |
| §17 | Patient / nominee | Personal use | Personal-scale |

---

### 15.A Journey map

**Stage 1 — Clinical assessment.** Treating physician determines device is needed under one of three indications. Hospital governance approval typically required (`UNCERTAIN: institutional medical board or DGHS-level sign-off, not codified in MDR-2017 text I extracted`).

**Stage 2 — Verify device qualifies.** Must be investigational MD, approved in country of origin (e.g., FDA approval / CE mark / equivalent).

**Stage 3 — MD-18 application.**
- Submit via online portal
- `UNCERTAIN: detailed checklist for MD-18 — Addendum FAQ §11 references it but the full document list was not separately extracted in this drafting session`
- Likely includes: cover letter from Medical Superintendent or DGHS-level officer, clinical justification, foreign approval documentation, patient case summary, undertaking on non-commercial use

**Stage 4 — CLA permission MD-19.** Issued for specific quantity, specific use.

**Stage 5 — Import and treatment.**
- Through notified ports
- Documentation in patient record
- No onward sale

**Stage 6 — Post-treatment.**
- AE / SAE reporting if any
- Hospital records retained per medical records norms

---

### 15.B Document inventory

`UNCERTAIN — detailed MD-18 checklist not extracted in this drafting session. Anticipated content (subject to consultant verification):`

- Cover letter from hospital Medical Superintendent or equivalent
- Patient case summary justifying unmet need
- Foreign approval documentation (FDA / EMA / TGA / Health Canada / PMDA approval letter)
- Clinical evidence supporting safety/performance
- Undertaking: small quantity, no commercial sale
- Hospital's statutory institution proof
- Treating physician's recommendation

### 15.C ClearPath question coverage

This persona is essentially never directly applicable to a startup founder (the importer is a Government hospital, not a startup) — ClearPath question coverage analysis is moot. The persona is documented for completeness and for ClearPath's eventual role as a knowledge base for hospital/PSU customers.

### 15.D Gap analysis

Not a ClearPath product priority. Defer indefinitely unless a B2G expansion path is considered.

---

## 16. Persona: Loan licensee manufacturer

A loan licensee is **a person granted a license to manufacture a medical device using another licensee's manufacturing site**, manufacturing the same device the host licensee already manufactures there [FAQ §82; Rule 3(z) MDR-2017; IVD FAQ §103]. This is a contract-manufacturing arrangement where the brand owner doesn't need to own infrastructure.

Two sub-cases by class:

| Sub-case | Class | Form pair | Authority |
|---|---|---|---|
| 16.1 | Class A / Class B loan license | MD-4 → MD-6 | SLA |
| 16.2 | Class C / Class D loan license | MD-8 → MD-10 | CLA |

Key constraint: the loan licensee can manufacture **only the same device that the host (primary) licensee already manufactures at that site**. Not a wholesale outsourcing arrangement for arbitrary devices.

`UNCERTAIN: DTAB Apr 2025 allowance for sterilisation outsourcing was referenced by the founder during scoping. Cannot confirm from CDSCO primary sources during this drafting session — DTAB meeting minutes for Apr 2025 not separately extracted. Worth specific consultant attention as it may shift this persona's economics significantly.`

---

### 16.A Journey map

**Stage 1 — Pre-engagement.**
- Identify host primary licensee already manufacturing the exact device at the exact site
- Negotiate loan licensing agreement (commercial terms, IP, quality oversight)
- Verify host's license is active and not suspended

**Stage 2 — Agreement and undertaking.**
- Formal written agreement between loan licensee and host licensee
- Host licensee signs undertaking to make site/facilities available
- Loan licensee submits its own constitution + wholesale/sale licence

**Stage 3 — Application.**
- MD-4 (Class A/B) or MD-8 (Class C/D) via portal
- Document checklist mirrors MD-3/MD-7 with substitutions:
  - Plant Master File: reference to host's existing PMF (with consent letter)
  - QMS: relies on host's Fifth-Schedule-compliant QMS with loan licensee oversight
  - Device Master File: loan licensee's own DMF (may share substantial design with host)

**Stage 4 — Audit / inspection.**
- Class A loan license: SLA grants without prior audit; Notified Body audit of host site within 120 days
- Class B loan license: NB audit within 90 days of application
- Class C/D loan license: CDSCO MD Officer team inspection within 60 days of application [FAQ §27 applies symmetrically to loan licensee]

**Stage 5 — License grant.**
- MD-6 (Class A/B) or MD-10 (Class C/D)
- Valid as long as host license remains valid
- Loan licensee can sell under its own brand

**Stage 6 — Post-market.**
- Loan licensee responsible for PMS of devices manufactured under its license
- Host licensee maintains QMS / site-level compliance
- Any host-license issue cascades to loan licensee

---

### 16.B Document inventory

`UNCERTAIN — detailed MD-4 / MD-8 checklists not separately extracted; SaMD Draft Annexure A covers MD-3 / MD-7 but not loan-license variants. Likely structure:`

- Most of §4.B blocks apply
- Plus: formal agreement between loan licensee and host
- Plus: host's manufacturing license copy + consent letter
- Plus: loan licensee's constitution / wholesale license / MD-42
- Substitute: PMF reference to host (with consent)

---

### 16.C ClearPath question coverage

| Data point needed | ClearPath source | Coverage |
|---|---|---|
| Loan licensee path intent | Not asked | **None** |
| Host primary licensee named | Not asked | **None** |
| Agreement in place | Not asked | **None** |

### 16.D Gap analysis

Loan licensee is increasingly relevant as startup founders use contract manufacturers to skip plant capex.

**Recommended Sprint 3+ question (Tier B core):** "How are you planning to manufacture?" (own_facility / loan_license_with_named_partner / loan_license_partner_undecided / contract_manufacturing_outside_loan_license_framework / not_manufacturing_only_importing).

Note: contract manufacturing **outside** the loan license framework is a different regulatory posture — manufacturer holds license, brand owner is just a buyer. Loan licensee is specifically the partner who holds the license themselves.

---

## 17. Persona: Personal import / patient access

The narrowest import path: a **patient or nominee** applies for a small-quantity personal-use import of a medical device that is not yet licensed in India.

Form pair: **MD-20 (application) → MD-21 (permission)**. Submitted via `cdscomdonline.gov.in/NewMedDev/ViewDevicePersonal` [Addendum FAQ §23].

This persona is **functionally invisible** to ClearPath's startup-founder audience but is documented for completeness:

- Use case: Indian patient (or family member acting as nominee) needs a device not yet licensed in India for personal medical use
- Cannot be commercial quantity
- Cannot be onward-sold
- Must be supported by medical prescription from registered medical practitioner

### 17.A Journey map

**Stage 1.** Treating physician determines necessity. Patient/nominee obtains medical prescription.

**Stage 2.** Patient/nominee submits MD-20 application via portal with prescription + ID + justification.

**Stage 3.** CLA reviews and issues MD-21 if approved.

**Stage 4.** Import for personal use.

### 17.B Document inventory

- MD-20 application
- Medical prescription from RMP
- Patient ID
- Justification of necessity
- Device details + foreign approval if applicable
- Quantity declaration

### 17.C ClearPath question coverage

Not applicable to ClearPath's startup-founder audience.

### 17.D Gap analysis

No ClearPath product priority. Documented for completeness.

---

# PART III — FORM-CENTRIC REFERENCE

*Same regulatory content as Part II but indexed by form number — for regulator quick-reference and team training. Each form sub-section contains: purpose, when applicable, prerequisites, document checklist (full), timeline, fees, common rejection reasons.*

## 18. Manufacturing License forms

This section indexes the manufacturing license form set by form number. For the application-to-grant pair (MD-3 → MD-5, MD-7 → MD-9 etc.), document checklists are largely identical — only Stage 5/6 audit timing differs. Full per-class document inventory is in [§4.B](#4-persona-medical-device-manufacturer-hardware). This section adds: precise definitions, fees, timelines, rejection reasons.

### 18.1 Form MD-3 — application for manufacturing license (Class A measuring/sterile + Class B)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Application for manufacturing license to manufacture for sale or distribution Class A (other than non-sterile non-measuring) or Class B medical device | Rule 21 MDR-2017 |
| Authority | State Licensing Authority (SLA) | [FAQ §6, §80] |
| Portal | `cdscomdonline.gov.in` | [FAQ §8] |
| Fee mode | Challan or electronic mode to State Licensing Authority (via State Government method) | [FAQ §53] |
| Granted as | MD-5 | |
| Audit timing | Class A: NB audit within 120 days **post-grant**; Class B: NB audit within 90 days **of application** [FAQ §81; IVD FAQ §97] |

**Checklist (verbatim from SaMD Draft Annexure A items I & J, applies symmetrically to MD-3 for both Class A and Class B):**
- §1 Covering letter
- §2 Application form (MD-3 / MD-4 — common checklist; MD-4 for loan license)
- §3 Fee challan
- §4 Constitution of firm
- §5 Establishment / site ownership / tenancy agreement
- §6 Plant Master File (Appendix I, Fourth Schedule) — 11 sub-sections
- §7 QMS Requirements (Fifth Schedule) — 11 sub-sections including undertaking, Quality Manual, controls, environmental requirements
- §8 DAHD approval for veterinary devices
- §9 Other additional documents
- §10 Test License MD-13 (if obtained)
- §11 MD-27 permission (if no predicate)
- §12 Device description (intended use, materials, working principle, specifications, variants, accessories)
- §13 Labelling information
- §14 Essential Principles checklist
- **For Class B only:** §12 Device Master File (Appendix II, Fourth Schedule) — full 20 sub-sections including all conditional blocks (biocompatibility / drug / sterilisation / software / animal / stability / clinical evidence / PMS / batch release)

**Common rejection reasons:**
- Plant Master File missing personnel qualifications [PMF §6.3]
- QMS undertaking not signed by competent authority [QMS §7.1]
- Annexure A environmental requirements not tabled [QMS §7.11]
- DMF missing essential principles checklist [DMF §8.8 for Class B]
- Wrong fee submitted (separate fee per brand required — [FAQ §15])

---

### 18.2 Form MD-4 — application for loan manufacturing license (Class A/B)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Loan license for Class A/B — applicant uses host licensee's facility | Rule 21; FAQ §82 |
| Authority | SLA | |
| Granted as | MD-6 | |
| Prerequisites | Host primary licensee active; written agreement between loan licensee and host |

Checklist mirrors MD-3 with substitutions:
- PMF: reference to host's PMF + consent letter
- Add: agreement between loan licensee + host; host's license copy
- Add: loan licensee's wholesale/sale license

`UNCERTAIN — detailed MD-4 checklist not separately extracted; consultant to verify variations.`

---

### 18.3 Form MD-5 — manufacturing license granted (Class A/B)

The grant form CDSCO/SLA issues upon approving MD-3. Perpetual validity with 5-year retention [FAQ §55]. Carries conditions specified in the covering letter [FAQ §66].

### 18.4 Form MD-6 — loan license granted (Class A/B)

Grant form for MD-4. Same validity rules.

---

### 18.5 Form MD-7 — application for manufacturing license (Class C/D)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Application for manufacturing license to manufacture for sale or distribution Class C / Class D medical device | Rule 21 MDR-2017 |
| Authority | Central Licensing Authority (CDSCO HQ / Zonal) | [FAQ §6, §80] |
| Portal | `cdscomdonline.gov.in` | [FAQ §8] |
| Granted as | MD-9 | |
| Audit timing | CDSCO MD Officer team inspection within **60 days of application** [FAQ §27] |

**Checklist (verbatim from `7MD.pdf` + SaMD Draft Annexure A item L):**

Sections 1-7 same as MD-3 (legal + PMF + QMS).

§8 — Device Master File (Appendix II, Fourth Schedule), 20 sub-sections:
- 8.1 Executive Summary
- 8.2 Descriptive info
- 8.3 Grouping justification
- 8.4 Product specification (variants, accessories)
- 8.5 Substantial equivalence with predicate
- 8.6 Labelling info
- 8.7 Device design + mfg info
- 8.8 Essential Principles conformity checklist
- 8.9 Risk analysis + control summary
- 8.10 V&V
- 8.11 Biocompatibility (if applicable)
- 8.12 Medicinal substances (if device contains drug)
- 8.13 Biological safety (if applicable)
- 8.14 Sterilisation validation (if applicable)
- 8.15 Software V&V (if software used)
- 8.16 Animal preclinical (if any)
- 8.17 Stability (real-time + accelerated)
- 8.18 Clinical evidence (if any)
- 8.19 PMS data (vigilance)
- 8.20 Batch release certificates ≥3 consecutive / software version release certificate

§9 Other additional documents.
§10 Test License MD-13 (if any).
§11 MD-27 permission (if no predicate).

**Endorsement variant (adding additional device to existing license):**
- Reduced checklist: copy of mfg license + PMF undertaking (no major change) + QMS undertaking + Annexure A + DMF for new device.

**Retention variant (every 5 years):**
- 14-item checklist including covering letter, signed retention form, fee, copy of existing license, endorsements, deleted devices, fee breakup, constitution undertaking, DMF/PMF undertaking (no major change), technical staff qualifications, 5-year PMS data, PAC history.

**Common rejection reasons:**
- Predicate device claim doesn't satisfy Rule 51 [FAQ §50]
- Clinical evidence inadequate for Class D scrutiny
- Software V&V missing for SaMD-bearing devices [DMF §8.15]
- Sterilisation validation missing for sterile devices [DMF §8.14]
- Missing MD-27 for no-predicate devices [FAQ §118]
- Class disputed by CDSCO (higher class adopted per IMDRF discrepancy rule [FAQ §93])

---

### 18.6 Form MD-8 — application for loan manufacturing license (Class C/D)

Loan license variant for Class C/D, CLA-issued. Granted as MD-10. Same constraints as MD-4 (host licensee, same device, same site).

### 18.7 Form MD-9 — manufacturing license granted (Class C/D)

Grant form for MD-7. Perpetual validity with 5-year retention [FAQ §55]. Validity contingent on continued QMS compliance + annual inspection (1 inspection during validity period per IVD FAQ §98 — likely applies symmetrically to MD).

### 18.8 Form MD-10 — loan license granted (Class C/D)

Grant form for MD-8.

---

### 18.9 Self-notification / registration — Class A non-sterile non-measuring

No form number. Online portal registration at `cdscomdonline.gov.in` per Chapter IIIB MDR-2017.

| Attribute | Value | Source |
|---|---|---|
| Required documents | Manufacturer details, device description, label, IFU, applicable standards declaration | [FAQ §69] |
| Fee | **None** | [FAQ §71] |
| Audit prior to grant | None | [FAQ §81(i)] |
| Output | System-generated registration number | [FAQ §70] |
| Exempted chapters of MDR-2017 | IV, V, VII, VIII, XI | [FAQ §69] |
| Still required | Labelling per Chapter VI; applicable standards; notified-port import [Addendum §31] |

Note: not strictly a "license" — but functions as the regulatory permission to manufacture/import. Free Sale Certificate / NCC / MSC requests for Class A go to the State Licensing Authority [FAQ §73].

## 19. Import License forms

### 19.1 Form MD-14 — application for import license (all classes except A non-sterile non-measuring)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Application for import license to import medical device for sale/distribution | Rule 36 MDR-2017 |
| Authority | CLA (CDSCO HQ) — all classes go central | [FAQ §6, §88] |
| Portal | `cdscomdonline.gov.in` | |
| Documents | Fourth Schedule Part I + Part II + Part III (Appendix I & II for MD; Appendix I & III for IVD `UNCERTAIN`) | [FAQ §89, IVD FAQ §35] |
| Granted as | MD-15 | |
| Timeline | **9 months** if data satisfactory | [FAQ §97] |
| Overseas audit | At CLA discretion, before or after grant | [FAQ §98] |

Key documents (full inventory in [§13.B](#13-persona-importer-of-foreign-manufactured-device)):
PoA (apostilled), wholesale/mfg license of IAA, FSC from country of origin (both legal + actual mfg named), QMS cert (ISO 13485), NB/NRA audit ≤3 years, PMF, DMF/IVD-MF, label, IFU, conditional NOCs (DAHD/BARC/PNDT).

For Class A non-sterile non-measuring imports: only registration via portal — no MD-14, no fee for product registration, but still imported through notified ports [FAQ §88, Addendum §31].

**Common rejection reasons:**
- Certificate of Exportability submitted instead of FSC [FAQ §111, IVD FAQ §90]
- PoA not apostilled [Addendum §3]
- FSC missing legal-or-actual manufacturer name [FAQ §108]
- For non-stringent-country Class C/D IVD: missing in-India CPE [IVD FAQ §91]
- Notified port not used at import-clearance [FAQ §106]

### 19.2 Form MD-15 — import license granted

Grant form for MD-14. Perpetual with 5-year retention [FAQ §55].

### 19.3 Form MD-16 — application for test license to import

See [§20.3](#203-form-md-16--application-for-test-license-to-import). Form pair for test-import is purpose-tied (CI / test / eval / demo / training), not class-tied.

### 19.4 Form MD-17 — test license to import granted

3-year validity from issue [FAQ §19, IVD FAQ §67]. Fee USD 100 flat for all IVD classes [IVD FAQ §66].

### 19.5 Form MD-18 — application for import (Govt hospital, investigational MD, unmet need)

| Attribute | Value | Source |
|---|---|---|
| Eligibility | Government hospital OR statutory medical institution | [Addendum FAQ §11] |
| Permitted devices | Investigational MD approved in country of origin | |
| Permitted indications | Life-threatening / serious permanent disability / unmet medical need | |
| Granted as | MD-19 | |
| Portal | `cdscomdonline.gov.in/NewMedDev/ViewDevicePersonal` | |

Cannot use MD-18 for non-investigational devices — those go through MD-14/15 [Addendum §12].

### 19.6 Form MD-19 — import license granted (govt hospital, investigational)

Grant form for MD-18.

### 19.7 Form MD-20 — application for personal import

| Attribute | Value | Source |
|---|---|---|
| Eligibility | Patient or nominee | [Addendum FAQ §23] |
| Permitted use | Small quantity, personal use only | [FAQ §103] |
| Documents | Medical prescription, patient ID, justification | |
| Granted as | MD-21 | |
| Portal | `cdscomdonline.gov.in/NewMedDev/ViewDevicePersonal` | |

### 19.8 Form MD-21 — personal import permission granted

Grant form for MD-20.

---

## 20. Test License (manufacture and import) forms

> **Authoritative form-mapping correction.** Some popular blogs, consultants, and even internal ClearPath docs invert MD-12 ↔ MD-16. The **CDSCO Regulatory Pathway flowchart** and MD FAQ §18 are unambiguous: MD-12/13 = **manufacture** test license; MD-16/17 = **import** test license. This document uses the authoritative mapping throughout.

### 20.1 Form MD-12 — application for test license to manufacture

| Attribute | Value | Source |
|---|---|---|
| Purpose | Test license to manufacture small quantities for clinical investigation / test / evaluation / demonstration / training | [FAQ §18, §59] |
| Authority | CLA (test licenses for all classes are central) | [FAQ §6 — CLA covers "Test licences for manufacture or import of all classes"] |
| Portal | **NSWS** `nsws.gov.in` (not the MD online portal) | [SaMD Draft §3.0; Rule 31] |
| Granted as | MD-13 | |
| Validity | 3 years from issue [FAQ §19] | |
| Class-tied? | **No** — purpose-tied [§20 intro above] | |

**Checklist for medical device test license (per SaMD Draft Annexure A item A):**
1. Covering letter mentioning objective
2. Brief device description with intended use
3. Manufacturing flow chart, test specification, test protocol
4. Proposed package insert / IFU / literature / user manual / pack size
5. List of mfg + testing equipment
6. List of qualified personnel
7. Justification of proposed quantity
8. Undertaking on facilities + equipment + personnel
9. Manufacturing license of premises (if any)
10. Approval letter for R&D from any govt org (if any)
11. Fee challan
12. Legal form

For IVD test license (Annexure A item B), 16-section variant with additional:
- Raw material procurement description
- Site certification with raw component detail
- Schematic plan of premises
- Quality certificates of upstream raw-material manufacturers

### 20.2 Form MD-13 — test license to manufacture granted

Grant form for MD-12. 3-year validity. Multi-site permitted [FAQ §47, IVD FAQ §68].

### 20.3 Form MD-16 — application for test license to import

| Attribute | Value | Source |
|---|---|---|
| Purpose | Test license to import small quantities for CI / test / eval / demo / training | [FAQ §18] |
| Authority | CLA | |
| Portal | NSWS `nsws.gov.in` | [SaMD Draft §3.0; Rule 40] |
| Granted as | MD-17 | |
| Validity | 3 years from issue | [FAQ §19, IVD FAQ §67] |
| Fee (IVD) | USD 100 flat | [IVD FAQ §66] |

Checklist for MD-16 (Annexure A item C) — 9 sections, leaner than MD-12 since no plant infrastructure:
1. Covering letter
2. Brief device description
3. Package insert / IFU / quality certs
4. Justification of quantity
5. Test specification + protocol
6. Undertaking on exclusive use (NOT commercial)
7. Undertaking on testing facilities
8. Fee challan
9. Legal form

### 20.4 Form MD-17 — test license to import granted

Grant form for MD-16. Same constraints as MD-13.

---

## 21. Clinical Investigation forms

### 21.1 Form MD-22 — application for permission to conduct clinical investigation on investigational MD

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission to conduct CI on investigational medical device on human participants | [FAQ §113] |
| Authority | CLA | |
| Portal | `cdscomdonline.gov.in` | |
| Granted as | MD-23 | |
| Fee | Waived for govt-funded/owned institutions | [FAQ §124] |

**Required when**: device is investigational MD (no predicate, or licensed with new claim/population/material/major design change). Not required for academic study on already-licensed device (EC approval only, but data not usable for marketing) [FAQ §121-123]. Not required for Class A non-sterile non-measuring devices [Addendum §22].

**Checklist (Annexure A item E) — 22 sections.** Full inventory in [§9.B Block 1](#9-persona-clinical-investigation-researcher-medical-device).

### 21.2 Form MD-23 — CI permission granted

Grant form for MD-22. Validity: **1 year from grant** [FAQ §125]. Re-permission required if study not initiated in time.

PSUR obligations post-grant: 6-monthly first 2 years, annual next 2 years [FAQ §126].

### 21.3 Form MD-26 — application for permission to import/manufacture investigational MD (no predicate)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission to commercially import/manufacture an investigational MD that has no predicate, prior to manufacturing/import license | [FAQ §118, Addendum §19] |
| Authority | CLA | |
| Granted as | MD-27 | |

**Inter-form sequencing (Addendum FAQ §19):**

```
Test License (MD-13 mfg or MD-17 import)
    ↓
MD-26 application + clinical evidence
    ↓
MD-27 permission
    ↓ (if clinical data inadequate) → MD-22 → MD-23 CI → re-submit
    ↓
Marketing license MD-3/7/14
```

**Checklist (Annexure A item G) — 20 sections.** Full inventory in [§9.B Block 2](#9-persona-clinical-investigation-researcher-medical-device).

### 21.4 Form MD-27 — investigational MD permission granted

Grant form for MD-26. Required BEFORE any commercial mfg/import license for novel devices.

---

## 22. IVD-specific forms

### 22.1 Form MD-24 — application for permission to conduct clinical performance evaluation on new IVD

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission to conduct CPE on new IVD | [SaMD Draft §4.10] |
| Authority | CLA | |
| Granted as | MD-25 | |

**Required when:** new IVD Class B/C/D. Class A generally exempt unless CLA invokes case-by-case [IVD FAQ §59].

**Checklist (Annexure A item F) — 12 sections.** Full inventory in [§10.B Block 1](#10-persona-clinical-performance-evaluation-researcher-ivd).

### 22.2 Form MD-25 — CPE permission granted

Grant form for MD-24.

### 22.3 Form MD-28 — application for permission to manufacture/import new IVD

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission to manufacture/import new IVD prior to marketing license | [SaMD Draft §4.11] |
| Authority | CLA | |
| Granted as | MD-29 | |

**Checklist (Annexure A item H) — 24 sections.** Full inventory in [§10.B Block 2](#10-persona-clinical-performance-evaluation-researcher-ivd).

### 22.4 Form MD-29 — new IVD permission granted

Grant form for MD-28. Required BEFORE any commercial mfg/import license for new IVDs.

### 22.5 IVD Master File — appendix authority

**IVD Master File contents are in Appendix II of Fourth Schedule** per IVD FAQ §102 — the authoritative source.

`UNCERTAIN — INCONSISTENCY IN CDSCO PUBLISHED MATERIALS`: SaMD Draft Annexure A items H (MD-28 checklist §9), K (Class A/B IVD MD-3 §4), and M (Class C/D IVD MD-7 §-equiv) reference "Appendix III of Fourth Schedule" instead. IVD FAQ §102 is more recent and IVD-specific; SaMD Draft is a republication. **Flagged for consultant** in §36 — needs primary-text confirmation against current rule version.

---

## 23. Sale/distribution forms

### 23.1 Form MD-41 — application for registration certificate (sale/stock/distribute)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Registration certificate to sell, stock, exhibit, offer for sale, or distribute medical devices | [FAQ §144-145] |
| Authority | SLA | |
| Granted as | MD-42 | |
| Timeline | 10 days from application if data satisfactory | [FAQ §147] |

Applies to traders/distributors who ONLY stock/sell/distribute medical devices (not under wholesale license under Drug Rules 1945) [FAQ §144]. Wholesale license under Drug Rules 1945 (Forms 20B/21B/21C) also valid for MD stock/distribute [FAQ §143].

### 23.2 Form MD-42 — registration certificate granted

Grant form for MD-41. Perpetual validity with 5-year retention [FAQ §148].

---

## 24. Pharma forms (NDCT 2019 and Drug Rules 1945)

### 24.1 Form CT-04 — application for permission to conduct clinical trial

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission to conduct CT of new drug or IND | [NDCT FAQ §14] |
| Authority | CLA (DCG(I)) | |
| Granted as | CT-06 | |
| Fee | Per Sixth Schedule NDCT 2019; waived for govt-funded/owned institutions | [NDCT FAQ §15] |
| Timeline | 90 working days (general); 30 working days (India-discovered) with deemed approval | [NDCT FAQ §18-19] |

### 24.2 Form CT-04A — pre-initiation notification (deemed-approval mechanism)

| Attribute | Value | Source |
|---|---|---|
| Purpose | Pre-initiation notification by sponsor/investigator before initiating trial; serves as automatic approval after deemed-approval clock | [NDCT FAQ §22] |

Even after CDSCO deemed approval, the sponsor must file CT-04A before initiating. CDSCO takes on record; CDSCO can still review and act for non-compliance even after deemed approval [NDCT FAQ §21].

### 24.3 Form CT-05 — application for BA/BE study permission

| Attribute | Value | Source |
|---|---|---|
| Purpose | Permission for BA/BE study of new drug or IND | [NDCT FAQ §13] |
| Authority | CLA | |
| Granted as | CT-06 | |

### 24.4 Form CT-06 — clinical trial permission granted

| Attribute | Value | Source |
|---|---|---|
| Purpose | Grant form CDSCO issues for CT-04 / CT-05 / CT-04A approvals | [NDCT FAQ §15, §25] |
| Validity | 2 years from grant | [NDCT FAQ §25] |

### 24.5 Form CT-07 — `UNCERTAIN`

`UNCERTAIN: NDCT 2019 has subsequent CT-form numbers (likely annual safety / status report or similar) but exact form-level details not separately extracted in this drafting session. Pending consultant confirmation.`

### 24.6 Drug Rules 1945 manufacturing forms

`UNCERTAIN: Drug Rules 1945 manufacturing license form numbering not fully verified in this drafting session.` Likely (subject to primary-text confirmation):
- **Form 22** — manufacturing license application (drugs other than restricted)
- **Form 25** — manufacturing license granted (drugs other than restricted)
- **Form 28** — restricted/Schedule X drug license

Schedule M (GMP requirements for pharmaceutical manufacturing) was revised in 2025; key for manufacturing license documentation.

---

# PART IV — CLEARPATH QUESTION COVERAGE (THE MOAT)

## 25. Current ClearPath question inventory

The strategic value of this section: any future "do we cover X path?" question can be answered by reading this question inventory + the persona gap analysis in Part II.

### 25.1 Intake fields

Source: `lib/intake/validation.ts` + `app/api/intake/route.ts`.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | yes | non-empty |
| `email` | string | yes | EMAIL_REGEX `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `mobile` | string | no | when filled, exactly 10 digits (optional +91 prefix tolerated) |
| `one_liner` | string | yes | 20-300 chars; placeholder leak detection rejects "e.g." prefix |
| `url` | string | no | http(s):// + valid host |
| `uploaded_docs` | array | no | each with `doc_type` (pitch_deck / spec / regulatory_doc / other) |

### 25.2 Tier A wizard (free tier — locked since Sprint 1)

Source: `lib/wizard/questions.ts`. Seven questions:

| Step | Field | Kind | Required | Options |
|---|---|---|---|---|
| Q1 | `clinical_state` | radio | yes | critical / serious / non_serious / varies |
| Q2 | `decision_influence` | radio | yes | informs_only / drives / diagnoses_treats |
| Q3 | `user_type` | radio | yes | hcps / patients / both / admin |
| Q4 | `year_1_users` | radio | no | under_10k / 10k_to_1l / 1l_to_10l / over_10l |
| Q5 | `integration` | radio | no | abdm / hospital / both / neither |
| Q6 | `data_types` | checkbox | no | phi / imaging / genomic / prescription / insurance / none |
| Q7 | `commercial_stage` | radio | no | pre_mvp / mvp / scaling / filed |

### 25.3 Tier B wizard (paid tier — Sprint 2 Story 2.5)

Source: `lib/wizard/tier-b-questions.ts`. Six core + two conditional:

| Field | Tier | Kind | Required | Trigger |
|---|---|---|---|---|
| `b1_intended_use_statement` | core | textarea | yes | Always |
| `b2_use_environment` | core | radio | yes | Always (home/opd/inpatient/surgical/pre_hospital/mixed) |
| `b3_predicate_devices` | core | predicate_picker | yes | Always (up to 3 entries) |
| `b4_risks_and_mitigations` | core | risk_mitigation_pairs | yes | Always (Risk Card top_gaps prefill) |
| `b5_clinical_evidence_status` | core | radio | yes | Always (none / pilot_data / published_study / multi_center_trial) |
| `b6_iso_13485_status` | core | radio | yes | Always (certified / in_progress / not_started / not_applicable) |
| `c1_software_lifecycle_model` | conditional | radio | yes | When software/AI present (waterfall / agile / hybrid / not_applicable) |
| `c2_cybersecurity_posture` | conditional | cybersecurity | yes | When identifiable PHI handled |

### 25.4 Pitch deck AI extraction fields (Sprint 2 Story 2.5 Phase 2)

Source: `lib/intake/pitch-extract-prompt.ts`. STRICT JSON schema extracted by Claude Opus from uploaded pitch deck:

| Field path | Type | Notes |
|---|---|---|
| `device_name` | string \| null | |
| `intended_use_one_liner` | string \| null | 1-2 sentences |
| `suggested_classification` | "A" \| "B" \| "C" \| "D" \| "unknown" \| null | |
| `suggested_wizard_answers.intended_use` | string \| null | 2-4 sentences plain language |
| `suggested_wizard_answers.device_class` | enum \| null | class_a_b / class_c_d / samd_class_a_b / samd_class_c_d / wellness |
| `suggested_wizard_answers.ai_ml` | enum \| null | none / static / adaptive |
| `suggested_wizard_answers.data_sensitivity` | enum \| null | none / deidentified / identifiable |
| `suggested_wizard_answers.target_market` | array | "india" \| "us" \| "eu" \| "other" |
| `company.legal_name` | string \| null | |
| `company.constitution` | string \| null | Pvt Ltd / Public Ltd / LLP / Partnership / Proprietorship |
| `company.cin` | string \| null | Indian CIN |
| `company.registered_address` | string \| null | |
| `company.manufacturing_address` | string \| null | if different |
| `company.founded_year` | string \| null | 4-digit year |
| `company.team_size` | string \| null | headcount as written |
| `product_meta.model_number` | string \| null | |
| `product_meta.sterile` | string \| null | Sterile / Non-sterile |
| `product_meta.patient_population` | string \| null | |
| `product_meta.user_population` | string \| null | |
| `product_meta.setting_of_use` | enum \| null | home / opd / inpatient / surgical / pre_hospital / mixed |
| `confidence` | enum | high / medium / low |
| `notes` | string | max 1 sentence on unclear items |

**Total ClearPath question count: 7 (intake) + 7 (Tier A) + 8 (Tier B incl. conditional) + ~22 (AI-extracted) = ~44 distinct data points.**

---

## 26. Coverage analysis per persona × stage

This is the strategic moat content: a single matrix showing for each of 14 personas × 7 journey stages, what data is needed and whether ClearPath captures it today.

### 26.1 Coverage summary by persona

Distilled from the C and D sections of each persona in Part II. **Bold** = ClearPath captures it well; *italic* = partial / AI-extract only; (gap) = not captured.

| Persona | Strong coverage | Partial / AI-only | Critical gaps |
|---|---|---|---|
| §4 Hardware MD mfg | **intended use, user type, predicate (B3), risks (B4), evidence (B5), ISO (B6), environment (B2)** | *class, sterile binary, company info* | sterility mode, patient-contact type, drug content, veterinary, radioactive, predicate binary (Tier A), mfg location |
| §5 SaMD founder | **intended use, environment, data sensitivity, AI/ML presence, lifecycle (C1), cybersecurity (C2)** | *class, patient/user population* | deployment mode, algorithm details, ACP elements, predicate binary, cloud/data residency, autonomy degree |
| §6 AI/ML developer | **AI/ML presence + static/adaptive** | *cybersecurity broad* | algorithm type, training data, bias/subgroup validation, ACP 5 components, domain of learning, CERT-In |
| §7 IVD mfg | (none — IVD not flagged) | *class via AI extract* | **IVD-vs-MD flag, analyte+specimen, diagnostic level, output type, performance criteria, 3-batch, prohibited check, NOC flags, new-IVD-vs-predicate** |
| §8 Combination product | **intended use partially** | (sparse) | combination flag, drug approval status, PMOA self-declaration |
| §9 CI MD researcher | **clinical evidence (B5)** | (sparse) | sponsor type, foreign approval, pilot vs pivotal, EC status, CTRI, sample size |
| §10 CPE IVD researcher | (none — same as §7) | (sparse) | **CPE-specific evidence, MDTL engagement, HIV/HBsAg/HCV flag** |
| §11 Pharma mfg | (none — pharma not flagged) | (none) | drug flag, new-drug status, drug type — out of v1 scope |
| §12 Pharma CT researcher | (none) | (none) | phase, discovery origin, multi-country trial — out of v1 scope |
| §13 Foreign-mfg importer | (none directly) | *company info partial* | mfg location, country of origin, PoA/FSC/QMS status, IAA license held |
| §14 Test-import CI | (none) | (none) | test-vs-commercial flag, testing sites |
| §15 Govt hospital | n/a — not a startup persona | | |
| §16 Loan licensee | (none) | (none) | loan license intent, host licensee named, agreement |
| §17 Personal import | n/a | | |

### 26.2 Data points needed × persona table (compressed)

For brevity, this table lists only the **critical** data points that are needed somewhere and NOT captured. Medium/low gaps are in each persona's §D.

| Data point | Personas needing it | Currently captured? |
|---|---|---|
| **IVD-vs-MD flag** | 7, 10 (and routes 8) | **No** — fundamental gap |
| Pharma flag | 11, 12 | **No** — out of v1 scope explicit decision |
| Combination product flag | 8 | **No** |
| Mfg location (India / imported / both) | 4, 5, 6, 7, 13 | **Weak** — pitch extract address only |
| Country of origin (if imported) | 13 | **No** |
| Sterilisation mode (EtO / steam / radiation) | 4 | **No** — only binary sterile/not-sterile from pitch |
| Patient-contact type (ISO 10993 tier) | 4 | **No** |
| Drug content / combination | 4, 8 | **No** |
| Veterinary intended use | 4, 7 | **No** |
| Radioactive / ionising radiation | 4 | **No** |
| Predicate device exists? (Tier A binary) | 4, 5, 7 | **Weak** — only Tier B B3 |
| Sponsor vs investigator-initiated | 9 | **No** |
| Foreign regulatory approval (stringent country) | 9, 13 | **No** |
| Pilot vs pivotal stage | 9 | **No** |
| EC engagement status | 9, 12 | **No** |
| CTRI registration status | 9, 12 | **No** |
| Performance evaluation status (IVD-specific) | 7, 10 | **Weak** — Tier B B5 generic |
| MDTL engagement | 10 | **No** |
| HIV / HBsAg / HCV specific flag | 10 | **No** |
| Prohibited IVD category (TB sero, malaria Ab) | 7 | **No** — hard-stop risk |
| Three-batch consistency | 7, 10 | **No** |
| Analyte / specimen / diagnostic level (IVD) | 7, 10 | **No** |
| ACP 5 components | 6 | **No** |
| Cloud / data residency | 5, 6 | **No** |
| Software autonomy degree | 5, 6 | **No** |
| Deployment mode (cloud / mobile / desktop / embedded) | 5 | **No** |
| Algorithm type + training data | 6 | **No** |
| Subgroup / bias validation | 6 | **No** |
| CERT-In Safe-to-Host | 5, 6 | **No** |
| IAA license held (wholesale / mfg / MD-42) | 13 | **No** |
| PoA / FSC / QMS-cert status | 13 | **No** |
| Loan license intent | 16 | **No** |
| Host licensee for loan | 16 | **No** |

### 26.3 Gap matrix — by Sprint priority

**Sprint 3 critical (~12 questions):**
1. IVD-vs-MD flag (intake or Tier A early)
2. Pharma flag (intake)
3. Combination product flag (intake or Tier B)
4. Mfg location radio (Tier A or Tier B)
5. Predicate device binary (Tier A early)
6. Sterilisation mode (Tier B conditional on sterile)
7. Patient-contact type (Tier B core)
8. Drug content (Tier B core)
9. Veterinary (Tier A or Tier B)
10. Prohibited IVD hard-stop check (Tier B for IVD)
11. Country of origin (Tier A if imported)
12. CERT-In Safe-to-Host (Tier A or Tier B)

**Sprint 3 high-value (~8 questions for IVD founders specifically):**
13. Analyte + specimen + diagnostic level + output type (4 sub-questions, Tier B for IVD)
14. New-IVD-vs-predicate
15. MDTL engagement status
16. HIV/HBsAg/HCV flag (drives different thresholds)
17. Three-batch consistency
18. Performance evaluation evidence status
19. CPE permission status
20. NOC status (DAHD / BARC / PNDT)

**Sprint 4 valuable (~10 questions):**
21. SaMD deployment mode (multi-select)
22. SaMD autonomy degree
23. Cloud / data residency
24. Algorithm type + training data (4-field block)
25. Subgroup validation status
26. Sponsor vs investigator-initiated CI
27. Foreign regulatory approval (multi-select)
28. Pilot vs pivotal stage
29. Loan license intent + host
30. IAA license status (importers)

**Sprint 4+ defer (~10 questions):**
31. ACP 5-component descriptions (only for adaptive AI/ML)
32. Custom-made device flag
33. Radioactive / AERB
34. Pharma sub-domain questions (after pharma scoping decision)
35. Investigator brochure status
36. CTRI registration

### 26.4 Risk / mitigation map

For each gap not yet captured, what is the risk if ClearPath proceeds without the question?

| Gap | Risk if not captured | Mitigation |
|---|---|---|
| IVD-vs-MD flag | Generate wrong-path advice and Draft Pack (MD-22/23 instead of MD-24/25) | **HIGH priority Sprint 3** — fundamental routing gap |
| Prohibited IVD category | Customer pays Tier 2, builds Draft Pack for a path that CDSCO will reject outright | **HIGH priority Sprint 3** — hard-stop question prevents wasted effort |
| Sterilisation mode | Draft Pack DMF §8.14 will be incomplete; rejection on resubmit | **HIGH priority Sprint 3** for sterile products |
| Patient-contact type | Biocompatibility (DMF §8.11) under-scoped | **HIGH priority Sprint 3** for any patient-contact device |
| Country of origin | Stringent vs non-stringent CPE requirement missed | Medium priority — usually surfaceable from one-liner |
| ACP elements | AI/ML SaMD submission incomplete under Oct 2025 Draft | Medium priority — Sprint 4; bridge regime UNCERTAIN |
| Foreign regulatory approval | CI waiver opportunity missed | Low priority — surface via free-text |

---

## 27. Question expansion roadmap

### 27.1 Sprint 2 (current — Story 2.5 in flight)
- Tier B B1-B6 + C1/C2 paid wizard
- Pitch deck AI extraction (~22 fields)
- MD-7 / MD-3 path Draft Pack generation
- **Locked architecture per `docs/decisions/2026-05-12-wizard-architecture-audit.md`** — no changes to Tier A or Tier B structure mid-sprint

### 27.2 Sprint 3 — Path-branching expansion
**Goal:** Route accurately into the correct path (MD vs IVD vs combination vs pharma vs importer).

New questions (12 critical, see §26.3):
- Add 2-3 intake-stage questions (IVD flag, pharma flag, mfg location)
- Expand Tier A by 1-2 questions (predicate binary, country of origin)
- Add Tier B core questions for sterilisation / patient-contact / drug content / veterinary
- Add Tier B conditional cluster for IVD founders (8 questions in §26.3)
- Add hard-stop question for prohibited IVDs

### 27.3 Sprint 4 — Depth expansion
**Goal:** Capture SaMD / AI/ML specifics + importer details + loan license + CI specifics.

New questions (~10):
- SaMD-specific cluster (deployment mode, autonomy, cloud/data residency)
- AI/ML-specific cluster (algorithm type, training data block, subgroup validation, CERT-In)
- Importer cluster (IAA license, PoA/FSC/QMS status)
- Loan license intent
- CI-specific cluster (sponsor type, foreign approval, pilot vs pivotal)

### 27.4 Sprint 5+ / v2 — Strategic decisions
- Pharma scope decision: include or stay device-only?
- Combination product depth — full ACP for adaptive AI/ML; PMOA SEC referral support
- Veterinary-MD niche
- Custom-made device niche
- Govt hospital B2G expansion (§15)

### 27.5 Locked-architecture preservation rule

Any expansion to Tier A questions (Q1-Q7) requires re-architecture per the wizard architecture audit. New questions for Sprint 3+ should default to **Tier B core** (paying customers) or **Tier B conditional** (triggered by intake/Tier-A signal) rather than expanding Tier A. This preserves the free-vs-paid value tier and avoids regression risk for the Sprint 2 Story 2.5 wizard.

---

---

# PART V — OPERATIONAL DETAILS

## 28. Ethics Committee approval

The Ethics Committee (EC) is the gatekeeper for any human-subject research — clinical investigation (medical device), clinical performance evaluation (IVD), or clinical trial (pharma). This section is **`UNCERTAIN`-heavy** because most operational EC content lives in **ICMR's National Ethical Guidelines for Biomedical and Health Research Involving Human Participants** rather than CDSCO documents.

### 28.1 EC registration with CDSCO

| Pathway | EC registration source | Rule reference |
|---|---|---|
| Medical device CI (MD-22 → MD-23) | EC registered with CDSCO | Seventh Schedule MDR-2017; FAQ §121 implies registered EC requirement |
| IVD CPE (MD-24 → MD-25) | EC approval required as checklist §5 [SaMD Draft Annexure A item F] | |
| Pharma CT (CT-04 → CT-06) | EC registered under Rule 8 NDCT 2019 | [NDCT FAQ §11-12] |

`UNCERTAIN: confirm whether the EC registration list is shared across MDR-2017 + NDCT 2019, or whether MD-specific ECs are separately tracked. Likely shared, but flag for consultant.`

### 28.2 EC composition requirements

Per ICMR National Ethical Guidelines for Biomedical Research (2017 / 2025 revision):

`UNCERTAIN — specific composition rules pending ICMR primary-text extraction. Anticipated (subject to consultant verification):`
- Minimum 7 members including chairperson
- Mix of scientific + non-scientific members
- Independent of investigators / sponsors
- Member secretary (typically institutional)
- Quorum requirements for valid review

### 28.3 EC approval process and typical timelines

`UNCERTAIN — per-EC variable; not codified in MDR-2017 or NDCT 2019.` Industry-observed pattern:
- Initial review: 4-8 weeks from submission
- Continuing review: annual + per-amendment
- Expedited review for minor amendments (per EC SOP)

### 28.4 Where to find registered ECs

- CDSCO portal: `UNCERTAIN: link not extracted during this drafting pass; consultant to provide current authoritative URL`
- ICMR portal: `UNCERTAIN: link not extracted; ICMR National Registry of Ethics Committees (NRC-EC) is the historical reference`

### 28.5 EC role in MD-22 / MD-24 / CT-04 application

EC approval letter is a **mandatory checklist item** in all three application paths:
- MD-22 checklist §21 (Annexure A item E)
- MD-24 checklist §5 (Annexure A item F)
- CT-04 documents per Second Schedule NDCT 2019

### 28.6 Continuing review requirements

Per Seventh Schedule MDR-2017 + ICMR Guidelines: annual continuing review at minimum; amendments require fresh EC review; SUSARs reported to EC + CDSCO within 15 days [SaMD Draft §4.13.3 — SUSAR rule applies broadly].

---

## 29. Sample size determination

This section is `UNCERTAIN`-heavy by nature: CDSCO uses **case-by-case statistical justification** rather than bright-line minimums for either medical device CI or pharma CT.

### 29.1 Regulatory minimum vs statistical optimum

There is no regulatory minimum N for medical device CI under MDR-2017. The applicant must justify sample size based on:
- Primary endpoint variance (statistical power)
- Expected effect size
- Acceptable Type I + Type II error rates
- Stratification for subgroups (if applicable)

Reviewer (CLA + SEC) expects sample size justification embedded in the Clinical Investigation Plan (Seventh Schedule Table 5) [FAQ §114].

For IVD CPE: "statistically significant as per protocol designed and approved by respective MDTL" [IVD FAQ §61]. MDTL signs off on the protocol, including sample size.

### 29.2 ISO 14155 reference for medical device CI

ISO 14155:2020 (Clinical investigation of medical devices for human subjects — GCP) is the international standard for medical device CI design. `UNCERTAIN: whether ISO 14155 is BIS-adopted or formally referenced in MDR-2017 Seventh Schedule — likely cited indirectly via "applicable standards" clause.`

### 29.3 NDCT 2019 reference for pharma trials

Per NDCT 2019 + ICH-aligned guidance: sample size justification expected per Second Schedule. CDSCO + SEC review.

### 29.4 Phase-specific guidance (pharma)

`UNCERTAIN bright-line minimums — these are industry-typical, not regulatorily mandated:`
- **Phase 1** (first-in-human, healthy volunteers or specific patients): ~20-100
- **Phase 2** (initial efficacy + dose-finding): ~100-300
- **Phase 3** (pivotal efficacy): hundreds to thousands
- **Phase 4** (post-marketing): tens of thousands often

Pilot Clinical Investigation data for medical device may be required to design pivotal study [FAQ §127].

### 29.5 Pivotal vs feasibility (pilot) study distinction

| Aspect | Pilot (feasibility) | Pivotal |
|---|---|---|
| Purpose | Design parameters for pivotal | Confirm safety + performance for marketing |
| Sample size | Smaller, often single-site | Larger, multi-site preferred |
| Endpoint | Often surrogate or feasibility | Primary efficacy / safety |
| Required for licence | No (but pilot data may be required for novel devices per FAQ §127) | Yes for novel device commercialisation |

### 29.6 Case-by-case consultation recommendation

For novel devices or IVDs without published-precedent sample-size norms, **SEC consultation is appropriate**. `UNCERTAIN: SEC scheduling cadence and convening procedure.`

---

## 30. Fees structure

Aggregated from Second Schedule MDR-2017 + IVD FAQ §46-47 + NDCT FAQ §15. **Fees subject to change** — verify against current published Second Schedule before submission.

### 30.1 Medical device fees (INR for mfg, USD for import)

`UNCERTAIN: full medical device fee table not separately extracted from Second Schedule in this drafting session. IVD-side fees are confirmed below; MD-side fees follow similar structure but `UNCERTAIN` on exact values.`

### 30.2 IVD import fees (USD) [IVD FAQ §46]

| Class | Product fee | Manufacturing site fee |
|---|---|---|
| Class A | $10 | $1,000 |
| Class B | $10 | $1,000 |
| Class C | $500 | $3,000 |
| Class D | $500 | $3,000 |

### 30.3 IVD manufacturing fees (INR) [IVD FAQ §47]

| Class | Product fee | Manufacturing site fee |
|---|---|---|
| Class A | ₹500 | ₹5,000 |
| Class B | ₹500 | ₹5,000 |
| Class C | ₹1,000 | ₹50,000 |
| Class D | ₹1,000 | ₹50,000 |

### 30.4 Test license fees

| Category | Fee | Source |
|---|---|---|
| Test license import (all IVD classes) | USD 100 | [IVD FAQ §66] |
| Test license import (MD other than IVD) | `UNCERTAIN` | Second Schedule |
| Test license manufacture (any device) | `UNCERTAIN` | Second Schedule |

### 30.5 Clinical investigation / performance evaluation fees

- MD-22 CI permission: Per Second Schedule; **waived for govt-funded/owned institutions** [FAQ §124]
- MD-24 IVD CPE permission: Per Second Schedule
- MD-26 / MD-28 (no-predicate / new IVD) permission: Per Second Schedule; "for distinct product" basis [FAQ §129]
- CT-04 (pharma CT) permission: Per Sixth Schedule NDCT 2019; **waived for govt-funded/owned institutions** [NDCT FAQ §15]

### 30.6 Other fees

- Brand variations: separate fee per brand of a device [FAQ §15, IVD FAQ §24]
- Multiple manufacturing sites: separate fee per site [FAQ §96, §100]
- Retention (every 5 years): per Second Schedule, perpetual validity continues post-retention
- Major PAC: per Second Schedule for major changes; **no fee for minor changes** [FAQ §131, IVD FAQ §31]
- Refund: **No provision for refund** of paid fee, even if applicant withdraws application [FAQ §14, IVD FAQ §30]

### 30.7 Payment mechanism

- For SLA-issued licenses: challan or State Government-specified electronic mode [FAQ §53]
- For CLA-issued licenses: **BharatKosh** — Government's centralised e-receipts portal (`bharatkosh.gov.in`)
- `UNCERTAIN: confirm whether all MD payments now go via BharatKosh exclusively or whether legacy bank-challan mode persists for SLA cases`

---

## 31. Timelines

Aggregated from MD FAQ + IVD FAQ + Addendum FAQ + NDCT FAQ + SaMD Draft.

### 31.1 Application processing timelines

| Pathway | Timeline | Outcome if no response | Source |
|---|---|---|---|
| Class A non-sterile non-measuring registration | Immediate (system-generated) | n/a | FAQ §70 |
| Class A measuring/sterile (MD-5) — application processing | `UNCERTAIN: not explicitly stated in FAQ; likely 60-90 days` | n/a | |
| Class A NB audit | Within **120 days post-grant** | License continues pending audit | IVD FAQ §97 |
| Class B NB audit | Within **90 days of application** | Cannot proceed without audit | IVD FAQ §97 |
| Class C/D CDSCO MD Officer inspection | Within **60 days of application** | Cannot proceed without inspection | FAQ §27, §81 |
| Import license MD-15 grant | **9 months** | Pending data satisfactoriness | FAQ §97 |
| MD-42 (sale/distribution registration) | **10 days** | n/a | FAQ §147 |
| Major PAC (manufacturing) | **45 days** | Deemed approved | FAQ §136 |
| Major PAC (import) | **60 days** | Deemed approved | FAQ §136, IVD FAQ §33 |
| Minor PAC | **30 days** post-implementation notification | n/a (no prior approval needed) | FAQ §137 |
| MD-23 CI permission grant | `UNCERTAIN: per-application; SEC review for novel devices` | | |
| MD-27 / MD-29 permission | `UNCERTAIN` | | |
| CT-06 grant (pharma, general) | **90 working days** | Deemed approved if no response and India-discovered drug [NDCT FAQ §19] | NDCT FAQ §18 |
| CT-06 grant (India-discovered drug) | **30 working days** | Deemed approved | NDCT FAQ §18-19 |

### 31.2 Validity periods

| Output | Validity |
|---|---|
| MD-5 / MD-9 / MD-15 / MD-42 (manufacturing / import / sale licenses) | Perpetual with 5-year retention fee [FAQ §55] |
| MD-13 / MD-17 (test licenses) | 3 years from issue [FAQ §19, IVD FAQ §67] |
| MD-23 (CI permission) | 1 year initiation window [FAQ §125]; CI itself runs per protocol |
| MD-27 / MD-29 (investigational / new IVD permission) | `UNCERTAIN: typically until marketing license obtained` |
| CT-06 (pharma CT permission) | 2 years from grant [NDCT FAQ §25] |
| MSC (Market Standing Certificate) | 1 year from issuance [FAQ §42] |
| FSC (Free Sale Certificate) | Valid up to mfg license validity [FAQ §43] |

### 31.3 Notification deadlines

| Event | Notification deadline | Source |
|---|---|---|
| SUSAR (suspected unexpected serious adverse event) | **15 days** from license-holder becoming aware | SaMD Draft §4.13.3 |
| Foreign regulatory action (market withdrawal, restriction, recall) for imports | **15 days** | SaMD Draft §4.13.3 |
| Change in constitution | **45 days** initial notification + **180 days** for fresh application | FAQ §22 |
| Change in authorised agent / overseas mfg constitution | **45 days** | FAQ §109 |
| Annual safety report (pharma) | `UNCERTAIN: form-level CT-07 likely; pending consultant` | |
| PSUR (medical device, post-launch novel) | 6-monthly first 2 years, then annual next 2 years | FAQ §126 |

### 31.4 Retention timelines

| License type | Retention every |
|---|---|
| MD-5 / MD-6 / MD-9 / MD-10 / MD-15 / MD-42 | 5 years | FAQ §55 |

---

## 32. Common rejection reasons

Aggregated from FAQ patterns + Addendum FAQ + IVD FAQ. Each row indicates the most common single-cause rejection observed in CDSCO public guidance documents.

| # | Reason | Pathway | Source |
|---|---|---|---|
| 1 | Missing apostille on Power of Attorney (for imports) | MD-14 | FAQ §102, Addendum §3 |
| 2 | Certificate of Exportability submitted instead of FSC | MD-14 | FAQ §111, IVD FAQ §90 |
| 3 | FSC missing legal-or-actual manufacturer name | MD-14 | FAQ §108 |
| 4 | Mismatched intended-use across MD-14, label, IFU, brochure | MD-14 | IVD FAQ §54 |
| 5 | Brand-fee mistake (separate fee per brand not paid) | All licensing | FAQ §15, IVD FAQ §24 |
| 6 | Plant Master File missing personnel qualifications | MD-3, MD-7 | MD-7 checklist §6.3 |
| 7 | QMS undertaking missing for Fifth Schedule compliance | MD-3, MD-7 | MD-7 §7.1; FAQ §85 |
| 8 | DMF missing essential principles checklist | MD-3 (Class B), MD-7 | MD-7 §8.8 |
| 9 | Performance evaluation done at non-accredited lab (IVD) | MD-14, MD-28 | IVD FAQ §57 |
| 10 | Test-license stock used for commercial sale | MD-13, MD-17 | FAQ §59 — undertaking violated |
| 11 | Class transition mishandled (B→C) — full re-submission instead of additional docs/fees only | All | IVD FAQ §41 |
| 12 | Notified port not used (especially Class A non-sterile non-measuring) | All imports | Addendum FAQ §31 |
| 13 | Predicate device claim doesn't satisfy Rule 51 substantial equivalence | MD-7 | FAQ §50 |
| 14 | Software V&V missing for SaMD-bearing devices | MD-7 | MD-7 §8.15 (Annexure A item L) |
| 15 | Sterilisation validation missing for sterile devices | MD-7 | MD-7 §8.14 |
| 16 | Missing MD-27 permission for no-predicate device application | MD-7, MD-14 | MD-7 §11; FAQ §118 |
| 17 | Application for prohibited IVD category (TB sero, malaria Ab) | MD-14, MD-28 | IVD FAQ §21 |
| 18 | Free Sale Certificate from non-stringent country without Indian CPE (Class C/D IVD) | MD-14 | IVD FAQ §91 |
| 19 | Class disputed by CDSCO (IMDRF discrepancy → higher class adopted) | All | FAQ §93 |
| 20 | PoA + undertaking not bound/punched as single document | MD-14 | Addendum FAQ §3 |
| 21 | Annexure A environmental requirements not tabled | MD-3, MD-7 | MD-7 §7.11; FAQ §46 |
| 22 | Drug content in device without medicinal-substances data (DMF §8.12) | MD-7 | MD-7 §8.12 |
| 23 | Real-time stability not initiated alongside accelerated stability | MD-7 | FAQ §37 |
| 24 | Investigational device CI initiated >1 year after MD-23 grant without re-permission | MD-22/23 | FAQ §125 |

---

## 30. Fees structure

*Drafting in Phase 1b. From Second Schedule MDR-2017 + per IVD FAQ §46-47.*

### IVD import fees (USD)
| Class | Product fee | Manufacturing site fee |
|---|---|---|
| Class A | $10 | $1,000 |
| Class B | $10 | $1,000 |
| Class C | $500 | $3,000 |
| Class D | $500 | $3,000 |

### IVD manufacturing fees (INR)
| Class | Product fee | Manufacturing site fee |
|---|---|---|
| Class A | ₹500 | ₹5,000 |
| Class B | ₹500 | ₹5,000 |
| Class C | ₹1,000 | ₹50,000 |
| Class D | ₹1,000 | ₹50,000 |

### Test license import (IVD)
- All classes flat: $100

### Other categories
- Medical device (non-IVD) manufacturing and import fees — `to be added in Phase 1b from Second Schedule`
- Clinical investigation permission — exempt for govt-funded/owned institutions [FAQ §124]
- Retention fees — every 5 years
- Payment process — BharatKosh challan

## 31. Timelines

*Drafting in Phase 1b. Aggregated from FAQ + IVD FAQ + Addendum.*

| Pathway | Timeline | Source |
|---|---|---|
| Class A non-sterile non-measuring registration | Immediate (system-generated) | FAQ §70 |
| Class A measuring/sterile MD-5 grant | Audit within 120 days post-grant | IVD FAQ §97 |
| Class B MD-5 grant | Audit within 90 days of application | IVD FAQ §97 |
| Class C/D MD-9 grant | MD Officer inspection within 60 days of application | FAQ §27 |
| Import license MD-15 | 9 months | FAQ §97 |
| MD-42 registration | 10 days (SLA) | FAQ §147 |
| Major PAC (manufacturing) | 45 days; deemed approved if no response | FAQ §136 |
| Major PAC (import) | 60 days; deemed approved if no response | FAQ §136, IVD FAQ §33 |
| Test license validity | 3 years from issue | FAQ §19 |
| MD-23 CI initiation window | 1 year from grant; else re-permission | FAQ §125 |
| Clinical trial permission CT-06 | 90 working days general; 30 working days for India-discovered (deemed approval) | NDCT FAQ §18 |
| CT-06 validity | 2 years from grant | NDCT FAQ §25 |
| SUSAR notification | 15 days from event coming to license holder's notice | SaMD Draft §4.13.3 |

## 32. Common rejection reasons

*Drafting in Phase 1b. Compiled from FAQ patterns.*

- **Documentation gaps** — missing PoA apostille, FSC vs Certificate-of-Exportability confusion, incomplete DMF
- **Quality system non-compliance** — Fifth Schedule QMS undertaking missing, Annexure A environmental requirements untabled
- **Classification disputes** — applicant claimed wrong class; CDSCO uses higher class if IMDRF differs [FAQ §93]
- **Predicate device disputes** — applicant's claimed predicate doesn't satisfy Rule 51 substantial equivalence
- **Clinical evidence inadequacy** — for novel devices, MD-26 path requires Phase-I/II/III equivalent data
- **Brand-fee mistake** — each brand needs separate fee [FAQ §15]
- **Notified port violation** — Class A non-sterile non-measuring still must come via notified ports [Addendum §31]
- **Investigational use → commercial use** — test license stock cannot be commercially sold
- **Class transition mishandled** — when class changes B→C, only additional docs+fees needed but applicants often re-submit full file [IVD FAQ §41]

---

# PART VI — REFERENCE

## 33. Conditional permutation matrix

For each device characteristic, which forms and documents are triggered. Use this as a **lookup table** to determine pathway requirements for any specific device profile.

### 33.1 Form-triggering matrix

| Device characteristic | Manufacturing path | Pre-market permission | Test license | Additional NOCs |
|---|---|---|---|---|
| Class A non-sterile non-measuring (Indian mfg) | Self-notification (portal) | None | None | None |
| Class A measuring/sterile (Indian mfg) | MD-3 → MD-5 (SLA) | None | None | DAHD if veterinary; BARC if radioactive |
| Class B (Indian mfg) | MD-3 → MD-5 (SLA, NB audit 90 days of application) | None | MD-13 if test batches needed | DAHD if veterinary; BARC if radioactive |
| Class C/D (Indian mfg, has predicate) | MD-7 → MD-9 (CLA, inspection 60 days) | None | MD-13 if test batches needed | DAHD if veterinary; BARC if radioactive |
| Class C/D (Indian mfg, NO predicate) | MD-7 → MD-9 | **MD-26 → MD-27 first** | MD-13 (almost always) | DAHD if veterinary; BARC if radioactive |
| Imported MD (any class except A non-sterile non-measuring) | MD-14 → MD-15 (CLA) | MD-27 if no predicate | MD-17 if test batches needed | + apostilled PoA, FSC, QMS cert, NB audit ≤3y |
| Class A IVD (Indian mfg) | MD-3 → MD-5 (SLA) | MD-29 if new IVD | None typically | + DAHD/BARC/PNDT as applicable |
| Class B IVD (Indian mfg) | MD-3 → MD-5 (SLA, NB audit 90 days) | MD-25 + MD-29 if new IVD | MD-13 for 3-batch CPE | |
| Class C/D IVD (Indian mfg) | MD-7 → MD-9 (CLA) | MD-25 + MD-29 if new IVD | MD-13 typically | |
| Class C/D IVD (imported, non-stringent country) | MD-14 → MD-15 | MD-29 + CPE in India required | MD-17 | + apostilled docs |
| SaMD (any class) | Same as hardware MD by class | Same conditions | MD-13 mfg or MD-17 import | + IEC 62304 / 81001-5-1 / 62366-1 conformance |
| AI/ML adaptive SaMD | Same as SaMD by class | Same | Same | + **ACP submission required** under Oct 2025 Draft |
| Combination product (device-PMOA) | MD-7 → MD-9 typically (Class C/D) | MD-27 if no predicate | MD-13 | + DCG(I) consultation; tox dossier if drug not approved |
| Custom-made device (RMP prescription, specific patient) | **Chapters IV+V exempt** [Addendum FAQ §20] | None | None | Label "Custom made device" |

### 33.2 Conditional document trigger matrix

For each conditional characteristic of a device, which DMF / supporting documents become required:

| Trigger | Doc triggered (location) | Severity if missing |
|---|---|---|
| **Sterile (any mode)** | DMF §8.14 Sterilisation validation; QMS Annexure A environmental requirements | Application rejected at scrutiny |
| **Patient-contact (any tier)** | DMF §8.11 Biocompatibility (ISO 10993 series) | Application rejected at scrutiny |
| **Drug / biological content** | DMF §8.12 Medicinal substances data; if drug not approved → full tox dossier per MD-26 §12 | Application rejected; combination product path may apply |
| **Software present (SiMD or SaMD)** | DMF §8.15 Software V&V; §8.20 Software version release certificate | Application incomplete |
| **AI/ML adaptive** | + ACP per SaMD Draft §4.2.D as part of Risk Management File | `UNCERTAIN bridge regime`; expected under Oct 2025 Draft |
| **Cloud / network deployment (SaMD)** | DMF §8.10 cybersecurity V&V; IEC 81001-5-1 conformance evidence | Application incomplete |
| **Veterinary use** | DAHD NOC | Application rejected at scrutiny |
| **Radioactive content / ionising radiation** | BARC NOC; AERB approval before patient use | Application rejected; AERB approval required pre-use |
| **Prenatal diagnostic** | PNDT department NOC | Application rejected |
| **Novel / no predicate** | MD-26 → MD-27 permission required **before** MD-3/7/14 | Application rejected if attempted directly |
| **IVD prohibited category** (TB serology, malaria Ab RDT) | **HARD STOP** — cannot apply | n/a |
| **IVD HIV/HBsAg/HCV** | Performance criteria must meet NIB-Noida thresholds [IVD FAQ §60] | Application rejected at PER review |
| **Class C/D IVD from non-stringent country** | In-India CPE required regardless of foreign approval | Application rejected; CPE redo required |
| **Import (any class except A non-sterile non-measuring)** | Apostilled PoA + FSC + QMS cert + NB audit ≤3y | Application rejected |
| **Custom-made device** | Label "Custom made device"; specific RMP prescription | Penalty for unmarked custom devices |

### 33.3 Combined "what do I need" matrix — by device profile

Read down: pick the characteristics that apply. Read across: forms + docs required.

| Profile | Class | Sterile | Patient-contact | Software | AI/ML | Predicate | Mfg location |
|---|---|---|---|---|---|---|---|
| **Profile 1: Pure SaMD diagnostic AI for serious condition** | C | N/A | N/A | Yes | Static | Yes (Indian) | India |
| **Profile 2: Connected wearable BP cuff** | B | No | Surface (skin) | Yes (companion app) | None | Yes | India |
| **Profile 3: AI/ML chest X-ray triage** | C | N/A | N/A | Yes | Adaptive | Yes (US FDA) | India |
| **Profile 4: Novel IVD reagent for new biomarker** | C IVD | N/A | N/A (specimen) | No | None | **No** | India |
| **Profile 5: Imported Class D pacemaker** | D | Yes | Implant | Yes (SiMD) | None | Yes | Imported |
| **Profile 6: Veterinary AI diagnostic for cattle disease** | B | N/A | N/A | Yes (SaMD) | Static | Probably no | India |
| **Profile 7: Drug-eluting coronary stent** | D | Yes | Implant | No | None | Yes | India |

**Forms triggered per profile:**

| Profile | Forms | Conditional docs |
|---|---|---|
| 1 | MD-7 → MD-9 | DMF §8.15 software V&V; §8.20 software release; cybersecurity if PHI |
| 2 | MD-3 → MD-5 (Class B SLA, NB audit 90 days) | DMF §8.11 biocompatibility; §8.15 software V&V; §8.20 software release |
| 3 | MD-13 → MD-7 → MD-9 + **ACP** | DMF §8.15 software V&V; ACP 5-component file; subgroup validation; cybersecurity |
| 4 | **MD-13 → MD-24 → MD-25 → MD-28 → MD-29 → MD-7 → MD-9** (full novel-IVD sequence) | IVD Master File (Appendix II); 3-batch PER; in-India CPE at MDTL; Essential Principles IVD checklist |
| 5 | MD-14 → MD-15 + MD-13 import overlay if test batches | PoA apostilled; FSC; ISO 13485; biocompatibility (implant); sterilisation validation; software V&V (SiMD); CLA may inspect overseas site |
| 6 | MD-3 → MD-5 (Class B SLA) + **DAHD NOC** | DMF §8.15 software V&V; veterinary risk class same as human-MD per Addendum FAQ §1 |
| 7 | MD-7 → MD-9 (Class D CLA) + **DCG(I) consultation** | DMF §8.11 biocompatibility (implant); §8.12 medicinal substances; §8.14 sterilisation; combination product joint review |

---

## 34. Cross-form dependency map

This section visualises which forms must precede which others, with conditional branches.

### 34.1 Master dependency diagram

```
NOVEL DEVICE PATH (no predicate)
─────────────────────────────────────────────────────
                Test License
                ├─ MD-12 → MD-13 (mfg)  or
                └─ MD-16 → MD-17 (import)
                              ↓
              Generate validation/QC data
                              ↓
                MD-26 (no-predicate application)
                + clinical evidence data
                              ↓
                       MD-27 PERMISSION
                              ↓
            ┌─────────────────┴─────────────────┐
            │                                   │
   (if clinical data adequate)        (if clinical data inadequate)
            │                                   ↓
            │                          MD-22 → MD-23 CI permission
            │                                   ↓
            │                       Pilot CI → Pivotal CI
            │                                   ↓
            │                           Re-submit data
            │                                   │
            └─────────────────┬─────────────────┘
                              ↓
       Marketing license application
       (MD-3 / MD-7 for mfg; MD-14 for import)
                              ↓
            MD-5 / MD-9 / MD-15 GRANT

────────────────────────────────────────────────────
PREDICATE DEVICE PATH (has Indian or foreign predicate)
────────────────────────────────────────────────────
   MD-13 (test license — optional but recommended)
                ↓
   MD-3 / MD-7 / MD-14 application
                ↓
   MD-5 / MD-9 / MD-15 GRANT
────────────────────────────────────────────────────
NEW IVD PATH
────────────────────────────────────────────────────
   MD-13 (manufacture trial batches, IVD-specific)
                ↓
   MD-24 (CPE application, Class B/C/D)
                ↓
   MD-25 CPE permission
                ↓
   3-batch in-India CPE at MDTL
                ↓
   MD-28 (new IVD application) + CPE data
                ↓
   MD-29 new IVD permission
                ↓
   MD-3 / MD-7 / MD-14 marketing license application
                ↓
   MD-5 / MD-9 / MD-15 GRANT
```

### 34.2 Critical sequencing rules

| Rule | Consequence if violated |
|---|---|
| MD-27 MUST precede MD-3 / MD-7 / MD-14 for novel device | Application rejected; CLA requires MD-27 first |
| MD-29 MUST precede MD-3 / MD-7 / MD-14 for new IVD | Application rejected |
| MD-25 (CPE permission) → CPE at MDTL → data → MD-28 | Cannot submit MD-28 without CPE data |
| MD-23 (CI permission) → CI execution within 1 year | If exceeded, re-permission required [FAQ §125] |
| Test license MD-13 / MD-17 → cannot be commercially sold | Penalty + license revocation |
| MD-27 / MD-29 are pre-marketing permissions — they DO NOT replace MD-3 / MD-7 / MD-14 | Subsequent marketing license still required |
| Subsequent applicant after first MD-27 grant: previous IMD becomes predicate; subsequent applicant can use direct license path [FAQ §116] | n/a — this is enabling, not restrictive |

### 34.3 Parallelism rules

- MD-3 / MD-7 (mfg) can run in parallel with MD-14 (import) if a company manufactures in India AND imports a different device
- Multiple MD-14 applications by multiple IAAs for the same product + same manufacturer: permitted; each separate application [FAQ §94-95]
- MD-22 (CI) can run in parallel with MD-26 (no-predicate) — typical sequence for novel devices [Addendum FAQ §19]
- MD-42 (sale registration) is parallel-only — never blocks manufacturing
- PSUR + PMS run continuously post-launch in parallel with PAC notifications

---

## 35. Worked examples — canonical demo apps + edge cases

Each worked example applies the framework to a specific device profile. Format:
1. **Device summary** (intended use, key characteristics)
2. **Path determination** (which persona, which forms)
3. **Document inventory** (what's required, what triggers what)
4. **Timeline estimate**
5. **ClearPath coverage gaps**

### 35.1 HealthVita BP Pro (canonical demo app)

**Device summary.** Connected blood-pressure monitoring cuff with companion mobile app for home use. Patient measures BP at home; companion app displays trends, alerts on out-of-range readings, optionally shares with treating physician via ABDM. AI not adaptive (static thresholds).

**Path determination.**
- Hardware (BP cuff) is **Class B** medical device (measuring, non-sterile, patient surface contact)
- Companion app is **SiMD** (drives device use via Bluetooth) — inherits Class B from hardware
- **Has predicate** (multiple BP monitors approved in India)
- **Manufactured in India** (assume)
- **Persona:** §4.3 (Class B hardware MD mfg) + §5 SiMD overlay

**Forms required.**
- MD-3 → MD-5 (SLA — Class B)
- MD-42 if direct-to-consumer sale through own channel (parallel)
- NB audit within 90 days of MD-3 application

**Conditional documents triggered.**
- DMF §8.11 Biocompatibility (cuff contact with intact skin — ISO 10993-5 cytotoxicity + ISO 10993-10 sensitisation/irritation suffices for surface contact)
- DMF §8.15 Software V&V (for the cuff's embedded firmware AND companion app)
- DMF §8.20 Software version release certificate
- DMF §8.17 Stability data (electrolyte battery, mechanical durability)
- ABDM integration (if implemented) → CERT-In Safe-to-Host certificate required
- DPDP Act 2023 compliance for stored BP data (`identifiable` if user-linked)

**Timeline estimate.**
- Application → NB audit: ~90 days
- NB audit → MD-5 grant: ~30-60 days
- **Total: 4-5 months** assuming clean submission

**ClearPath coverage gaps for this profile:**
- ❌ Sterilisation mode — N/A (non-sterile)
- ❌ Patient-contact type — **GAP** (currently not asked; cuff is surface_intact_skin per ISO 10993)
- ❌ Mfg location — pitch-extract address only
- ✅ Predicate — captured via Tier B B3
- ✅ ISO 13485 — Tier B B6
- ✅ Clinical evidence — Tier B B5

### 35.2 VitalSign Connect (canonical demo app)

**Device summary.** Multi-vital wearable monitor (HR, SpO2, ECG, respiratory rate, temperature) for inpatient or step-down monitoring. Continuous data collection; AI alerting on out-of-pattern combinations (e.g., early sepsis warning). Adaptive model retrains weekly on aggregate de-identified data.

**Path determination.**
- Hardware (wearable) is **Class C** medical device (measures multiple vitals, ECG, drives clinical management in inpatient)
- AI alerting is **SaMD adaptive** — Class C (Drives clinical management in serious situation per SaMD matrix)
- **Combined classification: Class C** (highest applies per First Schedule [SaMD Draft §4.4.1 Note])
- **Predicate exists?** Likely (multi-vital monitors approved in India). For AI/ML adaptive layer specifically — `UNCERTAIN: depends on whether previous adaptive sepsis-alert AI/ML was approved; likely not — treat as no-predicate for the AI layer`
- **Manufactured in India** (assume)
- **Persona:** §4.4 (Class C hardware) + §6 (AI/ML adaptive) overlay

**Forms required.**
- MD-13 (test license to manufacture trial batches)
- MD-26 → MD-27 if AI/ML adaptive layer has no predicate
- (Possibly) MD-22 → MD-23 if clinical evidence inadequate for AI layer
- MD-7 → MD-9 (CLA — Class C)
- Inspection by MD Officer within 60 days of MD-7 application

**Conditional documents triggered.**
- DMF §8.11 Biocompatibility (skin contact, longer-term: ISO 10993-5/10/23 series)
- DMF §8.14 Sterilisation validation (if pre-applied gel pads); else N/A
- DMF §8.15 Software V&V — extensive (both firmware and SaMD layer)
- DMF §8.20 Software version release certificate
- DMF §8.18 Clinical evidence — pivotal study likely required for AI alerting performance
- **ACP per SaMD Draft §4.2.D** for the adaptive AI/ML layer:
  - Data management plan (de-identified aggregate)
  - Performance monitoring plan (weekly metrics)
  - Algorithm retraining plan (weekly retrain cadence)
  - Software update plan (monthly app updates)
  - Rollback plan (revert to previous version on performance drift)
- CERT-In Safe-to-Host (if cloud-stored data, especially identifiable)
- DPDP Act 2023 SDF likely applicable (if >10 lakh users)

**Timeline estimate.**
- Test license + ACP development: 6-12 months
- MD-26 → MD-27 process: 6-12 months
- MD-22 → MD-23 + pivotal CI: 12-24 months
- MD-7 → MD-9 final: 6-9 months
- **Total: 30-48 months** for novel adaptive AI/ML inpatient device

**ClearPath coverage gaps:**
- ❌ AI/ML adaptive — captured via Tier B `ai_ml=adaptive`
- ❌ ACP 5 components — **HIGH-PRIORITY GAP**
- ❌ Subgroup / bias validation — gap
- ❌ Cloud / data residency — gap
- ❌ Software autonomy degree — gap

### 35.3 Pedscribe Listen (canonical demo app)

**Device summary.** Paediatric voice triage AI — child speaks symptoms; AI generates probability-ranked differential and recommends OPD vs urgent-care vs ER. Designed for primary-care physician decision support.

**Path determination.**
- Pure SaMD (no hardware)
- Significance: **Drive clinical management** (recommends triage tier — informs disposition decision)
- Situation: **Serious** (paediatric symptoms can span non-serious to critical)
- SaMD matrix: **Class B** (Drive × Serious)
- BUT: SaMD intended for use by non-clinical users in serious situation may be classified as critical [SaMD Draft §4.4.1 Note]. Pedscribe is *intended for physicians* but may also be used by parents → could push to **Class C** (Drive × Critical override)
- **No predicate** (paediatric voice triage is novel category)
- **Indian-developed**
- **Persona:** §5 SaMD + §6 AI/ML (assume static for prudence)

**Forms required.**
- MD-13 (test license, voice-data generation pilots)
- MD-26 → MD-27 (no predicate)
- MD-22 → MD-23 (clinical evidence likely inadequate — Indian paediatric population validation needed)
- MD-7 → MD-9 (Class C, assuming the higher-class override applies)

**Conditional documents triggered.**
- DMF §8.15 Software V&V — extensive (audio processing, NLP, medical reasoning)
- DMF §8.20 Software version release certificate
- DMF §8.18 Clinical evidence — pivotal study mandatory
- ACP if model is adaptive (paediatric speech patterns may need ongoing learning)
- Cybersecurity (audio recordings = identifiable PHI)
- CERT-In Safe-to-Host
- DPDP SDF likely

**Timeline estimate.**
- Test license: 3-6 months
- CI permission + pivotal study: 18-24 months
- MD-26 → MD-27 → MD-7 → MD-9: 12-18 months overlapping
- **Total: 30-42 months**

**ClearPath coverage gaps (same as §35.2 plus):**
- ❌ Patient population (paediatric) — captured weakly via pitch extract
- ❌ Voice/audio data handling specifics — gap
- ❌ Subgroup validation across language / dialect — gap

### 35.4 PainPredict (canonical demo app)

**Device summary.** Chronic pain ML predictor — analyses patient-reported pain trajectories + medication response to predict 30-day pain progression. Web app + clinician dashboard. Static model (no retraining post-deployment).

**Path determination.**
- Pure SaMD (web + dashboard)
- Significance: **Inform clinical management** (predicts progression but doesn't recommend specific intervention)
- Situation: **Serious** (chronic pain affects QOL but not immediate life-threat)
- SaMD matrix: **Class A** (Inform × Serious)
- Static AI/ML — no ACP required
- `UNCERTAIN`: predicate availability — chronic pain prediction SaMD is novel; treat as no-predicate
- **Indian-developed**
- **Persona:** §5 SaMD + §6 AI/ML static

**Forms required.**
- MD-13 (optional test license)
- MD-26 → MD-27 (if no predicate; UNCERTAIN whether SEC may grant a waiver based on Inform-only positioning)
- MD-3 → MD-5 (Class A — SLA, no audit before grant; NB audit within 120 days post-grant)

**Conditional documents triggered.**
- DMF §8.15 Software V&V
- DMF §8.20 Software version release certificate
- DMF §8.18 Clinical evidence — pilot data plus published study may suffice (Inform classification doesn't demand pivotal)
- Cybersecurity (chronic pain data = identifiable PHI)

**Timeline estimate.**
- Test license: 3-6 months
- MD-26 → MD-27: 6-12 months
- MD-3 → MD-5: 4-6 months
- **Total: 13-24 months**

**ClearPath coverage gaps:**
- ✅ AI/ML static captured
- ❌ Predicate binary (Tier A) — gap
- ❌ Patient-reported outcome data handling — gap (specific category of PHI)

### 35.5 Edge case: Novel device without predicate (HCG urine kit reformulation)

Even an "incremental" product can land in the no-predicate path if it claims a new intended use or new population. Example: a urine pregnancy detection kit reformulated for testing on saliva.

**Path determination.**
- Class B IVD (new specimen type for hCG)
- **Investigational MD/IVD** (new specimen claim)
- **New IVD** (no prior India saliva-hCG approval)

**Forms required.**
- MD-13 test license (manufacture trial batches)
- MD-24 → MD-25 (CPE permission)
- 3-batch in-India CPE at MDTL/NIB
- MD-28 → MD-29 (new IVD permission)
- MD-3 → MD-5 (Class B SLA — but with MD-29 prerequisite, CDSCO-coordinated)

**Timeline: 18-30 months.**

### 35.6 Edge case: IVD reagent for new biomarker (cardiac troponin variant)

Same as §35.5 framework. Class C IVD (higher risk for cardiac biomarker), so MD-7 → MD-9 path instead of MD-3.

### 35.7 Edge case: Veterinary AI diagnostic (cattle disease ML)

**Path determination.**
- Class B SaMD (Drive × Non-serious for cattle, or Drive × Serious depending on disease — class same as human-MD per Addendum FAQ §1)
- AI/ML — static or adaptive
- **DAHD NOC required**
- **Persona:** §5 SaMD + §6 AI/ML + veterinary overlay

**Forms required.**
- MD-13 if test batches/test deployments needed
- MD-26 → MD-27 if no predicate (likely)
- MD-3 → MD-5 (Class B) + **DAHD NOC**

**Note:** ICMR Ethical Guidelines apply to *biomedical research involving human participants*. Veterinary AI may follow CPCSEA (Committee for Control and Supervision of Experiments on Animals) ethics framework for any animal trial work — `UNCERTAIN`.

### 35.8 Edge case: Blood-bank dual-use IVD (HIV/HBsAg/HCV combined test)

**Path determination.**
- Class C/D IVD (high-risk transfusion-screening)
- **Dual use** — diagnostic + blood-screening — single license valid for both IF manufacturer claims both on label/IFU [IVD FAQ §20]
- Performance criteria must meet NIB-Noida thresholds [IVD FAQ §60]
- **Persona:** §7 IVD mfg + §10 CPE researcher

**Critical:** must NOT apply for a TB-serology-combined variant (prohibited [IVD FAQ §21]).

### 35.9 Edge case: Drug-eluting coronary stent (Indian-mfg combination product)

**Path determination.**
- Class D medical device (implant, high-risk)
- **Combination product, device-PMOA**
- Drug component status determines toxicology dossier depth
- **Persona:** §4.5 Class D + §8 Combination product

**Forms required.**
- MD-13 test license
- MD-22 → MD-23 + MD-26 → MD-27 if novel drug-stent combination
- MD-7 → MD-9 (Class D)
- + DCG(I) consultation for drug component

### 35.10 Edge case: Pure data / records platform (electronic health record)

**Path determination.**
- **Not a medical device** under MDR-2017 [SaMD Draft §4.2.3 — Hospital/Clinical Information systems for "patient admission, scheduling, insurance, billing, communication, store/transfer patient info" NOT MDR]
- Falls under DPDP Act 2023 (data protection) + ABDM (if integrating with health ID) + IT Act 2000
- **Persona:** None of §4-§17 — out of CDSCO scope

**ClearPath should:** detect this profile and route gently — "Your product appears to be a records/data platform, not a medical device under MDR 2017. CDSCO doesn't license you. You should focus on DPDP Act, ABDM, and CERT-In requirements." Already partially handled via Tier A Q1 (`varies` + low decision-influence + data-only data types).

---

## 36. Open questions for CDSCO consultant

Aggregator of every `UNCERTAIN` flag from Parts I-V. Grouped by category. Each entry includes: the question, the section it surfaced from, and what's blocked if not answered.

### 36.1 Form-level and rule-text questions

1. **IVD Master File appendix conflict** — IVD FAQ §102 says **Appendix II of Fourth Schedule**; multiple republished checklists in SaMD Draft Annexure A (items H, K, M) say **Appendix III**. Which is authoritative under current rule text? *(Surfaced from §7, §22.5)*. **Blocks:** definitive document inventory for IVD applications.
2. **Form 22 / 25 / 28 numbering** under Drug Rules 1945 (pharma manufacturing) — full primary-source verification not completed. *(Surfaced from §11)*. **Blocks:** pharma Form-22 detail in §24.6.
3. **NDCT 2019 Form CT-07** — likely the annual safety / status report form, but not confirmed in NDCT FAQ excerpts available during drafting. *(Surfaced from §12.5, §24.5)*. **Blocks:** complete pharma CT reporting cadence.

### 36.2 Regulatory body and process questions

4. **SEC (Subject Expert Committee)** composition, scheduling cadence, convening procedure — referenced repeatedly in CDSCO FAQs but no codified procedure publicly extracted. *(Surfaced from §1.7, §2, §8, §29.6)*. **Blocks:** founders' planning around non-predicate / combination-product / classification-dispute reviews.
5. **EC (Ethics Committee) registered list** — current authoritative source for medical device CI ECs. CDSCO portal link not extracted. *(Surfaced from §9.7, §28.4)*. **Blocks:** founders' EC selection.
6. **EC composition rules** per ICMR National Ethical Guidelines — specific minimum membership requirements. *(Surfaced from §28.2)*. **Blocks:** EC engagement guidance.
7. **CTRI registration for medical device CI** specifically. Mandatory for pharma per NDCT FAQ §23 — but `UNCERTAIN` whether medical device CI also requires CTRI registration or whether MDR-2017 Seventh Schedule references a different registry. *(Surfaced from §9.9, §12)*. **Blocks:** CI initiation step.
8. **DTAB April 2025 sterilisation outsourcing allowance** under loan license — founder-referenced but not extracted from CDSCO primary sources. *(Surfaced from §16)*. **Blocks:** loan-license persona advisability.
9. **Sahyog portal scope** for medical devices — `UNCERTAIN` whether Sahyog applies to CDSCO MD ecosystem or is a separate domain. *(Surfaced from §1.5)*. **Blocks:** portal accuracy in founder-facing guidance.

### 36.3 Cross-regulator and adjacent-framework questions

10. **DPDP Act 2023 interaction with MDR-2017** for SaMD storing identifiable health data — overlap with CERT-In Safe-to-Host? SDF (Significant Data Fiduciary) designation triggers for medical device data holders. *(Surfaced from §5, §6, §35.10)*. **Blocks:** complete compliance picture for SaMD founders.
11. **Combination-product PMOA determination** — CDSCO process equivalent to FDA OCP not publicly codified. *(Surfaced from §8)*. **Blocks:** founders' combination-product self-assessment.
12. **DCG(I) joint review process** for combination products — convening procedure, timeline. *(Surfaced from §8)*. **Blocks:** combination-product timeline estimation.

### 36.4 Forward-looking / draft-guidance questions

13. **ACP enforceability before Oct 2025 SaMD Draft is finalised** — what's the bridge regime for AI/ML SaMD shipping in 2026? *(Surfaced from §5, §6)*. **Blocks:** AI/ML founders' submission posture decision.
14. **Veterinary AI/SaMD** — Addendum FAQ §1 says veterinary device risk class same as human-MD, but silent on AI/ML specifics. Same ACP rules? Different ethics framework (CPCSEA)? *(Surfaced from §35.7)*. **Blocks:** veterinary AI/SaMD founders.
15. **Specimen bio-banking guidelines** for IVD CPE — `UNCERTAIN` whether ICMR Biorepository guidelines apply automatically or whether CDSCO has separate guidance. *(Surfaced from §10.B Block 3)*.

### 36.5 Sample-size and statistical questions

16. **Bright-line minimum N for MD-22 CI** — `UNCERTAIN`; CDSCO uses case-by-case statistical justification. Confirm. *(Surfaced from §29.1, §29.4)*.
17. **Indian-population data requirement for AI/ML SaMD** that has IMDRF-country approval — IVD FAQ §58 establishes this for IVD specifically; `UNCERTAIN` whether same rule applies to AI/ML SaMD (vs general FAQ §117 case-by-case waiver). *(Surfaced from §6.A Stage 4)*.

### 36.6 Fee and operational questions

18. **Medical device fees** (non-IVD) by class — full Second Schedule extraction not completed. *(Surfaced from §30.1)*.
19. **Test license fees** for non-IVD medical devices (manufacture + import) — `UNCERTAIN`. *(Surfaced from §30.4)*.
20. **BharatKosh vs SLA-challan modes** — confirm whether all CLA payments are BharatKosh-exclusive. *(Surfaced from §30.7)*.

### 36.7 Document-specific questions

21. **MD-18 detailed checklist** for govt-hospital investigational import — full document list not separately extracted. *(Surfaced from §15.B)*.
22. **MD-4 / MD-8 (loan license) detailed checklists** — SaMD Draft Annexure A covers MD-3 / MD-7 but not loan variants. *(Surfaced from §16.B, §18.2, §18.6)*.

### Suggested consultant engagement scope

For an efficient consultant review:
1. Pre-send this document with §36 questions highlighted
2. 2-hour video walkthrough focused on §36.1 (rule-text) + §36.4 (forward-looking ACP)
3. Written response to remaining §36.2-§36.7 questions
4. Annotated mark-up of Parts II-V where consultant disagrees with the document's reading

---

## 37. Glossary and abbreviations

Compiled from CDSCO FAQ + IVD FAQ + Addendum FAQ + SaMD Draft + NDCT FAQ.

| Term | Definition |
|---|---|
| **ACP** | Algorithm Change Protocol — five-component framework for AI/ML SaMD change management per SaMD Draft §4.2.D |
| **Accessory** | A device intended specifically by its manufacturer to be used in combination with a particular parent medical device [FAQ §60] |
| **AERB** | Atomic Energy Regulatory Board — required for radioactive/ionising-radiation devices before patient use [Addendum §7] |
| **AE / SAE** | Adverse Event / Serious Adverse Event |
| **API** | Application Programming Interface (in SaMD context); also Active Pharmaceutical Ingredient (in pharma context) |
| **BA/BE** | Bioavailability / Bioequivalence study (pharma) |
| **BARC** | Bhabha Atomic Research Centre — NOC required for radio-immunoassay kits [IVD FAQ §53(c)] |
| **BIS** | Bureau of Indian Standards — mandatory standard if available for the device [FAQ §25] |
| **CDSCO** | Central Drugs Standard Control Organization — India's national regulatory authority |
| **CERT-In** | Computer Emergency Response Team — India; issues Safe-to-Host certificates required for ABDM-integrating apps |
| **CIN** | Corporate Identification Number (Indian-registered companies) |
| **CLA** | Central Licensing Authority — CDSCO HQ / Zonal offices; responsible for Class C/D mfg + all imports + clinical investigation + investigational devices [FAQ §6] |
| **CMDTL** | Central Medical Device Testing Laboratory — designated by Central Government under Rule 19 [FAQ §20, IVD FAQ §55] |
| **Component** | Raw material, substance, piece, part, software, firmware, labelling, or assembly intended to be part of the finished device [FAQ §61] |
| **COTS** | Commercial off-the-Shelf software [SaMD Draft §4.2.2] |
| **CPE** | Clinical Performance Evaluation (IVD-specific; §10) |
| **CTRI** | Clinical Trial Registry of India — mandatory pre-enrollment registration for pharma trials [NDCT FAQ §23] |
| **Custom-made device** | Device specifically made per RMP's written prescription for sole use of a particular patient; Chapter IV+V exempt [Addendum §20] |
| **DAHD** | Department of Animal Husbandry, Dairying and Fisheries — NOC for veterinary devices [Addendum §1-2; IVD FAQ §53(a)] |
| **DCG(I)** | Drugs Controller General of India — the head of CDSCO; the Central Licensing Authority for medical devices and drugs [FAQ §5] |
| **DMF** | Device Master File — Appendix II of Fourth Schedule MDR-2017 |
| **DPDP Act 2023** | Digital Personal Data Protection Act 2023 |
| **DTAB** | Drugs Technical Advisory Board |
| **EC** | Ethics Committee — registered with CDSCO for CI / CPE / CT |
| **EPSP** | Essential Principles of Safety and Performance — checklist required in DMF §8.8 |
| **FDC** | Fixed Dose Combination (pharma) |
| **FSC** | Free Sale Certificate — issued by Licensing Authority for export purposes [FAQ §41] |
| **FSCA** | Field Safety Corrective Action |
| **GCT** | Global Clinical Trial — multi-country trial with India participation |
| **GMP** | Good Manufacturing Practices |
| **HIP** | Health Information Provider (ABDM context) |
| **HIU** | Health Information User (ABDM context) |
| **IAA** | Indian Authorised Agent — for importing medical devices [FAQ §91] |
| **IB** | Investigator's Brochure |
| **ICF** | Informed Consent Form |
| **ICH** | International Council for Harmonisation (pharma standards) |
| **IEC** | International Electrotechnical Commission |
| **IFU** | Instructions for Use (e-IFU permitted [FAQ §29]) |
| **IMD** | Investigational Medical Device |
| **IMDRF** | International Medical Device Regulators Forum |
| **IMS** | Image Management System (not regulated as MD per SaMD Draft §4.2.3) |
| **IND** | Investigational New Drug (pharma) |
| **IVD** | In-Vitro Diagnostic medical device |
| **LIS** | Laboratory Information System (not regulated as MD per SaMD Draft §4.2.3) |
| **LMO** | Living Modified Organism (always "new drug" under NDCT 2019) |
| **MD Online portal** | `cdscomdonline.gov.in` — primary CDSCO MD application portal [FAQ §8] |
| **MDR** | Medical Devices Rules, 2017 |
| **MDTL** | Medical Device Testing Laboratory — registered with CDSCO under Rule 83 |
| **MSC** | Market Standing Certificate — 1-year validity [FAQ §42] |
| **NABL** | National Accreditation Board for Testing and Calibration Laboratories |
| **NCC** | Non-Conviction Certificate |
| **NDCT 2019** | New Drugs and Clinical Trials Rules, 2019 |
| **NDDS** | Novel Drug Delivery System (always "new drug" under NDCT 2019) |
| **NIB** | National Institute of Biologicals (Noida) — reference lab for HIV/HBsAg/HCV criteria [IVD FAQ §60] |
| **Notified Body** | Body registered with CDSCO for QMS audit of Class A/B mfg sites [FAQ §23-24] |
| **NSWS** | National Single Window System — `nsws.gov.in`; mandatory for test license applications post-Oct 2025 |
| **PAC** | Post Approval Change |
| **PMF** | Plant Master File — Appendix I of Fourth Schedule MDR-2017 |
| **PMOA** | Primary Mode of Action — determines combination-product path |
| **PMS** | Post-Marketing Surveillance |
| **PNDT** | Pre-Natal Diagnostic Techniques Act / department — NOC for prenatal-diagnostic IVDs [IVD FAQ §53(d)] |
| **PoA** | Power of Attorney — required for importer-IAA arrangement, apostilled or authenticated [FAQ §102] |
| **PRO** | Public Relation Office (CDSCO) — startup / innovator support cell [FAQ §7] |
| **PSUR** | Periodic Safety Update Report — 6-monthly first 2 years, annual next 2 [FAQ §126] |
| **PvPI** | Pharmacovigilance Programme of India (pharma post-marketing) |
| **QMS** | Quality Management System — per Fifth Schedule MDR-2017 (Schedule M Drug Rules 1945 for pharma) |
| **RDT** | Rapid Diagnostic Test |
| **RIA** | Radio Immuno Assay |
| **RMP** | Registered Medical Practitioner |
| **SaMD** | Software as a Medical Device — standalone software performing medical purpose [SaMD Draft §4.2.2] |
| **SDF** | Significant Data Fiduciary — DPDP Act 2023 designation |
| **SEC** | Subject Expert Committee — convened by CDSCO for novel device / classification disputes / CI waivers |
| **SiMD** | Software in a Medical Device — embedded/firmware [SaMD Draft §4.2.1] |
| **SLA** | State Licensing Authority — responsible for Class A/B mfg + all sale/distribution [FAQ §6] |
| **SMF** | Site Master File (sometimes used interchangeably with PMF for SaMD) |
| **SUGAM** | Drug regulation online portal (separate from MD Online portal) |
| **SUSAR** | Suspected Unexpected Serious Adverse Event/Reaction — 15-day notification |
| **V&V** | Verification and Validation |

## 38. Source bibliography

All sources are CDSCO-issued unless noted. URLs retrieved 2026-05-11.

### Primary rule text
- [MDR 2017 full text and amendment notifications (landing page)](https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Medical-Devices-Rules/) — most recent amendment: GSR 409(E) dt 02.06.2023 (Rule 18 & 19)
- [Medical Devices Rules 2017 full PDF](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/m_device/Medical%20Devices%20Rules,%202017.pdf) — direct PDF link from search results

### Form mapping authoritative source
- [Regulatory pathway flowchart, MDR-2017](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/RegulatoryMDR-2017.pdf) — single-page diagram confirming MD-12/13 = manufacture test; MD-16/17 = import test

### Form checklists
- [Class C/D mfg license checklist (MD-7 application → MD-9 grant)](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/7MD.pdf)
- Annexure A of SaMD Draft Guidance Document republishes checklists for: MD-12 (mfg test), MD-16 (import test), MD-22 (CI permission), MD-24 (IVD CPE), MD-26 (no-predicate), MD-28 (new IVD), MD-3 (Class A), MD-3 (Class B), MD-3 (Class A/B IVD), MD-7 (Class C/D), MD-7 (Class C/D IVD).

### FAQs (authoritative for procedural detail)
- [MD FAQ — CDSCO/FAQ/MD/01/2024](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/MDfAq24.pdf) — 148 Q&As
- [Addendum 03 to MD FAQ, dated 03.11.2025](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Addendum-03-to-FAQ-on-Medical-Devices-Rules-2017.pdf) — 33 additional Q&As
- [IVD FAQ — CDSCO/IVD/FAQ/03/2022](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/IVD/FAQs/CDSCO-IVD-FAQ-03-2022-.pdf) — 103 Q&As
- [New Drugs FAQ (NDCT 2019)](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadPublic_NoticesFiles/faqnd.pdf) — covers CT-04 / CT-04A / CT-05 / CT-06 forms, deemed-approval timelines, CTRI registration

### Software / AI-ML
- [Draft Guidance Document on Medical Device Software, 21 Oct 2025](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadPublic_NoticesFiles/Draft%20guidance%20document%20on%20Medical%20Device%20Software%2021%2010%202025.pdf) — 44-page guidance; covers SaMD/SiMD definitions, classification matrix (Table 2), ACP framework (§4.2.D), applicable standards list, document checklists (Annexure A)

### Pharma framework
- [NDCT Rules 2019 full text PDF](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/new_DC_rules/NEW%20DRUGS%20ANDctrS%20RULE,%202019.pdf) — direct PDF
- [NDCT Rules 2019 landing page](https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/New-Drugs/) — `UNCERTAIN: returned 404 during research; PDF reachable directly`

### Other guidance referenced
- [Essential Principles of Safety and Performance (Apr 2025 rev)](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/Essentialprinciples25.pdf) — **`UNCERTAIN`** scanned-image PDF, no extractable text; will cite by section number only
- [Medical Device Grouping Guidelines](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/Guidelines_Grouping_of_MDandIVD.pdf)
- [Free Sale Certificate Guidance (2024 rev)](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/fscguidancerev2024.pdf)
- [Market Standing / Non-Conviction Certificate Guidance](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/MD-MSC-NCCguidannce.pdf)
- [Performance Evaluation of IVDs Guidance](https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/guidanceperformanceivd.pdf)

---

## 39. Appendices

### Appendix A — Full CDSCO MD-7 official checklist (Fresh application, Class C/D)

Verbatim from `cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/7MD.pdf` (Pages 1-2). For endorsement-application and retention-application checklists, see source PDF Pages 3-4.

```
Form Type: Fresh application in Form MD-7

  1.0   Covering Letter
  2.0   Application (Form MD-7)
  3.0   Fee Challan
  4.0   Details of the constitution of the firm along with the relevant documents
  5.0   The Establishment / Site ownership / Tenancy Agreement
  6.0   Plant Master File as per Appendix I of Fourth Schedule of MDR, 2017
    6.1   General Information of the facility
    6.2   Personnel — Organisation chart
    6.3   Personnel — Qualification, Experience and responsibilities
    6.4   Premises and Facilities
    6.5   Plant Layout of premise with indication of scale
    6.6   List of equipments and instruments used for manufacturing and testing
    6.7   Sanitation
    6.8   Production
    6.9   Quality Assurance
    6.10  Storage
    6.11  Documentation
  7.0   Quality Management System Requirements
    7.1   Undertaking — manufacturing site in compliance with Fifth Schedule of MDR, 2017
    7.2   Quality Manual
    7.3   Control of Documents
    7.4   Control of Records
    7.5   Management Responsibility
    7.6   Resource management
    7.7   Control of production and service provision
    7.8   Internal Audit System
    7.9   Control of nonconforming product
    7.10  Corrective Action and Preventive Action
    7.11  Areas showing environmental requirement for MDs as per Annexure A of Fifth Schedule
  8.0   Device Master File in the line of Appendix II of Fourth Schedule of MDR, 2017
    8.1   Executive Summary
    8.2   Descriptive information of the device
    8.3   Justification for the Medical Device Grouping
    8.4   Product Specification, including variants and accessories
    8.5   Substantial equivalence with reference to the predicate device or previous generations
    8.6   Labelling information (Labels, Instruction for Use, etc.)
    8.7   Device Design and Manufacturing Information
    8.8   Essential Principles checklist for demonstrating conformity to the Safety and Performance
    8.9   Risk analysis and control summary
    8.10  Verification and validation of the medical device
    8.11  Biocompatibility validation data (if applicable)
    8.12  Medicinal substances data (if device contains Drug)
    8.13  Biological Safety (if applicable)
    8.14  Sterilization Validation data (if applicable)
    8.15  Software verification and validation (if software used)
    8.16  Animal studies – Preclinical data (if any)
    8.17  Stability study data (Real-time and Accelerated conditions)
    8.18  Clinical evidence (if any)
    8.19  Post Marketing Surveillance data (Vigilance reporting)
    8.20  Batch Release Certificates or Certificate of Analysis for minimum 3 consecutive batches /
            Software version release certificate
  9.0   Any other additional documents
 10.0   Test License obtained in Form MD-13 (if any)
 11.0   Copy of Permission in Form MD-27 (in case of MD without Predicate device)
```

### Appendix B — Form numbering correction table

Common errors observed in third-party blogs, consultant guidance, and some republished CDSCO checklists. The "Canonical" column reflects the authoritative source.

| Form / concept | Common error | Canonical | Source |
|---|---|---|---|
| Test license to manufacture | Sometimes labeled "MD-16" | **MD-12 → MD-13** | Regulatory Pathway flowchart; FAQ §18 |
| Test license to import | Sometimes labeled "MD-12" | **MD-16 → MD-17** | Same |
| CI permission grant | Sometimes labeled "MD-22" alone | Application MD-22, grant **MD-23** | FAQ §113 |
| No-predicate permission | Sometimes "MD-27" alone | Application MD-26, grant **MD-27** | FAQ §118 |
| IVD CPE permission | Sometimes confused with MD-22 | Application MD-24, grant **MD-25** | SaMD Draft §4.10 |
| New IVD permission | Sometimes "MD-29" alone | Application MD-28, grant **MD-29** | SaMD Draft §4.11 |
| IVD Master File appendix | Some checklists say "Appendix III" | **Appendix II** of Fourth Schedule | IVD FAQ §102 (authoritative) |
| Pharma CT permission | Sometimes "CT-05" for grant | **CT-04** application, **CT-06** grant; CT-05 is BA/BE-specific | NDCT FAQ §14-15, §25 |
| Pharma pre-init notification | Sometimes confused with CT-05 | **CT-04A** | NDCT FAQ §22 |

### Appendix C — Appendix II of Fourth Schedule (Device Master File structure)

Reconstructed from MD-7 checklist §8 (verbatim Appendix A above) and SaMD Draft Annexure A §12 republication. 20 sub-sections with conditional triggers indicated:

```
Section 8: Device Master File (Appendix II, Fourth Schedule MDR-2017)

  ALWAYS REQUIRED:
    8.1   Executive Summary
    8.2   Descriptive information of the device
    8.3   Justification for the Medical Device Grouping
    8.4   Product Specification (incl. variants, accessories)
    8.5   Substantial equivalence with predicate (or marked N/A with rationale → MD-27 path)
    8.6   Labelling information
    8.7   Device Design and Manufacturing Information
    8.8   Essential Principles conformity checklist
    8.9   Risk analysis and control summary
    8.10  Verification and validation
    8.17  Stability study data (real-time + accelerated)
    8.20  Batch Release Certificates (≥3 consecutive) / Software version release certificate

  CONDITIONALLY REQUIRED:
    8.11  Biocompatibility           ← if patient-contact
    8.12  Medicinal substances       ← if device contains drug
    8.13  Biological Safety          ← if biologics or tissue-derived
    8.14  Sterilization Validation   ← if sterile
    8.15  Software V&V               ← if software used (SiMD or SaMD)
    8.16  Animal preclinical         ← if any
    8.18  Clinical evidence          ← if any (mandatory if no predicate)

  ALWAYS REQUIRED FOR RENEWAL:
    8.19  Post Marketing Surveillance data (vigilance reporting)
```

### Appendix D — Plant Master File (Appendix I of Fourth Schedule)

```
Section 6: Plant Master File (Appendix I, Fourth Schedule MDR-2017)

  6.1   General Information of the facility
  6.2   Personnel — Organisation chart
  6.3   Personnel — Qualification, Experience and responsibilities
  6.4   Premises and Facilities
  6.5   Plant Layout of premise with indication of scale
  6.6   List of equipment and instruments used for manufacturing and testing
  6.7   Sanitation
  6.8   Production
  6.9   Quality Assurance
  6.10  Storage
  6.11  Documentation procedures
```

For SaMD, per SaMD Draft §4.12.1, PMF is reinterpreted as "Site Master File" outlining infrastructure (equipment, info networks, tools, physical facility supporting development, production, and maintenance of the software).

### Appendix E — Chapters exempted for Class A non-sterile non-measuring devices

Per FAQ §69, Class A non-sterile non-measuring medical devices are exempted from the requirements of:
- **Chapter IV** — Manufacturing of Medical Devices (license requirements)
- **Chapter V** — Loan License
- **Chapter VII** — Clinical Investigation
- **Chapter VIII** — Import of Medical Devices
- **Chapter XI** — `UNCERTAIN: not separately verified; FAQ §69 lists it`

Still required for Class A non-sterile non-measuring:
- **Chapter VI** — Labelling
- Applicable BIS / ISO / IEC / pharmacopoeial standards
- Notified-port import [Addendum FAQ §31]

### Appendix F — AERB type-approval interaction

Per Addendum FAQ §7: AERB type-approval / compliance certificate is **NOT** a mandatory prerequisite for license to import or manufacture ionising-radiation medical devices for marketing. **BUT** the applicant must submit AERB approvals to the licensing authority **before use of such devices on Indian population**.

Effectively: get the CDSCO license first; then AERB approval before clinical use.

### Appendix G — Apostille / Magistrate / Embassy authentication requirements

Per FAQ §102 and Addendum §3:

For Power of Attorney + undertaking from authorised agent submitted with MD-14 application:
- Must be apostilled in country of origin, **OR**
- Authenticated by a Magistrate of First Class (in India), **OR**
- Authenticated by Indian Embassy in country of origin, **OR**
- Equivalent authority through apostille

The PoA + undertaking must be a **single bound/punched document** when authenticated together [Addendum §3].

### Appendix H — Custom-made device exemption

Per Addendum FAQ §20-21:

A "custom-made device" is one specifically made per a duly qualified medical practitioner's **written prescription** under that practitioner's responsibility, with specific design characteristics, intended for sole use of a particular patient. The label must contain the words **"Custom made device"**.

Exemptions: **Chapter IV and Chapter V** of MDR-2017 (manufacturing license + loan license).

**NOT custom-made**: mass-produced devices that "only need adaptation" to meet a practitioner's requirement. Change in dimension alone doesn't qualify [Addendum §20-21].

### Appendix I — Notified port restrictions for medical device import

Per FAQ §106 and Addendum §31:

Medical devices (including Class A non-sterile non-measuring) can be imported **only through ports notified under the Drug Rules, 1945** from time to time. Other ports of entry are not permitted.

`UNCERTAIN: current list of notified ports — refer to CDSCO website Notifications section; list is dynamic.`

### Appendix J — NDCT 2019 schedule references

Per NDCT FAQ:
- **Second Schedule** — necessary documents for CT-04 application [NDCT FAQ §14]
- **Sixth Schedule** — fees [NDCT FAQ §14]
- `UNCERTAIN: remaining schedules of NDCT 2019 — full enumeration deferred to consultant verification`

### Appendix K — ICMR National Ethical Guidelines for Biomedical Research Involving Human Participants

`UNCERTAIN: current authoritative URL not separately extracted in this drafting session.`

Anticipated content (subject to consultant verification):
- EC composition (≥7 members, scientific + non-scientific mix)
- Informed consent template requirements
- Compensation and medical management for trial-injury
- Vulnerable population safeguards
- Data confidentiality + biobanking

Latest publication: ICMR National Ethical Guidelines were updated in 2017; a 2025 revision is `UNCERTAIN` whether published.

### Appendix L — Endorsement of additional products on existing license

Per FAQ §17 + IVD FAQ §45:
- Subsequent application for endorsement of additional MD on an already-granted license: additional product license fee + Fourth Schedule documents
- For IVD: same legal + actual mfg site; same authorised agent
- For overseas mfg adding a manufacturing site to existing MD-15: separate fee per site

### Appendix M — Change-of-constitution rules

Per Rule 3(j) MDR-2017 + FAQ §21-22 + Addendum §15-17:

**Change of constitution** is defined as:
- For a firm: change from proprietorship → partnership (or vice versa)
- For a company: private ↔ public conversion; OR >50% change in voting capital ownership

Effect:
- Manufacturer notifies LA within **45 days**
- Submits fresh license application within **180 days** from date of change
- QMS re-inspection NOT required for constitution-only change [Addendum §15]
- BUT QMS re-inspection IS required for change in location of manufacturing site [Addendum §17]

---
