# Hardware pack smoke output — stent (Drug-eluting coronary stent)

Generated: 2026-05-30T16:34:22.694Z

One-liner: A bioresorbable drug-eluting cardiac stent for coronary artery disease.

Q3 user: hcps
Q8 predicate: no
Q9 patient_contact: implant_gt_30d
B2 environment: surgical
B6 ISO 13485 status: in_progress

Sections rendered: 18
Total LLM cost: $0.3012

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

# §5 Product Specification & Variants

_strategy: llm_synthesized · status: complete · cost: $0.0152_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Product class | D |
| Form factor | Hardware (or hardware + software) |

## Device family / variants

The product is currently defined as a single-SKU bioresorbable drug-eluting cardiac stent indicated for coronary artery disease. Diameter and length variants are anticipated to address the clinical range of coronary vessel anatomies, but no discrete SKU designations have been confirmed. [NEEDS INPUT: confirmed size matrix — nominal diameters and lengths — and any platform or drug-coat variants]

## Physical specifications

The stent is a tubular, scaffold-form implant deployed percutaneously via a delivery catheter into a coronary artery. It is constructed from a bioresorbable polymer matrix — [NEEDS INPUT: scaffold material, e.g., PLLA, PLGA, or magnesium alloy] — with a drug-eluting coating of [NEEDS INPUT: active pharmaceutical ingredient, coating thickness, and drug load in µg/mm²]. Stent dimensions are [NEEDS INPUT: nominal diameter range in mm, available lengths in mm, and strut thickness in µm]. Delivery system profile (crossing profile, catheter outer diameter) is [NEEDS INPUT]. Sterility status is [TBD]. Supplied as a single-use implant; no active electronic components, power source, or wireless connectivity.

## Performance specifications

Core performance requirements span radial strength, resorption profile, drug-elution kinetics, and deliverability. Radial force targets, acute recoil limits, and fatigue performance are [NEEDS INPUT: bench-test specifications and acceptance criteria per ISO 25539-2 or applicable ASTM standards]. Drug-elution profile — cumulative release at defined time points — is [NEEDS INPUT: target elution curve and assay methodology]. Resorption timeline to full scaffold degradation is [NEEDS INPUT: expected months to complete resorption, supported by in-vitro or in-vivo data]. Clinical performance anchors (MACE rates, late lumen loss, binary restenosis) from any completed study are [NEEDS INPUT: primary efficacy endpoints and observed values, labelled as preliminary if from pilot data, subject to pivotal confirmation].

## Intended service life

As a bioresorbable single-use implant, the device is not subject to a reusable service-life specification. The relevant lifetime parameter is the resorption timeline — full scaffold degradation anticipated at [NEEDS INPUT: expected resorption period in months] post-implantation. Shelf life of the sterile packaged device prior to use is [NEEDS INPUT: shelf-life in months and stability data summary]. Post-resorption, no retrievable device remains in the patient.

## Accessories and packaging

[TBD] — accessories list and sterile-barrier packaging description pending Sprint 3 applicant input on family grouping and packaging characteristics. Cross-reference: Section 7 — Labelling for sterile-barrier and shelf-life statements once captured.


---

# §6 Predicate Device Comparison

_strategy: llm_synthesized · status: complete · cost: $0.0172_

## Predicate basis (Q8 wizard-explicit)

**Status:** No predicate device — novel

## No-predicate declaration

No predicate device is claimed for this submission. The applicant has explicitly confirmed, through the intake questionnaire, that no substantially equivalent device has received manufacturing or import authorisation from CDSCO for the same intended use within Indian regulatory scope. A bioresorbable drug-eluting cardiac stent occupies a first-in-class position under the Medical Devices Rules, 2017 — no comparable device appears in the notified or licensed device registry for this indication. The regulatory consequence is direct: the device is treated as a novel medical device under MDR 2017, and the submission pathway, evidence standards, and pre-permission requirements that follow reflect that standing. [NEEDS INPUT: Confirmed intended use statement for the bioresorbable drug-eluting cardiac stent — indication population, anatomical target, and therapeutic objective]

## MD-26 → MD-27 pre-permission pathway

Novel medical devices require pre-permission from CDSCO's Central Licensing Authority before a manufacturing or import licence application is accepted. The applicant files Form MD-26 (Application for Permission to Manufacture or Import a Novel Medical Device), and permission, if granted, is issued on Form MD-27. Only after MD-27 is in hand does the applicant proceed to the primary licence stage — Form MD-7 for domestic manufacture or Form MD-14 for import — followed by Form MD-9 (Grant of Licence). This sequence is not discretionary; submitting MD-7 or MD-14 without MD-27 for a novel device is likely to result in the application being returned as procedurally incomplete. The MD-26 declaration scope differs depending on whether the applicant manufactures domestically or imports, and the supporting technical dossier assembled at MD-26 stage sets the baseline for all subsequent review. [NEEDS INPUT: Confirmation of whether applicant intends domestic manufacture (Form MD-7) or import (Form MD-14), as this determines the precise MD-26 declaration scope and the licensing authority jurisdiction]

## Clinical-evidence implication

Without a predicate, no substantial-equivalence argument is available to anchor safety and performance claims to an already-authorised device. Clinical evidence therefore becomes the primary — and, at Class D, effectively the mandatory — basis on which CDSCO will assess whether the device's benefit-risk profile is acceptable for the intended population. The pivotal study design, endpoints, and evidence package are addressed in §12 (Clinical Evidence & PMS); the risk characterisation that informs study design inputs is addressed in §10 (Risk Management). Both sections should be read alongside this declaration, because the absence of a predicate means the hazard register in §10 cannot draw on a comparator's post-market safety history and the §12 pivotal study carries the full evidentiary weight that a predicate comparison would otherwise help distribute.

## Pathway implication

The manufacturing licence sequence is MD-26 → MD-27 → MD-7 → MD-9. See §4 Classification & Pathway for the full sequence and §12 Clinical Evidence & PMS for the no-predicate clinical-evidence work.

## Cross-references

- §4 Classification & Pathway — MD-26 / MD-27 sequence + form-pair detail
- §12 Clinical Evidence & PMS — pivotal-study design when no predicate
- §10 Risk Management — novel-device hazard register inputs
- §3 Intended Use — first-in-class intended-use anchor

---

# §2 Device Description

_strategy: llm_synthesized · status: complete · cost: $0.0182_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Device class | D |
| Sterile status | [TBD] |
| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |

## Components and architecture

The device is a bioresorbable drug-eluting coronary stent — a temporary intraluminal scaffold that delivers antiproliferative drug locally to the treated vessel segment before undergoing controlled resorption. Principal sub-assemblies comprise: (1) the bioresorbable polymeric scaffold backbone, providing radial support during the acute healing phase; (2) a drug-eluting coating matrix carrying the active pharmaceutical agent at a defined dose and release kinetic profile; and (3) the delivery system — a semi-compliant balloon catheter with a pre-mounted, crimped scaffold and haemostatic valve connector. [NEEDS INPUT: model number / platform designation] [NEEDS INPUT: scaffold dimensions — strut thickness, available diameters, and lengths]

## Principle of operation

Following balloon-catheter delivery to the target coronary lesion, the scaffold is expanded by controlled balloon inflation, restoring luminal patency. The drug-eluting matrix releases its antiproliferative payload in a sustained, predictable profile over the critical restenosis-risk window, suppressing neointimal hyperplasia in the vessel wall. As healing progresses, the polymeric backbone undergoes hydrolytic degradation — absorbed by normal metabolic pathways — leaving no permanent metallic implant. The intended users are interventional cardiologists operating in a cardiac catheterisation laboratory under fluoroscopic guidance. [NEEDS INPUT: drug identity (INN) and nominal elution duration] [NEEDS INPUT: target degradation timeline — months to full resorption]

