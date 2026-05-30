# Hardware Submission Pack — Section Matrix (₹2,499 Tier 2, manufacturer_hardware persona)

**Status:** v2 — reconciled against bible §4 + §8.x (2026-05-29). Approved for build.
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
| 4 | Classification & Pathway | §4 sub-case table (lines 167–173) + DMF §8.1 | **Reuse w/ hardware overlay** | LLM (Sonnet) | Hardware A/B/C/D derivation from contact + sterile + drug + radiation. NOT SaMD Q1×Q2. Calls out MD-3 vs MD-7 path. Risk content lives in §10, not here. |
| 5 | Product Specification | DMF §8.4 | Reuse SaMD §05 | LLM (Sonnet) | |
| 6 | Predicate Comparison | DMF §8.5 | **Reuse w/ overlay** | LLM (Sonnet) | If `q8_predicate_exists = no`, flags MD-26/MD-27 pre-permission as required |
| 7 | Labelling | DMF §8.6 | Reuse SaMD §07 | LLM (Sonnet) | |
| 8 | Design & Manufacturing | DMF §8.7 + §8.12 (drug content sub-block) | **Reuse w/ overlay** | LLM (Sonnet) | Hardware BOM + process steps; no software lifecycle here. **Conditional sub-block: §8.12 medicinal-substances data** when `drug_content !== "no"` — describes drug component, leachables source, DCG(I) joint review note. |
| 9 | Essential Principles Conformity | DMF §8.8 | Reuse SaMD §09 | LLM (Sonnet) | Universal checklist; same for both personas |
| 10 | Risk Management (ISO 14971) | DMF §8.9 | Reuse SaMD §10 | LLM (Sonnet) | |
| 11 | Verification & Validation | DMF §8.10 + §8.15 (software V&V sub-block) | **Reuse w/ overlay** | LLM (Sonnet) | Always emits hardware V&V (electrical/mechanical/performance per IEC 60601-family + product standards). **Conditional structured sub-block: §8.15 software V&V** (`software_vv: { lifecycle_model, classification, verification_methods, test_evidence }` or null) when `software_in_device = true`. Schema-locked, not free prose, so it doesn't drift across runs. |
| 12 | Clinical Evidence & PMS | DMF §8.18 + §8.19 + §8.16 (animal preclinical sub-block) | **Reuse w/ overlay** | LLM (Sonnet) | **Conditional sub-block: §8.16 animal preclinical** when `patient_contact ∈ {invasive_long_term_30d, implant_gt_30d}` OR `drug_content !== "no"`. Frames animal data as preceding clinical evidence; references species, study design, endpoints. |
| 13 | **Biocompatibility (ISO 10993)** | DMF §8.11 (line 298) | **NEW** | LLM (Sonnet) | **Gated on `q9_patient_contact != no_contact`.** Tier-matched: surface contact → 10993-5/-10; mucosal → +10993-23; blood-path → +10993-4; implant → +10993-6/-11; resorbable → +10993-13/-17/-18 (degradation/leachables). |
| 14 | **Sterilization Validation** | DMF §8.14 (line 301) | **NEW** | Template + LLM rationale | **Gated on `sterile = yes`.** Method-specific standard (ISO 11135 EO / ISO 11137 radiation / ISO 17665 steam / aseptic). Founder selects method; LLM drafts the validation-rationale narrative. |
| 15 | **Stability Data** | DMF §8.17 (line 304) | **NEW** | Template | Real-time + accelerated, always present for hardware. Mostly structural placeholder rows founder fills in editor. |
| 16 | **Batch Release Certificates** | DMF §8.20 (line 307) | **NEW** | Template | ≥3 batch CoA checklist. Founder confirms availability + attaches in editor. |
| 17 | **Plant Master File attestation** | Block 2, lines 256–269 (11 sub-sections) | **NEW** | Attestation checklist | NOT LLM-drafted. Founder confirms each of the 11 PMF sub-sections exists in their internal docs. |
| 18 | **QMS Compliance attestation** | Block 3, lines 270–284 (11 sub-sections) | **NEW** | Attestation checklist | NOT LLM-drafted. Founder confirms each of the 11 QMS sub-sections exists in their internal docs. |
| 19 | **Conditional NOCs & Adjacent Permissions** | Blocks 5 + 6, lines 309–322 | **NEW** | Template | Surfaces DAHD / BARC / PNDT / DCG(I) NOCs based on wizard answers (veterinary / radiation / PNDT-scope / drug-content). Conditionally appears.|

