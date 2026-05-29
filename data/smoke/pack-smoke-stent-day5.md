# Hardware pack smoke output — implant (Drug-eluting coronary stent)

Generated: 2026-05-29T10:55:33.893Z

One-liner: A bioresorbable drug-eluting cardiac stent for coronary artery disease.

Q8 predicate: no
Q9 patient_contact: implant_gt_30d
B6 ISO 13485 status: in_progress

Sections rendered: 18
Total LLM cost: $0.2671
Assertions: 125 pass / 0 fail

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

# §6 Predicate Device Comparison

_strategy: llm_synthesized · status: complete · cost: $0.0187_

## Predicate basis (Q8 wizard-explicit)

**Status:** No predicate device — novel

## No-predicate declaration

No Indian predicate device is claimed for this submission. The Q8 wizard response is explicit: no substantially equivalent device has been identified within CDSCO's approved-device registry for a bioresorbable drug-eluting cardiac stent indicated for coronary artery disease. The device is accordingly treated as first-in-class within Indian regulatory scope for its intended use.

Under MDR 2017, the absence of a predicate triggers the novel medical device pathway rather than a comparative equivalence review. Classification as Class D under the First Schedule (Part I) reflects the device's inherent patient-contact risk profile and its intended implantable, life-sustaining function. The drug-eluting combination-product dimension is addressed through DCG(I) coordination under §8.12 and §19 of the applicable combination-product guidance; the device regulatory pathway itself remains governed by MDR 2017.

## MD-26 → MD-27 pre-permission pathway

Because no predicate is claimed, the applicant is likely required to obtain a Novel Device Permission before the primary manufacturing licence application is accepted by CDSCO's Central Licensing Authority. The procedural sequence is: (1) file Form MD-26 with CDSCO CLA, submitting the technical dossier and safety/performance evidence package described in this Master File; (2) receive CDSCO grant on Form MD-27 (Permission for Novel Medical Device); (3) proceed to Form MD-7 for the manufacturing licence; (4) Form MD-9 is the downstream market-authorisation certificate.

MD-26 requires the applicant to declare the intended use, device description, evidence of safety and performance, and — for a Class D implantable — clinical investigation data or a justified waiver pathway. The MD-26 declaration scope differs depending on whether the route is domestic manufacture or import.

[NEEDS INPUT: Confirmation of whether applicant intends domestic manufacture (Form MD-7) or import (Form MD-14), as this determines the precise MD-26 declaration scope and the licensing authority jurisdiction.]

## Clinical-evidence implication

Without a predicate, the substantial-equivalence route is unavailable. Clinical evidence therefore functions as the primary basis on which CDSCO reviewers will assess safety and performance — not as a supplementary data package but as the evidentiary foundation of the submission.

For a Class D bioresorbable implantable, this practically means a pivotal clinical investigation conducted or accepted under the Seventh Schedule framework, with adequate follow-up to characterise bioresorption kinetics, device integrity at the target vessel, and major adverse cardiac event rates. Preliminary data from earlier-phase studies may be submitted to support the MD-26 application, but the pivotal data set is expected to be in place before MD-9 market authorisation is granted.

The absence of comparative predicate data also shapes the hazard register: there is no reference-device failure-mode library to draw on, so the ISO 14971 risk analysis (see Section 10 — Risk Management) is built from first principles, incorporating published literature, bench testing, and any available human-factors evidence. See Section 12 — Clinical Evidence and PMS for pivotal-study design parameters.

## Pathway implication

The manufacturing licence sequence is MD-26 → MD-27 → MD-7 → MD-9. See §4 Classification & Pathway for the full sequence and §12 Clinical Evidence & PMS for the no-predicate clinical-evidence work.

## Cross-references

- §4 Classification & Pathway — MD-26 / MD-27 sequence + form-pair detail
- §12 Clinical Evidence & PMS — pivotal-study design when no predicate
- §10 Risk Management — novel-device hazard register inputs
- §3 Intended Use — first-in-class intended-use anchor

---

# §5 Product Specification & Variants

_strategy: llm_synthesized · status: complete · cost: $0.0173_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Product class | D |
| Form factor | Hardware (or hardware + software) |

## Device family / variants

The submission covers a single product category: a bioresorbable drug-eluting coronary stent intended for percutaneous coronary intervention in patients with coronary artery disease. No variant SKUs are declared at this stage. [NEEDS INPUT: confirmed model designation / SKU identifier once assigned by the manufacturer]

## Physical specifications

The device is a bioresorbable coronary stent delivered via a balloon-catheter system for use in a surgical (catheterisation laboratory) setting. Key physical parameters include stent scaffold geometry, strut thickness, deployed diameter range, and nominal stent lengths — none of which are yet confirmed in the source data and are required for DMF §8.4 completeness.

[NEEDS INPUT: stent deployed diameter range (mm) and available lengths (mm)]
[NEEDS INPUT: strut thickness (µm)]
[NEEDS INPUT: scaffold material — polymer type, grade, and resorption kinetics profile]
[NEEDS INPUT: drug coating — active pharmaceutical ingredient identity, dose per unit area, and elution profile summary]
[NEEDS INPUT: delivery system catheter outer profile (Fr) and working length (cm)]
[NEEDS INPUT: sterility status — sterile as supplied (Y/N) and sterilisation method]
[NEEDS INPUT: shelf life and storage conditions (temperature/humidity range)]

## Performance specifications

Functionally, the stent is expected to provide acute vessel scaffolding sufficient to restore and maintain coronary lumen patency following balloon dilation, while the drug-eluting matrix operates to inhibit neointimal hyperplasia during the critical healing window. The bioresorbable scaffold is anticipated to degrade progressively over a defined resorption period, ultimately leaving no permanent implant footprint.

Quantitative performance targets — including minimum radial strength (kPa or N/mm), acute recoil percentage, drug elution rate at defined time points, and bioresorption timeline — are device-specific design outputs that must be drawn from verified bench and pre-clinical data.

[NEEDS INPUT: radial strength specification and test method reference]
[NEEDS INPUT: acute recoil target (%)]
[NEEDS INPUT: drug elution profile targets (cumulative % release at defined days)]
[NEEDS INPUT: full bioresorption timeline (months) supported by pre-clinical or clinical data]
[NEEDS INPUT: clinical performance anchor data — if any pilot or pivotal study results are available, provide primary endpoint outcomes for citation as preliminary evidence subject to confirmatory review]

## Intended service life

As a fully bioresorbable implant, the device does not carry a conventional in-vivo service life analogous to a permanent metallic stent. The clinically relevant functional window — scaffold integrity through vessel remodelling — is defined by the resorption timeline.

[NEEDS INPUT: functional scaffolding duration (months) prior to onset of significant resorption]
[NEEDS INPUT: complete resorption endpoint (months) from pre-clinical or clinical data]

For the associated delivery system (single-use, sterile as supplied), shelf life governs rather than service life. [NEEDS INPUT: validated shelf life (months) and storage condition specification]

