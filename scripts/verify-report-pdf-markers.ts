/**
 * Phase 2c follow-up — offline render verifier for the inference-marker
 * block on the ₹499 Readiness Report PDF.
 *
 * No LLM calls, no Supabase. Builds a minimal valid `ReadinessReport`
 * payload twice — once with three markers populated (hardware persona)
 * and once with no markers (SaMD persona) — renders both, writes to
 * `data/smoke/report-marker-verify-{hardware,samd}.pdf`.
 *
 * Eyeball check: the hardware PDF should show a "What we assumed about
 * your device" strip on page 1 between the metric grid and the triggers
 * chips. The SaMD PDF should look identical to the previous report
 * template (block omitted when markers empty).
 *
 * Usage:
 *   pnpm tsx scripts/verify-report-pdf-markers.ts
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ReadinessReportDocument } from "../lib/pdf/readiness-report-template";
import {
  ReadinessReportSchema,
  type ReadinessReport,
} from "../lib/schemas/readiness-report";
import type { InferenceMarker } from "../lib/schemas/readiness-card";

const HARDWARE_MARKERS: InferenceMarker[] = [
  {
    field: "sterile",
    label: "Sterile device",
    value: "No",
    status: "assumed",
    basis:
      "Pitch deck didn't mention sterilization; assumed non-sterile based on wearable form factor.",
    correctable_at: "wizard Q9 (sterilization mode)",
  },
  {
    field: "drug_content",
    label: "Drug content",
    value: "No drug content",
    status: "assumed",
    basis:
      "No drug delivery, coating, or impregnation described in the intake. Drug-combination devices go via a different pathway.",
    correctable_at: "wizard Q10 (drug content)",
  },
  {
    field: "year1_users",
    label: "Year-1 patient volume",
    value: "Under 10,000",
    status: "estimated",
    basis:
      "Early-stage company; estimated early-adopter volume. Used to size cost bands only.",
    correctable_at: "wizard Q4 (deployment scale)",
  },
];

function baseReport(): ReadinessReport {
  // Minimal valid payload — every Zod min/max satisfied.
  const payload: ReadinessReport = {
    meta: {
      company_name: "ClearPath verify",
      product_name: "Continuous cardiac patch monitor",
      scoped_feature: null,
      generated_at: "2026-05-29T00:00:00Z",
      source_assessment_id: "marker-verify-00000000",
      inference_markers: [],
    },
    scorecard: {
      classification_label: "Class B medical device",
      classification_class: "B",
      classification_qualifier: null,
      confidence: "medium",
      complexity: "moderate",
      pathway_label: "MD-7 → MD-9 (Central Licensing Authority)",
      // ↳ NOTE: the pathway label and gap titles below intentionally
      // use the real Unicode glyphs (₹, →, ↳) so the verifier exercises
      // the font-coverage fix end-to-end. A regression here will show
      // up as the WinAnsi substitution again (¹, ³, etc.).
      clinical_investigation_likely: false,
      timeline_display: "10–14 months",
      cost_range_inr_display: "₹18–28 L",
      readiness_score: 4,
      readiness_band: "amber",
      risk_level: "medium",
      top_gap_titles: [
        "No ISO 13485 QMS",
        "No biocompatibility test plan",
        "No clinical evaluation file",
      ],
      recommended_next_action:
        "Engage an ISO 13485 consultant; commission ISO 10993 biocompatibility testing alongside the QMS build.",
      triggers: [
        "Adhesive skin contact > 24 hours",
        "Continuous physiological measurement",
        "No predicate cited",
      ],
    },
    pathway: {
      why_this_class_applies:
        "Skin-contact continuous-monitoring devices typically fall in Class B under the MDR-2017 risk-class table.",
      authority: "Central Licensing Authority (CDSCO)",
      forms: ["MD-7", "MD-9"],
      step_sequence: [
        {
          step: "ISO 13485 QMS roll-out",
          what_happens:
            "Stand up the quality system; target a stage-1 audit in 6 months.",
          duration: "5–7 months",
        },
        {
          step: "Biocompatibility test campaign",
          what_happens:
            "ISO 10993-5/10/23 panel via an NABL-accredited lab.",
          duration: "3–4 months",
        },
        {
          step: "MD-7 dossier compilation",
          what_happens:
            "DMF + DMF appendices, manufacturing site, clinical evaluation file.",
          duration: "2–3 months",
        },
        {
          step: "CDSCO review",
          what_happens: "Queries and clarification cycles before MD-9 grant.",
          duration: "4–6 months",
        },
      ],
      test_licence_note: null,
      acp_note: null,
    },
    gap_analysis: {
      rows: [
        {
          priority: "P1",
          gap: "No ISO 13485 QMS established",
          why_it_matters:
            "MDR-2017 §3 makes a QMS the foundation of any manufacturing-licence dossier.",
          suggested_next_step:
            "Engage a 13485 consultant; target a stage-1 audit by month 6.",
          estimated_effort: "5–7 months",
          dim: "quality_system",
        },
        {
          priority: "P1",
          gap: "No biocompatibility evidence (ISO 10993)",
          why_it_matters:
            "Skin-contact for > 24h needs cytotoxicity, sensitization, irritation per the 10993 matrix.",
          suggested_next_step:
            "Commission the ISO 10993-5/10/23 panel at an NABL-accredited lab.",
          estimated_effort: "3–4 months",
          dim: "technical_docs",
        },
        {
          priority: "P2",
          gap: "No clinical evaluation file",
          why_it_matters:
            "Class B with no predicate typically needs a clinical evaluation per MDR-2017 §27.",
          suggested_next_step:
            "Draft a clinical evaluation plan + literature review covering the intended use.",
          estimated_effort: "2–3 months",
          dim: "clinical_evidence",
        },
      ],
    },
    timeline_cost: {
      total_range_display: "10–14 months",
      total_anchor: "Driven by ISO 13485 QMS roll-out.",
      phases: [
        {
          name: "QMS roll-out",
          duration: "5–7 months",
          what_happens: "13485 stand-up, internal audit, surveillance plan.",
          cost_range_inr: "₹6–10 L",
        },
        {
          name: "Biocompatibility + V&V",
          duration: "3–4 months",
          what_happens: "ISO 10993 panel + electrical safety testing.",
          cost_range_inr: "₹6–10 L",
        },
        {
          name: "MD-7 review",
          duration: "4–6 months",
          what_happens: "Submit, respond to queries, await MD-9 grant.",
          cost_range_inr: "₹2–4 L",
        },
      ],
      bottlenecks: [
        "Test-lab queue for ISO 10993 panel",
        "CDSCO review-cycle response times",
      ],
    },
    reviewer_insights: [
      {
        priority: "Predicate justification",
        what_reviewers_look_for:
          "A near-equivalent device on the Indian market; absence shifts the dossier toward de-novo clinical evaluation.",
      },
      {
        priority: "Biocompatibility coverage",
        what_reviewers_look_for:
          "10993 panel scoped to skin-contact duration and tissue type; raw lab reports attached.",
      },
      {
        priority: "QMS evidence",
        what_reviewers_look_for:
          "Internal-audit reports, CAPA log, management-review minutes — a working QMS, not a binder of SOPs.",
      },
    ],
    smart_examples: [
      {
        category: "intended_use",
        topic: "Intended use phrasing",
        good_snippet:
          "Continuous adhesive-patch ECG for adults under physician supervision.",
        bad_snippet: "Monitors heart health 24/7 for everyone.",
        why_this_is_safer:
          "Names the population, the supervision model, and avoids consumer-wellness language that drifts toward an MDR-2017 carve-out.",
      },
      {
        category: "risk_justification",
        topic: "Skin-contact risk control",
        good_snippet:
          "ISO 10993-10 sensitization testing confirms low-irritation adhesive; cycle limited to 7 days per the IFU.",
        bad_snippet: "Adhesive is hypoallergenic.",
        why_this_is_safer:
          "Cites the standard, the test, and the use-condition limit a reviewer can verify against the dossier.",
      },
    ],
  };
  return ReadinessReportSchema.parse(payload);
}

async function render(
  label: string,
  report: ReadinessReport,
  outRel: string
): Promise<void> {
  const element = React.createElement(ReadinessReportDocument, { report });
  const buf = await renderToBuffer(
    element as unknown as React.ReactElement<DocumentProps>
  );
  const outDir = resolve(process.cwd(), "data/smoke");
  await mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, outRel);
  await writeFile(outPath, buf);
  console.log(
    `[${label}] wrote ${outPath} (${buf.length} bytes, ${
      report.meta.inference_markers?.length ?? 0
    } markers)`
  );
}

async function main() {
  const hw = baseReport();
  hw.meta.inference_markers = HARDWARE_MARKERS;
  await render("hardware", hw, "report-marker-verify-hardware.pdf");

  const samd = baseReport();
  samd.meta.inference_markers = [];
  await render("samd", samd, "report-marker-verify-samd.pdf");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
