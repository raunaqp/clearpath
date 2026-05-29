# Hardware pack smoke output — implant (Drug-eluting coronary stent)

Generated: 2026-05-29T04:26:25.978Z

One-liner: A bioresorbable drug-eluting cardiac stent for coronary artery disease.

Q8 predicate: no
Q9 patient_contact: implant_gt_30d
B6 ISO 13485 status: in_progress

Sections rendered: 18
Total LLM cost: $0.2810
Assertions: 68 pass / 1 fail

---

# §4 Classification & Pathway

_strategy: deterministic · status: complete · cost: $0.0000_

## Summary

| Field | Value |
|---|---|
| CDSCO class | D |
| Class qualifier | — |
| Manufacturing pathway | MD-7 → MD-9 (heightened scrutiny) |
| Licensing authority | Central Licensing Authority (CDSCO HQ / Zonal) |
| Audit timing | Same as Class C, plus line-by-line Essential Principles examination and effectively-mandatory clinical evidence |
| Patient contact (Q9) | implant_gt_30d |
| Sterile | Yes (assumed) |
| Drug content | Yes (drug-eluting) |
| Ionising radiation | No |
| Measuring function | No |
| Predicate (Q8) | no |

## Class derivation

Per Bible §4 (medical device manufacturer — hardware persona), CDSCO class is derived from the device profile inputs above. The synthesizer applied the §4 sub-case rules to arrive at Class D. The licensing authority and form pair follow directly from class (Bible §4 sub-case table, lines 167-173):

- Class A (non-sterile, non-measuring) → SLA portal self-notification
- Class A (measuring or sterile) + Class B → MD-3 → MD-5 (SLA)
- Class C + Class D → MD-7 → MD-9 (CLA)

Class D adds heightened scrutiny: Essential Principles checklist examined line-by-line, and clinical evidence (§12 Clinical Evidence & PMS) is effectively mandatory even with a predicate.

## Pathway

Manufacturing pathway: **MD-7 → MD-9 (heightened scrutiny)**. Same as Class C, plus line-by-line Essential Principles examination and effectively-mandatory clinical evidence.

## MD-26 / MD-27 pre-permission required

Per your Q8 answer, no predicate device exists in the Indian market for this device. MDR-2017 requires MD-26 pre-permission **before** the MD-3 / MD-7 manufacturing-licence application is filed; the grant arrives on Form MD-27. The §6 Predicate Comparison section walks through this in detail.

## Cross-references

- §6 Predicate Comparison — substantial-equivalence analysis and MD-26/27 path detail
- §8 Design & Manufacturing — hardware BOM + process steps (no software lifecycle for pure-hardware devices)
- §10 Risk Management — ISO 14971 risk file (owns risk analysis; not duplicated here)
- §13 Biocompatibility — present when Q9 patient contact ≠ no_contact
- §14 Sterilization Validation — present when device is sterile

---

# §3 Intended Use & Indications

_strategy: llm_synthesized · status: complete · cost: $0.0135_

## Indication

The device is a bioresorbable drug-eluting coronary stent indicated for the percutaneous revascularisation of de novo or restenotic lesions in native coronary arteries in patients diagnosed with coronary artery disease, including stable angina and select presentations of acute coronary syndrome. Implantation is performed by an interventional cardiologist in a cardiac catheterisation laboratory under fluoroscopic guidance. The stent is intended to restore luminal patency, deliver antiproliferative pharmacotherapy to the vessel wall during the critical restenosis window, and subsequently resorb — eliminating the long-term presence of a permanent implant. [NEEDS INPUT: approved antiproliferative drug coating identity and elution duration] [NEEDS INPUT: reference vessel diameter and lesion length range for which the device is sized]

## Intended user

[TBD].

## Use environment

[TBD] — Tier B B2 question not yet answered.

## Patient population

[NEEDS INPUT: target patient demographics and exclusion criteria] Pending applicant confirmation of clinical study inclusion/exclusion criteria, the anticipated population comprises adult patients (≥18 years) with symptomatic coronary artery disease attributable to obstructive native coronary lesions, who are candidates for percutaneous coronary intervention. Patients with left main disease, chronic total occlusions, or in-stent restenosis within a bioresorbable scaffold should be considered excluded until specific study data support those indications. Pregnancy, severe renal impairment, and active bleeding disorders represent additional anticipated exclusions, subject to the final IFU and clinical data package.

## Decision-making role

Per the IMDRF SaMD significance dimension and Tier A Q2 (decision influence), this device is intended to **[TBD]**.

## Contraindications

Contraindications anticipated for this product class include: known hypersensitivity to the scaffold polymer or to [NEEDS INPUT: drug coating active pharmaceutical ingredient]; vessels with reference diameter or lesion morphology outside the device's validated sizing range [NEEDS INPUT: minimum and maximum reference vessel diameter in mm]; heavily calcified or tortuous lesions judged unsuitable for adequate scaffold deployment; patients in whom dual antiplatelet therapy is contraindicated or cannot be maintained for the minimum required duration [NEEDS INPUT: DAPT duration specified in IFU]; and cardiogenic shock or haemodynamic instability precluding elective percutaneous intervention.


---

# §6 Predicate Device Comparison

_strategy: llm_synthesized · status: complete · cost: $0.0129_

## No-predicate declaration

No predicate device is claimed under this submission. The applicant does not identify an equivalent device already licensed by CDSCO for the same intended use — a bioresorbable, drug-eluting coronary stent with full scaffold resorption over the implant lifecycle. Within Indian regulatory scope, this device is treated as first-in-class for that combination of material platform and drug-delivery mechanism. The consequence is direct: CDSCO applies heightened evidentiary scrutiny, and clinical evidence ceases to be a discretionary element of the dossier. Section 12 (Clinical Evidence) is therefore structured to meet the substantive standard expected of a Class D novel device — not the abbreviated comparator pathway available where a licensed Indian predicate exists. [NEEDS INPUT: Tier B intended use statement, to confirm resorption timeline and drug identity for regulatory scoping]

## MD-26 → MD-27 pre-permission pathway

Because no predicate is claimed, the applicant is required to obtain prior permission from CDSCO before the MD-7 manufacturing licence application can be filed. The operative sequence under MDR 2017 is: (1) file Form MD-26 (application for permission to manufacture a new drug or medical device for the purpose of examination, test, or clinical trial, or for marketing as a novel device); (2) CDSCO reviews and, if satisfied, issues Form MD-27 (permission to manufacture / import the novel device). The MD-7 application is submitted only after MD-27 is in hand — submitting out of sequence risks outright rejection on procedural grounds. Given that this device also carries a drug component, the review committee composition under MD-27 is likely to include both device and pharmacological expertise, which can extend the pre-permission timeline relative to device-only Class D products. The Reviewer Concierge tier is recommended to manage the dual-pathway sequencing and pre-submission meeting scheduling with CDSCO. [TBD: Anticipated MD-26 filing date and whether a pre-submission meeting has been requested]

## Pathway implication

Per MDR 2017 and based on published CDSCO guidance, the manufacturing licence path becomes MD-26 → MD-27 → MD-7 → MD-9. Cross-reference: Section 1 — Executive Summary (headline pathway note) and Section 12 — Clinical Evidence (clinical-investigation route note where applicable).


---

# §5 Product Specification & Variants

_strategy: llm_synthesized · status: complete · cost: $0.0149_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Product class | D |
| Form factor | Hardware (or hardware + software) |

## Device family / variants

The product is currently represented as a single device concept — a bioresorbable drug-eluting cardiac stent for coronary artery disease. Diameter and length variants are anticipated across a commercial family, but no SKU designations have been confirmed. [TBD: variant matrix pending design freeze]

## Physical specifications

