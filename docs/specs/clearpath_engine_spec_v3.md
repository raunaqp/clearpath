# ClearPath Engine Spec — v3

Authoritative spec after calibration on 15+ Indian healthtech products. Supersedes v2.

---

## 1. Product positioning

**One-liner:** Regulatory readiness engine + submission concierge for Indian digital health.

**Tagline:** Clarity → Draft → Submission.

**Not a form generator.** We produce structured content mapped to CDSCO applications, not filled-in government PDFs.

---

## 2. Three-tier funnel

| Tier | Price | Product | Delivery | Outcome |
|------|-------|---------|----------|---------|
| 1 | Free | Readiness Card | 5 min, on-screen | One-page decision card, screenshot-worthy |
| 2 | ₹499 | Regulatory Draft Pack | ~10 min, emailed | Draft application content + CDSCO mapping |
| 3 | ₹25K | Submission Concierge | 2–3 weeks, expert-reviewed | Refined submission pack + 1 iteration |

Launch plan for GrowthX Weekender: Tier 1 + 2 live. Tier 3 as waitlist for first 2 weeks, then activated once expert panel is set up.

---

## 3. Engine flow (6 stages)

```
User input → Pre-route → One-liner + scrape reconciliation → Decomposer
             (if platform) → 7-Q wizard → 9-regulation matrix → Decision card
```

### 3.1 Pre-route

Classify the input before running the wizard:

| Type | Detection cue | Action |
|------|---------------|--------|
| PRODUCT | Single offering described | Run normal 7-Q flow |
| PLATFORM | Multiple distinct features in one-liner | Run decomposer first |
| HARDWARE + SOFTWARE | Device + companion app | Classify each; SiMD inherits hardware class |
| EXPORT-ONLY | "manufactures for export" / "exports to" | Scope to manufacturing license path |
| REGULATOR | "national mission", "framework", "consent layer" | Decline politely (e.g., ABDM) |
| INVESTOR | "investing in", "portfolio", "accelerator" | Decline politely (e.g., Rainmatter) |

### 3.2 One-liner vs scrape reconciliation

If the one-liner uses investor-deck language ("data platform," "infrastructure," "analytics") but the scrape mentions regulated terms ("diagnosis," "screening," "clinical decision," "treatment"), surface the conflict. Do NOT silently override. Ask:

> *"Your one-liner says `{X}`. Your website says `{Y}`. These classify very differently. Which should I scope?"*

### 3.3 Decomposer (for PLATFORM type)

See `clearpath_decomposer_spec.md` for full prompt + schema. Core logic: break the platform into distinct sub-features, flag each as `likely_medical_device: true/false` with a reason.

### 3.4 7-Q Wizard

Anchors the founder's intent. Q1 × Q2 → IMDRF category → CDSCO class.

| Q | Question | Options |
|---|----------|---------|
| 1 | Clinical state addressed | non_serious / serious / critical |
| 2 | Information significance | inform / drive / diagnose_treat |
| 3 | Predicate exists? | yes / no / unsure |
| 4 | Data origin | india_only / india_plus_intl |
| 5 | Deployment context | d2c / private_clinic / gov_hospital (multi-select) |
| 6 | Year 1 users | under_1_lakh / 1_to_10_lakh / above_10_lakh |
| 7 | Stage | prototype / growth / scale / post_approval |

**Q2 follow-up.** If user picks `inform` but the scrape shows decision-support language ("recommends," "prompts," "guides"), ask again:

> *"You picked 'inform' — just displays data. But your product mentions `{specific language}`. Does it suggest an action (referral, dose, escalation)? If yes → drive."*

### 3.5 IMDRF → CDSCO class

| Q1 clinical state | Q2 info significance | IMDRF cat | CDSCO class |
|---|---|---|---|
| non_serious | inform | I | A |
| non_serious | drive | II | B |
| non_serious | diagnose_treat | II | B |
| serious | inform | II | B |
| serious | drive | III | C |
| serious | diagnose_treat | III | C |
| critical | inform | III | C |
| critical | drive | IV | D |
| critical | diagnose_treat | IV | D |

### 3.6 Readiness score (0–10)

