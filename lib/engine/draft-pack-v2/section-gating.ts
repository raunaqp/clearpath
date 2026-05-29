/**
 * Section gating — single source of truth for which sections and
 * sub-blocks render in the hardware Submission Pack.
 *
 * Why this is the right shape: every section that can conditionally
 * appear needs to be decided from ONE function, not scattered across
 * each section's generator. That's how the SaMD pack avoided the
 * "section silently missing in some runs" failure mode in Sprint 2.
 *
 * Standing rule — blast-radius safeguard
 * --------------------------------------
 * For inferred fields (synthesizer-emitted markers — `sterile`,
 * `software_in_device`, `drug_content`, `ionising_radiation`,
 * `veterinary_use`, `measuring_function`): when a marker is present,
 * the gated section is **included** with [ASSUMED YES — confirm in
 * editor] framing, regardless of the inferred direction. A
 * wrong-included section is removable in the editor; a wrong-omitted
 * section is invisible to a regulator and uncatchable.
 *
 * For wizard-explicit fields (Q8 predicate-existence, Q9 patient-
 * contact, B-tier predicate picker, B6 ISO 13485 status): gate strictly
 * on the founder's actual answer — no safeguard needed because the
 * founder gave the answer directly.
 *
 * Codified in docs/specs/hardware-submission-pack-matrix.md
 * "Standing rule for gated sections" block.
 */

import type {
  SectionKey,
  SourceData,
  SubBlockKey,
} from "./types";

/** Canonical hardware inference-marker field names emitted by the
 *  synthesizer (`lib/engine/synthesizer-system-prompt.ts` lines 245+).
 *  The schema accepts any string for forward compatibility, but the
 *  pack gating uses only these. */
export type HardwareMarkerField =
  | "patient_contact"
  | "sterile"
  | "drug_content"
  | "ionising_radiation"
  | "veterinary_use"
  | "measuring_function"
  | "implantable"
  | "software_in_device"
  | "info_significance"
  | "year1_users_scale";

/** Why a section was included or excluded — useful for the orchestrator
 *  log and the smoke harness. */
export type GatingDecision = {
  included: boolean;
  reason: string;
  /** When `included && assumed === true`, the section's generator must
   *  prefix the content with the [ASSUMED YES — confirm in editor]
   *  framing. The orchestrator passes this flag down via SectionOpts. */
  assumed: boolean;
};

/** Lookup a marker by field. Returns the whole marker (value + status)
 *  or null. The synthesizer emits markers for every hardware field
 *  regardless of value (see synthesizer-system-prompt.ts §245+), so
 *  "marker present" is NOT a trigger; the marker's value and status are. */
function getMarker(
  sources: SourceData,
  field: HardwareMarkerField
): { value: string; status: "estimated" | "assumed" | "extracted" } | null {
  const markers = sources.readiness_card.inference_markers ?? [];
  const m = markers.find((m) => m.field === field);
  return m ? { value: m.value, status: m.status } : null;
}

/** Value parsers — values are human English ("Yes (drug-eluting)",
 *  "No", "Humans only"), not snake_case tokens. */
function valueIsAffirmative(v: string): boolean {
  return /^\s*yes\b/i.test(v);
}
function valueIsNegative(v: string): boolean {
  return /^\s*no\b/i.test(v);
}

/** Calibrated trigger: combines parse + status to decide
 *  include / include-with-assumed / exclude.
 *
 *  - status === "assumed" (synthesizer had NO signal — pure default):
 *    → include with [ASSUMED YES — confirm], regardless of parsed value.
 *      Blast-radius safeguard kicks in only here, because this is the
 *      only state where we have zero evidence either way.
 *  - status === "estimated" / "extracted" (synthesizer had a signal):
 *    → trust the parsed value. Affirmative includes; negative excludes.
 *      No [ASSUMED] flag — the synthesizer or founder saw evidence.
 *  - marker absent:
 *    → exclude. Synthesizer would always emit this field for hardware;
 *      absence means the persona isn't hardware (skip pack entirely
 *      at the orchestrator level).
 *
 *  Use for: §14 Sterilization (whole-section), §8.12 medicinal_substances,
 *  §8.15 software_vv. NOT for §19 NOC sub-blocks — wrong-included NOC
 *  rows are clear noise, no safety win. */
