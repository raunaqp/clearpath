# Hardware Submission Pack — Section Matrix (₹2,499 Tier 2, manufacturer_hardware persona)

**Status:** Draft v1 — pending founder + Stream A review before pack build starts.
**Owner:** Sprint 3 Phase 2c.
**Source:** Derived from `docs/specs/cdsco-regulatory-forms-reference.md` §4 (manufacturer journey) and §8.1–§8.20 (DMF sub-sections), Sprint 2 SaMD 12-section pack precedent, and Sprint 3 scope discussion.

---

## Product boundary

This pack is the **₹2,499 Tier 2 deliverable** for `manufacturer_hardware` persona. It produces editable, founder-facing submission-pack content — not the readiness assessment (Tier 0/1's job).

- **Generator:** new hardware variant of `draft-pack-v2`, reuses SaMD section generators where the source data is the same
- **Renderer:** existing `/draft/[id]` editor + headless-Chromium PDF export
- **Cost target:** ~$0.50 / run (SaMD pack parity)
- **Generation time:** 4–6 minutes (parity with SaMD pack)

---

## Locked decisions (do not re-litigate during build)

1. **PMF + QMS = attestation checklists, NOT LLM-drafted prose.** Site-specific facts; founder confirms each sub-section exists in their internal docs. The LLM doesn't invent these.
2. **Inference markers carry through.** Every `[ESTIMATED]/[ASSUMED]/[EXTRACTED]` marker from the card propagates into the pack so the founder sees the same assumptions and can correct them in the editor.
3. **softenCertainty() runs at BOTH generator and renderer stages.** No hard "Class C" / "must" / "is required" anywhere.
4. **Software gates (IEC 62304 / ACP / IEC 81001-5-1) appear ONLY when `software_in_device = true` or `q5/q6` indicate connectivity/PHI.** Pure-hardware devices must not show software gates.
5. **Form path follows class:** Class A non-sterile/non-measuring → Portal self-notification; Class A sterile/measuring + Class B → MD-3 → MD-5 (SLA); Class C/D → MD-7 → MD-9 (CLA). No-predicate adds MD-26 → MD-27. Clinical-investigation-required path adds MD-12 → MD-13 → MD-22/23.
6. **The 12 SaMD generators that reuse must respect persona-specific overlays** (e.g. Classification section uses hardware A/B/C/D logic, not the SaMD Q1×Q2 matrix).

---

## The 19 sections

| # | Section | Bible source | Origin | Gen type | Notes |
|---|---|---|---|---|---|
| 1 | Executive Summary | DMF §8.1 | Reuse SaMD §01 | LLM (Opus consolidator) | Reads all other sections; emits last |
| 2 | Device Description | DMF §8.2 + §8.3 | Reuse SaMD §02 | LLM (Sonnet) | |
| 3 | Intended Use | DMF §8.2.* | Reuse SaMD §03 | LLM (Sonnet) | |
| 4 | Classification & Risk | §4 lines 167–173 + DMF §8.4 | **Reuse w/ hardware overlay** | LLM (Sonnet) | Hardware A/B/C/D derivation from contact + sterile + drug + radiation. NOT SaMD Q1×Q2. Calls out MD-3 vs MD-7 path. |
| 5 | Product Specification | DMF §8.4 | Reuse SaMD §05 | LLM (Sonnet) | |
| 6 | Predicate Comparison | DMF §8.5 | **Reuse w/ overlay** | LLM (Sonnet) | If `q8_predicate_exists = no`, flags MD-26/MD-27 pre-permission as required |
| 7 | Labelling | DMF §8.6 | Reuse SaMD §07 | LLM (Sonnet) | |
| 8 | Design & Manufacturing | DMF §8.7 | **Reuse w/ overlay** | LLM (Sonnet) | Hardware BOM + process steps; no software lifecycle here |
| 9 | Essential Principles Conformity | DMF §8.8 | Reuse SaMD §09 | LLM (Sonnet) | Universal checklist; same for both personas |
| 10 | Risk Management (ISO 14971) | DMF §8.9 | Reuse SaMD §10 | LLM (Sonnet) | |
| 11 | Verification & Validation | DMF §8.10 | **Reuse w/ overlay** | LLM (Sonnet) | Skip software V&V sub-block unless `software_in_device = true` |
| 12 | Clinical Evidence & PMS | DMF §8.18 + §8.19 | Reuse SaMD §12 | LLM (Sonnet) | |
| 13 | **Biocompatibility (ISO 10993)** | DMF §8.11 (line 298) | **NEW** | LLM (Sonnet) | **Gated on `q9_patient_contact != no_contact`.** Tier-matched: surface contact → 10993-5/-10; mucosal → +10993-23; blood-path → +10993-4; implant → +10993-6/-11; resorbable → +10993-13/-17/-18 (degradation/leachables). |
| 14 | **Sterilization Validation** | DMF §8.14 (line 301) | **NEW** | Template + LLM rationale | **Gated on `sterile = yes`.** Method-specific standard (ISO 11135 EO / ISO 11137 radiation / ISO 17665 steam / aseptic). Founder selects method; LLM drafts the validation-rationale narrative. |
| 15 | **Stability Data** | DMF §8.17 (line 304) | **NEW** | Template | Real-time + accelerated, always present for hardware. Mostly structural placeholder rows founder fills in editor. |
| 16 | **Batch Release Certificates** | DMF §8.20 (line 307) | **NEW** | Template | ≥3 batch CoA checklist. Founder confirms availability + attaches in editor. |
| 17 | **Plant Master File attestation** | Block 2, lines 256–269 (11 sub-sections) | **NEW** | Attestation checklist | NOT LLM-drafted. Founder confirms each of the 11 PMF sub-sections exists in their internal docs. |
| 18 | **QMS Compliance attestation** | Block 3, lines 270–284 (11 sub-sections) | **NEW** | Attestation checklist | NOT LLM-drafted. Founder confirms each of the 11 QMS sub-sections exists in their internal docs. |
| 19 | **Conditional NOCs & Adjacent Permissions** | Blocks 5 + 6, lines 309–322 | **NEW** | Template | Surfaces DAHD / BARC / PNDT / DCG(I) NOCs based on wizard answers (veterinary / radiation / PNDT-scope / drug-content). Conditionally appears.|

**Reuse count:** 12 SaMD generators reused (4 with hardware overlay)
**New:** 7 sections (only 2 — Biocomp, Sterilization — need LLM reasoning; 5 are deterministic templates or attestation checklists)

---

## Gating rules — when sections appear or stay quiet

| Section | Always present | Gated on |
|---|---|---|
| 13 Biocompatibility | — | `q9_patient_contact != no_contact` |
| 14 Sterilization | — | `sterile_inferred = yes` OR founder confirms `sterile = yes` |
| 15 Stability | ✓ (hardware always) | — |
| 16 Batch Release | ✓ (hardware always) | — |
| 17 PMF attestation | ✓ | — |
| 18 QMS attestation | ✓ | — |
| 19 Conditional NOCs | — | At least one applicable: veterinary / ionising radiation / PNDT-scope / drug-content |
| Software gates anywhere | — | `software_in_device = true` (from one-liner / pitch-extract / connectivity signal) |

---

## Cost model

| Component | Calls | Cost |
|---|---|---|
| Sections 2–12 LLM (Sonnet body sections) | ~11 | ~$0.30 |
| Sections 13–14 LLM (Biocomp, Sterilization rationale) | 2 | ~$0.06 |
| Section 1 Executive Summary (Opus consolidator) | 1 | ~$0.12 |
| Templates (15, 16, 17, 18, 19) | 0 LLM | $0 |
| **Total target** | **~14 LLM calls** | **~$0.48 / run** |

PMF/QMS as attestation checklists is the cost lever. If those flipped to full LLM-drafted prose, cost ~$0.80, timeline +1–1.5 days.

---

## Failure modes to design against

1. **Software-gate leak into pure hardware.** Class C hardware (e.g. sterile implant, no software) must NOT show IEC 62304 / ACP / 81001-5-1 sections. Guard with explicit `software_in_device` check before including those sub-blocks anywhere.
2. **Biocomp missing for blood/invasive/implant contact.** Section 13 must appear; this was the Day-2 smoke finding for the glucometer case (biocomp got crowded out of top-3 card gaps). The pack version must not have the same crowding risk — it's a full section, not a gap-list slot.
3. **Form-mapping regression.** Class C/D must produce MD-7 → MD-9, never MD-3 → MD-5 or "MD-12 manufacturing licence" (the ₹499 SaMD bug). Class-derived form helper from the ₹499 fix is the model.
4. **PMF/QMS LLM-drift.** These are checklists; if any LLM call is sneaking prose into PMF/QMS, that's a defect.
5. **Inference markers stripped.** Markers from the card must appear consistently on the pack's relevant sections, not just at top-of-document.

---

## Verification before pack ships

1. Build against this matrix; smoke-test against 3 hardware product types (e.g. drug-eluting stent / disposable BP cuff / connected glucometer — same Day-1/Day-2 cases). Confirm:
   - All 19 sections render (with gating rules respected — section 13 only if patient-contact; 14 only if sterile; etc.)
   - No software-gate leak in the no-software cases
   - Form-mapping correct for each (MD-7/MD-9 for C/D; MD-3/MD-5 for A/B)
   - Inference markers visible on the rendered pack
   - Cost in line (~$0.48 / run)
2. Generate a full pack against a real persisted assessment (the same hardware stent the ₹499 was verified on)
3. Spot-check 2–3 sections for hallucination / device-mismatch
4. Founder eyeballs the rendered PDF + the editor view

---

## Open questions / things this draft is guessing on

- **Are exactly these 7 new sections the right ones?** Stream A's earlier proposal listed these; I haven't verified against bible §4 line numbers exhaustively. Stream A should reconcile against `cdsco-regulatory-forms-reference.md` before building.
- **Section ordering** — currently follows DMF §8.x. Stream A may want to surface a different order for editor UX (e.g. attestations grouped at the end?).
- **Conditional NOCs (section 19)** — whether to render as a single section or split per applicable NOC type. Stream A's call.
- **How the editor surfaces attestation checklists (17, 18) vs LLM prose sections** — needs a UI decision, not in this matrix.