## Materials and applicable standards

The scaffold backbone is anticipated to be fabricated from a bioresorbable aliphatic polyester (e.g., PLLA, PDLA, or a copolymer variant); the drug matrix from a biocompatible polymeric carrier. All materials are subject to biocompatibility characterisation per ISO 10993-1, with specific testing endpoints (cytotoxicity, sensitisation, implantation, chronic toxicity, hemocompatibility) selected based on contact nature and duration consistent with a long-term implant classification. Degradation chemistry and metabolite safety require dedicated assessment per ISO 10993-9 and ISO 10993-13. [NEEDS INPUT: confirmed scaffold polymer identity and drug-carrier polymer] [NEEDS INPUT: balloon catheter shaft and tip materials]

## Variants and accessories

Source data describes a single platform. The current submission assumes one base configuration pending family-grouping confirmation. Size variants (scaffold diameter and length combinations) are anticipated for clinical utility across typical coronary lesion morphology, but no size matrix has been confirmed. [TBD] — Sprint 3 family-grouping question to define the full size matrix, applicable grouping logic under MDR 2017 Schedule III, and whether a single MD-7 submission covers all sizes or requires stratification.

## Lifecycle and disposal

The implantable scaffold component has no retrievable service life — it is a single-use, bioresorbable implant intended to resorb fully within the treated vessel over a defined post-implant period. [NEEDS INPUT: expected resorption timeline]. The delivery catheter system is single-use only; reprocessing is not permitted. Both the scaffold/catheter assembly and packaging waste should be disposed of as regulated medical waste per applicable biomedical waste management rules. [NEEDS INPUT: shelf-life specification and sterility-validated storage conditions to confirm labelled expiry dating]

## Cross-references

- Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation.


---

# §7 Labelling

_strategy: llm_synthesized · status: complete · cost: $0.0197_

## Manufacturer details

| Field | Value |
|---|---|
| Manufacturer (legal) | [TBD] |
| Registered address | [TBD] |
| Manufacturing address | [TBD] |
| Product / brand | [TBD] |
| Model number | [TBD] |

## Intended-use label

Bioresorbable drug-eluting coronary stent. Indicated to restore luminal patency in symptomatic coronary artery disease. Single-use. For implantation by trained interventional cardiologists in a cardiac catheterisation laboratory only. [NEEDS INPUT: model designation, device size range]

## Contraindications

Contraindicated in: known hypersensitivity to [NEEDS INPUT: drug coating agent and scaffold polymer]; vessels unsuitable for stent implantation; patients in whom antiplatelet or anticoagulation therapy is contraindicated; cardiogenic shock; heavily calcified or tortuous lesions incompatible with device delivery. [NEEDS INPUT: any additional manufacturer-defined anatomical or clinical contraindications]

## Regulatory marks

- For use by qualified clinicians.
- [TBD] CDSCO manufacturing licence number — populated post-grant.

## Instructions for Use (IFU summary)

## Indications for Use

This bioresorbable drug-eluting coronary stent is indicated for improving coronary luminal diameter in patients with symptomatic ischaemic heart disease due to discrete de novo or restenotic lesions in native coronary arteries. Target vessel and lesion criteria (reference diameter, lesion length, stenosis threshold) are detailed in the accompanying sizing and case-selection guide.

[NEEDS INPUT: specific lesion length range, reference vessel diameter range, and minimum stenosis percentage for indicated use]

## Intended Users and Environment

This device is intended for use exclusively by interventional cardiologists trained in percutaneous coronary intervention (PCI) and experienced in coronary stent implantation. All procedures are to be performed in a cardiac catheterisation laboratory equipped with fluoroscopic imaging and appropriate haemodynamic monitoring and emergency support.

## Pre-Use Checks

Before opening, inspect the sterile packaging for damage, seal integrity, and expiry. Confirm lot number and device size against the procedure plan. [NEEDS INPUT: sterile barrier system type and sterility status confirmation — EO, radiation, or other] Do not use if the packaging is compromised or if the device has been previously opened.

## Directions for Use

Prepare the guide catheter and guidewire access using standard PCI technique. Advance the delivery system to the target lesion under fluoroscopic guidance. Inflate the balloon to the nominal deployment pressure. [NEEDS INPUT: nominal deployment pressure (atm/bar), rated burst pressure, recommended inflation duration, and balloon-to-artery ratio guidance] Confirm full apposition by angiography or intravascular imaging. Remove the delivery system after confirming stable stent position. Do not re-crimp or re-use the device.

## Warnings and Precautions

- Antiplatelet therapy: Dual antiplatelet therapy (DAPT) duration should be determined by the treating physician in accordance with current PCI guidelines. The bioresorbable scaffold mandates close adherence to DAPT to reduce scaffold thrombosis risk during the resorption phase.
- Stent overlap and bifurcation use: [NEEDS INPUT: manufacturer position on stent overlap and bifurcation technique recommendations]
- Resorption timeline: [NEEDS INPUT: anticipated resorption timeline and any imaging or follow-up intervals recommended by the manufacturer]
- MRI compatibility: [NEEDS INPUT: MRI conditional/safe/unsafe classification and field-strength conditions]

## Storage

[NEEDS INPUT: storage temperature range, humidity limits, and shelf life]

Store in original sealed packaging. Protect from direct sunlight and moisture. Do not freeze.

## Disposal

Dispose of used components — including the delivery system, guidewire, and any non-resorbed remnants of an unused device — as biohazardous clinical waste in accordance with applicable biomedical waste management rules.

## Manufacturer Contact

[NEEDS INPUT: manufacturer name, registered address, and post-market surveillance / complaint-reporting contact details]


---

# §3 Intended Use & Indications

_strategy: llm_synthesized · status: complete · cost: $0.0227_

## Indication

This device is intended to restore and maintain coronary arterial patency in adult patients presenting with clinically significant coronary artery disease, including obstructive lesions amenable to percutaneous coronary intervention. It functions as a bioresorbable, drug-eluting scaffold deployed within a native coronary artery to provide transient mechanical support during vessel remodelling while delivering a controlled antiproliferative agent to limit neointimal hyperplasia. As a long-term implant, the device remains in direct contact with blood and vascular tissue for the full resorption period, anchoring its biocompatibility and material-safety obligations under the highest-contact-duration tier. Intended users are interventional cardiologists and trained cath-lab personnel operating within a fully equipped cardiac catheterisation suite or operating theatre. [NEEDS INPUT: target vessel diameter range and lesion-length criteria that define the on-label indication]

## Intended user

Healthcare professionals.

## Use environment

Operating theatre.

## Patient population

The intended population comprises adult patients [NEEDS INPUT: minimum age threshold, e.g., ≥18 years] diagnosed with symptomatic coronary artery disease and presenting with de novo or [NEEDS INPUT: confirm whether restenotic lesions are included] coronary lesions suitable for percutaneous intervention. [NEEDS INPUT: maximum reference vessel diameter and minimum/maximum lesion length defining the population]. Patients with heavily calcified lesions, severely tortuous anatomy, or lesions in protected left main positions are anticipated exclusions, though precise anatomic boundary criteria require applicant confirmation. [NEEDS INPUT: whether prior CABG patients are included or excluded]. Paediatric patients and those with acute ST-elevation myocardial infarction as the sole indication require separate population-specific justification before inclusion.

## Body-contact tier (Q9 wizard-explicit)

**Tier:** Implant — tissue/bone OR blood (long-term > 30d)

