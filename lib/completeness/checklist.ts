import type { Checklist, Requirement } from "@/lib/completeness/types";

// Source of truth for CDSCO submission requirements.
//
// Originally authored in the cdsco-reviewer-tool repo. ClearPath ports
// the file verbatim so the Tier 0 readiness card, the Tier 2 draft pack,
// and the reviewer dashboard all reference the same registry. If the
// CDSCO repo updates this list, ClearPath must mirror the change (and
// vice versa) — this is intentionally not extracted to a shared package
// yet because the registry is small and divergence costs more than the
// occasional sync. See docs/specs/clearpath_completeness_spec.md.
//
// Field-level requirements (required_fields) are kept as empty arrays
// for now. Wednesday's pdfplumber sidecar will fill them in: e.g. MD-7
// requires "name of manufacturer", "site address", etc. For now the
// checker reports presence at the document level.

const FORM_MD_3: Requirement = {
  id: "MD-3",
  name: "MD-3: Application for licence to manufacture (Class A/B)",
  kind: "form",
  alias_doc_types: ["md-3", "md_3", "md3", "form_md3"],
  filename_hints: ["md-3", "md_3", "md3"],
  required_fields: [],
};

const FORM_MD_7: Requirement = {
  id: "MD-7",
  name: "MD-7: Application for licence to manufacture (Class C/D)",
  kind: "form",
  alias_doc_types: ["md-7", "md_7", "md7", "form_md7"],
  filename_hints: ["md-7", "md_7", "md7"],
  required_fields: [],
};

const DOC_DMF: Requirement = {
  id: "device_master_record",
  name: "Device Master Record / DMF",
  kind: "supporting_doc",
  alias_doc_types: ["device_master_record", "dmf", "device_master_file"],
  filename_hints: ["dmf", "device_master_record", "master_record"],
  required_fields: [],
};

const DOC_ISO_13485: Requirement = {
  id: "iso_13485_cert",
  name: "ISO 13485 quality system certificate",
  kind: "supporting_doc",
  alias_doc_types: ["iso_13485_cert", "iso_13485", "iso13485", "qms_cert"],
  filename_hints: ["iso_13485", "iso13485", "qms"],
  required_fields: [],
};

const DOC_RISK_MGMT: Requirement = {
  id: "risk_management_file",
  name: "Risk Management File (ISO 14971)",
  kind: "supporting_doc",
  alias_doc_types: ["risk_management_file", "iso_14971", "risk_management"],
  filename_hints: ["risk_management", "iso_14971", "iso14971", "rmf"],
  required_fields: [],
};

const DOC_CER: Requirement = {
  id: "clinical_evaluation_report",
  name: "Clinical Evaluation Report",
  kind: "supporting_doc",
  alias_doc_types: ["clinical_evaluation_report", "cer", "clinical_eval"],
  filename_hints: ["clinical_eval", "cer_", "clinical_evaluation"],
  required_fields: [],
};

const DOC_ESSENTIAL_PRINCIPLES: Requirement = {
  id: "essential_principles",
  name: "Essential Principles checklist",
  kind: "supporting_doc",
  alias_doc_types: ["essential_principles", "ep_checklist"],
  filename_hints: ["essential_principles", "ep_checklist"],
  required_fields: [],
};

const DOC_IFU: Requirement = {
  id: "ifu",
  name: "Instructions for Use (IFU)",
  kind: "supporting_doc",
  alias_doc_types: ["ifu", "instructions_for_use", "user_manual"],
  filename_hints: ["ifu", "instructions_for_use", "user_manual"],
  required_fields: [],
};

const DOC_TEST_REPORTS: Requirement = {
  id: "test_reports",
  name: "Test Reports",
  kind: "supporting_doc",
  alias_doc_types: ["test_reports", "test_report", "verification_reports"],
  filename_hints: ["test_report", "test_reports", "verification"],
  required_fields: [],
};

const DOC_IEC_62304: Requirement = {
  id: "iec_62304",
  name: "IEC 62304 software lifecycle compliance",
  kind: "supporting_doc",
  alias_doc_types: ["iec_62304", "software_lifecycle", "iec62304"],
  filename_hints: ["iec_62304", "iec62304", "software_lifecycle"],
  required_fields: [],
};

const DOC_ALGORITHM_CHANGE_PROTOCOL: Requirement = {
  id: "algorithm_change_protocol",
  name: "Algorithm Change Protocol (for adaptive AI)",
  kind: "supporting_doc",
  alias_doc_types: ["algorithm_change_protocol", "acp"],
  filename_hints: ["algorithm_change_protocol", "acp_", "_acp"],
  required_fields: [],
};

const CLASS_A_B_BASE: Requirement[] = [
  FORM_MD_3,
  DOC_DMF,
  DOC_ISO_13485,
  DOC_IFU,
];

const CLASS_C_D_BASE: Requirement[] = [
  FORM_MD_7,
  DOC_DMF,
  DOC_ISO_13485,
  DOC_RISK_MGMT,
  DOC_CER,
  DOC_ESSENTIAL_PRINCIPLES,
  DOC_IFU,
  DOC_TEST_REPORTS,
];

const SAMD_OVERLAY: Requirement[] = [DOC_IEC_62304, DOC_ALGORITHM_CHANGE_PROTOCOL];

export const CHECKLIST: Checklist = {
  class_a_b: CLASS_A_B_BASE,
  class_c_d: CLASS_C_D_BASE,
  samd_class_a_b: [...CLASS_A_B_BASE, ...SAMD_OVERLAY],
  samd_class_c_d: [...CLASS_C_D_BASE, ...SAMD_OVERLAY],
};

export function getChecklist(
  category: keyof Checklist
): Requirement[] {
  return CHECKLIST[category];
}
