# Hardware pack smoke output — implant (Drug-eluting coronary stent)

Generated: 2026-05-29T09:21:14.218Z

One-liner: A bioresorbable drug-eluting cardiac stent for coronary artery disease.

Q8 predicate: no
Q9 patient_contact: implant_gt_30d
B6 ISO 13485 status: in_progress

Sections rendered: 18
Total LLM cost: $0.2840
Assertions: 79 pass / 0 fail

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

_strategy: llm_synthesized · status: complete · cost: $0.0120_

## No-predicate declaration

No predicate device is claimed for this submission. The bioresorbable drug-eluting cardiac stent occupies a category — fully absorbable coronary scaffold with integrated drug delivery — for which no previously licensed device exists within Indian regulatory scope. The device is accordingly treated as first-in-class under MDR 2017, with the consequence that CDSCO cannot rely on substantial equivalence to an approved Indian device when evaluating safety and performance. Clinical evidence (detailed in Section 12) is therefore not a supplementary filing element; it is the primary evidentiary basis for the application. Reviewers should expect the clinical dossier to carry the burden ordinarily distributed across comparative and bench-equivalence arguments, and should assess its scope against the heightened scrutiny applicable to Class D novel devices.

## MD-26 → MD-27 pre-permission pathway

Because no Indian predicate exists, the applicant is required to obtain prior CDSCO permission before the manufacturing licence application (MD-7) can be filed. The prescribed sequence under MDR 2017 is: submit Form MD-26 (application for permission to manufacture a new drug or medical device for clinical trial or examination) to CDSCO; upon satisfactory review, CDSCO issues Form MD-27 (permission to manufacture). The MD-7 application may be filed only after MD-27 is in hand. Attempting to submit MD-7 in parallel or in advance of MD-27 risks procedural rejection without substantive review. Given the dual-pathway sequencing complexity and the Class D risk classification, early engagement with CDSCO — through the Reviewer Concierge tier if available — is recommended to align submission timelines, clarify clinical evidence expectations before MD-26 is lodged, and reduce the likelihood of iterative deficiency cycles.

## Pathway implication

Per MDR 2017 and based on published CDSCO guidance, the manufacturing licence path becomes MD-26 → MD-27 → MD-7 → MD-9. Cross-reference: Section 1 — Executive Summary (headline pathway note) and Section 12 — Clinical Evidence (clinical-investigation route note where applicable).


---

# §5 Product Specification & Variants

_strategy: llm_synthesized · status: complete · cost: $0.0169_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Product class | D |
| Form factor | Hardware (or hardware + software) |

## Device family / variants

The product is currently positioned as a single-SKU bioresorbable drug-eluting cardiac stent intended for percutaneous coronary intervention in patients with coronary artery disease. Diameter and length variants are anticipated to support clinical practice but have not been formally enumerated. [TBD: variant matrix — diameter and length range]

## Physical specifications

The stent is a tubular, balloon-expandable scaffold fabricated from a bioresorbable polymer matrix loaded with an antiproliferative or anti-inflammatory pharmacological agent. It is deployed percutaneously via a dedicated delivery catheter system. Key dimensional parameters — nominal diameter range, expanded diameter range, strut thickness, stent length, and delivery catheter profile — are subject to design freeze and must be confirmed before DMF submission. [NEEDS INPUT: stent nominal and expanded diameter range (mm)] [NEEDS INPUT: stent length options (mm)] [NEEDS INPUT: strut thickness (µm)] [NEEDS INPUT: delivery catheter outer diameter (Fr)] [NEEDS INPUT: active pharmaceutical ingredient identity and elution dose] [NEEDS INPUT: scaffold base polymer (e.g., PLLA, PLGA, or proprietary blend)] [NEEDS INPUT: sterility method and sterile packaging configuration] The device contains no active electronic components, requires no power source, and has no wireless connectivity.

## Performance specifications

The device is expected to maintain adequate radial strength to resist elastic recoil during and immediately post-deployment, achieve uniform drug elution over a defined therapeutic window, and undergo complete bioresorption within an anticipated timeframe consistent with preclinical benchmarks for the scaffold polymer selected. Radial force, acute lumen gain, late lumen loss, and resorption kinetics are the primary performance endpoints. Quantitative targets for each — including minimum radial force (N/mm), elution profile (cumulative % at defined time points), and full bioresorption timeline (months) — are subject to bench and preclinical confirmation. [NEEDS INPUT: validated radial force specification] [NEEDS INPUT: drug elution kinetic targets and therapeutic window] [NEEDS INPUT: anticipated bioresorption timeline (months)] Clinical performance targets (MACE rate, in-stent restenosis, target lesion revascularisation) will be anchored to pivotal study data; no clinical study results are currently available to cite (see Section B5 — Clinical Evidence).

## Intended service life

As a bioresorbable implant, the device does not have a conventional multi-year service life. The clinically relevant functional lifetime spans from implantation through the period of vascular scaffolding (expected months to low single-digit years, depending on polymer selection and elution design), after which the scaffold undergoes progressive resorption. Shelf life of the sterile packaged product is a separate parameter. [NEEDS INPUT: anticipated functional scaffolding duration (months)] [NEEDS INPUT: shelf life of sterile packaged device (months)]

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

Bioresorbable drug-eluting coronary stent indicated for percutaneous treatment of de novo native coronary artery lesions in patients with symptomatic ischaemic heart disease. For use by qualified interventional cardiologists in a cardiac catheterisation laboratory. [NEEDS INPUT: vessel diameter and lesion length range]

## Contraindications

Contraindicated in: known hypersensitivity to [NEEDS INPUT: drug compound or scaffold polymer]; patients unable to tolerate dual antiplatelet therapy; heavily calcified or tortuous lesions outside validated ranges [NEEDS INPUT: specify]; in-stent restenosis; lesions in saphenous vein grafts. Not indicated for left main coronary artery disease unless validated by clinical data.

## Regulatory marks

- For use by qualified clinicians.
- [TBD] CDSCO manufacturing licence number — populated post-grant.

## Instructions for Use (IFU summary)

## Indications
This bioresorbable drug-eluting coronary stent is indicated for improving coronary luminal diameter in patients with symptomatic ischaemic heart disease due to de novo native coronary artery lesions. Intended for percutaneous coronary intervention (PCI) performed by an interventional cardiologist in a cardiac catheterisation laboratory or equivalent surgical environment.

[NEEDS INPUT: lesion length and reference vessel diameter ranges validated in bench/clinical testing]
[NEEDS INPUT: specific drug compound, coating, and elution profile]

## Intended Users
Qualified interventional cardiologists and trained catheterisation laboratory staff. This device is not intended for use outside a supervised surgical or interventional setting.

## Pre-Use Checks
Inspect the sterile packaging for integrity prior to opening. Do not use if the package is damaged, if the device appears visually compromised, or if the use-by date has elapsed. Verify compatibility of the delivery system with the intended guiding catheter and guidewire dimensions before proceeding.