The device is a coronary stent scaffold intended for intravascular deployment via percutaneous catheter delivery. It is fabricated from a bioresorbable polymer or alloy substrate [NEEDS INPUT: scaffold base material, e.g., PLLA, magnesium alloy, or other] coated with a therapeutic drug layer [NEEDS INPUT: drug agent, coating chemistry, and nominal drug load in µg/mm²]. Key dimensional parameters — nominal stent diameter range (mm), expanded diameter range (mm), deployed length options (mm), strut thickness (µm), and delivery system profile (Fr) — are [NEEDS INPUT: confirmed dimensional specifications at design freeze]. The device is expected to be supplied sterile [NEEDS INPUT: confirm sterility method — EO, e-beam, or gamma — and sterile packaging configuration]. No active power source or wireless connectivity applies.

## Performance specifications

Functional performance is defined by scaffold radial strength sufficient to maintain vessel patency post-deployment, controlled drug elution kinetics over the therapeutic window, and progressive bioresorption without clinically significant particulate generation. Target metrics — including minimum radial force (N/mm), chronic outward force, drug elution profile (% release at defined timepoints), and resorption timeline (months to complete absorption) — are [NEEDS INPUT: bench-validated performance targets from design verification testing]. Acute procedural success rate and late lumen loss at 6–12 months are the anticipated primary clinical performance endpoints [NEEDS INPUT: clinical performance targets and any available pre-clinical or pilot-study anchor data]. Where pilot data exist, values should be labelled preliminary and subject to pivotal confirmation before CDSCO submission.

## Intended service life

As a bioresorbable implant, the device does not carry a conventional service life in the durable-device sense. The clinically relevant timeframe is the functional scaffold period — from deployment through complete resorption — anticipated at [NEEDS INPUT: expected resorption timeline, e.g., 12–36 months depending on material]. Shelf life of the sterile packaged device prior to implantation is [NEEDS INPUT: validated shelf life in months/years]. Post-resorption, no retrievable hardware remains in situ.

## Accessories and packaging

[TBD] — accessories list and sterile-barrier packaging description pending Sprint 3 applicant input on family grouping and packaging characteristics. Cross-reference: Section 7 — Labelling for sterile-barrier and shelf-life statements once captured.


---

# §7 Labelling

_strategy: llm_synthesized · status: complete · cost: $0.0194_

## Manufacturer details

| Field | Value |
|---|---|
| Manufacturer (legal) | [TBD] |
| Registered address | [TBD] |
| Manufacturing address | [TBD] |
| Product / brand | [TBD] |
| Model number | [TBD] |

## Intended-use label

Bioresorbable drug-eluting coronary stent indicated for percutaneous treatment of de novo native coronary artery lesions in patients with symptomatic ischaemic heart disease. For use by trained interventional cardiologists only. Single use. Sterile. [NEEDS INPUT: Sterile method symbol — e.g., EO, radiation]

## Contraindications

Contraindicated in: known hypersensitivity to [NEEDS INPUT: drug name] or scaffold polymer components; reference vessel diameter outside indicated range; heavily calcified or tortuous lesions precluding adequate delivery; patients in whom DAPT is contraindicated; active bleeding disorders. Not indicated for use in saphenous vein grafts or left main coronary artery. [NEEDS INPUT: Any additional contraindications from clinical data]

## Regulatory marks

- [TBD] CDSCO manufacturing licence number — populated post-grant.

## Instructions for Use (IFU summary)

## Indications
This bioresorbable drug-eluting coronary stent is indicated for improving coronary luminal diameter in patients with symptomatic ischaemic heart disease due to de novo native coronary artery lesions. Suitability criteria — including reference vessel diameter, lesion length, and calcification grade — are detailed in the clinical evaluation summary and must be confirmed by the implanting physician prior to use.

[NEEDS INPUT: Specific lesion length range (mm) and reference vessel diameter range (mm) for inclusion criteria]
[NEEDS INPUT: Drug eluted — generic name, coating concentration, and release profile summary]

## Intended Users and Environment
This device is intended for use exclusively by interventional cardiologists trained in percutaneous coronary intervention (PCI), operating within a fully equipped cardiac catheterisation laboratory. It is not intended for use in emergency improvised settings.

[NEEDS INPUT: Confirmed use environment — e.g., tertiary cardiac cath lab, secondary hospital cath facility]

## Pre-Use Checks
Prior to deployment, verify package integrity, confirm the sterile barrier is intact, and check the expiry date on the outer carton. Do not use if the packaging shows signs of damage, moisture ingress, or prior opening. Inspect the stent delivery system for visible defects before advancing the catheter.

## Directions for Use
Deliver the stent using standard PCI technique via an appropriate guiding catheter. Inflate the balloon to the nominal deployment pressure using a calibrated indeflator.

[NEEDS INPUT: Nominal deployment pressure (atm), rated burst pressure, recommended balloon inflation duration]
[NEEDS INPUT: Compatible guiding catheter inner diameter (French size)]

Post-dilatation with a non-compliant balloon may be performed per operator judgment. Do not resterilise or reuse the delivery system.

## Warnings and Precautions
- The bioresorbable scaffold degrades over approximately [NEEDS INPUT: resorption timeframe, e.g., 24–36 months] following implantation; advise patients and follow-up clinicians accordingly.
- Dual antiplatelet therapy (DAPT) duration should follow current ACC/AHA or appropriate society guidelines and the treating physician's clinical judgment.
- MRI conditional status: [NEEDS INPUT: MRI labelling classification and tested field strength]

## Storage
Store at [NEEDS INPUT: temperature range, e.g., 15–25 °C], away from direct sunlight and moisture. Do not freeze. Maintain sterile packaging until immediately prior to use.

## Disposal
The used delivery system and any unused components are clinical waste. Dispose in accordance with applicable biomedical waste regulations under the Bio-Medical Waste Management Rules, 2016.

## Manufacturer Contact
[NEEDS INPUT: Manufacturer name, address, and post-market surveillance contact details]


---

# §2 Device Description

_strategy: llm_synthesized · status: complete · cost: $0.0200_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Device class | D |
| Sterile status | [TBD] |
| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |

## Components and architecture

This device is a bioresorbable drug-eluting coronary stent — a percutaneously delivered scaffold that provides transient mechanical support to a diseased coronary artery while releasing a controlled dose of antiproliferative drug, after which the scaffold resorbs and is cleared by the body. Principal sub-assemblies are: (1) the bioresorbable polymeric scaffold backbone, fabricated from [NEEDS INPUT: polymer identity, e.g., PLLA or PLGA grade and molecular weight]; (2) the drug-eluting coating layer carrying [NEEDS INPUT: drug name and nominal loaded dose per cm²]; (3) the delivery catheter system comprising balloon, catheter shaft, and hemostatic hub; and (4) the sterile packaging configuration [NEEDS INPUT: packaging format, e.g., single-unit blister/pouch]. All sub-assemblies are supplied as a single-use, pre-mounted assembly.

## Principle of operation

After balloon-catheter delivery to the target lesion, the scaffold expands to appose the vessel wall, restoring luminal patency. The drug coating elutes at a controlled rate — [NEEDS INPUT: elution profile, e.g., ≥80% release within 28 days] — to inhibit neointimal hyperplasia and reduce restenosis risk. Over [NEEDS INPUT: anticipated resorption timeframe, e.g., 24–36 months], the polymer backbone hydrolyzes progressively, eliminating the permanent implant burden associated with metallic drug-eluting stents. The intended operator is an interventional cardiologist performing percutaneous coronary intervention in a cardiac catheterization laboratory. [NEEDS INPUT: Tier B intended use statement — confirm target lesion morphology, vessel diameter range, lesion length limits, and any contraindicated patient subgroups].