Composite of 5 sub-dimensions, equally weighted:
- Regulatory clarity (does founder know what applies?)
- Quality system (ISO 13485 / IEC 62304 in progress?)
- Technical documentation (architecture, design, risk analysis)
- Clinical evidence (validation studies)
- Submission maturity (CDSCO filing status)

Bands: 0–2 Red, 3–4 Amber, 5–7 Green, 8–10 Green+. If `medical_device_status = not_medical_device`, score is `null` (N/A), not 0.

### 3.7 Risk (separate from Readiness)

- **High** — Clear medical device or in-market SaMD caught by 2025 draft
- **Medium** — Scoped / feature-level exposure
- **Low** — Platform / wellness / aggregator
- **N/A** — Rejected entities (regulator / investor)

---

## 4. The 9-regulation core matrix

See `clearpath_regulations.md` for full reference. Summary:

1. CDSCO MDR 2017 (medical devices)
2. CDSCO Pharmacy (D&C Act 1940)
3. DPDP Act 2023
4. ICMR AI Guidelines 2023
5. ABDM Consent Framework
6. NABH Digital Health Standards
7. MCI Telemedicine Practice Guidelines 2020
8. IRDAI (for health insurance products)
9. NABL Accreditation (for own labs)

All 9 evaluated for every product. Each gets verdict: `required` / `required_SDF` / `required_for_procurement` / `conditional` / `optional` / `not_applicable` / `core_compliance_achieved`.

---

## 5. Certainty language — non-negotiable

Never sound more certain than the regulator. Hard rules:

| Don't say | Say instead |
|-----------|-------------|
| Class C SaMD | likely Class B/C (AI-CDS, scoped) |
| CDSCO required | approval likely required |
| MD-12 + MD-9 required | SaMD pathway evolving · forms TBD |
| SDF required | may qualify as SDF depending on scale/designation |
| Predicate exists | No clear Indian predicate; international comparables exist |
| Class D | likely Class C/D for critical-care use |

Readiness ≠ Risk. Always surface both separately in output.

---

## 6. Decision card format (Tier 0 output)

Fixed structure, max 10-second scannability:

```
REGULATORY RISK PROFILE
[Product name] (of [parent if feature])
[One-line descriptor]

[Readiness: N/10 circle]   [Risk: X] [MD?: Y] [Class: Z] [Timeline: A–B months]

Verdict
[1–2 sentence summary]

Why this may be regulated
[1–2 sentences tying intent to classification]

Fix first · 3 gaps
[HIGH] Gap 1
[HIGH] Gap 2
[MED]  Gap 3

Regulation snapshot
[CDSCO · ...] [DPDP · ...] [ICMR · ...] [ABDM · ...]

Next step: Generate your CDSCO-ready draft → ₹499
```

If `medical_device_status = not_medical_device`, swap readiness circle for a verdict-matrix panel instead.

---

## 7. Key calibration insights (lock into prompts)

- **Vyuhaa one-liner "data platform" → reality: CerviAI cancer screening.** Always reconcile one-liner with scrape; don't silently pick.
- **EkaScribe launched Sep 2025 · CDSCO SaMD draft Oct 2025.** Every product built before Oct 2025 is in a transition scenario.
- **4 of 14 products (29%) had hidden sub-feature SaMD.** The decomposer is the highest-leverage module.
- **3 of 14 products (21%) are platforms where CDSCO is N/A.** Honest "you don't need CDSCO" is a valid paid output.
- **Export-only manufacturers still need CDSCO manufacturing license (MD-5/9) + MD-20 NOC.** Common misconception.
- **CDSCO is not monolithic** — MDR 2017 vs D&C Act 1940 are different regimes. Disambiguate.

---

## 8. What changed from v2 → v3

1. Locked "Regulatory Draft Pack" + "Submission Concierge" names
2. Certainty language rules formalised with examples
3. 9-regulation core pack (added MCI Telemed, IRDAI, NABL; split CDSCO into MDR + Pharmacy)
4. Q2 follow-up prompt added for defensive "inform" answers
5. Decision card format standardized
6. Founder-journey flow (Amazon-style) added as UX reference
7. Roadmap: India → CE/FDA → Global South benchmark
8. TAM grounded in concrete numbers: 94 BIRAC bioincubators, 72+ AICs, etc.
