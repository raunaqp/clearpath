# ClearPath — Output Schemas

JSON schemas for every output Claude Code needs to produce. Copy-paste ready.

---

## Input payload (user submission)

```json
{
  "one_liner": "string — founder's 1–2 sentence description",
  "url": "string — product website URL (optional but recommended)",
  "company_name": "string",
  "product_name": "string (optional; defaults to company_name)",
  "answers": {
    "q1_clinical_state": "non_serious | serious | critical",
    "q2_info_significance": "inform | drive | diagnose_treat",
    "q3_predicate_exists": "yes | no | unsure",
    "q4_data_origin": "india_only | india_plus_intl",
    "q5_deployment": ["d2c", "private_clinic", "gov_hospital"],
    "q6_year1_users": "under_1_lakh | 1_to_10_lakh | above_10_lakh",
    "q7_stage": "prototype | growth | scale | post_approval"
  },
  "scoped_feature": "string | null — set after decomposer if platform"
}
```

---

## Pre-router output

Runs first. Returns product type + next action.

```json
{
  "product_type": "product | platform | hardware_software | export_only | regulator | investor",
  "rejection_reason": "string | null",
  "next_action": "run_wizard | run_decomposer | reject",
  "rationale": "string — why this routing"
}
```

**Rejection example (ABDM):**
```json
{
  "product_type": "regulator",
  "rejection_reason": "ABDM is national health infrastructure, not a product.",
  "next_action": "reject",
  "rationale": "ClearPath assesses products. Try entering an ABDM-integrated application instead."
}
```

---

## Assessment meta fields

The `assessments.meta` JSONB column accumulates outputs from the pre-router and flags consumed by later features (wizard, synthesizer, draft pack). All fields are optional — absence means the relevant check has not run yet.

```typescript
interface AssessmentMeta {
  // Pre-router routing context
  rejection_reason?: string;
  should_decompose?: boolean;
  original_type?: 'platform';

  // Conflict detection (added v2 with wizard conflict disclosure change log)
  conflict_detected?: boolean;
  conflict_details?: {
    one_liner_interpretation: string;
    pdf_interpretation: string | null;
    url_interpretation: string | null;
    authority_used: 'pdf' | 'url' | 'one_liner';
    severity: 'high' | 'medium' | 'low' | 'none';
  };
  conflict_acknowledged?: boolean;           // set true when user clicks "Continue to questions"
  conflict_edit_attempts?: number;           // increments each time user re-submits from /start?resume=…

  // Detected signals from pre-router (added v3 with intake signals change log)
  detected_signals?: {
    certifications?: Array<{
      name: string;                          // e.g. "ISO 13485", "IEC 62304", "ISO 14971", "NABL"
      source: 'pdf' | 'url' | 'one_liner';
      confidence: 'high' | 'medium' | 'low';
      evidence_quote: string;                // exact phrase that triggered detection
    }>;
    partnerships?: Array<{
      type: 'clinical_site' | 'testing_lab' | 'manufacturer' | 'tech_partner';
      name: string;
      source: 'pdf' | 'url';
      confidence: 'high' | 'medium' | 'low';
    }>;
    prior_regulatory_work?: Array<{
      type: 'cdsco_filing' | 'clinical_trial' | 'cdsco_test_license' | 'fda_submission';
      reference: string;                     // e.g. MD-12 number, CTRI number
      source: 'pdf' | 'url';
      confidence: 'high' | 'medium' | 'low';
    }>;
    has_physical_facility?: 'yes' | 'no' | 'unclear';
    facility_details?: string | null;
  };
}
```

**Confidence rules for `detected_signals`:**
- `high`: explicit mention with specific detail ("ISO 13485 certified, cert number ABC123")
- `medium`: mention without detail ("ISO 13485 compliant")
- `low`: ambiguous or forward-looking ("planning to get ISO 13485")

Only `high` and `medium` confidence certifications / partnerships / filings are treated as present. `low` is treated as absent and becomes a gap in the Readiness Card.

---

## Scrape reconciliation output

Runs for every product. Surfaces one-liner vs scrape conflicts.

```json
{
  "one_liner_classification": "medical_device | not_medical_device | ambiguous",
  "scrape_classification": "medical_device | not_medical_device | ambiguous",
  "conflict_detected": true,
  "conflict_description": "string — human-readable explanation",
  "suggested_scopes": [
    {
      "scope_name": "string",
      "description": "string",
      "likely_medical_device": true
    }
  ],
  "require_user_choice": true
}
```

When `require_user_choice: true`, frontend presents scope picker.

---

## Decomposer output

See `clearpath_decomposer_spec.md` for prompt. Schema:

```json
{
  "single_feature": false,
  "features": [
    {
      "name": "string",
      "description": "string",
      "likely_medical_device": true,
      "reason": "string — evidence from scrape/one-liner",
      "tentative_class": "A | B | C | D | null",
      "regulations_likely": ["cdsco_mdr", "dpdp", "icmr"]
    }
  ]
}
```

If `single_feature: true`, `features` array has exactly 1 element and decomposer UI is skipped.

---

## Tier 0 — Readiness Card output

Full output for free-tier decision card. Match this exactly.

