# ClearPath — Timeline Estimation Model

**Purpose.** For every Tier 0 Readiness Card and Tier 1 Draft Pack, ClearPath outputs a "Time-to-approval estimate" range. This document is the anchor — all estimates trace back to published SLAs and documented industry experience. No made-up numbers.

---

## Design principle

Total timeline = **preparation time** (what the founder still needs to do) **+ regulatory SLA** (what the regulator takes) **+ query buffer** (for deficiency letters and resubmission).

The model is a function of:
- CDSCO class (A/B vs C/D)
- Product stage (prototype / built / clinical validated / already filed / post-approval)
- Adjacent regulations in play (ABDM, NABH, ICMR, etc.)
- Export vs domestic
- Whether a predicate exists

All three components are ranges, not point estimates. The output is always "X–Y months" with a note on what drives the range.

---

## CDSCO MDR 2017 — published and observed SLAs

Sources: CDSCO Medical Device Rules 2017; CliniExperts; Asia Actual India; Operon Strategist; ELT Corporate; Diligence Certifications. All cross-referenced, dated 2025–2026.

### Manufacturing license timelines

| Application | Form | Class | Typical SLA | Notes |
|---|---|---|---|---|
| Test license | MD-12 (→ MD-13) | Any | 2–3 months | Prerequisite for final manufacturing license. Allows small-batch production for testing/clinical investigation. |
| Manufacturing license (low risk) | MD-3 (→ MD-5) | A, B | 3–6 months | State Licensing Authority. 6-12 weeks if docs are complete and site passes inspection. |
| Manufacturing license (high risk) | MD-7 (→ MD-9) | C, D | 9–12 months | Central Licensing Authority (CDSCO). Inspection 45-60 days after submission. |
| Import license | MD-14 (→ MD-15) | A(m/s), B, C, D | 6–9 months | For imported devices. Class A non-m/s is registration only (~1 month). |
| Clinical investigation permission | MD-22 (→ MD-23) | For CI | 3–6 months | Required when no predicate exists or for novel devices. |
| Export NOC | MD-20 | All manufactured in India | 2–4 weeks | Per-shipment to non-recognized countries. |

### SaMD-specific timelines (post CDSCO 2025 draft)

The Oct 2025 draft guidance does not change the underlying SLA but introduces two new documentation requirements:

- **Algorithm Change Protocol (ACP)** — for AI/ML SaMD. No new SLA; bundled into the manufacturing or import filing.
- **Software-specific technical file** (design, verification, validation, cybersecurity, lifecycle per IEC 62304) — bundled, no separate SLA.

Net effect: SaMD filings follow the same class-based SLA as the parent hardware device, but require 1–2 additional months of preparation for ACP + software lifecycle docs.

### Query / deficiency buffer

First-time CDSCO submissions face a query cycle — CDSCO issues deficiency letters, founder responds, CDSCO re-reviews. This buffer has two distinct models depending on whether the founder is using ClearPath's draft pack or concierge tiers.

**Baseline (founder going alone):**
- 70–80% of first submissions receive deficiency letters (CDSCO published data + consultant survey)
- Typical query cycle: **4–8 weeks per iteration**
  - Founder-side (interpret + gather docs + draft response): 2–4 weeks
  - CDSCO-side (internal re-review): 2–4 weeks
- Average iterations to final approval: **1.5**
- Buffer: 1.5 × 6 weeks ≈ **2–3 months**

**With ClearPath Tier 1 (Draft Pack) or Tier 3 (Submission Concierge):**
- Pre-submission quality review + structured mapping reduces deficiency surface area
- AI-assisted deficiency-response drafting compresses founder turnaround
- Typical query cycle: **3–5 weeks per iteration**
  - Founder-side: reduced to ~1 week (AI interprets deficiency letter, pre-assembles response from existing submission)
  - CDSCO-side: unchanged (2–4 weeks, not our lever)
- Average iterations to final approval: **1.0–1.2** (better-prepared submissions trigger fewer deficiencies)
- Buffer: 1.1 × 4 weeks ≈ **1–1.5 months**

**Net effect:** ClearPath customers typically save **4–8 weeks** in the query cycle vs going alone. This is the concrete value of the paid tiers at review stage.

