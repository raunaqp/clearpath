import { getChecklist } from "@/lib/completeness/checklist";
import { identifyDocument } from "@/lib/completeness/extractor";
import type {
  CheckerDocument,
  CompletenessResult,
  Inconsistency,
  RequirementCategory,
  RequirementStatus,
} from "@/lib/completeness/types";

export type RunCompletenessInput = {
  category: RequirementCategory;
  documents: CheckerDocument[];
};

// Pure function: given a category + a document list, produce a
// completeness report. No DB access, no env vars — testable without
// any harness setup.
export function runCompletenessCheck(
  input: RunCompletenessInput
): CompletenessResult {
  const catalogue = getChecklist(input.category);

  const reqStatus = new Map<string, RequirementStatus>();
  for (const req of catalogue) {
    reqStatus.set(req.id, {
      id: req.id,
      name: req.name,
      kind: req.kind,
      satisfied: false,
      satisfied_by_document_ids: [],
      missing_fields: [...req.required_fields],
    });
  }

  const matchedDocIds = new Set<string>();

  for (const doc of input.documents) {
    const hits = identifyDocument(doc, catalogue);
    if (hits.length === 0) continue;
    matchedDocIds.add(doc.id);
    for (const reqId of hits) {
      const status = reqStatus.get(reqId);
      if (!status) continue;
      status.satisfied = true;
      status.satisfied_by_document_ids.push(doc.id);
    }
  }

  const per_requirement = [...reqStatus.values()];
  const missing = per_requirement.filter((r) => !r.satisfied);

  // Equal weight per requirement. Note: field-level scoring will land
  // when pdfplumber arrives Wednesday — for now a requirement is
  // either fully satisfied or fully missing.
  const total = per_requirement.length;
  const satisfied = per_requirement.filter((r) => r.satisfied).length;
  const overall_pct =
    total === 0 ? 0 : Math.round((satisfied / total) * 100);

  const unmatched_document_ids = input.documents
    .filter((d) => !matchedDocIds.has(d.id))
    .map((d) => d.id);

  const inconsistencies = detectInconsistencies(
    input.documents,
    per_requirement
  );

  return {
    category: input.category,
    overall_pct,
    per_requirement,
    missing,
    inconsistencies,
    unmatched_document_ids,
    computed_at: new Date().toISOString(),
  };
}

// Lightweight metadata-level inconsistency detection. Real content-level
// checks (date mismatches across PDFs, conflicting field values) require
// pdfplumber and will be added Wednesday.
function detectInconsistencies(
  documents: CheckerDocument[],
  per_requirement: RequirementStatus[]
): Inconsistency[] {
  const out: Inconsistency[] = [];

  // Multiple documents satisfying the same single-instance requirement
  // (e.g. two ISO 13485 certs) — could indicate duplicates or version
  // confusion. Flag as warn so the reviewer can confirm which is current.
  for (const req of per_requirement) {
    if (req.satisfied_by_document_ids.length > 1) {
      out.push({
        id: `multi_${req.id}`,
        message: `Multiple documents satisfy ${req.name} (${req.satisfied_by_document_ids.length}). Confirm which is the current version.`,
        severity: "warn",
        involved_document_ids: req.satisfied_by_document_ids,
      });
    }
  }

  // Versioned document with no parent — likely a tagging mistake.
  for (const doc of documents) {
    if ((doc.version ?? 1) > 1 && !doc.parent_doc_id) {
      out.push({
        id: `orphan_version_${doc.id}`,
        message: `Document ${doc.filename} is tagged as version ${doc.version} but has no parent document reference.`,
        severity: "info",
        involved_document_ids: [doc.id],
      });
    }
  }

  return out;
}
