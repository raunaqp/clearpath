/**
 * Draft Pack v2 — Phase 4c validator.
 *
 * Runs the 10 cross-section invariants from the matrix Phase 4a spec
 * plus per-section length / required-field checks. Surfaces a
 * structured report; does NOT mutate the pack or block delivery
 * (that's Phase 5's UX choice).
 */

import type { SectionOutput, SourceData } from "./draft-pack-v2/types";

export type Severity = "blocker" | "warning" | "info";

export type ValidationFinding = {
  invariant: string;
  severity: Severity;
  section_keys: string[];
  message: string;
};

export type ValidationReport = {
  passing_count: number;
  failing_count: number;
  critical_failures: ValidationFinding[];
  warnings: ValidationFinding[];
  gaps: ValidationFinding[];
  total_word_count: number;
  total_tbd_count: number;
};

function findSection(
  sections: SectionOutput[],
  key: string
): SectionOutput | undefined {
  return sections.find((s) => s.section_key === key);
}

function hasText(s: SectionOutput | undefined, needle: string): boolean {
  return s?.content?.toLowerCase().includes(needle.toLowerCase()) ?? false;
}

function countTbds(s: SectionOutput | undefined): number {
  if (!s?.content) return 0;
  const matches = s.content.match(/\[TBD\]/g);
  return matches?.length ?? 0;
}

