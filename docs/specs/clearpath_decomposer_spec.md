# ClearPath — Decomposer Claude Call Spec

**Purpose.** When a user submits a one-liner + URL, and the product is detected as a PLATFORM (not a single-offering product), the decomposer breaks it into distinct features so the regulatory assessment can be scoped to each one independently.

This is the most important engine module for ClearPath's differentiation. 38% of real healthtech products in our calibration set had sub-feature SaMD hiding inside platforms labelled as non-medical. General LLMs miss this entirely. The decomposer catches it.

---

## When to invoke

The decomposer runs as a second Claude call in the pipeline, after:

1. Pre-route classifier has returned `product_type = "platform"` OR
2. One-liner vs scrape reconciliation has flagged a conflict (e.g. founder says "data platform", scrape says "cancer screening")

For `product_type = "product"` (single offering), the decomposer is skipped and the 7-Q wizard runs on the whole product.

---

## Model selection

Use **claude-sonnet-4-6** (or current default). The task is mid-complexity: read 500-2000 tokens of scraped content + one-liner, return structured JSON. Opus is overkill; Haiku misses nuance.

Temperature: `0.2` — we want determinism across re-runs, not creativity.

Max tokens: `1500` (a typical decomposition is 300-800 output tokens).

---

## System prompt

```
You are a feature decomposer for ClearPath, an Indian healthtech regulatory
readiness tool. Your job: given a product description and scraped website
content, identify distinct features that may have different regulatory
treatment under Indian law.

Two features have "different regulatory treatment" if ANY of the following apply:
- One is a medical device (under CDSCO MDR 2017) and the other is not
- Different CDSCO classes (A vs B vs C vs D)
- Different CDSCO regimes (MDR 2017 vs Drugs & Cosmetics Act 1940 for pharmacy)
- Different adjacent regulations apply (MCI Telemedicine vs IRDAI vs NABL)
- One is software-only; the other is hardware or hybrid

Critical signals that a feature is LIKELY a medical device:
- Diagnoses, treats, monitors, or prevents disease
- Provides clinical decision support (drug interactions, treatment suggestions)
- Auto-generates prescriptions, diagnoses, or treatment plans
- Analyses physiological data for clinical (not wellness) purposes
- Hardware that touches patients or provides physiological measurements

Critical signals that a feature is NOT a medical device:
- Pure records management, storage, or retrieval
- Appointment scheduling, billing, queue management
- Telemedicine infrastructure (the platform itself, not AI on top of it)
- Wellness, fitness, nutrition tracking without clinical claims
- Data aggregation or analytics without clinical action

When a feature's description is ambiguous, set likely_medical_device to null
and explain in the ambiguity_note. DO NOT guess — ambiguity is useful signal
for the downstream 7-Q wizard.

IMPORTANT — do not invent features. Only surface features clearly evidenced
in the one-liner or scrape. If only one feature exists, return it alone with
single_feature: true.

Output strict JSON matching the schema. No preamble, no markdown fences.
```

---

## Input contract

The caller passes:

```json
{
  "one_liner": "string — founder's structured description from Q1-Q7 wizard",
  "company_url": "string — primary URL the scraper targeted",
  "scraped_content": "string — up to 3000 chars of extracted text from the website, cleaned",
  "company_name": "string — extracted from the URL or user input"
}
```

---

## Output schema

```typescript
type DecomposerOutput = {
  company_name: string;
  single_feature: boolean;      // true if only one distinct feature
  reconciliation_conflict: {    // populated only if one-liner clashes with scrape
    one_liner_suggests: string;
    scrape_suggests: string;
    resolution_prompt: string;  // what to ask the user
  } | null;
  features: Feature[];
  meta: {
    model: string;              // which Claude model generated this
    generated_at: string;
    total_features: number;
  };
};

type Feature = {
  name: string;                 // short product name (1-4 words)
  description: string;          // one sentence, grounded in source text
  likely_medical_device: boolean | null;  // null = ambiguous
  likely_class_hint: "A" | "B" | "C" | "D" | null;  // optional soft hint
  reason: string;               // why yes/no/unclear, citing source language
  cdsco_regime_hint: "mdr_2017" | "pharmacy_dca_1940" | null;
  adjacent_regulations_hint: string[];  // e.g. ["MCI Telemedicine", "NABL"]
  ambiguity_note: string | null;
  evidence_snippet: string;     // short quote from source ≤30 words
};
```

---

## Gold-standard calibration examples

These are test cases the decomposer must handle correctly. Include 3-4 of these in the system prompt as few-shot examples.

### Example 1 — Eka Care (platform with sub-feature SaMD)

