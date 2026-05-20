#!/usr/bin/env tsx
/**
 * Sprint 3 Phase 1.6 — sample Readiness Report generator.
 *
 * Founder gate deliverable: produces a full Tier 1 PDF on the
 * Alzheimer's-MRI case facts (from docs/specs/tier1-readiness-report-
 * build-brief.md) so the founder can review the report end-to-end
 * before launch. Pair this with the three seed-table sign-off docs
 * at docs/seed-tables/.
 *
 * Two run modes:
 *
 *   1. Synthetic — no DB required. Uses a hand-curated Tier 0
 *      readiness_card + wizard_answers matching the Alzheimer's-MRI
 *      case in the build brief. Runs the 4-call Opus generator,
 *      renders the PDF, writes it to disk.
 *
 *        ANTHROPIC_API_KEY=... pnpm tsx scripts/generate-readiness-report-sample.ts
 *
 *   2. From a real assessment — pass --assessment <uuid> to pull
 *      the live readiness_card + wizard_answers from Supabase.
 *
 *        SUPABASE_SERVICE_ROLE_KEY=... ANTHROPIC_API_KEY=... \
 *        pnpm tsx scripts/generate-readiness-report-sample.ts \
 *          --assessment a4bd6e06-6650-4c8d-91a5-9d47c977eef4
 *
 * Output: writes ./readiness-report-sample.pdf in the repo root.
 * Logs cost + token usage on stdout.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { generateReadinessReport } from "../lib/engine/readiness-report-v1-generator";
import { ReadinessReportDocument } from "../lib/pdf/readiness-report-template";
import { ReadinessCardSchema, type ReadinessCard } from "../lib/schemas/readiness-card";
import type { WizardAnswers } from "../lib/wizard/types";

const OUTPUT_PATH = resolve(process.cwd(), "readiness-report-sample.pdf");

const ALZHEIMER_CASE = {
  assessment_id: "a4bd6e06-6650-4c8d-91a5-9d47c977eef4",
  company_name: "Raunaq Pradhan",
  product_name: "AI MRI Alzheimer's screening tool",
  scoped_feature: null as string | null,
};

// Hand-built Tier 0 readiness_card aligned with the Alzheimer's-MRI
// facts in tier1-readiness-report-build-brief.md. NOT a real card —
// just the smallest believable input the generator needs.
const ALZHEIMER_CARD: ReadinessCard = {
  meta: {
    company_name: "Raunaq Pradhan",
    product_name: "AI MRI Alzheimer's screening tool",
    scoped_feature: null,
    product_type: "product",
    generated_at: "2026-04-25T00:00:00Z",
    conflict_resolved: null,
  },
  classification: {
    medical_device_status: "is_medical_device",
    device_type: "AI/ML SaMD — adjunctive computer-aided detection",
    imdrf_category: "III",
    cdsco_class: "C",
    class_qualifier: "AI-CDS",
    ai_ml_flag: true,
    acp_required: true,
    export_only: false,
    novel_or_predicate: "novel",
  },
  readiness: {
    score: 0,
    band: "red",
    dimensions: {
      regulatory_clarity: 0,
      quality_system: 0,
      technical_docs: 0,
      clinical_evidence: 0,
      submission_maturity: 0,
    },
    note: "No QMS, no software lifecycle, no Indian-population clinical evidence in place yet — foundational uplift required before any submission planning.",
  },
  risk: {
    level: "high",
    rationale:
      "AI-assisted diagnostic flagging for a serious neurodegenerative condition, on sensitive MRI data, with no clinical-validation evidence in an Indian population. Class C SaMD by default under the Oct 2025 CDSCO SaMD draft.",
  },
  timeline: {
    estimate_months_low: 14,
    estimate_months_high: 22,
    display: "14–22 months",
    anchor: "Driven by prospective clinical investigation (MD-22) timing.",
  },
  regulations: {
    cdsco_mdr: {
      verdict: "required",
      rationale:
        "AI/ML SaMD intended to flag suspected early-stage Alzheimer's from brain MRI. Informs clinical management in a critical disease — Class C under the Oct 2025 CDSCO SaMD draft.",
      forms: ["MD-7", "MD-12", "MD-22"],
      pathway_note:
        "Domestic manufacturer → MD-7 to the Central Licensing Authority, supported by an MD-12 test licence for the clinical investigation batches. MD-22 application for the prospective clinical investigation is likely required given the novel indication.",
    },
    cdsco_pharmacy: {
      verdict: "not_applicable",
      rationale: "No drug substance involved.",
    },
    dpdp: {
      verdict: "required",
      rationale:
        "MRI scans are sensitive personal data under the DPDP Act 2023. A consent flow, data-principal rights workflow, and breach SOP are likely required regardless of deployment mode (on-premise or cloud).",
    },
    icmr: {
      verdict: "required",
      rationale:
        "Prospective clinical investigation will need EC approval per ICMR 2023 ethics guidelines, with explicit treatment of AI bias and Indian-population validity.",
    },
    abdm: {
      verdict: "conditional",
      rationale:
        "Hospital deployment may need ABDM/FHIR alignment if procured by ABDM-aligned hospitals. Not blocking for marketing licence.",
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
        "Draft a multi-centre CI plan, secure EC approval at a partner radiology centre, register on CTRI prior to data collection.",
      severity: "high",
    },
    {
      dim: "technical_docs",
      gap_title: "No ISO 14971 risk management file",
      fix_action:
        "Build the risk file (hazards, hazardous situations, harms, controls, residual risk) alongside the QMS roll-out.",
      severity: "medium",
    },
    {
      dim: "technical_docs",
      gap_title: "No Algorithm Change Protocol (ACP/PCCP) drafted",
      fix_action:
        "Per the Oct 2025 SaMD draft, draft an ACP describing modification scope, retraining triggers, validation thresholds, and human oversight.",
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
  verdict: "Likely Class C SaMD requiring central CDSCO review and a prospective clinical investigation.",
  why_regulated:
    "The device informs clinical management for a serious neurodegenerative condition based on imaging analysis — a profile that falls inside MDR-2017 SaMD scope.",
  post_2025_samd_gap: true,
  tier0_card_tagline:
    "AI/ML diagnostic-support SaMD with a 14–22 month path to a Class C submission.",
  tier1_teaser: "",
  tier2_teaser: "",
  recommended_path: "clinical_investigation",
};

const ALZHEIMER_WIZARD: WizardAnswers = {
  persona: "manufacturer_samd",
  q1: "serious",
  q2: "drives",
  q3: "hcps",
  q4: "10k_to_1l",
  q5: "hospital",
  q6: ["phi", "imaging"],
  q7: "pre_mvp",
};

async function loadFromAssessment(assessmentId: string): Promise<{
  card: ReadinessCard;
  wizard: WizardAnswers;
  productName: string;
  companyName: string;
}> {
  const { getServiceClient } = await import("../lib/supabase");
  const { displayName } = await import("../lib/wizard/display-name");
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, name, one_liner, readiness_card, wizard_answers")
    .eq("id", assessmentId)
    .maybeSingle<{
      id: string;
      name: string;
      one_liner: string;
      readiness_card: unknown;
      wizard_answers: unknown;
    }>();
  if (error || !data) {
    throw new Error(`assessment ${assessmentId} not found: ${error?.message ?? "no row"}`);
  }
  const card = ReadinessCardSchema.parse(data.readiness_card);
  const wizard = (data.wizard_answers ?? {}) as WizardAnswers;
  return {
    card,
    wizard,
    productName: displayName(data.one_liner),
    companyName: data.name,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const assessmentIdx = args.indexOf("--assessment");
  const assessmentId =
    assessmentIdx >= 0 && args[assessmentIdx + 1] ? args[assessmentIdx + 1] : null;

  let card: ReadinessCard;
  let wizard: WizardAnswers;
  let companyName: string;
  let productName: string;
  let sourceAssessmentId: string;

  if (assessmentId) {
    console.log(`[sample] loading from assessment ${assessmentId}`);
    const loaded = await loadFromAssessment(assessmentId);
    card = loaded.card;
    wizard = loaded.wizard;
    companyName = loaded.companyName;
    productName = loaded.productName;
    sourceAssessmentId = assessmentId;
  } else {
    console.log("[sample] using synthetic Alzheimer's-MRI case (no DB hit)");
    card = ALZHEIMER_CARD;
    wizard = ALZHEIMER_WIZARD;
    companyName = ALZHEIMER_CASE.company_name;
    productName = ALZHEIMER_CASE.product_name;
    sourceAssessmentId = ALZHEIMER_CASE.assessment_id;
  }

  console.log(`[sample] generating report — ${productName}`);
  const t0 = Date.now();
  const result = await generateReadinessReport({
    assessment_id: sourceAssessmentId,
    company_name: companyName,
    product_name: productName,
    scoped_feature: card.meta.scoped_feature,
    readiness_card: card,
    wizard_answers: wizard,
  });
  const genS = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `[sample] generator done in ${genS}s · cost $${result.cost_usd.toFixed(4)} · ` +
      `tokens in=${result.usage.input_tokens} cache_read=${result.usage.cache_read} out=${result.usage.output_tokens}`
  );

  const t1 = Date.now();
  const element = React.createElement(ReadinessReportDocument, { report: result.report });
  const pdf = await renderToBuffer(
    element as unknown as React.ReactElement<DocumentProps>
  );
  const renderS = ((Date.now() - t1) / 1000).toFixed(1);
  console.log(
    `[sample] PDF rendered in ${renderS}s · ${(pdf.length / 1024).toFixed(0)} KB`
  );

  await writeFile(OUTPUT_PATH, pdf);
  console.log(`[sample] wrote ${OUTPUT_PATH}`);
  console.log(`[sample] ✓ done. Open the PDF to review.`);
}

main().catch((err) => {
  console.error("[sample] failed:", err);
  process.exit(1);
});
