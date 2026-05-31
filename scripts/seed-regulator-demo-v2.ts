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
 * Run:
 *   CONFIRM_PROD=yes dotenvx run -f .env.local -- \
 *     tsx scripts/seed-regulator-demo-v2.ts
 *   (add --with-tier2 to layer ₹2,499 draft_pack_v2 on top)
 *
 * Costs: ₹499 sequence ≈ $0.28 + ~60s wall. ₹2,499 add-on ≈ $0.74 + ~10 min.
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
  key: "hardware" | "samd";
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
// Compose
// ─────────────────────────────────────────────────────────────────────

const PRODUCTS: ProductSpec[] = [
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
  console.log(`Tier 2 layer:    ${process.argv.includes("--with-tier2") ? "yes (--with-tier2)" : "no"}`);
  console.log("");
  console.log(
    "About to: delete existing demo user + assessments → recreate user → " +
      "seed two assessments → generate two ₹499 PDFs via Anthropic API."
  );
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
  share_token: string;
  tier1_order_id: string;
  tier1_pdf_url: string | null;
};

async function seedProduct(spec: ProductSpec): Promise<SeededProduct> {
  const supabase = getServiceClient();

  // Validate the card shape before insert — catches schema drift fast.
  const parsedCard = ReadinessCardSchema.safeParse(spec.readiness_card);
  if (!parsedCard.success) {
    console.error(
      `✗ ${spec.key} readiness card failed schema validation:`,
      parsedCard.error.issues
    );
    process.exit(1);
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

  await prodGuard();
  await wipeExisting();
  await createAuthUser();

  // Sequence the per-product seed steps — explicit choice (vs Promise.all
  // over PRODUCTS). The PDF renderer (`@react-pdf/renderer`) does global
  // font registration; the trigger function uses a module-scope Anthropic
  // client. Both are likely safe in parallel but neither has tests for
  // concurrent invocation. ~30s of extra wall time is cheap insurance
  // for a one-shot prod seed.
  const seeded: SeededProduct[] = [];
  for (const spec of PRODUCTS) {
    const r = await seedProduct(spec);
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
    console.log(`  share_token     ${r.share_token}`);
    console.log(`  tier1_order_id  ${r.tier1_order_id}`);
    console.log(`  tier1_pdf_url   ${r.tier1_pdf_url ?? "(not stamped)"}`);
    if (withTier2 && tier2Ids[r.spec.key]) {
      console.log(`  tier2_order_id  ${tier2Ids[r.spec.key]}`);
    }
    console.log("");
  }
  console.log("Paths (prefix with the prod origin):");
  for (const r of seeded) {
    console.log(`  /c/${r.share_token}     # ${r.spec.key} readiness card`);
    console.log(`  /upgrade/${r.assessment_id}     # ${r.spec.key} ₹499 panel`);
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