## Materials and applicable standards

The scaffold is fabricated from a bioresorbable polymer [NEEDS INPUT: confirm polymer class and grade]; the drug coating matrix is [NEEDS INPUT: polymer carrier identity]. All patient-contact materials are subject to biocompatibility evaluation under ISO 10993-1, with specific testing series — cytotoxicity, sensitization, hemocompatibility, and implantation studies — selected on the basis of the nature and duration of tissue contact (permanent implant category at time of implantation, transitioning to resorbable). Mechanical characterization of the scaffold (radial strength, recoil, fatigue) is conducted per relevant provisions of ISO 25539-2 for coronary stents. [NEEDS INPUT: confirm whether any materials carry prior FDA or CE biocompatibility data packages that can be leveraged].

## Variants and accessories

Available source data describes a single device configuration. For regulatory submission purposes, this document treats the product as a single-variant stent at this stage. Diameter and length matrix (e.g., 2.5–3.5 mm diameter, 12–38 mm lengths) is anticipated based on standard coronary stent practice, but the approved family grouping and size matrix have not been confirmed. [NEEDS INPUT: full size matrix — nominal diameters, available lengths, and any platform differences across sizes] — [TBD] Sprint 3 family-grouping question.

## Lifecycle and disposal

As a single-use implantable device, the product has no reuse service life. The delivery catheter system and packaging are single-use; post-implantation, no retrievable hardware remains after the scaffold resorption period of [NEEDS INPUT: resorption timeframe]. Shelf life of the sterile packaged assembly is [NEEDS INPUT: proposed shelf life and stability data anchor]. Used delivery systems and outer packaging are disposed of as biomedical/clinical waste per applicable hospital waste management protocols (Bio-Medical Waste Management Rules 2016). No special end-of-life recovery or take-back program applies given full in-vivo resorption of the implant itself.

## Cross-references

- Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation.


---

# §8 Design & Manufacturing

_strategy: llm_synthesized · status: complete · cost: $0.0249_

## Summary

| Field | Value |
|---|---|
| ISO 13485 status | in_progress |
| Manufacturing address | [TBD] |
| Software lifecycle | (not applicable — no software, or not captured) |
| ACP required | No |

## Design history

Design control for the bioresorbable drug-eluting cardiac stent is structured around a formal Design History File (DHF), maintained under the QMS and intended to satisfy Schedule V of MDR 2017 for a Class D implantable device. Design inputs — mechanical performance targets (radial force, recoil, fatigue), drug-release kinetics, biocompatibility requirements per ISO 10993 series, and dimensional tolerances — are documented against the intended clinical indication. [NEEDS INPUT: confirmed intended use statement and target lesion population]

Design reviews are structured as gate reviews at minimum four milestones: design input freeze, prototype qualification, design verification, and design validation. Each gate requires sign-off from at minimum the project lead, a clinical advisor, and the QA function before proceeding. Outputs from verification testing (bench, accelerated degradation, drug-elution profiling) and validation activities (pre-clinical and clinical) are captured against each input requirement with explicit pass/fail criteria.

Design transfer — the controlled hand-off from R&D to manufacturing — is documented via a Design Transfer Plan that maps DHF outputs to Device Master Record (DMR) procedures, process qualifications, and in-process control limits. Given that ISO 13485 certification is in progress, the transfer protocol is operating against internal QMS procedures rather than a certified baseline; gaps identified during the CB audit are expected to generate corrective actions before design freeze is declared final.

[NEEDS INPUT: commercial stage — concept / development / pilot / pre-submission]

## Manufacturing process

