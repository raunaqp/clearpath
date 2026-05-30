/**
 * Section 15 — Stability Data.
 *
 * Maps to: DMF §8.17 Stability data (real-time + accelerated). Bible
 * §4.B Block 4 — "Always" required for hardware (line 304); Bible
 * §4.A Stage 3 — "Stability — real-time + accelerated; accelerated
 * acceptable provisionally with concurrent real-time ongoing
 * [FAQ §34, §37]".
 *
 * Strategy: deterministic template. No LLM. Stability protocols are
 * device-class + form-factor specific and the LLM cannot invent the
 * actual test results — the founder confirms structure and fills
 * specifics in the editor.
 *
 * Output is structured markdown — the renderer parses `## …` headings
 * and `- [ ]` checkbox rows as attestation items (Sprint 4 will swap
 * the renderer for a structured UI; Day-4 ships the markdown).
 */

import type {
  SectionGenerator,
  SectionOpts,
  SectionOutput,
} from "./types";
import { sectionNumberFromKey } from "./types";

const SECTION_KEY = "15_stability_data" as const;
const TITLE = "Stability Data";

function buildContent(): string {
  return [
    `_This section structures the stability dossier required by DMF §8.17 (Bible §4.B Block 4). Real-time + accelerated stability are always required for hardware devices; accelerated may carry provisional shelf-life claims while real-time data accumulates (FAQ §34, §37). Confirm each sub-section in your editor and attach the underlying protocol + reports._`,
    ``,
    `## 1. Stability protocol identification`,
    `- [ ] Stability protocol document number filed (founder fills: e.g. SP-DEV-001 rev. 2)`,
    `- [ ] Approving authority + signature on file (QA head + Regulatory)`,
    `- [ ] Linked to risk file ISO 14971 hazards covering shelf-life-related failure modes`,
    ``,
    `## 2. Real-time stability — claim period`,
    `- [ ] Claim period: 24 months (founder edits if different)`,
    `- [ ] Storage condition: 25 °C ± 2 °C / 60 % RH ± 5 % (ICH long-term reference)`,
    `- [ ] Sample plan: ≥3 batches, time points at 0 / 3 / 6 / 9 / 12 / 18 / 24 months`,
    `- [ ] Real-time data available up to: (founder fills the latest verified time point)`,
    ``,
    `## 3. Accelerated stability — provisional claim basis`,
    `- [ ] Storage condition: 40 °C ± 2 °C / 75 % RH ± 5 % (ICH accelerated reference)`,
    `- [ ] Duration: 6 months → supports provisional 24-month real-time claim`,
    `- [ ] Time points: 0 / 1 / 3 / 6 months`,
    `- [ ] Concurrent real-time programme in progress (required for provisional acceptance)`,
    ``,
    `## 4. Test parameters monitored`,
    `- [ ] Physical: dimensional integrity, packaging seal, visual / colour`,
    `- [ ] Chemical: leachables / extractables (if applicable per ISO 10993-18)`,
    `- [ ] Functional: device-specific performance metrics (founder lists: e.g. occlusion force, flow rate, signal accuracy)`,
    `- [ ] Microbiological / sterility (if sterile per §14 Sterilization Validation)`,
    `- [ ] Biocompatibility re-verification after aging (if patient-contact per §13)`,
    ``,
    `## 5. Acceptance criteria`,
    `- [ ] Each parameter's acceptance criterion tied to a referenced standard or in-house spec`,
    `- [ ] Out-of-specification (OOS) handling SOP referenced`,
    ``,
    `## 6. Shelf-life claim + labelling`,
    `- [ ] Shelf-life claim consistent with §7 Labelling expiry-date format`,
    `- [ ] Storage conditions on label match conditions stability data supports`,
    ``,
    `## 7. Stability reports attached`,
    `- [ ] Real-time report (latest version, signed)`,
    `- [ ] Accelerated report (signed)`,
    `- [ ] Annual stability update on file (renewal-relevant)`,
  ].join("\n");
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
        source_doc: "MDR-2017 Fourth Schedule Appendix II",
        quote: "Stability data (real-time + accelerated)",
        exact_reference: "DMF §8.17",
      },
      {
        citation_id: "[2]",
        source_doc: "MD FAQ §34, §37",
        quote:
          "Accelerated stability acceptable provisionally with concurrent real-time ongoing",
        exact_reference: "FAQ §34 (provisional shelf life); §37 (accelerated)",
      },
    ],
    completion_status: "pending",
    word_count: content.split(/\s+/).filter(Boolean).length,
    meta: {
      generation_strategy: "deterministic",
      source_fields: [], // deterministic — no source data dependency
      model: null,
      llm_cost_usd: null,
      generated_at: new Date().toISOString(),
      dry_run: opts.dry_run,
      error_message: null,
      usage: null,
    },
  };
};

export const generateSection15 = generate;