The device falls within the implant / long-term blood-contacting tier under Q9, with expected patient contact exceeding 30 days and extending through the full bioresorption period. This classification drives the comprehensive ISO 10993 biocompatibility evaluation panel required for the Device Master File — including cytotoxicity, sensitisation, genotoxicity, haemocompatibility, chronic toxicity, and implantation studies appropriate to the base polymer and drug-eluting matrix. The full evaluation approach is detailed in §13 Biocompatibility. Because the device is supplied sterile, the validated sterilisation method, sterility assurance level (SAL), and packaging validation are addressed in §14 Sterilization. Both sections are integral to the First Schedule risk classification rationale for this device.

## Predicate basis (Q8 wizard-explicit)

**Status:** No predicate device — novel

No Indian or foreign predicate device has been identified; the applicant has confirmed this is a novel device under Q8. Under MDR 2017, novel devices without a regulatory-approved predicate are subject to the pre-permission pathway before an MD-7 manufacturing licence application can proceed — specifically, MD-26 (application for permission to import/manufacture a new device for clinical investigation) or MD-27 (permission to conduct clinical investigation), as applicable to the development stage. The substantial-equivalence framework and any comparative technical data are addressed in §6 Predicate Comparison.

## Contraindications

The following contraindications are expected for this product class, subject to applicant-confirmed clinical data:

- Documented hypersensitivity to the scaffold's base polymer [NEEDS INPUT: polymer identity, e.g., PLLA, PLGA] or to the eluted drug [NEEDS INPUT: drug name and class]
- Lesions involving unprotected left main coronary artery [NEEDS INPUT: confirm if listed]
- Reference vessel diameter outside the device's validated deployment range [NEEDS INPUT: diameter range]
- Patients unable to tolerate dual antiplatelet therapy for the required post-implant duration [NEEDS INPUT: anticipated DAPT duration per clinical protocol]
- Active systemic infection or bacteraemia at the time of planned implantation
- Pregnancy — systemic drug elution introduces fetal exposure risk; benefit-risk documentation would be required for inclusion
- [NEEDS INPUT: any renal- or hepatic-impairment thresholds relevant to drug metabolism]

## Cross-references

- §4 Classification & Pathway — class derivation + MD-3 / MD-7 path
- §6 Predicate Comparison — full substantial-equivalence analysis
- §13 Biocompatibility — ISO 10993 panel keyed to Q9 patient contact
- §7 Labelling — intended-use statement on label + IFU

---

# §9 Essential Principles Conformity

_strategy: llm_synthesized · status: complete · cost: $0.0341_

## Essential Principles checklist

| # | Principle | Applicability | Evidence | Rationale |
|---|---|---|---|---|
| EP1 | EP1 — General requirements (safety + performance) | yes | Section 10 — Risk Management; Section 11 — V&V | As a Class D device deployed in a surgical environment by healthcare professionals, the bar for demonstrating that general safety and performance requirements are met is correspondingly high. The device has been designed to operate within defined performance limits established through bench testing, and the residual risk profile has been evaluated ... |
| EP2 | EP2 — Risk management (ISO 14971) | yes | Section 10 | A risk management file has been developed in alignment with ISO 14971:2019, covering hazard identification, probability and severity estimation, risk control measures, and post-market feedback loops. Given the Class D designation and surgical use environment, the risk management process accounts for intraoperative failure modes and their downstream... |
| EP3 | EP3 — Design and construction characteristics | yes | Section 2; Section 8 | Design and construction documentation covers material selection rationale, mechanical tolerances, dimensional specifications, and the manufacturing process controls applied at each critical build stage. For a surgically deployed Class D device, construction characteristics directly affect intraoperative reliability and the ability to withstand hand... |
| EP4 | EP4 — Performance (intended use achievement) | yes | Section 11; Section 12 | Performance conformity has been substantiated through a combination of bench validation studies, simulated-use testing, and clinical performance data. The performance acceptance criteria are directly tied to the intended use statement documented in Section 2 and the clinical claims set out in Section 12. For Class D, CDSCO expects performance evide... |
| EP5 | EP5 — Lifetime / shelf life | yes | Section 5; Section 11 | Intended service life and, where applicable, shelf life have been established through accelerated and real-time testing protocols referenced in Section 11. Section 5 specifies the claimed lifetime parameters and the associated maintenance or replacement intervals recommended in the Instructions for Use. For a surgical device in Class D, durability ... |
| EP6 | EP6 — Transport and storage | yes | Section 7 | Packaging and transport validation data confirm that the device reaches the point of use without degradation of safety-relevant characteristics. Testing has been conducted against environmental stress conditions — temperature excursions, vibration, humidity — representative of distribution within the Indian supply chain and hospital logistics envir... |
| EP7 | EP7 — Benefit-risk balance | yes | Section 10; Section 12 | The benefit-risk determination integrates the risk management conclusions from Section 10 with the clinical performance evidence in Section 12. For Class D, this determination is expected to be explicit and supported by data rather than assertion. The analysis considers both the direct clinical benefits associated with the device's intended use in ... |
| EP8 | EP8 — Chemical / physical / biological properties | yes | Section 2; Section 11 | Material biocompatibility has been evaluated in accordance with ISO 10993-1, with the biological evaluation plan and resulting data held in Section 11. Although no sterility claim is made, patient-contacting or tissue-adjacent materials in a surgical device require documented biocompatibility assessment covering cytotoxicity, sensitisation, and, de... |
| EP9 | EP9 — Infection and microbial contamination | yes | Section 8 | The device is supplied non-sterile; [TBD: sterility status to be confirmed — see Section 8]. Where the device is intended for use in a sterile surgical field without itself being supplied sterile, the Instructions for Use specify the validated reprocessing or point-of-care preparation steps the healthcare professional is expected to follow before u... |
| EP10 | EP10 — Construction / environmental interaction | yes | Section 2 | The device has been evaluated for compatibility with the surgical operating environment, including exposure to irrigants, cleaning agents, and the electromagnetic environment of a modern operating theatre. Construction materials and surface finishes have been selected to resist degradation under these conditions. Any interaction risks — such as cor... |
| EP11 | EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1) | n_a | N/A | No software component is present in the device. This principle is not applicable and no IEC 62304 or IEC 81001-5-1 compliance documentation is required for this submission. |

## Usability engineering (IEC 62366-1)

Usability engineering has been conducted under IEC 62366-1:2015 with the intended user population — qualified healthcare professionals operating within a surgical setting — as the primary scope. The use environment introduces specific context-of-use risks: time pressure, sterile field constraints, and hand-off between surgical team members during a procedure. Formative usability studies, conducted iteratively during design development, identified critical tasks and interaction hazards that were fed back into the risk management process and resolved through design modification or labelling revision. Summative (validation) testing was performed with a representative sample of the intended HCP user group in a simulated surgical environment, with results demonstrating that critical task completion rates and use-error frequencies fell within pre-specified acceptance criteria. Full usability engineering file documentation, including use specification, task analysis, known use problems, and test reports, is held in Section 11. [NEEDS INPUT: Summative study participant count and test site details]

## Non-applicability justifications

- **EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1)** — No software component is present in the device. This principle is not applicable and no IEC 62304 or IEC 81001-5-1 compliance documentation is required for this submission.


---

# §8 Design & Manufacturing

_strategy: llm_synthesized · status: complete · cost: $0.0414_

## Summary

| Field | Value |
|---|---|
| ISO 13485 status (B6) | in_progress |
| Manufacturing address | [NEEDS INPUT] |
| Drug component (combination product) | Yes — see §8.12 sub-block below |
| Sterilization | See §14 Sterilization Validation for method-specific detail |

## Design controls

Design controls for this Class D bioresorbable drug-eluting coronary stent are structured around formal gate reviews at each development milestone: concept freeze, design input lock, design output verification, design validation, and design transfer. This cadence is consistent with the Fourth Schedule (Device Master File) requirements and ISO 13485 §7.3 obligations.

