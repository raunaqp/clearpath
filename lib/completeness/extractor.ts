import type {
  CheckerDocument,
  Requirement,
} from "@/lib/completeness/types";

// Tonight's "extractor" is metadata-only: it inspects doc_type and
// filename to identify which requirement(s) a document satisfies.
//
// Wednesday's pdfplumber sidecar will replace this with real PDF text
// extraction (field-level presence checks). The signature stays the
// same so the upgrade is local to this file.

function normaliseDocType(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

function normaliseFilename(value: string): string {
  return value.trim().toLowerCase();
}

/** Returns the ids of requirements this document plausibly satisfies. */
export function identifyDocument(
  doc: CheckerDocument,
  catalogue: Requirement[]
): string[] {
  const docType = normaliseDocType(doc.doc_type);
  const filename = normaliseFilename(doc.filename);

  const hits: string[] = [];

  for (const req of catalogue) {
    const docTypeHit =
      !!docType &&
      req.alias_doc_types.some(
        (alias) => normaliseDocType(alias) === docType
      );

    const filenameHit =
      !docTypeHit &&
      req.filename_hints.some((hint) =>
        filename.includes(hint.toLowerCase())
      );

    if (docTypeHit || filenameHit) {
      hits.push(req.id);
    }
  }

  return hits;
}
