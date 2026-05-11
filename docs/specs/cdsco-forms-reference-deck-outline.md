# CDSCO regulatory forms reference — slide deck outline

> **⚠️ DRAFT OUTLINE — pending CDSCO consultant validation in Sprint 3.**
> **Final .pptx generation deferred until consultant-validated.**
>
> Authored 2026-05-11. Companion to `docs/specs/cdsco-regulatory-forms-reference.md` (the 3,800-line primary reference doc). This outline is the **slide deck skeleton** — section titles, bullet points, and visual notes. The actual .pptx will be generated using the `pptx` skill once consultant has reviewed.

---

## Deck framing

**Audience:** CDSCO consultant for review; eventually, founders + investors + regulators (after consultant validation).

**Length target:** ~80-90 slides (~7-9 sections × 10-12 slides each).

**Style:** brand-consistent with ClearPath visual system (Teal Trust palette, lowercase headings, direct tone — see `clearpath/AGENTS.md` skill `clearpath`).

**Reading time:** ~45-60 minutes for an unaccompanied read; ~2 hours for guided walkthrough.

---

## Section 1 — Title and framing (slides 1-4)

### Slide 1: Title

- **Title:** "the clearpath regulatory bible"
- **Subtitle:** "comprehensive CDSCO + adjacent frameworks reference for medical devices, SaMD, IVDs, combination products, and pharma scope demarcation in India"
- **Visual note:** Teal Trust palette; ClearPath logo top-right; "INTERNAL DRAFT — pending CDSCO consultant validation" watermark band
- **Footer:** authored 2026-05-11

### Slide 2: Status flag

- **Headline:** "internal draft"
- **Bullet 1:** pending CDSCO consultant validation in Sprint 3
- **Bullet 2:** not for external sharing until consultant review complete
- **Bullet 3:** 85 `UNCERTAIN` items aggregated for consultant red-pen (Section 7 of this deck / §36 of source doc)
- **Visual note:** prominent yellow caution band

### Slide 3: Why this document exists

- **Headline:** "one single map. three audiences."
- **3-column visual:**
  - **Founders** — find your specific journey (persona × stage)
  - **ClearPath engine team** — map questions to required documents per persona (the moat)
  - **CDSCO consultant** — verify, red-pen, finalise

### Slide 4: How to read

- **Headline:** "table of contents"
- **6-part structure visual (numbered):**
  - Part I — Foundation (framework / classification / device types)
  - Part II — 14 persona × stage journeys
  - Part III — Form-centric reference (form-by-form lookup)
  - Part IV — ClearPath question coverage analysis (the moat)
  - Part V — Operational details (EC / sample size / fees / timelines / rejections)
  - Part VI — Reference (matrix / dependency / worked examples / glossary / sources)

---

## Section 2 — Foundation (slides 5-15)

### Slide 5: Two regulators, two statutes

- **Visual:** side-by-side comparison
- **Left:** **MDR-2017** (devices, IVDs, SaMD) — under Drugs & Cosmetics Act 1940
- **Right:** **D&C Act 1940 + NDCT 2019** (drugs, vaccines, biologics, clinical trials)
- **Bottom note:** same agency (CDSCO), different statutory hat

### Slide 6: CLA vs SLA jurisdiction

- **Visual:** Indian map illustration
- **Central Licensing Authority (CLA):** Class C/D mfg + all imports + clinical investigation + investigational devices + test licenses + classification
- **State Licensing Authority (SLA):** Class A/B mfg + all sale/distribution/wholesale

### Slide 7: The portal ecosystem

- **3-portal visual:**
  - `cdscomdonline.gov.in` — MD Online portal (main licenses)
  - `nsws.gov.in` — NSWS (test licenses, mandated Oct 2025)
  - `BharatKosh` — Government payments
- **Footnote:** SUGAM is drug-side; `UNCERTAIN` on Sahyog scope

### Slide 8-9: Risk classification

- **Slide 8 (Devices):** 4 boxes A/B/C/D with examples — Class A non-sterile non-measuring → portal-only; Class A measuring/sterile + Class B → SLA; Class C/D → CLA
- **Slide 9 (SaMD matrix):** 3×3 grid (Treatment-or-diagnosis × Drive × Inform) × (Critical × Serious × Non-serious) → A/B/C/D — verbatim from SaMD Draft §4.4.1 Table 2