## Accessories and packaging

[TBD] — accessories list and sterile-barrier packaging description pending Sprint 3 applicant input on family grouping and packaging characteristics. Cross-reference: Section 7 — Labelling for sterile-barrier and shelf-life statements once captured.


---

# §7 Labelling

_strategy: llm_synthesized · status: complete · cost: $0.0187_

## Manufacturer details

| Field | Value |
|---|---|
| Manufacturer (legal) | [TBD] |
| Registered address | [TBD] |
| Manufacturing address | [TBD] |
| Product / brand | [TBD] |
| Model number | [TBD] |

## Intended-use label

[NEEDS INPUT: device trade name] is a bioresorbable drug-eluting coronary stent indicated to restore luminal patency in de novo native coronary artery lesions in patients with symptomatic ischaemic heart disease. For use by trained interventional cardiologists in a cardiac catheterisation laboratory only.

## Contraindications

Contraindicated in: patients with known hypersensitivity to [NEEDS INPUT: drug or polymer component]; lesions not meeting anatomical eligibility criteria [NEEDS INPUT: specific diameter/length thresholds]; patients unable to tolerate dual antiplatelet therapy; severely calcified or tortuous vessels where stent delivery is not feasible [NEEDS INPUT: additional contraindications from clinical data].

## Regulatory marks

- For use by qualified clinicians.
- [TBD] CDSCO manufacturing licence number — populated post-grant.

## Instructions for Use (IFU summary)

## Indications
This bioresorbable drug-eluting coronary stent is indicated for improving coronary luminal diameter in patients with symptomatic ischaemic heart disease due to de novo native coronary artery lesions. Target patient population and lesion morphology criteria (reference vessel diameter, lesion length) are [NEEDS INPUT: specific lesion eligibility criteria from clinical protocol].

## Intended Users and Environment
For use exclusively by interventional cardiologists trained in percutaneous coronary intervention (PCI), operating within a fully equipped cardiac catheterisation laboratory. The device is not intended for use outside a supervised surgical/interventional setting.

## Pre-Use Checks
Before deployment, visually inspect the sealed packaging for integrity. Do not use if the package is damaged, the expiry date has passed, or the sterility indicator has been compromised. Confirm device model, nominal diameter, and length against the planned procedure. [NEEDS INPUT: sterile status confirmation and sterility indicator type]

## Directions for Use
Deliver the stent using standard over-the-wire or monorail catheter technique under fluoroscopic guidance. [NEEDS INPUT: recommended guide catheter inner diameter, balloon inflation pressure range (nominal and rated burst), deployment sequence and post-dilatation guidance]. Do not re-use or re-sterilise. Once deployed, the scaffold resorbs over a defined period; [NEEDS INPUT: confirmed resorption timeline from bench/clinical data].

## Warnings and Precautions
- Do not use in patients with known hypersensitivity to the drug coating component or to the scaffold polymer. [NEEDS INPUT: drug name and polymer identity]
- Dual antiplatelet therapy (DAPT) duration should follow current ESC/ACC guidelines and the treating physician's clinical judgement; consult product labelling for minimum recommended duration. [NEEDS INPUT: sponsor-specified DAPT duration based on clinical evidence]
- Stent thrombosis risk during resorption phase requires vigilant patient follow-up.
- Avoid MRI immediately post-implant until device resorption is confirmed; [NEEDS INPUT: MRI conditional status and conditional parameters if applicable].

## Storage
[NEEDS INPUT: storage temperature range and humidity limits confirmed from stability study data]. Store away from direct sunlight and ionising radiation.

## Disposal
Expired or unused devices: dispose in accordance with applicable biomedical waste management rules under the Biomedical Waste Management Rules, 2016. Implanted devices that have resorbed require no retrieval.

## Manufacturer Contact
[NEEDS INPUT: manufacturer name, address, and post-market surveillance contact details]

*This IFU is subject to finalisation following CDSCO review. Labelling requirements are governed by the Fifth Schedule of MDR 2017.*


---

# §2 Device Description

_strategy: llm_synthesized · status: complete · cost: $0.0195_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Device class | D |
| Sterile status | [TBD] |
| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |

## Components and architecture

This device is a bioresorbable drug-eluting coronary stent — a temporary intravascular scaffold that delivers antiproliferative therapy to the coronary artery wall and then resorbs, leaving no permanent metallic implant. The principal sub-assemblies are: (1) the bioresorbable polymeric scaffold, formed into a tubular lattice geometry; (2) the drug-polymer coating, comprising an antiproliferative agent dispersed within a controlled-release matrix applied to the abluminal surface; and (3) the delivery system, consisting of a semi-compliant balloon catheter, hypotube shaft, and proximal hub. The scaffold arrives pre-mounted on the balloon catheter in a sterile, ready-to-deploy configuration. [NEEDS INPUT: model number / trade name designation] [NEEDS INPUT: scaffold lattice geometry — nominal strut thickness and nominal scaffold diameter range]

## Principle of operation

At deployment, the interventional cardiologist inflates the balloon catheter to expand the scaffold against the coronary artery wall, restoring luminal patency in a stenosed vessel. The scaffold provides mechanical radial support during the acute healing phase while the drug-polymer coating elutes antiproliferative agent into the surrounding neointima to inhibit smooth muscle cell proliferation and reduce restenosis risk. Over a defined resorption period, the polymeric backbone undergoes hydrolytic degradation — ultimately metabolised and cleared — restoring vessel vasomotion and eliminating the long-term foreign-body burden associated with permanent metallic stents. [NEEDS INPUT: resorption timeline (months to full degradation)] [NEEDS INPUT: antiproliferative drug identity and target elution kinetics]

## Materials and applicable standards

The scaffold is anticipated to be fabricated from a bioresorbable aliphatic polyester — most commonly poly-L-lactic acid (PLLA) or a PLLA/PLGA copolymer blend — with a drug-eluting matrix polymer on the abluminal surface. Metallic radiopaque markers (typically platinum or tantalum) are embedded to enable fluoroscopic visualisation post-deployment. Balloon catheter components include medical-grade nylon or polyether block amide (PEBA) for the balloon, and stainless steel or nitinol for the hypotube. All patient-contact materials are subject to biocompatibility assessment under ISO 10993-1. [NEEDS INPUT: confirmed scaffold polymer identity and grade] [NEEDS INPUT: radiopaque marker material confirmed by design history]

## Variants and accessories

Source data describes a single device concept; no variant family has been confirmed at this stage. The submission will proceed on a single-variant assumption pending design freeze. [TBD] — Sprint 3 family-grouping question to capture any diameter/length matrix (e.g., 2.5–3.5 mm diameter × 12–28 mm length combinations) and determine whether a common-device-family grouping or separate MD-7 filings are appropriate under MDR 2017 Schedule I classification logic.

## Lifecycle and disposal