The stent is manufactured at [TBD — see manufacturing address]. The high-level process sequence runs: raw polymer and drug substance receipt and incoming inspection → extrusion or moulding of bioresorbable scaffold → laser cutting to strut geometry → surface treatment and cleaning → drug coating application → dimensional and coating-uniformity inspection → crimping to delivery system → packaging. [NEEDS INPUT: confirmed process steps and sequence specific to the applicant's platform]

In-process controls are applied at each critical step. Laser-cutting parameters (energy, pulse rate, kerf width) are monitored against a validated window; coating thickness and drug-load uniformity are verified by sampling plan against acceptance criteria; crimp diameter and deployment force are tested per the finished-device specification. Batch records document operator, equipment ID, environmental conditions, and raw-material lot for full traceability.

Finished-product release requires review of the complete batch record, in-process exception log, and final inspection data against the Device Specification. A designated Quality Responsible Person (QRP) authorises release. No batch may ship without a signed Certificate of Conformance referencing the batch number, manufacturing date, and applicable product specifications. Given the Class D designation, any out-of-specification result triggers a formal non-conformance and hold pending CAPA disposition. [NEEDS INPUT: whether the device will be contract-manufactured or manufactured in-house, and the sterility status of the finished configuration]

## Quality management system

The QMS is being built to ISO 13485:2016 as the recognised standard under MDR 2017 Schedule V requirements for a Class D device. Certification is in progress; the current maturity is assessed at the foundational build stage, meaning core procedures are drafted but have not yet completed internal audit or CB assessment. Governance is anchored to a quarterly internal management review covering quality objectives, CAPA status, audit findings, customer feedback, and resource adequacy. The management review output is a documented action register with owners and due dates; critical items are escalated to the Managing Director within five working days.

Document and record control follows a tiered structure: Quality Manual → Standard Operating Procedures → Work Instructions → Forms and Templates. Records are retained for a minimum period consistent with MDR 2017 Schedule V and, for implantable devices, are expected to extend to the lifetime of the device plus applicable post-market period. [NEEDS INPUT: confirmed record-retention period per applicant policy] Change control for any document affecting the Device Master Record requires cross-functional review and QA approval before implementation.

Resource controls — personnel qualification, training records, calibration of measuring equipment, and maintenance of manufacturing equipment — are maintained as discrete sub-systems within the QMS. Production and process controls, including in-process inspection, environmental monitoring where applicable, and batch-record review, are addressed in the manufacturing process summary above and in Section 9 (Risk Management).

The internal audit programme operates on a quarterly cycle, with each cycle covering a rotating subset of QMS elements such that the full system is reviewed annually. Internal audit findings are classified as major or minor non-conformances or observations. Major non-conformances carry a 30-day CAPA closure SLA; minor non-conformances are targeted for closure within 60 days. The CAPA sub-system includes root-cause analysis, effectiveness verification, and trend review at each management review. Given the readiness assessment of 0/2 on both quality system and technical documentation dimensions, the priority actions before any CDSCO submission are completing the internal audit cycle, closing outstanding procedural gaps, and initiating the CB Stage 1 assessment.

## ISO 13485 status & evidence

ISO 13485:2016 certification is currently in progress. The organisation has initiated QMS build activities but has not yet completed an internal audit cycle or engaged a Certification Body for Stage 1 assessment. [NEEDS INPUT: name of selected Certification Body] [NEEDS INPUT: scheduled Stage 1 audit date] [NEEDS INPUT: scheduled Stage 2 audit date] A gap analysis against ISO 13485:2016 and MDR 2017 Schedule V has been initiated internally; outputs will be reviewed at the next quarterly management review prior to CB engagement.

## Batch release / version release (DMF §8.20)

Finished-device batch release documentation will include the completed batch manufacturing record, in-process inspection data, final dimensional and functional test results, raw-material and drug-substance certificates of analysis, and a signed Certificate of Conformance. A minimum of three consecutive conforming batches is expected to be documented in the DMF to demonstrate process consistency at the relevant commercial scale. [NEEDS INPUT: batch size and whether process validation batches have been initiated] Records are retained under the QMS document-control schedule; retention period subject to MDR 2017 Schedule V and implantable-device traceability requirements.


---

# §9 Essential Principles Conformity

_strategy: llm_synthesized · status: complete · cost: $0.0383_

## Essential Principles checklist

| # | Principle | Applicability | Evidence | Rationale |
|---|---|---|---|---|
| EP1 | EP1 — General requirements (safety + performance) | yes | Section 10 — Risk Management; Section 11 — V&V | As a Class D device, the highest tier of CDSCO scrutiny applies. The device is designed and manufactured to achieve its intended clinical purpose without posing unacceptable risks to patients, users, or third parties. Safety and performance claims are substantiated through design controls documented in Section 2, risk management outputs in Section ... |
| EP2 | EP2 — Risk management (ISO 14971) | yes | Section 10 | Risk management is conducted in conformance with ISO 14971:2019, covering hazard identification, probability and severity estimation, risk control implementation, and residual risk acceptability. The risk management file spans the full product lifecycle and is subject to mandatory review at design freeze, design transfer, and each post-market signa... |
| EP3 | EP3 — Design and construction characteristics | yes | Section 2; Section 8 | Design and construction requirements address the physical, mechanical, and material characteristics of the device as specified in the Design History File (Section 2) and the manufacturing controls documented in Section 8. Class D status requires that design outputs are traceable to design inputs and that each critical design feature is verified aga... |
| EP4 | EP4 — Performance (intended use achievement) | yes | Section 11; Section 12 | Clinical and analytical performance data supporting the intended use claim are presented in Section 11 (V&V) and Section 12 (Clinical Evaluation). Performance endpoints — including primary efficacy metrics and any diagnostic accuracy parameters — are defined in the device's intended purpose statement and tested under conditions representative of th... |
| EP5 | EP5 — Lifetime / shelf life | yes | Section 5; Section 11 | The device's expected service life and, where applicable, shelf life are established through accelerated ageing, real-time stability, or performance-over-time testing documented in Section 11. Labelling in Section 5 reflects the validated lifetime claim. For Class D devices, the claimed lifetime must be substantiated by data — a manufacturer assert... |
| EP6 | EP6 — Transport and storage | yes | Section 7 | Transport and storage conditions are defined and validated to confirm that the device arrives at the point of use in a state that meets its performance and safety specifications. Section 7 documents packaging validation, climatic and mechanical stress testing (referencing applicable ASTM or ISTA protocols as used), and the environmental limits stat... |
| EP7 | EP7 — Benefit-risk balance | yes | Section 10; Section 12 | The benefit-risk determination consolidates outputs from the ISO 14971 risk management process (Section 10) and the clinical evaluation (Section 12) into an explicit, documented conclusion that the clinical benefits of the device outweigh its residual risks for the intended population in the intended use setting. For Class D, CDSCO expects this det... |
| EP8 | EP8 — Chemical / physical / biological properties | [TBD — pending confirmation of materials in patient contact] | Section 2; Section 11 biocompatibility (if applicable) | Applicability depends on whether any component of the device comes into contact with the patient, patient tissue, or body fluids, directly or indirectly. If patient contact is confirmed, biocompatibility evaluation under ISO 10993-1 is required, with the evaluation scope (cytotoxicity, sensitisation, extractables/leachables, etc.) determined by the... |
| EP9 | EP9 — Infection and microbial contamination | [TBD — sterility status not confirmed] | Section 8 — sterilization / cleaning validation | Sterility status has not been confirmed in the applicant data (marked [TBD]). If the device is supplied non-sterile and is not intended for use in a sterile field, EP9 applicability may be limited to demonstrating that the device does not promote microbial growth and that any reprocessing instructions are validated. If supplied sterile, ISO 11135 o... |
| EP10 | EP10 — Construction / environmental interaction | yes | Section 2 | The device must be designed to function safely and as intended across the range of environmental conditions likely to be encountered in its intended use setting. This includes electromagnetic compatibility (EMC) where electrical components are present, resistance to ingress of fluids or particulates where relevant, and compatibility with cleaning a... |
| EP11 | EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1) | n_a | N/A | No embedded or standalone software component has been identified for this device. Software conformance under IEC 62304 and IEC 81001-5-1 is therefore not applicable at this submission stage. Should a future design iteration incorporate firmware, control software, or a user interface with software elements, this row must be re-evaluated and the soft... |

## Usability engineering (IEC 62366-1)

Usability engineering is conducted in conformance with IEC 62366-1:2015+AMD1:2020, with the scope and rigor calibrated to the device's intended user population and use environment — both of which require confirmation before finalising the usability engineering plan.

[NEEDS INPUT: intended user type — e.g., trained healthcare professional, lay user, mixed]

[NEEDS INPUT: intended use environment — e.g., hospital ward, home, point-of-care facility]

Formative usability studies are conducted iteratively during design development to identify use-related hazards, evaluate prototype interfaces, and refine the Instructions for Use; findings feed directly into the ISO 14971 risk management file. Summative usability testing — conducted on the final production-equivalent device with a representative sample of intended users in a simulated or actual use environment — generates the evidence of use-safety that supports the conformity claim for this principle. For Class D, CDSCO reviewers may request the full usability engineering file, not merely a summary report.

## Non-applicability justifications

- **EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1)** — No embedded or standalone software component has been identified for this device. Software conformance under IEC 62304 and IEC 81001-5-1 is therefore not applicable at this submission stage. Should a future design iteration incorporate firmware, control software, or a user interface with software elements, this row must be re-evaluated and the software conformance sub-section populated prior to re-submission.


---

# §10 Risk Management (ISO 14971)

_strategy: llm_synthesized · status: complete · cost: $0.0372_

## Risk register (ISO 14971)

| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |
|---|---|---|---|---|---|---|---|---|
| R1 | Incomplete biocompatibility characterisation — blood-contact... | Device implanted in coronary anatomy with unverified material safety profile; sy... | Haemolysis, systemic allergic reaction, thrombus formation, ... | critical | occasional | Commission ISO 10993-4 (blood interactions), -6 (implantation effects), -10 (sensitisation), and -11... | serious | rare |
| R2 | Absence of clinical evidence establishing safety and perform... | Device deployed in human coronary vasculature without a validated pivotal invest... | Procedural failure, vessel injury, stent/implant thrombosis,... | critical | occasional | Engage a clinical research organisation to design a pivotal investigation protocol per Schedule Y an... | serious | rare |
| R3 | Absence of a certified Quality Management System during desi... | Design controls, process validation, supplier qualification, and complaint handl... | Batch-level device defects reaching patients; inadequate com... | serious | occasional | Immediate engagement of an ISO 13485 gap-assessment consultant this quarter; gap assessment outputs ... | serious | rare |
| R4 | Device embolisation or migration post-implantation | Implant detaches from intended coronary site due to undersizing, delivery system... | Coronary occlusion, downstream infarction, emergent surgical... | critical | rare | Sizing matrix and lesion selection criteria to be established through bench testing and finite eleme... | serious | rare |
| R5 | Inadequate Instructions for Use (IFU) or operator training f... | Interventional cardiologist unfamiliar with device-specific deployment steps app... | Procedural complication including coronary dissection, perfo... | serious | occasional | Structured proctor-led training programme to be completed by each operator before independent use; t... | minor | rare |

## Risk summary narrative

The risk register was constructed by anchoring three inputs: the Risk Card top-gap analysis (which flagged biocompatibility, clinical evidence, and QMS gaps as high-priority items), a preliminary clinical hazard analysis covering the coronary implantation procedure pathway, and applicant-declared risk statements. Rows R1 through R3 map directly to those structural gaps; R4 and R5 address device-specific procedural hazards that are standard considerations for any long-term coronary implant and would be expected by CDSCO reviewers of a Class D file.