### Slide 10: Predicate device

- **Headline:** "is there a predicate?"
- **Yes path:** direct MD-3 / MD-7 / MD-14 application
- **No path:** MD-26 → MD-27 → marketing license (the novel-device journey)
- **Foreign-approved devices:** CI waiver possible if approved + marketed ≥2y in UK/USA/AU/CA/JP/EU and CLA satisfied [FAQ §117]

### Slide 11-12: Device type taxonomy

- **Slide 11:** Hardware-only / SaMD / SiMD / AI-ML / Combination product / IVD / Accessory / Implant / Wellness (exempt)
- **Slide 12 (visualised):** "What's NOT regulated" — HIS, LIS, IMS, scheduling, billing, wellness, generic comms, encryption-only [SaMD Draft §4.2.3]

### Slide 13-15: Investigational vs predicate

- **Slide 13:** Investigational MD definition — no predicate OR new claim/population/material/major design change
- **Slide 14:** Once first MD-27 granted, IMD becomes predicate for subsequent applicants
- **Slide 15:** Cross-cutting overlays — sterile / patient-contact / drug content / veterinary / radioactive / no predicate (each with the form-cluster it triggers)

---

## Section 3 — Persona journeys (slides 16-50)

One slide per persona (14 personas × ~2 slides each = ~28 slides) plus framing intro.

### Slide 16: How to read persona slides

- **4-quadrant template visual:** A (journey map) / B (document inventory) / C (ClearPath coverage) / D (gap analysis)

### Slides 17-21: Persona §4 — Hardware MD manufacturer

- **Slide 17:** Five sub-cases by class (table; class × SLA-or-CLA × audit-timing)
- **Slide 18:** Journey map — 7 stages, with deltas per class
- **Slide 19:** Document inventory — 5 blocks (legal / PMF / QMS / DMF / conditional NOCs)
- **Slide 20:** Conditional trigger matrix (sterile / patient-contact / drug / software / AI/ML / veterinary / radioactive / no predicate)
- **Slide 21:** ClearPath coverage table (strong / partial / gap) + top-7 Sprint 3 recommendations

### Slides 22-24: Persona §5 — SaMD founder

- **Slide 22:** SaMD classification matrix (verbatim from SaMD Draft); 4 sub-cases by class + Oct 2025 Draft overlays
- **Slide 23:** Document overlay specific to SaMD (DMF §8.15 software V&V, §8.20 software release certificate, software description, SRS, SDS, architecture diagrams, cybersecurity V&V)
- **Slide 24:** ClearPath coverage + 6 critical SaMD-specific gaps

### Slides 25-27: Persona §6 — AI/ML developer

- **Slide 25:** Static vs adaptive split (table); ACP required for adaptive
- **Slide 26:** **Algorithm Change Protocol (ACP)** — 5 components visual (data mgmt / performance monitoring / retraining / update / rollback)
- **Slide 27:** ClearPath coverage + 5 AI/ML-specific gaps

### Slides 28-30: Persona §7 — IVD manufacturer

- **Slide 28:** IVD vs MD path divergence (different appendix, different forms, different evaluation)
- **Slide 29:** Prohibited IVDs (TB sero, malaria Ab RDT) — HARD STOP visual; HIV/HBsAg/HCV thresholds table from IVD FAQ §60
- **Slide 30:** ClearPath coverage + the critical "IVD-vs-MD flag" gap

### Slide 31: Persona §8 — Combination product

- 1 slide: PMOA determination diagram; DMF §8.12 medicinal-substances; DCG(I) consultation; SEC referral for borderline

### Slides 32-34: Persona §9 — CI MD researcher

- **Slide 32:** MD-22/23 + MD-26/27 sequence diagram
- **Slide 33:** What does NOT need MD-23 (academic on licensed; Class A non-sterile non-measuring)
- **Slide 34:** EC + CTRI + insurance + investigators-brochure obligations

### Slide 35: Persona §10 — CPE IVD researcher

- 1 slide: MD-24/25 + MD-28/29 sequence; in-India PER 3-batch; HIV/HBsAg/HCV NIB criteria

### Slides 36-37: Persona §11-12 — Pharma (outline only)

- **Slide 36:** D&C Act vs MDR comparison table; NDCT 2019 new-drug definition
- **Slide 37:** Pharma CT form mapping (CT-04 / CT-04A / CT-05 / CT-06) with corrected numbering; 30 vs 90 working-day timeline

