# ISO 10993 biocompatibility tier matrix — seed values for review

**Purpose:** this table drives **§13 Biocompatibility** in the ₹2,499 hardware Submission Pack. It maps the founder's Q9 patient-contact answer to the ISO 10993 test panel CDSCO reviewers expect, plus conditional add-on panels for drug-eluting and bioresorbable devices.

**Why this is the highest-blast-radius generator in the pack.** Wrong-tier on the live demo card was the original blast-radius failure mode (`feedback_inference_blast_radius.md`). The pack-side equivalent is *wrong test panel for an implant case*. Editor edits can't fix a missing 10993-13 row a regulator catches. So the §13 generator must NOT let the LLM pick which tests appear — that's the deterministic table's job. The LLM only writes the narrative around the table.

**Review status:** every panel row is currently `estimate`. Founder + CDSCO consultant sign each row → flips to `reviewed` → row exits the [REVIEW] highlight in the generated §13.

**Mechanics:**
- §13 generator reads `wizard_answers.q9` and consults `BIOCOMP_TIER_MATRIX[q9]` for the core panel.
- Conditional add-ons fire from inference markers — drug-eluting from `drug_content`, bioresorbable from `one_liner` / pitch-extract keyword scan (bioresorbable / biodegradable / absorbable / resorbable).
- Source of truth for live values: `lib/engine/draft-pack-v2/iso-10993-tier-matrix.ts`. **The .ts file and this Markdown express the same content — co-edit.**

**Standards baseline:**
- ISO 10993-1:2018 — framework; tests selected by (nature of contact × duration of contact)
- ISO 10993-5:2009 — in-vitro cytotoxicity
- ISO 10993-10:2021 — skin sensitization (now scoped to sensitization only)
- ISO 10993-23:2021 — irritation (split from -10 in the 2021 revision)
- ISO 10993-4:2017 — interactions with blood
- ISO 10993-6:2016 — local effects after implantation
- ISO 10993-11:2017 — systemic toxicity (acute, sub-acute, sub-chronic, chronic)
- ISO 10993-3:2014 — genotoxicity, carcinogenicity, reproductive toxicity (prolonged + long-term)
- ISO 10993-17:2023 — toxicological risk evaluation of constituents (allowable limits)
- ISO 10993-18:2020 — chemical characterization
- ISO 10993-13/14/15:2010 — degradation products from polymeric / ceramic / metallic devices
- ISO 10993-16:2017 — toxicokinetic study design

**Indian context anchors:**
- DMF §8.11 — biocompatibility validation data (Bible §4.B Block 4, line 298)
- Test reports must be from a **NABL-accredited lab** for CDSCO acceptance
- ISO 10993-1:2018 Annex A is the test-selection authority CDSCO reviewers cross-check against

---

## Panel legend

- **core** — test always appears in this Q9 tier; deterministic
- **conditional** — appears only when an add-on flag fires (drug-eluting, bioresorbable, sterilization mode)
- **[REVIEW]** — uncertain cell; founder/consultant sign-off targeted here
- **Status:** `estimate` (default) or `reviewed` (after sign-off)

---

## Q9 = `no_contact`

§13 does NOT appear for this Q9 value — gated out at the section level.

---

## Q9 = `surface_intact_skin`

ISO 10993-1:2018 category: **Surface contact — intact skin**.
Default duration: limited (≤24h) for wearables that briefly touch skin; prolonged (>24h to 30d) for sustained wearables — gates the genotoxicity row. **[REVIEW]** the duration default for typical paying customers; we currently default to **prolonged**.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity (in vitro) | core | Baseline for all patient-contact devices | estimate |
| 10993-10 | Skin sensitization | core | Skin contact — guinea-pig maximization or LLNA | estimate |
| 10993-23 | Irritation | core | Skin irritation patch testing (2021 replaces old -10 irritation) | estimate |
| 10993-3 | Genotoxicity | conditional — prolonged duration | Required if total contact >30 cumulative days | estimate |

Reference: bible §35.1 (BP cuff worked example) — surface-intact-skin panel is **-5 + -10 + -23**. Matches.