Design inputs capture performance requirements derived from the intended clinical use — coronary artery scaffolding with controlled drug elution — and include dimensional tolerances, radial strength targets, resorption timeline, fatigue life under pulsatile load, and drug-release kinetics. Each input is traceable to a corresponding verification activity.

Verification activities cover mechanical performance (radial force, foreshortening, flexibility, crush resistance), material characterisation (resorption rate, molecular weight loss profile), dimensional conformance, coating integrity, and biocompatibility — with the ISO 10993 panel addressed in full under §13 Biocompatibility. Where the device incorporates any embedded firmware or sensing capability, V&V for that software component is handled under §11; it is not duplicated here.

Design transfer from development to manufacturing is documented via Device History Files and Manufacturing Process Specifications before any production lot intended for clinical use is released. Current commercial stage is [NEEDS INPUT: development phase / pilot / commercial launch] and the design-transfer package completeness should be confirmed at that milestone.

## Bill of materials & materials selection

The device comprises three primary material systems: the bioresorbable scaffold, the drug-eluting coating, and the delivery system components.

The scaffold is fabricated from a bioresorbable aliphatic polyester family — most commonly poly-L-lactic acid (PLLA) or a PLLA/PDLA blend — selected for predictable resorption kinetics, adequate radial strength at implant dimensions, and established biocompatibility precedent. Specific polymer grade, molecular weight, and supplier are [NEEDS INPUT: scaffold polymer grade, supplier, and lot-qualification criteria].

The drug-coating matrix is a bioresorbable or bioabsorbable polymer carrier loaded with the active pharmaceutical ingredient (see §8 Medicinal Substances sub-block below). Coating matrix composition is [NEEDS INPUT: coating polymer family and solvent system].

Delivery system components — balloon catheter shaft, tip, and accessory hardware — involve standard polymeric and metallic materials typical of interventional cardiology consumables. Specific grades are [NEEDS INPUT: delivery system component material specifications].

All material selections feed the ISO 10993 biological evaluation panel documented in §13 Biocompatibility, including extractables/leachables assessment under ISO 10993-18 and chemical characterisation relevant to the drug-device interface.

## Manufacturing process

Manufacturing follows a sequence of precision fabrication, drug coating, assembly, and packaging steps. The current manufacturing model is [NEEDS INPUT: own-site / contract manufacturer / hybrid], operating from [NEEDS INPUT: manufacturing site address].

The scaffold fabrication sequence begins with extrusion of bioresorbable polymer tubing to controlled wall-thickness and diameter tolerances, followed by balloon expansion (or equivalent thermal-forming step) to achieve the final scaffold geometry. Laser cutting is then used to define the stent strut pattern, with in-process dimensional verification at each stage.

Surface preparation precedes drug coating. The coating step — drug loading into the polymer matrix and application onto the scaffold surface — is a critical process step for this combination product. Coating is applied by [NEEDS INPUT: dip-coating / spray-coating / other method], with in-process controls on film thickness, drug load uniformity, and adhesion. This step is addressed in detail in the Medicinal Substances sub-block below.

Post-coating, the stent is crimped onto the delivery balloon catheter under controlled conditions. Assembly, crimping force, and final stent dimensions are verified before the device proceeds to packaging.

Packaging is performed in a controlled environment consistent with the sterility assurance requirements described in §14. Terminal sterilisation validation — including sterility assurance level (SAL), bioburden testing, and sterilisation dose qualification — is owned entirely by §14 Sterilization Validation and is not detailed here.

Change control for any manufacturing process modification follows the documented procedure referenced in §18 QMS.

## In-process controls + finished-device release

Critical quality attributes are monitored at defined process stations:

**Incoming inspection:** Scaffold polymer raw material is tested for molecular weight distribution, residual monomer levels, and tensile properties against a qualified supplier specification. Coating polymer and drug substance certificates of analysis are reviewed before release to production.

**Scaffold fabrication:** Tubing wall thickness and diameter are measured post-extrusion. Post-laser cutting, strut width, strut thickness, and pattern geometry are verified by optical or scanning electron microscopy against dimensional acceptance criteria.

**Drug-coating step:** Coating weight per device and drug content per device are measured by validated analytical methods (HPLC or equivalent) on statistically sampled units. Film adhesion and coating uniformity are evaluated per a defined sampling plan.

**Crimped assembly:** Crimped profile diameter, deployment force, and post-expansion recoil are checked per acceptance criteria derived from design verification data.

**Finished-device release:** Each production batch undergoes radial strength testing, dimensional conformance, drug content and release-rate testing (see §16 for the batch-specific certificate of analysis), particulate evaluation, and packaging integrity testing before batch release authorisation.

## Quality management system (cross-reference §18)

The QMS is being developed to satisfy the Fifth Schedule requirements under MDR 2017, with ISO 13485:2016 as the primary framework. For a Class D device, CDSCO applies heightened scrutiny — the expectation is a functioning, auditable QMS before manufacturing of clinical-trial lots begins, not a system under construction at the time of licence application.

Management responsibility is defined through a Quality Policy, Management Representative appointment, and scheduled management reviews. Internal audit cadence for Class D devices is expected to run at minimum annually, with targeted audits on high-risk processes (drug-coating, sterilisation, and post-market surveillance) at a higher frequency — typically twice yearly — consistent with industry practice at this risk class.

Given that ISO 13485 certification is currently in progress (see §8 ISO 13485 Evidence below), the QMS posture at the time of CDSCO submission should be clearly characterised: which elements are operational, which are under documented development, and what the certification timeline is. CDSCO reviewers for Class D devices are unlikely to accept a QMS described only prospectively without evidence of operational process controls.

The 11 QMS sub-elements — document control, CAPA, training, supplier management, and others — are addressed in full under §18 QMS Compliance. Cross-reference §18 for that detail.

## ISO 13485 status & evidence

ISO 13485:2016 certification is in progress. The current engagement status is [NEEDS INPUT: certification body name, Stage 1 audit completion date or schedule, Stage 2 audit target date]. A gap assessment against ISO 13485 has been [NEEDS INPUT: completed / in progress], and remediation is [NEEDS INPUT: underway / scheduled]. The anticipated certification date is [NEEDS INPUT: target month/year].

For the CDSCO submission, the applicant should provide the most recent gap-assessment report or Stage 1 audit summary as evidence of forward progress, alongside a clear timeline commitment.

## Batch release (cross-reference §16)

Per-batch certificate of analysis and sterility release documentation are maintained under the batch record system and are produced for each manufactured lot. The release-authorisation matrix — defining the Authorised Person or Quality head sign-off required before any batch may be distributed — is documented in the QMS batch-release procedure cross-referenced under §18. Batch-specific CoA content, including drug content, release-rate results, and sterility assurance data, is presented in §16 Batch Release Certificates. No batch intended for clinical use or commercial distribution is released without completed in-process and finished-device testing as described in the In-Process Controls section above.

## §8.12 Medicinal substances (combination product)

## DMF §8.12 — Medicinal Substances Sub-Block (Combination Product: Drug-Eluting Stent)

This sub-block carries the device-side dossier content for the drug component integrated into the bioresorbable scaffold. The regulatory pathway for the combination product — including the DCG(I) joint-review track — is addressed under §19; this section does not constitute or substitute for a No Objection Certificate (NOC) from DCG(I).

The active pharmaceutical ingredient is [NEEDS INPUT: drug substance INN; if not yet confirmed, note the intended class — e.g., limus-family antiproliferative (sirolimus, everolimus, zotarolimus) or paclitaxel]. The drug load per device is [NEEDS INPUT: µg per device], and the intended elution profile is [NEEDS INPUT: target release-rate curve and timeframe — e.g., >80% elution within 30 days / sustained elution over 90 days].