### Slides 38-40: Personas §13-§14 — Importers

- **Slide 38:** Indian Authorised Agent (IAA) requirements; PoA apostille; FSC rules; stringent-country distinction
- **Slide 39:** Multi-importer rules; multi-site endorsement; notified-port restrictions
- **Slide 40:** Test license import (MD-16/17) — 3-year validity; cannot upgrade to commercial

### Slide 41-42: Personas §15-§17 — Special cases

- **Slide 41:** Govt hospital MD-18/19 (narrow path; life-threatening / serious permanent disability / unmet need)
- **Slide 42:** Loan licensee MD-4/6 + MD-8/10; personal import MD-20/21

### Slides 43-50: Worked examples (canonical demos + edge cases)

- **Slide 43:** HealthVita BP Pro — Class B path, ~4-5 month timeline
- **Slide 44:** VitalSign Connect — Class C + adaptive AI/ML, ~30-48 month timeline, full novel-device sequence
- **Slide 45:** Pedscribe Listen — paediatric voice triage SaMD, novel category
- **Slide 46:** PainPredict — Class A SaMD, static, ~13-24 month timeline
- **Slide 47:** Novel IVD (saliva-hCG reformulation) — MD-13 → MD-24/25 → MD-28/29 → MD-3/5
- **Slide 48:** Veterinary AI diagnostic — DAHD overlay
- **Slide 49:** Drug-eluting stent — combination product DCG(I) joint review
- **Slide 50:** Pure data platform — NOT MDR; route to DPDP / ABDM / CERT-In

---

## Section 4 — Form-centric reference (slides 51-65)

Quick-lookup format. One slide per form pair.

### Slide 51: Form mapping master table

- **Visual:** large table of all forms (MD-1 through MD-42 + CT-04/04A/05/06) with: purpose / authority / portal / granted-as

### Slide 52: Manufacturing license forms

- MD-3/MD-5 (Class A/B SLA)
- MD-4/MD-6 (Class A/B loan)
- MD-7/MD-9 (Class C/D CLA)
- MD-8/MD-10 (Class C/D loan)
- Self-notification (Class A non-sterile non-measuring)

### Slide 53: Import license forms

- MD-14/MD-15 (commercial, all classes via CLA)
- MD-16/MD-17 (test import)
- MD-18/MD-19 (govt hospital unmet need)
- MD-20/MD-21 (personal import)

### Slide 54-55: Test license forms

- **Slide 54:** MD-12/MD-13 (manufacture test); checklist 12 sections
- **Slide 55:** MD-16/MD-17 (import test); checklist 9 sections

### Slide 56-57: Clinical Investigation forms

- **Slide 56:** MD-22/MD-23 (CI permission); checklist 22 sections
- **Slide 57:** MD-26/MD-27 (no-predicate); checklist 20 sections; sequencing rule

### Slide 58-59: IVD-specific forms

- **Slide 58:** MD-24/MD-25 (CPE) + MD-28/MD-29 (new IVD); checklist 24 sections for MD-28
- **Slide 59:** IVD Master File appendix conflict — Appendix II (authoritative) vs Appendix III (republished error)

### Slide 60: Sale/distribution forms

- MD-41/MD-42 (10-day SLA; 5-year retention)

### Slide 61-62: Pharma forms

- **Slide 61:** CT-04 application / CT-04A pre-init / CT-05 BA-BE / CT-06 grant
- **Slide 62:** Drug Rules 1945 manufacturing forms (Form 22 / 25 / 28) — `UNCERTAIN` noted

### Slide 63-65: Cross-form dependency diagram

- **Slide 63:** Novel device sequence (test license → MD-26/27 → CI → marketing license)
- **Slide 64:** Predicate device sequence (test license optional → marketing license)
- **Slide 65:** New IVD sequence (test license → MD-24/25 CPE → MD-28/29 → marketing license)

---

## Section 5 — ClearPath question coverage (the moat) (slides 66-72)

### Slide 66: Section intro

- **Headline:** "the moat — mapping questions to documents"
- **Sub-headline:** "every persona × stage data point: do we capture it today?"

### Slide 67: Current question inventory

- **Compact visual:** 7 intake + 7 Tier A + 8 Tier B + ~22 AI-extracted = ~44 data points total

