/**
 * Phase 5.5.D — per-section doc-type taxonomy.
 *
 * Customer selects one of these when uploading a file to a section.
 * Stored as plain text in draft_pack_attachments.doc_type so we can
 * extend without migrations. The "Other documents" 13th bucket is
 * keyed on section_key = "other" — NOT one of the 12 official MD-7
 * sections — and gets its own short taxonomy.
 */

export const OTHER_BUCKET_SECTION_KEY = "other" as const;

export const DOC_TYPES_BY_SECTION: Record<string, string[]> = {
  "01_executive_summary": ["Cover letter", "Summary memo", "Other"],
  "02_device_description": ["Device datasheet", "Manual", "Drawings", "Other"],
  "03_intended_use": ["Marketing materials", "Use case docs", "Other"],
  "04_classification_grouping": ["Classification rationale", "Other"],
  "05_product_specification": ["Specifications", "BOM", "Test reports", "Other"],
  "06_predicate_comparison": [
    "Predicate datasheet",
    "510(k) summary",
    "CE mark",
    "Other",
  ],
  "07_labelling": ["Label artwork", "IFU", "Packaging", "Other"],
  "08_design_manufacturing": [
    "Design drawings",
    "Manufacturing SOP",
    "QMS docs",
    "Other",
  ],
  "09_essential_principles": ["EP conformity matrix", "Standards applied", "Other"],
  "10_risk_management": [
    "Risk management file",
    "Hazard analysis",
    "ISO 14971 report",
    "Other",
  ],
  "11_verification_validation": [
    "Test protocols",
    "Test reports",
    "Validation reports",
    "Software V&V",
    "Other",
  ],
  "12_clinical_evidence_pms": [
    "Clinical study report",
    "Literature review",
    "Pilot data",
    "PMS plan",
    "Other",
  ],
  [OTHER_BUCKET_SECTION_KEY]: [
    "Supporting document",
    "Reference material",
    "Communication",
    "Other",
  ],
};

export function docTypesFor(sectionKey: string): string[] {
  return DOC_TYPES_BY_SECTION[sectionKey] ?? ["Other"];
}

export function defaultDocTypeFor(sectionKey: string): string {
  return docTypesFor(sectionKey)[0] ?? "Other";
}

export const ATTACHMENT_FILE_LIMITS = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  acceptedMimePrefixes: ["application/pdf", "image/png", "image/jpeg"],
};

export function isAcceptedMime(mime: string | undefined | null): boolean {
  if (!mime) return false;
  return ATTACHMENT_FILE_LIMITS.acceptedMimePrefixes.some((prefix) =>
    mime.startsWith(prefix)
  );
}
