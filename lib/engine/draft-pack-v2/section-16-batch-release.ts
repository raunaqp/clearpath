/**
 * Section 16 — Batch Release Certificates.
 *
 * Maps to: DMF §8.20 Batch release certificates (≥3 consecutive) /
 * Software version release certificate. Bible §4.B Block 4 — "Always"
 * for hardware; §4.A Stage 3 — "Batch release: minimum 3 consecutive
 * batches' Certificate of Analysis required [MD-7 checklist §8.20]".
 *
 * Strategy: deterministic template. No LLM. Founder attaches the
 * actual CoAs in the editor; this section structures the dossier
 * expectations and the attestation rows.
 */

import type {
  SectionGenerator,
  SectionOpts,
  SectionOutput,
} from "./types";
import { sectionNumberFromKey } from "./types";

const SECTION_KEY = "16_batch_release" as const;
const TITLE = "Batch Release Certificates";

function buildContent(): string {
  return [
    `_DMF §8.20 (Bible §4.B Block 4) requires at least 3 consecutive batches' Certificate of Analysis (CoA). These attest that the device-as-manufactured matches the device-as-specified in §5 Product Specification and the controls in §8 Design & Manufacturing. The CoAs themselves get attached in your editor — this section structures the attestation rows._`,
    ``,
    `## 1. Batch-release programme — preconditions`,
    `- [ ] In-process control SOPs referenced (links to §8 Design & Manufacturing)`,
    `- [ ] Finished-device test methods validated`,
    `- [ ] Release authorisation matrix (who signs off each parameter)`,
    `- [ ] OOS / OOT handling SOP referenced`,
    ``,
    `## 2. Batch 1 — Certificate of Analysis`,
    `- [ ] Batch / lot identifier (founder fills)`,
    `- [ ] Manufacturing date`,
    `- [ ] Quantity manufactured + sampling plan applied`,
    `- [ ] Test results vs acceptance criteria — all parameters passing`,
    `- [ ] Release authorisation signature on file`,
    `- [ ] CoA PDF attached`,
    ``,
    `## 3. Batch 2 — Certificate of Analysis`,
    `- [ ] Batch / lot identifier`,
    `- [ ] Manufacturing date (must be consecutive with Batch 1 — same product, same line)`,
    `- [ ] Test results vs acceptance criteria — all parameters passing`,
    `- [ ] Release authorisation signature on file`,
    `- [ ] CoA PDF attached`,
    ``,
    `## 4. Batch 3 — Certificate of Analysis`,
    `- [ ] Batch / lot identifier`,
    `- [ ] Manufacturing date (consecutive with Batch 2)`,
    `- [ ] Test results vs acceptance criteria — all parameters passing`,
    `- [ ] Release authorisation signature on file`,
    `- [ ] CoA PDF attached`,
    ``,
    `## 5. Cross-batch consistency`,
    `- [ ] Variance across batches falls within process-capability bounds`,
    `- [ ] No systematic drift across the 3 batches`,
    `- [ ] Stability sampling drawn from these 3 batches (links to §15 Stability Data)`,
    ``,
    `## 6. Renewal-relevant batches (post-grant)`,
    `- [ ] Subsequent batch CoAs collected on rolling basis`,
    `- [ ] Annual review of process capability filed in QMS records`,
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
        source_doc: "MD-7 checklist Appendix A",
        quote: "Batch release certificates (≥3 consecutive)",
        exact_reference: "DMF §8.20",
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

export const generateSection16 = generate;