---

## Q9 = `surface_mucosal`

ISO 10993-1:2018 category: **Surface contact — mucous membrane**.
Default duration: prolonged. Add mucosal irritation route to -23; consider sub-chronic systemic exposure if active substance present.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Mucosal route still relevant | estimate |
| 10993-23 | Irritation (mucosal) | core | Mucosal irritation method per -23 Annex | estimate |
| 10993-11 | Systemic toxicity (acute) | core | Mucosal route — systemic exposure potential | estimate |
| 10993-3 | Genotoxicity | conditional — prolonged duration | If >24h cumulative | estimate |

---

## Q9 = `blood_path_indirect`

ISO 10993-1:2018 category: **External communicating — circulating blood (indirect path)**.
Example: blood-glucose test strip → meter system; infusion lines NOT directly contacting blood. Duration usually limited.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Material contacting blood-derived analytes | estimate |
| 10993-23 | Irritation | core | Skin route at the user end + blood route at device end | estimate |
| 10993-4 | Hemocompatibility (limited panel) | core | Even indirect blood contact triggers hemolysis + thrombogenicity at minimum | estimate |
| 10993-11 | Systemic toxicity (acute) | core | Leachables systemic-exposure pathway | estimate |

**[REVIEW]** scope of -4 panel for indirect blood path — full hemo panel (thrombogenicity, hemolysis, complement, coagulation) may be over-scoped for a glucometer test strip. The consultant call.

---

## Q9 = `blood_path_direct`

ISO 10993-1:2018 category: **External communicating — circulating blood (direct path)**.
Example: catheters, dialysis circuits, blood collection sets. Duration variable; assume prolonged.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Standard for blood-contact | estimate |
| 10993-23 | Irritation | core | Standard | estimate |
| 10993-4 | Hemocompatibility (full panel) | core | Full -4 panel: hemolysis, thrombogenicity, complement, leukocytes, coagulation | estimate |
| 10993-11 | Systemic toxicity (acute + sub-acute) | core | Direct circulation exposure | estimate |
| 10993-3 | Genotoxicity | core | Direct blood contact + prolonged duration | estimate |
| 10993-18 | Chemical characterization | core | Leachables enter circulation directly | estimate |
| 10993-17 | Allowable limits | conditional — when -18 identifies extractables | Risk-evaluate identified leachables | estimate |

---

## Q9 = `invasive_transient_lt_24h`

ISO 10993-1:2018 category: **External communicating — tissue/bone (limited duration)**.
Example: surgical instruments, suction catheters used intra-op. Limited duration ≤24h.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Tissue contact | estimate |
| 10993-23 | Irritation (intracutaneous) | core | Tissue-irritation route | estimate |
| 10993-11 | Systemic toxicity (acute) | core | Transient exposure but extractables possible | estimate |
| 10993-6 | Local effects | conditional — if tissue retention possible | When device fragments may retain in tissue | estimate |

---

## Q9 = `invasive_long_term_30d`

ISO 10993-1:2018 category: **External communicating — tissue/bone (prolonged duration)**.
Example: indwelling catheters, percutaneous leads. Duration >24h to 30d.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Tissue contact | estimate |
| 10993-23 | Irritation | core | Standard | estimate |
| 10993-6 | Local effects (sub-chronic) | core | Tissue retention | estimate |
| 10993-11 | Systemic toxicity (sub-acute / sub-chronic) | core | Prolonged systemic exposure | estimate |
| 10993-3 | Genotoxicity | core | Prolonged tissue contact triggers genotox | estimate |
| 10993-18 | Chemical characterization | core | Leachables identification baseline | estimate |
| 10993-17 | Allowable limits | conditional — when -18 identifies extractables | Risk evaluate leachables | estimate |

---

## Q9 = `implant_gt_30d`