The device is single-use; once deployed, the scaffold component remains in situ and undergoes biological resorption — there is no retrieval, reprocessing, or end-of-life disposal obligation for the implanted scaffold itself. The delivery catheter system is a single-use disposable and should be discarded as biomedical waste consistent with the Biomedical Waste Management Rules, 2016, following the procedure. Shelf life of the sterile, pre-mounted assembly [NEEDS INPUT: validated shelf life in months and storage condition (temperature/humidity)] is subject to real-time and accelerated ageing study data. No reuse, reprocessing, or re-sterilisation is indicated or authorised.

## Cross-references

- Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation.


---

# §3 Intended Use & Indications

_strategy: llm_synthesized · status: complete · cost: $0.0204_

## Indication

This device is intended to restore and maintain coronary arterial patency in adult patients presenting with obstructive coronary artery disease. A bioresorbable drug-eluting cardiac stent, it is deployed percutaneously by interventional cardiologists or cardiac surgeons in an operating theatre or cardiac catheterisation laboratory setting, under fluoroscopic guidance, as part of a planned or urgent coronary revascularisation procedure. The device delivers a localised antiproliferative pharmacological payload to the treated vessel segment while providing temporary mechanical scaffolding; the polymeric or composite scaffold is designed to resorb over time, leaving no permanent metallic implant. As a long-term implant with direct blood and tissue contact exceeding thirty days, the device falls within the highest contact-duration tier under MDR 2017 and the applicable biocompatibility framework. The patient population spans adults with symptomatic or angiographically significant coronary stenosis, including de novo native-vessel lesions, where percutaneous coronary intervention is the clinically indicated treatment strategy. [NEEDS INPUT: confirm whether the indication extends to in-stent restenosis lesions or is restricted to de novo stenosis]

## Intended user

Healthcare professionals.

## Use environment

Operating theatre.

## Patient population

The intended population comprises adult patients [NEEDS INPUT: minimum age threshold, e.g., ≥18 years] diagnosed with obstructive coronary artery disease presenting with de novo native coronary artery lesions of clinically significant stenosis, as assessed by invasive angiography or functional haemodynamic measurement. Patients should be candidates for percutaneous coronary intervention and able to tolerate dual antiplatelet therapy for the prescribed post-procedural duration. [NEEDS INPUT: target lesion length range and reference vessel diameter specifications from the clinical/engineering data] [NEEDS INPUT: whether acute STEMI is an included or excluded indication] Patients with known hypersensitivity to the scaffold material, polymer matrix, or eluted drug are excluded, as are patients for whom antiplatelet therapy is contraindicated.

## Body-contact tier (Q9 wizard-explicit)

**Tier:** Implant — tissue/bone OR blood (long-term > 30d)

The device is classified as a long-term implant with direct blood and tissue contact of duration exceeding thirty days, consistent with the contact-duration tier established under the First Schedule of MDR 2017 for Class D devices. This classification drives the full biocompatibility evaluation panel required under ISO 10993 — including cytotoxicity, sensitisation, haemocompatibility, chronic toxicity, carcinogenicity, and degradation product characterisation — which is addressed in detail at Section 13 (Biocompatibility). The implant is supplied sterile; the sterility assurance level, sterilisation method validation, and packaging integrity data are addressed at Section 14 (Sterilisation). The resorption timeline and degradation by-product profile are integral to the chronic-toxicity and biocompatibility assessment and should be presented as a unified dataset in Section 13.

## Predicate basis (Q8 wizard-explicit)

**Status:** No predicate device — novel

No legally marketed predicate device has been identified for this submission. The device is presented as a novel product under MDR 2017, which triggers the pre-permission pathway: an MD-26 application (investigational device exemption) is likely required prior to conducting any clinical investigation in India, and MD-27 pre-market approval is the applicable submission route before commercial distribution. These requirements are precedent to and independent of this Device Master File. The substantial-equivalence analysis framework — including any comparative data against commercially available metallic drug-eluting stents referenced for technological context — is addressed at Section 6 (Predicate Comparison). [REVIEW: confirm with CDSCO whether any bioresorbable coronary scaffold has received Class D approval in India that could partially serve as a predicate or comparator reference]

## Contraindications

Contraindications anticipated for this product class include: known or suspected hypersensitivity to the scaffold polymer, bioresorbable matrix components, or the eluted antiproliferative agent [NEEDS INPUT: drug name and polymer constituent(s)]; inability to tolerate or comply with the required dual antiplatelet therapy regimen; heavily calcified, tortuous, or ostial lesions beyond the device's tested deployment range [NEEDS INPUT: specific lesion morphology exclusions from bench and clinical data]; reference vessel diameters outside the validated size range [NEEDS INPUT: validated diameter range]; cardiogenic shock or haemodynamic instability precluding elective intervention; pregnancy, where systemic drug exposure from the eluted agent poses unacceptable foetal risk [NEEDS INPUT: confirm whether pregnancy is an absolute or relative contraindication per pharmacological assessment]; and paediatric patients below the minimum indicated age [NEEDS INPUT: minimum age threshold]. Applicant-specific exclusion criteria should be reconciled against the pivotal clinical investigation protocol before finalisation.

## Cross-references

- §4 Classification & Pathway — class derivation + MD-3 / MD-7 path
- §6 Predicate Comparison — full substantial-equivalence analysis
- §13 Biocompatibility — ISO 10993 panel keyed to Q9 patient contact
- §7 Labelling — intended-use statement on label + IFU

---

# §9 Essential Principles Conformity

_strategy: llm_synthesized · status: complete · cost: $0.0340_

## Essential Principles checklist

