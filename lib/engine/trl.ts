/**
 * TRL framework for ClearPath — anchored to the SERB/ANRF "Technology
 * Readiness Levels for Medical Devices and IVDs" framework (the same
 * framework MAHA MedTech Mission, BIRAC and DST evaluators use).
 *
 * Authoritative source: https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf
 *
 * Two tracks because the SERB framework distinguishes:
 *   - investigational (no predicate) — full 9 levels
 *   - has_predicate — TRL 6 and 7 collapse into "clinical evaluation +
 *     substantial-equivalence" — meaning the predicate-pathway product
 *     reaches commercialisation faster in TRL terms.
 *
 * Each level is anchored to a CDSCO form/license, which is what makes
 * this objectively verifiable (rather than vibes-based TRL self-reports).
 *
 * Used by: synthesizer (prompt rubric), engine (deriveTRL fallback),
 * card (TRLBlock display), grants module (eligibility check).
 */

import type { ReadinessCard } from "@/lib/schemas/readiness-card";

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type TRLTrack = "investigational" | "has_predicate";
export type TRLStage = NonNullable<ReadinessCard["trl"]>["stage"];

export type TRLDefinition = {
  level: TRLLevel;
  stage: TRLStage;
  label: string;
  /** Milestones — what must be true to claim this level (paraphrased SERB) */
  milestones: string[];
  /** CDSCO form/license that anchors this TRL (the objective evidence) */
  anchor_form: string | null;
  /** What needs to happen next to advance one level */
  next_milestone: string;
};

/**
 * Investigational track (no predicate) — full 9 levels.
 * Reference: SERB Annexure-II, Table 1.
 */
export const TRL_INVESTIGATIONAL: Record<TRLLevel, TRLDefinition> = {
  1: {
    level: 1,
    stage: "ideation",
    label: "Ideation",
    milestones: [
      "Problem statement and unmet need defined and documented",
      "Idea selected for the intended application",
    ],
    anchor_form: null,
    next_milestone: "Complete preliminary design and FTO search (TRL 2)",
  },
  2: {
    level: 2,
    stage: "proof_of_principle",
    label: "Proof of Principle",
    milestones: [
      "Preliminary device design selected",
      "Technical product specifications defined",
      "Applicable technical standards identified",
      "Freedom-to-operate (FTO) search and market analysis completed",
      "Preliminary Intended Use Statement established",
    ],
    anchor_form: null,
    next_milestone: "Build in-house prototype and run analytical performance tests (TRL 3)",
  },
  3: {
    level: 3,
    stage: "early_poc",
    label: "Early-stage Proof of Concept",
    milestones: [
      "In-house prototype designed",
      "In-house analytical performance tested",
    ],
    anchor_form: null,
    next_milestone: "Iterate to design freeze, identify device class, file MD-12 (TRL 4)",
  },
  4: {
    level: 4,
    stage: "advanced_poc",
    label: "Advanced Proof of Concept (Design Freeze)",
    milestones: [
      "In-house prototype safety and efficacy analysed",
      "Design finalised after iterations",
      "Device class identified",
      "Test-quantity and protocol defined",
      "Instructions for Use (IFU) framed",
      "MD-12 (Test License application) submitted",
    ],
    anchor_form: "MD-12 (submitted)",
    next_milestone: "Obtain MD-13 Test License and complete bench/analytical testing (TRL 5)",
  },
  5: {
    level: 5,
    stage: "test_batch",
    label: "Test-batch Evaluation",
    milestones: [
      "MD-13 Test License obtained",
      "Test batches manufactured per Schedule V",
      "Bench/simulated/analytical/stability testing completed",
      "MD-22 (medical device) or MD-24 (IVD) — clinical investigation/CPE data submitted",
    ],
    anchor_form: "MD-13 + MD-22 / MD-24",
    next_milestone: "Obtain MD-23/MD-25 permission for pilot clinical investigation (TRL 6)",
  },
  6: {
    level: 6,
    stage: "pilot_study",
    label: "Pilot CI / CPE Studies",
    milestones: [
      "MD-23 (CI permission) or MD-25 (CPE permission) obtained",
      "Safety and efficacy data from pilot study generated",
      "Application for pivotal study fee submitted",
    ],
    anchor_form: "MD-23 / MD-25",
    next_milestone: "Run pivotal study and submit MD-26/MD-28 (TRL 7)",
  },
  7: {
    level: 7,
    stage: "pivotal_study",
    label: "Pivotal CI / CPE Studies",
    milestones: [
      "Pivotal clinical investigation/CPE completed",
      "Safety and efficacy data from pivotal study generated",
      "MD-26 (medical device) or MD-28 (IVD) — manufacturing permission application submitted",
    ],
    anchor_form: "MD-26 / MD-28",
    next_milestone: "Obtain MD-27/MD-29 manufacturing license and stand up ISO 13485 line (TRL 8)",
  },
  8: {
    level: 8,
    stage: "pre_commercialisation",
    label: "Pre-commercialisation",
    milestones: [
      "MD-27 (medical device) or MD-29 (IVD) manufacturing license obtained",
      "ISO 13485-compliant manufacturing line established",
      "Packaging and labelling completed",
    ],
    anchor_form: "MD-27 / MD-29",
    next_milestone: "Launch with PMS system and user feedback loop (TRL 9)",
  },
  9: {
    level: 9,
    stage: "commercialisation",
    label: "Commercialisation & Post-Market",
    milestones: [
      "Product launched with Post-Market Surveillance system in place",
      "User feedback system operational",
    ],
    anchor_form: "PMS active",
    next_milestone: "Already commercialised — focus on PMS, AERs and lifecycle management",
  },
};

