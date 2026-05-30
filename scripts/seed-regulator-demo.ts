/**
 * Regulator-demo seed: production database insert of one polished, complete,
 * navigable Alzheimer's-MRI assessment so the founder can walk the full
 * Tier 1 flow live without waiting on generation.
 *
 * Steps:
 *   1. Insert assessments row (wizard answers + readiness card + share_token,
 *      meta.tier_b_completed_at set, status='completed').
 *   2. Insert tier2_orders row (tier_choice='draft_pack', status='generating',
 *      email_sent_to='demo+regulator@clearpath.in', no Cashfree fields).
 *   3. Call triggerReadinessReportForOrder — same code path as the live
 *      Cashfree webhook. Generates JSON + PDF, uploads to tier1_reports,
 *      flips status to 'delivered', stamps draft_pack_pdf_url.
 *   4. Print the navigable URLs.
 *
 * Idempotent guard: skips if a demo+regulator@clearpath.in assessment
 * already exists. To re-seed, delete the rows first via psql / Supabase
 * Dashboard.
 *
 * Run: dotenvx run -f .env.local -- tsx scripts/seed-regulator-demo.ts
 */

import { getServiceClient } from "../lib/supabase";
import { generateShareToken } from "../lib/engine/share-token";
import { triggerReadinessReportForOrder } from "../lib/engine/readiness-report-trigger";
import type { ReadinessCard } from "../lib/schemas/readiness-card";
import type { WizardAnswers } from "../lib/wizard/types";

const DEMO_EMAIL = "demo+regulator@clearpath.in";
const DEMO_COMPANY = "Neurascan Health";
const DEMO_PRODUCT_ONELINER = "AI MRI Alzheimer's screening tool";

// Same regulatory shape the readiness-report-sample.pdf is built from —
// Class C SaMD, novel AI/ML, clinical-investigation pathway, ACP required.
const DEMO_WIZARD: WizardAnswers = {
  persona: "manufacturer_samd",
  q1: "serious",
  q2: "drives",
  q3: "hcps",
  q4: "10k_to_1l",
  q5: "hospital",
  q6: ["phi", "imaging"],
  q7: "pre_mvp",
};

function buildDemoCard(): ReadinessCard {
  return {
    meta: {
      company_name: DEMO_COMPANY,
      product_name: DEMO_PRODUCT_ONELINER,
      scoped_feature: null,
      product_type: "product",
      generated_at: new Date().toISOString(),
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
          "Domestic manufacturer to MD-7 to the Central Licensing Authority, supported by an MD-12 test licence for the clinical investigation batches. MD-22 application for the prospective clinical investigation is likely required given the novel indication.",
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
}

async function main() {
  const supabase = getServiceClient();

  // ── Idempotent guard ────────────────────────────────────────
  const { data: existing } = await supabase
    .from("assessments")
    .select("id, share_token")
    .eq("email", DEMO_EMAIL)
    .limit(1)
    .maybeSingle<{ id: string; share_token: string | null }>();
  if (existing) {
    console.log(
      `[seed] assessment for ${DEMO_EMAIL} already exists (${existing.id}, share_token=${existing.share_token}). Delete before re-seeding.`
    );
    process.exit(0);
  }

  // ── 1. Assessment row ───────────────────────────────────────
  const card = buildDemoCard();
  const shareToken = await generateShareToken();
  const nowIso = new Date().toISOString();
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .insert({
      name: DEMO_COMPANY,
      email: DEMO_EMAIL,
      one_liner: DEMO_PRODUCT_ONELINER,
      product_type: "product",
      wizard_answers: DEMO_WIZARD,
      readiness_card: card,
      share_token: shareToken,
      status: "completed",
      // Bypass the /upgrade/[id] page's "wizard not complete" redirect.
      meta: {
        tier_b_completed_at: nowIso,
        seeded_for: "regulator_demo_2026-05-27",
      },
    })
    .select("id, share_token, name, email")
    .single<{ id: string; share_token: string; name: string; email: string }>();
  if (aErr || !assessment) {
    console.error("[seed] assessment insert failed:", aErr?.message);
    process.exit(1);
  }
  console.log(
    `[seed] ✓ assessment created · id=${assessment.id} · share_token=${assessment.share_token}`
  );

  // ── 2. tier2_orders row (status='generating' so the trigger runs) ──
  const { data: order, error: oErr } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: assessment.id,
      amount_inr: 499,
      status: "generating",
      tier_choice: "draft_pack",
      email_sent_to: DEMO_EMAIL,
      // No Cashfree fields — this is a manually-seeded demo order, not a
      // payment transaction. The schema's NOT NULL columns are amount + status.
      notes: "seeded for regulator_demo_2026-05-27",
    })
    .select("id, status")
    .single<{ id: string; status: string }>();
  if (oErr || !order) {
    console.error("[seed] order insert failed:", oErr?.message);
    process.exit(1);
  }
  console.log(`[seed] ✓ order created · id=${order.id} · status=${order.status}`);

  // ── 3. Live generator (same path as the Cashfree webhook) ──
  console.log(`[seed] running live generator for order ${order.id}…`);
  const t0 = Date.now();
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await triggerReadinessReportForOrder(order.id);
      break;
    } catch (err) {
      if (attempt >= 3) {
        console.error(`[seed] generator failed after 3 attempts:`, err);
        process.exit(1);
      }
      console.warn(
        `[seed] generator attempt ${attempt} threw — retrying in ${attempt * 5}s:`,
        err instanceof Error ? err.message : err
      );
      await new Promise((r) => setTimeout(r, attempt * 5000));
    }
  }
  const genS = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[seed] ✓ trigger returned in ${genS}s`);

  // ── 4. Verify order final state ─────────────────────────────
  const { data: finalOrder } = await supabase
    .from("tier2_orders")
    .select("id, status, draft_pack_pdf_url, delivered_at, notes")
    .eq("id", order.id)
    .maybeSingle();
  if (!finalOrder || finalOrder.status !== "delivered") {
    console.error(
      `[seed] order did not reach 'delivered': status=${finalOrder?.status} notes=${finalOrder?.notes}`
    );
    process.exit(1);
  }
  console.log(`[seed] ✓ order is delivered · delivered_at=${finalOrder.delivered_at}`);

  // ── 5. Hand back URLs ───────────────────────────────────────
  console.log("\n────────────────────────────────────────────────────────");
  console.log("REGULATOR DEMO SEED — DONE");
  console.log("────────────────────────────────────────────────────────");
  console.log(`assessment_id   ${assessment.id}`);
  console.log(`share_token     ${assessment.share_token}`);
  console.log(`order_id        ${order.id}`);
  console.log(`pdf_url         ${finalOrder.draft_pack_pdf_url}`);
  console.log("");
  console.log("Paths (prefix with the prod origin):");
  console.log(`  /c/${assessment.share_token}     # readiness card`);
  console.log(`  /upgrade/${assessment.id}        # delivered Tier 1 panel`);
  console.log("");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