ISO 10993-1:2018 category: **Implant — tissue/bone OR blood, long-term**.
Example: orthopedic implants, vascular stents, neurostimulators. Duration >30d.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-5 | Cytotoxicity | core | Baseline | estimate |
| 10993-10 | Sensitization | core | Implant material contact | estimate |
| 10993-23 | Irritation | core | Standard | estimate |
| 10993-6 | Local effects (chronic) | core | Implant retention — chronic histopath required | estimate |
| 10993-11 | Systemic toxicity (sub-chronic + chronic) | core | Long-term systemic exposure | estimate |
| 10993-3 | Genotoxicity | core | Long-term contact threshold | estimate |
| 10993-3 | Carcinogenicity | conditional — when material risk signal present | Required when genotox flags or known carcinogen class | estimate |
| 10993-3 | Reproductive / developmental toxicity | conditional — when systemic exposure to reproductive system | Rare — implants near reproductive tissue or in pregnancy population | estimate |
| 10993-18 | Chemical characterization | core | Baseline leachables identification | estimate |
| 10993-17 | Allowable limits | core | Risk evaluate identified leachables (mandatory for chronic) | estimate |

**[REVIEW]** scope of -3 carcinogenicity sub-row: when does a CDSCO Class C/D implant trigger this without explicit material flags? Consultant call.

---

## Conditional add-on — Drug-eluting

Fires when `drug_content` inference marker is affirmative (e.g., "Yes (drug-eluting)"). Stacks ON TOP of the Q9 tier panel.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-17 | Allowable limits | conditional → promoted to **core** | Drug-eluting devices ALWAYS need allowable-limits evaluation of drug + non-drug constituents | estimate |
| 10993-18 | Chemical characterization (extended) | conditional → promoted to **core** | Drug + carrier extractables / leachables fully characterized | estimate |
| 10993-16 | Toxicokinetic study design | core | Drug release profile + systemic absorption modelling | estimate |

Plus the device is treated as a **combination product**: §8.12 (medicinal substances) sub-block in §8 and DCG(I) joint review NOC in §19 also fire. Cross-references go in the §13 narrative.

---

## Conditional add-on — Bioresorbable / Biodegradable

Fires when one-liner or pitch-extract mentions bioresorbable / biodegradable / absorbable / resorbable. Stacks ON TOP of the Q9 tier panel.

| ISO part | Test | Applicability | Rationale | Status |
|---|---|---|---|---|
| 10993-13 | Degradation products — polymeric | conditional — polymer matrix | When matrix is polymeric (e.g., PLA/PLGA stents) | estimate |
| 10993-14 | Degradation products — ceramic | conditional — ceramic matrix | When matrix is ceramic (e.g., bioglass) | estimate |
| 10993-15 | Degradation products — metallic | conditional — metallic matrix | When matrix is metallic (e.g., Mg-alloy stents) | estimate |
| 10993-16 | Toxicokinetic study design | core | Tracks systemic distribution of degradation products | estimate |
| 10993-9 | Framework for degradation identification | core | Risk-management framework for degradation | estimate |

**[REVIEW]** which of -13/-14/-15 fires per stent material class — the matrix material itself is the discriminator; LLM narrative or founder edit must specify which.

---

## Sequencing notes (rendered in §13 narrative)

- §13 testing typically begins **after** material selection in §8 Design & Manufacturing.
- §13 testing runs **in parallel with** §15 Stability Data — accelerated aging samples often double as the leachables source for -17 / -18.
- §13 results feed **§10 Risk Management** (ISO 14971): identified toxicology hazards become risk-controlled in the risk file.
- For sterile devices, **§14 Sterilization Validation** must precede final §13 testing — biocomp samples should be terminally sterilized per the production process, because sterilization can change leachables profiles.

---

## Cost anchor (used by §13 narrative + the Tier 1 effort/cost lookup)

From `tier1-effort-cost-lookup.ts:264` row `biocompatibility_iso_10993`:
- Surface-intact-skin panel (-5/-10/-23): ~₹1.5–3 L, 3–4 months at NABL lab
- Blood-path-direct panel (full -4): ~₹4–7 L, 4–6 months
- Implant + bioresorbable + drug-eluting (full): ~₹8–15 L, 6–9 months

The §13 narrative cites this band; the seed values above feed the row count, not the cost.
