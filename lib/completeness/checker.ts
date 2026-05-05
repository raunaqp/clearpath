/**
 * Completeness checker — ported from cdsco-reviewer-tool/lib/completeness/checker.ts
 * with one ClearPath-specific extension: signal supplementation.
 *
 * # Two layers
 *
 *   1. Document-match (CDSCO repo logic) — strong evidence from uploads
 *   2. Signal supplement — weaker evidence from readiness dimensions,
 *      flagged distinctly so the founder isn't misled
 *
 * # Why ClearPath needs the second layer
 *
 * The CDSCO reviewer tool runs against applicants who have uploaded a full
 * dossier (~50 PDFs). ClearPath's Tier 1 free flow runs against founders
 * who typed a one-liner and answered 7 wizard questions; most uploads are
 * 0-3 PDFs. Without signal supplementation, every Tier 1 card would say
 * "0 of 8 documents in place" — technically correct, but misses the
 * founder's claim of ISO 13485 in progress, V&V protocols on the website, etc.
 *
 * Signal-satisfied requirements are marked with `satisfied_by_document_ids:
 * ['signal:<dimension_name>']` so the card UI can render them differently
 * (e.g. "claimed, not verified" rather than "uploaded").
 */

import { getChecklist } from "@/lib/completeness/checklist";
import { identifyDocument } from "@/lib/completeness/extractor";
import type {
  CheckerDocument,
  CompletenessResult,
  Inconsistency,
  RequirementCategory,
  RequirementStatus,
} from "@/lib/completeness/types";

export type SignalSupplement = {
  quality_system: 0 | 1 | 2;
  technical_docs: 0 | 1 | 2;
  clinical_evidence: 0 | 1 | 2;
  submission_maturity: 0 | 1 | 2;
};

export type RunCompletenessInput = {
  category: RequirementCategory;
  documents: CheckerDocument[];
  /**
   * Optional readiness dimensions. When provided, requirements that the
   * founder claims (dim === 2) get marked as satisfied by signal.
   * Pass null for strict document-only matching.
   */
  signal_supplement?: SignalSupplement | null;
};

// Conservative mapping: only fires on dim === 2 (strong claim), never on
// dim === 1 (in-progress). Keeps the count from drifting upward.
const SIGNAL_TO_REQUIREMENTS: Record<keyof SignalSupplement, string[]> = {
  quality_system: ["iso_13485_cert", "iec_62304"],
  technical_docs: ["device_master_record", "test_reports"],
  clinical_evidence: ["clinical_evaluation_report", "risk_management_file"],
  submission_maturity: ["MD-3", "MD-7"],
};

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

  // Layer 1: document-match
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

  // Layer 2: signal supplement (only when dim === 2)
  if (input.signal_supplement) {
    for (const [dim, requirementIds] of Object.entries(SIGNAL_TO_REQUIREMENTS)) {
      const score = input.signal_supplement[dim as keyof SignalSupplement];
      if (score !== 2) continue;
      for (const reqId of requirementIds) {
        const status = reqStatus.get(reqId);
        if (!status || status.satisfied) continue;
        status.satisfied = true;
        status.satisfied_by_document_ids.push(`signal:${dim}`);
      }
    }
  }

  const per_requirement = [...reqStatus.values()];
  const missing = per_requirement.filter((r) => !r.satisfied);

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

function detectInconsistencies(
  documents: CheckerDocument[],
  per_requirement: RequirementStatus[]
): Inconsistency[] {
  const out: Inconsistency[] = [];

  for (const req of per_requirement) {
    // Only flag duplicate real uploads, not signals.
    const realDocs = req.satisfied_by_document_ids.filter(
      (id) => !id.startsWith("signal:")
    );
    if (realDocs.length > 1) {
      out.push({
        id: `multi_${req.id}`,
        message: `Multiple documents satisfy ${req.name} (${realDocs.length}). Confirm which is the current version.`,
        severity: "warn",
        involved_document_ids: realDocs,
      });
    }
  }

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