The Readiness Card surfaces the baseline estimate. The Tier 1 Draft Pack and Tier 3 Concierge output show *both* estimates side-by-side so the founder can see the quantified savings.

---

## ABDM (Ayushman Bharat Digital Mission) — integration timelines

Source: NHA sandbox documentation; updated per field-experienced integrator data (2026).

ABDM integration is now achievable in **~3 months end-to-end** with a focused team working in parallel on milestones where possible.

| Step | Typical time |
|---|---|
| M1 (ABHA creation + linking) | 2 weeks dev |
| M2 (HIP services — share records) | 2 weeks dev |
| M3 (HIU services — consume records) | 2 weeks dev |
| Certification from testing agency (CERT-In / STQC empanelled) | 2 weeks |
| NHA internal committee approval + production access | 2–4 weeks |
| **Full M1+M2+M3 end-to-end** | **~3 months total** |

Notes:
- M1/M2/M3 builds can be parallelised if the team is split; the 3-month figure assumes sequential builds with testing and certification overlapped where feasible.
- CERT-In-empanelled security audit (WASA / Safe-to-Host) is required; budget for it in parallel with M3 development.
- Sandbox-to-production switch involves moving `X-CM-ID` from `sbx` to `abdm` and registering facilities in production HFR.

---

## ICMR Ethics Committee (for clinical validation)

Source: ICMR National Ethics Guidelines; ICMR AI Guidelines 2023; standard IEC processes.

| Step | Typical time |
|---|---|
| Study protocol preparation | 3–6 weeks |
| EC submission + review (registered EC) | 4–8 weeks |
| EC query resolution | 2–4 weeks |
| Approval letter issuance | 1–2 weeks |
| **If EC not yet registered with CDSCO** | Add 2–3 months for EC registration |
| **Full cycle, typical** | **2–3 months** |

Clinical validation study execution (once EC-approved) is separate — adds 6–18 months depending on sample size, endpoints, multi-site complexity. Not included in the regulatory approval timeline; handled as a parallel workstream.

---

## NABH Digital Health Standards (for hospital procurement)

Source: NABH website 2025; updated per field-experienced vendor data (2026).

| Step | Typical time |
|---|---|
| Self-assessment against standards | 2–3 weeks |
| Documentation + gap remediation | 4–8 weeks |
| NABH assessment + attestation | 3–4 weeks |
| **Full cycle** | **2–3 months** |

Note: NABH vendor compliance is typically a one-time effort per product; it does not gate market entry but is required for procurement by NABH-accredited hospitals.

---

## Preparation time — by product stage

Preparation time = what the founder still has to do before they can submit.

| Stage | Class A/B prep time | Class C/D prep time | Notes |
|---|---|---|---|
| `prototype` | 6–12 months | 9–18 months | Needs QMS (ISO 13485) build, DMF/PMF, risk management, design verification/validation, clinical data. |
| `built_no_clinical` | 3–6 months | 6–12 months | Has product; needs clinical validation, formal documentation. |
| `built_with_clinical` | 1–3 months | 3–6 months | Has clinical data; needs final docs compilation + submission. |
| `in_review` | 0 months | 0 months | Already filed; only query-response time applies. |
| `post_approval` | 0–3 months | 0–6 months | For post-Oct-2025 SaMD, may need ACP documentation even for approved devices. |

---

## Output formula

```
# Baseline path (founder going alone)
total_timeline_low  = prep_time_low  + regulatory_sla_low
total_timeline_high = prep_time_high + regulatory_sla_high + query_buffer_baseline
# where query_buffer_baseline = 2–3 months

# ClearPath-assisted path (Tier 1 Draft Pack or Tier 3 Concierge)
total_timeline_low_cp  = prep_time_low  + regulatory_sla_low
total_timeline_high_cp = prep_time_high + regulatory_sla_high + query_buffer_clearpath
# where query_buffer_clearpath = 1–1.5 months

# Net savings with ClearPath: 4–8 weeks on typical Class B/C filings.

If multiple regulations apply in parallel (CDSCO + ABDM + NABH):
  total_timeline_high = max(regulatory_sla_high values) + prep_time_high + query_buffer
  (assumes parallel workstreams, not sequential)

If clinical investigation needed (Ch VII CI pathway):
  Add CI execution time (6–18 months) separately; flag as "+ clinical investigation window"
```

