# ClearPath — The 9 Regulations Reference

Every product ClearPath evaluates is checked against these 9 regulations. Each one has specific triggers, forms, timelines, and verdict values.

---

## 1. CDSCO MDR 2017 — Medical Device Rules

**Governing body:** Central Drugs Standard Control Organization (Ministry of Health & Family Welfare)
**Issued:** 2017, with Draft SaMD Guidance 21 Oct 2025
**Key URL:** https://cdscomdonline.gov.in

**Triggers when the product:**
- Diagnoses, treats, monitors, or prevents disease
- Software that influences clinical management (SaMD)
- Hardware + embedded firmware (SiMD — inherits hardware class)
- Includes AI/ML in clinical context (triggers Algorithm Change Protocol)

**Does NOT apply to:**
- Pure records / data platforms ("data management or general communication")
- Scheduling, billing, administrative software
- Wellness apps, fitness trackers, lifestyle tools

**Classes:** A (low), B (low-mod), C (mod-high), D (high) based on IMDRF matrix (clinical state × info significance)

**Forms (MDR 2017):**
| Form | Purpose |
|------|---------|
| MD-5 | Manufacturing license, Class A/B (state authority) |
| MD-9 | Manufacturing license, Class C/D (central authority) |
| MD-12 | Test license (for clinical investigation) |
| MD-14 | Import license |
| MD-20 | No Objection Certificate for Export |
| MD-22 | Clinical Investigation approval |
| MD-23 | Clinical Performance Evaluation for IVDs |

Plus (from Oct 2025 draft SaMD guidance):
- **Algorithm Change Protocol (ACP)** — mandatory for AI/ML SaMD, governs retraining disclosure

**Typical SLA (CDSCO published):**
- Test license (MD-12): ~90 working days
- Manufacturing license Class A/B (MD-5): ~45 working days
- Manufacturing license Class C/D (MD-9): ~90 working days + inspection
- Import license (MD-14): ~90 working days

**Verdict values in ClearPath:**
- `required` — Clear medical device
- `not_applicable` — Not a medical device (records, scheduling, wellness)
- `required_sub_feature` — Core isn't, but a feature is (needs sub-feature scoping)

---

## 2. CDSCO Pharmacy (Drugs & Cosmetics Act 1940)

**Governing body:** CDSCO + State Drug Control Authorities
**Issued:** 1940 (amended multiple times)

**Triggers when the product:**
- Sells, distributes, or dispenses prescription drugs
- Operates online pharmacy / e-commerce for drugs
- Imports, stores, or wholesales pharmaceuticals

**Does NOT apply to:**
- Generic health records platforms
- Medical devices (those go through MDR 2017 instead)

**Forms:**
| Form | Purpose |
|------|---------|
| Form 20 | Retail sale license (allopathy) |
| Form 20-A | Retail restricted license |
| Form 21 | Wholesale license |
| Form 25 | Manufacturing license (drugs) — out of ClearPath v1 scope |

**Typical SLA:**
- State retail license (Form 20): 30–60 days
- Wholesale (Form 21): 30–60 days

**Verdict values:**
- `required` — Platform sells drugs
- `not_applicable` — No drug sales

**Common case:** Tata 1mg triggers this (pharmacy e-commerce), NOT MDR.

---

## 3. DPDP Act 2023 — Digital Personal Data Protection Act

**Governing body:** Data Protection Board of India (under MeitY)
**Issued:** 11 Aug 2023; enforcement phased in through 2025–2026

**Triggers when the product:**
- Processes personal data of Indians (any scale)
- Processes health data (always "sensitive personal data")
- Has 10 lakh+ users (likely Significant Data Fiduciary designation)
- Does cross-border data transfer

**Key obligations:**
- Lawful processing with explicit consent
- Purpose limitation, data minimization
- Rights-of-data-principal workflows (access, correction, deletion)
- Breach notification

**Additional for Significant Data Fiduciaries (SDF):**
- Appoint Data Protection Officer (DPO)
- Annual Data Protection Impact Assessment (DPIA)
- Independent audits
- Higher grievance redressal obligations

**Typical SLA:** No license pre-approval — compliance obligations are continuous. Audit prep: 3–6 months for SDF.

**Verdict values:**
- `required` — Any personal data of Indians
- `required_SDF` — Above 10L users or handling highly sensitive data
- `not_applicable` — No Indian user data

**Every digital health product gets at minimum `required`.**

---

## 4. ICMR Ethical Guidelines for AI in Healthcare 2023

**Governing body:** Indian Council of Medical Research (Ministry of Health)
**Issued:** 2023

**Triggers when the product:**
- Uses AI/ML for clinical diagnosis, prognosis, treatment
- Conducts clinical validation studies
- Requires Ethics Committee (EC) approval for research

**Does NOT apply to:**
- Pure records / data platforms
- Wellness apps without clinical claims
- Administrative / admin tools

**Key requirements:**
- EC approval for all AI-in-clinical-use validation studies
- Informed consent framework
- Dataset diversity and bias documentation
- Clinical safety monitoring

