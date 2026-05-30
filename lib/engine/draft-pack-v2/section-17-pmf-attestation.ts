/**
 * Section 17 — Plant Master File attestation.
 *
 * Maps to: Bible §4.B Block 2 — Plant Master File per Appendix I,
 * Fourth Schedule MDR-2017. 11 sub-sections (6.1 General facility info
 * through 6.11 Documentation procedures).
 *
 * Strategy: deterministic attestation checklist. NO LLM, per matrix
 * locked decision #1 — "PMF + QMS = attestation checklists, NOT
 * LLM-drafted prose. Site-specific facts; founder confirms each
 * sub-section exists in their internal docs. The LLM doesn't invent
 * these."
 *
 * The 11 sub-rows are bible-mandated content; the editor renders each
 * `## …` heading + `- [ ]` row as a checklist row the founder ticks.
 */

import type {
  SectionGenerator,
  SectionOpts,
  SectionOutput,
} from "./types";
import { sectionNumberFromKey } from "./types";

const SECTION_KEY = "17_pmf_attestation" as const;
const TITLE = "Plant Master File attestation";

/** The 11 PMF sub-sections from Bible §4.B Block 2 (lines 256–269 of
 *  docs/specs/cdsco-regulatory-forms-reference.md). The labels are
 *  quoted verbatim from the bible — do not paraphrase. The detail rows
 *  below each one are guidance on what the PMF document for that
 *  sub-section must contain, drawn from Appendix I Fourth Schedule. */
const PMF_SUBSECTIONS: ReadonlyArray<{
  id: string;
  label: string;
  detail: string[];
}> = [
  {
    id: "6.1",
    label: "General facility info",
    detail: [
      "Manufacturer name + legal status + address(es)",
      "Manufacturing licence number (if existing)",
      "Brief history of the facility",
    ],
  },
  {
    id: "6.2",
    label: "Personnel org chart",
    detail: [
      "Reporting hierarchy with named roles",
      "Reporting lines for QA and Production are independent",
    ],
  },
  {
    id: "6.3",
    label: "Personnel qualifications & responsibilities",
    detail: [
      "Qualifications matrix per role (per Fourth Schedule competent-staff requirement)",
      "Job descriptions for QA head, Production head, Technical staff",
      "Training records for the last 12 months",
    ],
  },
  {
    id: "6.4",
    label: "Premises & facilities",
    detail: [
      "Floor area + designated zones (raw material, in-process, finished, quarantine, reject)",
      "Environmental control per Annexure A, Fifth Schedule",
    ],
  },
  {
    id: "6.5",
    label: "Plant layout (scaled)",
    detail: [
      "Scaled plant drawing attached (1 : 100 or similar)",
      "Material + personnel flow shown — uni-directional or controlled-crossover",
    ],
  },
  {
    id: "6.6",
    label: "Equipment & instruments",
    detail: [
      "Equipment list with model + serial + qualification status (IQ / OQ / PQ)",
      "Instrument list with calibration cycle + last calibration date",
      "Critical-equipment redundancy / contingency",
    ],
  },
  {
    id: "6.7",
    label: "Sanitation",
    detail: [
      "Sanitation SOPs for each zone",
      "Cleaning agents + frequency table",
      "Pest control programme contract on file",
    ],
  },
  {
    id: "6.8",
    label: "Production",
    detail: [
      "Master production records per device variant",
      "Batch manufacturing record template",
      "In-process control points + acceptance criteria",
    ],
  },
  {
    id: "6.9",
    label: "Quality Assurance",
    detail: [
      "QA organisational independence from Production confirmed",
      "Specifications for raw materials, in-process, finished device",
      "Testing methods validated",
    ],
  },
  {
    id: "6.10",
    label: "Storage",
    detail: [
      "Storage conditions consistent with §15 Stability claims",
      "Quarantine + reject area physically separated",
      "FEFO (first-expire-first-out) inventory policy",
    ],
  },
  {
    id: "6.11",
    label: "Documentation procedures",
    detail: [
      "Document control SOP per ISO 13485 §4.2",
      "Record retention period defined (≥5 years post-expiry for medical devices)",
      "Change-control workflow with QA approval gate",
    ],
  },
];

function buildContent(): string {
  const lines: string[] = [
    `_Bible §4.B Block 2 (Appendix I, Fourth Schedule MDR-2017) requires the Plant Master File to cover the 11 sub-sections below. These describe your site, not your device — the contents are facility-specific and the founder (or your QA head) confirms each exists in your internal documentation._`,
    ``,
    `_ClearPath does not draft PMF prose — these are attestation rows. Tick what's in place; flag what's missing for follow-up._`,
    ``,
  ];
  for (const sub of PMF_SUBSECTIONS) {
    lines.push(`## ${sub.id} ${sub.label}`);
    lines.push(`- [ ] Sub-section exists in our internal PMF document`);
    for (const d of sub.detail) {
      lines.push(`- [ ] ${d}`);
    }
    lines.push(``);
  }
  return lines.join("\n").trimEnd();
}

const generate: SectionGenerator = async (
  _sources,
  opts: SectionOpts
): Promise<SectionOutput> => {
  const content = buildContent();
  return {
    section_key: SECTION_KEY,
    section_number: sectionNumberFromKey(SECTION_KEY),
    title: TITLE,
    content,
    citations: [
      {
        citation_id: "[1]",
        source_doc: "MDR-2017 Fourth Schedule Appendix I",
        quote: "Plant Master File contents",
        exact_reference: "Bible §4.B Block 2 (PMF 11 sub-sections)",
      },
    ],
    completion_status: "pending",
    word_count: content.split(/\s+/).filter(Boolean).length,
    meta: {
      generation_strategy: "deterministic",
      source_fields: [],
      model: null,
      llm_cost_usd: null,
      generated_at: new Date().toISOString(),
      dry_run: opts.dry_run,
      error_message: null,
      usage: null,
    },
  };
};

export const generateSection17 = generate;
