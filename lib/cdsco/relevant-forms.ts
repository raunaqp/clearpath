import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import { CDSCO_FORMS, type CDSCOFormId } from "./forms-registry";

export type RelevantForm = {
  id: CDSCOFormId;
  description: string;
  reason: string;
  url: string | null;
  available: boolean;
};

/**
 * Determines which CDSCO forms apply to a given Readiness Card.
 *
 * Rules:
 * - Class A/B → MD-5 (manufacturing license, state authority)
 * - Class C/D → MD-7 (manufacturing license, central authority)
 * - Any classed medical device → MD-12 (clinical investigation license,
 *   needed when generating clinical evidence)
 * - IVD product (any class) → MD-14 (IVD-specific clinical investigation)
 * - Class B/C/D + ai_ml_flag with active studies → MD-22 (clinical
 *   investigation approval — the supplementary application)
 * - Export-only product → MD-20 (manufacture-for-export NOC)
 *
 * `available=true` means the blank PDF exists in our mirror and can be
 * appended to the Draft Pack. `available=false` means the form is in
 * scope but the founder has to download it from cdsco.gov.in directly.
 */
export function getRelevantForms(card: ReadinessCard): RelevantForm[] {
  const out: RelevantForm[] = [];
  const cls = card.classification.cdsco_class;
  const isMedicalDevice =
    card.classification.medical_device_status === "is_medical_device" ||
    card.classification.medical_device_status === "hybrid";
  const isIvd = card.classification.class_qualifier === "IVD";
  const exportOnly = card.classification.export_only;
  const aiMl = card.classification.ai_ml_flag;

  function add(id: CDSCOFormId, reason: string) {
    if (out.some((f) => f.id === id)) return; // dedupe
    const reg = CDSCO_FORMS[id];
    out.push({
      id,
      description: reg.description,
      reason,
      url: reg.url,
      available: reg.status === "uploaded" && !!reg.url,
    });
  }

  if (isMedicalDevice && (cls === "A" || cls === "B")) {
    add("MD-5", `Manufacturing license — Class ${cls} via state authority.`);
  }
  if (isMedicalDevice && (cls === "C" || cls === "D")) {
    add(
      "MD-7",
      `Manufacturing license — Class ${cls} via CDSCO Central Licensing Authority.`
    );
  }
  if (isMedicalDevice && cls && cls !== "A") {
    add(
      "MD-12",
      "Clinical investigation / test license — needed to generate clinical evidence for your CDSCO submission."
    );
  }
  if (isIvd) {
    add(
      "MD-14",
      "IVD-specific application — required for diagnostic devices."
    );
  }
  if (isMedicalDevice && aiMl && cls && cls !== "A") {
    add(
      "MD-22",
      "Clinical investigation approval (supplementary) — recommended for AI/ML SaMD per the Oct 2025 CDSCO SaMD draft."
    );
  }
  if (exportOnly) {
    add(
      "MD-20",
      "Manufacture for export only — Export NOC application."
    );
  }

  return out;
}