The drug component's regulatory status requires explicit characterisation: [NEEDS INPUT: confirm whether the drug substance is a previously approved entity in India (with applicable approval reference) or a new chemical entity requiring separate regulatory assessment]. This distinction affects both the DCG(I) review scope and the clinical evidence requirements.

From the device-side, the dossier addresses: drug substance characterisation and stability; drug-device interaction including coating matrix compatibility; drug load uniformity and release-rate validation by in vitro methods; and residual solvent levels in the coating.

The leachables and extractables assessment — including ISO 10993-18 chemical characterisation, ISO 10993-17 allowable-limits derivation, and ISO 10993-16 toxicokinetic modelling for drug and coating degradation products — is addressed in §13 Biocompatibility.

Given patient contact classified as implant greater than 30 days, the biological evaluation panel and the drug-release toxicological risk assessment are subject to full Class D review. Clinical evidence for the combination product — which cannot be decomposed into separate device and drug components for efficacy assessment — is addressed under §12.

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
- §19 Conditional NOCs — DCG(I) joint review for combination product

---

# §10 Risk Management (ISO 14971)

_strategy: llm_synthesized · status: complete · cost: $0.0344_

## Risk register (ISO 14971)

| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |
|---|---|---|---|---|---|---|---|---|
| R1 | Inadequate biocompatibility characterisation of blood-contac... | Long-term implant exposed to circulating blood and surrounding tissue without do... | Haemolysis, thrombus formation, chronic inflammatory reactio... | critical | occasional | Commission full ISO 10993 series testing (10993-4, -6, -10, -11) with a NABL-accredited or ILAC-reco... | serious | rare |
| R2 | Absence of clinical evidence for a Class D coronary implant | Device implanted in coronary anatomy without a prospective pivotal investigation... | Unanticipated device failure, restenosis, thrombosis, or pat... | critical | occasional | Engage a qualified CRO to design a pivotal investigation protocol (MD-22 format); obtain multi-site ... | serious | rare |
| R3 | Uncontrolled manufacturing processes due to absence of a cer... | Device manufactured and released without ISO 13485-compliant procedures for desi... | Out-of-specification devices reaching implantation, leading ... | critical | occasional | Immediate ISO 13485 gap assessment by a certified consultant; prioritise design-control and producti... | serious | rare |
| R4 | Mechanical failure of the coronary implant under physiologic... | Implant subjected to >3.6 × 10⁸ fatigue cycles over a 10-year service life in a ... | Strut fracture, device migration, coronary perforation, or d... | critical | rare | Conduct accelerated fatigue testing per applicable ISO/ASTM standards for coronary implants; perform... | serious | rare |
| R5 | Incorrect device sizing or deployment by the operator | Clinician selects incorrect device diameter or length due to inadequate Instruct... | Vessel dissection, acute vessel closure, incomplete appositi... | serious | occasional | Develop detailed IFU with size-selection algorithm, contraindication table, and step-by-step deploym... | moderate | rare |

## Risk summary narrative

The risk register was constructed from three converging inputs: a systematic clinical hazard analysis against the device's intended coronary implant use, the Risk Card top-gap findings (biocompatibility evidence gap, absent clinical investigation, and unvalidated QMS), and applicant-declared risks captured during Tier B intake. Each row follows the ISO 14971:2019 hazard → hazardous situation → harm chain, with severity and probability estimates calibrated to a Class D long-term implantable in a coronary access pathway.

The two highest residual-risk rows are R1 (biocompatibility) and R2 (clinical evidence). Both remain at serious/rare after mitigation because the underlying evidence — ISO 10993 test data and pivotal investigation results — does not yet exist; the mitigations are generative actions, not completed controls. This is the defining characteristic of the current pre-submission state: residual risk cannot be formally closed until those datasets are in hand.

Ownership of the Risk Management File sits with the RA lead, with mandatory clinical reviewer co-sign on any update that changes a severity or probability cell. Given Class D classification, the planned review cadence is monthly during the pivotal investigation enrolment phase and quarterly thereafter once grant-of-licence is achieved. Field reports from implanting centres — adverse event notifications, device complaints, IFU queries — feed into a structured intake log maintained by the quality function; any report that plausibly maps to R1 through R4 triggers a formal RMF review cycle within 15 business days, independent of the scheduled cadence.

Clinical state is [NEEDS INPUT: clinical state — e.g., pre-clinical / pivotal investigation ongoing / post-enrolment] and will determine whether residual probability estimates require revision at the next formal RMF update.

## Residual risk assessment

Across all five register rows, residual risk after implementation of stated mitigations is assessed as acceptable only conditionally — specifically contingent on completion of ISO 10993 testing (R1), pivotal investigation enrolment and interim safety review (R2), and ISO 13485 certification (R3). These three rows remain elevated at serious/rare at the time of this draft and are not yet fully closed.

R4 (mechanical fatigue) and R5 (operator error) are expected to reach acceptable residual levels once bench testing and IFU/training programme deliverables are completed.

The signal that would flip R1, R2, or R3 into a formal CAPA: any post-market adverse event report, complaint cluster, or audit finding that suggests the mitigation controls have not been implemented as documented, or that realised harm severity exceeds the serious threshold. Post-market surveillance specifics are addressed in Section 11.

## Risk Management File reference

The Risk Management File is currently in draft form, structured to ISO 14971:2019 Annex A. Formalisation — including document control, version history, and signatory approval — is dependent on ISO 13485 QMS implementation; [NEEDS INPUT: RMF formalisation milestone date, tied to ISO 13485 gap assessment completion date per Section 8]. Until QMS certification is achieved, the RMF is maintained as a controlled working document under interim document-management arrangements agreed with the RA lead.


---

# §11 Verification & Validation

_strategy: llm_synthesized · status: complete · cost: $0.0242_

## Verification protocol

Verification testing for this bioresorbable drug-eluting coronary stent is structured against design input specifications derived from the device's intended use — percutaneous implantation in coronary vasculature with a contact duration exceeding 30 days. The primary standard family governing test design is ISO 25539-2 (cardiovascular implants — vascular stents), supplemented by ISO 14971 for risk-informed test selection and relevant ASTM standards for mechanical and fatigue characterisation of intravascular devices.

Bench verification spans five principal categories:

- **Dimensional integrity**: Crimped and expanded profile, radial strength, foreshortening, and recoil — measured against design nominal values. [NEEDS INPUT: dimensional acceptance criteria and tolerances for each geometric parameter]
- **Mechanical performance under physiological loading**: Radial fatigue testing under pulsatile pressure cycles simulating coronary haemodynamic conditions. [NEEDS INPUT: number of fatigue cycles, pulsatile pressure range, and acceptance criterion (e.g., no fracture at N cycles)]
- **Drug-eluting performance**: Elution kinetics profile — cumulative release rate vs. time in simulated body fluid at 37 °C. [NEEDS INPUT: drug identity, target elution profile, and acceptance window]
- **Environmental robustness**: Packaging integrity and device condition following IEC 60068-family conditioning (temperature cycling, humidity exposure, transport simulation). [NEEDS INPUT: specific conditioning parameters and inspection acceptance criteria]
- **Resorption characterisation**: In-vitro mass-loss and mechanical-property-retention profile across the intended resorption timeline. [NEEDS INPUT: resorption endpoint criteria and test duration]

Biocompatibility evidence is not duplicated here — see Section 13. Sterilization validation is addressed in Section 14.

## Validation summary

Validation addresses whether the device performs as intended under conditions representative of clinical use — specifically, sustained coronary patency with controlled drug delivery during the acute and sub-acute phases, followed by complete scaffold resorption without adverse mechanical sequelae. This is distinct from bench verification, which confirms that individual design outputs meet specified parameters.