function calibratedTrigger(
  sources: SourceData,
  field: HardwareMarkerField
): { include: boolean; assumed: boolean; reason: string } {
  const m = getMarker(sources, field);
  if (!m) {
    return {
      include: false,
      assumed: false,
      reason: `no ${field} marker emitted`,
    };
  }
  if (m.status === "assumed") {
    return {
      include: true,
      assumed: true,
      reason: `${field} marker status=assumed (no signal) — blast-radius safeguard`,
    };
  }
  if (valueIsAffirmative(m.value)) {
    return {
      include: true,
      assumed: false,
      reason: `${field}="${m.value}" (status=${m.status})`,
    };
  }
  if (valueIsNegative(m.value)) {
    return {
      include: false,
      assumed: false,
      reason: `${field}="${m.value}" (status=${m.status}, signal pointed negative)`,
    };
  }
  // Ambiguous parse (e.g., "Unclear") with a real signal — bias to include
  // since the synthesizer found something but couldn't categorise.
  return {
    include: true,
    assumed: true,
    reason: `${field}="${m.value}" (status=${m.status}, ambiguous parse — including with safeguard)`,
  };
}

/** Direct value-based trigger for §19 NOC sub-blocks. No status
 *  safeguard — wrong-included NOC is clean noise, not a safety issue.
 *  These triggers are intentionally narrower than calibratedTrigger. */
function drugContentNocTrigger(sources: SourceData): boolean {
  const m = getMarker(sources, "drug_content");
  return m !== null && valueIsAffirmative(m.value);
}
function radiationNocTrigger(sources: SourceData): boolean {
  const m = getMarker(sources, "ionising_radiation");
  return m !== null && valueIsAffirmative(m.value);
}
function veterinaryNocTrigger(sources: SourceData): boolean {
  const m = getMarker(sources, "veterinary_use");
  if (m === null) return false;
  // Affirmative for veterinary requires NOT "humans only".
  return !/humans?\s*only/i.test(m.value);
}
function pndtNocTrigger(_sources: SourceData): boolean {
  // Sprint 4 candidate. No pndt_in_scope marker today.
  return false;
}

const LONG_TERM_CONTACT = new Set([
  "invasive_long_term_30d",
  "implant_gt_30d",
]);

/** Decide whether to include a section. Returns the decision + a
 *  reason string suitable for the orchestrator log.
 *
 *  IMPORTANT: this function MUST return a decision for every
 *  hardware-pack section (1–19). Unknown keys throw — that catches
 *  typos before they silently default to "skip". */
export function shouldIncludeSection(
  key: SectionKey,
  sources: SourceData
): GatingDecision {
  switch (key) {
    // Always-present hardware sections — §1–§12 (reuse + overlay) +
    // §15 stability + §16 batch release + §17 PMF + §18 QMS.
    case "01_executive_summary":
    case "02_device_description":
    case "03_intended_use":
    case "04_classification_grouping":
    case "05_product_specification":
    case "06_predicate_comparison":
    case "07_labelling":
    case "08_design_manufacturing":
    case "09_essential_principles":
    case "10_risk_management":
    case "11_verification_validation":
    case "12_clinical_evidence_pms":
    case "15_stability_data":
    case "16_batch_release":
    case "17_pmf_attestation":
    case "18_qms_attestation":
      return {
        included: true,
        reason: "always present for hardware",
        assumed: false,
      };

    // §13 Biocompatibility — gated on Q9 patient_contact (wizard-explicit).
    // Strict gate; no blast-radius safeguard because the founder answered Q9 directly.
    case "13_biocompatibility": {
      const q9 = sources.wizard_answers.q9;
      if (q9 === undefined) {
        // Hardware founder skipped Q9 (shouldn't happen — Q9 is required
        // for the persona). Treat absence as "marker would be set" and
        // include with [ASSUMED YES — confirm].
        return {
          included: true,
          reason: "Q9 patient_contact missing — assumed; confirm in editor",
          assumed: true,
        };
      }
      if (q9 === "no_contact") {
        return {
          included: false,
          reason: "Q9 patient_contact = no_contact (wizard-explicit)",
          assumed: false,
        };
      }
      return {
        included: true,
        reason: `Q9 patient_contact = ${q9} (wizard-explicit)`,
        assumed: false,
      };
    }

    // §14 Sterilization — calibrated trigger on `sterile` marker.
    case "14_sterilization_validation": {
      const t = calibratedTrigger(sources, "sterile");
      return {
        included: t.include,
        reason: t.reason,
        assumed: t.assumed,
      };
    }

    // §19 Conditional NOCs — at least one NOC trigger fires.
    // NOC sub-blocks intentionally do NOT use the blast-radius safeguard
    // (wrong-included NOCs are noise, not safety).
    case "19_conditional_nocs": {
      const triggers: string[] = [];
      if (veterinaryNocTrigger(sources)) triggers.push("veterinary_use");
      if (radiationNocTrigger(sources)) triggers.push("ionising_radiation");
      if (pndtNocTrigger(sources)) triggers.push("pndt_in_scope");
      if (drugContentNocTrigger(sources)) triggers.push("drug_content");
      if (triggers.length === 0) {
        return {
          included: false,
          reason: "no NOC triggers fire",
          assumed: false,
        };
      }
      return {
        included: true,
        reason: `NOC triggers: ${triggers.join(", ")}`,
        assumed: false,
      };
    }
  }
}