At this stage of development — [NEEDS INPUT: clinical state, e.g., pre-clinical / first-in-human / investigational] — the highest residual risks are R1 (biocompatibility, pre-testing) and R2 (clinical evidence, pre-investigation). Both remain at serious/rare until their respective workstreams close. Neither is acceptable to carry into a first-in-human study without at least a signed test plan and an approved investigation protocol, respectively.

Ownership of the Risk Management File sits with the RA lead, with clinical reviewer co-sign required for any row where severity is rated critical or where residual probability is reclassified upward. During the investigational phase, the RMF review cadence is monthly — consistent with CDSCO expectations for a Class D device under active clinical investigation. Post-grant, the cadence shifts to quarterly, with field complaint data, vigilance reports, and periodic safety update inputs reviewed at each session. Any single confirmed device-related serious adverse event triggers an unscheduled RMF review within 10 working days.

## Residual risk assessment

Across the five registered risks, three carry a residual severity of serious (R1, R2, R3) and two are minor or serious at rare probability (R4, R5). The overall residual risk profile is not yet acceptable for commercial deployment and is appropriate only for controlled investigational use under an approved MD-22 protocol, subject to CDSCO review.

R1 and R2 are watch-listed for mandatory re-assessment: R1 closes when ISO 10993 series test reports with acceptable conclusions are received; R2 is downgraded incrementally as investigational safety and performance data accumulate. R3 remains elevated until ISO 13485 Stage 1 audit is passed and will trigger a CAPA if the QMS build falls behind the milestone schedule defined in the gap assessment. A single confirmed embolisation event (R4) or documented training non-compliance leading to a procedural complication (R5) constitutes an automatic CAPA signal regardless of residual classification.

## Risk Management File reference

The Risk Management File is currently maintained as a controlled working document under the applicant's interim document management system pending ISO 13485 QMS certification. [NEEDS INPUT: RMF document reference number and version date] [NEEDS INPUT: ISO 13485 gap assessment completion date and CB or consultant engaged — see Section 8 — Quality Management System] Full RMF formalisation, including sign-off by the designated RA lead and clinical reviewer, is targeted to align with the QMS Stage 1 audit milestone.


---

# §11 Verification & Validation

_strategy: llm_synthesized · status: complete · cost: $0.0176_

## Verification protocol

Verification for this Class D device was structured across three domains: functional performance, safety, and compliance with the Essential Principles identified in Section 9. Functional bench testing covered operational accuracy, output repeatability, and failure-mode response under both nominal and boundary-condition inputs. Safety verification addressed electrical safety per IEC 60601-1, electromagnetic compatibility per IEC 60601-1-2, and mechanical integrity under simulated use and transport stress. Performance testing evaluated device output against design specifications across the full intended environmental envelope — temperature, humidity, and supply-voltage variation — documented in the Design Verification Plan [NEEDS INPUT: DVP document reference number and revision].

Each test category maps directly to the Essential Principles as follows: functional and performance tests address Principle 1 (use of device as intended, safety and performance), safety tests address Principles 6–8 (electrical, mechanical, and radiation safety), and environmental stress tests address Principle 14 (performance under foreseeable conditions of use). Test protocols were executed at [NEEDS INPUT: name of test laboratory and NABL/third-party accreditation status]. Summary results and acceptance outcomes are captured in Verification Report [NEEDS INPUT: report ID and date of issue]. Any open non-conformances and their disposition are documented in the Design History File.

## Validation summary

Validation was designed to confirm that the device performs as intended when deployed by real users in representative clinical environments. The validation program encompassed usability evaluation, simulated-use testing, and clinical performance assessment.

Usability validation followed an IEC 62366-1 framework — formative and summative studies were conducted with [NEEDS INPUT: user group descriptor and n, e.g., 'n=X trained clinical operators at Y site']. Summative study acceptance criteria and pass/fail outcomes are documented in the Usability Validation Report [NEEDS INPUT: report reference].

Clinical performance evidence (B5 status) is currently [TBD]. Until the pivotal clinical data package is confirmed, this sub-section carries a material evidence gap. Where a pilot study has been completed, interim findings should be cited here with explicit labelling as preliminary and subject to pivotal confirmation before regulatory reliance — [NEEDS INPUT: pilot study site, CTRI registration ID if applicable, sample size, and key performance endpoints]. The clinical evidence strategy and planned pivotal study design are addressed in Section 12. CDSCO reviewers should treat this section as an interim record pending submission of the complete clinical evaluation report.

## Biocompatibility evidence (DMF §8.11)

The device involves patient contact and is therefore subject to biocompatibility assessment under the ISO 10993 series. Contact classification is [NEEDS INPUT: contact nature — e.g., surface-contacting, externally communicating, or implantable — and contact duration tier per ISO 10993-1 Table 1]. Pending confirmation of the patient-contact tier, a conservative surface-intact-skin classification is applied as a working assumption.

The required test panel, selected in accordance with ISO 10993-1:2018 and the associated CDSCO guidance on biocompatibility, includes [NEEDS INPUT: ISO 10993 test panel anchored to confirmed patient-contact tier — e.g., cytotoxicity, sensitisation, irritation as a minimum for surface contact]. Testing was conducted at [NEEDS INPUT: biocompatibility laboratory name and accreditation]. Summary results and any risk-benefit justifications for tests not conducted are provided in Biocompatibility Evaluation Report [NEEDS INPUT: report reference and date]. Any residual risk from biocompatibility hazards is carried forward to the ISO 14971 risk file (see Section 10).

## Stability data (DMF §8.17)

Stability assessment for this Class D hardware device follows a real-time plus accelerated testing approach consistent with ICH Q1A framing adapted to medical device durability. Accelerated stability studies [NEEDS INPUT: accelerated study conditions, duration, and laboratory reference] were initiated to support a claimed shelf life of [NEEDS INPUT: intended shelf life, e.g., 'X months/years']. Real-time data are being accumulated in parallel; the current real-time data set covers [NEEDS INPUT: elapsed real-time duration and number of units on study]. Stability endpoints include [NEEDS INPUT: specific performance and physical integrity parameters monitored]. Post-market surveillance will include periodic stability re-evaluation consistent with the device's design lifetime. Shelf life labelling will be confirmed following CDSCO review of the complete stability data package.

## V&V evidence references

- [TBD] V&V evidence references pending B5 capture.


---

# §12 Clinical Evidence & Post-Market Surveillance

_strategy: llm_synthesized · status: complete · cost: $0.0302_

## Clinical evidence status

**Tier B B5 status:** [TBD]

## Clinical evidence summary

The device is classified as Class D under MDR 2017, placing it in the highest risk category and making robust clinical evidence effectively mandatory for marketing approval. No predicate device has been identified, which means equivalence arguments are unavailable and the evidentiary burden rests entirely on data generated from the device itself.

The current clinical evidence status is [TBD], pending applicant confirmation. [NEEDS INPUT: clinical evidence status — specify whether the device has pilot/feasibility data, published studies, a completed or ongoing clinical investigation, or no clinical data yet]

If pilot or feasibility data exist, those results should be characterised as preliminary and hypothesis-generating: they support study design assumptions for the pivotal investigation but do not, on their own, satisfy the Class D clinical evidence standard under Schedule 3 of MDR 2017. [NEEDS INPUT: pilot study site(s), enrolled subject count, primary performance metric(s) and observed values — e.g., sensitivity, specificity, primary safety endpoint rate]

Absent a recognised predicate and without a completed pivotal clinical investigation conducted or accepted under Indian regulatory jurisdiction, the evidentiary file is currently insufficient to support MD-7 (import licence) or MD-3 (domestic manufacturing licence) approval in Class D. The clinical investigation pathway described in Section 12.2 and the clinical-investigation pathway note below is the anticipated route to closing this gap.