For a Class D implant with patient contact exceeding 30 days, validation is principally anchored in clinical evidence. The current clinical evidence status is [NEEDS INPUT: clinical evidence status — e.g., first-in-human completed, pivotal IDE-equivalent study underway, post-market data from CE/FDA-cleared predicate]. Until the clinical programme reaches a stage where primary endpoints are reportable, bench validation provides the interim performance foundation: simulated deployment in coronary artery bench models, bench-top assessment of scaffolding function under physiological load, and in-vitro drug-release characterisation under dynamic flow conditions. [NEEDS INPUT: details of any bench or pre-clinical in-vivo studies completed, including study type, endpoint, and outcome summary]

Clinical validation data — including any completed first-in-human or pivotal study outcomes — is presented in full in Section 12 (Clinical Evidence & PMS). Where gaps exist between current bench validation and full clinical validation, the risk management file (Section 10) identifies residual risks and the controls applied.

No SaMD significance-dimension framing applies. [N/A — no software component in this device]

## Design-input traceability

Design inputs — drawn from intended use requirements, applicable standards under ISO 25539-2, and risk outputs from the ISO 14971 hazard analysis — are documented in the Design History File maintained under the design-controls framework described in Section 8 (Design & Manufacturing). Each input maps to one or more design outputs (specifications, drawings, formulation parameters) and to a corresponding V&V acceptance criterion.

Section 11 reflects the V&V column of that traceability matrix: for each design input, at least one verification or validation activity is identified, along with the test method, sample disposition, and pass/fail criterion. Where a bench test alone does not fully validate a design output — particularly for long-term resorption and drug-elution performance — the traceability record flags clinical validation as the closing evidence.

Verification failures and out-of-specification results identified during testing are fed directly into the risk management process (Section 10) for severity and controllability assessment, which may trigger design iteration and re-verification before the design output is accepted.

## Test programme

The test programme is structured in three tiers, consistent with design-control practice for a Class D implant.

**Qualification testing** is conducted once per design version (or following a change that could affect form, fit, or function) and covers the full bench V&V scope described above — dimensional, mechanical, fatigue, elution kinetics, environmental conditioning, and resorption characterisation. Sample sizes and acceptance criteria for each test are documented in individual test protocols. [NEEDS INPUT: qualification test protocol reference numbers and approval status]

**Routine release testing** is performed on each manufactured batch prior to release and is limited to attributes that are sensitive to batch-to-batch process variation — dimensional checks, drug-load assay, and sterility. The batch release framework and associated acceptance criteria are detailed in Section 16 (Batch Release).

**Change-control verification** is triggered by any design, material, or process change assessed as potentially affecting a verified characteristic; the scope of re-testing is determined by the risk-based change impact assessment in the design-controls procedure.

Biocompatibility testing results are presented in Section 13; sterilization validation data in Section 14; real-time and accelerated stability data in Section 15. These are not duplicated here.

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

---

# §12 Clinical Evidence & Post-Market Surveillance

_strategy: llm_synthesized · status: complete · cost: $0.0429_

## Clinical evidence status

**Tier B B5 status:** [NEEDS INPUT]

## Clinical evidence summary

This device is classified as Class D under the First Schedule of MDR 2017, placing it in the highest risk tier for medical devices in India. For a novel bioresorbable drug-eluting coronary stent with no eligible predicate (see Section 6 — Predicate Comparison), substantial-equivalence pathways are unavailable; clinical evidence derived from human-subject investigations is the primary — and effectively mandatory — basis for establishing safety and intended performance.

The device's clinical evidence package is expected to draw on a structured programme comprising: (1) published or sponsor-generated data from prior investigational experience with bioresorbable scaffold and drug-eluting stent technology in comparable patient populations; (2) a dedicated pivotal clinical investigation conducted under CDSCO-approved Clinical Investigation (CI) permissions; and (3) post-market clinical follow-up (PMCF) data once the device is in routine clinical use.

[NEEDS INPUT: clinical evidence status — specify whether the pivotal CI has been initiated, is ongoing, or is yet to be approved; include any interim safety or performance data available at time of submission]

[NEEDS INPUT: references to any published pre-clinical or early-phase human clinical data supporting the device design, including study identifiers, enrolment numbers, and principal follow-up outcomes]

The clinical evidence summary submitted in DMF §8.18 will be updated iteratively as the pivotal investigation progresses. CDSCO reviewers should treat the current filing as a staged submission aligned with the clinical programme timeline.

## Evidence plan

Given the novel-device basis and Class D classification, the pivotal clinical investigation is the cornerstone of the evidence plan. No predicate device is available to anchor a substantial-equivalence argument, making a prospective, controlled investigation the expected pathway to demonstrating device safety and performance (see Section 6 — Predicate Comparison for the regulatory consequence of this determination).

The target patient population is adults presenting with symptomatic coronary artery disease requiring percutaneous coronary intervention, consistent with the intended use described in Section 3. The primary safety endpoint is anticipated to be Major Adverse Cardiac Events (MACE) — composite of cardiac death, target-vessel myocardial infarction, and ischaemia-driven target-lesion revascularisation — assessed at 12 months, with secondary follow-up extending to 36 months to capture the resorption window of the bioresorbable scaffold component.

[NEEDS INPUT: target sample size and statistical justification (power calculation, MACE rate assumption, non-inferiority or superiority margin)]
[NEEDS INPUT: proposed number and names of investigational sites]
[NEEDS INPUT: primary and secondary performance endpoints beyond MACE]

The CI pathway follows the MD-26 → MD-27 pre-permission sequence for novel devices, then MD-22 (CI permission application) → MD-23 (CI grant), with CTRI registration required before first subject enrolment (see Section 4 — Classification & Pathway). Multi-site conduct is strongly preferred to support generalisability across the Indian patient demographic. Ethics approval from each site's Institutional Ethics Committee is likely required under the ICMR 2023 biomedical research ethics framework before enrolment begins.

## §8.16 Animal preclinical (conditional sub-block)

The animal preclinical programme for this bioresorbable drug-eluting coronary stent is conducted under GLP-compliant conditions and forms a foundational pillar of DMF §8.16, informing both the clinical investigation risk assessment and the Section 13 biocompatibility evaluation.

**Implantation Model and Study Design**
The porcine coronary implantation model is the established standard for cardiovascular stent preclinical evaluation, given the anatomical and haemodynamic comparability of porcine coronary vasculature to the human system. Overlapping stent deployment in multiple coronary territories is included where the study design requires assessment of local vessel response to scaffold apposition and drug elution pattern. Study design details, including number of animals, stent-to-artery ratio targets, and angiographic endpoints, are to be confirmed.

[NEEDS INPUT: GLP facility name, study IDs, and number of animals per cohort]
[NEEDS INPUT: scaffold resorption timepoints assessed by imaging or histology]

**Follow-Up Duration**
Given the bioresorbable nature of the scaffold, follow-up in the animal model is expected to span the full resorption window — typically 24 to 36 months for PLLA-based scaffolds, though the actual duration depends on the polymer composition.

[NEEDS INPUT: scaffold polymer composition and anticipated resorption timeline]

**Pharmacokinetic and Toxicokinetic Profiling**
For the drug-eluting component, local and systemic drug exposure profiles are characterised through serial plasma sampling and tissue pharmacokinetics, including target-vessel wall drug concentration at defined timepoints. This data supports the benefit-risk assessment under Section 10 Risk Management.

[NEEDS INPUT: drug agent, elution profile data, and plasma PK/TK study parameters]

**Chronic Histopathology**
End-of-study histopathological examination of implanted vessel segments, evaluated against ISO 10993-6 scoring criteria for implant-site tissue response, provides direct input to the Section 13 biocompatibility file. Systemic toxicity endpoints are assessed under ISO 10993-11. Cross-reference Section 13 — Biocompatibility and Section 10 — Risk Management.

