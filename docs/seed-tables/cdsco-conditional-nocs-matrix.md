# CDSCO conditional NOCs matrix — seed values for review

**Purpose:** this table drives **§19 Conditional NOCs & Adjacent Permissions** in the ₹2,499 hardware Submission Pack. Bible §4.B Block 5 (DAHD, BARC, PNDT, DCG(I)) + Block 6 (MD-26/27, MD-13, MD-23) covers the conditional permissions that ride alongside the main MD-3 / MD-7 manufacturing-licence path when specific device characteristics are present.

**Why §19 is a single section with conditional sub-blocks** (not separate sections per NOC): wrong-included NOCs are clear noise to a regulator, not safety wins — so the standing blast-radius rule does NOT apply here. §19 emits only the NOC sub-blocks whose trigger fires. The trigger evaluation is deterministic from the synthesizer's inference markers.

**Review status:** every row is currently `estimate`. Founder + CDSCO consultant sign-off flips rows to `reviewed`.

**Mechanics:**
- §19 generator reads the same trigger functions the gating predicate uses (exported from `section-gating.ts`).
- Per fired NOC trigger: one structured sub-block + a Sonnet narrative paragraph tying it to the founder's device.
- Source of truth for live values: `lib/engine/draft-pack-v2/cdsco-conditional-nocs-matrix.ts`. **The .ts file and this Markdown express the same content — co-edit.**

---

## NOC matrix

| NOC | Authority | Trigger | Applicable rule | Key evidence | Timeline placement vs MD-3 / MD-7 | Status |
|---|---|---|---|---|---|---|
| DCG(I) joint review | Drug Controller General (India) | `drug_content` marker affirmative | Drugs and Cosmetics Act 1940 §3(b) (definition of "drug"); MD-7 checklist §11-12 for combination products | Drug master file (chemistry, pharmacology, toxicology); combination-product justification; drug pre-approval status | Parallel with MD-3/MD-7 submission; joint review precedes grant | estimate |
| DAHD NOC | Dept Animal Husbandry, Dairying and Fisheries (Ministry of Fisheries, Animal Husbandry and Dairying) | `veterinary_use` marker !== "humans only" | Bible Addendum FAQ §1-2; IVD FAQ §53(a) | Veterinary intended-use statement; target species; veterinary indication; veterinary-only or dual-use declaration | Before MD-3/MD-7 application (NOC accompanies submission) | estimate |
| BARC + AERB | Bhabha Atomic Research Centre (NOC) + Atomic Energy Regulatory Board (approval before patient use) | `ionising_radiation` marker affirmative | Bible Addendum §7; IVD FAQ §53(c) (BARC NOC for radioactive content) | Radioactive source / X-ray source spec; radiation safety officer; AERB type-approval certificate; site-radiation plan | BARC NOC pre-MD application; AERB approval before clinical / patient use | estimate |
| PNDT NOC | Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Cell | `pndt_in_scope` (not currently inferred — Sprint 4) | PCPNDT Act 1994 §3, §4 (bans pre-natal sex determination) | Statement of non-applicability OR (rare) procurement-only registration; intended-use scope confirming non-sex-determination use | Before commercial use | estimate |

---

## NOC block — DCG(I) joint review

**Authority:** Drug Controller General (India), CDSCO.

**Applicable rule:** Drugs and Cosmetics Act 1940 §3(b) defines what constitutes a "drug"; combination products (drug + device) fall under joint scrutiny per MD-7 checklist §11-12. Bible §4.B Block 5 records DCG(I) consultation as triggered by drug content.

**Trigger:** the synthesizer's `drug_content` inference marker resolves to an affirmative value (e.g., "Yes (drug-eluting)").

**Key evidence package.**
- [ ] Drug Master File covering chemistry, manufacturing, controls (CMC), pharmacology, toxicology, clinical safety/efficacy of the drug component
- [ ] Combination-product justification — why device + drug deliver a clinical benefit not achievable by either alone
- [ ] Pre-approval status of the drug component (new chemical entity vs. previously-approved drug; route of administration novelty)
- [ ] Cross-reference to §8 Design & Manufacturing §8.12 medicinal-substances sub-block
- [ ] Cross-reference to §13 Biocompatibility ISO 10993-17 allowable-limits work covering drug + non-drug constituents
- [ ] Cross-reference to §12 Clinical Evidence — clinical data covering the combination product, not the components separately

**Timeline placement.**
- Joint review runs **parallel** with the main MD-3 or MD-7 application.
- Grant of MD-5 / MD-9 typically waits for DCG(I) clearance.
- Pre-submission DCG(I) consultation is recommended for novel-drug combinations to scope toxicology requirements.

**[REVIEW]** scope of toxicology dossier for previously-approved-drug vs novel-drug combinations — consultant call per submission.

---

## NOC block — DAHD NOC (veterinary)

**Authority:** Department of Animal Husbandry, Dairying and Fisheries (Ministry of Fisheries, Animal Husbandry and Dairying).

