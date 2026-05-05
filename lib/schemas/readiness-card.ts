import { z } from "zod";

/**
 * Tier 0 — Readiness Card output schema.
 * Mirrors `docs/specs/clearpath_output_schemas.md` (Tier 0) exactly.
 *
 * Note on string fields: most string fields here are user-visible. They go
 * through `softenCertainty()` after Zod validation; we don't enforce
 * banned-phrase constraints in Zod itself.
 */

export const VerdictEnum = z.enum([
  "required",
  "required_SDF",
  "required_for_procurement",
  "required_sub_feature",
  "conditional",
  "optional",
  "core_compliance_achieved",
  "not_applicable",
]);
export type Verdict = z.infer<typeof VerdictEnum>;

export const MedicalDeviceStatusEnum = z.enum([
  "is_medical_device",
  "not_medical_device",
  "hybrid",
  "wellness_carve_out",
]);

export const CdscoClassEnum = z.enum(["A", "B", "C", "D"]).nullable();
export const ClassQualifierEnum = z
  .enum(["IVD", "AI-CDS", "scoped", "novel", "unclear", "IVD-SaMD"])
  .nullable();

export const ImdrfCategoryEnum = z.enum(["I", "II", "III", "IV"]).nullable();

export const NovelOrPredicateEnum = z
  .enum(["novel", "has_predicate"])
  .nullable();

export const ProductTypeEnum = z.enum([
  "product",
  "platform",
  "hardware_software",
  "export_only",
]);

export const ReadinessBandEnum = z.enum([
  "red",
  "amber",
  "green",
  "green_plus",
  "not_applicable",
]);

export const RiskLevelEnum = z.enum([
  "high",
  "medium",
  "low",
  "not_applicable",
]);

export const SeverityEnum = z.enum(["high", "medium", "low"]);

/**
 * TRL (Technology Readiness Level) — anchored to SERB/ANRF MAHA MedTech Mission
 * framework (medical-device-specific, CDSCO-form-anchored).
 *
 * Source: https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf
 *
 * Two tracks:
 *  - investigational (no predicate) — full 9 levels
 *  - has_predicate — collapses TRL 6-7 (substantial-equivalence path)
 *
 * `null` when medical_device_status = not_medical_device / wellness_carve_out.
 */
export const TRLLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);

export const TRLTrackEnum = z.enum(["investigational", "has_predicate"]);

export const TRLStageSchema = z.enum([
  "ideation",
  "proof_of_principle",
  "early_poc",
  "advanced_poc",
  "test_batch",
  "pilot_study",
  "pivotal_study",
  "pre_commercialisation",
  "commercialisation",
]);

const RegulationEntrySchema = z.object({
  verdict: VerdictEnum,
  rationale: z.string(),
  forms: z.array(z.string()).optional(),
  pathway_note: z.string().optional(),
});
export type RegulationEntry = z.infer<typeof RegulationEntrySchema>;

const RegulationsSchema = z.object({
  cdsco_mdr: RegulationEntrySchema,
  cdsco_pharmacy: RegulationEntrySchema,
  dpdp: RegulationEntrySchema,
  icmr: RegulationEntrySchema,
  abdm: RegulationEntrySchema,
  nabh: RegulationEntrySchema,
  mci_telemed: RegulationEntrySchema,
  irdai: RegulationEntrySchema,
  nabl: RegulationEntrySchema,
});

const TopGapSchema = z.object({
  dim: z.string(),
  gap_title: z.string(),
  fix_action: z.string(),
  severity: SeverityEnum,
});

export const ReadinessCardSchema = z.object({
  meta: z.object({
    company_name: z.string(),
    product_name: z.string(),
    scoped_feature: z.string().nullable(),
    product_type: ProductTypeEnum,
    generated_at: z.string(),
    conflict_resolved: z.string().nullable(),
  }),

  classification: z.object({
    medical_device_status: MedicalDeviceStatusEnum,
    device_type: z.string(),
    imdrf_category: ImdrfCategoryEnum,
    cdsco_class: CdscoClassEnum,
    class_qualifier: ClassQualifierEnum,
    ai_ml_flag: z.boolean(),
    acp_required: z.boolean(),
    export_only: z.boolean(),
    novel_or_predicate: NovelOrPredicateEnum,
  }),

  readiness: z.object({
    score: z.number().int().min(0).max(10).nullable(),
    band: ReadinessBandEnum,
    dimensions: z.object({
      regulatory_clarity: z.number().int().min(0).max(2),
      quality_system: z.number().int().min(0).max(2),
      technical_docs: z.number().int().min(0).max(2),
      clinical_evidence: z.number().int().min(0).max(2),
      submission_maturity: z.number().int().min(0).max(2),
    }),
    note: z.string(),
  }),

  risk: z.object({
    level: RiskLevelEnum,
    rationale: z.string(),
  }),

  /**
   * TRL — optional/additive. When present, surfaces a CDSCO-form-anchored
   * progress reading next to readiness. Computed deterministically from
   * detected_signals + classification when not provided by Opus.
   *
   * `null` for non-medical-device / wellness paths.
   */
  trl: z
    .object({
      level: TRLLevelSchema.nullable(),
      stage: TRLStageSchema.nullable(),
      track: TRLTrackEnum.nullable(),
      completion_pct: z.number().int().min(0).max(100).nullable(),
      next_milestone: z.string(),
      rationale: z.string(),
    })
    .optional(),

  timeline: z.object({
    estimate_months_low: z.number().int().min(0),
    estimate_months_high: z.number().int().min(0),
    display: z.string(),
    anchor: z.string(),
  }),

  regulations: RegulationsSchema,

  top_gaps: z.array(TopGapSchema),

  verdict: z.string(),
  why_regulated: z.string(),
  post_2025_samd_gap: z.boolean(),

  tier0_card_tagline: z.string(),
  tier1_teaser: z.string(),
  tier2_teaser: z.string(),
});

export type ReadinessCard = z.infer<typeof ReadinessCardSchema>;