**Reuse count:** 12 SaMD generators reused (5 with hardware overlay — §4, §6, §8, §11, §12)
**New:** 7 sections (only 2 — Biocomp, Sterilization — need LLM reasoning; 5 are deterministic templates or attestation checklists)
**Conditional sub-blocks nested in existing sections:** §8.12 medicinal substances (in §8), §8.15 software V&V (in §11), §8.16 animal preclinical (in §12). Bible-mandated dossier content that doesn't deserve its own top-level section but must surface when triggered.

---

## Gating rules — when sections appear or stay quiet

| Section / sub-block | Always present | Gated on | Field source |
|---|---|---|---|
| 13 Biocompatibility | — | `q9_patient_contact !== "no_contact"` | Wizard-explicit (Q9) |
| 14 Sterilization | — | `sterile === "yes"` OR marker present | Inference marker `sterile` (default-INCLUDE on presence) |
| 15 Stability | ✓ (hardware always) | — | — |
| 16 Batch Release | ✓ (hardware always) | — | — |
| 17 PMF attestation | ✓ | — | — |
| 18 QMS attestation | ✓ | — | — |
| 19 Conditional NOCs | — | At least one trigger fires: `veterinary_use !== "humans_only"` / `ionising_radiation === "yes"` / `pndt_in_scope` / `drug_content !== "no"` | Inference markers + Q8 derivation |
| §8.12 drug sub-block (in §8) | — | `drug_content !== "no"` | Inference marker `drug_content` |
| §8.15 software V&V sub-block (in §11) | — | `software_in_device === true` | Inference marker `software_in_device` |
| §8.16 animal preclinical sub-block (in §12) | — | `patient_contact ∈ {invasive_long_term_30d, implant_gt_30d}` OR `drug_content !== "no"` | Wizard-explicit (Q9) + marker |
| MD-26/MD-27 callout in §6 | — | `q8_predicate_exists === "no"` | Wizard-explicit (Q8) |

**Standing rule for gated sections — blast-radius safeguard.**
For inferred fields (synthesizer-emitted markers — `sterile`, `software_in_device`, `drug_content`, `ionising_radiation`, `veterinary_use`, `measuring_function`): when a marker is present, the gated section/sub-block is **included** with `[ASSUMED YES — confirm in editor]` framing, regardless of the inferred direction. A wrong-included section is removable in the editor; a wrong-omitted section is invisible and a regulator catches it.
For wizard-explicit fields (Q8 predicate, Q9 patient contact): gate strictly on the founder's actual answer — these are not inferred.
Rationale: same blast-radius principle that drives the ₹499 card top-3 gaps, extended to all gated content surfaces.

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

## Open questions — resolved (2026-05-29 reconciliation)

- **Are exactly these 7 new sections the right ones?** Yes for §13–§19. Three additional bible-mandated sub-blocks needed inside existing sections — added as overlays: §8.12 drug content (in §8), §8.15 software V&V (in §11), §8.16 animal preclinical (in §12). §8.13 biological safety stays in backlog (none of the smoke cases trigger; niche biologics/tissue-derived devices only).
- **Section ordering** — DMF §8.x order kept, attestations (17, 18) and NOCs (19) at the end. `section_number` is the editor's sort key.
- **Conditional NOCs (§19)** — single section, internal sub-blocks rendered only when their trigger fires (veterinary / radioactive / PNDT / drug-content). No empty "DAHD NOC — N/A" rows.
- **Editor surfaces attestation checklists (17, 18) vs LLM prose sections** — attestation sections emit `content` as **structured markdown** (`## 6.1 General facility info\n- [ ] Confirmed in internal docs`). Renderer parses checkbox lines; founder ticks them. Avoids extending `SectionOutput` shape or the editor in Sprint 3. Proper UI checklist component can land Sprint 4.