/**
 * Phase 1.6 — Tier 1 Regulatory Readiness Report static lookup:
 * reviewer priorities (what CDSCO reviewers will likely look for).
 *
 * Purpose: drives Section 5 (Reviewer Insights) of the ₹499 report.
 *
 * The library is a ranked list of candidate reviewer concerns. The
 * generator evaluates each entry's `triggers(ctx)` against the
 * product's profile (class, AI/ML flag, recommended path, data
 * sensitivity, ABDM scope, etc.) and keeps the matching subset,
 * ordered by `weight`. The Opus call in the generator tailors each
 * priority's `what_reviewers_look_for_seed` to the specific
 * product — but the priority titles themselves are static (this
 * keeps the moat content reviewable, not LLM-drifted).
 *
 * REVIEW STATUS: every entry is `estimate` until the founder or a
 * CDSCO consultant signs off. See the human-readable twin at
 * `docs/seed-tables/tier1-reviewer-priorities-library.md`.
 */

import type {
  CdscoClassEnum,
  ClassQualifierEnum,
  RecommendedPath,
} from "../schemas/readiness-card";
import { z } from "zod";

export type CdscoClass = z.infer<typeof CdscoClassEnum>;
export type ClassQualifier = z.infer<typeof ClassQualifierEnum>;
export type DataSensitivity = "none" | "low" | "medium" | "high";

export type ReviewStatus = "estimate" | "reviewed";

export interface ReviewerContext {
  cdsco_class: CdscoClass;
  class_qualifier: ClassQualifier;
  ai_ml_flag: boolean;
  acp_required: boolean;
  novel_or_predicate: "novel" | "has_predicate" | null;
  recommended_path: RecommendedPath | undefined;
  data_sensitivity: DataSensitivity;
  abdm_in_scope: boolean;
  use_environment_home: boolean;
  drives_or_diagnoses: boolean;
}

export interface ReviewerPriority {
  key: string;
  title: string;
  what_reviewers_look_for_seed: string;
  triggers: (ctx: ReviewerContext) => boolean;
  weight: number;
  review_status: ReviewStatus;
}

export const REVIEWER_PRIORITIES_LIBRARY: ReviewerPriority[] = [
  {
    key: "clinical_validation",
    title: "Strength of clinical validation evidence",
    what_reviewers_look_for_seed:
      "Reviewers will likely look for prospective, Indian-population evidence with EC approval and CTRI registration. Sample size, endpoint definitions, and statistical analysis plans typically get line-by-line scrutiny for Class C/D devices.",
    triggers: (c) =>
      c.cdsco_class === "C" || c.cdsco_class === "D" || c.novel_or_predicate === "novel",
    weight: 10,
    review_status: "estimate",
  },
  {
    key: "intended_use_consistency",
    title: "Intended Use consistency across documents",
    what_reviewers_look_for_seed:
      "Reviewers cross-check the Intended Use Statement against marketing copy, the IFU, labelling, and the classification rationale. Any drift — for example a marketing claim broader than the IFU — typically triggers questions early in the review cycle.",
    triggers: () => true,
    weight: 9,
    review_status: "estimate",
  },
  {
    key: "ai_update_controls",
    title: "AI/ML update controls (ACP / PCCP)",
    what_reviewers_look_for_seed:
      "Per the Oct 2025 CDSCO SaMD draft, reviewers will likely look for an Algorithm Change Protocol describing modification scope, retraining triggers, validation thresholds, and human oversight — applied before any commercial model update.",
    triggers: (c) =>
      c.ai_ml_flag && (c.cdsco_class === "C" || c.cdsco_class === "D" || c.acp_required),
    weight: 9,
    review_status: "estimate",
  },
  {
    key: "indian_population_relevance",
    title: "Indian-population validity",
    what_reviewers_look_for_seed:
      "For novel devices or foreign-predicate filings, reviewers typically ask how performance was demonstrated on an Indian population — demographics, disease prevalence patterns, imaging-protocol variability, and subgroup analyses.",
    triggers: (c) =>
      (c.cdsco_class === "B" || c.cdsco_class === "C" || c.cdsco_class === "D") &&
      c.novel_or_predicate === "novel",
    weight: 8,
    review_status: "estimate",
  },
  {
    key: "cybersecurity_data_handling",
    title: "Cybersecurity & data handling",
    what_reviewers_look_for_seed:
      "When sensitive health data is in scope (imaging, PHI, genomic, prescription), reviewers typically ask for a threat model per IEC 81001-5-1, encryption-at-rest and in-transit controls, authentication model, breach SOP, and CERT-In safe-to-host evidence for cloud deployments.",
    triggers: (c) => c.data_sensitivity === "medium" || c.data_sensitivity === "high",
    weight: 8,
    review_status: "estimate",
  },
  {
    key: "explainability",
    title: "Explainability of AI recommendations",
    what_reviewers_look_for_seed:
      "For AI/ML devices that influence clinical management, reviewers typically ask how the model's output is presented to clinicians — confidence indicators, contributing-feature visualisations, and uncertainty handling — so the clinician remains the responsible decision-maker.",
    triggers: (c) => c.ai_ml_flag && c.drives_or_diagnoses,
    weight: 7,
    review_status: "estimate",
  },
  {
    key: "risk_management_maturity",
    title: "Risk management maturity (ISO 14971)",
    what_reviewers_look_for_seed:
      "Reviewers will likely look for a documented ISO 14971 risk file — hazards, hazardous situations, harms, severity × probability scoring, residual-risk justification, and post-market feedback loops — proportionate to the device class.",
    triggers: (c) => c.cdsco_class === "B" || c.cdsco_class === "C" || c.cdsco_class === "D",
    weight: 7,
    review_status: "estimate",
  },
  {
    key: "predicate_narrative",
    title: "Predicate / substantial-equivalence narrative",
    what_reviewers_look_for_seed:
      "When a predicate is cited (especially foreign), reviewers typically expect a side-by-side comparison on intended use, technology, materials, performance, and indications, plus a justification for any material differences.",
    triggers: (c) => c.novel_or_predicate === "has_predicate",
    weight: 7,
    review_status: "estimate",
  },
  {
    key: "abdm_interoperability",
    title: "ABDM / interoperability conformance",
    what_reviewers_look_for_seed:
      "When ABDM integration is in scope, reviewers (and procurement teams) typically expect FHIR R4 conformance, OAuth 2.0 onboarding, ABDM milestone certificates, and a documented mapping from your data model to FHIR resources.",
    triggers: (c) => c.abdm_in_scope,
    weight: 6,
    review_status: "estimate",
  },
  {
    key: "usability_lay_user",
    title: "Usability + lay-user safeguards",
    what_reviewers_look_for_seed:
      "For home-use or lay-user environments, reviewers typically ask for a usability file per IEC 62366-1 — formative + summative evaluations — and an IFU at a general-public reading level with explicit warnings about misuse modes.",
    triggers: (c) => c.use_environment_home,
    weight: 6,
    review_status: "estimate",
  },
];

/**
 * Pick the top-N applicable priorities for this context, ordered by
 * weight (stable). N defaults to 5 per the spec's "4–6 items" band.
 */
export function selectReviewerPriorities(
  ctx: ReviewerContext,
  limit = 5
): ReviewerPriority[] {
  return REVIEWER_PRIORITIES_LIBRARY.filter((p) => p.triggers(ctx))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