**Applicable rule:** Bible Addendum FAQ §1-2 — devices for veterinary use require DAHD NOC. IVD FAQ §53(a) confirms the same trigger for IVDs.

**Trigger:** the synthesizer's `veterinary_use` inference marker resolves to anything other than "humans only" — i.e., the device is intended for veterinary use (animals only) or dual-use (humans + animals).

**Key evidence package.**
- [ ] Veterinary intended-use statement
- [ ] Target species / species range
- [ ] Veterinary indication (diagnostic / therapeutic / monitoring)
- [ ] Declaration of veterinary-only vs dual-use (humans + animals)
- [ ] Cross-reference to §3 Intended Use (population statement must align)
- [ ] Cross-reference to §7 Labelling (veterinary labelling requirements)

**Timeline placement.**
- DAHD NOC accompanies MD-3 / MD-7 application — file together; NOC not granted independently of the manufacturing-licence pathway.

**[REVIEW]** dual-use products (humans + animals) — confirm whether separate human-use registration is also required.

---

## NOC block — BARC + AERB (ionising radiation)

**Authority:** Bhabha Atomic Research Centre (BARC) for the NOC; Atomic Energy Regulatory Board (AERB) for the operational approval before patient use.

**Applicable rule:** Bible Addendum §7 — devices emitting ionising radiation or containing radioactive sources require BARC NOC plus AERB approval before patient use. IVD FAQ §53(c) covers radioactive content for IVDs.

**Trigger:** the synthesizer's `ionising_radiation` inference marker resolves to an affirmative value (e.g., "Yes — X-ray source", "Yes — gamma source"). Covers X-ray, CT, fluoroscopy, gamma, radioisotope, nuclear medicine devices.

**Key evidence package.**
- [ ] Radioactive source / X-ray source specification — type, intensity, half-life (if applicable)
- [ ] Radiation safety officer designation + qualifications
- [ ] AERB type-approval certificate for the radiation-generating device class
- [ ] Site radiation plan covering installation, shielding, personnel exposure monitoring
- [ ] Cross-reference to §10 Risk Management — radiation-exposure hazards in the ISO 14971 file

**Timeline placement.**
- BARC NOC obtained **before** MD-3 / MD-7 application (NOC document accompanies submission).
- AERB approval is operational — required before the device is used on patients post-grant; site-specific.

**[REVIEW]** AERB type-approval cycle time can extend the overall MD-3/MD-7 timeline materially — flag in the §4 pathway timeline.

---

## NOC block — PNDT (PCPNDT Act compliance)

**Authority:** Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Cell, Ministry of Health and Family Welfare.

**Applicable rule:** PCPNDT Act 1994 §3 + §4 — bans pre-natal sex determination; restricts ownership, use, and transfer of equipment capable of pre-natal sex determination (ultrasound machines + IVD devices for fetal-sex tests).

**Trigger (Sprint 4):** currently NOT inferred by the synthesizer — no `pndt_in_scope` marker. The §19 generator defaults this trigger to OFF for now. When a Sprint-4 wizard question or pitch-extract field surfaces "pre-natal" / "fetal-sex" / "ultrasound + obstetric" / "NIPT" scope, the trigger will fire.

**Key evidence package (when triggered).**
- [ ] Statement of non-applicability if device is NOT used for pre-natal sex determination
- [ ] OR PCPNDT procurement-only registration if device is sold to PCPNDT-registered facilities only
- [ ] Cross-reference to §3 Intended Use — explicit exclusion of pre-natal sex determination
- [ ] Cross-reference to §7 Labelling — required PCPNDT compliance statement on label

**Timeline placement.**
- Statement of non-applicability accompanies MD-3 / MD-7 submission.
- Procurement-only registration is operational — handled at sale time, not at MD-grant time.

**[REVIEW]** Sprint-4 candidate — add `pndt_in_scope` synthesizer marker fed by an ultrasound / pre-natal / NIPT keyword scan against the one-liner + pitch-extract.

---

## Cross-section cross-references the LLM narrative should call out

- DCG(I) → §8 (§8.12 medicinal substances sub-block) + §13 (ISO 10993-17 allowable limits) + §12 (combination-product clinical evidence)
- DAHD → §3 Intended Use (population statement) + §7 Labelling (veterinary labelling)
- BARC / AERB → §10 Risk Management (radiation-exposure hazards) + §4 Pathway (timeline impact)
- PNDT → §3 Intended Use (explicit exclusion) + §7 Labelling (compliance statement)

---

## Sequencing notes (rendered in the §19 narrative)

- Most NOC documents accompany the MD-3 / MD-7 submission; they are NOT separate pre-licence applications in the §4 sub-case sense.
- DCG(I) joint review is a parallel review process — application is filed alongside MD-3 / MD-7 and the licence grant typically waits for DCG(I) clearance.
- BARC NOC is filed before MD-3 / MD-7; AERB approval is operational and follows post-grant.
- For founders the practical takeaway: identify which NOC blocks fire for your device profile, gather the evidence packages in parallel with QMS / DMF / PMF work, and file together with the manufacturing-licence application.