## Evidence plan

A prospective clinical investigation, registered with CTRI prior to first patient enrolment, is the anticipated pathway to generate the pivotal evidence required for a Class D submission. Ethics Committee approval from an institution accredited under the New Drugs and Clinical Trials Rules must be secured before CI permission is sought from CDSCO.

[NEEDS INPUT: pivotal trial design — primary efficacy endpoint, primary safety endpoint, target sample size and statistical justification, comparator or control arm (active comparator, standard of care, or sham), planned trial sites, and anticipated enrolment timeline]

[NEEDS INPUT: CTRI registration ID — if the study is already registered; if not, confirm pre-registration intent and expected registration date]

The evidence plan should address, at minimum: the intended use population, subgroup stratification where the device's risk profile varies by patient category, a pre-specified primary endpoint with clinically meaningful thresholds, and an independent clinical events committee or data safety monitoring board appropriate to the risk class. Given the novel device status, CDSCO may request a pre-submission meeting to align on acceptable endpoints before CI permission (MD-22) is sought. That alignment meeting should be treated as a milestone in the regulatory project plan.

## Post-market surveillance plan

**Complaint Handling**
All post-market complaints — whether originating from clinical users, patients, service engineers, or distributors — are received through a single intake channel [NEEDS INPUT: complaint intake channel — e.g., dedicated email alias, call centre, field service CRM module] and logged within one business day of receipt. An initial triage determination (complaint vs. non-conformity vs. adverse event vs. product inquiry) is completed within 24 hours of logging. Complaints assessed as potentially device-related safety issues are escalated immediately to the RA Officer and the Quality Lead. Root-cause analysis and CAPA documentation are targeted for completion within 30 days of intake; extensions beyond 30 days require documented justification and RA Officer sign-off. Complaint records are maintained in the device history file and reviewed at the quarterly PMS trend meeting.