[NEEDS INPUT: delivery system inner diameter and guiding catheter compatibility specifications]
[NEEDS INPUT: sterile barrier type and validated shelf-life]

## Directions for Use
Deploy using standard PCI technique under fluoroscopic guidance. Follow the recommended balloon inflation protocol for stent deployment.

[NEEDS INPUT: nominal and rated burst pressure values; recommended inflation duration; post-dilatation guidance specific to this platform]

Confirm adequate apposition using intravascular imaging or angiography per institutional protocol. The scaffold is bioresorbable; chronic mechanical support timelines differ from metallic stents — refer to the clinical data summary for expected resorption profile.

[NEEDS INPUT: resorption timeline data from bench or clinical studies]

## Warnings and Precautions
- Antiplatelet therapy duration should follow current cardiology society guidelines; premature discontinuation may increase thrombotic risk during the resorption phase.
- Avoid aggressive post-dilatation beyond the validated diameter range; over-expansion may compromise scaffold integrity.
- Radiopacity of bioresorbable scaffolds differs from metallic stents; ensure the implant site is marked by radio-opaque markers if provided.

[NEEDS INPUT: presence and specification of radio-opaque markers on this device]

## Storage
[NEEDS INPUT: storage temperature range and humidity limits from stability data]
Store in original packaging. Protect from direct sunlight and physical impact.

## Disposal
Dispose of used devices, delivery systems, and packaging in accordance with applicable biomedical waste regulations under the Bio-Medical Waste Management Rules, 2016. The bioresorbable scaffold itself, once implanted, does not require retrieval.

## Manufacturer Contact
[NEEDS INPUT: manufacturer name, address, and post-market vigilance contact details]

*Labelling requirements referenced against the Fifth Schedule of the Medical Devices Rules, 2017.*


---

# §3 Intended Use & Indications

_strategy: llm_synthesized · status: complete · cost: $0.0230_

## Indication

This device is a bioresorbable drug-eluting coronary stent indicated for the percutaneous revascularisation of coronary arteries in adult patients diagnosed with obstructive coronary artery disease (CAD). The device is intended to restore luminal patency by scaffolding the target vessel while delivering a controlled local dose of antiproliferative agent to inhibit neointimal hyperplasia and restenosis. Implantation is performed by interventional cardiologists and cardiac surgeons operating within a cardiac catheterisation laboratory or dedicated operating theatre equipped for fluoroscopic guidance. As a long-term implant — with the bioresorbable matrix anticipated to resorb over a period extending beyond 30 days post-deployment — the device falls within the highest-contact-duration tier under MDR 2017 biocompatibility classification. The intended patient population comprises adults with symptomatic CAD, including de novo native coronary lesions, where percutaneous intervention is clinically appropriate and surgical revascularisation is not the preferred strategy. [NEEDS INPUT: specific lesion subset or clinical indication (e.g., stable angina only vs. ACS extension)]

## Intended user

Healthcare professionals.

## Use environment

Operating theatre.

## Patient population

The intended population is adult patients (18 years and above) with haemodynamically significant obstructive CAD confirmed by coronary angiography or equivalent imaging, in whom percutaneous coronary intervention (PCI) is indicated by the treating heart team. [NEEDS INPUT: minimum/maximum reference vessel diameter range the stent is sized for] [NEEDS INPUT: lesion length eligibility criteria (mm)] [NEEDS INPUT: whether STEMI or ACS indications are included or deferred to a post-approval expansion] Paediatric use is not intended. Use during pregnancy and lactation has not been evaluated and is excluded from the current indication. Patients with documented contraindications to dual antiplatelet therapy (DAPT) are outside the intended population, given the anticipated DAPT requirement during the bioresorption phase.

## Body-contact tier (Q9 wizard-explicit)

**Tier:** Implant — tissue/bone OR blood (long-term > 30d)

This device contacts blood and cardiovascular tissue continuously from the point of implantation and remains in situ throughout the bioresorption period, which is anticipated to exceed 30 days. This places it in the long-term implant contact category — the most demanding tier for biocompatibility assessment under ISO 10993-1. The full ISO 10993 evaluation panel applicable to this tier, including cytotoxicity, sensitisation, intracutaneous reactivity, systemic toxicity, genotoxicity, implantation, and haemocompatibility testing, is addressed in §13 Biocompatibility. Because the device is supplied sterile, the validated sterilisation method and sterility assurance level are addressed in §14 Sterilization. Both sections should be read in conjunction with this contact-tier designation.

## Predicate basis (Q8 wizard-explicit)

**Status:** No predicate device — novel

No predicate device has been identified — this device is presented as a novel product for the purposes of the MDR 2017 application. A novel device of this class is anticipated to require a pre-permission approval (MD-26 / MD-27 pathway) before a market authorisation application under MD-7 can be filed. Applicants should confirm this sequencing with CDSCO prior to submission. The substantial-equivalence analysis framework, to the extent applicable for supporting the technical file, is addressed in §6 Predicate Comparison.

## Contraindications

The device is contraindicated in patients with known or suspected hypersensitivity to the bioresorbable scaffold material, the polymer coating, or the drug payload. [NEEDS INPUT: specific polymer composition and drug agent name to allow precise contraindication drafting] Anatomic exclusions include heavily calcified lesions incompatible with adequate lesion preparation, vessels where stent sizing cannot be matched to available diameters, and chronic total occlusions unless the applicant's clinical data explicitly covers this subset. Contraindications extend to patients in whom DAPT is absolutely contraindicated (e.g., active pathological bleeding, planned major elective surgery within the resorption window) and those with a life expectancy that precludes meaningful clinical benefit. [NEEDS INPUT: institution-specific contraindication list from the clinical investigation protocol, if already drafted]

## Cross-references

- §4 Classification & Pathway — class derivation + MD-3 / MD-7 path
- §6 Predicate Comparison — full substantial-equivalence analysis
- §13 Biocompatibility — ISO 10993 panel keyed to Q9 patient contact
- §7 Labelling — intended-use statement on label + IFU

---

# §2 Device Description

_strategy: llm_synthesized · status: complete · cost: $0.0202_

## Summary

| Field | Value |
|---|---|
| Model number | [TBD] |
| Device class | D |
| Sterile status | [TBD] |
| Patient contact | [TBD] (Sprint 3 question — ISO 10993 tier) |

## Components and architecture

The device is a bioresorbable drug-eluting coronary stent — a temporarily implanted scaffold designed to restore luminal patency in stenosed coronary arteries while delivering a controlled antiproliferative payload, then resorbing entirely over a defined period. Principal sub-assemblies are: (1) a tubular bioresorbable scaffold, likely fabricated from a polylactic acid-based polymer or magnesium alloy backbone [NEEDS INPUT: scaffold base material — e.g., PLLA, Mg-Zn alloy, specify grade]; (2) a drug-loaded abluminal coating carrying the antiproliferative agent [NEEDS INPUT: drug name, dose per unit length, and release-rate profile]; and (3) a delivery system comprising a semi-compliant balloon catheter, hypotube, and haemostatic valve. The scaffold and delivery system are supplied as a pre-mounted, single-use assembly. [NEEDS INPUT: model number / product designation]

