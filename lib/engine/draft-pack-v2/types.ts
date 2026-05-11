/**
 * Draft Pack v2 generator — shared types.
 *
 * Sprint 2 Story 2.5 Phase 4b. Consumed by orchestrator.ts and each
 * section-NN-*.ts generator. Schema details for the per-section output
 * shape live in docs/specs/draft-pack-document-matrix.md.
 */

import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import type { WizardAnswers } from "@/lib/wizard/types";
import type { PitchAiExtracted } from "@/lib/intake/ai-extract";
import type { ModelKey } from "@/lib/engine/cost-calculator";

/** Section key — stable string, used as the row's `section_key` and to
 *  derive `section_number` (1-12). The number is the prefix before the
 *  first underscore (zero-padded: "01_executive_summary" → 1). */
export type SectionKey =
  | "01_executive_summary"
  | "02_device_description"
  | "03_intended_use"
  | "04_classification_grouping"
  | "05_product_specification"
  | "06_predicate_comparison"
  | "07_labelling"
  | "08_design_manufacturing"
  | "09_essential_principles"
  | "10_risk_management"
  | "11_verification_validation"
  | "12_clinical_evidence_pms";

export type GenerationStrategy =
  | "deterministic"
  | "templated"
  | "llm_synthesized";

export type SectionCompletionStatus =
  | "draft"
  | "complete"
  | "pending"
  | "failed";

/** All clearpath data a section generator can read from. Loaded once
 *  at orchestrator start and passed to every section. */
export type SourceData = {
  assessment_id: string;
  /** Set when running for a real paid order; null for dryRun smoke tests. */
  order_id: string | null;
  intake: {
    name: string;
    email: string;
    one_liner: string;
    url: string | null;
    url_fetched_content: string | null;
    uploaded_docs: Array<{
      filename: string;
      sha256: string;
      doc_type?: string | null;
    }>;
  };
  wizard_answers: WizardAnswers;
  readiness_card: ReadinessCard;
  ai_extracted: PitchAiExtracted | null;
};

/** Single citation block per section. */
export type Citation = {
  citation_id: string; // e.g., "[1]"
  source_doc: string; // e.g., "MDR 2017, Schedule I"
  quote: string;
  exact_reference: string; // e.g., "MDR-2017 §3.1"
};

export type SectionMeta = {
  generation_strategy: GenerationStrategy;
  /** Which clearpath fields fed this section. Aids debugging + downstream
   *  validator's source-coverage checks. */
  source_fields: string[];
  model: ModelKey | null;
  llm_cost_usd: number | null;
  generated_at: string; // ISO 8601
  dry_run: boolean;
  error_message: string | null;
  /** Tokens used by this section's LLM call. null when no call was made. */
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read: number;
    cache_write: number;
  } | null;
};

export type SectionOutput = {
  section_key: SectionKey;
  section_number: number;
  title: string;
  content: string; // markdown
  citations: Citation[];
  completion_status: SectionCompletionStatus;
  word_count: number;
  meta: SectionMeta;
};

/** Runtime options passed to every section generator. */
export type SectionOpts = {
  dry_run: boolean;
  log?: (msg: string) => void;
};

/** Each section module exports one of these. */
export type SectionGenerator = (
  sources: SourceData,
  opts: SectionOpts
) => Promise<SectionOutput>;

/** Top-level orchestrator entry point. */
export type RunV2Input = {
  assessment_id: string;
  /** When true: load source data + generate sections in memory; do NOT
   *  write to draft_pack_sections / draft_pack_citations / engine_costs.
   *  Returned `pack.sections[*].meta.dry_run` is true. */
  dry_run?: boolean;
  /** Per-step logger. Defaults to console.log when omitted. */
  log?: (msg: string) => void;
  /** Subset of sections to run (for partial regeneration). Defaults
   *  to all 12 + consolidator. */
  only_sections?: SectionKey[];
};

export type RunV2Result = {
  ok: boolean;
  assessment_id: string;
  order_id: string | null;
  dry_run: boolean;
  sections: SectionOutput[];
  totals: {
    cost_usd: number;
    duration_ms: number;
    sections_generated: number;
    sections_failed: number;
  };
  /** Set when ok = false at the orchestrator level (e.g., source data
   *  fetch failed). Per-section failures land in `sections[*].meta.error_message`. */
  error: string | null;
};

/** Helper: derive 1-12 number from a SectionKey. */
export function sectionNumberFromKey(key: SectionKey): number {
  const prefix = key.slice(0, 2);
  const n = parseInt(prefix, 10);
  if (Number.isNaN(n) || n < 1 || n > 12) {
    throw new Error(`Invalid section key prefix: ${key}`);
  }
  return n;
}