### Slide 68: Coverage matrix — by persona

- **Visual:** 14 personas × strong/partial/gap heatmap

### Slide 69: Critical gaps — Sprint 3 priority

- **12-question list:** IVD-vs-MD flag; pharma flag; combination flag; mfg location; predicate binary; sterilisation mode; patient-contact type; drug content; veterinary; prohibited IVD hard-stop; country of origin; CERT-In

### Slide 70: High-value IVD-specific gaps

- **8-question cluster:** analyte / specimen / diagnostic level / output type; new-IVD-vs-predicate; MDTL engagement; HIV-HBsAg-HCV flag; 3-batch consistency; PE evidence; CPE permission status; NOC status

### Slide 71: Sprint 4 valuable + Sprint 4+ defer

- **10 + 10 question lists** by Sprint

### Slide 72: Roadmap timeline

- **Visual:** 4-quarter Gantt — Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5+/v2

---

## Section 6 — Operational details (slides 73-78)

### Slide 73: Ethics Committee

- EC registration with CDSCO + ICMR composition rules + role in MD-22/MD-24/CT-04

### Slide 74: Sample size

- Case-by-case statistical justification; ISO 14155 for MD; NDCT 2019 for pharma; phase-typical Ns marked `UNCERTAIN`

### Slide 75: Fees structure

- IVD fee tables (USD import + INR mfg, A/B/C/D); test license $100 flat for IVD; medical device fees `UNCERTAIN`

### Slide 76: Timelines

- **Comprehensive table:** all 17 application/audit/notification timelines with sources

### Slide 77: Common rejection reasons

- Top 12 from §32 list (apostille missing; FSC vs CoE; brand-fee; class disputes; etc.)

### Slide 78: Adjacent regulators

- DPDP Act 2023 / CERT-In / ABDM / DAHD / BARC / AERB / PNDT — when each fires

---

## Section 7 — Consultant questions (slides 79-85)

### Slide 79: Section intro

- **Headline:** "for the consultant — 22 questions across 7 categories"

### Slide 80: Form-level rule-text questions

- IVD MF Appendix conflict (Q1); Form 22/25/28 numbering (Q2); CT-07 (Q3)

### Slide 81: Regulatory body and process questions

- SEC composition + scheduling (Q4); EC list (Q5); EC composition (Q6); CTRI for MD (Q7); DTAB Apr 2025 (Q8); Sahyog portal (Q9)

### Slide 82: Cross-regulator questions

- DPDP × MDR (Q10); combination PMOA (Q11); DCG(I) joint review (Q12)

### Slide 83: Forward-looking questions

- ACP bridge regime (Q13); Veterinary AI/SaMD (Q14); Biorepository guidelines (Q15)

### Slide 84: Sample-size and operational questions

- Bright-line N (Q16); Indian-population data for AI/ML (Q17); fees (Q18-20); MD-18 / MD-4 / MD-8 checklists (Q21-22)

### Slide 85: Suggested consultant engagement

- Pre-send doc; 2-hour walkthrough on rule-text + ACP; written response on others; annotated mark-up of Parts II-V

---

## Section 8 — Closing (slides 86-90)

### Slide 86: Sources

- Bibliography summary — primary rule + form checklists + 4 FAQs + SaMD Draft + NDCT 2019

### Slide 87: Glossary

- Most-used 20 abbreviations visual reference card

### Slide 88: Document control

- Version / author / date / status / next review

### Slide 89: Q&A placeholder

- For walkthrough sessions

### Slide 90: Back cover

- ClearPath logo + URL + "INTERNAL DRAFT" footer

---

## Visual style notes for .pptx generation

When generating the final .pptx (Sprint 3+ after consultant validation):

- **Palette:** Teal Trust per ClearPath brand system (`clearpath` skill)
- **Typography:** lowercase headings, sans-serif body
- **Tables:** prominent (this deck has many) — use lightweight grid lines, alternating row tint
- **Diagrams:** dependency map slide 63-65, ACP slide 26, classification matrix slide 9 — use clear arrows, minimal text
- **`UNCERTAIN` callouts:** distinct yellow accent
- **Source citations:** small footer per slide (e.g., "Source: MD FAQ §27 + IVD FAQ §97")
- **Internal Draft watermark:** every slide

---

*End of slide outline. Final .pptx generation deferred until CDSCO consultant validation in Sprint 3.*