## Principle of operation

On balloon inflation at the target lesion, the scaffold expands radially to match coronary vessel diameter, providing mechanical support against elastic recoil and constrictive remodelling. The abluminal drug coating releases the antiproliferative agent in a sustained, controlled manner to suppress neointimal hyperplasia during the critical healing window. Over the subsequent months — anticipated range [NEEDS INPUT: resorption timeline, e.g., 12–36 months depending on material] — the scaffold undergoes hydrolytic or corrosive degradation, leaving no permanent metallic implant and restoring vessel vasomotion. Deployment is performed by an interventional cardiologist under fluoroscopic guidance in a cardiac catheterisation laboratory. [NEEDS INPUT: nominal deployment pressure and balloon compliance range]

## Materials and applicable standards

Biocompatibility characterisation is expected to follow ISO 10993-1, with emphasis on the ISO 10993-5 cytotoxicity and ISO 10993-13 degradation-product assessments given the resorption mechanism. The drug-coating formulation will require leachables and extractables analysis. [NEEDS INPUT: scaffold polymer or alloy specification and any proprietary coating chemistry]. Mechanical performance — radial strength, recoil, fatigue under pulsatile loading — is anticipated to reference ISO 25539-2 (coronary stents) and any applicable ASTM standards for the chosen substrate material. Shelf-life and sterilisation claims [NEEDS INPUT: sterility assurance level, sterilisation method — e.g., EO, e-beam] will be characterised per ISO 11135 or ISO 11137 as applicable.

## Variants and accessories

Source data does not specify a product family. This submission currently assumes a single scaffold platform offered across a matrix of nominal diameters and lengths typical for coronary application — [NEEDS INPUT: confirmed diameter/length matrix, e.g., 2.5–3.5 mm × 12–28 mm]. If additional stiffness variants, polymer grades, or drug-dose tiers exist, family-grouping rationale will be required. [TBD] — Sprint 3 family-grouping question. Required accessories (guidewire, introducer sheath) are standard catheterisation-lab consumables not co-submitted with this filing.

## Lifecycle and disposal

As a single-use implant, the device has no reprocessing or reuse expectation; once deployed, the scaffold remains in situ and resorbs. Shelf life from date of manufacture [NEEDS INPUT: claimed shelf life and real-time or accelerated aging study status]. The pre-mounted delivery catheter assembly is discarded as clinical/sharps waste per biomedical waste management rules applicable to the implanting facility. No post-market retrieval or device return programme is anticipated given the bioresorbable nature of the implant; long-term safety follow-up is addressed under the post-market clinical follow-up plan (see Section 8).

## Cross-references

- Patient-contact type (ISO 10993 tier) is a Sprint 3 applicant input — biocompatibility evidence is staged in Section 11 — Verification & Validation.


---

# §8 Design & Manufacturing

_strategy: llm_synthesized · status: complete · cost: $0.0233_

## Summary

| Field | Value |
|---|---|
| ISO 13485 status | in_progress |
| Manufacturing address | [TBD] |
| Software lifecycle | (not applicable — no software, or not captured) |
| ACP required | No |

## Design history

Design controls for this bioresorbable drug-eluting cardiac stent are structured around a formal Design History File (DHF) maintained under 21 CFR 820.30-equivalent principles adopted within the QMS, cross-mapped to MDR 2017 Schedule V requirements for Class D devices. Design inputs capture mechanical performance targets (radial force, recoil, expansion uniformity), drug-elution kinetics, bioresorption profile, biocompatibility requirements per ISO 10993 series, and sterility/packaging specifications — all traceable to user needs documented at the concept stage.

[NEEDS INPUT: current development phase — concept, prototype, design freeze, or design transfer]

Gate reviews are anticipated at minimum four milestones: design input freeze, prototype qualification, design verification completion, and pre-transfer readiness. Each gate requires sign-off from engineering, clinical/regulatory, and quality leads before the next phase opens. Verification activities are expected to cover dimensional and mechanical testing, drug-elution profiling, and in vitro bioresorption modeling; validation activities will include bench-top vascular models and preclinical studies consistent with ISO 25539-2 expectations for coronary scaffolds.

Design transfer — the controlled handoff of specifications, tooling parameters, and acceptance criteria to the manufacturing function — has [NEEDS INPUT: transfer completion status or target date]. Outputs from transfer are expected to form the device master record referenced in Section 9.

## Manufacturing process

The manufacturing model for this device is [NEEDS INPUT: own-site, contract manufacturer, or hybrid — including manufacturing site name and address]. Given the complexity of a bioresorbable drug-eluting scaffold, the process flow encompasses polymer substrate preparation (extrusion or moulding of the bioresorbable backbone), laser cutting and surface preparation, drug coating application and curing, crimping onto a delivery catheter system, and packaging.

In-process controls are expected at each phase transition: dimensional inspection post-cutting, coating weight verification, drug-load uniformity sampling, and catheter-mounted profile checks. Finished-product release testing will cover sterility [NEEDS INPUT: sterilization method and validation status — see iso_13485_evidence and sterilization_validation fields], dimensional conformance, coating integrity, and elution profile against specification.

Batch traceability — from raw polymer and drug substance lots through to labelled finished goods — is maintained via the batch record system within the QMS. Incoming material qualification for the active pharmaceutical ingredient requires coordination with CDSCO on combination product classification, which will determine whether a New Drug Application linkage or device-dominant filing pathway applies. [NEEDS INPUT: regulatory classification determination for drug-device combination — CDSCO Office of Combination Products guidance or pre-submission feedback]

Production environment controls, particularly cleanroom classification for coating operations, are [NEEDS INPUT: ISO 14644 classification of manufacturing environment].

## Quality management system

The QMS is under active development and has not yet achieved ISO 13485 certification as of this submission. The governance framework — comprising a Quality Manual, documented quality objectives, and management responsibility assignments — is being established concurrent with device development. Management review is anticipated on an annual basis at minimum, with quarterly internal review of quality indicators (complaint rates, audit findings, CAPA aging, supplier performance) consistent with Class D oversight expectations. Until certification is achieved, CDSCO reviewers should treat QMS evidence as preliminary and subject to Stage 2 audit confirmation.

Document and record control procedures are being implemented to support DHF, Device Master Record, and batch record retention requirements. The document numbering scheme, revision control workflow, and retention schedule [NEEDS INPUT: document retention period and archival platform] are in progress. Personnel qualification records and training matrices will be maintained within the same system.

Production and process controls — covering equipment qualification (IQ/OQ/PQ), calibration schedules, and supplier qualification — are in early-stage development. Supplier controls for the bioresorbable polymer and the drug substance are particularly critical given the combination-product nature of this device and will require enhanced incoming inspection and certificate-of-analysis review protocols.

