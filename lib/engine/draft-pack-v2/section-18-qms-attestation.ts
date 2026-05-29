/**
 * Section 18 — QMS Compliance attestation.
 *
 * Maps to: Bible §4.B Block 3 — Quality Management System per Fifth
 * Schedule. 11 sub-sections (7.1 Fifth Schedule compliance undertaking
 * through 7.11 Annexure A environmental requirements).
 *
 * Strategy: deterministic attestation checklist. NO LLM, per matrix
 * locked decision #1 — same reasoning as §17 PMF attestation. The
 * one source-data signal that does NOT involve an LLM call is the
 * founder's Tier B B6 ISO 13485 status answer, which adjusts the
 * preface so the document accurately reflects "ISO 13485 certified",
 * "in progress", or "not started" without inventing detail.
 */

import type {
  SectionGenerator,
  SectionOpts,
  SectionOutput,
  SourceData,
} from "./types";
import { sectionNumberFromKey } from "./types";

const SECTION_KEY = "18_qms_attestation" as const;
const TITLE = "QMS Compliance attestation";

/** The 11 QMS sub-sections from Bible §4.B Block 3 (lines 270–284).
 *  Labels verbatim from the bible. */
const QMS_SUBSECTIONS: ReadonlyArray<{
  id: string;
  label: string;
  detail: string[];
}> = [
  {
    id: "7.1",
    label: "Fifth Schedule compliance undertaking",
    detail: [
      "Notarised undertaking on company letterhead",
      "Signed by authorised signatory (Director / MD)",
    ],
  },
  {
    id: "7.2",
    label: "Quality Manual",
    detail: [
      "Scope of QMS defines the device family covered",
      "Excluded ISO 13485 clauses (if any) listed with justification",
      "Document control + revision history on file",
    ],
  },
  {
    id: "7.3",
    label: "Control of Documents",
    detail: [
      "Document creation, review, approval, distribution SOP referenced",
      "Obsolete-document control referenced",
    ],
  },
  {
    id: "7.4",
    label: "Control of Records",
    detail: [
      "Record-retention period defined per device class (≥5 years post-expiry)",
      "Electronic-records integrity (21 CFR Part 11-equivalent if applicable)",
    ],
  },
  {
    id: "7.5",
    label: "Management Responsibility",
    detail: [
      "Quality policy + objectives signed by top management",
      "Management review SOP + minutes from the last 12 months",
      "Management representative named",
    ],
  },
  {
    id: "7.6",
    label: "Resource Management",
    detail: [
      "Competency matrix per role (links to §17 PMF 6.3)",
      "Training plan + records on file",
      "Infrastructure + work environment requirements documented",
    ],
  },
  {
    id: "7.7",
    label: "Control of Production & Service Provision",
    detail: [
      "Master production records per device variant",
      "Process validation reports for non-verifiable processes (e.g. sterilization, sealing)",
      "Cleanliness + contamination control (if applicable)",
    ],
  },
  {
    id: "7.8",
    label: "Internal Audit System",
    detail: [
      "Internal audit programme covering full QMS scope annually",
      "Audit reports for last 12 months on file",
      "Auditor independence from audited function confirmed",
    ],
  },
  {
    id: "7.9",
    label: "Control of Non-conforming Product",
    detail: [
      "Identification + segregation SOP for non-conforming product",
      "Disposition options (rework / scrap / concession) defined",
      "Customer-notification triggers documented",
    ],
  },
  {
    id: "7.10",
    label: "CAPA",
    detail: [
      "Corrective + preventive action SOP",
      "CAPA log for last 12 months",
      "Linkage to Sixth-Schedule PMS / vigilance data documented",
    ],
  },
  {
    id: "7.11",
    label: "Environmental requirements (Annexure A, Fifth Schedule)",
    detail: [
      "Premises classification per Annexure A table",
      "HVAC qualification reports on file (if applicable to device class)",
      "Particle / microbial monitoring records (if applicable)",
    ],
  },
];

function isoStatusPreface(sources: SourceData): string {
  const status = sources.wizard_answers.b6_iso_13485_status;
  switch (status) {
    case "certified":
      return `_Your Tier B answer indicates ISO 13485 certification is in place. The attestation rows below should align with your existing QMS — attach the certificate + last surveillance audit report in the editor._`;
    case "in_progress":
      return `_Your Tier B answer indicates ISO 13485 is in progress. Tick the sub-sections already covered; flag the rest — CDSCO Fifth Schedule alignment is the dossier requirement, ISO 13485 is the international-standard mapping that often runs in parallel._`;
    case "not_started":
      return `_Your Tier B answer indicates ISO 13485 is not yet started. The Fifth-Schedule QMS attestation below is the CDSCO-specific minimum; ISO 13485 certification typically runs in parallel and is strongly recommended before the MD-7 / MD-3 audit window opens._`;
    case "not_applicable":
      return `_Your Tier B answer indicates ISO 13485 is not applicable. Confirm with your regulatory advisor — Fifth-Schedule QMS is still required for any non-Class-A-non-sterile-non-measuring device._`;
    default:
      return `_Your Tier B ISO 13485 status answer was not captured. The Fifth-Schedule QMS attestation below is required regardless of ISO 13485 certification status._`;
  }
}

function buildContent(sources: SourceData): string {
  const lines: string[] = [
    `_Bible §4.B Block 3 (Fifth Schedule MDR-2017) requires the QMS dossier to cover the 11 sub-sections below. ClearPath does not draft QMS prose — these are attestation rows the founder (or QA head) ticks against existing internal documentation._`,
    ``,
    isoStatusPreface(sources),
    ``,
  ];
  for (const sub of QMS_SUBSECTIONS) {
    lines.push(`## ${sub.id} ${sub.label}`);
    lines.push(`- [ ] Sub-section exists in our internal QMS document`);
    for (const d of sub.detail) {
      lines.push(`- [ ] ${d}`);
    }
    lines.push(``);
  }
  return lines.join("\n").trimEnd();
}

const generate: SectionGenerator = async (
  sources: SourceData,
  opts: SectionOpts
): Promise<SectionOutput> => {
  const content = buildContent(sources);
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations: [
      {
        citation_id: "[1]",
        source_doc: "MDR-2017 Fifth Schedule",
        quote: "Quality Management System requirements",
        exact_reference: "Bible §4.B Block 3 (QMS 11 sub-sections)",
      },
    ],
    completion_status: "pending",
    word_count: content.split(/\s+/).filter(Boolean).length,
    meta: {
      generation_strategy: "deterministic",
      source_fields: ["wizard.b6_iso_13485_status"],
      model: null,
      llm_cost_usd: null,
      generated_at: new Date().toISOString(),
      dry_run: opts.dry_run,
      error_message: null,
      usage: null,
    },
  };
};

export const generateSection18 = generate;
