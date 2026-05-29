# ISO sterilization method matrix — seed values for review

**Purpose:** this table drives **§14 Sterilization Validation** in the ₹2,499 hardware Submission Pack. It maps each of the four sterilization methods CDSCO recognises (EtO / radiation / steam / aseptic) to the relevant ISO standard, key validation steps, byproduct concerns, and material-compatibility constraints.

**Why we emit all four method blocks.** The synthesizer's `sterile` inference marker is yes/no only — there is no method signal (bible §4.D #1 logs "sterilisation mode" as a Sprint-3 question gap). For sterile devices, §14 surfaces *all four* method blocks; the founder picks the applicable one in the editor and removes the rest. This is the same blast-radius logic as §13's add-on overlays — a wrong-included method is removable, a wrong-omitted method is invisible and the regulator catches it.

**Review status:** every row is currently `estimate`. Founder + CDSCO consultant sign off → row flips to `reviewed`.

**Mechanics:**
- §14 generator reads `sterile` marker (calibrated trigger). If sterile, all four method sub-blocks render.
- Each method sub-block carries the table's row content + a Sonnet narrative paragraph tying the method to the founder's device specifics.
- Source of truth for live values: `lib/engine/draft-pack-v2/iso-sterilization-method-matrix.ts`. **The .ts file and this Markdown express the same content — co-edit.**

**Standards baseline:**
- ISO 11135:2014 — Sterilization of health-care products — Ethylene oxide
- ISO 11137-1:2006 + 11137-2:2013 + 11137-3:2017 — Sterilization of health-care products — Radiation
- ISO 17665-1:2006 (currently under revision to ISO 17665:2024) — Sterilization of health-care products — Moist heat
- ISO 13408-1:2008 — Aseptic processing of health-care products (general requirements)
- ISO 11737-1:2018 — Microbiological methods — Determination of bioburden
- ISO 11737-2:2019 — Microbiological methods — Tests of sterility performed in process validation
- ISO 11607-1:2019 / -2:2019 — Packaging for terminally sterilized devices (sterile barrier system)
- ISO 10993-7:2008 — Ethylene oxide sterilization residuals

**Indian context anchors:**
- DMF §8.14 (bible §4.B Block 4, line 301) — sterilization validation required when `sterile=yes`
- CDSCO reviewers expect a Sterility Assurance Level (SAL) statement of 10⁻⁶ for terminally-sterilized devices
- ISO 10993-7 EtO residual limits are referenced for EtO method (residual EtO + ethylene chlorohydrin)
- Test reports + validation documentation expected from a NABL-accredited lab where applicable

**Cross-cutting expectations (apply to all four methods).**
- Bioburden control before sterilization (ISO 11737-1)
- Sterility testing as part of validation (ISO 11737-2 — NOT batch-release release test, but used in validation)
- Sterile barrier system qualification (ISO 11607-1/-2) including shelf-life claim aligned with §15 Stability Data
- Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18 because residuals + degradation products from sterilization alter the leachables profile

---

## Method matrix

| Method | Primary standard | SAL convention | Material-compatibility constraint | Key gotcha |
|---|---|---|---|---|
| EtO | ISO 11135:2014 | 10⁻⁶ standard | Most polymers + metals; sensitive to moisture for some materials | **Residuals.** ISO 10993-7 sets limits for residual EtO + ethylene chlorohydrin (ECH); long aeration cycles required |
| Radiation (gamma / e-beam / X-ray) | ISO 11137-1/-2/-3 | 10⁻⁶ at 25 kGy reference dose | Metals + many polymers OK; PP / PVC degrade; **resorbable polymers (PLA/PLGA) accelerated degradation under dose** | **Material degradation.** Cumulative dose affects mechanical properties; particularly relevant for bioresorbable matrices |
| Steam / moist heat (autoclave) | ISO 17665-1:2006 (rev. 17665:2024) | 10⁻⁶ standard | **Limited to heat-stable + moisture-tolerant materials** — metals, PTFE, PEEK, some glass | Not suitable for most plastics, drug-loaded devices, electronics; temperature-sensitive devices fail |
| Aseptic processing | ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom) | Harder to achieve 10⁻⁶; typically used when terminal sterilization is impossible | Any material — components sterilized separately + assembled aseptically | **Process-control intensive.** Process simulation (media fills) + continuous environmental monitoring; widely used for drug-eluting + bioresorbable devices where terminal sterilization is incompatible |

---

## Method block — EtO (ISO 11135:2014)

**Primary standard:** ISO 11135:2014.

**Key validation steps.**
- Bioburden determination per ISO 11737-1 (pre-sterilization microbial load characterisation)
- Process challenge device (PCD) qualification + biological indicator (BI) placement
- Process parameter validation: gas concentration, humidity, temperature, exposure time, aeration time
- Cycle development + half-cycle verification (overkill or bioburden method)
- Residual testing per ISO 10993-7 — residual EtO + ECH within allowable limits
- Routine release: parametric release or BI-based release (state which)

**Byproduct concerns.**
- Residual EtO + ethylene chlorohydrin per ISO 10993-7 — Tier 1 / Tier 2 limits depending on duration of contact (drives sample timing post-aeration)

**Sterile barrier expectations.**
- Packaging qualification per ISO 11607-1/-2 with EtO-permeable material (Tyvek typical)
- Shelf-life claim cross-referenced with §15 Stability