/** Decide whether to include a conditional sub-block nested inside its
 *  parent section. The parent generator calls this and conditionally
 *  emits the sub-block content.
 *
 *  Sub-block gating mirrors the standing rule: inferred fields use the
 *  blast-radius safeguard; wizard-explicit fields gate strictly. */
export function shouldIncludeSubBlock(
  key: SubBlockKey,
  sources: SourceData
): GatingDecision {
  switch (key) {
    // §8.12 medicinal_substances (in §8) — calibrated drug_content trigger.
    case "medicinal_substances": {
      const t = calibratedTrigger(sources, "drug_content");
      return { included: t.include, reason: t.reason, assumed: t.assumed };
    }

    // §8.15 software_vv (in §11) — calibrated software_in_device trigger.
    case "software_vv": {
      const t = calibratedTrigger(sources, "software_in_device");
      return { included: t.include, reason: t.reason, assumed: t.assumed };
    }

    // §8.16 animal_preclinical (in §12) — mixed gate.
    // Q9 long-term contact path is wizard-explicit (strict).
    // Drug-content path uses the calibrated trigger.
    case "animal_preclinical": {
      const q9 = sources.wizard_answers.q9;
      if (q9 !== undefined && LONG_TERM_CONTACT.has(q9)) {
        return {
          included: true,
          reason: `Q9 patient_contact = ${q9} — long-term contact requires animal preclinical (wizard-explicit)`,
          assumed: false,
        };
      }
      const t = calibratedTrigger(sources, "drug_content");
      if (!t.include) {
        return {
          included: false,
          reason: `no long-term contact (Q9=${q9 ?? "—"}) AND ${t.reason}`,
          assumed: false,
        };
      }
      return {
        included: true,
        reason: `drug-combination route: ${t.reason}`,
        assumed: t.assumed,
      };
    }
  }
}

/** Return the ordered list of section keys to run for the hardware
 *  persona, with gating already applied. The orchestrator iterates
 *  this and skips sections whose decision is `included: false`.
 *
 *  Order follows the matrix: §4 anchor → §2/3/5/6/7 parallel → §8/9
 *  parallel → §10/11/12 sequential → §13/14 parallel → §15/16
 *  parallel → §17/18 parallel → §19 → §1 consolidator last. The
 *  orchestrator implements the parallelism; this function just
 *  decides presence + ordering. */
export function hardwarePackSectionPlan(sources: SourceData): Array<{
  key: SectionKey;
  decision: GatingDecision;
}> {
  // Listed in editor-display order (1..19). The orchestrator picks
  // its own execution order from this presence list.
  const order: SectionKey[] = [
    "01_executive_summary",
    "02_device_description",
    "03_intended_use",
    "04_classification_grouping",
    "05_product_specification",
    "06_predicate_comparison",
    "07_labelling",
    "08_design_manufacturing",
    "09_essential_principles",
    "10_risk_management",
    "11_verification_validation",
    "12_clinical_evidence_pms",
    "13_biocompatibility",
    "14_sterilization_validation",
    "15_stability_data",
    "16_batch_release",
    "17_pmf_attestation",
    "18_qms_attestation",
    "19_conditional_nocs",
  ];
  return order.map((key) => ({
    key,
    decision: shouldIncludeSection(key, sources),
  }));
}
