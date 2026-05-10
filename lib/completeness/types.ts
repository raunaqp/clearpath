// Shared types for the completeness checker (Module 2).

export type RequirementCategory =
  | "class_a_b"
  | "class_c_d"
  | "samd_class_a_b"
  | "samd_class_c_d";

export type RequirementKind = "form" | "supporting_doc";

export type Requirement = {
  /** Stable identifier used for matching + output. */
  id: string;
  /** Human-readable label shown to the reviewer. */
  name: string;
  kind: RequirementKind;
  /**
   * doc_type values that satisfy this requirement (case-insensitive).
   * Filename keyword fallbacks are checked too.
   */
  alias_doc_types: string[];
  /**
   * Filename substrings that mark this requirement as satisfied if no
   * doc_type alias hits. Keep these specific to avoid false positives.
   */
  filename_hints: string[];
  /**
   * Field-level checks are deferred to Wed AM (pdfplumber sidecar).
   * For now the array is empty — the form/doc is "present or missing"
   * at the metadata level only.
   */
  required_fields: string[];
};

export type Checklist = Record<RequirementCategory, Requirement[]>;

// Subset of the documents row needed by the checker. Keeps the function
// pure and DB-agnostic — tests pass these directly.
export type CheckerDocument = {
  id: string;
  doc_type?: string | null;
  filename: string;
  version?: number;
  parent_doc_id?: string | null;
};

export type RequirementStatus = {
  id: string;
  name: string;
  kind: RequirementKind;
  /** Whether at least one document matched this requirement. */
  satisfied: boolean;
  /** Document ids that satisfied this requirement. */
  satisfied_by_document_ids: string[];
  /** Field-level gaps (always empty until pdfplumber lands). */
  missing_fields: string[];
};

export type Inconsistency = {
  /** Stable id so the dashboard can dedupe. */
  id: string;
  message: string;
  severity: "info" | "warn" | "error";
  involved_document_ids: string[];
};

export type CompletenessResult = {
  category: RequirementCategory;
  /** 0-100 integer. Equal weight per requirement. */
  overall_pct: number;
  per_requirement: RequirementStatus[];
  /** Subset of per_requirement where satisfied === false. */
  missing: RequirementStatus[];
  inconsistencies: Inconsistency[];
  /** Document ids that didn't satisfy any requirement (extra/unknown docs). */
  unmatched_document_ids: string[];
  computed_at: string;
};