| # | Principle | Applicability | Evidence | Rationale |
|---|---|---|---|---|
| EP1 | EP1 — General requirements (safety + performance) | yes | Section 10 — Risk Management; Section 11 — V&V | As a Class D device intended for surgical use by healthcare professionals, EP1 imposes the highest scrutiny tier under MDR 2017's essential principles framework. The device must demonstrate that residual risks, in aggregate, are outweighed by clinical benefit under the intended conditions of use. Conformity evidence is distributed across the risk m... |
| EP2 | EP2 — Risk management (ISO 14971) | yes | Section 10 | A full risk management process conforming to ISO 14971:2019 is maintained, covering hazard identification, probability and severity estimation, risk control selection, residual risk evaluation, and post-market feedback integration. Given Class D classification, CDSCO reviewers should expect the risk management file to document worst-case failure mo... |
| EP3 | EP3 — Design and construction characteristics | yes | Section 2; Section 8 | The device's physical design and construction are documented in Section 2 (Device Description) and further supported by manufacturing process controls described in Section 8. For a surgical-environment device at Class D, design characteristics must demonstrably account for the stresses and contamination risks inherent to an operating theatre — incl... |
| EP4 | EP4 — Performance (intended use achievement) | yes | Section 11; Section 12 | Demonstration that the device achieves its stated intended purpose under the conditions of its intended use — including in the hands of the intended HCP users within a surgical environment — is the core obligation of EP4. Bench performance testing and, where applicable, clinical performance data are consolidated in Section 11 (V&V) and Section 12 (... |
| EP5 | EP5 — Lifetime / shelf life | yes | Section 5; Section 11 | The device's expected service life and, where relevant, component replacement or maintenance intervals are defined in Section 5. Accelerated aging or real-time stability data supporting those claims are referenced in Section 11. For a Class D surgical device, the adequacy of the defined lifetime must be reconciled with the risk management file — de... |
| EP6 | EP6 — Transport and storage | yes | Section 7 | Transport and storage conditions — including permissible temperature and humidity ranges, shock and vibration tolerances, and labelling requirements for logistics handling — are specified in Section 7. For a surgical device distributed within India's varied logistics infrastructure, the applicant should confirm that conditioning tests or environmen... |
| EP7 | EP7 — Benefit-risk balance | yes | Section 10; Section 12 | EP7 requires an explicit, documented determination that the clinical benefits of the device outweigh the residual risks for the intended population under the intended use conditions. For Class D, this determination is subject to line-by-line examination by CDSCO; a narrative benefit-risk summary referenced within the risk management report (Section... |
| EP8 | EP8 — Chemical / physical / biological properties | [TBD — pending biocompatibility determination] | Section 2; Section 11 biocompatibility (if applicable) | Applicability of EP8 depends on whether the device or any of its materials contacts the patient directly or indirectly in the surgical environment. If patient contact is confirmed, a biocompatibility evaluation following ISO 10993-1 is required and would constitute primary evidence for this principle. [NEEDS INPUT: Confirmation of patient-contact s... |
| EP9 | EP9 — Infection and microbial contamination | [TBD — sterility status not confirmed] | Section 8 sterilization | Sterility status for this device is recorded as TBD in the current submission data. If the device is supplied sterile or is intended to contact sterile fields within the surgical environment, EP9 becomes fully applicable and sterilization validation per ISO 11135 or equivalent, together with sterile barrier system validation per ISO 11607, would be... |
| EP10 | EP10 — Construction / environmental interaction | yes | Section 2 | The surgical use environment imposes specific electromagnetic, thermal, and mechanical stressors. EP10 requires that the device's construction is compatible with the anticipated environmental conditions of use — including exposure to surgical lighting, electrosurgical equipment emissions (if relevant), and cleaning agents used for terminal decontam... |
| EP11 | EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1) | n_a | N/A | No software component is present in this device. EP-SW is recorded as not applicable. This determination should be revisited if any future design change introduces firmware, embedded software, or a connected digital interface. |

## Usability engineering (IEC 62366-1)

Usability engineering for this device follows IEC 62366-1:2015+AMD1:2020. The intended users are healthcare professionals operating in a surgical environment — a context characterised by time pressure, sterile-field constraints, and the involvement of multidisciplinary teams. Formative usability studies are expected to include task analysis and use-error risk identification conducted with representative HCP participants (surgeons, scrub nurses, or equivalent, depending on the specific use scenario), with findings feeding directly into the risk management process under ISO 14971. Summative validation testing, using a protocol pre-specified against the use-error risk table, is anticipated to be conducted in a simulated or actual surgical setting to confirm that critical tasks can be completed safely and effectively without specialist training beyond what is described in the instructions for use. [NEEDS INPUT: Confirmed usability study protocols, participant counts, and any completed formative study reports]

## Non-applicability justifications

- **EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1)** — No software component is present in this device. EP-SW is recorded as not applicable. This determination should be revisited if any future design change introduces firmware, embedded software, or a connected digital interface.


---

# §8 Design & Manufacturing

_strategy: llm_synthesized · status: complete · cost: $0.0401_

## Summary

| Field | Value |
|---|---|
| ISO 13485 status (B6) | in_progress |
| Manufacturing address | [NEEDS INPUT] |
| Drug component (combination product) | Yes — see §8.12 sub-block below |
| Sterilization | See §14 Sterilization Validation for method-specific detail |

## Design controls

Design development for this Class D bioresorbable drug-eluting coronary stent follows a structured gate-review model consistent with Fourth Schedule (Appendix II) Device Master File requirements and ISO 13485 design-control clauses. Design inputs capture coronary anatomy constraints, radial force requirements, resorption kinetics, drug-release performance, biocompatibility limits, and sterile-barrier compatibility — each traceable to an output artifact.

A typical gate structure for a device at this risk tier includes: (i) Design Input Lock, (ii) Prototype Qualification, (iii) Design Verification, (iv) Design Validation, and (v) Design Transfer to Manufacturing. Given the combination-product nature of the device, gate reviews are expected to include cross-functional sign-off from materials engineering, pharmaceutical development, and clinical affairs — not engineering sign-off alone. [NEEDS INPUT: confirmed gate-review schedule and current design phase]

Verification activities cover mechanical performance (radial strength, foreshortening, fatigue under physiological loading), scaffold geometry dimensional conformance, resorption-rate testing, and drug-coating integrity. Validation addresses the full assembled device under simulated-use conditions, including deployment in bench-top coronary models and relevant animal models. Biocompatibility verification is documented separately — see §13. Software embedded in any associated delivery system or programmer is addressed in §11 V&V and §8.15; it is not duplicated here.

Design transfer documentation — including manufacturing process specifications, acceptance criteria, and device history records — is expected to be formalised prior to commercial manufacture. [NEEDS INPUT: design freeze date or transfer milestone]

## Bill of materials & materials selection

The device BOM encompasses three principal material categories: the bioresorbable scaffold substrate, the drug-coating matrix, and the delivery-system components (balloon catheter and crimping elements).

The scaffold substrate belongs to the poly(lactic acid) family of resorbable aliphatic polyesters — specific copolymer composition, molecular weight grade, and supplier qualification are device-confidential and flagged for dossier inclusion. [NEEDS INPUT: scaffold polymer INN/INCI designation, grade, and approved supplier]

The drug-coating matrix consists of a polymeric carrier or polymer-free formulation loaded with the therapeutic agent. [NEEDS INPUT: coating polymer identity and drug substance — see §8 medicinal substances sub-block]

Metallic components, where present in the delivery catheter or marker bands, are anticipated to be biocompatible alloys (platinum-iridium or similar radiopaque materials). [NEEDS INPUT: marker band alloy specification]

Packaging materials — primary sterile barrier and secondary carton — are selected in accordance with ISO 11607 compatibility requirements. The full ISO 10993 biocompatibility panel arising from this material selection, including extract testing and leachables characterisation, is documented in §13.

## Manufacturing process

The manufacturing process encompasses scaffold fabrication, surface preparation, drug coating, assembly with the delivery system, and packaging — with terminal sterilization as the final step before release.

Scaffold fabrication begins with polymer extrusion or injection moulding to produce tube stock, followed by laser cutting to achieve the designed strut geometry. Dimensional inspection and post-processing (cleaning, annealing where applicable) are conducted prior to coating. [NEEDS INPUT: whether extrusion or moulding is the primary scaffold-forming route]

Drug coating is the critical combination-product manufacturing step. The limus-family or equivalent antiproliferative agent [NEEDS INPUT: drug INN] is applied to the scaffold surface via a controlled deposition process — spray coating, dip coating, or vapour deposition — under environmentally controlled conditions. Coating uniformity, drug load per device, and coating adhesion are each subject to in-process and finished-device release controls. Precise coating process parameters are treated as trade-secret manufacturing information submitted under the confidentiality provisions of the DMF.

The coated scaffold is crimped onto the delivery balloon catheter under controlled-force conditions and assembled into the sterile-barrier pouch. Terminal sterilization methodology — modality, parametric release conditions, and validation data — is addressed in §14 Sterilization Validation and is not reproduced here.

Manufacturing is expected to be conducted at [NEEDS INPUT: manufacturing site address], with contract arrangements for [NEEDS INPUT: confirm whether any sub-processes — e.g., drug synthesis, balloon catheter manufacture — are performed at secondary sites]. All sub-contracted operations are covered under supplier quality agreements referenced in the QMS.

## In-process controls + finished-device release

In-process control is organised across four inspection stations:

**Incoming inspection**: Raw polymer, drug substance, and delivery-catheter components are inspected against approved specifications before release to production. Certificate of Analysis review and identity testing are minimum requirements at this stage.

**Post-cutting dimensional check**: Scaffold geometry — strut width, strut thickness, cell area, and overall length — is verified against engineering drawing tolerances using optical or CMM measurement. Sample size and acceptance criteria are defined in the relevant inspection procedure. [NEEDS INPUT: AQL level and sampling plan reference]

**Coating uniformity and drug-load verification**: Following the drug-coating step, a statistically defined sample from each coating lot is tested for drug content per device and coating thickness. Out-of-specification results trigger batch hold and root-cause investigation per the non-conformance procedure.

**Finished-device release testing**: Each manufactured lot is subject to radial force testing, balloon-expansion deployment testing, sterile-barrier integrity, and visual inspection prior to release. Release authorisation is documented in the Batch Manufacturing Record and linked to the QMS document-control system — see §16 Batch Release Certificates.

## Quality management system (cross-reference §18)

The QMS is structured to meet Fifth Schedule requirements and ISO 13485:2016. As of the date of this submission, certification is in progress — the current posture and certification timeline are described in the ISO 13485 Evidence sub-section below.

Management responsibility is vested in a designated Management Representative with authority to halt production in response to quality signals, initiate corrective action, and report directly to senior leadership. For a Class D implantable combination product, CDSCO review is likely to scrutinise the internal audit programme with particular attention: audit frequency, independence of auditors, and documented closure of critical findings. Industry practice for Class D devices supports a minimum annual full-system audit cycle with targeted process audits at higher frequency during pre-commercial scale-up.

The detailed QMS sub-element attestation — covering document control, purchasing controls, CAPA, complaint handling, risk management integration, and the remaining sub-rows — is presented in §18 QMS Compliance. This section does not repeat that detail. Gaps identified during the current certification engagement are being tracked against a remediation plan; the expectation is that Stage 2 certification will be completed before CDSCO grant of import/manufacturing licence. [NEEDS INPUT: target Stage 2 completion date]

## ISO 13485 status & evidence

ISO 13485:2016 certification is in progress. A certification body has been engaged [NEEDS INPUT: CB name and accreditation body], and the Stage 1 (documentation) audit is [NEEDS INPUT: completed / scheduled for (date)]. Stage 2 (site assessment) is anticipated for [NEEDS INPUT: target quarter and year]. Interim quality governance is maintained through internal audits conducted against the ISO 13485 clause structure. Certification documentation will be submitted to CDSCO as a post-submission update or via the applicable amendment pathway once the certificate is issued.

## Batch release (cross-reference §16)

Per-batch Certificate of Analysis detail, including test results and release-authorisation sign-off, is maintained in the Batch Manufacturing Record and summarised in §16 Batch Release Certificates. Release authority rests with the designated Quality Responsible Person, whose appointment and qualification are documented in the QMS. Release sign-off triggers update of the lot-traceability index within the document-control system, supporting both post-market surveillance data linkage (§17) and any field-action lookback requirements under the Sixth Schedule vigilance framework.

## §8.12 Medicinal substances (combination product)

This sub-block constitutes the device-side dossier content for the combination-product drug component, consistent with DMF Fourth Schedule (Appendix II) requirements. The DCG(I) joint-review pathway — and any pre-approval interaction with the drug regulatory authority — is addressed in §19; that procedural track is not duplicated here.

The drug substance is an antiproliferative agent from the limus family (e.g., sirolimus, everolimus, or biolimus) or an alternative class. [NEEDS INPUT: drug substance INN; confirm whether this is a previously approved drug or a new chemical entity requiring separate DCG(I) evaluation] The drug is incorporated into or onto the scaffold at a defined load per device. [NEEDS INPUT: drug load per device (µg); coating or matrix formulation; release-rate profile (e.g., % released at 30/90/180 days in specified medium)]

The toxicological characterisation of the drug component, including allowable limits for systemic exposure, is anchored to ISO 10993-17 (toxicological risk assessment), ISO 10993-18 (chemical characterisation), and ISO 10993-16 (toxicokinetic study design) — the full panel is presented in §13 Biocompatibility. Leachables from the coating matrix are assessed in the same section; extractables from packaging contact materials are treated as a secondary pathway.

Clinical evidence for drug-eluting performance cannot be disaggregated from device performance at the combination-product level — the relevant trial data, including any available controlled clinical evidence for this specific device-drug combination, is presented in §12 Clinical Evidence. Pre-clinical pharmacokinetic and pharmacodynamic data supporting the release-rate specification are cross-referenced there as well. [NEEDS INPUT: pre-clinical PK/PD study identifiers or GLP laboratory reference]

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

_strategy: llm_synthesized · status: complete · cost: $0.0355_

## Risk register (ISO 14971)

| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |
|---|---|---|---|---|---|---|---|---|
| R1 | Absence of documented ISO 10993 biocompatibility data for bl... | Device implanted in coronary anatomy with materials whose haemocompatibility, se... | Acute or subacute haemolysis, local tissue inflammation, sys... | critical | occasional | Commission ISO 10993 test battery (haemocompatibility, implantation, sensitisation, systemic toxicit... | critical | rare |
| R2 | No controlled clinical evidence base to characterise device ... | Class D coronary implant deployed in patients without a pivotal investigation es... | Device failure, restenosis, perforation, or embolisation res... | critical | occasional | Engage a clinical research organisation to develop a pivotal investigation protocol compliant with S... | critical | rare |
| R3 | Absence of a certified Quality Management System governing d... | Device designed, produced, and released without ISO 13485-compliant controls; de... | Latent device defect reaching the patient — dimensional non-... | serious | occasional | Initiate ISO 13485 gap assessment this quarter with a qualified QMS consultant. Establish interim de... | serious | rare |
| R4 | Coronary implant sizing mismatch relative to vessel anatomy | Device selected or deployed in a vessel segment whose diameter or lesion length ... | Coronary dissection, acute vessel closure, or late scaffold ... | critical | rare | Define validated sizing matrix (device diameter and length combinations with corresponding vessel re... | serious | rare |
| R5 | Delivery system failure during coronary implantation procedu... | Catheter shaft kink, balloon non-inflation, or implant detachment from delivery ... | Retained device fragment, coronary embolisation, vessel trau... | critical | rare | Bench validation of delivery system to simulate worst-case tortuous coronary anatomy (minimum bend r... | critical | rare |

## Risk summary narrative

The risk register was constructed from three inputs: a clinical hazard analysis anchored to the coronary implant intended use, applicant-declared risks captured during Tier B intake, and the high-priority gaps identified in the Risk Card cross-anchor. All five rows were evaluated against ISO 14971:2019's probability–severity matrix, with severity levels calibrated to MDR 2017 Schedule 2 harm definitions for a Class D device.

The two highest-residual-risk rows — R1 (biocompatibility gap) and R2 (absent clinical evidence) — remain rated critical/rare after mitigation because the mitigations are prospective: testing has not been completed and a pivotal investigation has not been initiated. Until R1 biocompatibility data are in hand and R2 has an approved protocol, these rows represent open risk items, not closed ones. The Risk Management File will flag them as pre-conditions for first-in-human implantation.

Ownership of the Risk Management File sits with the RA lead, with mandatory clinical reviewer co-sign on any change to severity or probability ratings for R1, R2, and R5. Given Class D classification, the review cadence during any pilot phase is monthly — covering field reports, complaint trends, and any regulatory queries. Post-market grant, the cadence shifts to quarterly unless a signal triggers an unscheduled review (see residual risk assessment below). Field reports from implanting centres feed into the PMS database within 15 days of receipt; the RA lead triages within 5 working days and escalates to the clinical reviewer where an event involves an unexpected adverse cardiac outcome. [NEEDS INPUT: clinical state — pivotal study status, first-in-human timeline, or any existing investigational use data]

## Residual risk assessment

Across the five register rows, residual risk is rated acceptable — subject to the mitigations being executed in the sequence and to the timelines noted — except for R1 and R2, which remain conditionally elevated pending completion of ISO 10993 testing and pivotal investigation approval respectively. For R5, residual severity stays at critical because a delivery-system failure in a coronary vessel has an irreducible potential for serious harm even at rare probability; post-market monitoring is considered sufficient because the mitigation (bench validation and mandatory vigilance reporting) provides an active detection mechanism. The specific signals that would flip R2 or R5 into a CAPA are: any confirmed device-related serious adverse event at an incidence exceeding the protocol-defined safety stopping rule, or two or more delivery failures reported within any rolling 90-day window.

## Risk Management File reference

The Risk Management File is currently in active development, structured to ISO 14971:2019 requirements. Formalisation — including document control under a compliant QMS — is contingent on ISO 13485 gap assessment completion and interim procedure establishment. [NEEDS INPUT: target date for RMF version 1.0 under QMS document control, tied to ISO 13485 engagement timeline — see Section 8 — Quality Management System]


---

# §11 Verification & Validation

_strategy: llm_synthesized · status: complete · cost: $0.0223_

## Verification protocol

Verification of the bioresorbable drug-eluting coronary stent addresses three principal domains: dimensional and structural integrity, mechanical performance under simulated physiological loading, and drug-elution consistency. Dimensional verification confirms strut geometry, nominal diameter, wall thickness, and radial expansion profile against design-output specifications derived from the design-controls framework (see Section 8 — Design & Manufacturing). Mechanical performance testing is conducted against ISO 25539-2, the applicable standard for coronary stents, and covers radial force, radial stiffness, foreshortening, and recoil. Fatigue characterisation under pulsatile loading reflects the cyclic demands of the coronary environment over a clinically relevant duration; specific cycle count and acceptance criteria are [NEEDS INPUT: fatigue test cycle count and pass/fail radial-force floor]. Deliverability testing — trackability, pushability, crossability — is conducted on representative vascular bench models. Drug-elution kinetics are verified against the release-rate specification across the full elution window; specific elution targets are [NEEDS INPUT: elution profile acceptance criteria (Cmax, cumulative % released at defined timepoints)]. Environmental robustness testing under IEC 60068 (temperature and humidity cycling) confirms packaging integrity and device performance after simulated distribution stress. Packaging seal-integrity results are noted here; detailed sterile-barrier validation resides in Section 14 — Sterilization Validation. All acceptance criteria for the above are traceable to design inputs as described under Design Input Traceability below.

## Validation summary

Validation establishes that the device, as manufactured, performs its intended function in conditions representative of clinical use — namely, restoring luminal patency in stenosed coronary arteries while delivering a controlled therapeutic agent to inhibit neointimal proliferation, with the implant subsequently resorbing. Because the device contacts blood-contacting vasculature for the entirety of its resorption period (implant duration greater than 30 days), the validation evidence base spans both the mechanical and pharmacological performance dimensions.

The current clinical evidence status is [NEEDS INPUT: clinical evidence status]. Where bench validation results are used to support clinical performance claims ahead of pivotal clinical data, they are framed as supportive rather than standalone validation — consistent with the Class D risk classification under the First Schedule. Full clinical validation methodology, study design, and the linkage between bench surrogates and clinical endpoints are addressed in Section 12 — Clinical Evidence & PMS.

Long-term mechanical validation is subject to the resorption kinetics of the scaffold: radial strength must be characterised not only at baseline but at intervals across the resorption timeline. Specific in-vitro resorption-profile acceptance windows are [NEEDS INPUT: radial strength retention targets at defined resorption timepoints]. Gaps between bench conditions and in-vivo environment — particularly the influence of arterial tissue response on resorption rate — are acknowledged and addressed through the clinical evidence programme referenced in Section 12.

## Design-input traceability

Design inputs — drawn from the intended use statement, applicable standards, and risk-management outputs — are mapped to design outputs and to specific V&V acceptance criteria in the design-history file. Section 8 — Design & Manufacturing owns the traceability matrix structure and the design-controls framework; the role of Section 11 is to confirm that V&V acceptance criteria correspond to each design output and, by extension, to the originating design input.

Where verification testing identifies a non-conformance or a test result approaching a specification limit, the finding is escalated through the risk management file. V&V failure modes and marginal results feed directly into Section 10 — Risk Management for severity and probability re-evaluation. This closed loop between V&V outcomes and risk controls is a standing review item at each design-review checkpoint, consistent with ISO 14971.

## Test programme

The test programme is structured across three tiers. Qualification testing is performed once per design configuration and covers the full V&V scope described above — dimensional, mechanical, fatigue, drug-elution, and environmental — before design lock. Results form the evidentiary core of this section.

Routine release testing is performed per batch and is limited to the subset of tests that detect manufacturing variation: dimensional checks, drug-loading assay, and radial force spot-check. The specific release-test panel and acceptance criteria are [NEEDS INPUT: per-batch release test list and acceptance limits]. Batch release outputs tie to Section 16 — Batch Release & QC.

Design-verification testing is triggered by any change falling within the change-control threshold defined in Section 8. The scope of re-testing is risk-ranked: changes to strut geometry or polymer composition trigger full requalification; labelling-only changes do not.

Biocompatibility evidence — cytotoxicity, haemocompatibility, and the full ISO 10993 panel appropriate to a long-term blood-contacting implant — is held in Section 13 and not duplicated here. Sterilization validation resides in Section 14. Real-time and accelerated shelf-life data are addressed in Section 15 — Stability Data.

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

_strategy: llm_synthesized · status: complete · cost: $0.0406_

## Clinical evidence status

**Tier B B5 status:** [NEEDS INPUT]

## Clinical evidence summary

For a Class D novel bioresorbable drug-eluting coronary stent, clinical evidence is the primary — and in practical terms, the mandatory — basis for demonstrating safety and performance. No predicate device has been identified (see §6 Predicate Comparison), which forecloses any substantial-equivalence argument and places the full evidentiary burden on human-subject investigation data generated for this specific device and its intended coronary artery disease indication.

The device's combination-product character — a bioresorbable scaffold with an active drug-eluting component — means clinical evidence must address both the mechanical performance of the scaffold (acute lumen gain, late lumen loss, target-lesion revascularisation) and the pharmacological safety profile of the eluted drug over the full resorption window, which in most coronary stent designs extends beyond twelve months post-implantation.

[NEEDS INPUT: clinical evidence status — confirm whether first-in-human, pilot/feasibility, or pivotal study data exists; if available, provide CTRI registration ID, ethics committee approval reference, enrolment numbers, and any published or data-on-file outcomes]

Until a pivotal investigation is completed under CDSCO clinical investigation permissions, clinical evidence for this submission will remain in a developmental stage. The strength and completeness of this section at the time of MD-7 filing will directly influence the CDSCO's licensing determination for a Class D device; early alignment with the Seventh Schedule requirements for the Clinical Investigation Plan is strongly advised.

## Evidence plan

Given the novel classification and the absence of a predicate (§6 Predicate Comparison), a prospective, multi-site pivotal clinical investigation conducted under CDSCO-granted CI permission is the expected pathway. The study should be designed as a single-arm or randomised controlled investigation — design choice subject to CDSCO and Ethics Committee alignment — enrolling adult patients with de novo coronary artery lesions meeting angiographic eligibility criteria consistent with the intended use (§3 Intended Use).

Primary endpoints should address both safety and performance: in-stent late lumen loss at [NEEDS INPUT: primary angiographic follow-up timepoint, e.g., 6 or 9 months] and major adverse cardiac events (MACE: cardiac death, target-vessel myocardial infarction, target-lesion revascularisation) at [NEEDS INPUT: primary clinical follow-up timepoint, e.g., 12 months]. Secondary endpoints should include complete bioresorption confirmation, drug pharmacokinetics at appropriate intervals, and patient-reported outcomes where feasible.

Anticipated sample size is [NEEDS INPUT: target enrolment, statistical justification basis], powered to detect a clinically meaningful difference or non-inferiority margin relative to a performance benchmark. Multi-site conduct — at a minimum three to five CDSCO-approved investigation sites — is preferred to support generalisability across the Indian patient population.

Follow-up duration should extend to at least [NEEDS INPUT: full follow-up window, typically 36–60 months for a bioresorbable platform] to capture the complete resorption timeline and any late scaffold-related events. CTRI registration is likely required before first subject enrolment; EC approval per the ICMR 2023 ethics framework must precede site initiation.

## §8.16 Animal preclinical (conditional sub-block)

The animal preclinical programme for this device — a long-term bioresorbable implant with an active drug-eluting component — is expected to satisfy DMF §8.16 requirements across four interconnected study domains, all conducted under GLP conditions.

**Implantation Model and Study Design**
The primary implantation model for a coronary stent is the porcine coronary artery model, which is recognised in cardiovascular device research as the most translationally relevant large-animal system for coronary scaffold evaluation. Study design should include [NEEDS INPUT: number of animals, stenting configuration — e.g., single-vessel or overlapping stent placement, comparator arm if any]. Endpoints include acute procedural success, angiographic patency, and histomorphometric analysis of neointimal response.

**Follow-Up Duration**
Follow-up must be matched to the full intended resorption window of the bioresorbable scaffold. For most bioresorbable coronary platforms, this requires survival endpoints at [NEEDS INPUT: key sacrifice timepoints, e.g., 28 days, 90 days, 180 days, and at or beyond the anticipated resorption endpoint]. Optical coherence tomography or micro-CT imaging at scheduled intervals is consistent with current practice.

**Pharmacokinetic and Toxicokinetic Characterisation**
Given the drug-eluting component, local vascular and systemic drug exposure must be characterised. [NEEDS INPUT: drug name, elution profile data, PK/TK study reference or status]. Plasma concentration-time profiles and tissue drug levels in target and off-target tissues support the risk assessment for systemic toxicity.

**Chronic Histopathology**
Terminal histopathology endpoints — fibrin score, inflammation grade, neointimal area, and scaffold resorption stage — feed directly into §13 Biocompatibility under ISO 10993-6 (local effects after implantation) and ISO 10993-11 (systemic toxicity), and are referenced in the ISO 14971 risk management file (§10 Risk Management).

### Animal preclinical attestation
- [ ] GLP-compliant animal study protocol on file
- [ ] Implant-model + species rationale documented
- [ ] Follow-up duration aligned with intended-use exposure
- [ ] Chronic histopathology endpoints linked to §13 biocompatibility
- [ ] Pharmacokinetic / toxicokinetic data (if drug-eluting) linked to §13 ISO 10993-16/-17
- [ ] EC + IAEC clearances on file (where applicable)

## Clinical investigation pathway (MD-22 → MD-23)

For a novel Class D implantable with no predicate, the clinical investigation pathway under MDR 2017 runs in a defined sequence. The manufacturer first files MD-26 (application for pre-permission to conduct clinical investigation of a novel device) and obtains MD-27 (pre-permission grant) from CDSCO before initiating any site-level activity. Following MD-27, the MD-22 application (clinical investigation permission) is submitted alongside the full Clinical Investigation Plan and Investigator's Brochure prepared in accordance with the Seventh Schedule. CDSCO's grant of MD-23 authorises conduct of the investigation.

CTRI registration is likely required before the first subject is enrolled — this is a hard pre-enrolment condition, not an administrative formality. Ethics Committee approval per the ICMR 2023 framework must be in place at each investigation site before site initiation. On completion of the investigation and preparation of the clinical evaluation report, the MD-7 marketing authorisation application is filed, with MD-9 as the anticipated grant instrument.

See §4 Classification & Pathway for the full regulatory sequence and §6 Predicate Comparison for the novel-device basis driving this pathway.

## Post-market surveillance plan

**Complaint Handling**
All field complaints — whether received from implanting centres, patients, or third-party service agents — will be logged within 24 hours of receipt into the complaint management register. Triage against a pre-defined severity matrix will determine whether an event qualifies as a reportable adverse event or a non-reportable quality complaint. Root-cause analysis will be initiated within five business days of classification, with a target of 30-day closure for confirmed root causes and documented CAPA outcomes. Complaints that cannot be closed within this window will be escalated to the Quality Head and flagged in the next periodic PMS report. The complaint handling procedure interfaces directly with the risk management file (§10).

**Adverse-Event Reporting**
Reportable adverse events involving the device will be submitted to CDSCO using the applicable statutory forms: MD-42 for manufacturer-initiated adverse event reporting, MD-43 for periodic post-market surveillance reports, and Form-25 for device adverse event reporting at the site level. Serious adverse events — including device-related death, life-threatening injury, or unanticipated serious deterioration in patient health — are subject to the 15-day mandatory reporting window under the Sixth Schedule of MDR 2017. Non-serious but device-related events will be captured in the periodic PMS cycle. Field safety corrective actions, where warranted, will be coordinated with the CDSCO-notified vigilance officer.

**Periodic Reporting and PSUR Cadence**
Post-launch periodic safety update reports will be submitted on a 6-monthly basis for the first two years following market authorisation, transitioning to an annual cycle thereafter unless CDSCO specifies otherwise or the benefit-risk profile warrants more frequent review. Each PSUR will consolidate complaint data, adverse event summaries, published literature surveillance, and updated benefit-risk conclusions.

## Vigilance reporting framework

The Sixth Schedule of MDR 2017 governs vigilance obligations for this Class D device. Three reporting instruments apply: MD-42 is the manufacturer's primary adverse event notification form, triggered by any event meeting the serious adverse event definition — submission is likely required within 15 days of the manufacturer becoming aware of the event. MD-43 covers periodic post-market surveillance reporting and is submitted on the 6-monthly / annual PSUR cadence described in the PMS plan. Form-25 captures device adverse events reported at the clinical site level and should be completed by the implanting institution. All submissions are directed to CDSCO; copies are retained in the Device History Record.

## Post-market clinical follow-up (PMCF)

Given the Class D classification and the novel bioresorbable design, structured Post-Market Clinical Follow-up is expected as a condition of market authorisation. For the first 24 months post-launch, a quarterly PMCF review cadence is appropriate, drawing on systematic registry data from implanting centres, periodic literature surveillance, and any long-term follow-up data generated under the pivotal investigation protocol.

PMCF triggers warranting an unscheduled review include any cluster of unexpected adverse events, a signal emerging from the complaint handling process, or new published evidence materially affecting the benefit-risk profile. PMCF outputs feed directly into the risk management file update cycle (§10 Risk Management), and any identified risk requiring design or labelling change is subject to the CAPA and change-control procedure.

## Cross-references

- §3 Intended Use — target population + intended-use claim
- §6 Predicate Comparison — no-predicate / has-predicate basis for clinical evidence expectation
- §10 Risk Management — clinical findings + PMCF feed the ISO 14971 hazard register
- §13 Biocompatibility — chronic toxicity + leachables data
- §4 Classification & Pathway — MD-22 / MD-23 sequence for novel devices

---

# §13 Biocompatibility (ISO 10993)

_strategy: llm_synthesized · status: pending · cost: $0.0000 · ERROR: Connection error._

## Tier overview

| Field | Value |
|---|---|
| ISO 10993-1 category | Implant — tissue/bone OR blood (long-term) |
| Q9 patient_contact (wizard-explicit) | implant_gt_30d |
| Default contact duration | long_term |
| Add-on panels applied | drug-eluting, bioresorbable / biodegradable |
| Lab-evidence requirement | NABL-accredited test reports |

## Why this tier applies

Patient-contact value Q9 = `implant_gt_30d` places this device in the ISO 10993-1:2018 Annex A category "Implant — tissue/bone OR blood (long-term)". The test panel below is the selection that category requires; CDSCO reviewers cross-check against ISO 10993-1 Annex A and expect test reports from a NABL-accredited lab. [NEEDS INPUT: device-specific rationale paragraph — narrative LLM call did not complete this run]

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

Drug-eluting devices add ISO 10993-17 (allowable limits) and -18 (extended chemical characterization) for drug + carrier extractables, plus 10993-16 toxicokinetic study design. The device is also treated as a combination product — see §8 Design & Manufacturing for the §8.12 medicinal substances sub-block and §19 Conditional NOCs for the DCG(I) joint review.

## Bioresorbable overlay

Bioresorbable devices add ISO 10993-9 (degradation framework), -13/-14/-15 (degradation products per matrix class — polymeric / ceramic / metallic), and -16 (toxicokinetic study design). The matrix material class is likely required to pick between -13/-14/-15. [NEEDS INPUT: device matrix material class — polymer / ceramic / metal]

## Sequencing with adjacent sections

§13 testing typically begins after material selection in §8 Design & Manufacturing, runs in parallel with §15 Stability Data (accelerated-aging samples often double as the leachables source for -17 / -18), and feeds §10 Risk Management (ISO 14971 hazard analysis). For sterile devices, §14 Sterilization Validation precedes final §13 testing because the sterilization process can change leachables profiles.

## Cross-references

- §8 Design & Manufacturing — materials list + manufacturing process
- §10 Risk Management — ISO 14971 hazard register receives biocomp findings
- §14 Sterilization Validation — must precede final biocomp testing for sterile devices
- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source
- §8.12 Medicinal substances sub-block (in §8) — drug component dossier
- §19 Conditional NOCs — DCG(I) joint review for combination product

---

# §14 Sterilization Validation

_strategy: llm_synthesized · status: pending · cost: $0.0000 · ERROR: Connection error._

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

_strategy: llm_synthesized · status: pending · cost: $0.0000 · ERROR: Connection error._

## Which NOCs apply to this device

Based on the device profile, the following conditional NOCs apply: DCG(I) joint review (combination product). Each is an overlay on the main MD-3 / MD-7 manufacturing-licence path; the evidence packages and timing notes follow. [NEEDS INPUT: device-specific framing paragraph — narrative LLM call did not complete this run]

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

## Sequencing notes

Most NOC documents accompany the MD-3 / MD-7 submission rather than being separate pre-licence applications. DCG(I) review runs in parallel with the main application; BARC NOC is filed before MD-3 / MD-7; AERB approval is operational and follows post-grant. Identify the applicable NOC blocks above, gather the evidence packages in parallel with QMS / DMF / PMF work, and file together with the manufacturing-licence application.

## Cross-references

- §8 Design & Manufacturing — §8.12 medicinal substances sub-block
- §13 Biocompatibility — ISO 10993-17 allowable limits
- §12 Clinical Evidence — combination-product clinical data
- §4 Pathway — main MD-3 / MD-7 manufacturing-licence path

---