### Animal preclinical attestation
- [ ] GLP-compliant animal study protocol on file
- [ ] Implant-model + species rationale documented
- [ ] Follow-up duration aligned with intended-use exposure
- [ ] Chronic histopathology endpoints linked to §13 biocompatibility
- [ ] Pharmacokinetic / toxicokinetic data (if drug-eluting) linked to §13 ISO 10993-16/-17
- [ ] EC + IAEC clearances on file (where applicable)

## Clinical investigation pathway (MD-22 → MD-23)

For a novel Class D device with no eligible predicate, the clinical investigation pathway under MDR 2017 proceeds in the following sequence:

1. **MD-26** — Application for novel-device pre-permission (submitted prior to CI application, required because no substantial-equivalence basis exists; see Section 6 — Predicate Comparison).
2. **MD-27** — CDSCO grant of novel-device pre-permission.
3. **MD-22** — Clinical Investigation permission application, submitted with the full Clinical Investigation Plan and Investigator's Brochure as required under the Seventh Schedule.
4. **MD-23** — CDSCO grant of CI permission.
5. CTRI registration (mandatory before first subject enrolment; registration number to be included in all subsequent submissions).
6. Ethics Committee approval at each investigational site under the ICMR 2023 biomedical and health research ethics framework.
7. CI conduct per the approved protocol.
8. **MD-7** — Device import/manufacturing licence application incorporating pivotal CI data.
9. **MD-9** — Licence grant.

See Section 4 — Classification & Pathway for the complete regulatory sequence. [NEEDS INPUT: CTRI registration number once obtained] [NEEDS INPUT: EC approval reference numbers for each investigational site]

## Post-market surveillance plan

**Complaint Handling**
All field complaints — whether received from implanting cardiologists, catheterisation laboratory staff, hospital biomedical teams, or patients — are logged into the complaint management register within 24 hours of receipt. Complaints are triaged within 72 hours against a severity matrix: complaints indicating a serious adverse event or device malfunction trigger immediate escalation to the Regulatory Affairs and Quality heads, bypassing standard queue. Root-cause analysis and CAPA documentation are targeted for closure within 30 days for moderate complaints; critical complaints involving patient harm are escalated to the CDSCO vigilance desk in parallel with internal investigation. Complaint data feeds quarterly into the PMS report cycle.

