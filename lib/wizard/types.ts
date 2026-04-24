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

export type WizardAnswers = {
  q1?: ClinicalState;
  q2?: InfoSignificance;
  q2_defended?: boolean; // true when user kept 'informs_only' after follow-up
  q3?: UserType;
  q4?: UserScale;
  q5?: Integrations;
  q6?: DataSensitivity[];
  q7?: CommercialStage;
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