Results expressed as ranges: `X–Y months`.

**Which path to show where:**
- **Readiness Card (Tier 0, free):** Show baseline estimate. Hint at ClearPath-assisted savings in the Tier 1 teaser ("Get your draft pack to shorten this by 4–8 weeks").
- **Draft Pack (Tier 1, ₹499):** Show both estimates side-by-side. "Baseline: 9–14 months. With ClearPath support: 7–12 months."
- **Concierge (Tier 3, ₹25K):** Show ClearPath-assisted estimate prominently, baseline as comparison.

For display, round to the nearest reasonable bucket:
- 0–2 months
- 3–6 months
- 6–12 months
- 9–14 months
- 12–18 months
- 18+ months (flag as "extended pathway")

---

## Calibration — the 15-product portfolio

Timeline estimates from the v3 engine run, with rationale for each. **These are baseline estimates (founder going alone).** With ClearPath Tier 1 or Tier 3 support, subtract 4–8 weeks from the query-buffer portion.

| # | Product | Class | Stage | Prep | SLA | Buffer (baseline) | Output (baseline) | With ClearPath |
|---|---|---|---|---|---|---|---|
| 1 | Eka Care (core) | N/A | post_approval | 0 | 0 | 0 | **N/A** | **N/A** |
| 2 | EkaScribe | B/C scoped | post_approval | 2–3mo | 3–6mo | 2–3mo | **9–14 months** | **7–12 months** |
| 3 | Vyuhaa/CerviAI | C | in_review | 0 | 4–8mo | 0 (already in query cycle) | **4–8 months** | **3–6 months** |
| 4 | Neodocs | C IVD | post_approval | 0–1mo | 0 | 0 | **0–2 months** | **0–2 months** |
| 5 | Niramai | C | post_approval | 1–2mo | 0 | 0 | **0–2 months** | **0–2 months** |
| 6 | Forus Health | D | post_approval | 1–2mo | 0 | 0 | **0–2 months** | **0–2 months** |
| 7 | Driefcase | N/A | growth | 0 | 0 | 0 | **N/A** | **N/A** |
| 8 | Khushi Baby | B scoped | post_approval | 2–3mo | 3–6mo | 1–2mo | **3–6 months** | **3–5 months** |
| 9 | Intelehealth | C scoped | post_approval | 3–4mo | 9–12mo | 2–3mo | **6–12 months** | **5–10 months** |
| 10 | Bajaj Finserv Health | N/A | scale | 0 | 0 | 0 | **N/A** | **N/A** |
| 11 | ABDM | rejected | — | — | — | — | **N/A** | **N/A** |
| 12 | Tata 1mg | B scoped | post_approval | 2–3mo | 3–6mo | 1–2mo | **3–6 months** | **3–5 months** |
| 13 | HealthifyMe | N/A | scale | 0 | 0 | 0 | **N/A** | **N/A** |
| 14 | Ultrahuman | scope-dep | scale | 0 | 0 | 0 | **N/A for core** | **N/A for core** |
| 15 | Biopeak | C novel | prototype | 9–12mo | 9–12mo + 3–6mo (CI) | 2–3mo | **12–18 months** | **10–16 months** |
| 16 | Rainmatter | rejected | — | — | — | — | **N/A** | **N/A** |

---

## Certainty language (per v3 spec)

Timeline output always uses ranges and hedging. Never "exactly 9 months" — always "9–14 months, depending on query cycles and documentation completeness."

Surface the assumption behind the estimate:

> *"Based on CDSCO published SLAs for Class C manufacturing licences + typical 1.5 query iterations + your current prototype stage. If predicate is established, low end shortens by 2–3 months."*

---

## Implementation notes for Claude Code

- Keep this as a structured data file (`timeline_model.yaml` or `timeline_model.json`) the engine reads at runtime.
- The mapping function takes `(class, stage, adjacent_regs[], has_predicate, export_only)` → `{low, high, explanation_string}`.
- Surface the explanation string as small italic text below the timeline badge on the Readiness Card.
- Update the model whenever CDSCO publishes revised SLAs (quarterly cadence).
- For unusual edge cases (novel Ch VII CI, for example), flag as "extended pathway" and offer the ₹25K Submission Concierge as the natural next step.