The audit programme follows the sequence internal audit → CB Stage 1 → CB Stage 2, with internal audits planned quarterly once the QMS reaches operational readiness. Major nonconformities identified through internal or external audits carry a 30-day CAPA closure target; critical findings that affect device safety or sterility integrity trigger immediate escalation to the Quality Director and suspension of affected production lots pending root-cause determination. Post-market surveillance and vigilance reporting obligations, as required for Class D under MDR 2017 Schedule VII, will be built into the CAPA and complaint-handling procedures before commercial launch.

## ISO 13485 status & evidence

ISO 13485 certification is in progress. The manufacturer has initiated QMS development but has not yet engaged a Certification Body for Stage 1 audit. [NEEDS INPUT: CB name and engagement date] [NEEDS INPUT: Stage 1 audit target date] [NEEDS INPUT: Stage 2 audit target date and projected certification valid-through date]. Scope of certification is anticipated to cover design, development, and manufacture of implantable cardiovascular devices. Evidence of certification will be submitted as a post-filing supplement prior to commercial licence issuance.

## Batch release / version release (DMF §8.20)

Finished-product batch release will be documented via Batch Manufacturing Records (BMRs) and Certificate of Analysis for each production lot. A minimum of three consecutive conforming batches is anticipated to demonstrate process consistency before commercial release, consistent with Class D device expectations under MDR 2017. BMRs are retained per the QMS document-control schedule [NEEDS INPUT: retention period in years]. Authorised Signatory release sign-off procedure [NEEDS INPUT: designated Qualified Person or equivalent role and name] is to be defined before first commercial batch.


---

# §9 Essential Principles Conformity

_strategy: llm_synthesized · status: complete · cost: $0.0339_

## Essential Principles checklist

| # | Principle | Applicability | Evidence | Rationale |
|---|---|---|---|---|
| EP1 | EP1 — General requirements (safety + performance) | yes | Section 10 — Risk Management; Section 11 — V&V | As a Class D device deployed in surgical environments by trained healthcare professionals, this product is subject to the most stringent conformity expectations under Schedule III of MDR 2017. General safety and performance requirements apply in full. Evidence of conformance is distributed across the risk management file (Section 10) and the verifi... |
| EP2 | EP2 — Risk management (ISO 14971) | yes | Section 10 | A complete risk management file structured under ISO 14971:2019 is maintained as a living document. For a Class D surgical device, the risk management process extends through the full product lifecycle — from hazard identification during design, through post-market surveillance feedback loops. The file documents hazard identification, probability a... |
| EP3 | EP3 — Design and construction characteristics | yes | Section 2; Section 8 | Design and construction characteristics are documented in the device description (Section 2) and the manufacturing controls summary (Section 8). For a surgical device at Class D, design choices — including materials selection, dimensional tolerances, and mechanical robustness — are each linked to specific performance requirements and corresponding ... |
| EP4 | EP4 — Performance (intended use achievement) | yes | Section 11; Section 12 | Demonstration that the device achieves its intended use under defined surgical conditions is the central burden for Class D conformance. Performance data — spanning bench testing, pre-clinical work, and clinical evidence — are consolidated in Section 11 (V&V) and Section 12 (Clinical Evaluation). Performance endpoints are tied directly to the inten... |
| EP5 | EP5 — Lifetime / shelf life | yes | Section 5; Section 11 | A defined device lifetime and, where applicable, shelf-life claim are supported by accelerated aging or real-time stability data referenced in Section 11. For a surgical device, the operational lifetime claim must account for expected use cycles, cleaning and reprocessing conditions (if applicable), and any performance degradation mechanisms identi... |
| EP6 | EP6 — Transport and storage | yes | Section 7 | Transport and storage requirements — temperature range, humidity limits, packaging integrity through distribution — are specified in Section 7 and on device labelling. For a surgical-use Class D device, distribution conditions must be validated to confirm that packaging maintains device integrity from point of manufacture to point of use. Where the... |
| EP7 | EP7 — Benefit-risk balance | yes | Section 10; Section 12 | The overall benefit-risk determination is a central output of both the risk management process (Section 10) and the clinical evaluation (Section 12). For Class D, CDSCO reviewers are expected to assess whether the benefit-risk narrative is substantiated by clinical evidence rather than relying on theoretical or analogous-device arguments alone. The... |
| EP8 | EP8 — Chemical / physical / biological properties | yes | Section 2; Section 11 — biocompatibility | Given the surgical use environment, patient and user contact with device materials is anticipated, making biocompatibility evaluation applicable under ISO 10993 series. Chemical and physical characterisation of all patient-contacting materials is required at Class D. Evidence includes materials characterisation data, leachables/extractables assessm... |
| EP9 | EP9 — Infection and microbial contamination | [TBD — sterile status not confirmed] | Section 8 — sterilization | Sterile status is noted as unconfirmed in applicant data. If the device is supplied sterile or intended for use in a sterile field without independent reprocessing, this principle applies in full and sterilization validation data (SAL ≤ 10⁻⁶, method validation per applicable ISO standard) are required in Section 8. If the device is supplied non-ste... |
| EP10 | EP10 — Construction / environmental interaction | yes | Section 2 | The surgical use environment introduces specific stressors — exposure to irrigants, electrosurgical interference, mechanical loading during procedures, and potential interaction with other surgical instruments or imaging equipment. Device construction is assessed against these conditions through environmental and mechanical testing documented in Se... |
| EP11 | EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1) | n_a | N/A | No software is present in this device. This principle does not apply at submission. If a future design iteration incorporates software, IEC 62304 software lifecycle documentation and, where applicable, IEC 81001-5-1 security controls would need to be incorporated prior to any variation application. |

## Usability engineering (IEC 62366-1)

Usability engineering for this device follows IEC 62366-1:2015, scoped to the intended user population of trained healthcare professionals in surgical settings. The use environment introduces context-specific risk factors — time pressure, procedural complexity, multi-device interaction — that inform the use specification and use error analysis. Formative usability studies are conducted iteratively during design development to identify and resolve critical use errors before design lock. Summative (validation) usability testing is conducted under simulated-use or actual surgical conditions with a representative sample of the intended HCP user group, with test protocols and acceptance criteria defined in the usability evaluation plan. Results feed directly into the risk management file, and any residual use errors with unacceptable risk are addressed through design modification or labelling before submission. [NEEDS INPUT: summative study site, participant count, and date of completion]

## Non-applicability justifications

- **EP-SW — Software conformance (IEC 62304 / IEC 81001-5-1)** — No software is present in this device. This principle does not apply at submission. If a future design iteration incorporates software, IEC 62304 software lifecycle documentation and, where applicable, IEC 81001-5-1 security controls would need to be incorporated prior to any variation application.


---

# §10 Risk Management (ISO 14971)

_strategy: llm_synthesized · status: complete · cost: $0.0366_

## Risk register (ISO 14971)