export function validateDraftPackV2(
  sections: SectionOutput[],
  sources: SourceData
): ValidationReport {
  const findings: ValidationFinding[] = [];

  // Aggregate facts the invariants compare against
  const s1 = findSection(sections, "01_executive_summary");
  const s2 = findSection(sections, "02_device_description");
  const s3 = findSection(sections, "03_intended_use");
  const s4 = findSection(sections, "04_classification_grouping");
  const s5 = findSection(sections, "05_product_specification");
  const s6 = findSection(sections, "06_predicate_comparison");
  const s7 = findSection(sections, "07_labelling");
  const s8 = findSection(sections, "08_design_manufacturing");
  const s9 = findSection(sections, "09_essential_principles");
  const s10 = findSection(sections, "10_risk_management");
  const s11 = findSection(sections, "11_verification_validation");
  const s12 = findSection(sections, "12_clinical_evidence_pms");

  const wa = sources.wizard_answers;
  const card = sources.readiness_card;
  const ai = sources.ai_extracted;
  const hasPredicate =
    wa.b3_no_predicate !== true &&
    (wa.b3_predicate_devices ?? []).length > 0;
  const isSterile =
    !!ai?.product_meta?.sterile &&
    ai.product_meta.sterile.toLowerCase().includes("sterile") &&
    !ai.product_meta.sterile.toLowerCase().includes("non-sterile");
  const softwarePresent =
    (card.classification.class_qualifier ?? "").includes("SaMD") ||
    (card.classification.class_qualifier ?? "").startsWith("AI-CDS") ||
    card.classification.ai_ml_flag ||
    (ai?.suggested_wizard_answers?.device_class ?? "").startsWith("samd_");
  const aiMl = card.classification.ai_ml_flag;
  const acpRequired = card.classification.acp_required;
  const cyberTriggered =
    (wa.q6 ?? []).some((v) => v !== "none") ||
    (ai?.suggested_wizard_answers?.data_sensitivity != null &&
      ai.suggested_wizard_answers.data_sensitivity !== "none");

  // === Per-section length + failure checks
  for (const s of sections) {
    if (s.completion_status === "failed") {
      findings.push({
        invariant: "section_generated",
        severity: "blocker",
        section_keys: [s.section_key],
        message: `Section ${s.section_number} failed to generate: ${s.meta.error_message ?? "(no error message)"}`,
      });
    }
  }

  // === Cross-section invariants

  // 1. Classification consistency — Section 4 anchors; Section 1 cites it.
  if (s4 && s1) {
    const cls = card.classification.cdsco_class;
    if (cls && !s1.content.includes(`Class ${cls}`)) {
      findings.push({
        invariant: "classification_consistency",
        severity: "warning",
        section_keys: ["01_executive_summary", "04_classification_grouping"],
        message: `Section 1 does not reference Section 4's class (${cls}) verbatim.`,
      });
    }
  }

  // 2. Pathway consistency — novel ⇒ MD-26/MD-27 in pathway in §1
  if (!hasPredicate && wa.b3_no_predicate === true && s1) {
    if (!hasText(s1, "MD-26") || !hasText(s1, "MD-27")) {
      findings.push({
        invariant: "pathway_consistency",
        severity: "blocker",
        section_keys: ["01_executive_summary", "06_predicate_comparison"],
        message: "Novel-device pathway must reference MD-26 → MD-27 pre-permission in Section 1 pathway/headline.",
      });
    }
  }

  // 3. Predicate consistency — §4.novel_or_predicate ↔ §6.has_predicate
  if (s4 && s6) {
    const novelInS4 = hasText(s4, "novel") || hasText(s4, "no predicate");
    const novelInS6 =
      hasText(s6, "novel device") || hasText(s6, "no-predicate") || hasText(s6, "no predicate");
    if (wa.b3_no_predicate === true && (!novelInS4 || !novelInS6)) {
      findings.push({
        invariant: "predicate_consistency",
        severity: "blocker",
        section_keys: ["04_classification_grouping", "06_predicate_comparison"],
        message: "b3_no_predicate=true but novel-device framing not present in both Section 4 AND Section 6.",
      });
    }
  }

  // 4. Sterility consistency — sterile ⇒ §7 sterility mark + §8 sterilization + §10 sterility risks + §9 sterility row
  if (isSterile) {
    const sterilityChecks: Array<[SectionOutput | undefined, string, string]> = [
      [s7, "07_labelling", "sterile"],
      [s8, "08_design_manufacturing", "steriliz"],
      [s10, "10_risk_management", "steril"],
      [s9, "09_essential_principles", "steril"],
    ];
    for (const [sec, key, needle] of sterilityChecks) {
      if (sec && !hasText(sec, needle)) {
        findings.push({
          invariant: "sterility_consistency",
          severity: "warning",
          section_keys: [key],
          message: `Sterile product but Section ${sec.section_number} does not mention sterility.`,
        });
      }
    }
  }

  // 5. Software consistency — software present ⇒ §8 SDLC + §9 software conformance + §11 software V&V
  if (softwarePresent) {
    if (s8 && !hasText(s8, "software development lifecycle") && !hasText(s8, "IEC 62304")) {
      findings.push({
        invariant: "software_consistency",
        severity: "blocker",
        section_keys: ["08_design_manufacturing"],
        message:
          "Software present but Section 8 has no Software Development Lifecycle / IEC 62304 sub-block.",
      });
    }
    if (s9 && !hasText(s9, "62304") && !hasText(s9, "software conformance")) {
      findings.push({
        invariant: "software_consistency",
        severity: "blocker",
        section_keys: ["09_essential_principles"],
        message:
          "Software present but Section 9 has no IEC 62304 / software conformance row.",
      });
    }
    if (s11 && !hasText(s11, "software verification") && !hasText(s11, "62304")) {
      findings.push({
        invariant: "software_consistency",
        severity: "blocker",
        section_keys: ["11_verification_validation"],
        message:
          "Software present but Section 11 has no software V&V sub-block.",
      });
    }
  }

  // 6. AI/ML consistency — ai_ml_flag && acp_required ⇒ ACP in §8, AI-risks in §10, drift in §12 PMS
  if (aiMl && acpRequired) {
    if (s8 && !hasText(s8, "algorithm change protocol")) {
      findings.push({
        invariant: "ai_ml_consistency",
        severity: "blocker",
        section_keys: ["08_design_manufacturing"],
        message:
          "ACP required but Section 8 missing Algorithm Change Protocol sub-block.",
      });
    }
    if (s10 && !hasText(s10, "drift")) {
      findings.push({
        invariant: "ai_ml_consistency",
        severity: "warning",
        section_keys: ["10_risk_management"],
        message:
          "AI/ML device but Section 10 risk register does not mention drift.",
      });
    }
    if (s12 && !hasText(s12, "drift")) {
      findings.push({
        invariant: "ai_ml_consistency",
        severity: "warning",
        section_keys: ["12_clinical_evidence_pms"],
        message:
          "AI/ML device but Section 12 PMS plan does not mention drift monitoring.",
      });
    }
  }

  // 7. Cybersecurity consistency — c2 trigger ⇒ §9 cybersecurity sub-section
  if (cyberTriggered) {
    if (s9 && !hasText(s9, "cybersecurity") && !hasText(s9, "81001-5-1")) {
      findings.push({
        invariant: "cybersecurity_consistency",
        severity: "blocker",
        section_keys: ["09_essential_principles"],
        message:
          "Data sensitivity > none but Section 9 has no cybersecurity sub-section.",
      });
    }
  }

  // 8. Patient-contact consistency — §2 patient_contact !== none ⇒ §9 biocompat row + §11 biocompat block
  // (Sprint 2: patient-contact is a [TBD] gap so we soft-warn only)
  if (
    s9 &&
    s11 &&
    !hasText(s9, "biocompatibility") &&
    !hasText(s11, "biocompatibility")
  ) {
    findings.push({
      invariant: "patient_contact_consistency",
      severity: "info",
      section_keys: ["09_essential_principles", "11_verification_validation"],
      message:
        "Neither Section 9 nor Section 11 mentions biocompatibility — verify whether patient-contact is in scope (Sprint 3 question gap).",
    });
  }

  // 9. Intended-use consistency — §3 indication echoes in §1 + §7
  if (s3 && s1 && s7) {
    // Heuristic — pull first 40 chars of §3 indication and check across §1 + §7
    const stub = s3.content
      .split("## Indication")[1]
      ?.split("##")[0]
      ?.replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
    if (stub && stub.length >= 20) {
      const lowered = stub.toLowerCase();
      const inS1 = s1.content.toLowerCase().includes(lowered.slice(0, 30));
      const inS7 = s7.content.toLowerCase().includes(lowered.slice(0, 30));
      if (!inS1 || !inS7) {
        findings.push({
          invariant: "intended_use_consistency",
          severity: "info",
          section_keys: [
            "01_executive_summary",
            "03_intended_use",
            "07_labelling",
          ],
          message: `Intended-use phrasing in Section 3 (${stub.slice(0, 30)}...) is not echoed verbatim in ${!inS1 ? "Section 1" : ""}${!inS1 && !inS7 ? " and " : ""}${!inS7 ? "Section 7" : ""}.`,
        });
      }
    }
  }

  // 10. Class-D heightened-scrutiny consistency
  if (card.classification.cdsco_class === "D") {
    const lengthChecks: Array<[SectionOutput | undefined, string, number]> = [
      [s4, "04_classification_grouping", 600], // ~150 words of rationale
      [s6, "06_predicate_comparison", 800],
      [s8, "08_design_manufacturing", 2500],
      [s10, "10_risk_management", 1500],
      [s11, "11_verification_validation", 1500],
      [s12, "12_clinical_evidence_pms", 1500],
    ];
    for (const [sec, key, minChars] of lengthChecks) {
      if (sec && sec.content.length < minChars) {
        findings.push({
          invariant: "class_d_heightened_scrutiny",
          severity: "warning",
          section_keys: [key],
          message: `Class D heightened-scrutiny: Section ${sec.section_number} is ${sec.content.length} chars (expected ≥ ${minChars}).`,
        });
      }
    }
    // Section 10 risk register row count (Class D ≥ 5)
    if (s10) {
      // Count register rows by counting risk-id markers
      const riskRows = (s10.content.match(/\bR\d+\b|\bAUTO-\d+\b/g) ?? []).length;
      if (riskRows < 5) {
        findings.push({
          invariant: "class_d_heightened_scrutiny",
          severity: "warning",
          section_keys: ["10_risk_management"],
          message: `Class D: risk register has ${riskRows} rows (expected ≥ 5).`,
        });
      }
    }
  }

  // === [TBD] policy
  let totalTbds = 0;
  for (const s of sections) {
    const tbds = countTbds(s);
    totalTbds += tbds;
    if (tbds >= 5) {
      findings.push({
        invariant: "tbd_density",
        severity: "warning",
        section_keys: [s.section_key],
        message: `Section ${s.section_number} has ${tbds} [TBD] placeholders — Sprint 3 question expansion needed (see matrix gap inventory).`,
      });
    }
  }
  if (totalTbds > 12) {
    findings.push({
      invariant: "tbd_density",
      severity: "warning",
      section_keys: [],
      message: `Document-wide [TBD] count = ${totalTbds}. Matrix threshold is 12.`,
    });
  }

  // === Categorise findings
  const critical = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");
  const gaps = findings.filter((f) => f.severity === "info");
  const totalWords = sections.reduce((sum, s) => sum + s.word_count, 0);

  return {
    passing_count: sections.length - findings.length,
    failing_count: findings.length,
    critical_failures: critical,
    warnings,
    gaps,
    total_word_count: totalWords,
    total_tbd_count: totalTbds,
  };
}
