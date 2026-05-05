import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import { runCompletenessCheck } from "@/lib/completeness/checker";
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
 *
 * Logic mirrors lib/cdsco/relevant-forms.ts so the card and the draft
 * pack stay consistent. If we say "you have 4/12 docs" on the card,
 * the draft pack must reference the same 12.
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

  // SaMD overlay applies when AI/ML flag is set OR class_qualifier
  // marks it as a SaMD/AI-CDS variant. The Oct 2025 CDSCO SaMD draft
  // adds IEC 62304 + ACP requirements on top of the base checklist.
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

/**
 * Convenience wrapper: runs a completeness check for a ReadinessCard
 * given the documents the user uploaded at intake.
 *
 * Returns null when no honest check is possible (not a medical device,
 * unknown class). Callers must handle the null case — the card UI
 * shows a "Class not yet determined" placeholder.
 */
export function runCompletenessForCard(
  card: ReadinessCard,
  documents: CheckerDocument[]
): CompletenessResult | null {
  const category = categoryForCard(card);
  if (!category) return null;
  return runCompletenessCheck({ category, documents });
}