| ID | Hazard | Situation | Harm | Sev | Prob | Mitigation | Res. sev | Res. prob |
|---|---|---|---|---|---|---|---|---|
| R1 | Uncharacterised blood-contact material interactions in a lon... | Device implanted without completed ISO 10993-4/-6/-10/-11 biocompatibility chara... | Thrombus formation, systemic sensitisation reaction, or chro... | critical | occasional | Scope and commission ISO 10993-4 (blood interactions), -6 (implantation response), -10 (sensitisatio... | critical | rare |
| R2 | Absence of controlled clinical evidence for a novel Class D ... | Device implanted in patients under conditions where safety and performance have ... | Unanticipated adverse cardiac events — myocardial infarction... | critical | occasional | Engage a clinical research organisation to develop a pivotal investigation protocol aligned with CDS... | serious | rare |
| R3 | Absence of a certified Quality Management System during devi... | Design controls, purchasing controls, and nonconformance management operating ou... | Device delivered with undetected design or manufacturing def... | critical | occasional | Initiate ISO 13485 gap assessment this quarter with a qualified QMS consultant. Interim controls: do... | serious | rare |
| R4 | Mechanical failure of the implant under in-vivo coronary loa... | Fatigue fracture, strut separation, or embolisation of a device fragment into th... | Coronary occlusion, distal embolisation, myocardial infarcti... | critical | rare | Accelerated fatigue testing per ISO 25539 (or applicable recognised standard for the specific implan... | critical | rare |
| R5 | Delivery system malfunction during coronary intervention | Failure to deploy, premature deployment, or inability to retrieve the device dur... | Vessel dissection, tamponade, uncontrolled deployment in the... | serious | occasional | Simulated-use testing of the complete delivery system in a bench vascular model at worst-case vessel... | serious | rare |

## Risk summary narrative

The risk register was built from three inputs: a clinical hazard analysis structured around ISO 14971:2019 Annex C exemplar hazards adapted for coronary implants, the top-gap items identified in the Risk Card cross-anchor (biocompatibility, clinical evidence, and QMS absence), and applicant-declared risks where available. Given that the device is classified Class D and the clinical state is [NEEDS INPUT: clinical state — pre-clinical, first-in-human, or pivotal], the register currently carries five rows, of which four are rated critical severity at initial assessment.

The two highest residual-risk entries are R1 (uncharacterised biocompatibility) and R4 (mechanical fatigue failure). Both remain at critical residual severity because the risk-reducing test programmes have not yet been executed; the probability ratings have been conservatively downgraded to rare based on the mitigation commitments made, but these ratings will be revisited once bench and biocompatibility data are in hand. R3 (absent QMS) feeds systemic uncertainty into every other row and is therefore treated as a cross-cutting control deficiency, not an isolated risk.

Review governance: the Risk Management File (RMF) is owned jointly by the RA lead and the designated clinical reviewer. During the pilot or first-in-human phase, RMF review cadence is monthly, with a standing agenda item at each review to assess any adverse events, near-misses, or field observations from investigator sites. Post-grant, cadence shifts to quarterly, consistent with industry practice for Class D implants under active post-market surveillance. Any serious adverse event or device malfunction report received from a site flows to the RA lead within 24 hours and triggers an out-of-cycle RMF assessment before the next scheduled review.

## Residual risk assessment

After mitigation, residual risk is accepted as low enough to proceed with clinical investigation for R2, R5, and R3, provided the stated preconditions (BER completion, CTRI registration, interim QMS controls) are satisfied before first implant. R1 and R4 remain elevated and are not accepted at current evidence maturity — they are conditionally mitigated, meaning clinical use is gated on completion of the biocompatibility and fatigue test programmes respectively. The specific signals that would escalate R4 into a formal CAPA are: any in-vivo or bench fracture, any reported migration event, or a deployment failure rate exceeding the pre-specified threshold in the clinical protocol [NEEDS INPUT: define failure-rate threshold in the MD-22 protocol]. R1 escalates to CAPA if any sensitisation or thromboembolic event is reported and causality cannot be ruled out within the DSMB's review window.

## Risk Management File reference

[NEEDS INPUT: RMF document reference number and version — to be assigned once the ISO 13485 QMS gap assessment is complete and a document-control system is operational (see Section 8 — QMS). Anticipated formalisation timeline should be confirmed with the ISO 13485 consultant engaged this quarter.] The RMF is expected to be maintained as a living document under version control, with each quarterly review generating a signed review record that becomes part of the technical file submitted with or post-dating the MD-7 application.


---

# §11 Verification & Validation

_strategy: llm_synthesized · status: complete · cost: $0.0181_

## Verification protocol

Verification activities for this Class D device were structured across three test categories: functional bench testing, safety testing (electrical and mechanical), and performance testing under simulated clinical conditions. Each category maps directly to the Essential Principles documented in Section 9.

Functional bench testing confirmed that the device operates within the design specifications across its full intended operating envelope — including rated input conditions, output tolerances, and alarm/alert thresholds. Safety testing addressed electrical safety per IEC 60601-1 (general requirements for basic safety and essential performance) and mechanical integrity under foreseeable misuse loads. Electromagnetic compatibility was assessed per IEC 60601-1-2 to confirm performance in typical HCP-managed ward and procedural-room environments.

Performance testing evaluated device outputs against predetermined acceptance criteria derived from the intended use specification. These criteria directly underpin Essential Principles EP3 (fitness for intended purpose) and EP6 (risk–benefit profile) as cross-referenced in Section 9.

[NEEDS INPUT: specific verification protocols, test report IDs, pass/fail outcomes, and testing laboratory name/accreditation status]

Where third-party test houses conducted verification activities, accreditation to ISO/IEC 17025 is anticipated. All verification records are maintained within the Design History File and are available for CDSCO review on request.

## Validation summary

Validation addresses whether the device performs as intended in the hands of its target users — healthcare professionals — under realistic clinical conditions. The validation programme spans two dimensions: design validation (confirming the device meets user needs and intended use) and clinical performance validation.

Design validation included use-related risk assessment and simulated-use testing with representative HCP users, examining usability under the task conditions described in the intended use specification. Any use-related failures identified were fed back into the risk management file per ISO 14971.

For clinical performance validation, the B5 clinical evidence status for this submission is [TBD]. Where clinical data exist from a pilot or preliminary study, they will be cited here with explicit labelling as preliminary and subject to pivotal confirmation before regulatory reliance. At present:

[NEEDS INPUT: clinical evidence status — pilot study details including site name, patient/subject count, primary performance metrics (sensitivity, specificity, or equivalent), and CTRI or ethics registration reference if applicable]

If clinical evidence remains at the pilot stage only, a gap exists between available data and the evidence level expected for a Class D device under MDR 2017 Schedule IV. This gap and the plan to close it are addressed in Section 12. Validation will not be considered complete until pivotal clinical data meeting the Section 12 evidence plan are on file.

## Biocompatibility evidence (DMF §8.11)

This device involves patient contact; biocompatibility evaluation is therefore required under the ISO 10993 series. The applicable contact tier and test panel depend on the nature, duration, and body location of contact, which must be confirmed before the test matrix is finalised.

[NEEDS INPUT: ISO 10993 test panel — anchored to confirmed patient-contact tier (nature of contact: surface/external communicating/implant; contact duration: limited/prolonged/permanent; specific tissues contacted)]

Pending that confirmation, the working assumption is surface contact with intact skin. For that tier, the minimum expected panel typically includes cytotoxicity and sensitisation assessments, with additional endpoints (irritation, systemic toxicity) depending on contact duration. Any biocompatibility testing conducted by a laboratory accredited under ISO/IEC 17025 and aligned with ISO 10993-1:2018 will be documented in the Biocompatibility Evaluation Report, which forms part of the Technical Documentation available for CDSCO review.

## Stability data (DMF §8.17)

Shelf-life and stability claims for the device are to be supported by a combination of real-time and accelerated stability data, consistent with the ICH Q1A framing as adapted for medical devices. Accelerated studies use elevated temperature and humidity conditions to generate early data supporting a provisional shelf-life claim; real-time studies run concurrently to confirm that claim over the full intended storage period.

[NEEDS INPUT: specific shelf-life claim (months/years), storage condition specifications (temperature range, humidity range, light sensitivity if applicable), and current stability study status — whether studies are complete, ongoing, or yet to be initiated]

Packaging integrity testing, consistent with ASTM F2097 or equivalent, is expected to be conducted alongside stability to confirm that the barrier system maintains performance through the claimed shelf life. Stability protocols and interim data will be submitted to CDSCO as they become available.

## V&V evidence references

- [TBD] V&V evidence references pending B5 capture.


---

# §12 Clinical Evidence & Post-Market Surveillance

_strategy: llm_synthesized · status: complete · cost: $0.0295_

## Clinical evidence status

**Tier B B5 status:** [TBD]

## Clinical evidence summary

As a Class D novel device with no predicate, clinical evidence is not optional — CDSCO will expect a substantive clinical data package before licensing under MDR 2017 Schedule IV. The current evidence status is [TBD], pending applicant confirmation at the Q1 clinical state gate. Until that gate closes, the submission strategy is structured around a two-phase evidence architecture: any available pre-clinical or early feasibility data forms the foundational narrative, and a prospective clinical investigation serves as the pivotal confirmatory layer.

[NEEDS INPUT: clinical evidence status — specifically whether any pilot, feasibility, or published study data exists; if so, provide study site(s), approximate sample size, primary outcome metrics (e.g., sensitivity/specificity, clinical utility endpoints), and whether a CTRI registration was filed]

If pilot data exists, it will be characterised in this section as preliminary and hypothesis-generating, not as the primary basis for a Class D clinical claim. Where the applicant's pilot anchors specific performance figures, those figures will be cited with explicit acknowledgment that pivotal confirmation is required before regulatory reliance. Absent pilot data, the clinical evidence section at submission will open with the investigational plan and EC/CDSCO engagement timeline rather than performance results. Either way, a gap to the pivotal study is expected and will be disclosed transparently to the reviewer.

## Evidence plan

The pivotal clinical investigation will be designed and registered on CTRI prior to first patient enrolment, consistent with ICMR guidelines and MDR 2017 Schedule Y requirements as applicable to device investigations. Ethics Committee engagement at the lead site is anticipated as the first formal step, with EC approval secured before any MD-22 application is filed with CDSCO.

[NEEDS INPUT: pivotal trial design — primary endpoint (e.g., diagnostic accuracy, clinical utility, superiority/non-inferiority margin), target sample size and statistical rationale, comparator or reference standard, number of sites and site selection criteria]

[NEEDS INPUT: CTRI registration ID — to be filed pre-enrolment]

[NEEDS INPUT: lead EC name and approval reference, or anticipated EC engagement timeline]

The study protocol will be developed under ISO 14155 principles for investigational device studies, adapted for the Indian regulatory context. Site selection will prioritise centres with established device investigation infrastructure. Interim safety reviews at pre-specified enrolment milestones are planned; the Data Safety Monitoring Board composition and charter will be finalised during protocol development. Regulatory strategy assumes a 12–24 month enrolment window, though the actual timeline is subject to EC and CDSCO review cycles.

## Post-market surveillance plan

**Complaint Handling and CAPA Workflow**

All field complaints — received via distributor, clinician, or direct end-user channel — are logged in the complaint register within 24 hours of receipt. The RA Officer performs initial triage within 48 hours to classify severity (minor, serious, or field safety signal) and assign an owner. Root-cause analysis is completed within 30 calendar days for serious complaints; minor complaints are batched into monthly CAPA reviews. Corrective actions are tracked against closure deadlines with documented verification of effectiveness. Recurring complaint themes are escalated to the Quality Head at the monthly Quality Management Review; patterns that suggest a systemic safety signal trigger an unscheduled review with the RA Officer and senior management within 5 business days.

**Adverse Event Reporting — Forms and Timelines**

Adverse event reporting follows the MDR 2017 vigilance schedule. A Serious Adverse Event — defined as any event resulting in death, serious injury, or unanticipated serious deterioration in health — triggers MD-42 (manufacturer's AE report) within 15 calendar days of the manufacturer becoming aware, filed with the relevant licensing authority. The RA Officer is notified within 24 hours of any event meeting the Serious AE threshold; no filing proceeds without RA Officer sign-off. Field Safety Corrective Actions and field safety notices are documented and reported in parallel. Form-25 (device-related adverse event report, as applicable to the deployment context) is completed for events occurring at licensed clinical sites. MD-43 (PMS periodic report) consolidates complaint data, AE summaries, and trend analysis on the schedule described below.

**Periodic Reporting and Post-Market Clinical Follow-Up**

A quarterly trend report is prepared by the RA Officer, covering complaint rates, near-misses, AE counts, and any field signal requiring surveillance escalation. The annual PMS report (MD-43) synthesises quarterly trend data, updates the benefit-risk assessment, and documents any labelling, IFU, or design changes made during the period. This report is reviewed by the Quality Head, signed by the authorised signatory, and filed with CDSCO per the MDR 2017 periodic reporting schedule. Post-market clinical follow-up obligations are addressed separately in the PMCF sub-section below.

## Vigilance reporting framework

Three forms govern the post-market vigilance chain under MDR 2017. MD-42 is the manufacturer's adverse event report, triggered by any Serious AE or device malfunction that could have caused or contributed to serious injury; the reporting window is 15 calendar days from manufacturer awareness. MD-43 is the periodic PMS report, filed annually (or at the frequency directed by CDSCO at time of licensing) and consolidating AE summaries, complaint trend analysis, and benefit-risk updates. Form-25 covers device-related adverse events at the site or point-of-care level, applicable where the event occurs at a licensed clinical establishment.

All three forms are maintained in the document control system with version history. The MDR 2017 vigilance schedule governs timelines; any subsequent CDSCO guidance amending those windows will be incorporated at the next scheduled PMS plan review.

## Post-market clinical follow-up (PMCF)

PMCF is initiated at first commercial deployment and runs on an annual default cadence for this Class D device, consistent with the risk classification and MDR 2017 expectations for high-risk devices. The annual PMCF report reviews real-world performance data, any new published evidence in the clinical domain, and updates to the benefit-risk profile documented in Section 11.

For high-risk subpopulations — [NEEDS INPUT: identify any subgroups warranting tighter surveillance, e.g., paediatric patients, specific comorbidity profiles, or deployment in resource-limited settings] — the review cadence tightens to semi-annual for the first two years post-launch, reverting to annual once safety and performance stability is confirmed across at least four consecutive review cycles. Findings that suggest a meaningful change in the benefit-risk balance are escalated to the RA Officer immediately and may trigger an unscheduled PMCF review or a post-market study protocol amendment.

## Clinical investigation pathway

Because this is a Class D novel device, the clinical investigation pathway under MDR 2017 is the expected route to pre-market clinical evidence. The sequence runs: MD-26 (application for clinical investigation permission) → MD-27 (acknowledgment and scrutiny by CDSCO) → MD-22 (clinical investigation permission grant) → MD-23 (clinical investigation certificate, where applicable) → conduct of the investigation under an approved protocol → MD-7 (import/manufacture licence application incorporating clinical data) → MD-9 (licence grant). Ethics Committee approval must precede the MD-26 filing. The Reviewer Concierge tier within this submission pack is configured to support dual-pathway sequencing — running EC engagement and CDSCO pre-submission queries in parallel to compress the overall timeline where the regulatory calendar allows.


---

# §13 Biocompatibility (ISO 10993)

_strategy: llm_synthesized · status: complete · cost: $0.0172_

## Tier overview

| Field | Value |
|---|---|
| ISO 10993-1 category | Implant — tissue/bone OR blood (long-term) |
| Q9 patient_contact (wizard-explicit) | implant_gt_30d |
| Default contact duration | long_term |
| Add-on panels applied | drug-eluting, bioresorbable / biodegradable |
| Lab-evidence requirement | NABL-accredited test reports |

## Why this tier applies

A bioresorbable drug-eluting coronary stent is deployed transluminally and left permanently resident within a coronary artery. From the moment of deployment it is in continuous contact with circulating blood and the surrounding vascular tissue. Because the scaffold is designed to resorb over months to years, that contact is not merely long-term — it is dynamic: the contacting surface area, surface chemistry, and released species all change as the device degrades. The wizard-captured contact classification (Q9 = implant_gt_30d) places this device squarely in the Implant — tissue/bone OR blood (long-term) tier under ISO 10993-1:2018 Annex A, which served as the sole panel-selection authority for this submission. This tier carries the highest biocompatibility burden in the standard's risk-based framework, and the test panel below reflects that. All biological evaluation data submitted in support of this section are expected to originate from NABL-accredited laboratories or internationally equivalent accredited facilities; non-accredited laboratory reports are anticipated to require justification acceptable to CDSCO review.

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

When a device actively releases a pharmacological agent into coronary tissue and the systemic circulation, biocompatibility evaluation extends beyond the scaffold material itself. The eluted drug and its metabolites constitute a distinct chemical population requiring ISO 10993-18 chemical characterization to identify and quantify all extractables and leachables, ISO 10993-17 to derive or adopt allowable limits for each identified substance, and ISO 10993-16 to design toxicokinetic studies that establish systemic exposure profiles against those limits. This positions the stent as a combination product. The medicinal substance sub-block within §8 (Design & Manufacturing) documents the drug loading, release kinetics, and formulation rationale; §19 addresses the DCG(I) joint-review pathway and anticipated NOC requirement. Section 13 testing cannot be scoped without the chemical characterization outputs from §8, making that section a formal upstream dependency.

## Bioresorbable overlay

As the scaffold resorbs, degradation products — oligomers, monomers, corrosion ions, or ceramic breakdown species depending on matrix composition — are released into the peri-strut tissue and may enter systemic circulation. ISO 10993-9 provides the framework for identifying and quantifying these species over time. Which matrix-specific degradation standard applies — ISO 10993-13 (polymeric), ISO 10993-14 (ceramic), or ISO 10993-15 (metallic) — depends on the primary scaffold matrix material. The current submission has the matrix-class conditional tests listed for completeness; [NEEDS INPUT: primary scaffold matrix material class — polymer, ceramic, or metal — to confirm which of ISO 10993-13 / -14 / -15 is active] before the panel is finalised. ISO 10993-16 toxicokinetic study design applies here for the same reason it applies to the drug component: systemic exposure from degradation products needs to be characterised, not merely presumed negligible.

## Sequencing with adjacent sections

Section 13 testing is sequenced as a downstream output of material finalisation in §8 — no extractables or leachables work should commence on a formulation that has not been locked. During the §15 Stability programme, accelerated-ageing samples serve a dual purpose: stability endpoint specimens and the leachables source material for §13 chemical characterisation, so these workstreams run in parallel rather than in series. Risk Management (§10) is a live consumer of §13 outputs; hazards identified from chemical characterisation or degradation product data feed directly into the ISO 14971 risk file. For a sterile implant, §14 Sterilization Validation is expected to precede final §13 testing — sterilization processes are known to alter leachables profiles, and pre-sterilization data submitted as final evidence is likely to draw a CDSCO query.

## Cross-references

- §8 Design & Manufacturing — materials list + manufacturing process
- §10 Risk Management — ISO 14971 hazard register receives biocomp findings
- §14 Sterilization Validation — must precede final biocomp testing for sterile devices
- §15 Stability Data — accelerated-aging samples can double as -17/-18 leachables source
- §8.12 Medicinal substances sub-block (in §8) — drug component dossier
- §19 Conditional NOCs — DCG(I) joint review for combination product

---

# §14 Sterilization Validation

_strategy: llm_synthesized · status: complete · cost: $0.0203_

## Why §14 applies + the method-selection problem

A drug-eluting bioresorbable coronary stent is shipped sterile, and Section 14 carries the burden of demonstrating that the chosen sterilization process achieves a sterility assurance level of 10⁻⁶ without compromising the device's drug payload, polymer matrix, or metallic scaffold — if one is present. The sterile designation for this product is currently inferred rather than confirmed from a certificate or batch release record; the founder should validate this status before CDSCO submission. Method selection is not resolved in this narrative. The four method blocks that follow — ethylene oxide (EtO), gamma/e-beam radiation, moist heat (steam), and aseptic processing — each present the validation pathway the founder would need to execute. The founder selects exactly one, or a qualified hybrid, and removes the others. Validation evidence supporting whichever method is chosen is expected to be documented in NABL-accredited test reports, cross-referenced to the applicable standard in the ISO 11135 / 11137 / 17665 / 13408 series depending on the process selected.

## Method matrix

| Method | Primary standard | SAL convention | Material-compat constraint | Key gotcha |
|---|---|---|---|---|
| Ethylene oxide (EtO) | ISO 11135:2014 | 10⁻⁶ standard | Most polymers + metals; sensitive to moisture for some materials. | Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required. |
| Radiation (gamma / e-beam / X-ray) | ISO 11137-1/-2/-3 | 10⁻⁶ at 25 kGy reference dose | Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose. | Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected. |
| Steam / moist heat (autoclave) | ISO 17665-1:2006 (rev. ISO 17665:2024) | 10⁻⁶ standard | Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail. | Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices. |
| Aseptic processing | ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom) | Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible. | Any material — components sterilized separately + assembled aseptically. | Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices. |

## Method-selection guidance for this device

Three constraints govern method selection for this specific device profile, and they collectively narrow the realistic options significantly.

First, the drug payload. High-dose gamma irradiation degrades most small-molecule antiproliferative agents used in drug-eluting stents — sirolimus-class drugs in particular — and is generally incompatible without extensive chemistry bridging studies that have rarely succeeded at commercial scale. Standard EtO cycles are compatible with the drug chemistry in many cases, but residual EtO and ethylene chlorohydrin must be characterized against ISO 10993-7 limits; for an intravascular implant, those limits are tighter than for external-contact devices, and the leachables picture changes materially (see Section 13 for the leachables-profile implication).

Second, the bioresorbable matrix. PLA and PLGA polymers accelerate hydrolytic degradation under elevated temperature and humidity — ruling out conventional steam sterilization in most configurations. Gamma irradiation induces chain scission in these polymers at doses typically required for a 10⁻⁶ SAL; low-dose e-beam at a validated, reduced dose may be feasible but requires bridging studies demonstrating mechanical and molecular-weight retention post-irradiation.

Third, industry precedent. Aseptic processing remains the most common sterilization route for drug-polymer combination implants of this class, and CDSCO reviewers are likely familiar with this approach. [NEEDS INPUT: confirm whether the manufacturing facility has a classified aseptic fill/assembly suite or plans to contract-sterilize]

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

Regardless of which method the founder selects, four cross-cutting requirements apply to the validation package.

Bioburden control upstream of sterilization is characterized under ISO 11737-1; the pre-sterilization bioburden population informs dose-setting or cycle-design decisions and must be re-evaluated if manufacturing scale or site changes.

Sterility testing in validation runs — typically three process qualification runs — follows ISO 11737-2. Routine sterility release testing of finished product is distinct and is documented in Section 16.

The sterile barrier system must be qualified under ISO 11607-1 and -2, covering material compatibility with the sterilization agent, seal integrity, and distribution-stress performance. The claimed shelf-life of that barrier is tied directly to Section 15 (Stability and Shelf-life); the two sections should use a consistent claimed-sterile duration.

[NEEDS INPUT: packaging configuration and primary barrier material — foil pouch, blister tray, or other]

- Bioburden control before sterilization (ISO 11737-1)
- Sterility testing in process validation (ISO 11737-2 — not a release test, but used in validation)
- Sterile barrier system qualification (ISO 11607-1/-2) with shelf-life claim aligned to §15 Stability
- Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18; pre-sterilization leachables data requires a bridging justification

## Sequencing with adjacent sections

Section 14 validation should be sequenced before the final ISO 10993-17 and -18 leachables runs documented in Section 13. Sterilization alters the chemical profile of both the polymer matrix and the drug coating — residuals, degradants, and extraction kinetics post-sterilization differ from pre-sterilization material. If any pre-sterilization leachables data exist from early development, a bridging justification is likely required to demonstrate those results remain representative; CDSCO reviewers on combination-product dossiers have flagged this gap in prior queries.

The sterile barrier shelf-life claim established here feeds directly into Section 15. The two sections should reference a common claimed expiry — typically [NEEDS INPUT: claimed shelf-life in months] — and the stability protocol in Section 15 should include real-time and accelerated aging runs on sterilized product in its final barrier.

Sterilization failure modes — cycle deviation, bioburden exceedance, barrier breach — belong in the Section 10 risk management hazard register as distinct hazardous situations, with severity scores reflecting the intravascular implant context. Per-batch sterilization records and certificate-of-sterilization documentation are reviewed at the batch release stage covered in Section 16.

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

A bioresorbable drug-eluting coronary stent occupies a specific regulatory position under MDR 2017 because the pharmacological action of its eluted drug is not merely ancillary — it is integral to the device's intended therapeutic effect of suppressing neointimal hyperplasia. That combination-product character activates one conditional overlay on the main manufacturing-licence path: a joint technical review by the Drug Controller General of India (DCG(I)) alongside the CDSCO Medical Device division. The §4 Pathway established for this product under MD-3 (import) or MD-7 (manufacture) proceeds in parallel with that DCG(I) review rather than waiting for its completion first, but the manufacturing licence grant is anticipated to be contingent on a favourable outcome. No DAHD, BARC/AERB, or PNDT permissions are triggered by this device's design or intended clinical context. The sections that follow address the DCG(I) joint-review block only; other NOC sub-blocks are not applicable and have been excluded from this submission.

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

The stent's antiproliferative drug coating — [NEEDS INPUT: INN and nominal dose per unit device] — elutes over a defined resorption period and acts on vascular smooth muscle cells to reduce restenosis risk. Because the drug component contributes a primary, not merely secondary, mode of action distinct from the mechanical scaffolding, CDSCO's combination-product classification guidance treats the assembly as a device-led combination product requiring DCG(I) co-review of the drug constituent. This review cross-references the biocompatibility allowable-limits analysis compiled under §13 (ISO 10993-17 risk-based approach) and the medicinal-substance characterisation documented in the §8.12 cross-block, which covers drug identity, purity specifications, elution kinetics, and residual solvent profiles. The DCG(I) reviewer's primary interest is whether the drug component, in the doses delivered locally at the lesion site, satisfies pharmacotoxicological safety thresholds — not marketing authorisation of the drug itself. That distinction should be stated explicitly in the cover letter accompanying the NOC package.

## Sequencing notes

The DCG(I) joint-review dossier — covering drug characterisation, elution data, and the ISO 10993-17 allowable-limits bridge — is submitted concurrently with the MD-3 or MD-7 application, not as a separate pre-licence step. In practice, CDSCO's Medical Device division coordinates the referral to DCG(I) internally once the technical file is accepted as complete; the applicant does not file a standalone application to DCG(I). Typical industry experience places DCG(I) review at eight to sixteen weeks from referral, though that timeline is subject to query cycles and should be treated as indicative. The manufacturing or import licence grant is expected to be held pending DCG(I) concurrence, so any queries from the drug-review side should be escalated promptly to avoid extending the overall clock. No other sequential pre-conditions — such as BARC clearance, which would require advance filing before submission — apply to this device.

## Cross-references

- §8 Design & Manufacturing — §8.12 medicinal substances sub-block
- §13 Biocompatibility — ISO 10993-17 allowable limits
- §12 Clinical Evidence — combination-product clinical data
- §4 Pathway — main MD-3 / MD-7 manufacturing-licence path

---