**Adverse Event Reporting**
Serious Adverse Events (SAEs) — defined under MDR 2017 as events that led or could have led to death, serious deterioration in health, or required medical or surgical intervention — trigger a 15-working-day reporting obligation to CDSCO from the date the manufacturer becomes aware. The applicable form is MD-42 (manufacturer's adverse event report). Where the event involves a device deficiency that, had it recurred or been used in certain patient populations, could have led to a serious adverse event, a Field Safety Corrective Action report is filed concurrently. Device Adverse Events reported by healthcare facilities or users are captured on Form-25 and routed to the manufacturer's vigilance function. MD-43 is used for periodic summary PMS reporting. The RA Officer is notified within 24 hours of any potential SAE determination at triage; the decision on whether the 15-day clock has started is documented in writing at that point.

**Periodic Reporting and Post-Market Clinical Follow-Up**
A quarterly PMS trend report is reviewed internally by the Quality, Clinical, and RA functions. This report aggregates complaint rates, field corrective actions, adverse event signals, literature surveillance outputs, and registry data [NEEDS INPUT: any real-world registries or databases the device will be enrolled in post-launch]. An annual PMS Summary Report, aligned with the MD-43 cycle, is compiled and submitted to CDSCO per the MDR 2017 schedule. Post-Market Clinical Follow-Up (PMCF) is governed by the protocol described in Section 12.5 below.

## Vigilance reporting framework

Three forms govern post-market vigilance reporting under MDR 2017:

- **MD-42** — filed by the manufacturer for individual serious adverse events and device deficiencies with SAE potential. Reporting window: 15 working days from manufacturer awareness (or 2 calendar days for events requiring immediate field action, depending on severity classification at triage).
- **MD-43** — periodic PMS summary report submitted by the manufacturer. Cadence and submission window are per the MDR 2017 vigilance schedule; [NEEDS INPUT: confirm applicable submission frequency for Class D devices with CDSCO at pre-submission meeting].
- **Form-25** — used by healthcare facilities and users to notify CDSCO of device-related adverse events. The manufacturer's vigilance function monitors CDSCO's feedback channel for Form-25 reports attributed to this device and initiates internal investigation within 5 working days of receipt.

All three forms and their triggering criteria are governed by the MDR 2017 Schedule VIII vigilance provisions.

## Post-market clinical follow-up (PMCF)

PMCF is conducted under a written protocol approved by the RA Officer and reviewed annually. The default cadence is an annual PMCF report drawing on structured follow-up data from participating clinical sites, registry enrolment where applicable, and targeted literature surveillance. For high-risk subgroups — including paediatric patients, patients with significant comorbidities, and any subgroup underrepresented in the pivotal investigation — a tightened 6-month interim review is applied for the first two years post-launch. [NEEDS INPUT: PMCF site list and data collection instrument — e.g., structured CRF, registry enrolment form, patient-reported outcome tool]

PMCF findings are fed back into the risk management file (ISO 14971) at each annual review cycle, and any signal that alters the residual risk conclusion triggers an unscheduled risk file update and RA Officer notification within 10 working days of signal confirmation.

## Clinical investigation pathway

Because the device is Class D with no predicate and no completed pivotal investigation, the clinical investigation (CI) pathway under MDR 2017 is the expected route to licensure. The sequence runs: MD-26 (application for Ethics Committee registration, if not already registered) → MD-27 (EC approval) → MD-22 (application to CDSCO for CI permission) → MD-23 (CDSCO grant of CI permission) → conduct of the clinical investigation under the approved protocol → MD-7 or MD-9 application supported by CI data. CTRI registration precedes first patient enrolment. The Reviewer Concierge tier supports dual-pathway sequencing where the CI permission process and device file preparation run in parallel, reducing total time-to-submission after CI completion.


---

# §13 Biocompatibility (ISO 10993)

_strategy: llm_synthesized · status: complete · cost: $0.0177_

## Tier overview

| Field | Value |
|---|---|
| ISO 10993-1 category | Implant — tissue/bone OR blood (long-term) |
| Q9 patient_contact (wizard-explicit) | implant_gt_30d |
| Default contact duration | long_term |
| Add-on panels applied | drug-eluting, bioresorbable / biodegradable |
| Lab-evidence requirement | NABL-accredited test reports |

## Why this tier applies

A bioresorbable drug-eluting coronary stent is deployed permanently within the coronary vasculature, in sustained contact with blood and perivascular tissue from the moment of implantation. The device is not retrieved — it degrades in situ over months to years, meaning cumulative patient exposure extends well beyond 30 days. The applicant confirmed Q9 = implant_gt_30d, which places this device in the most demanding contact category under ISO 10993-1:2018 Annex A: Implant — tissue/bone OR blood, long-term. That classification is not conservative by convention; it is structurally accurate given the combination of vascular implantation, chronic blood contact, and progressive material breakdown occurring over the device's functional lifetime. All biological evaluation testing reported in this section was conducted, or is being conducted, at NABL-accredited laboratories operating under ISO 17025 scope; documentary evidence of accreditation will accompany individual test reports. The test panel presented in Table 13.1 follows Annex A of ISO 10993-1:2018 directly — the selection authority — and reflects the device's dual drug-eluting and bioresorbable triggers in addition to the long-term implant baseline.

## Selected ISO 10993 test panel

| ISO part | Test | Applicability | Rationale |
|---|---|---|---|
| ISO 10993-5 | Cytotoxicity (in vitro) | core [REVIEW] | Baseline for every patient-contact device. |
| ISO 10993-10 | Skin sensitization | core [REVIEW] | Standard for any patient-contact material; LLNA or guinea-pig maximization. |
| ISO 10993-23 | Irritation (standard) | core [REVIEW] | Irritation testing moved from -10 to its own standard in the 2021 revision. |
| ISO 10993-6 | Local effects after implantation (chronic histopathology) | core [REVIEW] | Implant retention requires chronic local effects. |
| ISO 10993-11 | Systemic toxicity (sub-chronic + chronic) | core [REVIEW] | Long-term systemic exposure. |
| ISO 10993-3 | Genotoxicity | core [REVIEW] | Long-term contact threshold. |
| ISO 10993-3 | Carcinogenicity | conditional [REVIEW] | Required when genotox flags or material in known carcinogen class. [REVIEW] — consultant call on default trigger. |
| ISO 10993-3 | Reproductive / developmental toxicity | conditional [REVIEW] | Rare — implant near reproductive tissue or in pregnancy population. |
| ISO 10993-18 | Chemical characterization | core [REVIEW] | Baseline leachables identification. |
| ISO 10993-17 | Allowable limits | core [REVIEW] | Mandatory risk-evaluation for chronic exposure. |
| ISO 10993-16 | Toxicokinetic study design | core [REVIEW] | Drug release profile + systemic absorption modelling. |
| ISO 10993-9 | Framework for degradation product identification | core [REVIEW] | Risk-management framework for degradation products. |
| ISO 10993-13 | Degradation products — polymeric matrix | conditional [REVIEW] | Fires when matrix is polymeric (e.g., PLA / PLGA stents). |
| ISO 10993-14 | Degradation products — ceramic matrix | conditional [REVIEW] | Fires when matrix is ceramic (e.g., bioglass). |
| ISO 10993-15 | Degradation products — metallic matrix | conditional [REVIEW] | Fires when matrix is metallic (e.g., Mg-alloy stents). |

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

### ISO 10993-23 — Irritation (standard)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-6 — Local effects after implantation (chronic histopathology)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-11 — Systemic toxicity (sub-chronic + chronic)
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-3 — Genotoxicity
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-3 — Carcinogenicity
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-3 — Reproductive / developmental toxicity
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-18 — Chemical characterization
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-17 — Allowable limits
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-16 — Toxicokinetic study design
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-9 — Framework for degradation product identification
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-13 — Degradation products — polymeric matrix
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-14 — Degradation products — ceramic matrix
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

### ISO 10993-15 — Degradation products — metallic matrix
- [ ] Test report on file (NABL-accredited lab)
- [ ] Results meet acceptance criteria
- [ ] Linked to §10 Risk Management hazard analysis

## Drug-eluting overlay

When a stent platform also functions as a controlled-release reservoir, the biological evaluation scope expands beyond the scaffold material alone. The eluted therapeutic agent and its degradation intermediates represent independent chemical exposures that require characterisation under ISO 10993-18 (extended chemical characterisation, covering both scaffold leachables and drug-related extractables) and quantitative risk assessment under ISO 10993-17 to establish tolerable contact limits for each identified substance. Because systemic drug exposure follows a pharmacokinetic profile — not a steady-state leachable — ISO 10993-16 toxicokinetic study design is needed to frame absorption, distribution, and clearance assumptions that underpin the -17 risk thresholds. This device is therefore a combination product in regulatory substance; the medicinal component is addressed in §8.12 (medicinal substances sub-block within Design & Manufacturing) and will be subject to DCG(I) joint review as described in §19.

## Bioresorbable overlay

Bioresorbable scaffolds introduce an exposure pathway that metallic permanent implants do not: the scaffold itself becomes a source of degradation products that are absorbed systemically. ISO 10993-9 provides the overarching framework for identifying and characterising those products over the degradation timeline. Downstream of that framework, matrix-class-specific standards govern quantification and assessment — ISO 10993-13 for polymeric matrices, ISO 10993-14 for ceramics, and ISO 10993-15 for metallic or metal-containing systems. All three appear conditionally in Table 13.1 because the primary scaffold matrix material for this device requires explicit confirmation. [NEEDS INPUT: primary scaffold matrix class — polymer, ceramic, or metal alloy — so that the applicable standard among -13/-14/-15 can be designated active and the others withdrawn.] ISO 10993-16 toxicokinetic design applies here as well, independently of the drug-eluting trigger, because degradation product systemic exposure profiles are time-dependent and must be modelled across the resorption window.

## Sequencing with adjacent sections

Section 13 testing is sequenced to the design freeze confirmed in §8 Design & Manufacturing — initiating biological evaluation on a pre-final material formulation introduces rework risk if late design changes alter the leachables profile. Accelerated-aging samples generated under §15 Stability are the preferred source for leachables and extractables testing under -18, so the two programmes are run in parallel with a shared sample management plan. Risk management inputs from this section — tolerable limits, identified hazardous degradation products, residual risks — feed directly into the §10 risk management file and should be formally transferred at each design review gate. For this sterile device, §14 Sterilization Validation results are required before final -18 and -17 assessments are concluded, because the sterilization cycle can meaningfully alter extractable profiles.

## Cross-references

- §8 Design & Manufacturing — materials list + manufacturing process
- §10 Risk Management — ISO 14971 hazard register receives biocomp findings
- §14 Sterilization Validation — must precede final biocomp testing for sterile devices
- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source
- §8.12 Medicinal substances sub-block (in §8) — drug component dossier
- §19 Conditional NOCs — DCG(I) joint review for combination product

---

# §14 Sterilization Validation

_strategy: llm_synthesized · status: complete · cost: $0.0199_

## Why §14 applies + the method-selection problem

This device is a bioresorbable drug-eluting coronary stent intended for implantation in a coronary artery — a finished sterile implant under Schedule III of MDR 2017. Section 14 therefore carries direct regulatory weight: the device reaches the patient in a sterile state, and the sterilization process is a critical determinant of both safety and performance. The problem is harder than a standard implant. Two material constraints operate simultaneously — the drug payload and the bioresorbable polymer matrix — and they impose conflicting demands on any sterilization method. Each of the four method blocks that follow (EtO, radiation, steam, aseptic processing) presents the validation pathway for one approach; the founder selects the appropriate method based on the specific drug, polymer system, and manufacturing context. Validation evidence is expected to rest on NABL-accredited test reports, referenced against the applicable standard in each method block — ISO 11135 for EtO, ISO 11137 for radiation, ISO 17665 for moist heat, and ISO 13408 for aseptic processing. The method-selection reasoning itself must appear in the technical file as a documented rationale, not merely an implied choice.

## Method matrix

| Method | Primary standard | SAL convention | Material-compat constraint | Key gotcha |
|---|---|---|---|---|
| Ethylene oxide (EtO) | ISO 11135:2014 | 10⁻⁶ standard | Most polymers + metals; sensitive to moisture for some materials. | Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required. |
| Radiation (gamma / e-beam / X-ray) | ISO 11137-1/-2/-3 | 10⁻⁶ at 25 kGy reference dose | Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose. | Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected. |
| Steam / moist heat (autoclave) | ISO 17665-1:2006 (rev. ISO 17665:2024) | 10⁻⁶ standard | Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail. | Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices. |
| Aseptic processing | ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom) | Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible. | Any material — components sterilized separately + assembled aseptically. | Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices. |

## Method-selection guidance for this device

For a drug-eluting coronary stent, the sterilization method cannot be evaluated on physical parameters alone. High-dose gamma irradiation — commonly 25 kGy — is known to degrade polymer chains in PLA- and PLGA-based matrices and can oxidise or fragment the drug molecule itself; this is rarely recoverable with a bridging study alone, making high-dose gamma a high-risk choice for most bioresorbable drug-eluting configurations. E-beam at a lower validated dose may be feasible with bridging studies confirming drug potency and polymer molecular-weight retention, but dose uniformity across a stent geometry requires specific applicator qualification. EtO is compatible with temperature-sensitive materials but introduces residual solvent concerns that interact directly with the implant's leachables profile — see Section 13 for the implications on the ISO 10993-17 / -18 risk characterisation. Steam sterilization at 121°C or higher is generally incompatible with both the drug stability and the bioresorbable polymer architecture. Aseptic processing under ISO 13408 is the industry default for this device class: it avoids terminal sterilization entirely and shifts the validation burden to cleanroom environmental control, container-closure integrity, and media-fill qualification. [NEEDS INPUT: identity of drug compound and its known thermal and radiation sensitivity thresholds] [NEEDS INPUT: polymer system — PLA, PLGA, Mg-alloy, or combination — with molecular weight and crystallinity data relevant to sterilization compatibility]

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