**Input:**
```json
{
  "one_liner": "Eka Care is building a digital health records and doctor-patient engagement platform for patients and healthcare providers to manage health records, prescriptions, and consultations, using ABDM-compliant APIs and cloud-based health data infrastructure.",
  "company_url": "https://eka.care/",
  "scraped_content": "Eka Care is India's AI-native Health OS. ABDM Connect enables providers to verify patients via ABHA, securely fetch or share medical records with consent. AI-powered clinical guidance, delivered in real time during consultations. Build voice, chat, or workflow AI agents for clinical and patient-facing use cases. EkaScribe is an ambient AI medical scribe that converts voice to prescription instantly and generates SOAP notes...",
  "company_name": "Eka Care"
}
```

**Expected output:**
```json
{
  "company_name": "Eka Care",
  "single_feature": false,
  "reconciliation_conflict": null,
  "features": [
    {
      "name": "ABDM-integrated PHR/EHR platform",
      "description": "Patient health records and provider-side EMR with ABHA linking and consent-based sharing.",
      "likely_medical_device": false,
      "likely_class_hint": null,
      "reason": "Records management and ABDM integration — explicitly carved out of medical device scope in CDSCO 2025 SaMD draft.",
      "cdsco_regime_hint": null,
      "adjacent_regulations_hint": ["ABDM Consent Framework", "DPDP Act 2023", "NABH Digital Health Standards"],
      "ambiguity_note": null,
      "evidence_snippet": "ABDM Connect enables providers to verify patients via ABHA, securely fetch or share medical records"
    },
    {
      "name": "EkaScribe",
      "description": "Ambient AI medical scribe that converts doctor-patient voice to structured clinical notes and drafts prescriptions.",
      "likely_medical_device": true,
      "likely_class_hint": "B",
      "reason": "Auto-generating prescriptions influences treatment decisions — likely SaMD. However, if it only transcribes, it may not qualify. Scope needs user confirmation.",
      "cdsco_regime_hint": "mdr_2017",
      "adjacent_regulations_hint": ["DPDP Act 2023 (voice + health data)", "ICMR AI Guidelines"],
      "ambiguity_note": "Classification depends on whether user-side workflow allows AI-drafted prescriptions to be sent without physician editing.",
      "evidence_snippet": "ambient AI medical scribe that converts voice to prescription instantly"
    },
    {
      "name": "AI-powered clinical guidance",
      "description": "Real-time clinical decision support during consultations — drug interactions, investigation suggestions.",
      "likely_medical_device": true,
      "likely_class_hint": "C",
      "reason": "Drug interaction alerts and investigation suggestions drive clinical management — likely Class C SaMD.",
      "cdsco_regime_hint": "mdr_2017",
      "adjacent_regulations_hint": ["ICMR AI Guidelines", "DPDP Act 2023"],
      "ambiguity_note": null,
      "evidence_snippet": "AI-powered clinical guidance, delivered in real time during consultations"
    }
  ],
  "meta": {
    "model": "claude-sonnet-4-6",
    "generated_at": "2026-04-24T12:00:00Z",
    "total_features": 3
  }
}
```

### Example 2 — Vyuhaa (one-liner vs scrape conflict)

**Input:**
```json
{
  "one_liner": "Vyuhaa Med Data is building a healthcare data platform for providers and payers to structure, analyse, and operationalise clinical data, using AI/ML and data engineering pipelines on medical records.",
  "company_url": "https://www.vyuhaadata.com/",
  "scraped_content": "CerviAI by Vyuhaa Med Data delivers scalable, assistive AI-powered digital pathology for multi-disease screening. AI-powered cancer screening with a high-resolution 20x device that digitizes and localizes the entire diagnostic process. 98% specificity and 100% sensitivity on cancer cell detection. ICMR-backed validation, NABL-compliant reporting.",
  "company_name": "Vyuhaa Med Data"
}
```

