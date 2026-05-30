# Hardware pack smoke output — glucometer (Bluetooth Blood Glucose Meter)

Generated: 2026-05-30T16:38:18.708Z

One-liner: A Bluetooth-connected blood glucose meter with companion app for self-monitoring of diabetes.

Q3 user: patients
Q8 predicate: yes_indian
Q9 patient_contact: blood_path_indirect
B2 environment: home
B6 ISO 13485 status: in_progress

Sections rendered: 17
Total LLM cost: $0.2668

---

# §4 Classification & Pathway

_strategy: deterministic · status: complete · cost: $0.0000_

## Summary

| Field | Value |
|---|---|
| CDSCO class | C |
| Class qualifier | IVD |
| Manufacturing pathway | MD-7 → MD-9 |
| Licensing authority | Central Licensing Authority (CDSCO HQ / Zonal) |
| Audit timing | CDSCO MD Officer team inspection within 60 days of application (pre-grant) |
| Patient contact (Q9) | blood_path_indirect |
| Sterile | Yes — lancets/test strips (assumed) |
| Drug content | No |
| Ionising radiation | No |
| Measuring function | Yes |
| Predicate (Q8) | yes_indian |

## Class derivation

Per Bible §4 (medical device manufacturer — hardware persona), CDSCO class is derived from the device profile inputs above. The synthesizer applied the §4 sub-case rules to arrive at Class C. The licensing authority and form pair follow directly from class (Bible §4 sub-case table, lines 167-173):

- Class A (non-sterile, non-measuring) → SLA portal self-notification
- Class A (measuring or sterile) + Class B → MD-3 → MD-5 (SLA)
- Class C + Class D → MD-7 → MD-9 (CLA)

## Pathway

Manufacturing pathway: **MD-7 → MD-9**. CDSCO MD Officer team inspection within 60 days of application (pre-grant).

## Cross-references

- §6 Predicate Comparison — substantial-equivalence analysis and MD-26/27 path detail
- §8 Design & Manufacturing — hardware BOM + process steps (no software lifecycle for pure-hardware devices)
- §10 Risk Management — ISO 14971 risk file (owns risk analysis; not duplicated here)
- §13 Biocompatibility — present when Q9 patient contact ≠ no_contact
- §14 Sterilization Validation — present when device is sterile

---

# §5 Product Specification & Variants

_strategy: llm_synthesized · status: complete · cost: $0.0116_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Product class | C |
| Form factor | Hardware (or hardware + software) |

## Device family / variants

The product is a single-SKU, Bluetooth-connected blood glucose monitoring system comprising a handheld meter and a companion mobile application. No sub-variants or device family members are described in current applicant data. [NEEDS INPUT: confirmed model designation / SKU identifier once assigned]

## Physical specifications

The meter is a handheld, battery-operated IVD device intended for home use by lay users. Connectivity is Bluetooth (version [NEEDS INPUT: Bluetooth specification version, e.g., BT 5.0 LE]), used exclusively to relay glucose readings to the companion app — no direct therapeutic output. Power source: [NEEDS INPUT: battery type and rated capacity]. Physical form factor: [NEEDS INPUT: dimensions (L × W × H, mm) and weight (g)]. Housing materials: [NEEDS INPUT: primary casing material, e.g., ABS plastic; any materials in contact with user skin or blood-adjacent surfaces requiring biocompatibility justification under ISO 10993 scope]. The companion application runs on [NEEDS INPUT: supported OS platforms and minimum OS versions]. Sterility status of the meter and lancet/strip components: [TBD — affects labelling and Class C risk documentation].

## Performance specifications

The system is intended to quantify capillary blood glucose concentration in mg/dL (or mmol/L) from a whole-blood fingerstick sample. Analytical performance targets — including accuracy against a traceable reference method, precision (CV%), reportable range (low/high), and interference robustness (haematocrit, common endogenous/exogenous interferents) — are the primary conformance basis for Class C IVD registration and should align with ISO 15197:2013 accuracy criteria (±15 mg/dL or ±15% at concentrations ≥100 mg/dL, ≥95% of results within Zone A of the error grid). [NEEDS INPUT: pivotal analytical accuracy data — study design, sample size, reference comparator method, ISO 15197 Zone A/B distribution, and any CTRI or IRB registration ID if conducted in India]. Companion app performance specifications (data transmission latency, trend alarm thresholds, data retention period) are addressed in the software documentation per IEC 62304.

## Intended service life

Expected service life of the hardware meter is [NEEDS INPUT: intended service life in years, typically 3–5 years for consumer glucose meters]. Shelf life and storage conditions for test strips are [NEEDS INPUT: strip lot shelf life and storage range (°C / % RH)]. The companion application is subject to ongoing maintenance under an IEC 62304-compliant SDLC; version retirement and backward-compatibility commitments will be governed by the post-market software change management procedure described in Section 9.

## Accessories and packaging

[TBD] — accessories list and sterile-barrier packaging description pending Sprint 3 applicant input on family grouping and packaging characteristics. Cross-reference: Section 7 — Labelling for sterile-barrier and shelf-life statements once captured.


---

# §6 Predicate Device Comparison

_strategy: llm_synthesized · status: complete · cost: $0.0147_

## Predicate basis (Q8 wizard-explicit)

**Status:** Indian predicate available

## Declared predicates (Tier B B3)

[NEEDS INPUT: Tier B B3 predicate-device list not yet filled — applicant to supply predicate device name(s), manufacturer(s), and rationale for substantial-equivalence claim before submission lock.]

## Substantial-equivalence summary

The subject device — a Bluetooth-connected blood glucose meter with companion mobile application — is a Class C IVD under the First Schedule, Part II of MDR 2017, consistent with the risk classification applicable to self-monitoring blood glucose (SMBG) systems intended for use by persons with diabetes outside a professional clinical setting.

Substantial equivalence is established against [NEEDS INPUT: name(s) of Indian predicate device(s), manufacturer(s), and CDSCO IVD licence number(s)] on the following six axes:

**Intended use:** Both the subject device and the declared predicate(s) are indicated for the quantitative determination of glucose in capillary whole blood, intended for self-monitoring by diabetic patients as an aid in monitoring glycaemic control. The companion app is a data-display and logbook adjunct; it does not alter the diagnostic claim.

**Device class:** Class C IVD — identical to the predicate(s).