```json
{
  "meta": {
    "company_name": "string",
    "product_name": "string",
    "scoped_feature": "string | null",
    "product_type": "product | platform | hardware_software | export_only",
    "generated_at": "ISO 8601 timestamp",
    "conflict_resolved": "string | null"
  },

  "classification": {
    "medical_device_status": "is_medical_device | not_medical_device | hybrid | wellness_carve_out",
    "device_type": "string — free text descriptor",
    "imdrf_category": "I | II | III | IV | null",
    "cdsco_class": "A | B | C | D | null",
    "class_qualifier": "IVD | AI-CDS | scoped | novel | unclear | null",
    "ai_ml_flag": true,
    "acp_required": true,
    "export_only": false,
    "novel_or_predicate": "novel | has_predicate | null"
  },

  "readiness": {
    "score": 4,
    "band": "red | amber | green | green_plus | not_applicable",
    "dimensions": {
      "regulatory_clarity": 1,
      "quality_system": 1,
      "technical_docs": 1,
      "clinical_evidence": 1,
      "submission_maturity": 0
    },
    "note": "string"
  },

  "risk": {
    "level": "high | medium | low | not_applicable",
    "rationale": "string"
  },

  "timeline": {
    "estimate_months_low": 9,
    "estimate_months_high": 14,
    "display": "9–14 months",
    "anchor": "CDSCO SLAs + typical preparation time"
  },

  "regulations": {
    "cdsco_mdr": { "verdict": "required", "rationale": "string", "forms": ["MD-12", "MD-9"], "pathway_note": "string" },
    "cdsco_pharmacy": { "verdict": "not_applicable", "rationale": "string" },
    "dpdp": { "verdict": "required_SDF", "rationale": "string" },
    "icmr": { "verdict": "required", "rationale": "string" },
    "abdm": { "verdict": "conditional", "rationale": "string" },
    "nabh": { "verdict": "required_for_procurement", "rationale": "string" },
    "mci_telemed": { "verdict": "not_applicable", "rationale": "string" },
    "irdai": { "verdict": "not_applicable", "rationale": "string" },
    "nabl": { "verdict": "not_applicable", "rationale": "string" }
  },

  "top_gaps": [
    { "dim": "string", "gap_title": "string", "fix_action": "string", "severity": "high | medium | low" }
  ],

  "verdict": "1–2 sentence summary for the card",
  "why_regulated": "1–2 sentences tying intent to classification",
  "post_2025_samd_gap": false,

  "tier0_card_tagline": "short pullout for screenshot",
  "tier1_teaser": "what ₹499 unlocks",
  "tier2_teaser": "what ₹25K unlocks"
}
```

---

## Verdict value enum (all regulations)

```
"required"                   — must comply
"required_SDF"               — must comply with SDF obligations specifically
"required_for_procurement"   — needed to sell into this channel
"required_sub_feature"       — only applies to a scoped feature
"conditional"                — depends on specifics of deployment
"optional"                   — not legally required but recommended
"core_compliance_achieved"   — already compliant (e.g., M1/M2/M3 done)
"not_applicable"             — truly N/A
```

---

## Tier 1 — Regulatory Draft Pack output (₹499)

Generated after payment. Delivered as PDF + JSON.

```json
{
  "readiness_card": { /* Tier 0 output embedded */ },

  "draft_pack": {
    "executive_summary": "string — 150-200 words",

    "intended_use_statement": {
      "content": "string — drafted per CDSCO MDR intended-use format",
      "citations": ["CDSCO MDR 2017 Rule 3(zn)"]
    },

    "risk_classification_justification": {
      "content": "string",
      "imdrf_mapping_table": "markdown table"
    },

    "clinical_context": {
      "content": "string — clinical setting, users, care flow",
      "user_categories": ["physicians", "nurses", "technologists"]
    },

    "device_description": {
      "content": "string",
      "technical_summary": "string"
    },

    "essential_principles_checklist": [
      { "principle_id": "1.1", "applicable": true, "compliance_note": "string" }
    ],

    "cdsco_form_mapping": {
      "md_12": { "applicable": true, "section_content_drafted": true, "sections": ["1", "2", "3"] },
      "md_9": { "applicable": true, "section_content_drafted": false, "note": "After MD-12 clearance" }
    },

    "algorithm_change_protocol": {
      "applicable": true,
      "draft_content": "string — ACP document draft per CDSCO 2025 SaMD guidance"
    },

    "pathway_and_timeline": {
      "steps": [
        { "step": "QMS setup (ISO 13485)", "duration_weeks": 12 },
        { "step": "Technical documentation", "duration_weeks": 8 },
        { "step": "MD-12 submission + review", "duration_weeks": 14 },
        { "step": "Clinical investigation", "duration_weeks": 24 },
        { "step": "MD-9 submission + review", "duration_weeks": 16 }
      ],
      "total_low_months": 9,
      "total_high_months": 14
    },

    "missing_sections": [
      { "section": "Clinical investigation protocol", "reason": "Requires your data" }
    ]
  }
}
```

---

## Tier 2 — Submission Concierge intake (₹25K)

Captured when user orders. Handed to expert reviewer.

```json
{
  "order_id": "string",
  "customer_email": "string",
  "readiness_card_snapshot": { /* Tier 0 */ },
  "draft_pack_snapshot": { /* Tier 1 */ },

  "uploaded_documents": [
    { "filename": "string", "type": "QMS | technical_docs | clinical_data | other" }
  ],

  "target_submission_date": "ISO date",
  "expert_assigned": "string | null",
  "status": "intake | expert_review | client_revisions | final_iteration | delivered",

  "deliverables": [
    "document_refinement_complete",
    "classification_validation_complete",
    "qms_checklist_signed",
    "clinical_plan_reviewed",
    "iteration_1_delivered"
  ]
}
```

---

## Error / edge-case responses

```json
{
  "error": "decomposer_failed | scrape_failed | wizard_incomplete",
  "user_message": "string — friendly",
  "suggested_action": "retry | contact_support | skip_step"
}
```
