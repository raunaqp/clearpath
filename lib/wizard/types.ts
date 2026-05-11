import { z } from "zod";

export type ClinicalState = "critical" | "serious" | "non_serious" | "varies";
export type InfoSignificance = "informs_only" | "drives" | "diagnoses_treats";
export type UserType = "hcps" | "patients" | "both" | "admin";
export type UserScale = "under_10k" | "10k_to_1l" | "1l_to_10l" | "over_10l";
export type Integrations = "abdm" | "hospital" | "both" | "neither";
export type DataSensitivity =
  | "phi"
  | "imaging"
  | "genomic"
  | "prescription"
  | "insurance"
  | "none";
export type CommercialStage = "pre_mvp" | "mvp" | "scaling" | "filed";

// Tier B (Sprint 2 Story 2.5 Phase 3) — CDSCO manufacturing-license-specific
// follow-up wizard gated to paying Tier 2 customers. Lives in the same
// jsonb column (assessments.wizard_answers) as Tier A — clean additive
// shape, presence of b1_intended_use_statement is the "Tier B done" gate.

export type UseEnvironment =
  | "home"
  | "opd"
  | "inpatient"
  | "surgical"
  | "pre_hospital"
  | "mixed";

export type PredicateDevice = {
  device_name: string;
  manufacturer?: string;
  rationale?: string;
};

export type RiskMitigation = {
  risk: string;
  mitigation: string;
};

export type ClinicalEvidenceStatus =
  | "none"
  | "pilot_data"
  | "published_study"
  | "multi_center_trial";

export type Iso13485Status =
  | "certified"
  | "in_progress"
  | "not_started"
  | "not_applicable";

export type SoftwareLifecycleModel =
  | "waterfall"
  | "agile"
  | "hybrid"
  | "not_applicable";

export type EncryptionPosture = "yes" | "no" | "partial";

export type AuthenticationModel = "none" | "local" | "federated" | "sso";

export type CybersecurityPosture = {
  data_at_rest_encryption: EncryptionPosture;
  data_in_transit_encryption: EncryptionPosture;
  authentication_model: AuthenticationModel;
};

export type WizardAnswers = {
  // Tier A — current 7-Q Risk Card wizard
  q1?: ClinicalState;
  q2?: InfoSignificance;
  q2_defended?: boolean; // true when user kept 'informs_only' after follow-up
  q3?: UserType;
  q4?: UserScale;
  q5?: Integrations;
  q6?: DataSensitivity[];
  q7?: CommercialStage;

  // Tier B — Draft Pack intake (Sprint 2 Story 2.5 Phase 3)
  b1_intended_use_statement?: string;
  b2_use_environment?: UseEnvironment;
  b3_predicate_devices?: PredicateDevice[];
  b4_risks_and_mitigations?: RiskMitigation[];
  b5_clinical_evidence_status?: ClinicalEvidenceStatus;
  b6_iso_13485_status?: Iso13485Status;

  // Tier B conditionals
  c1_software_lifecycle_model?: SoftwareLifecycleModel;
  c2_cybersecurity_posture?: CybersecurityPosture;
};

export const ClinicalStateSchema = z.enum([
  "critical",
  "serious",
  "non_serious",
  "varies",
]);

export const InfoSignificanceSchema = z.enum([
  "informs_only",
  "drives",
  "diagnoses_treats",
]);

export const UserTypeSchema = z.enum(["hcps", "patients", "both", "admin"]);

export const UserScaleSchema = z.enum([
  "under_10k",
  "10k_to_1l",
  "1l_to_10l",
  "over_10l",
]);

export const IntegrationsSchema = z.enum([
  "abdm",
  "hospital",
  "both",
  "neither",
]);

export const DataSensitivitySchema = z.enum([
  "phi",
  "imaging",
  "genomic",
  "prescription",
  "insurance",
  "none",
]);

export const CommercialStageSchema = z.enum([
  "pre_mvp",
  "mvp",
  "scaling",
  "filed",
]);

export const WizardAnswersSchema = z.object({
  q1: ClinicalStateSchema,
  q2: InfoSignificanceSchema,
  q2_defended: z.boolean(),
  q3: UserTypeSchema,
  q4: UserScaleSchema,
  q5: IntegrationsSchema,
  q6: z.array(DataSensitivitySchema),
  q7: CommercialStageSchema,
});

export const WizardAnswersPartialSchema = WizardAnswersSchema.partial();

// Tier B schemas (Sprint 2 Story 2.5 Phase 3)

export const UseEnvironmentSchema = z.enum([
  "home",
  "opd",
  "inpatient",
  "surgical",
  "pre_hospital",
  "mixed",
]);

export const PredicateDeviceSchema = z.object({
  device_name: z.string().trim().min(1).max(200),
  manufacturer: z.string().trim().max(200).optional(),
  rationale: z.string().trim().max(500).optional(),
});

export const RiskMitigationSchema = z.object({
  risk: z.string().trim().min(1).max(300),
  mitigation: z.string().trim().max(300),
});

export const ClinicalEvidenceStatusSchema = z.enum([
  "none",
  "pilot_data",
  "published_study",
  "multi_center_trial",
]);

export const Iso13485StatusSchema = z.enum([
  "certified",
  "in_progress",
  "not_started",
  "not_applicable",
]);

export const SoftwareLifecycleModelSchema = z.enum([
  "waterfall",
  "agile",
  "hybrid",
  "not_applicable",
]);

export const EncryptionPostureSchema = z.enum(["yes", "no", "partial"]);

export const AuthenticationModelSchema = z.enum([
  "none",
  "local",
  "federated",
  "sso",
]);

export const CybersecurityPostureSchema = z.object({
  data_at_rest_encryption: EncryptionPostureSchema,
  data_in_transit_encryption: EncryptionPostureSchema,
  authentication_model: AuthenticationModelSchema,
});

/**
 * Partial schema for Tier B field-level save-on-blur. Each field is
 * independently optional so the save endpoint can validate a single
 * field at a time.
 */
export const TierBAnswersPartialSchema = z.object({
  b1_intended_use_statement: z.string().trim().min(1).max(2000).optional(),
  b2_use_environment: UseEnvironmentSchema.optional(),
  b3_predicate_devices: z.array(PredicateDeviceSchema).max(3).optional(),
  b4_risks_and_mitigations: z.array(RiskMitigationSchema).max(3).optional(),
  b5_clinical_evidence_status: ClinicalEvidenceStatusSchema.optional(),
  b6_iso_13485_status: Iso13485StatusSchema.optional(),
  c1_software_lifecycle_model: SoftwareLifecycleModelSchema.optional(),
  c2_cybersecurity_posture: CybersecurityPostureSchema.optional(),
});
