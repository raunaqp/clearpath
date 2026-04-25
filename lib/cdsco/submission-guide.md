# CDSCO Submission Guide

This guide ships with every ClearPath Draft Pack. It walks an applicant from
the moment they have a drafted pack to the moment they receive an
acknowledgement from CDSCO.

It is general guidance, not legal advice. Always verify the current
requirements at https://cdsco.gov.in and https://cdscomdonline.gov.in before
filing — CDSCO updates fee schedules and form versions periodically.

---

## Step 1 — Determine your classification

Indian medical-device regulation is class-based. The class drives **which form
you file**, **which authority approves it**, and **how long it takes**.

| Class | Risk | Examples |
|-------|------|----------|
| A | Low | Tongue depressors, surgical retractors, non-invasive thermometers |
| B | Low–Moderate | Hypodermic needles, suction equipment, basic ECG machines |
| C | Moderate–High | Lung ventilators, infusion pumps, dialysis equipment |
| D | High | Implantable pacemakers, heart valves, intra-uterine devices |

Class is decided by the IMDRF matrix (significance of information × healthcare
situation) and the rules in the Fourth Schedule of CDSCO MDR 2017. For
software (SaMD), refer to the CDSCO Draft Guidance on SaMD (October 2025).

ClearPath proposes a class with rationale in **Section 04 — Risk
Classification Justification** of your Draft Pack. Treat it as a starting
point; a regulatory consultant should confirm it before filing.

---

## Step 2 — Identify which forms apply

| If you are… | Primary form(s) | Authority |
|-------------|-----------------|-----------|
| Manufacturing Class A or B in India | **MD-3** (application) → **MD-5** (license) | State Licensing Authority |
| Manufacturing Class C or D in India | **MD-7** (application) → **MD-9** (license) | CDSCO HQ, Delhi |
| Importing any class into India | **MD-14** (import license) + Form **MD-15** application | CDSCO HQ, Delhi |
| Running a clinical investigation | **MD-12** (test license) + **MD-22** (investigation approval) | CDSCO HQ, Delhi |
| Performing IVD clinical performance evaluation | **MD-23** | CDSCO HQ, Delhi |
| Exporting a device made in India | **MD-20** (No Objection Certificate) | CDSCO HQ, Delhi |
| Building Software as a Medical Device (SaMD) | Same as above by class **+** Algorithm Change Protocol per Oct 2025 draft | Central, with SaMD addendum |

Class A/B notified-body conformity assessment is done by CDSCO-empanelled
notified bodies — the body issues the conformity certificate that supports
your MD-5 application.

If multiple categories apply (e.g. you both manufacture and import variants),
you file each pathway separately.

---

## Step 3 — Fill the forms

The Draft Pack you received is structured to mirror the CDSCO form fields.
Mapping cheat sheet:

- **Section 02 — Intended Use Statement** → "Indication for use" / "Purpose"
  fields on every MD form. Wording must match exactly across forms, the
  Device Master File, and labelling.
- **Section 03 — Device Description** → "Description of medical device" and
  the Device Master File annexure.
- **Section 04 — Risk Classification Justification** → "Risk class proposed"
  field plus the supporting annexure.
- **Section 05 — Clinical Context** → Clinical Evaluation Report (CER) /
  Plant Master File clinical section.
- **Section 06 — Essential Principles checklist** → annexure to the
  application; each principle marked Met / Not Applicable / In Progress with
  evidence reference.
- **Section 07 — Algorithm Change Protocol** (AI/ML only) → SaMD addendum
  per the Oct 2025 draft guidance.

Paste the drafted text into each field, then have a qualified regulatory
professional review every section before submission.

---

## Step 4 — Where to submit

**E-filing portal:** https://cdscomdonline.gov.in
(Earlier guidance referenced cdscoonline.gov.in for drug-side filings; the
medical-device portal is `cdscomdonline.gov.in`. Confirm current URL on
cdsco.gov.in before filing.)

**Physical submission addresses:**

- *Class A / B (manufacturing in India):* file with the **State Licensing
  Authority** (the State Drug Control Department in the state where the
  manufacturing facility is located).
- *Class C / D, all imports, clinical investigations:* **Central Drugs
  Standard Control Organisation HQ**, FDA Bhawan, Kotla Road, New Delhi —
  110002. File electronically on the SUGAM / CDSCO MD portal and follow up
  with hard copies if requested.

**Fees:** application fees vary by class and form (refer to the Second
Schedule of MDR 2017). Pay via Bharatkosh; attach the e-receipt to your
application.

---

## Step 5 — Timeline expectations

These are CDSCO-published service-level targets. Real-world times routinely
run 1.5×–3× longer when queries are raised.

| Form | Class | Target SLA | Realistic range |
|------|-------|------------|-----------------|
| MD-5 | A / B (manufacturing) | ~45 working days | 2–4 months |
| MD-9 | C / D (manufacturing) | ~90 working days + inspection | 6–12 months |
| MD-12 | Test license | ~90 working days | 4–6 months |
| MD-14 | Import license | ~90 working days | 4–8 months |
| MD-20 | Export NOC | ~30 working days | 1–2 months |

Expect at least one round of CDSCO queries on a first-time submission. Plan
backwards from your target launch with a buffer of 2–3 extra months.

---

## Common rejection reasons

These show up repeatedly in CDSCO query letters. Address them before filing.

1. **Inconsistent intended use across documents.** The wording on the form,
   the Device Master File, the IFU, and the labelling must match
   word-for-word.
2. **Class proposed without IMDRF mapping.** "Class B because we say so" gets
   a query. Show the matrix.
3. **Missing Essential Principles annexure** or Essential Principles ticked
   without evidence references.
4. **Sterilisation / biocompatibility evidence not provided** for relevant
   classes (most Class C/D physical devices).
5. **Risk Management File** missing or not aligned to ISO 14971; residual
   risks not justified.
6. **For SaMD:** no Algorithm Change Protocol, no cybersecurity assessment,
   no description of post-market performance monitoring.
7. **Plant Master File / QMS gaps** — Class C/D inspections fail when ISO
   13485 implementation is on paper but not in practice on the shop floor.
8. **Fee payment mismatch** — wrong fee category or expired Bharatkosh
   challan.

---

## Want a regulatory expert to review before you file?

ClearPath offers a **Submission Concierge** service: a CDSCO-experienced
consultant reviews your Draft Pack, fixes gaps, and supports the filing. See
the email this pack arrived in for current pricing and waitlist link.