/**
 * Has-predicate track — TRL 6 and 7 are collapsed into a single
 * "clinical evaluation + substantial-equivalence" stage, anchored to
 * MD-3 (Class A/B) or MD-7 (Class C/D) manufacturing license application.
 *
 * Reference: SERB Annexure-II, Table 2.
 */
export const TRL_PREDICATE: Record<TRLLevel, TRLDefinition> = {
  1: TRL_INVESTIGATIONAL[1],
  2: TRL_INVESTIGATIONAL[2],
  3: TRL_INVESTIGATIONAL[3],
  4: TRL_INVESTIGATIONAL[4],
  5: TRL_INVESTIGATIONAL[5],
  6: {
    level: 6,
    stage: "pilot_study",
    label: "Clinical Evaluation (substantial equivalence — pilot)",
    milestones: [
      "Clinical evaluation (medical device) or performance evaluation (IVD)",
      "Substantial equivalence to predicate established",
    ],
    anchor_form: "MD-3 / MD-7 (in preparation)",
    next_milestone: "Submit MD-3 (Class A/B) or MD-7 (Class C/D) manufacturing license application (TRL 7)",
  },
  7: {
    level: 7,
    stage: "pivotal_study",
    label: "Manufacturing License Application (substantial equivalence — pivotal)",
    milestones: [
      "Clinical/performance evaluation completed against predicate",
      "MD-3 (Class A/B) or MD-7 (Class C/D) — manufacturing license application submitted",
    ],
    anchor_form: "MD-3 / MD-7",
    next_milestone: "Obtain manufacturing license and stand up ISO 13485 line (TRL 8)",
  },
  8: {
    level: 8,
    stage: "pre_commercialisation",
    label: "Pre-commercialisation",
    milestones: [
      "Manufacturing license obtained (MD-3 for Class A/B, MD-7 for Class C/D)",
      "ISO 13485-compliant manufacturing line established",
      "Packaging and labelling completed",
    ],
    anchor_form: "MD-3 / MD-7 (granted)",
    next_milestone: "Launch with PMS system and user feedback loop (TRL 9)",
  },
  9: TRL_INVESTIGATIONAL[9],
};

/**
 * Completion percentage anchored to TRL.
 * Not linear: weighted toward later stages because each post-TRL-5 step
 * is materially more expensive and time-consuming than the early stages.
 *
 * Calibration intent: a founder at TRL 3 (in-house prototype) reads as
 * "~22% of the way" because most of the regulatory and clinical work
 * lies ahead. A founder at TRL 7 (pivotal complete, MD-3/MD-7 filed)
 * reads as "~85%" because they're past the hardest gates.
 */
export const TRL_COMPLETION_PCT: Record<TRLLevel, number> = {
  1: 5,
  2: 12,
  3: 22,
  4: 35,
  5: 50,
  6: 65,
  7: 78,
  8: 92,
  9: 100,
};

export function getTRLDefinition(level: TRLLevel, track: TRLTrack): TRLDefinition {
  return track === "has_predicate" ? TRL_PREDICATE[level] : TRL_INVESTIGATIONAL[level];
}

