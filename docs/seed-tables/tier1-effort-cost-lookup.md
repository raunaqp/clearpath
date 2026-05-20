# Tier 1 effort/cost lookup — seed values for review

**Purpose:** these numbers drive the `estimated_effort` column in
Section 3 (Readiness Gap Analysis) of the ₹499 Regulatory Readiness
Report, and the per-phase cost in Section 4 (Timeline + Cost).

**Review status:** every row below is currently `estimate`. A wrong
cost estimate or effort range hurts a paying founder directly —
this table is moat content. Founder (or the CDSCO consultant) signs
off each row → status flips to `reviewed` and we ship.

**Mechanics:**
- The generator matches each readiness-card `top_gaps[]` row to one
  entry below — first by regex against `gap_title`, then by
  fallback `dim`.
- Unmatched gaps fall back to a generic band (2–4 months · ₹1–3L).
- Source of truth for the live values: `lib/engine/tier1-effort-cost-lookup.ts`.

**Calibration baseline** (used to anchor the estimates):
- Consultant rate: ₹1.5–3L per consultant-month (regulatory / QMS / clinical)
- ISO 13485 cert path: ₹2.5–4L over 6–9 months
- Single-centre EC + biostat + monitoring: ₹3–6L per centre
- Multi-centre pivotal study: ₹8–18L total
- CTRI registration: nominal, ~₹5–10k
- Cybersecurity threat model + pen test: ₹1.5–3L
- Usability summative study: ₹1–2.5L

---

## Lookup table

| Key | Display name | Triggered by (patterns) | Fallback dim | Effort | Cost | Status |
|---|---|---|---|---|---|---|
| `iso_13485_qms` | ISO 13485 QMS | "ISO 13485", "QMS", "Quality Management System" | quality_system | 6–9 months | ₹3–5L | estimate |
| `iec_62304_sdlc` | IEC 62304 software lifecycle | "IEC 62304", "software lifecycle", "SDLC" | technical_docs | 4–6 months | ₹2–4L | estimate |
| `clinical_validation` | Clinical validation evidence | "clinical validation", "clinical evidence", "pivotal", "multi-centre", "EC approval", "CTRI" | clinical_evidence | 9–14 months | ₹8–18L | estimate |
| `risk_management_iso_14971` | Risk Management File (ISO 14971) | "ISO 14971", "risk management", "RMF" | technical_docs | 2–3 months | ₹1–2L | estimate |
| `dpdp_compliance` | DPDP compliance workflow | "DPDP", "privacy notice", "consent", "breach response" | dpdp, regulatory_clarity | 2–4 months | ₹2–4L | estimate |
| `cybersecurity_iec_81001` | Cybersecurity (IEC 81001-5-1) | "cybersecurity", "IEC 81001", "threat model", "pen-test" | technical_docs | 3–5 months | ₹2–5L | estimate |
| `usability_iec_62366` | Usability engineering (IEC 62366-1) | "usability", "IEC 62366", "human factors", "formative / summative evaluation" | technical_docs | 2–4 months | ₹1–3L | estimate |
| `acp_pccp` | Algorithm Change Protocol | "ACP", "PCCP", "algorithm change", "adaptive AI" | technical_docs | 3–5 months | ₹2–4L | estimate |
| `predicate_research` | Predicate / substantial-equivalence | "predicate", "substantial equivalence", "MD-26", "MD-27" | regulatory_clarity | 1–2 months | ₹0.5–1.5L | estimate |
| `intended_use_drafting` | Intended Use Statement drafting | "intended use", "classification rationale", "feature-creep", "scope boundary" | regulatory_clarity | 1–2 months | ₹0.3–1L | estimate |
| `pms_plan` | Post-market surveillance plan | "post-market", "PMS", "PMCF", "complaint handling" | submission_maturity | 2–3 months | ₹1–3L | estimate |
| `labelling_ifu` | Labelling + IFU | "labelling", "labeling", "IFU", "instructions for use" | submission_maturity | 1–2 months | ₹0.5–2L | estimate |
| `abdm_fhir_integration` | ABDM / FHIR integration | "ABDM", "FHIR", "Milestone 1 ABDM" | abdm | 2–4 months | ₹1.5–3L | estimate |
| `icmr_ai_ethics` | ICMR AI ethics review | "ICMR", "AI ethics", "ethical considerations", "bias evaluation" | clinical_evidence | 1–2 months | ₹0.5–1.5L | estimate |
| **fallback** | Generic compliance gap | (no pattern / dim match) | — | 2–4 months | ₹1–3L | estimate |

---

## Per-row review notes (where uncertainty is highest)

- `clinical_validation` — the **single biggest** driver of the report's headline timeline + cost. ₹8–18L assumes a 2–3 centre study with ~150–300 enrolment. If you expect single-centre or retrospective designs, costs drop to ₹3–6L. **[REVIEW PRIORITY]**
- `iso_13485_qms` — ₹3–5L bundles consultant + audit + certification body fees. Could be lower (₹2–3L) with a minimalist DIY approach, higher (₹5–8L) with a Big-Four-style consultant.
- `acp_pccp` — Oct 2025 CDSCO SaMD draft is still draft. Real-world filings haven't normalised yet. Numbers are inferred from FDA PCCP analogues. **[REVIEW PRIORITY when consultant validates the Oct 2025 draft.]**
- `cybersecurity_iec_81001` — depends heavily on cloud architecture complexity and deployment model. CERT-In safe-to-host adds ₹50k–1L on top.
- `abdm_fhir_integration` — only triggers when ABDM is in scope. The cost assumes outsourced FHIR adapter dev; in-house teams can absorb this in 4–6 weeks of engineering time.

---

## How to flip a row to `reviewed`

1. Open `lib/engine/tier1-effort-cost-lookup.ts`.
2. Find the entry by `key`.
3. Adjust `effort_months.low/high` and `cost_inr_lakhs.low/high` if needed.
4. Change `review_status: "estimate"` → `review_status: "reviewed"`.
5. Update the corresponding row in this table.

---

## Cross-references

- The matching logic + helper format functions live in `lib/engine/tier1-effort-cost-lookup.ts`.
- The bible (`docs/specs/cdsco-regulatory-forms-reference.md`) is the regulatory anchor; see §4 (class-specific scrutiny), §33 (form-trigger matrix), §27 (Sprint 3+ expansion roadmap).
- Phase 1.6 product brief + build brief are the spec source for what fields the report renders.