**Typical SLA:**
- EC approval: 4–8 weeks after submission
- Validation study: 6–12 months for meaningful evidence

**Verdict values:**
- `required` — AI in clinical context needing validation
- `conditional` — AI product but no clinical claims yet
- `not_applicable` — No AI or no clinical use

---

## 5. ABDM Consent Framework

**Governing body:** National Health Authority (NHA), Ministry of Health
**Launched:** 2021, V3 APIs current standard

**Triggers when the product:**
- Integrates with ABHA (health ID)
- Is a Health Information Provider (HIP) — stores/shares records
- Is a Health Information User (HIU) — fetches records
- Deploys at government hospitals (often mandatory there)

**Milestones (certification per-software):**
- **M1** — ABHA creation + link records
- **M2** — HIP services (share records on consent)
- **M3** — HIU services (fetch records on consent)

**Additional requirements:**
- CERT-In Safe-to-Host certificate (security audit by CERT-IN empaneled agency)
- FHIR R4 standard for all health data
- OAuth 2.0 auth, TLS 1.2+, AES-256 encryption

**Typical SLA:**
- Sandbox → Production: 3–6 months end-to-end (including M1/M2/M3 + security audit)

**Verdict values:**
- `required` — Gov hospital deployment or explicit ABDM integration
- `conditional` — Private deployment, ABDM optional but recommended
- `optional` — d2c consumer product, no hospital integration
- `core_compliance_achieved` — Already M1/M2/M3 certified (e.g., Eka Care)

---

## 6. NABH Digital Health Standards

**Governing body:** Quality Council of India — National Accreditation Board for Hospitals
**Standards:** Digital Health Standards for hospital IT systems

**Triggers when the product:**
- Sells to NABH-accredited hospitals (increasingly mandatory for vendor procurement)
- Operates as hospital IT / EHR / HMIS

**Verdict values:**
- `required_for_procurement` — Selling to NABH-accredited hospitals
- `conditional` — Mixed customer base
- `optional` — d2c or non-hospital

---

## 7. MCI / NMC Telemedicine Practice Guidelines 2020

**Governing body:** National Medical Commission (formerly MCI)
**Issued:** March 2020

**Triggers when the product:**
- Facilitates doctor-patient teleconsultations
- Platform for asynchronous clinical communication
- Any remote medical advice involving RMPs

**Key requirements:**
- Registered Medical Practitioner (RMP) must hold valid registration
- Display professional registration details
- Secure consultation channel
- Proper record-keeping
- Informed consent from patient
- No prescription of narcotics via telemedicine

**Verdict values:**
- `required` — Any telemedicine/consult facilitation
- `not_applicable` — No consultation feature

---

## 8. IRDAI Regulations

**Governing body:** Insurance Regulatory and Development Authority of India (Ministry of Finance)

**Triggers when the product:**
- Distributes or sells health insurance
- Operates as insurance aggregator
- Underwrites or offers insurance-linked health products
- Health financing / EMI linked to medical expenses (certain structures)

**Key licenses:**
- Insurance Broker License (for aggregation)
- Web Aggregator License

**Verdict values:**
- `required` — Insurance distribution/aggregation
- `not_applicable` — No insurance feature

---

## 9. NABL Accreditation

**Governing body:** Quality Council of India — National Accreditation Board for Testing and Calibration Laboratories

**Triggers when the product:**
- Operates own clinical / diagnostic / pathology labs
- IVD manufacturer needs NABL-accredited lab for validation studies
- Report-generating diagnostic services

**Key requirements:**
- ISO 15189 compliance (medical labs)
- Quality management system
- Internal + external quality controls
- Accredited scope

**Typical SLA:** 6–12 months to achieve accreditation.

**Verdict values:**
- `required` — Own labs / IVD validation
- `conditional` — Third-party lab partners (they need NABL, not you)
- `not_applicable` — No lab operations

---

## Cross-reference: which regulations apply to common product types

| Product type | CDSCO MDR | CDSCO Pharm | DPDP | ICMR | ABDM | NABH | MCI | IRDAI | NABL |
|---|---|---|---|---|---|---|---|---|---|
| AI diagnostic device | ✓ C/D | — | ✓ SDF | ✓ | cond | req | — | — | cond |
| PHR / EHR platform | — | — | ✓ SDF | — | ✓ | req | — | — | — |
| Telemedicine + AI-CDS | ✓ scoped | — | ✓ | ✓ | req | cond | ✓ | — | — |
| Pharmacy e-commerce | — | ✓ | ✓ SDF | — | cond | — | — | — | — |
| Wellness app | — | — | ✓ | — | opt | — | — | — | — |
| At-home IVD kits | ✓ C | — | ✓ | ✓ | — | — | — | — | ✓ |
| Health insurance aggregator | — | — | ✓ SDF | — | cond | — | — | ✓ | — |
| Hospital HMIS vendor | — | — | ✓ | — | req | req | — | — | — |