/**
 * Deterministic TRL derivation from card signals.
 *
 * Used as a fallback when Opus doesn't populate the `trl` field directly.
 * Logic is anchored to:
 *   - submission_maturity dimension (MD-12 / MD-22 = TRL 4-5)
 *   - clinical_evidence dimension (pilot/pivotal data = TRL 6-7)
 *   - quality_system dimension (ISO 13485 line = TRL 8)
 *   - novel_or_predicate flag (track selection)
 *
 * This is intentionally conservative — when in doubt, anchor LOWER, because
 * "honesty over confidence" is the engineering rule.
 */
export function deriveTRL(card: ReadinessCard): NonNullable<ReadinessCard["trl"]> | null {
  // No TRL for non-medical-device / wellness — TRL is a medical-device framework.
  const status = card.classification.medical_device_status;
  if (status === "not_medical_device" || status === "wellness_carve_out") {
    return null;
  }

  const dims = card.readiness.dimensions;
  const novel = card.classification.novel_or_predicate;
  const track: TRLTrack = novel === "novel" ? "investigational" : "has_predicate";

  // Submission maturity is the strongest signal — it directly maps to CDSCO forms.
  const submissionMaturity = dims.submission_maturity;
  const clinicalEvidence = dims.clinical_evidence;
  const qualitySystem = dims.quality_system;
  const technicalDocs = dims.technical_docs;

  let level: TRLLevel = 1;

  // Ideation → Proof of Principle: nothing built
  if (technicalDocs === 0 && qualitySystem === 0 && submissionMaturity === 0 && clinicalEvidence === 0) {
    level = 1;
  } else if (technicalDocs === 0 && (qualitySystem >= 1 || submissionMaturity >= 1)) {
    // Spec exists but no prototype
    level = 2;
  } else if (technicalDocs >= 1 && submissionMaturity === 0) {
    // Prototype + bench, but no MD-12 yet
    level = 3;
  } else if (submissionMaturity >= 1 && clinicalEvidence === 0) {
    // MD-12 / pre-submission consult, no clinical data yet
    level = 4;
  } else if (submissionMaturity >= 1 && clinicalEvidence === 1) {
    // Test license + early/pilot data
    level = 5;
  } else if (clinicalEvidence === 2 && submissionMaturity === 1) {
    // Published validation but mfg license not active
    level = 6;
  } else if (clinicalEvidence === 2 && submissionMaturity === 2 && qualitySystem < 2) {
    // Active filing + pivotal data, line not stood up
    level = 7;
  } else if (qualitySystem === 2 && submissionMaturity === 2 && clinicalEvidence === 2) {
    // ISO 13485 line + active license + clinical data → pre-commercialisation
    level = 8;
  } else if (
    qualitySystem === 2 &&
    submissionMaturity === 2 &&
    clinicalEvidence === 2 &&
    technicalDocs === 2
  ) {
    // Fully mature — note: deriveTRL almost never returns 9; that needs PMS evidence
    level = 8;
  }

  const def = getTRLDefinition(level, track);

  return {
    level,
    stage: def.stage,
    track,
    completion_pct: TRL_COMPLETION_PCT[level],
    next_milestone: def.next_milestone,
    rationale: buildRationale(level, track, dims, novel),
  };
}

function buildRationale(
  level: TRLLevel,
  track: TRLTrack,
  dims: ReadinessCard["readiness"]["dimensions"],
  novel: ReadinessCard["classification"]["novel_or_predicate"],
): string {
  const trackLabel =
    track === "has_predicate"
      ? "predicate-equivalence track"
      : "investigational (no-predicate) track";
  const cues: string[] = [];
  if (dims.submission_maturity === 2) cues.push("active CDSCO filing");
  else if (dims.submission_maturity === 1) cues.push("pre-submission engagement");
  if (dims.clinical_evidence === 2) cues.push("published clinical validation");
  else if (dims.clinical_evidence === 1) cues.push("pilot clinical data");
  if (dims.quality_system === 2) cues.push("ISO 13485 / IEC 62304 in place");
  if (dims.technical_docs === 2) cues.push("DHF / V&V protocols");
  if (novel === "novel") cues.push("no clear predicate detected");
  const cueText = cues.length > 0 ? ` — based on ${cues.join(", ")}` : "";
  return `Likely TRL ${level} on the ${trackLabel}${cueText}. Anchored to SERB / ANRF MAHA MedTech Mission framework.`;
}