**[REVIEW]** scope of routine release strategy (parametric vs BI) — consultant call per device family.

---

## Method block — Radiation (ISO 11137-1/-2/-3)

**Primary standard:** ISO 11137-1:2006 (general requirements) + ISO 11137-2:2013 (establishing sterilization dose) + ISO 11137-3:2017 (dosimetric aspects).

**Key validation steps.**
- Bioburden characterisation per ISO 11737-1
- Dose verification per ISO 11137-2 — VDmax25 (verification of 25 kGy as the sterilization dose) or Method 1 dose audit
- Dose mapping — establish min + max dose received across the load
- Material compatibility verification post-dose — confirm device performance unchanged after cumulative dose
- Routine release: dose monitor per batch

**Byproduct concerns.**
- Polymer degradation: PP, PVC, some adhesives fail; **bioresorbable polymers (PLA, PLGA) accelerate degradation under dose** — typically gamma is avoided for bioresorbable; e-beam at lower validated doses may be acceptable but requires bridging studies
- Drug stability under dose — drug-eluting devices typically use lower-dose e-beam or shift to aseptic

**Sterile barrier expectations.**
- Packaging qualification per ISO 11607-1/-2; radiation-stable materials selected
- Shelf-life claim cross-referenced with §15 Stability (degradation kinetics matter)

**[REVIEW]** lower-dose e-beam protocols for bioresorbable / drug-eluting cases — site- and device-specific; consultant call.

---

## Method block — Steam / moist heat (ISO 17665)

**Primary standard:** ISO 17665-1:2006 (general requirements + cycle development). ISO 17665:2024 is the updated single-part replacement currently rolling out.

**Key validation steps.**
- Bioburden characterisation per ISO 11737-1
- Heat penetration / F0 (lethality) study — verify each load configuration receives the required F0
- Biological indicator (BI) placement at coldest point of load + verification of kill
- Cycle qualification: temperature, pressure, time
- Empty-chamber + loaded-chamber commissioning
- Routine release: parametric release on F0 (preferred) or BI confirmation

**Byproduct concerns.**
- Material compatibility — limited applicability: heat-stable + moisture-tolerant materials only. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail
- No chemical residuals (steam + heat) — simplifies ISO 10993-7 obligations

**Sterile barrier expectations.**
- Packaging qualification per ISO 11607-1/-2 with steam-tolerant materials (paper / Tyvek / specific film blends)
- Shelf-life claim cross-referenced with §15 Stability

**[REVIEW]** F0 target — 121 °C / 15 min is the common reference but device-specific cycles may apply.

---

## Method block — Aseptic processing (ISO 13408 series)

**Primary standard:** ISO 13408-1:2008 (general requirements) + ISO 13408 part series covering filtration, lyophilisation, processing of biologicals, isolators, single-use systems.

**Key validation steps.**
- Process simulation (media fills) at the production line — simulate the worst-case aseptic operation with growth medium
- Environmental monitoring programme — viable + non-viable particle counts in classified areas (ISO 14644 cleanroom class A/B/C/D)
- Bioburden monitoring at each upstream processing stage
- Operator gowning + behaviour qualification
- Component sterilization upstream — pre-sterilized components enter aseptic processing
- Routine release: continuous environmental monitoring; periodic process simulation

**Byproduct concerns.**
- None inherent to method (no chemical agent + no radiation)
- SAL claim — terminal-sterilization 10⁻⁶ is harder to achieve through aseptic processing; some submissions claim higher allowable nominal SAL with strong process-control justification

**Sterile barrier expectations.**
- Component sterilization standards apply upstream (per chosen method per component)
- Final packaging qualification per ISO 11607-1/-2

**[REVIEW]** scope of process-simulation programme + cleanroom-class anchor — heavy operational footprint; consultant + facilities engineering call.

---

## Method-selection guidance the LLM narrative should reference

Drug-eluting and bioresorbable devices have method-selection constraints:

- **Drug-eluting:** high-dose gamma typically degrades the drug; EtO may leave residuals on drug surface that complicate ISO 10993-17 limits; **aseptic processing is the typical industry default** for drug-eluting coronary stents and similar devices. The §13 drug-eluting overlay's ISO 10993-17 + 10993-18 + 10993-16 panel changes scope depending on the chosen sterilization method.
- **Bioresorbable polymers (PLA, PLGA, magnesium alloys):** gamma accelerates degradation of resorbable polymers; e-beam at lower validated doses may work but requires bridging studies; **aseptic or low-dose e-beam are typical paths**. The §13 bioresorbable overlay's degradation-product testing (10993-13/-14/-15) is sensitive to the sterilization-induced baseline degradation.

The narrative paragraph in §14 should call out these selection constraints when the device profile triggers them, and explicitly cross-reference §13 for the leachables-profile change implication.

---

## Sequencing notes (rendered in the §14 narrative)

- **§14 → §13:** sterilization validation must complete before final ISO 10993-17 / -18 leachables runs in §13, because sterilization can alter the leachables profile. Pre-sterilization leachables data requires a bridging justification.
- **§14 → §15:** the sterile-barrier shelf-life claim ties to the §15 Stability accelerated-aging programme.
- **§14 → §16 Batch Release:** each released batch carries a sterility-validation record (parametric release or BI confirmation depending on method).
- **§14 → §10 Risk Management:** sterilization-failure modes enter the ISO 14971 hazard register.