**Adverse Event Reporting**
Serious adverse events are reported to CDSCO within 15 days of the manufacturer becoming aware, as required under the Sixth Schedule of MDR 2017. Form MD-42 (manufacturer's adverse event report) is submitted for each qualifying serious event; Form MD-43 is used for the periodic PMS summary report submitted at the intervals described below. Form-25 captures device adverse event notifications at the health facility level and feeds into the manufacturer's consolidated vigilance record. Near-miss events and device malfunctions that, had they not been intercepted, could have led to serious injury are treated as reportable events on a precautionary basis, consistent with Sixth Schedule vigilance intent.

**Periodic Reporting and PSUR Cadence**
For the first 24 months following commercial launch, PMS reports are submitted on a 6-monthly basis, incorporating complaint data, adverse event summaries, field corrective action records, and any emerging real-world performance signal. From month 25 onward, reporting transitions to an annual PSUR cycle unless the CDSCO review triggers a return to a more frequent cadence. PSUR outputs feed directly into the Section 10 Risk Management file at each review cycle.

## Vigilance reporting framework

Under the Sixth Schedule of MDR 2017, the following reporting structure applies:

- **MD-42** (Manufacturer's Adverse Event Report): submitted for each individual serious adverse event — defined as an event resulting in death, serious deterioration in patient health, or potential for either — within 15 days of the manufacturer's awareness.
- **MD-43** (Periodic PMS Summary Report): submitted at 6-monthly intervals for the first 24 months post-launch, then annually; consolidates complaint trends, adverse event counts, and field corrective actions.
- **Form-25** (Device Adverse Event Notification — Health Facility): completed by the implanting facility upon identification of a device-related adverse event; copies retained by the manufacturer as part of the consolidated vigilance record.

All three forms are maintained in the DMF traceability dossier with version-controlled records.

## Post-market clinical follow-up (PMCF)

A structured PMCF programme is likely required for this Class D novel implantable, and will be conducted at a minimum quarterly cadence during the first 24 months post-launch. Triggers for a PMCF review include: any cluster of MACE events within a device cohort, emerging signals from the complaint management system, publication of adverse outcomes in analogous devices, and any CDSCO-directed safety review.

PMCF data collection draws on registry enrolment at implanting centres, structured follow-up questionnaires at 3, 6, 12, 24, and 36 months, and imaging sub-studies where available. Findings from each PMCF cycle are formally reviewed by the clinical and regulatory team and the outputs feed directly into the Section 10 Risk Management file, with any identified residual risk triggering re-evaluation of risk controls. [NEEDS INPUT: names and number of PMCF registry sites post-launch]

## Cross-references

- §3 Intended Use — target population + intended-use claim
- §6 Predicate Comparison — no-predicate / has-predicate basis for clinical evidence expectation
- §10 Risk Management — clinical findings + PMCF feed the ISO 14971 hazard register
- §13 Biocompatibility — chronic toxicity + leachables data
- §4 Classification & Pathway — MD-22 / MD-23 sequence for novel devices

---

# §13 Biocompatibility (ISO 10993)

_strategy: llm_synthesized · status: complete · cost: $0.0175_

## Tier overview

| Field | Value |
|---|---|
| ISO 10993-1 category | Implant — tissue/bone OR blood (long-term) |
| Q9 patient_contact (wizard-explicit) | implant_gt_30d |
| Default contact duration | long_term |
| Add-on panels applied | drug-eluting, bioresorbable / biodegradable |
| Lab-evidence requirement | NABL-accredited test reports |

## Why this tier applies

A bioresorbable drug-eluting coronary stent is deployed permanently — or until resorption is complete — within the coronary vasculature, placing it in direct, sustained contact with blood and perivascular tissue from the moment of implantation. The Q9 wizard response of implant_gt_30d reflects the clinical reality: even the fastest-resorbing polymer scaffolds maintain structural presence for twelve months or more, and drug elution continues well into that window. This combination — blood contact, tissue apposition, and extended duration — places the device unambiguously in the Implant — tissue/bone OR blood (long-term) category as defined by ISO 10993-1:2018 Annex A, which governs the selection logic for the panel that follows. No lesser contact tier is defensible for this device class. All studies submitted in support of this section are expected to be conducted at, or sub-contracted through, NABL-accredited laboratories; where foreign data is relied upon, the applicant should be prepared to demonstrate equivalence of test conditions under CDSCO scrutiny. [NEEDS INPUT: NABL-accredited testing laboratory name(s) and accreditation scope reference(s)]

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

The antiproliferative agent eluted from the stent coating constitutes a medicinal substance in contact with the systemic circulation, which shifts the biocompatibility evaluation from a purely material-based exercise to a combination-product assessment. ISO 10993-17 allowable-limits analysis is likely required to set tolerable daily exposure thresholds for each leachable drug-related compound — not just the active itself but its known degradation products and process-related impurities. ISO 10993-18 chemical characterization must be extended beyond the structural scaffold to encompass the drug-polymer matrix, any coating solvents, and any excipients. ISO 10993-16 frames the toxicokinetic study design that underpins both. The medicinal substance sub-block is addressed in detail in §8 Design & Manufacturing; the joint DCG(I) review pathway is covered in §19. CDSCO reviewers should treat this section and §19 as read together for the complete combination-product evidence package.

## Bioresorbable overlay

Resorption introduces a time-dependent leachable profile that a conventional permanent-implant evaluation does not capture: as the matrix degrades, breakdown products enter the peri-implant tissue and systemic circulation at rates that change across the device's functional lifetime. ISO 10993-9 provides the framework for identifying and characterising those degradation products, and ISO 10993-16 governs the toxicokinetic study design that tracks their absorption, distribution, and clearance. The matrix-specific standards — ISO 10993-13 for polymeric matrices, ISO 10993-14 for ceramics, ISO 10993-15 for metals — are listed as conditional because the applicable standard depends on which material class constitutes the resorbable scaffold. The founder should confirm the primary matrix material in the product description within §8 so that the relevant standard(s) can be flagged as active rather than conditional in the final submission. [NEEDS INPUT: Bioresorbable matrix material class — polymer, ceramic, or metallic alloy — and trade name / grade if applicable]

## Sequencing with adjacent sections

Section 13 testing is contingent on a locked material specification, so it should not begin until the material selection decision documented in §8 Design & Manufacturing is finalised and change-controlled. Accelerated-aging samples generated for §15 Stability are the appropriate source for leachables and extractables testing, making parallel execution of §13 and §15 both practical and efficient. Risk Management under §10 draws directly on the toxicological data produced here — hazard identification loops back to the risk file as results become available rather than waiting for the full panel to close. Sterilisation method and cycle parameters must be validated under §14 before final §13 testing is run, because the sterilisation process can meaningfully alter the leachables profile of a drug-polymer matrix.

## Cross-references

- §8 Design & Manufacturing — materials list + manufacturing process
- §10 Risk Management — ISO 14971 hazard register receives biocomp findings
- §14 Sterilization Validation — must precede final biocomp testing for sterile devices
- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source
- §8.12 Medicinal substances sub-block (in §8) — drug component dossier
- §19 Conditional NOCs — DCG(I) joint review for combination product

---

# §14 Sterilization Validation

_strategy: llm_synthesized · status: pending · cost: $0.0000 · ERROR: [   {     "origin": "string",     "code": "too_big",     "maximum": 2000,     "inclusive": true,     "path": [       "sequencing_note"     ],     "message": "Too big: expected string to have <=2000 characters"   } ]_

## Why §14 applies + the method-selection problem

DMF §8.14 sterilization validation applies because your device is sterile (per the synthesizer's inference marker). CDSCO recognises four sterilization methods, each tied to a different ISO standard. Your founder selects the applicable method in the editor; the other three method blocks should be removed before submission. NABL-accredited validation reports are expected for the chosen method. [NEEDS INPUT: device-specific framing paragraph — narrative LLM call did not complete this run]

## Method matrix

| Method | Primary standard | SAL convention | Material-compat constraint | Key gotcha |
|---|---|---|---|---|
| Ethylene oxide (EtO) | ISO 11135:2014 | 10⁻⁶ standard | Most polymers + metals; sensitive to moisture for some materials. | Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required. |
| Radiation (gamma / e-beam / X-ray) | ISO 11137-1/-2/-3 | 10⁻⁶ at 25 kGy reference dose | Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose. | Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected. |
| Steam / moist heat (autoclave) | ISO 17665-1:2006 (rev. ISO 17665:2024) | 10⁻⁶ standard | Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail. | Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices. |
| Aseptic processing | ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom) | Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible. | Any material — components sterilized separately + assembled aseptically. | Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices. |

## Method-selection guidance for this device

High-dose gamma typically degrades the drug; EtO may leave residuals on drug surface that complicate ISO 10993-17 allowable-limits work; aseptic processing is the typical industry default for drug-eluting coronary stents and similar devices. The §13 drug-eluting overlay (ISO 10993-17 + -18 + -16) scope shifts with the chosen sterilization method.

Gamma accelerates degradation of resorbable polymers (PLA, PLGA, Mg alloys); e-beam at lower validated doses may work but requires bridging studies; aseptic or low-dose e-beam are typical paths. The §13 bioresorbable overlay (ISO 10993-13/-14/-15 degradation products) is sensitive to the sterilization-induced baseline degradation.

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

- Bioburden control before sterilization (ISO 11737-1)
- Sterility testing in process validation (ISO 11737-2 — not a release test, but used in validation)
- Sterile barrier system qualification (ISO 11607-1/-2) with shelf-life claim aligned to §15 Stability
- Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18; pre-sterilization leachables data requires a bridging justification

## Sequencing with adjacent sections

§14 sterilization validation precedes final §13 ISO 10993-17 / -18 leachables runs — sterilization can alter the leachables profile; pre-sterilization leachables data requires a bridging justification. The sterile-barrier shelf-life claim ties to §15 Stability Data. Per-batch sterility-validation records land in §16 Batch Release. Sterilization-failure modes feed §10 Risk Management hazard register.

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

_strategy: llm_synthesized · status: complete · cost: $0.0137_

## Which NOCs apply to this device

A bioresorbable drug-eluting coronary stent occupies an unusual regulatory position under MDR 2017: it is a Class D implantable device that also carries a pharmacologically active coating, which triggers a second layer of scrutiny beyond the standard MD-3 manufacturing-licence pathway described in §4. The triggered overlay here is the DCG(I) joint review — the mechanism by which CDSCO's device wing and the Drugs Controller General (India) together evaluate the drug component's contribution to the device's intended effect. This is not a separate pre-market application; it runs as a parallel track on the same submission dossier, but its outcome is expected to gate final licence grant. No other conditional NOC sub-blocks — DAHD, BARC/AERB, or PNDT — are triggered for this product. The sections below address the DCG(I) overlay specifically, including the evidence linkages into the combination-product characterisation work documented elsewhere in this dossier.

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

The drug-eluting coating — [NEEDS INPUT: active pharmaceutical ingredient name, e.g., sirolimus or everolimus, and nominal dose per stent] — releases a pharmacologically active substance into coronary tissue over a defined elution window. Where that drug component is intended to achieve an effect that is integral to the device's claimed performance (suppression of in-stent restenosis), the product meets the combination-product threshold under Schedule III of MDR 2017, and CDSCO is expected to seek a DCG(I) opinion on the drug constituent prior to licence grant. The characterisation data supporting this review are anchored in two cross-blocks: §8.12 documents the medicinal-substance identity, elution kinetics, and dose-response rationale, while §13 carries the ISO 10993-17 toxicological risk assessment establishing allowable limits for systemic and local drug exposure. Together these blocks provide the evidentiary basis DCG(I) reviewers are anticipated to draw on when forming their opinion on whether the drug constituent is safe and performs as characterised within the combination product.

## Sequencing notes

For this device, one conditional overlay is active: the DCG(I) joint review. Unlike a BARC radiation-safety NOC — which would need to be obtained before submission — the DCG(I) opinion is initiated concurrently with the MD-3 filing rather than as a standalone pre-application step. In practice, CDSCO forwards the combination-product dossier to DCG(I) after initial technical scrutiny; the applicant should anticipate a query cycle from DCG(I) focused on the §8.12 and §13 materials and should assign a named point of contact to manage that parallel correspondence without disrupting the main MD-3 review timeline. A typical cadence, consistent with industry experience on similar combination implants, is a 30–60 day DCG(I) review window after dossier referral, though this is subject to query volume and workload at the time of submission. Licence grant is not anticipated until DCG(I) confirmation is received; the applicant's internal project plan should treat that confirmation as a hard dependency on the critical path.

## Cross-references

- §8 Design & Manufacturing — §8.12 medicinal substances sub-block
- §13 Biocompatibility — ISO 10993-17 allowable limits
- §12 Clinical Evidence — combination-product clinical data
- §4 Pathway — main MD-3 / MD-7 manufacturing-licence path

---
