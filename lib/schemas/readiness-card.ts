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

/**
 * Recommended regulatory pathway — Story 2.5 Phase 1.
 *
 * Light path-detection signal emitted by the synthesizer to seed the
 * upgraded Draft Pack experience:
 *   - "manufacturing_license" — proceed to MD-3 (Class A/B) or MD-7
 *     (Class C/D) manufacturing license. Default when classification is
 *     clear and a predicate-or-evidence basis exists.
 *   - "clinical_investigation" — Class C/D + no predicate claimed + no
 *     clinical evidence. Likely needs MD-22 clinical investigation
 *     approval before manufacturing license. Sprint 2 Draft Pack still
 *     generates MD-7/MD-3 content but surfaces a journey note.
 *   - "unclear" — classification or pathway ambiguous; the field is
 *     informational and the Draft Pack defaults to MD-7/MD-3.
 *
 * Optional for backward-compatibility with readiness_cards generated
 * before Phase 1. Synthesizer always emits one of the three values
 * going forward.
 */
export const RecommendedPathEnum = z.enum([
  "manufacturing_license",
  "clinical_investigation",
  "unclear",
]);
export type RecommendedPath = z.infer<typeof RecommendedPathEnum>;

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

/**
 * Phase 2c — inference markers.
 *
 * The hardware persona path uses "make assumptions, validate in editor":
 * fields like sterile, drug content, ionising radiation, manufacturing
 * location, veterinary use, measuring function, and sterilization mode
 * are NOT asked up front. The synthesizer infers them and emits a marker
 * here for each so the founder can see and correct.
 *
 * Markers MUST be surfaced prominently — at card, ₹499 report, and pack
 * layers — per founder requirement: "a founder whose device DOES contain
 * a drug must not miss that 'non-drug' was assumed."
 *
 * Used today by hardware persona only. SaMD / clinical-investigation
 * personas leave the array empty.
 */
export const InferenceMarkerStatusEnum = z.enum([
  "estimated", // computed from one or more wizard answers
  "assumed", // defaulted because most products in this class are X
  "extracted", // pulled from pitch-extract / URL content
]);

export const InferenceMarkerSchema = z.object({
  /** Machine-readable field key — e.g., "sterile", "drug_content",
   *  "ionising_radiation", "manufacturing_location", "veterinary_use",
   *  "measuring_function", "sterilization_mode", "cdsco_class". */
  field: z.string(),
  /** Plain-language field label shown to the founder — e.g., "Sterile
   *  device", "Drug content", "CDSCO risk class". */
  label: z.string(),
  /** The inferred value as a short user-visible string — e.g., "Yes",
   *  "No drug content", "Class C". */
  value: z.string(),
  /** Status — drives the badge: [ESTIMATED] / [ASSUMED] / [EXTRACTED]. */
  status: InferenceMarkerStatusEnum,
  /** One short sentence explaining the basis of the inference, plain
   *  language. Shown right under the value. */
  basis: z.string(),
  /** Where the founder can correct this — e.g., "wizard Q9", "editor
   *  §14", "intake". Drives the "Tap to correct" affordance copy. */
  correctable_at: z.string(),
});
export type InferenceMarker = z.infer<typeof InferenceMarkerSchema>;

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
   * Three accepted shapes (Story 1.3.5):
   *   a) `trl: null`                                — idiomatic for non-devices
   *   b) `trl: { ...all-null-fields, rationale: "TRL N/A …" }` — Opus's
   *      natural emission for wellness cases when asked to "set trl to null"
   *   c) `trl: { level, stage, track, completion_pct, next_milestone, rationale }`
   *      — fully populated for medical devices.
   *
   * Loosened from required-string `next_milestone` / `rationale` to nullable
   * after Story 1.3 recon found Opus produces shape (b) for ~2–8% of
   * wellness/non-device assessments. See `docs/sprint-recaps/sprint-1.md`
   * Story 1.3.5 close-out and `data/eval/sprint-1-3/schema-validation-diagnostic.md`.
   */
  trl: z
    .object({
      level: TRLLevelSchema.nullable(),
      stage: TRLStageSchema.nullable(),
      track: TRLTrackEnum.nullable(),
      completion_pct: z.number().int().min(0).max(100).nullable(),
      next_milestone: z.string().nullable(),
      rationale: z.string().nullable(),
    })
    .nullable()
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

  /** Story 2.5 Phase 1 — see RecommendedPathEnum docs above. Optional
   * to keep older readiness_cards parseable; new emissions always set it. */
  recommended_path: RecommendedPathEnum.optional(),

  /** Phase 2c — assumption / estimation markers surfaced on the card
   * so the founder can spot incorrect inferences (e.g., the device
   * actually IS drug-eluting but the synthesizer defaulted to non-drug).
   * Optional and typically empty for SaMD / clinical-investigation
   * personas; populated for manufacturer_hardware. Renderers MUST
   * surface this prominently — never bury it. */
  inference_markers: z.array(InferenceMarkerSchema).optional(),
});

export type ReadinessCard = z.infer<typeof ReadinessCardSchema>;
