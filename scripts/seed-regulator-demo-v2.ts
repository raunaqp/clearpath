/**
 * Regulator-demo seeder v2 — Monday demo provisioning (2026-05-31).
 *
 * Produces, on PROD Supabase, one signed-in-able demo account with two
 * pre-existing assessments walkable end-to-end without live generation
 * during the demo:
 *
 *   1. demo+regulator@clearpath.in (password-confirmed Supabase Auth user)
 *   2. Bioresorbable Cardiac Stent (hardware persona, Class D implant)
 *      → readiness card + delivered ₹499 PDF
 *   3. AI Diabetic Retinopathy Screening Tool (SaMD persona, Class C)
 *      → readiness card + delivered ₹499 PDF
 *   4. (Optional, behind --with-tier2) ₹2,499 draft_pack_v2 for each
 *
 * Why a v2 and not an extension of seed-regulator-demo.ts:
 *   The existing seeder predates the 2026-05-31 P0 auth fix. It seeds a
 *   single SaMD assessment, uses skip-if-exists idempotency, and crucially
 *   does NOT create a Supabase Auth user — just an `assessments.email`
 *   column value. Post-fix, every authenticated API route enforces
 *   `assessment.email === user.email`, so there must be a real user row
 *   to sign in as. Rewriting the existing seeder in place to handle two
 *   personas + auth-user creation + DELETE-recreate would touch ~75% of
 *   its body; a fresh single-purpose script is the lower-risk move.
 *
 * Auth user creation (admin.createUser with email_confirm: true) IS THE
 * KEY DELTA — do not strip this step as redundant. Without a Supabase
 * Auth user, the demo email cannot sign in, the dashboard returns empty,
 * and every requireAuthOwnedAssessment call returns 404 for "ownership
 * mismatch" against a non-existent session.email.
 *
 * Prod guard: CONFIRM_PROD=yes env var + URL print + typed "CONFIRM" on
 * stdin. Two locks because env vars get set-and-forget in shell history;
 * the typed gate forces the operator to re-read the printed URL each run.
 *
 * Flags:
 *   --with-tier2             layer ₹2,499 draft_pack_v2 on every seeded
 *                            assessment (existing seeder behavior)
 *   --preserve-existing      additive mode — skip wipe + auth-user create,
 *                            only INSERT NEW_PRODUCTS. Use when the demo
 *                            is already mid-prep and you want to add
 *                            another fresh-walk assessment without
 *                            disturbing the live state. WITHOUT this flag
 *                            the seeder is fully destructive (right
 *                            behavior for Monday-morning reset).
 *   --skip-tier1-generation  walkable-state mode — INSERT the assessment
 *                            with status='wizard', wizard_answers
 *                            populated, ai_extracted populated, but NO
 *                            readiness_card, NO share_token, NO tier1
 *                            order, NO generator call. Demo presenter
 *                            walks the wizard live and the final Next
 *                            triggers synthesis on /assess/[id]. Refuses
 *                            to combine with --with-tier2 (Tier 2
 *                            requires a delivered Tier 1).
 *
 * Run:
 *   CONFIRM_PROD=yes npx dotenvx run -f .env.local -- \
 *     tsx scripts/seed-regulator-demo-v2.ts
 *   (--with-tier2 / --preserve-existing / --skip-tier1-generation as needed)
 *
 * Costs: ₹499 sequence ≈ $0.14 per product. ₹2,499 add-on ≈ $0.37 per
 *        product + ~5 min wall each. Adding both NEW_PRODUCTS (Tier 1
 *        only) under --preserve-existing ≈ $0.28 + ~45 sec. With
 *        --skip-tier1-generation: $0 + ~2 sec per assessment (DB writes
 *        only).
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { getServiceClient } from "../lib/supabase";
import { generateShareToken } from "../lib/engine/share-token";
import { dispatchGenerationForOrder } from "../lib/engine/trigger-dispatch";
import {
  ReadinessCardSchema,
  type ReadinessCard,
} from "../lib/schemas/readiness-card";
import type { AiExtractedRow } from "../lib/intake/ai-extract";
import type { WizardAnswers, Persona } from "../lib/wizard/types";

// ─────────────────────────────────────────────────────────────────────
// Credentials + product specs
// ─────────────────────────────────────────────────────────────────────

const DEMO_EMAIL = "demo+regulator@clearpath.in";
const DEMO_PASSWORD = "ClearpathDemo2026!";
const DEMO_COMPANY_HARDWARE = "Pulsar Bioresorbables";
const DEMO_COMPANY_SAMD = "Drishti Eye AI";

const HARDWARE_ONELINER =
  "A bioresorbable cardiac stent for treating coronary artery disease, implanted via catheter, that dissolves over 24 months.";
const SAMD_ONELINER =
  "An AI-powered diabetic retinopathy screening tool that analyzes fundus images to flag patients needing ophthalmologist referral.";

type ProductSpec = {
  key: string;
  company_name: string;
  product_name: string;
  one_liner: string;
  persona: Persona;
  wizard_answers: WizardAnswers;
  ai_extracted_fields: NonNullable<AiExtractedRow["fields"]>;
  readiness_card: ReadinessCard;
};

// ─────────────────────────────────────────────────────────────────────
// Hardware persona — Bioresorbable Cardiac Stent
// ─────────────────────────────────────────────────────────────────────

const HARDWARE_WIZARD: WizardAnswers = {
  persona: "manufacturer_hardware",
  q1: "critical",
  q2: "diagnoses_treats",
  q3: "hcps",
  q4: "1l_to_10l",
  q5: "hospital",
  q6: ["phi"],
  q7: "pre_mvp",
  q8: "no",
  q9: "implant_gt_30d",
};

function buildHardwareCard(): ReadinessCard {
  return {
    meta: {
      company_name: DEMO_COMPANY_HARDWARE,
      product_name: "Bioresorbable Cardiac Stent",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type: "Bioresorbable polymeric cardiovascular stent — implantable",
      imdrf_category: "IV",
      cdsco_class: "D",
      class_qualifier: "novel",
      ai_ml_flag: false,
      acp_required: false,
      export_only: false,
      novel_or_predicate: "novel",
    },
    readiness: {
      score: 1,
      band: "red",
      dimensions: {
        regulatory_clarity: 0,
        quality_system: 0,
        technical_docs: 0,
        clinical_evidence: 0,
        submission_maturity: 1,
      },
      note: "Pre-MVP novel Class D cardiovascular implant. No QMS, no biocompatibility file, no sterilization validation, no clinical investigation in place. Foundational uplift required across every dimension before any submission planning.",
    },
    risk: {
      level: "high",
      rationale:
        "Implantable Class D device contacting blood for >30 days in a life-supporting indication. Novel bioresorbable scaffold material with no Indian predicate. Class D under MDR 2017 First Schedule by default for long-term cardiovascular implants.",
    },
    timeline: {
      estimate_months_low: 30,
      estimate_months_high: 48,
      display: "30–48 months",
      anchor: "Driven by biocompatibility (ISO 10993 full panel) + sterilization validation + prospective multi-centre clinical investigation (MD-22) timelines.",
    },
    regulations: {
      cdsco_mdr: {
        verdict: "required",
        rationale:
          "Implantable cardiovascular stent — Class D under MDR 2017 First Schedule. Central Licensing Authority pathway with mandatory clinical investigation (MD-22) before MD-7 manufacturing licence given the novel material and no Indian predicate.",
        forms: ["MD-7", "MD-12", "MD-22"],
        pathway_note:
          "Domestic manufacturer → MD-7 to CLA after MD-22 clinical-investigation approval. MD-12 test licence required for clinical-investigation device batches.",
      },
      cdsco_pharmacy: {
        verdict: "not_applicable",
        rationale: "Non drug-eluting per current device profile (see inference markers).",
      },
      dpdp: {
        verdict: "required",
        rationale:
          "Patient identifiers collected during clinical investigation and post-market surveillance fall under the DPDP Act 2023. Consent flow + data-principal rights + breach SOP required.",
      },
      icmr: {
        verdict: "required",
        rationale:
          "Prospective multi-centre clinical investigation requires EC approval per ICMR 2023 ethics guidelines. CTRI registration mandatory prior to enrolment.",
      },
      abdm: {
        verdict: "not_applicable",
        rationale: "No digital health record exchange in scope for the implant itself.",
      },
      nabh: {
        verdict: "conditional",
        rationale: "NABH-accredited investigator sites strengthen the CI dossier; not a CDSCO precondition.",
      },
      mci_telemed: { verdict: "not_applicable", rationale: "No teleconsultation pathway." },
      irdai: { verdict: "not_applicable", rationale: "No insurance product." },
      nabl: {
        verdict: "required",
        rationale: "ISO 10993 biocompatibility testing and sterilization validation reports must come from NABL-accredited labs.",
      },
    },
    top_gaps: [
      {
        dim: "quality_system",
        gap_title: "No ISO 13485 QMS established",
        fix_action:
          "Engage an ISO 13485 consultant for a gap assessment and target a stage-1 audit in 9 months. Cardiovascular implants need the QMS solid before clinical-investigation device manufacture.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No ISO 10993 biocompatibility file",
        fix_action:
          "Plan the full ISO 10993 panel for long-term blood-contact implants (cytotoxicity, sensitisation, irritation, systemic toxicity, genotoxicity, implantation, haemocompatibility, chronic toxicity). NABL-accredited lab, ~18 month timeline.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No sterilization validation",
        fix_action:
          "Validate the chosen sterilization mode (EtO assumed — see marker) per ISO 11135 with dose-setting study, bioburden testing, and routine release per ISO 11737. Polymer compatibility check critical.",
        severity: "high",
      },
      {
        dim: "clinical_evidence",
        gap_title: "No EC-approved clinical investigation plan",
        fix_action:
          "Draft a prospective multi-centre CI plan (≥3 sites, 1–2 year follow-up minimum), secure EC approvals, register on CTRI prior to enrolment. Sample-size powered for non-inferiority vs DES predicate.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No ISO 14971 risk management file",
        fix_action:
          "Build the risk file (hazards, hazardous situations, harms, controls, residual risk). Cardiovascular-implant-specific hazards: late thrombosis, scaffold malapposition, recoil, fragmentation, drug-release uniformity.",
        severity: "high",
      },
      {
        dim: "regulatory_clarity",
        gap_title: "No CDSCO pre-submission meeting completed",
        fix_action:
          "Request a pre-submission meeting with CDSCO CLA to align on the MD-22 → MD-7 sequence and the predicate-novelty framing before clinical-investigation expense is committed.",
        severity: "medium",
      },
    ],
    verdict:
      "Class D novel cardiovascular implant requiring CDSCO central review with mandatory clinical investigation. Path: MD-22 → MD-7.",
    why_regulated:
      "Implantable, life-supporting cardiovascular device contacting blood for >30 days, with a novel bioresorbable scaffold material and no Indian predicate — squarely inside Class D under MDR 2017 First Schedule.",
    post_2025_samd_gap: false,
    tier0_card_tagline:
      "Novel Class D cardiovascular implant with a 30–48 month MD-22 → MD-7 path.",
    tier1_teaser: "",
    tier2_teaser: "",
    recommended_path: "clinical_investigation",
    inference_markers: [
      {
        field: "drug_content",
        label: "Drug content",
        value: "No drug content (non-DES)",
        status: "assumed",
        basis: "One-liner describes a bioresorbable scaffold without mentioning a drug coating; defaulted to non-DES for the Class-D pathway analysis. Confirm in editor §3.",
        correctable_at: "editor §3",
      },
      {
        field: "sterile",
        label: "Sterile device",
        value: "Yes",
        status: "assumed",
        basis: "Catheter-delivered implant — sterile-supplied is the universal standard for cardiovascular implants.",
        correctable_at: "editor §14",
      },
      {
        field: "sterilization_mode",
        label: "Sterilization mode",
        value: "EtO (ethylene oxide)",
        status: "assumed",
        basis: "Polymeric scaffold incompatible with terminal gamma at the dose typical for hardware; EtO is the dominant mode for polymer cardiovascular implants. Confirm in editor §14.",
        correctable_at: "editor §14",
      },
      {
        field: "cdsco_class",
        label: "CDSCO risk class",
        value: "Class D",
        status: "estimated",
        basis: "Implant (q9 = implant_gt_30d) + critical organ (q1 = critical) + no Indian predicate (q8 = no) → Class D under MDR 2017 First Schedule.",
        correctable_at: "wizard Q1/Q9",
      },
    ],
  };
}

const HARDWARE_AI_EXTRACTED: NonNullable<AiExtractedRow["fields"]> = {
  device_name: "Bioresorbable Cardiac Stent",
  intended_use_one_liner: HARDWARE_ONELINER,
  suggested_classification: "D",
  suggested_wizard_answers: {
    intended_use: "Treating coronary artery disease via catheter-delivered bioresorbable scaffold that dissolves over 24 months.",
    device_class: "class_c_d",
    ai_ml: "none",
    data_sensitivity: "identifiable",
    target_market: ["india"],
  },
  company: {
    legal_name: DEMO_COMPANY_HARDWARE,
    constitution: "Private Limited",
    cin: null,
    registered_address: null,
    manufacturing_address: null,
    founded_year: null,
    team_size: null,
  },
  product_meta: {
    model_number: null,
    sterile: "Yes (assumed — see marker)",
    patient_population: "Adults with coronary artery disease requiring percutaneous coronary intervention.",
    user_population: "Interventional cardiologists in catheterisation laboratories.",
    setting_of_use: "Tertiary-care hospital cath labs.",
  },
  regulatory_signals: {
    iso_13485_status: "not_started",
    clinical_evidence_level: "none",
  },
  confidence: "low",
  notes: "One-liner-only extraction; confirm drug-eluting / non-drug-eluting and exact polymer composition in editor §3 + §13.",
};

// ─────────────────────────────────────────────────────────────────────
// SaMD persona — Diabetic Retinopathy AI
// ─────────────────────────────────────────────────────────────────────

const SAMD_WIZARD: WizardAnswers = {
  persona: "manufacturer_samd",
  q1: "serious",
  q2: "informs_only",
  q2_defended: true,
  q3: "hcps",
  q4: "1l_to_10l",
  q5: "hospital",
  q6: ["phi", "imaging"],
  q7: "pre_mvp",
};

function buildSamdCard(): ReadinessCard {
  return {
    meta: {
      company_name: DEMO_COMPANY_SAMD,
      product_name: "AI Diabetic Retinopathy Screening Tool",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type: "AI/ML SaMD — diabetic retinopathy screening from fundus images",
      imdrf_category: "III",
      cdsco_class: "C",
      class_qualifier: "AI-CDS",
      ai_ml_flag: true,
      acp_required: true,
      export_only: false,
      novel_or_predicate: "novel",
    },
    readiness: {
      score: 1,
      band: "red",
      dimensions: {
        regulatory_clarity: 0,
        quality_system: 0,
        technical_docs: 0,
        clinical_evidence: 0,
        submission_maturity: 1,
      },
      note: "Pre-MVP AI/ML SaMD with no QMS, no IEC 62304 lifecycle, no Indian-population clinical validation, and no ACP. Foundational uplift required before submission planning.",
    },
    risk: {
      level: "high",
      rationale:
        "AI/ML SaMD that flags suspected diabetic retinopathy from fundus images — informs referral decisions for a sight-threatening condition. Class C under the Oct 2025 CDSCO SaMD draft on sensitive ophthalmic imaging data.",
    },
    timeline: {
      estimate_months_low: 14,
      estimate_months_high: 22,
      display: "14–22 months",
      anchor: "Driven by prospective multi-centre clinical investigation (MD-22) timing on an Indian retinopathy cohort.",
    },
    regulations: {
      cdsco_mdr: {
        verdict: "required",
        rationale:
          "AI/ML SaMD that informs referral for a sight-threatening condition. Class C under the Oct 2025 CDSCO SaMD draft. Central Licensing Authority pathway.",
        forms: ["MD-7", "MD-12", "MD-22"],
        pathway_note:
          "Domestic manufacturer → MD-7 to CLA, supported by an MD-12 test licence for the clinical-investigation batches. MD-22 required given the novel AI indication on Indian-population fundus data.",
      },
      cdsco_pharmacy: {
        verdict: "not_applicable",
        rationale: "No drug substance involved.",
      },
      dpdp: {
        verdict: "required",
        rationale:
          "Fundus images are sensitive personal data under the DPDP Act 2023. Consent flow, data-principal-rights workflow, and breach SOP required.",
      },
      icmr: {
        verdict: "required",
        rationale:
          "Prospective clinical investigation requires EC approval per ICMR 2023 ethics guidelines, with explicit treatment of AI bias and Indian-population validity (skin/iris pigmentation, retinal anatomy differences).",
      },
      abdm: {
        verdict: "conditional",
        rationale:
          "If deployed inside an ABDM-aligned hospital network, ABDM/FHIR alignment helps procurement. Not blocking for marketing licence.",
      },
      nabh: {
        verdict: "conditional",
        rationale: "NABH alignment helps hospital procurement; not a CDSCO precondition.",
      },
      mci_telemed: { verdict: "not_applicable", rationale: "No teleconsultation pathway." },
      irdai: { verdict: "not_applicable", rationale: "No insurance product." },
      nabl: { verdict: "not_applicable", rationale: "No NABL accreditation pathway for SaMD." },
    },
    top_gaps: [
      {
        dim: "quality_system",
        gap_title: "No ISO 13485 QMS established",
        fix_action:
          "Engage an ISO 13485 consultant for a gap assessment and target a stage-1 audit in 6 months.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No IEC 62304 software lifecycle documentation",
        fix_action:
          "Stand up the IEC 62304 SDLC with software safety classification, design history, and V&V before further model iterations.",
        severity: "high",
      },
      {
        dim: "clinical_evidence",
        gap_title: "No EC-approved clinical investigation plan",
        fix_action:
          "Draft a multi-centre CI plan covering at least 2 retina referral centres, secure EC approval, register on CTRI prior to data collection. Sample size powered for sensitivity ≥90% / specificity ≥85% vs ophthalmologist reading.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No ISO 14971 risk management file",
        fix_action:
          "Build the risk file with SaMD-specific hazards: missed referrable retinopathy, false-positive over-referral, image-quality failure modes, model drift on new fundus camera models.",
        severity: "medium",
      },
      {
        dim: "technical_docs",
        gap_title: "No Algorithm Change Protocol (ACP/PCCP) drafted",
        fix_action:
          "Per the Oct 2025 SaMD draft, draft an ACP describing retraining triggers, validation thresholds, human-oversight checkpoints, and rollback criteria.",
        severity: "medium",
      },
      {
        dim: "regulatory_clarity",
        gap_title: "DPDP consent + data-handling workflow not in place",
        fix_action:
          "Document a privacy notice, consent flow, data-principal-rights workflow, grievance officer, and breach SOP before any hospital deployment.",
        severity: "medium",
      },
    ],
    verdict:
      "Likely Class C SaMD requiring CDSCO central review and a prospective Indian-population clinical investigation.",
    why_regulated:
      "Informs clinical referral for a sight-threatening condition based on ophthalmic imaging analysis — squarely inside MDR-2017 SaMD scope and the Oct 2025 CDSCO SaMD draft.",
    post_2025_samd_gap: true,
    tier0_card_tagline:
      "AI/ML diagnostic-support SaMD with a 14–22 month path to a Class C submission.",
    tier1_teaser: "",
    tier2_teaser: "",
    recommended_path: "clinical_investigation",
  };
}

const SAMD_AI_EXTRACTED: NonNullable<AiExtractedRow["fields"]> = {
  device_name: "AI Diabetic Retinopathy Screening Tool",
  intended_use_one_liner: SAMD_ONELINER,
  suggested_classification: "C",
  suggested_wizard_answers: {
    intended_use: "Analyse fundus images to flag patients needing ophthalmologist referral for diabetic retinopathy.",
    device_class: "samd_class_c_d",
    ai_ml: "static",
    data_sensitivity: "identifiable",
    target_market: ["india"],
  },
  company: {
    legal_name: DEMO_COMPANY_SAMD,
    constitution: "Private Limited",
    cin: null,
    registered_address: null,
    manufacturing_address: null,
    founded_year: null,
    team_size: null,
  },
  product_meta: {
    model_number: null,
    sterile: null,
    patient_population: "Adults with diabetes mellitus undergoing routine eye screening.",
    user_population: "Trained healthcare workers operating fundus cameras; ophthalmologists adjudicating positive flags.",
    setting_of_use: "Eye clinics and tertiary-care hospital ophthalmology departments.",
  },
  regulatory_signals: {
    iso_13485_status: "not_started",
    clinical_evidence_level: "none",
  },
  confidence: "low",
  notes: "One-liner-only extraction; confirm whether AI is static or adaptive in wizard / editor.",
};

// ─────────────────────────────────────────────────────────────────────
// Hardware persona — BlueCardia wearable ECG monitor (predicate path)
// ─────────────────────────────────────────────────────────────────────

const DEMO_COMPANY_BLUECARDIA = "Sattva HealthTech";
const BLUECARDIA_ONELINER =
  "A wearable adhesive cardiac monitoring patch worn on the chest for up to 14 days that continuously captures single-lead ECG to detect arrhythmias and supports outpatient cardiac monitoring.";

const BLUECARDIA_WIZARD: WizardAnswers = {
  persona: "manufacturer_hardware",
  q1: "serious",
  q2: "drives",
  q3: "hcps",
  q4: "10k_to_1l",
  q5: "hospital",
  q6: ["phi"],
  q7: "mvp",
  q8: "yes_indian",
  q9: "surface_intact_skin",
};

function buildBlueCardiaCard(): ReadinessCard {
  return {
    meta: {
      company_name: DEMO_COMPANY_BLUECARDIA,
      product_name: "BlueCardia Cardiac Monitor Patch",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type: "Wearable single-lead ECG monitoring patch — non-implant",
      imdrf_category: "III",
      cdsco_class: "C",
      class_qualifier: null,
      ai_ml_flag: false,
      acp_required: false,
      export_only: false,
      novel_or_predicate: "has_predicate",
    },
    readiness: {
      score: 2,
      band: "red",
      dimensions: {
        regulatory_clarity: 1,
        quality_system: 0,
        technical_docs: 1,
        clinical_evidence: 0,
        submission_maturity: 0,
      },
      note: "Early commercial wearable ambulatory ECG monitor with Indian predicate availability (Cardiac Design Labs, Sense4Care wearable monitors). No QMS, no IEC 60601 testing, no comparative ECG accuracy data vs Holter reference. Predicate path shortens timeline but core technical-docs uplift required.",
    },
    risk: {
      level: "medium",
      rationale:
        "Continuous outpatient monitoring of serious cardiac arrhythmias via non-implant adhesive patch. Class C under MDR 2017 by clinical-state risk; reduced submission risk relative to novel devices due to Indian predicate availability under the substantial-equivalence pathway.",
    },
    timeline: {
      estimate_months_low: 14,
      estimate_months_high: 22,
      display: "14–22 months",
      anchor:
        "Predicate path (MD-7 + substantial equivalence) — driven by IEC 60601-1 + IEC 60601-2-47 ambulatory-ECG validation and comparative ECG accuracy study timing.",
    },
    regulations: {
      cdsco_mdr: {
        verdict: "required",
        rationale:
          "Wearable Class C ambulatory ECG monitoring device. Central Licensing Authority pathway. Indian predicate availability (Cardiac Design Labs / Sense4Care wearable monitors) supports MD-7 manufacturing licence via substantial-equivalence claim — MD-22 clinical investigation likely not required.",
        forms: ["MD-7"],
        pathway_note:
          "Domestic manufacturer → MD-7 to CLA via substantial-equivalence claim. Predicate-device dossier + comparative ECG accuracy data should support filing without MD-22 investigation.",
      },
      cdsco_pharmacy: {
        verdict: "not_applicable",
        rationale: "No drug substance involved.",
      },
      dpdp: {
        verdict: "required",
        rationale:
          "Continuous ECG capture qualifies as sensitive personal data under the DPDP Act 2023. Companion-app data flow needs consent, data-principal rights workflow, and breach SOP.",
      },
      icmr: {
        verdict: "conditional",
        rationale:
          "Comparative accuracy study vs Holter reference may need EC approval if conducted as a clinical investigation; lower bar than novel-device CI given predicate-path filing.",
      },
      abdm: {
        verdict: "conditional",
        rationale:
          "Hospital deployments may require ABDM/FHIR alignment if procured through ABDM-aligned networks. Not blocking for licence.",
      },
      nabh: {
        verdict: "conditional",
        rationale: "NABH alignment helps hospital procurement; not a CDSCO precondition.",
      },
      mci_telemed: { verdict: "not_applicable", rationale: "No teleconsultation pathway." },
      irdai: { verdict: "not_applicable", rationale: "No insurance product." },
      nabl: {
        verdict: "required",
        rationale:
          "IEC 60601-1 + IEC 60601-2-47 (ambulatory ECG) electrical-safety and performance testing must come from NABL-accredited labs.",
      },
    },
    top_gaps: [
      {
        dim: "quality_system",
        gap_title: "No ISO 13485 QMS established",
        fix_action:
          "Engage ISO 13485 consultant for gap assessment; target stage-1 audit within 6 months. Substantially shorter than novel-device timeline due to predicate path.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No IEC 60601-1 + IEC 60601-2-47 electrical-safety testing",
        fix_action:
          "Plan electrical-safety + ambulatory-ECG performance testing per IEC 60601-1 (basic safety) and IEC 60601-2-47 (ambulatory electrocardiographic systems). NABL-accredited lab; ~4-6 months.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No IEC 81001-5-1 cybersecurity assessment for companion app",
        fix_action:
          "Companion app for data upload is assumed (confirm in editor §3). Cybersecurity assessment per IEC 81001-5-1 + IEC 62304 software lifecycle for any companion-app or cloud component.",
        severity: "medium",
      },
      {
        dim: "technical_docs",
        gap_title: "No ISO 14971 risk management file",
        fix_action:
          "Build the risk file with wearable-ECG-specific hazards: adhesive skin reactions, ECG signal artifact, false-positive arrhythmia detection, companion-app data loss.",
        severity: "high",
      },
      {
        dim: "clinical_evidence",
        gap_title: "No comparative ECG accuracy data vs Holter reference",
        fix_action:
          "Conduct a comparative accuracy study (target sensitivity ≥85%, specificity ≥90%) against Holter reference on an Indian-population arrhythmia cohort. ~6-9 months.",
        severity: "medium",
      },
    ],
    verdict:
      "Class C wearable cardiac monitor with substantial-equivalence pathway. Path: MD-7 (predicate-based).",
    why_regulated:
      "Continuously monitors a serious clinical condition (cardiac arrhythmia) via skin-contact device — squarely inside Class C under MDR 2017 by clinical-state risk. Predicate availability shortens but does not bypass the regulatory path.",
    post_2025_samd_gap: false,
    tier0_card_tagline:
      "Predicate-path Class C wearable ECG monitor with a 14–22 month MD-7 timeline.",
    tier1_teaser: "",
    tier2_teaser: "",
    recommended_path: "manufacturing_license",
    inference_markers: [
      {
        field: "cdsco_class",
        label: "CDSCO risk class",
        value: "Class C",
        status: "estimated",
        basis:
          "Skin-contact wearable (q9 = surface_intact_skin) + serious clinical state (q1 = serious) + Indian predicate available (q8 = yes_indian) → Class C under MDR 2017 by clinical-state risk classification.",
        correctable_at: "wizard Q1/Q9",
      },
      {
        field: "software_in_device",
        label: "Companion app / software component",
        value: "Yes (assumed)",
        status: "assumed",
        basis:
          "Continuous monitoring patches typically pair with a companion mobile app for data upload and physician review. Confirm device architecture in editor §3.",
        correctable_at: "editor §3",
      },
      {
        field: "sterile",
        label: "Sterile device",
        value: "No",
        status: "extracted",
        basis: "Wearable surface-contact patch — not surgically introduced, not packaged sterile.",
        correctable_at: "editor §14",
      },
      {
        field: "ionising_radiation",
        label: "Ionising radiation",
        value: "No",
        status: "extracted",
        basis: "Passive ECG monitor — no radiation source.",
        correctable_at: "editor §3",
      },
      {
        field: "drug_content",
        label: "Drug content",
        value: "No drug content",
        status: "extracted",
        basis: "Passive monitoring device — no drug-delivery component.",
        correctable_at: "editor §3",
      },
    ],
  };
}

const BLUECARDIA_AI_EXTRACTED: NonNullable<AiExtractedRow["fields"]> = {
  device_name: "BlueCardia Cardiac Monitor Patch",
  intended_use_one_liner: BLUECARDIA_ONELINER,
  suggested_classification: "C",
  suggested_wizard_answers: {
    intended_use:
      "Continuous outpatient cardiac monitoring via a wearable adhesive patch capturing single-lead ECG for up to 14 days to detect arrhythmias.",
    device_class: "class_c_d",
    ai_ml: "none",
    data_sensitivity: "identifiable",
    target_market: ["india"],
  },
  company: {
    legal_name: DEMO_COMPANY_BLUECARDIA,
    constitution: "Private Limited",
    cin: null,
    registered_address: null,
    manufacturing_address: null,
    founded_year: null,
    team_size: null,
  },
  product_meta: {
    model_number: null,
    sterile: "No (extracted — wearable surface-contact patch)",
    patient_population: "Adults under outpatient cardiac monitoring for suspected or known arrhythmias.",
    user_population: "Cardiologists and outpatient cardiac-monitoring services; patients wear the device.",
    setting_of_use: "Outpatient clinics and tertiary-care hospital outpatient cardiac departments; worn at home during the monitoring window.",
  },
  regulatory_signals: {
    iso_13485_status: "not_started",
    clinical_evidence_level: "none",
  },
  confidence: "low",
  notes:
    "One-liner-only extraction; confirm companion-app architecture and exact ambulatory-ECG performance claims in editor §3.",
};

// ─────────────────────────────────────────────────────────────────────
// SaMD persona — Qure.ai qXR chest X-ray AI (post-2025 SaMD draft)
// ─────────────────────────────────────────────────────────────────────

const DEMO_COMPANY_QXR = "Qure.ai";
const QXR_ONELINER =
  "An AI-powered chest X-ray interpretation tool that detects tuberculosis, COVID-19, and other thoracic abnormalities to assist radiologists in high-volume screening settings, particularly in tier-2/3 Indian hospitals and TB elimination programmes.";

const QXR_WIZARD: WizardAnswers = {
  persona: "manufacturer_samd",
  q1: "serious",
  q2: "informs_only",
  q2_defended: true,
  q3: "hcps",
  q4: "1l_to_10l",
  q5: "hospital",
  q6: ["phi", "imaging"],
  q7: "mvp",
};

function buildQxrCard(): ReadinessCard {
  return {
    meta: {
      company_name: DEMO_COMPANY_QXR,
      product_name: "qXR Chest X-Ray AI",
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device",
      device_type:
        "AI/ML SaMD — chest X-ray interpretation assist (TB, COVID-19, thoracic abnormalities)",
      imdrf_category: "III",
      cdsco_class: "C",
      class_qualifier: "AI-CDS",
      ai_ml_flag: true,
      acp_required: true,
      export_only: false,
      novel_or_predicate: "novel",
    },
    readiness: {
      score: 1,
      band: "red",
      dimensions: {
        regulatory_clarity: 0,
        quality_system: 0,
        technical_docs: 0,
        clinical_evidence: 0,
        submission_maturity: 1,
      },
      note: "AI/ML SaMD chest X-ray interpretation tool aimed at TB elimination programmes and tier-2/3 hospital screening. No QMS, no IEC 62304 lifecycle, no ACP framework (Oct 2025 CDSCO SaMD draft requirement), no prospective Indian-population validation. Foundational uplift required.",
    },
    risk: {
      level: "high",
      rationale:
        "AI-assisted screening for high-impact, high-prevalence conditions (TB) in resource-limited Indian settings — risk dominated by false negatives in TB-programme deployment. Class C under the Oct 2025 CDSCO SaMD draft; adaptive AI retraining triggers ACP requirement.",
    },
    timeline: {
      estimate_months_low: 18,
      estimate_months_high: 28,
      display: "18–28 months",
      anchor:
        "Driven by prospective multi-centre Indian-population clinical investigation (MD-22) for TB sensitivity/specificity validation + ACP submission per Oct 2025 SaMD draft.",
    },
    regulations: {
      cdsco_mdr: {
        verdict: "required",
        rationale:
          "AI/ML SaMD informing radiologist screening decisions on chest X-rays for serious conditions (TB, COVID, thoracic abnormalities). Class C under the Oct 2025 CDSCO SaMD draft. CLA pathway with mandatory clinical investigation due to novel AI indication on Indian-population imaging.",
        forms: ["MD-7", "MD-12", "MD-22"],
        pathway_note:
          "Domestic manufacturer → MD-7 to CLA after MD-22 clinical-investigation approval. MD-12 test licence for clinical-investigation device batches. ACP framework submission required alongside.",
      },
      cdsco_pharmacy: {
        verdict: "not_applicable",
        rationale: "No drug substance involved.",
      },
      dpdp: {
        verdict: "required",
        rationale:
          "Chest X-rays + patient identifiers are sensitive personal data under the DPDP Act 2023. Hospital-deployment consent flow + data-principal-rights workflow + breach SOP required. Data residency for cloud-hosted inference is important for hospital procurement.",
      },
      icmr: {
        verdict: "required",
        rationale:
          "Prospective multi-site Indian-population validation study requires EC approval per ICMR 2023 ethics guidelines. CTRI registration mandatory. Sample size powered for TB sens ≥90% / spec ≥75% vs radiologist reference; image-quality and X-ray-manufacturer variability stratification needed.",
      },
      abdm: {
        verdict: "conditional",
        rationale:
          "TB elimination programmes + tier-2/3 hospital deployments are increasingly through ABDM networks. ABDM/FHIR alignment supports procurement and PMJAY referral flows; not blocking for licence.",
      },
      nabh: {
        verdict: "conditional",
        rationale: "NABH alignment helps hospital + TB-programme procurement; not a CDSCO precondition.",
      },
      mci_telemed: {
        verdict: "not_applicable",
        rationale: "No teleconsultation pathway; tool sits inside radiologist read-flow.",
      },
      irdai: { verdict: "not_applicable", rationale: "No insurance product." },
      nabl: { verdict: "not_applicable", rationale: "No NABL accreditation pathway for SaMD." },
    },
    top_gaps: [
      {
        dim: "technical_docs",
        gap_title: "No IEC 62304 software lifecycle documentation",
        fix_action:
          "Stand up IEC 62304 SDLC with software safety classification (Class B/C for SaMD), design history, model versioning, V&V protocols. Critical given adaptive retraining schedule.",
        severity: "high",
      },
      {
        dim: "quality_system",
        gap_title: "No ISO 13485 QMS established",
        fix_action:
          "Engage ISO 13485 consultant for gap assessment; target stage-1 audit in 6 months. QMS scope must cover the AI/ML lifecycle (data management, model retraining, post-market AI monitoring).",
        severity: "high",
      },
      {
        dim: "regulatory_clarity",
        gap_title: "No ACP / PCCP framework (Oct 2025 CDSCO SaMD draft)",
        fix_action:
          "Draft an Algorithm Change Protocol describing retraining triggers (new X-ray manufacturers, image-quality drift, TB strain shifts), validation thresholds, human-radiologist-oversight checkpoints, and rollback criteria. Mandatory under Oct 2025 SaMD draft for adaptive AI.",
        severity: "high",
      },
      {
        dim: "clinical_evidence",
        gap_title: "No prospective Indian-population validation study",
        fix_action:
          "Multi-site Indian-population study (≥3 tier-2/3 hospitals + TB-programme sites), target TB sens ≥90% / spec ≥75% vs radiologist reference standard. Stratify by image quality, X-ray manufacturer, age, comorbidity. ~12 months.",
        severity: "high",
      },
      {
        dim: "technical_docs",
        gap_title: "No IEC 81001-5-1 cybersecurity + data-residency framework",
        fix_action:
          "Cybersecurity assessment per IEC 81001-5-1 for hospital-deployed inference. Data-residency model documented (on-prem vs cloud), with explicit support for DPDP-compliant flows. Critical for tier-1 hospital procurement.",
        severity: "medium",
      },
    ],
    verdict:
      "Class C AI-CDS SaMD requiring CDSCO central review with mandatory Indian-population clinical investigation + ACP framework.",
    why_regulated:
      "AI-assisted radiologist screening for serious public-health conditions (TB) on chest X-ray imaging — squarely inside MDR-2017 SaMD scope and the Oct 2025 CDSCO SaMD draft. AI adaptivity triggers the ACP requirement.",
    post_2025_samd_gap: true,
    tier0_card_tagline:
      "AI-CDS SaMD with an 18–28 month CI + MD-7 path; ACP framework required.",
    tier1_teaser: "",
    tier2_teaser: "",
    recommended_path: "clinical_investigation",
    inference_markers: [
      {
        field: "cdsco_class",
        label: "CDSCO risk class",
        value: "Class C",
        status: "estimated",
        basis:
          "AI-CDS informing radiologist screening decisions on serious conditions → Class C under the Oct 2025 CDSCO SaMD draft.",
        correctable_at: "wizard Q1",
      },
      {
        field: "ai_ml",
        label: "AI/ML adaptivity",
        value: "Adaptive (periodic retraining)",
        status: "extracted",
        basis:
          "Validated model with periodic retraining on new data — adaptive AI under the Oct 2025 SaMD draft; triggers ACP requirement.",
        correctable_at: "wizard / editor §3",
      },
      {
        field: "data_sensitivity",
        label: "Data sensitivity",
        value: "PHI + medical imaging",
        status: "extracted",
        basis: "Wizard q6 explicitly flags PHI + imaging — chest X-rays + patient identifiers.",
        correctable_at: "wizard Q6",
      },
      {
        field: "software_in_device",
        label: "Software in device",
        value: "Yes (pure SaMD)",
        status: "extracted",
        basis: "Pure software-as-medical-device — no hardware component.",
        correctable_at: "editor §3",
      },
      {
        field: "sterile",
        label: "Sterile device",
        value: "No",
        status: "extracted",
        basis: "Pure SaMD — sterility not applicable.",
        correctable_at: "editor §14",
      },
    ],
  };
}

const QXR_AI_EXTRACTED: NonNullable<AiExtractedRow["fields"]> = {
  device_name: "qXR Chest X-Ray AI",
  intended_use_one_liner: QXR_ONELINER,
  suggested_classification: "C",
  suggested_wizard_answers: {
    intended_use:
      "AI-assisted chest X-ray interpretation for TB, COVID-19, and thoracic abnormality detection in radiologist read-flow for tier-2/3 Indian hospitals + TB elimination programmes.",
    device_class: "samd_class_c_d",
    ai_ml: "adaptive",
    data_sensitivity: "identifiable",
    target_market: ["india"],
  },
  company: {
    legal_name: DEMO_COMPANY_QXR,
    constitution: "Private Limited",
    cin: null,
    registered_address: null,
    manufacturing_address: null,
    founded_year: null,
    team_size: null,
  },
  product_meta: {
    model_number: null,
    sterile: null,
    patient_population:
      "Adults undergoing chest X-ray screening for TB, COVID-19, and other thoracic abnormalities; emphasis on TB elimination programmes and tier-2/3 hospital screening volumes.",
    user_population:
      "Radiologists and trained clinicians in tier-2/3 Indian hospitals + TB elimination programme sites.",
    setting_of_use: "Hospital radiology departments and TB-programme screening sites.",
  },
  regulatory_signals: {
    iso_13485_status: "not_started",
    clinical_evidence_level: "pilot_data",
  },
  confidence: "low",
  notes:
    "One-liner-only extraction; confirm exact retraining cadence, data-residency model, and on-prem-vs-cloud inference architecture in editor §3 + §5.",
};

// ─────────────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────────────

const EXISTING_PRODUCTS: ProductSpec[] = [
  {
    key: "hardware",
    company_name: DEMO_COMPANY_HARDWARE,
    product_name: "Bioresorbable Cardiac Stent",
    one_liner: HARDWARE_ONELINER,
    persona: "manufacturer_hardware",
    wizard_answers: HARDWARE_WIZARD,
    ai_extracted_fields: HARDWARE_AI_EXTRACTED,
    readiness_card: buildHardwareCard(),
  },
  {
    key: "samd",
    company_name: DEMO_COMPANY_SAMD,
    product_name: "AI Diabetic Retinopathy Screening Tool",
    one_liner: SAMD_ONELINER,
    persona: "manufacturer_samd",
    wizard_answers: SAMD_WIZARD,
    ai_extracted_fields: SAMD_AI_EXTRACTED,
    readiness_card: buildSamdCard(),
  },
];

const NEW_PRODUCTS: ProductSpec[] = [
  {
    key: "bluecardia",
    company_name: DEMO_COMPANY_BLUECARDIA,
    product_name: "BlueCardia Cardiac Monitor Patch",
    one_liner: BLUECARDIA_ONELINER,
    persona: "manufacturer_hardware",
    wizard_answers: BLUECARDIA_WIZARD,
    ai_extracted_fields: BLUECARDIA_AI_EXTRACTED,
    readiness_card: buildBlueCardiaCard(),
  },
  {
    key: "qxr",
    company_name: DEMO_COMPANY_QXR,
    product_name: "qXR Chest X-Ray AI",
    one_liner: QXR_ONELINER,
    persona: "manufacturer_samd",
    wizard_answers: QXR_WIZARD,
    ai_extracted_fields: QXR_AI_EXTRACTED,
    readiness_card: buildQxrCard(),
  },
];

function buildAiExtractedRow(
  fields: NonNullable<AiExtractedRow["fields"]>
): AiExtractedRow {
  const now = new Date().toISOString();
  return {
    status: "complete",
    source_sha256: null,
    source_filename: null,
    fields,
    cost_usd: 0,
    duration_ms: 0,
    error: null,
    started_at: now,
    completed_at: now,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Prod guard
// ─────────────────────────────────────────────────────────────────────

async function prodGuard(): Promise<void> {
  if (process.env.CONFIRM_PROD !== "yes") {
    console.error(
      "✗ refusing to run without CONFIRM_PROD=yes (this script writes to PROD Supabase)"
    );
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL is not set");
    process.exit(1);
  }
  const projectRef = url.replace(/^https?:\/\//, "").split(".")[0];
  console.log("");
  console.log("──────────────────────────────────────────────────────────");
  console.log("REGULATOR DEMO SEED v2 — PROD GUARD");
  console.log("──────────────────────────────────────────────────────────");
  console.log(`Supabase URL:    ${url}`);
  console.log(`Project ref:     ${projectRef}`);
  console.log(`Demo email:      ${DEMO_EMAIL}`);
  const withTier2 = process.argv.includes("--with-tier2");
  const preserveExisting = process.argv.includes("--preserve-existing");
  const skipTier1Generation = process.argv.includes("--skip-tier1-generation");
  console.log(`Tier 2 layer:    ${withTier2 ? "yes (--with-tier2)" : "no"}`);
  console.log(`Preserve mode:   ${preserveExisting ? "yes (--preserve-existing) — only add NEW_PRODUCTS, keep auth user + existing assessments untouched" : "no — full wipe + reseed everything"}`);
  console.log(`Skip tier1 gen:  ${skipTier1Generation ? "yes (--skip-tier1-generation) — walkable state, no readiness_card / no order / no PDF" : "no — full ₹499 delivery"}`);
  console.log("");
  if (preserveExisting && skipTier1Generation) {
    console.log(
      `About to: skip auth-user + assessment wipe → INSERT ${NEW_PRODUCTS.length} walkable assessment(s) (no readiness_card, no Tier 1 order, no PDF). $0 LLM cost.`
    );
  } else if (preserveExisting) {
    console.log(
      `About to: skip auth-user + assessment wipe → INSERT ${NEW_PRODUCTS.length} new assessment(s) → generate their ₹499 PDFs via Anthropic API.`
    );
  } else if (skipTier1Generation) {
    console.log(
      `About to: delete existing demo user + assessments → recreate user → seed ${EXISTING_PRODUCTS.length + NEW_PRODUCTS.length} walkable assessments (no readiness_card, no Tier 1 order, no PDF). $0 LLM cost.`
    );
  } else {
    console.log(
      `About to: delete existing demo user + assessments → recreate user → seed ${EXISTING_PRODUCTS.length + NEW_PRODUCTS.length} assessments → generate their ₹499 PDFs via Anthropic API.`
    );
  }
  console.log("");
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(
    "Type CONFIRM (uppercase) to proceed, anything else to abort: "
  );
  rl.close();
  if (answer !== "CONFIRM") {
    console.log("✗ aborted — typed confirmation did not match");
    process.exit(1);
  }
  console.log("");
}

// ─────────────────────────────────────────────────────────────────────
// Idempotent wipe + auth-user recreate
// ─────────────────────────────────────────────────────────────────────

async function wipeExisting(): Promise<void> {
  const supabase = getServiceClient();

  // Find existing assessments under this email so we can cascade
  // sections + orders before deleting the row.
  const { data: assessments } = await supabase
    .from("assessments")
    .select("id")
    .eq("email", DEMO_EMAIL);
  const assessmentIds = (assessments ?? []).map((r) => r.id);

  if (assessmentIds.length > 0) {
    const { data: orders } = await supabase
      .from("tier2_orders")
      .select("id")
      .in("assessment_id", assessmentIds);
    const orderIds = (orders ?? []).map((r) => r.id);

    if (orderIds.length > 0) {
      await supabase
        .from("draft_pack_sections")
        .delete()
        .in("order_id", orderIds);
      await supabase
        .from("draft_pack_attachments")
        .delete()
        .in("order_id", orderIds);
      await supabase.from("tier2_orders").delete().in("id", orderIds);
      console.log(
        `✓ wiped ${orderIds.length} prior order(s) + their sections/attachments`
      );
    }
    // All other FK references to assessments.id — discovered the hard
    // way 2026-05-31 when the first v2 run left engine_costs rows
    // behind and a re-seed blocked on the FK constraint. Five tables
    // reference assessments(id): tier2_orders (above), engine_costs,
    // orders (legacy), tier2_draft_packs (legacy, pre migration-012),
    // tier3_waitlist.source_assessment_id (nullable — NULL it, don't
    // delete the lead).
    await supabase
      .from("engine_costs")
      .delete()
      .in("assessment_id", assessmentIds);
    await supabase.from("orders").delete().in("assessment_id", assessmentIds);
    await supabase
      .from("tier2_draft_packs")
      .delete()
      .in("assessment_id", assessmentIds);
    await supabase
      .from("tier3_waitlist")
      .update({ source_assessment_id: null })
      .in("source_assessment_id", assessmentIds);
    await supabase.from("assessments").delete().in("id", assessmentIds);
    console.log(`✓ wiped ${assessmentIds.length} prior assessment(s) for ${DEMO_EMAIL} + all FK dependents`);
  } else {
    console.log(`✓ no prior assessments to wipe for ${DEMO_EMAIL}`);
  }

  // Auth user wipe — admin.listUsers pages; we filter by email match.
  // This is the most-consequential step vs the v1 seeder. Without a
  // real Supabase Auth user, the demo email cannot sign in.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("✗ auth.admin.listUsers failed:", listErr.message);
    process.exit(1);
  }
  const existingUser = list.users.find(
    (u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()
  );
  if (existingUser) {
    const { error: delErr } = await supabase.auth.admin.deleteUser(
      existingUser.id
    );
    if (delErr) {
      console.error("✗ auth.admin.deleteUser failed:", delErr.message);
      process.exit(1);
    }
    console.log(`✓ deleted prior auth user (${existingUser.id})`);
  } else {
    console.log(`✓ no prior auth user to delete`);
  }
}

async function createAuthUser(): Promise<string> {
  // This is the key delta from the v1 seeder. The 2026-05-31 P0 auth
  // fix made every assessment-scoped API route call
  // requireAuthOwnedAssessment(), which enforces
  // assessment.email === user.email. A bare assessments-row insert
  // (the v1 path) is no longer signable-into. DO NOT REMOVE.
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error("✗ auth.admin.createUser failed:", error?.message);
    process.exit(1);
  }
  console.log(
    `✓ created auth user ${data.user.id} (${DEMO_EMAIL}, email_confirm=true)`
  );
  return data.user.id;
}

// ─────────────────────────────────────────────────────────────────────
// Per-product seed
// ─────────────────────────────────────────────────────────────────────

type SeededProduct = {
  spec: ProductSpec;
  assessment_id: string;
  share_token: string | null;
  tier1_order_id: string | null;
  tier1_pdf_url: string | null;
};

async function seedProduct(
  spec: ProductSpec,
  opts: { skipTier1: boolean }
): Promise<SeededProduct> {
  const supabase = getServiceClient();

  // Validate the card shape before insert even when skipTier1 is set —
  // catches schema drift fast. We don't persist the card in skip mode,
  // but the spec authored above must still round-trip the validator so
  // a future full-reset run doesn't fail silently.
  const parsedCard = ReadinessCardSchema.safeParse(spec.readiness_card);
  if (!parsedCard.success) {
    console.error(
      `✗ ${spec.key} readiness card failed schema validation:`,
      parsedCard.error.issues
    );
    process.exit(1);
  }

  // ── Skip-tier1 branch: insert walkable assessment + return early ──
  // status='wizard' is the right state for the demo flow — see
  // app/assess/[id]/page.tsx:125-152 (wizard / routing_complete /
  // draft + all answers prefilled → redirect to /wizard/[id]/q/1).
  // 'wizard_complete' would auto-fire synthesis on /assess/[id] visit,
  // bypassing the live "click Generate" demo moment.
  if (opts.skipTier1) {
    const { data: walkable, error: wErr } = await supabase
      .from("assessments")
      .insert({
        name: spec.company_name,
        email: DEMO_EMAIL,
        one_liner: spec.one_liner,
        product_type: "product",
        wizard_answers: spec.wizard_answers,
        readiness_card: null,
        ai_extracted: buildAiExtractedRow(spec.ai_extracted_fields),
        share_token: null,
        status: "wizard",
        meta: {
          seeded_for: "regulator_demo_v2_2026-05-31",
          seeded_walkable: true,
        },
      })
      .select("id")
      .single<{ id: string }>();
    if (wErr || !walkable) {
      console.error(
        `✗ ${spec.key} walkable assessment insert failed:`,
        wErr?.message
      );
      process.exit(1);
    }
    console.log(
      `✓ created walkable assessment ${walkable.id} for demo+regulator (${spec.key}) [skip-tier1]`
    );
    return {
      spec,
      assessment_id: walkable.id,
      share_token: null,
      tier1_order_id: null,
      tier1_pdf_url: null,
    };
  }

  const shareToken = await generateShareToken();
  const nowIso = new Date().toISOString();
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .insert({
      name: spec.company_name,
      email: DEMO_EMAIL,
      one_liner: spec.one_liner,
      product_type: "product",
      wizard_answers: spec.wizard_answers,
      readiness_card: parsedCard.data,
      ai_extracted: buildAiExtractedRow(spec.ai_extracted_fields),
      share_token: shareToken,
      status: "completed",
      // Bypass the /upgrade/[id] "wizard not complete" redirect.
      meta: {
        tier_b_completed_at: nowIso,
        seeded_for: "regulator_demo_v2_2026-05-31",
      },
    })
    .select("id, share_token")
    .single<{ id: string; share_token: string }>();
  if (aErr || !assessment) {
    console.error(`✗ ${spec.key} assessment insert failed:`, aErr?.message);
    process.exit(1);
  }
  console.log(
    `✓ created assessment ${assessment.id} for demo+regulator (${spec.key})`
  );

  const { data: order, error: oErr } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: assessment.id,
      amount_inr: 499,
      status: "generating",
      tier_choice: "draft_pack",
      email_sent_to: DEMO_EMAIL,
      notes: "seeded for regulator_demo_v2_2026-05-31",
    })
    .select("id")
    .single<{ id: string }>();
  if (oErr || !order) {
    console.error(`✗ ${spec.key} order insert failed:`, oErr?.message);
    process.exit(1);
  }
  console.log(`✓ created tier1 order ${order.id} for ${spec.key}`);

  // Run the generator with the same retry envelope as the v1 seeder.
  console.log(`… running tier1 generator for ${spec.key} (sequenced, no parallel)…`);
  const t0 = Date.now();
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await dispatchGenerationForOrder(order.id);
      break;
    } catch (err) {
      if (attempt >= 3) {
        console.error(
          `✗ tier1 generator failed for ${spec.key} after 3 attempts:`,
          err
        );
        process.exit(1);
      }
      console.warn(
        `… tier1 generator attempt ${attempt} threw for ${spec.key} — retrying in ${attempt * 5}s:`,
        err instanceof Error ? err.message : err
      );
      await new Promise((r) => setTimeout(r, attempt * 5000));
    }
  }
  const genS = ((Date.now() - t0) / 1000).toFixed(1);

  const { data: finalOrder } = await supabase
    .from("tier2_orders")
    .select("status, draft_pack_pdf_url, delivered_at, notes")
    .eq("id", order.id)
    .maybeSingle<{
      status: string;
      draft_pack_pdf_url: string | null;
      delivered_at: string | null;
      notes: string | null;
    }>();
  if (!finalOrder || finalOrder.status !== "delivered") {
    console.error(
      `✗ tier1 order did not reach 'delivered' for ${spec.key}: status=${finalOrder?.status} notes=${finalOrder?.notes}`
    );
    process.exit(1);
  }
  console.log(
    `✓ delivered tier1 PDF for ${spec.key} in ${genS}s (${finalOrder.draft_pack_pdf_url ? "url stamped" : "no url stamped"})`
  );

  return {
    spec,
    assessment_id: assessment.id,
    share_token: assessment.share_token,
    tier1_order_id: order.id,
    tier1_pdf_url: finalOrder.draft_pack_pdf_url,
  };
}

async function layerTier2(seeded: SeededProduct): Promise<string> {
  const supabase = getServiceClient();
  const { data: order, error: oErr } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: seeded.assessment_id,
      amount_inr: 2499,
      status: "generating",
      tier_choice: "draft_editor",
      email_sent_to: DEMO_EMAIL,
      notes: "seeded for regulator_demo_v2_2026-05-31 (tier2)",
    })
    .select("id")
    .single<{ id: string }>();
  if (oErr || !order) {
    console.error(
      `✗ ${seeded.spec.key} tier2 order insert failed:`,
      oErr?.message
    );
    process.exit(1);
  }
  console.log(`✓ created tier2 order ${order.id} for ${seeded.spec.key}`);

  console.log(`… running draft_pack_v2 generator for ${seeded.spec.key} (sequenced)…`);
  const t0 = Date.now();
  try {
    await dispatchGenerationForOrder(order.id);
  } catch (err) {
    console.error(
      `✗ tier2 generator threw for ${seeded.spec.key} (NOT retried — the tier1 demo path still stands):`,
      err instanceof Error ? err.message : err
    );
    // Don't process.exit; tier1 is the demo-critical layer.
    return order.id;
  }
  const genS = ((Date.now() - t0) / 1000).toFixed(1);

  const { data: finalOrder } = await supabase
    .from("tier2_orders")
    .select("status, delivered_at")
    .eq("id", order.id)
    .maybeSingle<{ status: string; delivered_at: string | null }>();
  if (!finalOrder || finalOrder.status !== "delivered") {
    console.warn(
      `… tier2 order did not reach 'delivered' for ${seeded.spec.key}: status=${finalOrder?.status} (tier1 demo path still works)`
    );
  } else {
    console.log(
      `✓ delivered tier2 pack for ${seeded.spec.key} in ${genS}s`
    );
  }
  return order.id;
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const withTier2 = process.argv.includes("--with-tier2");
  // --preserve-existing — additive mode for layering new assessments on
  // top of an already-live demo state without wiping. Used when the demo
  // is already mid-prep and you just want to add another fresh-walk
  // assessment without re-running the auth-user create and the original
  // ₹499 generations. When the flag is OFF the seeder is fully
  // destructive — wipes the auth user + every assessment under
  // demo+regulator + their FK dependents — which is the right behavior
  // for a Monday-morning clean reset.
  const preserveExisting = process.argv.includes("--preserve-existing");
  // --skip-tier1-generation — walkable demo state. The seeded
  // assessment has status='wizard' + wizard_answers + ai_extracted but
  // no readiness_card, no share_token, no tier1 order, no PDF. The
  // demo presenter walks the wizard live; the final Next triggers
  // synthesis on /assess/[id]. Refuses to combine with --with-tier2
  // because Tier 2 requires a delivered Tier 1 as prerequisite.
  const skipTier1Generation = process.argv.includes("--skip-tier1-generation");

  if (withTier2 && skipTier1Generation) {
    console.error(
      "✗ --skip-tier1-generation and --with-tier2 cannot both be set. Tier 2 requires a delivered Tier 1 (readiness card + ₹499 order) as a prerequisite."
    );
    process.exit(1);
  }

  await prodGuard();

  if (!preserveExisting) {
    await wipeExisting();
    await createAuthUser();
  } else {
    console.log("✓ --preserve-existing set: skipping wipe + auth-user create");
  }

  // Decide which specs run. Preserve mode = NEW_PRODUCTS only (additive
  // layer over the live state). Full mode = everything (existing + new),
  // matching the "Monday-morning reset" intent.
  //
  // NOTE on skipTier1Generation: it applies uniformly to every spec in
  // this run. If you want a mixed state (Pulsar/Drishti delivered,
  // BlueCardia/qXR walkable), do two separate runs — one without
  // --skip-tier1-generation for the existing pair, then a second with
  // --preserve-existing --skip-tier1-generation for the new pair.
  const productsToSeed = preserveExisting
    ? NEW_PRODUCTS
    : [...EXISTING_PRODUCTS, ...NEW_PRODUCTS];

  // Sequence the per-product seed steps — explicit choice (vs Promise.all).
  // The PDF renderer (`@react-pdf/renderer`) does global font registration;
  // the trigger function uses a module-scope Anthropic client. Both are
  // likely safe in parallel but neither has tests for concurrent
  // invocation. ~30s of extra wall time is cheap insurance for a one-shot
  // prod seed.
  const seeded: SeededProduct[] = [];
  for (const spec of productsToSeed) {
    const r = await seedProduct(spec, { skipTier1: skipTier1Generation });
    seeded.push(r);
  }

  const tier2Ids: Record<string, string> = {};
  if (withTier2) {
    console.log("");
    console.log("── --with-tier2 flag set; layering ₹2,499 draft_pack_v2 ──");
    for (const r of seeded) {
      const tier2OrderId = await layerTier2(r);
      tier2Ids[r.spec.key] = tier2OrderId;
    }
  }

  // ── Summary ─────────────────────────────────────────────────────
  console.log("");
  console.log("──────────────────────────────────────────────────────────");
  console.log("REGULATOR DEMO SEED v2 — DONE");
  console.log("──────────────────────────────────────────────────────────");
  console.log(`sign-in email     ${DEMO_EMAIL}`);
  console.log(`sign-in password  ${DEMO_PASSWORD}`);
  console.log("");
  for (const r of seeded) {
    console.log(`[${r.spec.key}]`);
    console.log(`  assessment_id   ${r.assessment_id}`);
    if (r.tier1_order_id) {
      console.log(`  share_token     ${r.share_token}`);
      console.log(`  tier1_order_id  ${r.tier1_order_id}`);
      console.log(`  tier1_pdf_url   ${r.tier1_pdf_url ?? "(not stamped)"}`);
    } else {
      console.log(`  state           walkable (status='wizard', no readiness_card, no Tier 1 order)`);
    }
    if (withTier2 && tier2Ids[r.spec.key]) {
      console.log(`  tier2_order_id  ${tier2Ids[r.spec.key]}`);
    }
    console.log("");
  }
  console.log("Paths (prefix with the prod origin):");
  for (const r of seeded) {
    if (r.share_token) {
      console.log(`  /c/${r.share_token}     # ${r.spec.key} readiness card`);
      console.log(`  /upgrade/${r.assessment_id}     # ${r.spec.key} ₹499 panel`);
    } else {
      console.log(`  /assess/${r.assessment_id}     # ${r.spec.key} walkable wizard entry`);
    }
    if (withTier2 && tier2Ids[r.spec.key]) {
      console.log(
        `  /draft/${r.assessment_id}     # ${r.spec.key} ₹2,499 editor`
      );
    }
  }
  console.log("");
}

main().catch((err) => {
  console.error("✗ seed failed:", err);
  process.exit(1);
});