**Expected output:**
```json
{
  "company_name": "Vyuhaa Med Data",
  "single_feature": false,
  "reconciliation_conflict": {
    "one_liner_suggests": "Healthcare data platform (infrastructure, analytics — likely not a medical device)",
    "scrape_suggests": "CerviAI — AI-powered digital pathology device for cervical cancer screening (clearly a medical device, Class C IVD-SaMD)",
    "resolution_prompt": "Your description says 'healthcare data platform' but your website describes CerviAI — an AI diagnostic device for cancer screening. These classify very differently. Which should we scope: (a) CerviAI — the diagnostic product, likely Class C IVD-SaMD; (b) a separate data platform layer — infrastructure, likely not a medical device; (c) both, one at a time?"
  },
  "features": [
    {
      "name": "CerviAI",
      "description": "AI-powered digital pathology device with 20x digitizer for cervical cancer screening.",
      "likely_medical_device": true,
      "likely_class_hint": "C",
      "reason": "Diagnostic device for cancer screening — clearly in scope of CDSCO MDR 2017. IVD + SaMD combo, Class C.",
      "cdsco_regime_hint": "mdr_2017",
      "adjacent_regulations_hint": ["ICMR AI Guidelines", "NABL Accreditation", "DPDP Act 2023"],
      "ambiguity_note": null,
      "evidence_snippet": "AI-powered digital pathology for multi-disease screening, 98% specificity, 100% sensitivity on cancer cell detection"
    },
    {
      "name": "Healthcare data platform",
      "description": "Data platform for providers and payers to structure and analyse clinical data.",
      "likely_medical_device": false,
      "likely_class_hint": null,
      "reason": "Data infrastructure and analytics — if standalone, not a medical device. Platform presence is asserted in one-liner but weakly supported in scrape.",
      "cdsco_regime_hint": null,
      "adjacent_regulations_hint": ["DPDP Act 2023"],
      "ambiguity_note": "Scrape primarily describes CerviAI; the 'data platform' layer may be aspirational or internal infrastructure.",
      "evidence_snippet": "healthcare data platform for providers and payers to structure, analyse, and operationalise clinical data"
    }
  ],
  "meta": {
    "model": "claude-sonnet-4-6",
    "generated_at": "2026-04-24T12:00:00Z",
    "total_features": 2
  }
}
```

### Example 3 — Neodocs (single feature, hardware+software combo)

**Input:**
```json
{
  "one_liner": "Neodocs is building at-home diagnostic test kits and a digital health tracking platform for consumers to monitor health parameters like nutrition, metabolism, and chronic conditions, using rapid test kits and app-based analytics.",
  "company_url": "https://neodocs.in/",
  "scraped_content": "Neodocs at-home test kits and companion app. Smartphone-scanned rapid test strips for urine and saliva analysis. Tracks nutrition, metabolism, kidney health, diabetes risk. FDA-registered test strips...",
  "company_name": "Neodocs"
}
```

**Expected output:**
```json
{
  "company_name": "Neodocs",
  "single_feature": true,
  "reconciliation_conflict": null,
  "features": [
    {
      "name": "Neodocs diagnostic kit + app",
      "description": "At-home rapid diagnostic test strips with companion smartphone app for reading, tracking, and interpreting results.",
      "likely_medical_device": true,
      "likely_class_hint": "C",
      "reason": "IVD device (test strips) + SiMD (companion app). Under CDSCO MDR 2017, IVDs for diagnostic purposes are medical devices. Class C typical for chronic condition and metabolism diagnostics.",
      "cdsco_regime_hint": "mdr_2017",
      "adjacent_regulations_hint": ["ICMR AI Guidelines", "DPDP Act 2023", "NABL Accreditation (for partner labs)"],
      "ambiguity_note": null,
      "evidence_snippet": "At-home rapid test strips for urine and saliva analysis, tracks nutrition, metabolism, kidney health"
    }
  ],
  "meta": {
    "model": "claude-sonnet-4-6",
    "generated_at": "2026-04-24T12:00:00Z",
    "total_features": 1
  }
}
```

---

## Error handling

- If scraped_content is empty or <100 chars: the decomposer should still return a reasonable feature list based on the one-liner alone, but set `reconciliation_conflict: null` and add a meta flag `low_scrape_confidence: true`.
- If the JSON response fails to parse: retry once with `temperature: 0.1`, then fall back to treating the product as a single feature with `ambiguity_note: "Automatic decomposition failed; proceeding as single feature."`
- If >5 features are returned: truncate to top 5 by regulatory distinctness, and add `additional_features_omitted: true` in meta.

---

## Downstream consumption

After the decomposer returns, the UI presents the features as selectable cards. The user picks one (or "assess all") and the 7-Q wizard runs with that scope. Q1/Q2 answers anchor to that specific feature, not the whole product.

If `reconciliation_conflict` is non-null, the UI shows the `resolution_prompt` first, before the feature selection, to force the user to acknowledge the mismatch.

---

## Instrumentation

Log every decomposer call with:
- `input_one_liner_length`
- `input_scrape_length`
- `output_feature_count`
- `had_reconciliation_conflict` (boolean)
- `user_selected_feature_name` (populated after user picks)

The `had_reconciliation_conflict` rate is a key product metric — it tells us how often founder self-descriptions mask regulatory exposure. Calibration target: 25-40% of platform-type inputs should trigger conflict.
