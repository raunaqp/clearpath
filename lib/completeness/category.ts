import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import {
  runCompletenessCheck,
  type SignalSupplement,
} from "@/lib/completeness/checker";
import type {
  CheckerDocument,
  CompletenessResult,
  RequirementCategory,
} from "@/lib/completeness/types";

/**
 * Maps a ReadinessCard's classification to a RequirementCategory.
 *
 * Returns null when the product is not a regulated medical device, or
 * when the class is unknown — there's no honest checklist to run in
 * those cases.
 */
export function categoryForCard(
  card: ReadinessCard
): RequirementCategory | null {
  const status = card.classification.medical_device_status;
  if (status !== "is_medical_device" && status !== "hybrid") {
    return null;
  }

  const cls = card.classification.cdsco_class;
  if (!cls) {
    return null;
  }

  const isClassAB = cls === "A" || cls === "B";
  const isClassCD = cls === "C" || cls === "D";

  const isSamd =
    card.classification.ai_ml_flag === true ||
    card.classification.class_qualifier === "AI-CDS" ||
    card.classification.class_qualifier === "IVD-SaMD";

  if (isSamd && isClassAB) return "samd_class_a_b";
  if (isSamd && isClassCD) return "samd_class_c_d";
  if (isClassAB) return "class_a_b";
  if (isClassCD) return "class_c_d";
  return null;
}

// Schema stores readiness dimensions as number().min(0).max(2). We narrow
// to the SignalSupplement literal union (0 | 1 | 2) at the boundary.
function clampDim(n: number): 0 | 1 | 2 {
  if (n <= 0) return 0;
  if (n >= 2) return 2;
  return 1;
}

/**
 * Convenience wrapper: runs a completeness check for a ReadinessCard
 * given the documents the user uploaded at intake.
 *
 * Pulls the signal supplement from the card's readiness dimensions
 * automatically. Returns null when no honest check is possible.
 */
export function runCompletenessForCard(
  card: ReadinessCard,
  documents: CheckerDocument[]
): CompletenessResult | null {
  const category = categoryForCard(card);
  if (!category) return null;

  const dims = card.readiness.dimensions;
  const supplement: SignalSupplement | null = dims
    ? {
        quality_system: clampDim(dims.quality_system),
        technical_docs: clampDim(dims.technical_docs),
        clinical_evidence: clampDim(dims.clinical_evidence),
        submission_maturity: clampDim(dims.submission_maturity),
      }
    : null;

  return runCompletenessCheck({
    category,
    documents,
    signal_supplement: supplement,
  });
}