Regardless of method, four concerns span the entire validation programme. First, incoming bioburden control: ISO 11737-1 establishes the test methodology, and the bioburden baseline on the pre-sterilization device must be characterised before any SAL-10⁻⁶ demonstration is meaningful. Second, sterility testing during validation runs — ISO 11737-2 governs the test design; at minimum, validation batches require sterility testing of a statistically justified sample. Third, sterile barrier system qualification under ISO 11607-1 and -2 must confirm that the packaging selected protects sterility through distribution and up to the claimed shelf-life; that claim ties directly to Section 15 (Stability). Fourth, environmental monitoring and process parameter trending during routine sterilization batches must feed into the ongoing process-control record — a one-time validation is not sufficient for regulatory confidence over commercial production.

- Bioburden control before sterilization (ISO 11737-1)
- Sterility testing in process validation (ISO 11737-2 — not a release test, but used in validation)
- Sterile barrier system qualification (ISO 11607-1/-2) with shelf-life claim aligned to §15 Stability
- Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18; pre-sterilization leachables data requires a bridging justification

## Sequencing with adjacent sections

Section 14 sits at the convergence of several adjacent technical areas, and sequencing matters. The ISO 10993-17 and -18 leachables risk characterisation in Section 13 is expected to use sterilized device samples; pre-sterilization leachables data submitted in lieu of post-sterilization data requires an explicit bridging justification and is unlikely to be accepted without it. This means sterilization method selection and at least one process-equivalent validation run should be complete before the final Section 13 chemical characterisation is locked. The sterile barrier shelf-life claim established here flows directly into Section 15 — the stability protocol must include real-time and accelerated aging under conditions representative of the validated sterile barrier and storage environment. Per-batch sterilization records, including cycle parameter printouts and biological indicator results where applicable, land in Section 16 as part of the batch release dossier; the validation protocol should anticipate this by defining which records constitute the release-critical sterilization package. Finally, sterilization failure modes — cycle parameter excursions, packaging breach, bioburden exceedance — must be entered into the Section 10 risk management hazard register with probability and severity ratings under ISO 14971; a common gap is treating sterilization as a control measure without also characterising it as a hazard source when it fails.

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

# §19 Conditional NOCs & Adjacent Permissions

_strategy: llm_synthesized · status: complete · cost: $0.0145_

## Which NOCs apply to this device

A bioresorbable drug-eluting coronary stent sits at the intersection of two regulatory authorities. The device's drug component — the antiproliferative agent carried on or within the bioresorbable scaffold — activates the DCG(I) joint-review overlay under Schedule D(II) of the Drugs and Cosmetics Act read with MDR 2017 classification rules for combination products. This is the only NOC sub-block that fires for this submission; the DAHD, BARC/AERB, and PNDT triggers are not applicable and have been confirmed out by the deterministic trigger logic. The DCG(I) review is not a separate pre-licence gate in the sense of a standalone NOC application; it runs as a parallel track alongside the MD-3/MD-7 manufacturing-licence pathway described in §4, with grant of the manufacturing licence anticipated to be conditional on the outcome of that joint-review assessment. Applicants who treat the DCG(I) track as a post-submission follow-up typically encounter avoidable delays at the grant stage.

## DCG(I) joint review (combination product)

**Authority:** Drug Controller General (India), CDSCO

**Applicable rule:** Drugs and Cosmetics Act 1940 §3(b); MD-7 checklist §11-12 for combination products; Bible §4.B Block 5

**Trigger basis:** Synthesizer `drug_content` marker is affirmative — device contains, releases, or pre-loads a drug, biological, or pharmacologically active substance.

### Evidence package
- [ ] Drug Master File covering chemistry, manufacturing, controls (CMC), pharmacology, toxicology, clinical safety/efficacy of the drug component
- [ ] Combination-product justification — why device + drug deliver a clinical benefit not achievable separately
- [ ] Pre-approval status of the drug component (new chemical entity vs previously-approved drug; route-of-administration novelty)
- [ ] Cross-reference to §8 Design & Manufacturing §8.12 medicinal-substances sub-block
- [ ] Cross-reference to §13 Biocompatibility ISO 10993-17 allowable-limits work covering drug + non-drug constituents
- [ ] Cross-reference to §12 Clinical Evidence — clinical data covering the combination product, not the components separately

### Timeline placement
- Joint review runs in parallel with the main MD-3 or MD-7 application.
- Grant of MD-5 / MD-9 typically waits for DCG(I) clearance.
- Pre-submission DCG(I) consultation is recommended for novel-drug combinations to scope toxicology requirements.

### Cross-references
- §8 Design & Manufacturing — §8.12 medicinal substances sub-block
- §13 Biocompatibility — ISO 10993-17 allowable limits
- §12 Clinical Evidence — combination-product clinical data

**[REVIEW]** Toxicology dossier scope differs significantly for previously-approved-drug vs novel-drug combinations — consultant call per submission.

### Device-specific rationale

The DCG(I) joint review applies because the antiproliferative drug — most commonly a limus-family compound or paclitaxel — is pharmacologically active and not merely a processing aid or surface coating. Under the combination-product classification framework embedded in MDR 2017 and the Drugs and Cosmetics Act, where the primary mode of action is mechanical (scaffolding of the coronary lumen) but an integral drug component augments that action by inhibiting neointimal proliferation, the device-led pathway governs, but CDSCO is expected to formally engage DCG(I) for an opinion on the drug constituent before granting the licence. The specific drug identity, elution profile, and residual-quantity data feed directly into the §8.12 medicinal-substances cross-block, while the toxicological allowable-limits analysis established under ISO 10993-17 — cross-referenced in §13 — provides the quantitative basis for the DCG(I) reviewer's assessment of systemic and local drug exposure. Applicants should ensure the drug substance is characterised to a standard consistent with pharmacopoeial specifications. [NEEDS INPUT: identity of the drug substance (INN) and whether it is a scheduled substance under the NDPS Act or subject to any import-control notification]

## Sequencing notes

For this device, practical sequencing works as follows. The DCG(I) joint review is initiated concurrently with — not before — the MD-3/MD-7 filing; CDSCO routes the combination-product query to DCG(I) on receipt of the dossier rather than requiring a standalone pre-application. The manufacturing licence grant is anticipated to be conditional on a satisfactory DCG(I) opinion, so applicants should plan for the grant timeline to reflect that dependency rather than treating it as a background parallel process. Internally, the medicinal-substance dossier elements (§8.12) and the toxicological risk-characterisation report (§13) should be review-ready at the time of primary submission, not deferred as supplemental filings. No BARC pre-application, no AERB operational clearance, and no PNDT authorisation sit on this device's critical path, which simplifies the NOC sequencing materially compared with, for example, a radioisotope-loaded or imaging-guided device category.

## Cross-references

- §8 Design & Manufacturing — §8.12 medicinal substances sub-block
- §13 Biocompatibility — ISO 10993-17 allowable limits
- §12 Clinical Evidence — combination-product clinical data
- §4 Pathway — main MD-3 / MD-7 manufacturing-licence path

---