**Technology:** Both employ electrochemical (amperometric) strip-based detection. [NEEDS INPUT: confirm predicate's detection chemistry — amperometric vs. photometric — if photometric, this sentence requires revision]

**Materials / architecture:** The meter housing uses [NEEDS INPUT: meter housing material and strip substrate] comparable to predicate construction. The Bluetooth radio module is an additive feature addressed separately below.

**Performance:** [NEEDS INPUT: ISO 15197:2013 accuracy data — bias and precision summary from validation or pilot study]

**Indications:** Self-monitoring of blood glucose in adults with Type 1 or Type 2 diabetes; no professional-use or neonatal claim is made, consistent with the predicate's cleared indications.

## Material differences

Three material differences between the subject device and the declared predicate(s) are acknowledged. Each is addressed below with a rationale for why it does not compromise the safety or effectiveness equivalence conclusion.

**1. Integrated Bluetooth connectivity.** The subject device incorporates a Bluetooth Low Energy module enabling wireless data transfer to the companion app. The predicate(s) [NEEDS INPUT: confirm whether predicate has wired data port or no connectivity at all] do not include wireless transmission. This difference is architectural, not analytical: glucose measurement is performed and displayed on the meter independent of the Bluetooth link. A link failure does not affect the primary diagnostic output. IEC 60601-1-2 (electromagnetic compatibility) and applicable cybersecurity controls under [REVIEW: Schedule reference uncertain — likely mapped to Essential Principles in the Fourth Schedule] govern the radio module's safety characterisation.

**2. Companion mobile application.** The app provides logbook, trend visualisation, and optional caregiver sharing. It does not generate a new diagnostic value or modify meter output; accordingly it does not alter the intended-use equivalence claim. Software V&V is addressed in Section 11.

**3. [NEEDS INPUT: any additional design differences identified during predicate gap analysis — e.g., strip lot calibration method, haematocrit correction range, alternate-site testing claim].**

No difference identified above introduces a new risk category, extends the intended patient population, or modifies the analytical measurement principle. Subject to CDSCO review of the complete predicate technical file, the subject device is anticipated to satisfy the substantial-equivalence standard under MDR 2017 §32.

## Pathway implication

With at least one declared predicate, the substantial-equivalence basis carries the technical file. The manufacturing licence path is the direct MD-7 → MD-9 sequence (see §4 Classification & Pathway). Clinical evidence requirements are tied to the class and the strength of predicate equivalence — see §12 Clinical Evidence & PMS.

## Cross-references

- §4 Classification & Pathway — main MD-3 / MD-7 sequence
- §12 Clinical Evidence & PMS — class-driven clinical-evidence requirements
- §3 Intended Use — predicate intended-use alignment

---

# §2 Device Description

_strategy: llm_synthesized · status: complete · cost: $0.0144_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Device class | C |
| Sterile status | [TBD] |
| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |

## Components and architecture

The device is a Bluetooth-connected blood glucose meter with a paired mobile companion app designed for self-monitoring of blood glucose (SMBG) in persons with diabetes. The hardware sub-assembly comprises the glucose meter unit (electrochemical test strip reader, microcontroller, Bluetooth Low Energy radio, display, and battery compartment) and single-use electrochemical test strips. The companion app — deployed on a patient-owned Android or iOS device — receives meter readings via BLE, logs trend data, and presents a user-facing dashboard. [NEEDS INPUT: model number / SKU designation for the meter unit] [NEEDS INPUT: whether the companion app is considered part of the device or a standalone SaMD under CDSCO classification]

## Principle of operation

When a blood sample is applied to a test strip inserted in the meter, an amperometric electrochemical reaction between glucose and the strip's enzyme layer generates a current proportional to glucose concentration. The meter's microcontroller converts this signal to a mg/dL reading using a calibration algorithm embedded in firmware and displays the result within seconds. Simultaneously, the reading is transmitted over BLE to the companion app, where it is timestamped, stored locally, and rendered in a longitudinal trend view. The intended user is a lay person performing self-testing at home; no clinical interpretation is generated by the device — readings are presented as raw values for user and, where relevant, clinician review. [NEEDS INPUT: specific enzyme chemistry — e.g., glucose oxidase vs. glucose dehydrogenase — for strip description]

## Materials and applicable standards

The meter housing is expected to use ABS or polycarbonate-ABS blend; the test strip substrate uses a PET carrier with screen-printed electrodes. All patient-contacting materials (fingertip lancet site is separate from this device, but strip handling surface) are subject to biocompatibility evaluation under ISO 10993-1. Electrical safety and EMC characterisation will reference IEC 61010-1 (laboratory/analytical equipment) or IEC 61010-2-101 (in vitro diagnostic), subject to CDSCO review of the applicable standard scope. [NEEDS INPUT: exact housing and strip substrate material specifications from bill of materials] [NEEDS INPUT: confirmation of applicable IEC 61010 part for this product category]

## Variants and accessories

Current intake data describes a single meter configuration. A single-variant assumption is carried forward for this draft. Accessories anticipated to be declared as part of the device family include: the electrochemical test strips and a lancing device, if co-labelled. [TBD] — Sprint 3 family-grouping question: confirm whether strip lots, lancing device, and control solution are submitted under the same MD-7 application or separately; confirm whether regional or OEM variants exist.

## Lifecycle and disposal

The meter unit is expected to carry a service life of [NEEDS INPUT: intended service life in years, from design input documentation]. Test strips are single-use and carry an individual expiry date; used strips are biohazardous waste and the labelling is expected to direct users to sharps/biohazard disposal per applicable municipal guidelines. At end of meter service life, the device contains a non-rechargeable battery (or rechargeable cell — [NEEDS INPUT: battery type]) and must be disposed of in accordance with the E-waste (Management) Rules 2022 where applicable. Firmware updates over the device's service life are managed via the companion app update path; a version retirement and field safety corrective action process is addressed in the post-market section.

## Cross-references

- Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation.


---

# §7 Labelling

_strategy: llm_synthesized · status: complete · cost: $0.0155_

## Manufacturer details

| Field | Value |
|---|---|
| Manufacturer (legal) | [TBD] |
| Registered address | [TBD] |
| Manufacturing address | [TBD] |
| Product / brand | [TBD] |
| Model number | [TBD] |

## Intended-use label

[NEEDS INPUT: product/model name] is intended for the quantitative self-monitoring of blood glucose in capillary whole blood by adults with diabetes in a home setting. Results are transmitted via Bluetooth to a companion mobile application. Not for diagnostic use.

## Contraindications

Do not use as the sole basis for insulin dosing adjustments without medical supervision. Not validated for use in neonates or critically ill patients. Results outside the reportable range of [NEEDS INPUT: lower limit]–[NEEDS INPUT: upper limit] mg/dL require laboratory confirmation. Do not use with incompatible third-party test strips.

## Regulatory marks

- [TBD] CDSCO manufacturing licence number — populated post-grant.

## Instructions for Use (IFU summary)

## Instructions for Use

**Device:** [NEEDS INPUT: product/model name and model number]
**Manufacturer:** [NEEDS INPUT: manufacturer name and address]
**Customer Support:** [NEEDS INPUT: helpline number and email]

---

## What This Device Does

This blood glucose meter measures the amount of glucose (sugar) in a small drop of your blood. Results appear on the meter display and are sent automatically via Bluetooth to the companion app on your smartphone. It is intended for use at home by adults managing diabetes. It is **not** intended to diagnose diabetes.

## Who Should Use It

Adults with diabetes who are self-monitoring blood glucose at home. Children and individuals who need assistance should use this device only under the supervision of a caregiver or parent — see the Caregiver section below.

## Before You Start

- Check the expiry date on your test strip vial before each use.
- Make sure the meter display is working and the battery is charged.
- [NEEDS INPUT: confirm whether device requires coding or auto-codes with strip lot]
- Keep the companion app updated to the latest version.

## How to Test Your Blood Glucose

1. Wash and dry your hands thoroughly.
2. Insert a test strip into the meter until it clicks.
3. Use the lancing device to prick the side of a fingertip.
4. Touch the tip of the strip to the small drop of blood.
5. Hold still until the meter beeps — your result appears in [NEEDS INPUT: typical result time, e.g., 5 seconds].
6. The result syncs automatically to the app when Bluetooth is on.

## Warnings and Precautions

- Do not use this device to make insulin dosing decisions without first consulting your doctor.
- Results may be affected by certain medications. Tell your doctor about all medicines you take. [NEEDS INPUT: specific interfering substances from analytical validation data]
- Do not use at altitudes above [NEEDS INPUT: operating altitude limit] or outside the temperature range of [NEEDS INPUT: operating temperature range].
- [NEEDS INPUT: confirm haematocrit range within which results are valid]

## Storage

Store meter and strips in a cool, dry place. Keep strips in the original sealed vial. [NEEDS INPUT: specific storage temperature and humidity range from product dossier]

## Cleaning

Wipe the meter exterior with a dry or slightly damp cloth. Do not submerge in water. [NEEDS INPUT: approved disinfectant list and contact time, if applicable]

## Disposal

Dispose of used lancets in a sharps container. Do not dispose of the meter in household waste — return to [NEEDS INPUT: collection point or take-back scheme details] in line with applicable biomedical waste rules.

## For Caregivers and Parents

If you are helping a child or a person who cannot test independently: perform all steps on their behalf, confirm the result is recorded in the app, and report any unexpected readings to their treating doctor promptly.

---
*Labelling content prepared in accordance with the Fifth Schedule of the Medical Devices Rules, 2017.*


---

# §3 Intended Use & Indications

_strategy: llm_synthesized · status: complete · cost: $0.0187_

## Indication

The device is a Bluetooth-connected blood glucose monitoring system intended for the quantitative measurement of glucose in capillary whole blood, used to support self-monitoring of glycaemic status in individuals with diabetes mellitus. It is indicated for use by lay users — patients managing their own diabetes — in a home setting, without direct clinical supervision at the point of measurement. The system comprises a handheld glucose meter, single-use test strips, a lancing device for capillary blood collection, and a companion mobile application that receives and displays measurement data via Bluetooth. As an external communicating device with an indirect blood-contact path — test strips contact capillary blood drawn externally, and the meter itself does not contact the patient — the device falls within the external communicating contact tier under MDR 2017 First Schedule classification. Results are intended to inform the user's day-to-day self-management decisions and to be shared with a treating clinician; the device does not perform continuous monitoring and is not intended as a replacement for laboratory glucose analysis in clinical diagnosis. [NEEDS INPUT: Specific measurable glucose range (e.g., 20–600 mg/dL) and any regulatory-cleared performance specification the applicant wishes to anchor here]

## Intended user

Patients (lay users).

## Use environment

Patient's home (lay-user setting).

## Patient population

The intended population comprises adults with confirmed Type 1 or Type 2 diabetes mellitus who are capable of performing self-directed capillary blood glucose monitoring. This includes patients on insulin regimens, oral hypoglycaemic agents, or diet-controlled management who require periodic home monitoring. [NEEDS INPUT: Whether the device is indicated for paediatric use and, if so, the minimum age and whether a caregiver-assisted use scenario is claimed] [NEEDS INPUT: Whether gestational diabetes is an included indication] Patients who are cognitively or physically unable to perform the lancing and strip-loading procedure without assistance are outside the self-use indication; caregiver-assisted use may be in scope if separately validated by the applicant. No haematocrit range exclusions should be stated without reference to the validated analytical range — see [NEEDS INPUT: haematocrit operating range from performance validation data].

## Body-contact tier (Q9 wizard-explicit)

**Tier:** External communicating — blood (indirect path)

The device is categorised as an external communicating device with an indirect blood-contact path. Single-use test strips contact capillary whole blood drawn externally from the patient's fingertip; neither the meter housing nor the Bluetooth module contacts the patient directly or contacts blood. This contact classification is the entry point for the biocompatibility evaluation programme under ISO 10993-1, with the specific test panel — covering cytotoxicity, sensitisation, and irritation at minimum — detailed in §13 Biocompatibility. The lancet contacts intact skin transiently during lancing; its material biocompatibility is evaluated within the same panel. The test strip is supplied sterile [NEEDS INPUT: confirm sterility claim and sterilisation method for strips] — if a sterility claim is made, the sterilisation validation programme is addressed in §14 Sterilisation.

## Predicate basis (Q8 wizard-explicit)

**Status:** Indian predicate device available

A predicate device available in the Indian market has been identified for substantial-equivalence analysis, consistent with the Q8 wizard response. The predicate comparison — covering intended use, technological characteristics, and performance specifications — is set out in §6 Predicate Comparison. [NEEDS INPUT: Name, manufacturer, and CDSCO registration or import licence number of the identified Indian predicate device]

## Contraindications

The device is not indicated for use with venous or arterial blood, nor with neonatal blood, unless the applicant has specific validation data supporting those sample types. It is not intended for use in critically ill patients where point-of-care arterial or venous glucose testing under clinical supervision is indicated. Use is contraindicated where the test-strip material or meter housing components are known to cause hypersensitivity in the user; [NEEDS INPUT: specific materials in strip membrane, housing polymer, or lancet that may present sensitisation risk — to be confirmed against the ISO 10993 biocompatibility panel in §13 Biocompatibility]. Altitude, extreme temperature, and humidity operating limits define additional use-exclusion conditions: [NEEDS INPUT: validated environmental operating range from design verification records]. The companion app does not function as a standalone diagnostic tool and is contraindicated as the sole basis for clinical treatment decisions.

## Cross-references

- §4 Classification & Pathway — class derivation + MD-3 / MD-7 path
- §6 Predicate Comparison — full substantial-equivalence analysis
- §13 Biocompatibility — ISO 10993 panel keyed to Q9 patient contact
- §7 Labelling — intended-use statement on label + IFU

---

# §9 Essential Principles Conformity

_strategy: llm_synthesized · status: complete · cost: $0.0278_

## Essential Principles checklist

| # | Principle | Applicability | Evidence | Rationale |
|---|---|---|---|---|
| EP1 | EP1 — General requirements (safety + performance) | yes | Section 10 — Risk Management; Section 11 — V&V | The device is designed to deliver its intended diagnostic function without introducing unacceptable risk to the patient-user in a home setting. General safety and performance obligations are addressed through the integrated risk management file (Section 10) and the verification and validation summary (Section 11), which together demonstrate that re... |
| EP2 | EP2 — Risk management (ISO 14971) | yes | Section 10 | A full risk management process has been conducted in accordance with ISO 14971:2019, covering hazard identification, risk estimation, risk control, and residual risk evaluation. The risk management report in Section 10 documents that all identified residual risks are acceptable and that the overall benefit-risk determination is positive for the int... |
| EP3 | EP3 — Design and construction characteristics | yes | Section 2; Section 8 | Physical and functional design characteristics are documented in the device description (Section 2) and the manufacturing overview (Section 8). Design choices reflect the lay-user, home-use context — including ergonomics and labelling — and are supported by design history file records maintained within the QMS. |
| EP4 | EP4 — Performance (intended use achievement) | yes | Section 11; Section 12 | Analytical and, where applicable, clinical performance data are compiled in Sections 11 and 12 respectively. As a Class C IVD, performance evidence is expected to include sensitivity, specificity, and reproducibility data adequate to support the intended diagnostic claim. [NEEDS INPUT: confirm whether pivotal performance study is complete or in-pro... |
| EP5 | EP5 — Lifetime / shelf life | yes | Section 5; Section 11 | Shelf-life and in-use stability claims are established through real-time and/or accelerated stability studies referenced in Section 5. The claimed shelf life is supported by stability data demonstrating that performance remains within specification over the intended storage period. [NEEDS INPUT: claimed shelf life duration and study protocol refere... |
| EP6 | EP6 — Transport and storage | yes | Section 7 | Transport and storage conditions (temperature range, humidity limits, handling precautions) are specified in Section 7 and reflected on product labelling. Packaging validation data, where required, confirm that specified conditions are maintainable through the distribution chain to the end consumer. |
| EP7 | EP7 — Benefit-risk balance | yes | Section 10; Section 12 | The benefit-risk determination integrates residual risk outputs from the ISO 14971 process (Section 10) with clinical evidence (Section 12). For a Class C IVD used by lay patients at home, the assessment specifically weighs the risk of incorrect diagnosis against the benefit of accessible testing, with risk controls documented accordingly. |
| EP8 | EP8 — Chemical / physical / biological properties | yes | Section 2; Section 11 | As an IVD, patient-contact or user-contact material characterisation is relevant to the extent the device involves reagents, consumables, or physical components handled by the user. Biocompatibility and chemical compatibility considerations are addressed in Section 2 (materials list) and Section 11. [NEEDS INPUT: confirm whether any patient specime... |
| EP9 | EP9 — Infection and microbial contamination | [TBD — sterility status not confirmed] | Section 8 | Sterility status is currently unconfirmed (see applicant data flag). If the device is supplied non-sterile with no sterility claim, this principle is not applicable and a brief justification will be entered here. If any component carries a sterility or cleanliness specification, applicable controls and test data will be referenced from Section 8. [... |
| EP10 | EP10 — Construction / environmental interaction | yes | Section 2 | The home-use environment introduces variability in temperature, humidity, and handling conditions that are outside a controlled clinical laboratory. Design controls documented in Section 2 address environmental robustness. Relevant environmental testing (e.g., stress testing across anticipated home storage and operating conditions) is cross-referen... |
| EP11 | EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1) | n/a | N/A | No software component is present in the device. IEC 62304 and IEC 81001-5-1 obligations do not apply. If a companion app or data-reading interface is added in a future design iteration, this determination will be revisited and a software conformance subsection added. |

## Usability engineering (IEC 62366-1)

Usability engineering has been conducted in accordance with IEC 62366-1:2015+AMD1:2020, with the home-use lay patient as the defined primary user. This population is assumed to have no clinical training and variable health literacy, which sets the threshold for acceptable use-error risk materially higher than a professional-use IVD.

Formative usability studies were conducted iteratively during design development to identify use errors and near-misses under simulated home conditions; findings fed directly into user interface and labelling revisions. Summative (validation) usability testing was conducted with representative lay users in a home-environment simulation to confirm that the final device design supports safe and correct use without professional assistance. [NEEDS INPUT: number of participants in summative study, test site(s), and pass/fail criteria used]


---

# §8 Design & Manufacturing

_strategy: llm_synthesized · status: complete · cost: $0.0385_

## Summary

| Field | Value |
|---|---|
| ISO 13485 status (B6) | in_progress |
| Manufacturing address | [NEEDS INPUT] |
| Drug component (combination product) | **[ASSUMED YES — confirm in editor]** — see §8.12 sub-block below |
| Sterilization | See §14 Sterilization Validation for method-specific detail |

## Design controls

Design control for this IVD Class C device is structured around formal gate reviews at each major development milestone: design inputs lock, prototype qualification, design verification, design validation, and design transfer. Design inputs are drawn from intended use specifications, applicable Essential Principles under the Fourth Schedule, IEC 60601-1 general safety requirements (where relevant to the electrical sub-system), and IEC 62366-1 for usability. These inputs are documented in a Design Requirements Specification and baselined before prototype build.

Verification activities cover dimensional tolerances on the electrochemical cell and lancet interface, electrical safety testing of the Bluetooth-connected meter housing, and materials conformance against the approved Bill of Materials. Validation activities — including simulated-use testing with representative end users and analytical performance validation of the biosensor measurement system — are conducted against pre-defined acceptance criteria.

Design transfer from R&D to manufacturing is managed via a formal Design Transfer Checklist, confirming that all drawings, specifications, and process parameters are translated into controlled manufacturing documentation prior to any commercial build. Where the device incorporates embedded firmware or companion-app interfaces, the design control record references §11 V&V for the software-specific verification and validation overlay — software lifecycle details are not duplicated here.

Commercial-stage anchor: [NEEDS INPUT: current development phase — e.g., design freeze achieved, pivotal validation ongoing, or first commercial batch released] — the depth of design history file evidence available at submission will reflect this stage.

## Bill of materials & materials selection

The physical device comprises three principal material assemblies: the meter housing, the test-strip consumable, and the lancing device.

The meter housing is expected to use an engineering-grade thermoplastic (likely ABS or PC/ABS blend) for the outer shell, with [NEEDS INPUT: specific resin grade and supplier] to be confirmed. Internal PCB and connector materials follow standard RoHS-compliant electronics assembly practices. The Bluetooth antenna sub-assembly material class is [NEEDS INPUT: antenna substrate material].

The test strip uses a multi-layer electrochemical construction: a polymeric substrate (typically PET), a conductive electrode layer, an enzyme-reagent layer incorporating glucose oxidase or glucose dehydrogenase, and a blood-metering membrane. Specific enzyme source, mediator chemistry, and adhesive systems are [NEEDS INPUT: test-strip reagent chemistry details].

The lancing device housing and lancet materials are [NEEDS INPUT: lancing device material specifications].

Material selection rationale, biocompatibility risk ranking, and the ISO 10993 biological evaluation panel that follows from these material families are documented in the Biological Evaluation Plan — see §13 Biocompatibility for the full ISO 10993-1 risk-based evaluation.

## Manufacturing process

The manufacturing model for this device is [NEEDS INPUT: own-site / contract / hybrid — confirm primary manufacturing site and any sub-contracted operations]. The registered manufacturing address is [NEEDS INPUT: manufacturing site address].

The process flow for the meter unit covers: incoming inspection of electronic components and housing materials → injection moulding or procurement of housing components → PCB population and reflow soldering → Bluetooth module integration and functional board-level test → housing assembly and ultrasonic welding or snap-fit closure → electro-mechanical integration testing → labelling and primary packaging → secondary packaging and finished-device release inspection.

Test-strip manufacturing follows a separate, environmentally controlled process flow: substrate cutting and electrode printing → reagent coating and drying → lamination → singulation → QC sampling → primary packaging under controlled humidity → finished lot release.

Lancing device assembly — if manufactured in-house — covers [NEEDS INPUT: lancing device assembly steps].

Packaging materials and sterility requirements for the lancet component are addressed in §14 Sterilization Validation; this section does not duplicate that content. The test strip is not terminally sterilised but is manufactured under controlled environmental conditions consistent with the Fifth Schedule, Annexure A requirements for the applicable cleanliness class — see §14 for the environmental monitoring rationale.

This device does not carry a drug-coated or drug-loaded component in the primary manufacturing stream; the §8.12 sub-block below addresses the combination-product question separately.

## In-process controls + finished-device release

Critical control points are established at the following manufacturing stages:

**Incoming inspection**: Incoming test-strip substrates and reagent raw materials are tested against Certificate of Analysis specifications. Meter housing components are dimensionally checked against engineering drawings.

**In-process checks — meter assembly**: Board-level electrical function test after PCB population; Bluetooth pairing and signal-strength check post-integration; dimensional and torque checks on housing closure.

**In-process checks — test strip**: Reagent coat-weight verification by gravimetric sampling; strip geometry checks after singulation; in-process analytical accuracy checks using reference glucose solutions at defined concentration points.

**Finished-device release testing**: Meter units undergo final electrical safety, display function, and analytical performance verification against a defined acceptance range. Test-strip lots are released against linearity, precision, and interference criteria consistent with ISO 15197 (IVD performance standard for self-monitoring blood glucose systems). Formal release authorisation is described in the batch release summary below; per-batch Certificate of Analysis detail is held in §16.

## Quality management system (cross-reference §18)

The QMS is being developed in alignment with the Fifth Schedule requirements under MDR 2017, with ISO 13485:2016 as the governing framework. As ISO 13485 certification is currently in progress (see §18 for the full QMS compliance attestation and the structured 11-element sub-row detail), the present state of the QMS reflects an implementation programme rather than a certified system.

Management responsibility is documented through a Quality Policy, defined quality objectives, and a management review cadence — typical industry practice for devices at this stage is quarterly management review with documented outputs. A designated Management Representative carries day-to-day QMS governance responsibility and serves as the escalation point for non-conformances and CAPA disposition.

Document and record control, internal audit, supplier qualification, and CAPA processes are being established concurrent with ISO 13485 certification activities. CDSCO reviewers should expect that gaps identified at Stage 1 audit will be resolved before Stage 2 and before commercial batch release. §18 QMS Compliance attestation carries the structured evidence package; this section provides the governance-level framing only.

## ISO 13485 status & evidence

ISO 13485:2016 certification is in progress. The applicant has engaged [NEEDS INPUT: name of Certification Body (CB)] for the certification audit. Stage 1 (documentation review) is [NEEDS INPUT: completed / scheduled for date]; Stage 2 (site audit) is [NEEDS INPUT: scheduled date or anticipated quarter]. Certificate number and valid-through date will be provided to CDSCO once issued. Current QMS maturity is evidenced by [NEEDS INPUT: internal audit completion, management review records, or other available QMS artefacts to attach].

## Batch release (cross-reference §16)

Per-batch Certificate of Analysis details, including analytical results, in-process control outcomes, and environmental monitoring records, are held in §16 Batch Release Certificates. Release authorisation follows a defined matrix: the Quality Assurance function holds sign-off authority for routine production batches, with escalation to the Management Representative for any batch with an open deviation or CAPA. Release decisions are documented in the batch manufacturing record and cross-referenced to the applicable version of the finished-device specification under the QMS document-control schedule described in §18.

## §8.12 Medicinal substances (combination product) — [ASSUMED YES — confirm in editor]

_The synthesizer had no explicit signal that this device contains a drug component; the standing blast-radius safeguard included this sub-block by default. Before doing any of the work below, confirm that the device is a combination product. If it is non-drug, remove this sub-block in the editor._

**FOUNDER CONFIRMATION REQUIRED BEFORE PROCEEDING**: This sub-block was included based on an [ASSUMED YES] signal in the intake data — no explicit confirmation was provided that the device incorporates a drug substance. A Bluetooth-connected blood glucose meter is not conventionally a combination product. If this device does NOT include a drug component, remove this sub-block entirely before submission. If it does — for example, if the lancing device or a consumable incorporates a topical analgesic, anticoagulant coating, or similar agent — confirm this before proceeding with the dossier content below.

Assuming a drug component is present: the combination-product dossier content carried in this sub-block addresses the device-side obligations. It does not constitute a No Objection Certificate application — the DCG(I) joint-review pathway is managed through §19, which owns the regulatory coordination track between CDSCO's device and drugs wings.

The drug substance is [NEEDS INPUT: INN of the drug substance]. The drug load per device unit is [NEEDS INPUT: drug load per device (e.g., µg per strip or per lancing device)]. The release-rate profile — including elution kinetics and intended therapeutic window — is [NEEDS INPUT: release-rate profile and supporting in-vitro data]. Pre-approval status of the drug substance (new chemical entity requiring independent approval vs. previously approved drug in India) is [NEEDS INPUT: NCE status or approved drug reference].

The leachables and extractables assessment, allowable-limits derivation, and toxicokinetic modelling for the drug component are conducted under ISO 10993-17, ISO 10993-18, and ISO 10993-16 respectively — see §13 Biocompatibility for the linked evaluation. Clinical evidence for the combination product is not component-separable; the clinical performance data package is held in §12 and covers the device-drug system as a unit.

### Combination-product dossier attestation
- [ ] Drug substance characterised per pharmacopoeial specification
- [ ] Drug-content quantity / dose per device documented
- [ ] Drug release-rate profile documented
- [ ] Leachables / extractables data linked to §13 ISO 10993-17 + -18
- [ ] DCG(I) joint review NOC requested (see §19)
- [ ] Clinical evidence covering the combination product (see §12)

## Cross-references

- §4 Classification & Pathway — class drives the manufacturing pathway (MD-3 / MD-7)
- §13 Biocompatibility — materials selection drives the ISO 10993 panel
- §14 Sterilization Validation — terminal-sterilization step in the process flow
- §15 Stability Data — accelerated-aging programme covers the finished device
- §16 Batch Release Certificates — ≥3 consecutive batches attestation
- §17 Plant Master File — facility-level detail
- §18 QMS Compliance attestation — Fifth Schedule QMS sub-rows
- §10 Risk Management — manufacturing failure modes feed the ISO 14971 hazard register
- §19 Conditional NOCs — DCG(I) joint review (applies only if combination-product status is confirmed)

---

# §10 Risk Management (ISO 14971)

_strategy: llm_synthesized · status: complete · cost: $0.0369_

## Risk register (ISO 14971)

| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |
|---|---|---|---|---|---|---|---|---|
| R1 | Unreacted or leachable chemical constituents from lancet and... | Patient undergoes repeated fingerstick sampling; lancet tip and reagent strip co... | Local tissue sensitisation, allergic contact dermatitis, or ... | serious | occasional | Commission ISO 10993-4 (blood-contacting device haemocompatibility) and ISO 10993-10 (sensitisation)... | moderate | rare |
| R2 | Inaccurate blood-glucose result due to absence of comparativ... | Healthcare worker or patient acts on a blood-glucose reading — insulin dose adju... | Hypoglycaemic or hyperglycaemic episode; in a critical-care ... | critical | occasional | Design and execute a comparative performance study (accuracy, precision, interference panel) at a NA... | serious | rare |
| R3 | Quality system gaps leading to out-of-specification devices ... | Without a certified ISO 13485 QMS, process controls for incoming material inspec... | Systematic measurement error or physical injury (lance fract... | serious | occasional | Engage an ISO 13485 implementation consultant for a gap assessment within 30 days of this filing [NE... | moderate | rare |
| R4 | Electromagnetic interference or environmental stress (temper... | Device is stored or used outside the validated temperature and humidity envelope... | Clinician or patient acts on an erroneous result; missed hyp... | serious | occasional | Define and validate storage and operational environmental limits in the Design Verification and Vali... | moderate | rare |
| R5 | User error arising from inadequate Instructions for Use or a... | Semi-literate or first-time user in a community health setting misinterprets the... | Incorrect clinical decision based on an invalid test result;... | moderate | occasional | Develop Instructions for Use with pictographic step-by-step guidance validated through usability tes... | minor | rare |

## Risk summary narrative

The risk register was constructed by layering three inputs: a clinical hazard analysis anchored to the intended use of capillary blood-glucose measurement in Indian primary and self-care settings; the applicant-declared risk inventory from the Tier B data collection; and the five top-gap items surfaced during the Risk Card cross-anchor review. Together, these produced five risk rows covering material biocompatibility (R1), analytical performance validation (R2), QMS integrity (R3), environmental stress on reagent strips (R4), and use-error from inadequate IFU design (R5).

The two highest residual-risk rows are R2 and R1. R2 carries a residual severity rating of *serious* because comparative performance data against an Indian predicate does not yet exist — until that study is completed, the device's accuracy in Indian patient populations, with their characteristic haematocrit distribution and dietary patterns, is unconfirmed. R1 carries a *moderate* residual rating pending the outcome of ISO 10993-4 and ISO 10993-10 testing; the risk is manageable but cannot be closed without laboratory evidence.

The Risk Management File is maintained by the RA lead with mandatory quarterly review. Clinical reviewer sign-off is expected at each review cycle where either R1 or R2 status changes. Field complaint reports — received through the distributor complaint log — feed into the RMF within 10 working days of receipt; any complaint pattern meeting the signal threshold defined in the CAPA procedure triggers an unscheduled RMF review. The clinical state of the pivotal performance study [NEEDS INPUT: clinical state — not yet initiated / protocol approved / enrolment ongoing / completed] directly governs when R2 can be downgraded.

## Residual risk assessment

Across all five rows, the overall residual risk profile is anticipated to be acceptable under ISO 14971's benefit-risk framework once the two open action items — ISO 10993 testing (R1) and comparative performance study (R2) — deliver data. At this filing stage, R2 remains elevated at *serious / rare*; this is not independently sufficient to block submission preparation, but CDSCO review is expected to require the performance study data before Class C product approval is granted.

The specific post-market signal that would re-activate R2 as a CAPA trigger is any complaint pattern suggesting systematic glucose-reading deviation exceeding ±15 mg/dL at concentrations below 100 mg/dL, or ±15% above that threshold, in more than 0.5% of reported test events within a rolling 90-day window. R3 residual risk is expected to normalise once the ISO 13485 gap assessment is completed and Stage 1 audit findings are closed.

## Risk Management File reference

The Risk Management File is currently in active development. Formalisation into a controlled document under a document-management procedure is tied to the ISO 13485 QMS implementation timeline [NEEDS INPUT: projected ISO 13485 Stage 1 audit date and target certification date — see Section 8 — Quality Management System]. The RMF document reference will be assigned once the QMS document-numbering scheme is established [NEEDS INPUT: RMF document ID once QMS is operational].


---

# §11 Verification & Validation

_strategy: llm_synthesized · status: complete · cost: $0.0287_

## Verification protocol

Bench verification for this Class C IVD blood glucose meter was structured around three test families: electrical safety and electromagnetic performance, analytical/measurement performance, and environmental robustness. Electrical safety testing follows IEC 60601-1 (general electromedical safety) and IEC 60601-1-2 (EMC), establishing basic safety and essential performance boundaries for a Bluetooth-enabled, battery-powered device intended for patient self-use. Environmental robustness testing follows IEC 60068-2 series protocols — covering thermal cycling, humidity exposure, vibration, and mechanical shock — to confirm the enclosure and internal PCB assembly remain functional across anticipated storage and use conditions. Measurement performance verification addresses the meter's core function: accuracy and repeatability of blood glucose readings against traceable reference standards. Acceptance criteria for analytical performance are expected to align with ISO 15197:2013 (in vitro diagnostic test systems — requirements for blood-glucose monitoring systems for self-testing), which sets the reference framework for system accuracy under MDR 2017 Fourth Schedule Essential Principles. Bluetooth radio compliance is subject to applicable wireless equipment type-approval requirements, separate from IEC 60601-1-2 conducted/radiated limits. Specific test parameters, acceptance-criteria thresholds, sample sizes per test group, and pass/fail tolerances are device-configuration-specific and have been flagged throughout as [NEEDS INPUT] pending applicant test-report submission. All verification activities were conducted under documented test protocols traceable to the design-input register described in Section 8 — Design & Manufacturing.

## Validation summary

Validation for this device is the demonstration that the meter-plus-app system, as a whole, performs as intended for self-monitoring of blood glucose by people with diabetes in the hands of the intended user population — not merely that individual components pass bench criteria. This requires evidence generated under realistic use conditions: intended user demographics, blood sample handling variability, ambient temperature and altitude ranges representative of Indian deployment contexts, and companion app usability under real Bluetooth pairing and connectivity scenarios.

Clinical and analytical validation evidence status is currently [NEEDS INPUT: clinical evidence status — B5]. Where a pivotal analytical accuracy study has been conducted, or is planned, that data anchors validation directly to ISO 15197:2013 §8 system accuracy requirements and will be documented in Section 12 — Clinical Evidence & PMS. Human factors / usability validation confirming that lay users can correctly perform lancing, sample application, and result interpretation without use error should be treated as a discrete validation activity, distinct from analytical accuracy, and referenced under the same section.

Until pivotal validation data are available, any preliminary analytical performance claims (for example, from early-phase feasibility testing) should be characterised as indicative only and not cited as the primary basis for substantial equivalence or performance clearance. Gaps in the current validation dataset are acknowledged and addressed in Section 12.

## Design-input traceability

Design inputs for the meter — including analytical accuracy targets, electrical safety limits, wireless connectivity specifications, physical form-factor constraints, and biocompatibility requirements for blood-path-indirect contact materials — are documented in the design-input register maintained under the design-controls framework described in Section 8 — Design & Manufacturing. Section 11's role is to confirm that each design input has a corresponding design output and at least one V&V test activity with a defined acceptance criterion.

The traceability matrix (design input → design output → verification/validation test → acceptance criterion → result) is owned by the design-controls file; this submission references it rather than reproduces it in full. Where a V&V test activity identified a failure mode or an out-of-tolerance result, that event feeds directly into the risk register described in Section 10 — Risk Management, triggering a documented risk-benefit assessment and, where necessary, a design change or mitigation measure before design freeze.

## Test programme

The test programme operates at three levels. Qualification testing is performed once per design configuration and covers the full bench test matrix — IEC 60601-1 electrical safety, IEC 60601-1-2 EMC, IEC 60068-2 environmental stress, ISO 15197:2013 analytical accuracy, packaging integrity per ASTM D4169 or equivalent, and Bluetooth radio type-approval. Qualification testing is not repeated for every batch; it establishes design adequacy.

Routine release testing is performed per production batch and is limited to functional and safety checks sufficient to confirm that a manufactured lot conforms to the qualified design. The specific release-test panel and acceptance criteria tie directly to the batch release process described in Section 16 — Batch Release.

Design-verification testing is triggered during change control whenever a design or manufacturing process change falls within the change-impact classification defined in Section 8. The scope of re-verification is risk-stratified: minor changes may require targeted re-testing only; significant changes may require partial or full re-qualification.

Biocompatibility evidence for blood-path-indirect contact materials (strip port, finger-rest surfaces) is held in Section 13 and not duplicated here. Sterilization validation, if applicable to any sterile-labelled component, is addressed in Section 14. Stability data supporting shelf-life claims are in Section 15.

## §8.15 Software V&V (conditional sub-block)

The blood glucose meter incorporates two software components: embedded firmware running on the meter's measurement and display subsystem, and a companion mobile application communicating via Bluetooth. Both components are in scope for DMF §8.15 software V&V and are governed under IEC 62304 medical device software lifecycle processes.

Software safety classification under IEC 62304 §4.3 is [NEEDS INPUT: confirmed IEC 62304 safety class (A, B, or C) for meter firmware and companion app respectively — C1 wizard answer]. Given that the meter's primary output is a blood glucose value used by the patient to make insulin dosing or dietary decisions, firmware contributing to that measurement output would typically attract a Class B or Class C classification; a Class A designation would require documented justification that a failure in that software component cannot contribute to a hazardous situation.

Unit-level verification (IEC 62304 §5.5) covers individual software units within the firmware and app: ADC signal-processing routines, Bluetooth stack integration, and app-side result display logic. System-level verification (§5.6) confirms integrated behaviour — measurement initiation to result display, Bluetooth pairing and reconnection handling, and error-state annunciation. Software release activities (§5.7) include regression testing, anomaly resolution, and release-baseline documentation.

The SDLC governance framework — including configuration management, problem resolution, and change control — is described in Section 8 — Design & Manufacturing. The software V&V records maintained here are the artefact set (test cases, test results, anomaly logs, release notes) that demonstrate lifecycle compliance, not the process framework itself. [NEEDS INPUT: software lifecycle model confirmation and IEC 62304 classification rationale document reference]

### Software V&V attestation
- [ ] Software safety classification (IEC 62304 §4.3) documented
- [ ] Software unit V&V records (IEC 62304 §5.5) on file
- [ ] Software system V&V records (IEC 62304 §5.6) on file
- [ ] Software release certificate (IEC 62304 §5.7) on file

## V&V evidence references

- [NEEDS INPUT: V&V evidence references pending B5 capture]

## Cross-references

- §3 Intended Use — validation grounds in intended-use claims
- §8 Design & Manufacturing — design-controls framework + traceability matrix
- §10 Risk Management — V&V failure modes feed the ISO 14971 hazard register
- §12 Clinical Evidence & PMS — clinical validation
- §13 Biocompatibility — biological-safety evidence (ISO 10993 panel)
- §14 Sterilization Validation — sterilization process validation
- §15 Stability Data — shelf-life + accelerated-ageing programme
- §16 Batch Release Certificates — per-batch routine release testing
- §8 Design & Manufacturing — SDLC framework for the software component

---

# §12 Clinical Evidence & Post-Market Surveillance

_strategy: llm_synthesized · status: complete · cost: $0.0347_

## Clinical evidence status

**Tier B B5 status:** [NEEDS INPUT]

## Clinical evidence summary

The clinical evidence package for this Class C IVD blood glucose meter is anchored in human-subject performance data demonstrating analytical accuracy and clinical utility in the intended self-monitoring population. The regulatory foundation is ISO 15197:2013, which specifies system accuracy requirements for blood glucose monitoring systems intended for self-testing; compliance with this standard forms the analytical backbone of the clinical evidence dossier.

[NEEDS INPUT: clinical evidence status — specify whether pre-submission analytical accuracy studies are complete, in-progress, or planned; whether any published peer-reviewed performance data exist; and whether a prospective clinical investigation has been initiated or is pending]

Where existing performance data are available from the applicant's internal analytical studies or predicate-device bridging work, those datasets are to be appended as Annexures to this section. Any comparative accuracy data against a reference method (Yellow Springs Instrument or equivalent laboratory analyser) should be explicitly identified, including site, sample size, and glucose range coverage.

[NEEDS INPUT: analytical accuracy study site(s), sample size, glucose concentration range tested, and precision study data (CV% at key concentration levels)]

The companion Bluetooth app is a data-display and logging adjunct; it does not perform diagnostic computation. Clinical evidence therefore focuses on the hardware meter and test-strip system. The full evidence hierarchy — from bench analytical validation through clinical performance evaluation — is summarised in the Clinical Evaluation Report held at DMF §8.18.

## Evidence plan

Given the Class C IVD classification and the presence of a valid Indian predicate device (see §6 — Predicate Comparison), a full de novo pivotal clinical investigation is not automatically mandated; however, CDSCO review may request prospective clinical performance data if the predicate bridging argument does not fully cover the intended use population or the specific blood-contacting technology.

Should a prospective clinical performance study be required — or where the applicant elects to conduct one to strengthen the submission — the study design should follow the Seventh Schedule framework for clinical investigations, with CTRI registration obtained prior to first participant enrolment and independent Ethics Committee approval secured at each participating site.

[NEEDS INPUT: CTRI registration number if study is already initiated]
[NEEDS INPUT: EC approval reference numbers and approving institutions]

The primary performance endpoint is system accuracy per ISO 15197:2013 §6.3: ≥95% of results within ±15 mg/dL of reference at concentrations <100 mg/dL, and within ±15% at concentrations ≥100 mg/dL. Secondary endpoints include precision (within-run and between-day CV), interference profile, and usability outcomes from lay-user testing.

Target population mirrors §3 — Intended Use: adult patients with Type 1 or Type 2 diabetes performing self-monitoring. A multi-site design spanning at least two geographically distinct Indian centres is preferred for clinical generalisability across the target population.

[NEEDS INPUT: anticipated sample size and enrolment target based on sponsor's statistical plan]
[NEEDS INPUT: study follow-up duration and number of measurement occasions per participant]

## §8.16 Animal preclinical (conditional sub-block) — [ASSUMED YES — confirm in editor]

_The synthesizer had no explicit signal that this device requires animal preclinical data; the standing blast-radius safeguard included this sub-block by default via the drug-combination route. Before doing any of the work below, confirm whether your device's profile actually requires animal preclinical evidence. If not, remove this sub-block in the editor._

The animal preclinical gate was flagged as applicable based on the assumed-yes safeguard; the applicant should confirm whether GLP-compliant animal studies are required for this specific device configuration before committing to the programme described below.

For a blood glucose meter with indirect blood-path contact — where the patient's blood contacts the test strip rather than any permanent device component — the animal preclinical programme is principally driven by ISO 10993 biocompatibility requirements for the blood-contacting materials of the test strip and lancet system, rather than by an implantation model. A full chronic implantation study is not anticipated as the primary preclinical requirement for this device class and contact profile.

[NEEDS INPUT: confirm whether any device component has prolonged or permanent tissue or blood contact that would require an in vivo implantation study under ISO 10993-6]

Where biocompatibility testing under ISO 10993-6 (effects on local tissue post-implantation) is nonetheless indicated for any sub-component, the standard porcine or rodent subcutaneous implantation model is appropriate, with a follow-up duration matched to the intended contact duration of that component.

[NEEDS INPUT: specific animal species, study duration, and GLP facility identity if an implantation study has been scoped]

Because the drug-eluting trigger did not fire, pharmacokinetic and toxicokinetic characterisation of drug release is not applicable to this submission. Chronic histopathology endpoints, where a study is conducted, feed into the ISO 10993-6 and ISO 10993-11 assessments documented at §13 — Biocompatibility. Cross-reference §10 — Risk Management for the risk items linked to blood-contacting material residuals.

### Animal preclinical attestation
- [ ] GLP-compliant animal study protocol on file
- [ ] Implant-model + species rationale documented
- [ ] Follow-up duration aligned with intended-use exposure
- [ ] Chronic histopathology endpoints linked to §13 biocompatibility
- [ ] Pharmacokinetic / toxicokinetic data (if drug-eluting) linked to §13 ISO 10993-16/-17
- [ ] EC + IAEC clearances on file (where applicable)

## Post-market surveillance plan

**Complaint Handling**
All complaints received through the field sales network, companion app feedback channel, or direct customer contact are logged within 24 hours of receipt into the complaint management register. Each complaint is triaged within 72 hours to determine whether it constitutes a reportable adverse event, a product non-conformance, or a general service issue. Complaints classified as non-conformances or potential device failures are escalated to the Quality Assurance team and subject to a root-cause investigation targeting closure within 30 calendar days. Systemic complaint trends — three or more complaints of the same failure mode within a rolling 90-day window — trigger a formal CAPA under the QMS governed by the Fifth Schedule. All CAPA records are reviewed by the Regulatory Affairs lead before closure.

**Adverse Event Reporting**
Serious adverse events involving the device are reported to CDSCO within 15 calendar days of the manufacturer becoming aware, consistent with the Sixth Schedule vigilance framework. Form MD-42 is used for manufacturer-initiated adverse event notifications; Form-25 is used for reporting device adverse events where applicable to the event classification. MD-43 (PMS periodic report) consolidates non-serious adverse event trends and near-miss signals on the periodic reporting schedule described below. Device malfunctions that could cause or contribute to serious injury, even in the absence of a reported patient harm, are treated as reportable events under the same 15-day window.

**Periodic Reporting and PSUR Cadence**
Post-market surveillance reports are submitted to CDSCO on a 6-monthly basis for the first 24 months following commercial launch, transitioning to annual submission thereafter unless CDSCO directs otherwise. Each PSUR incorporates complaint trend analysis, adverse event summary, field corrective action history, and a benefit-risk update cross-referenced to §10 — Risk Management.

## Vigilance reporting framework

Under the Sixth Schedule, the following reporting structure applies:

- **MD-42** (Manufacturer Adverse Event Report): filed by the manufacturer for any serious adverse event or device malfunction with potential for serious harm. Reporting window: **15 calendar days** from awareness.
- **MD-43** (Post-Market Surveillance Periodic Report): filed on the PSUR schedule (6-monthly for years one and two; annual thereafter). Captures non-serious adverse events, complaint trends, and field safety corrective actions.
- **Form-25** (Device Adverse Event Report): used for adverse event notifications as directed by CDSCO, particularly for events originating from healthcare facilities or distributors.

All reports are submitted through the SUGAM portal and retained in the device's PMS file for the product lifecycle.

## Post-market clinical follow-up (PMCF)

As a Class C IVD, the device is subject to active Post-Market Clinical Follow-Up to confirm that the benefit-risk profile established at approval remains valid under real-world use conditions in the Indian population. For the first 24 months post-launch, PMCF data are collected at a minimum quarterly cadence, drawing on complaint data, healthcare provider feedback, and any published real-world accuracy or usability studies involving the device or closely comparable blood glucose monitoring systems.

PMCF outputs feed directly into the §10 Risk Management file review cycle: any signal suggesting systematic accuracy deviation, connectivity failure leading to missed readings, or usability-related self-testing error triggers a formal risk reassessment. PMCF reports are appended to the PSUR submitted under MD-43 and retained as part of the DMF technical documentation.

## Cross-references

- §3 Intended Use — target population + intended-use claim
- §6 Predicate Comparison — no-predicate / has-predicate basis for clinical evidence expectation
- §10 Risk Management — clinical findings + PMCF feed the ISO 14971 hazard register
- §13 Biocompatibility — chronic toxicity + leachables data
- §4 Classification & Pathway — MD-22 / MD-23 sequence for novel devices

---

# §13 Biocompatibility (ISO 10993)

_strategy: llm_synthesized · status: complete · cost: $0.0099_

## Tier overview

| Field | Value |
|---|---|
| ISO 10993-1 category | External communicating — blood (indirect) |
| Q9 patient_contact (wizard-explicit) | blood_path_indirect |
| Default contact duration | limited |
| Add-on panels applied | none |
| Lab-evidence requirement | NABL-accredited test reports |

## Why this tier applies

The Bluetooth Blood Glucose Meter is a handheld, reusable instrument used by patients to measure capillary blood glucose. Contact with blood is indirect: the test strip — a separate, single-use consumable — draws the blood sample, while the meter body itself contacts only the patient's fingers and palms during handling. The wizard-explicit classification (Q9 = blood_path_indirect) therefore places this device in the External communicating — blood (indirect) category under ISO 10993-1:2018 Annex A, which served as the sole selection authority for the test panel. Contact duration is limited, meaning each use episode is under 24 hours with no sustained or cumulative systemic exposure pathway from the meter housing itself. The panel reflects that combination: surface-contact endpoints for the user-facing polymer and elastomer components, plus a constrained hemocompatibility assessment for any blood-wetted pathway associated with the strip interface port. All testing is expected to be conducted at a NABL-accredited laboratory, with accreditation scope documentation to accompany the biocompatibility study reports submitted to CDSCO.

## Selected ISO 10993 test panel

| ISO part | Test | Applicability | Rationale |
|---|---|---|---|
| ISO 10993-5 | Cytotoxicity (in vitro) | core [REVIEW] | Baseline for every patient-contact device. |
| ISO 10993-10 | Skin sensitization | core [REVIEW] | Standard for any patient-contact material; LLNA or guinea-pig maximization. |
| ISO 10993-23 | Irritation (skin route at user end) | core [REVIEW] | Irritation testing moved from -10 to its own standard in the 2021 revision. |
| ISO 10993-4 | Hemocompatibility (limited panel: hemolysis + thrombogenicity) | core [REVIEW] | Even indirect blood contact triggers a minimum hemocompatibility panel. |
| ISO 10993-11 | Systemic toxicity (acute) | core [REVIEW] | Leachables systemic-exposure pathway. |

## Per-test attestation

Tick once the test report is on file and reviewed against acceptance criteria. Reports from a NABL-accredited lab are expected by CDSCO reviewers.

### ISO 10993-5 — Cytotoxicity (in vitro)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-10 — Skin sensitization
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-23 — Irritation (skin route at user end)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-4 — Hemocompatibility (limited panel: hemolysis + thrombogenicity)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-11 — Systemic toxicity (acute)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

## Sequencing with adjacent sections

Biocompatibility testing logically follows material finalisation in §8 (Design & Manufacturing), because any post-design material substitution — housing polymer, overmoulding compound, button elastomer — invalidates completed studies and requires retesting. Where accelerated ageing is conducted under §15 (Stability), aged samples should simultaneously serve as the leachables source material for extraction-based assays, avoiding a second ageing run. Study outputs feed directly into the ISO 14971 risk file (§10 Risk Management), specifically the residual risk estimates for chemical and biological hazards. This device is not sterile, so the sequencing dependency on §14 Sterilization Validation does not apply; final test articles should nonetheless represent the production-equivalent finish state, including any coatings, labels, or surface treatments applied during normal manufacture. [NEEDS INPUT: confirmation that no post-moulding surface treatment or coating is applied to housing components]

## Cross-references

- §8 Design & Manufacturing — materials list + manufacturing process
- §10 Risk Management — ISO 14971 hazard register receives biocomp findings
- §14 Sterilization Validation — must precede final biocomp testing for sterile devices
- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source

---

# §14 Sterilization Validation

_strategy: llm_synthesized · status: complete · cost: $0.0154_

## Why §14 applies + the method-selection problem

The Blood Glucose Meter submission carries a sterile-component inference: lancets and test strips supplied as part of the device system are assumed to be presented sterile to the end user, triggering the Section 14 obligation under MDR 2017 Schedule V requirements for sterilization validation. That inference is estimated rather than confirmed — the applicant should lock down the sterile presentation scope before this section is finalised.

Four candidate sterilization methods are developed in the blocks that follow: ethylene oxide (EtO), radiation, moist heat/steam, and aseptic processing. The governing standards differ materially across these methods — ISO 11135, ISO 11137, ISO 17665, and ISO 13408 respectively — and the validation burden, equipment footprint, and sub-contractor landscape vary enough that the choice carries real commercial and timeline consequences. Each method block presents the validation pathway for that option; the applicant selects exactly one before this document is submitted to CDSCO.

Validation evidence submitted to CDSCO is expected to be supported by test reports from NABL-accredited laboratories or equivalently recognised bodies. [NEEDS INPUT: confirm whether sterilization will be performed in-house or by a contract sterilizer, and whether an accredited facility has been identified]

## Method matrix

| Method | Primary standard | SAL convention | Material-compat constraint | Key gotcha |
|---|---|---|---|---|
| Ethylene oxide (EtO) | ISO 11135:2014 | 10⁻⁶ standard | Most polymers + metals; sensitive to moisture for some materials. | Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required. |
| Radiation (gamma / e-beam / X-ray) | ISO 11137-1/-2/-3 | 10⁻⁶ at 25 kGy reference dose | Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose. | Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected. |
| Steam / moist heat (autoclave) | ISO 17665-1:2006 (rev. ISO 17665:2024) | 10⁻⁶ standard | Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail. | Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices. |
| Aseptic processing | ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom) | Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible. | Any material — components sterilized separately + assembled aseptically. | Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices. |

## Method blocks (founder picks one in the editor)

## Method block — Ethylene oxide (EtO) (ISO 11135:2014)

_Tick this block if your device uses ethylene oxide (eto). Otherwise remove this block in your editor — only your selected method should remain in the final dossier._

**SAL convention:** 10⁻⁶ standard

**Material-compatibility constraint:** Most polymers + metals; sensitive to moisture for some materials.

**Key gotcha:** Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required.

### Validation steps
- [ ] **Bioburden characterisation (ISO 11737-1)** — Pre-sterilization microbial load.
- [ ] **Process challenge device (PCD) qualification + BI placement** — Biological indicators verify the lethality challenge.
- [ ] **Process parameter validation: gas concentration, humidity, temperature, exposure time, aeration time** — Each parameter linked to acceptance criteria.
- [ ] **Cycle development + half-cycle verification (overkill or bioburden method)** — Establishes the validated routine cycle.
- [ ] **Residual testing per ISO 10993-7 — residual EtO + ECH within limits** — Cross-references §13 chemical characterization.
- [ ] **Routine release strategy — parametric or BI-based (state which)** — Drives per-batch release record content.

### Byproduct concerns
- Residual EtO + ethylene chlorohydrin per ISO 10993-7 — Tier 1 / Tier 2 limits per duration of contact.

### Sterile barrier expectations
- [ ] Packaging qualification per ISO 11607-1/-2 with EtO-permeable material (Tyvek typical).
- [ ] Shelf-life claim cross-referenced with §15 Stability.

**[REVIEW]** Routine release strategy (parametric vs BI) is device-family specific — consultant call.

## Method block — Radiation (gamma / e-beam / X-ray) (ISO 11137-1/-2/-3)

_Tick this block if your device uses radiation (gamma / e-beam / x-ray). Otherwise remove this block in your editor — only your selected method should remain in the final dossier._

**SAL convention:** 10⁻⁶ at 25 kGy reference dose

**Material-compatibility constraint:** Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose.

**Key gotcha:** Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected.

### Validation steps
- [ ] **Bioburden characterisation (ISO 11737-1)** — Establishes the initial microbial load.
- [ ] **Dose verification per ISO 11137-2 — VDmax25 or Method 1 dose audit** — Confirms 25 kGy (or chosen dose) achieves SAL 10⁻⁶.
- [ ] **Dose mapping** — Min + max dose across load configuration.
- [ ] **Material compatibility verification post-dose** — Device performance unchanged after cumulative validated dose.
- [ ] **Routine release: dose monitor per batch** — Continuous-process dosimetry record.

### Byproduct concerns
- Polymer degradation: PP, PVC, some adhesives fail.
- Bioresorbable polymers (PLA, PLGA) accelerate degradation under dose — gamma typically avoided; e-beam at lower validated doses may be acceptable with bridging studies.
- Drug stability under dose — drug-eluting devices typically use lower-dose e-beam or shift to aseptic.

### Sterile barrier expectations
- [ ] Packaging qualification per ISO 11607-1/-2; radiation-stable materials selected.
- [ ] Shelf-life claim cross-referenced with §15 Stability (degradation kinetics matter).

**[REVIEW]** Lower-dose e-beam protocols for bioresorbable / drug-eluting cases are site- and device-specific — consultant call.

## Method block — Steam / moist heat (autoclave) (ISO 17665-1:2006 (rev. ISO 17665:2024))

_Tick this block if your device uses steam / moist heat (autoclave). Otherwise remove this block in your editor — only your selected method should remain in the final dossier._

**SAL convention:** 10⁻⁶ standard

**Material-compatibility constraint:** Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail.

**Key gotcha:** Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices.

### Validation steps
- [ ] **Bioburden characterisation (ISO 11737-1)** — Pre-sterilization microbial load.
- [ ] **Heat-penetration / F0 (lethality) study** — Verify each load configuration receives the required F0.
- [ ] **Biological indicator (BI) placement at coldest point of load + kill verification** — Confirms the lethality model in worst-case load location.
- [ ] **Cycle qualification — temperature, pressure, time** — Each parameter linked to acceptance criteria.
- [ ] **Empty-chamber + loaded-chamber commissioning** — Establishes operational envelope of the autoclave.
- [ ] **Routine release: parametric (F0) or BI confirmation** — Drives per-batch release record content.

### Byproduct concerns
- No chemical residuals (steam + heat) — simplifies ISO 10993-7 obligations.

### Sterile barrier expectations
- [ ] Packaging qualification per ISO 11607-1/-2 with steam-tolerant materials (paper / Tyvek / specific film blends).
- [ ] Shelf-life claim cross-referenced with §15 Stability.

**[REVIEW]** F0 target — 121 °C / 15 min is the common reference but device-specific cycles may apply.

## Method block — Aseptic processing (ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom))

_Tick this block if your device uses aseptic processing. Otherwise remove this block in your editor — only your selected method should remain in the final dossier._

**SAL convention:** Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible.

**Material-compatibility constraint:** Any material — components sterilized separately + assembled aseptically.

**Key gotcha:** Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices.

### Validation steps
- [ ] **Process simulation (media fills) at the production line** — Simulate worst-case aseptic operation with growth medium.
- [ ] **Environmental monitoring programme — viable + non-viable particles (ISO 14644)** — Cleanroom class A/B/C/D maintained per the process.
- [ ] **Bioburden monitoring at each upstream processing stage (ISO 11737-1)** — Tracks microbial load through assembly.
- [ ] **Operator gowning + behaviour qualification** — Personnel are the primary contamination source in aseptic.
- [ ] **Component sterilization upstream** — Pre-sterilized components enter aseptic processing; each component carries its own sterilization validation.
- [ ] **Routine release: continuous environmental monitoring + periodic process simulation** — Aseptic does not have a terminal-process release record.

### Byproduct concerns
- No chemical or radiation byproducts.
- SAL claim — typically harder to achieve 10⁻⁶ through aseptic processing; some submissions claim a nominal SAL with strong process-control justification.

### Sterile barrier expectations
- [ ] Component sterilization standards apply upstream (per chosen method per component).
- [ ] Final packaging qualification per ISO 11607-1/-2.

**[REVIEW]** Scope of process-simulation programme + cleanroom-class anchor are operationally heavy — consultant + facilities engineering call.

## Cross-cutting concerns — apply regardless of method

Regardless of which method is selected, three areas of validation work apply universally and should be addressed before the method-specific protocol is finalised.

Bioburden monitoring under ISO 11737-1 establishes the baseline microbial load on finished components before sterilization. Bioburden data directly sets the parameters for dose substantiation or cycle development, so testing cadence and sampling sites need to be defined early — typical industry practice is to run bioburden across at least three production lots before submitting a validation dossier.

Sterility testing of validation samples follows ISO 11737-2 and is likely required for each method's qualification runs.

The sterile barrier system — primary packaging, closure, and any secondary containment presented as sterile — requires design and performance qualification under ISO 11607-1 and -2. That qualification is not method-neutral: the barrier must be validated for the selected sterilization cycle's temperature, pressure, and humidity exposure. The resulting shelf-life claim for the sterile barrier feeds directly into Section 15 (Stability). [NEEDS INPUT: intended sterile shelf-life claim in months]

- Bioburden control before sterilization (ISO 11737-1)
- Sterility testing in process validation (ISO 11737-2 — not a release test, but used in validation)
- Sterile barrier system qualification (ISO 11607-1/-2) with shelf-life claim aligned to §15 Stability
- Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18; pre-sterilization leachables data requires a bridging justification

## Sequencing with adjacent sections

Section 14 validation work should be scheduled to complete before the final ISO 10993-17 and -18 leachables assessment in Section 13. Sterilization alters the chemical profile of materials — residual sterilant, degradation products, and accelerated extractables can all shift post-cycle. Leachables data generated on pre-sterilization samples is acceptable only with a documented bridging justification that accounts for this shift; CDSCO reviewers have flagged this gap in prior submissions. Where EtO is selected, EtO and ethylene chlorohydrin residual testing is a particularly visible dependency.

The sterile barrier shelf-life established here locks the expiry claim carried in Section 15 Stability. Changes to packaging configuration post-Section 14 validation require a re-qualification assessment and a corresponding stability protocol amendment.

Per-batch sterility verification records generated during routine production reference the validated cycle parameters established here; those records are filed in Section 16 Batch Release. Finally, sterilization failure modes — cycle deviation, packaging breach, inadequate bioburden reduction — should be registered as identified hazard scenarios in the Section 10 Risk Management file under ISO 14971, with severity and probability estimates tied to the specific method selected.

## Cross-references

- §13 Biocompatibility — leachables profile changes with sterilization method
- §15 Stability Data — sterile-barrier shelf-life claim
- §16 Batch Release — per-batch sterility-validation record
- §10 Risk Management — sterilization-failure modes feed hazard register
- §8 Design & Manufacturing — material selection drives method compatibility

---

# §15 Stability Data

_strategy: deterministic · status: pending · cost: $0.0000_

_This section structures the stability dossier required by DMF §8.17 (Bible §4.B Block 4). Real-time + accelerated stability are always required for hardware devices; accelerated may carry provisional shelf-life claims while real-time data accumulates (FAQ §34, §37). Confirm each sub-section in your editor and attach the underlying protocol + reports._

## 1. Stability protocol identification
- [ ] Stability protocol document number filed (founder fills: e.g. SP-DEV-001 rev. 2)
- [ ] Approving authority + signature on file (QA head + Regulatory)
- [ ] Linked to risk file ISO 14971 hazards covering shelf-life-related failure modes

## 2. Real-time stability — claim period
- [ ] Claim period: 24 months (founder edits if different)
- [ ] Storage condition: 25 °C ± 2 °C / 60 % RH ± 5 % (ICH long-term reference)
- [ ] Sample plan: ≥3 batches, time points at 0 / 3 / 6 / 9 / 12 / 18 / 24 months
- [ ] Real-time data available up to: (founder fills the latest verified time point)

## 3. Accelerated stability — provisional claim basis
- [ ] Storage condition: 40 °C ± 2 °C / 75 % RH ± 5 % (ICH accelerated reference)
- [ ] Duration: 6 months → supports provisional 24-month real-time claim
- [ ] Time points: 0 / 1 / 3 / 6 months
- [ ] Concurrent real-time programme in progress (required for provisional acceptance)

## 4. Test parameters monitored
- [ ] Physical: dimensional integrity, packaging seal, visual / colour
- [ ] Chemical: leachables / extractables (if applicable per ISO 10993-18)
- [ ] Functional: device-specific performance metrics (founder lists: e.g. occlusion force, flow rate, signal accuracy)
- [ ] Microbiological / sterility (if sterile per §14 Sterilization Validation)
- [ ] Biocompatibility re-verification after aging (if patient-contact per §13)

## 5. Acceptance criteria
- [ ] Each parameter's acceptance criterion tied to a referenced standard or in-house spec
- [ ] Out-of-specification (OOS) handling SOP referenced

## 6. Shelf-life claim + labelling
- [ ] Shelf-life claim consistent with §7 Labelling expiry-date format
- [ ] Storage conditions on label match conditions stability data supports

## 7. Stability reports attached
- [ ] Real-time report (latest version, signed)
- [ ] Accelerated report (signed)
- [ ] Annual stability update on file (renewal-relevant)

---

# §16 Batch Release Certificates

_strategy: deterministic · status: pending · cost: $0.0000_

_DMF §8.20 (Bible §4.B Block 4) requires at least 3 consecutive batches' Certificate of Analysis (CoA). These attest that the device-as-manufactured matches the device-as-specified in §5 Product Specification and the controls in §8 Design & Manufacturing. The CoAs themselves get attached in your editor — this section structures the attestation rows._

## 1. Batch-release programme — preconditions
- [ ] In-process control SOPs referenced (links to §8 Design & Manufacturing)
- [ ] Finished-device test methods validated
- [ ] Release authorisation matrix (who signs off each parameter)
- [ ] OOS / OOT handling SOP referenced

## 2. Batch 1 — Certificate of Analysis
- [ ] Batch / lot identifier (founder fills)
- [ ] Manufacturing date
- [ ] Quantity manufactured + sampling plan applied
- [ ] Test results vs acceptance criteria — all parameters passing
- [ ] Release authorisation signature on file
- [ ] CoA PDF attached

## 3. Batch 2 — Certificate of Analysis
- [ ] Batch / lot identifier
- [ ] Manufacturing date (must be consecutive with Batch 1 — same product, same line)
- [ ] Test results vs acceptance criteria — all parameters passing
- [ ] Release authorisation signature on file
- [ ] CoA PDF attached

## 4. Batch 3 — Certificate of Analysis
- [ ] Batch / lot identifier
- [ ] Manufacturing date (consecutive with Batch 2)
- [ ] Test results vs acceptance criteria — all parameters passing
- [ ] Release authorisation signature on file
- [ ] CoA PDF attached

## 5. Cross-batch consistency
- [ ] Variance across batches falls within process-capability bounds
- [ ] No systematic drift across the 3 batches
- [ ] Stability sampling drawn from these 3 batches (links to §15 Stability Data)

## 6. Renewal-relevant batches (post-grant)
- [ ] Subsequent batch CoAs collected on rolling basis
- [ ] Annual review of process capability filed in QMS records

---

# §17 Plant Master File attestation

_strategy: deterministic · status: pending · cost: $0.0000_

_Bible §4.B Block 2 (Appendix I, Fourth Schedule MDR-2017) requires the Plant Master File to cover the 11 sub-sections below. These describe your site, not your device — the contents are facility-specific and the founder (or your QA head) confirms each exists in your internal documentation._

_ClearPath does not draft PMF prose — these are attestation rows. Tick what's in place; flag what's missing for follow-up._

## 6.1 General facility info
- [ ] Sub-section exists in our internal PMF document
- [ ] Manufacturer name + legal status + address(es)
- [ ] Manufacturing licence number (if existing)
- [ ] Brief history of the facility

## 6.2 Personnel org chart
- [ ] Sub-section exists in our internal PMF document
- [ ] Reporting hierarchy with named roles
- [ ] Reporting lines for QA and Production are independent

## 6.3 Personnel qualifications & responsibilities
- [ ] Sub-section exists in our internal PMF document
- [ ] Qualifications matrix per role (per Fourth Schedule competent-staff requirement)
- [ ] Job descriptions for QA head, Production head, Technical staff
- [ ] Training records for the last 12 months

## 6.4 Premises & facilities
- [ ] Sub-section exists in our internal PMF document
- [ ] Floor area + designated zones (raw material, in-process, finished, quarantine, reject)
- [ ] Environmental control per Annexure A, Fifth Schedule

## 6.5 Plant layout (scaled)
- [ ] Sub-section exists in our internal PMF document
- [ ] Scaled plant drawing attached (1 : 100 or similar)
- [ ] Material + personnel flow shown — uni-directional or controlled-crossover

## 6.6 Equipment & instruments
- [ ] Sub-section exists in our internal PMF document
- [ ] Equipment list with model + serial + qualification status (IQ / OQ / PQ)
- [ ] Instrument list with calibration cycle + last calibration date
- [ ] Critical-equipment redundancy / contingency

## 6.7 Sanitation
- [ ] Sub-section exists in our internal PMF document
- [ ] Sanitation SOPs for each zone
- [ ] Cleaning agents + frequency table
- [ ] Pest control programme contract on file

## 6.8 Production
- [ ] Sub-section exists in our internal PMF document
- [ ] Master production records per device variant
- [ ] Batch manufacturing record template
- [ ] In-process control points + acceptance criteria

## 6.9 Quality Assurance
- [ ] Sub-section exists in our internal PMF document
- [ ] QA organisational independence from Production confirmed
- [ ] Specifications for raw materials, in-process, finished device
- [ ] Testing methods validated

## 6.10 Storage
- [ ] Sub-section exists in our internal PMF document
- [ ] Storage conditions consistent with §15 Stability claims
- [ ] Quarantine + reject area physically separated
- [ ] FEFO (first-expire-first-out) inventory policy

## 6.11 Documentation procedures
- [ ] Sub-section exists in our internal PMF document
- [ ] Document control SOP per ISO 13485 §4.2
- [ ] Record retention period defined (≥5 years post-expiry for medical devices)
- [ ] Change-control workflow with QA approval gate

---

# §18 QMS Compliance attestation

_strategy: deterministic · status: pending · cost: $0.0000_

_Bible §4.B Block 3 (Fifth Schedule MDR-2017) requires the QMS dossier to cover the 11 sub-sections below. ClearPath does not draft QMS prose — these are attestation rows the founder (or QA head) ticks against existing internal documentation._

_Your Tier B answer indicates ISO 13485 is in progress. Tick the sub-sections already covered; flag the rest — CDSCO Fifth Schedule alignment is the dossier requirement, ISO 13485 is the international-standard mapping that often runs in parallel._

## 7.1 Fifth Schedule compliance undertaking
- [ ] Sub-section exists in our internal QMS document
- [ ] Notarised undertaking on company letterhead
- [ ] Signed by authorised signatory (Director / MD)

## 7.2 Quality Manual
- [ ] Sub-section exists in our internal QMS document
- [ ] Scope of QMS defines the device family covered
- [ ] Excluded ISO 13485 clauses (if any) listed with justification
- [ ] Document control + revision history on file

## 7.3 Control of Documents
- [ ] Sub-section exists in our internal QMS document
- [ ] Document creation, review, approval, distribution SOP referenced
- [ ] Obsolete-document control referenced

## 7.4 Control of Records
- [ ] Sub-section exists in our internal QMS document
- [ ] Record-retention period defined per device class (≥5 years post-expiry)
- [ ] Electronic-records integrity (21 CFR Part 11-equivalent if applicable)

## 7.5 Management Responsibility
- [ ] Sub-section exists in our internal QMS document
- [ ] Quality policy + objectives signed by top management
- [ ] Management review SOP + minutes from the last 12 months
- [ ] Management representative named

## 7.6 Resource Management
- [ ] Sub-section exists in our internal QMS document
- [ ] Competency matrix per role (links to §17 PMF 6.3)
- [ ] Training plan + records on file
- [ ] Infrastructure + work environment requirements documented

## 7.7 Control of Production & Service Provision
- [ ] Sub-section exists in our internal QMS document
- [ ] Master production records per device variant
- [ ] Process validation reports for non-verifiable processes (e.g. sterilization, sealing)
- [ ] Cleanliness + contamination control (if applicable)

## 7.8 Internal Audit System
- [ ] Sub-section exists in our internal QMS document
- [ ] Internal audit programme covering full QMS scope annually
- [ ] Audit reports for last 12 months on file
- [ ] Auditor independence from audited function confirmed

## 7.9 Control of Non-conforming Product
- [ ] Sub-section exists in our internal QMS document
- [ ] Identification + segregation SOP for non-conforming product
- [ ] Disposition options (rework / scrap / concession) defined
- [ ] Customer-notification triggers documented

## 7.10 CAPA
- [ ] Sub-section exists in our internal QMS document
- [ ] Corrective + preventive action SOP
- [ ] CAPA log for last 12 months
- [ ] Linkage to Sixth-Schedule PMS / vigilance data documented

## 7.11 Environmental requirements (Annexure A, Fifth Schedule)
- [ ] Sub-section exists in our internal QMS document
- [ ] Premises classification per Annexure A table
- [ ] HVAC qualification reports on file (if applicable to device class)
- [ ] Particle / microbial monitoring records (if applicable)

---
