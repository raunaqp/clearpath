/**
 * Phase 5.5.E — single source of truth for completion state.
 *
 * Equal-weight per the 2026-05-12 lock. A section is complete when:
 *   - displayed content is non-empty AND
 *   - no [NEEDS INPUT: <descriptor>] markers remain AND
 *   - no [TBD] markers remain
 *
 * Drives:
 *   - TOC sidebar dots (green / amber / grey)
 *   - Per-section card border + status badge ("Complete" / "Needs input (N items)")
 *   - Header "Document X% complete · Y items pending"
 */

export type SectionStatus = "complete" | "wip" | "empty";

// Global regexes are stateful across .test() calls (.lastIndex advances).
// Use match-based counting so behaviour is the same on every call.
const NEEDS_INPUT_RE_G = /\[NEEDS INPUT:\s*([^\]]+)\]/g;
const TBD_RE_G = /\[TBD\]/g;

export function sectionStatus(
  content: string | null | undefined,
  filledFields?: Record<string, string>
): SectionStatus {
  if (!content || content.trim() === "") return "empty";
  return sectionPendingCount(content, filledFields) > 0 ? "wip" : "complete";
}

export function sectionPendingCount(
  content: string | null | undefined,
  filledFields?: Record<string, string>
): number {
  if (!content) return 0;
  const niMatches = [...content.matchAll(NEEDS_INPUT_RE_G)];
  let niPending = niMatches.length;
  if (filledFields) {
    for (const m of niMatches) {
      const descriptor = m[1]?.trim();
      if (
        descriptor &&
        Object.prototype.hasOwnProperty.call(filledFields, descriptor) &&
        filledFields[descriptor] !== ""
      ) {
        niPending--;
      }
    }
  }
  const tbd = content.match(TBD_RE_G)?.length ?? 0;
  return niPending + tbd;
}

export type PackCompletion = {
  total: number;
  complete: number;
  wip: number;
  empty: number;
  percent: number;        // 0-100
  totalPending: number;   // sum of pending markers across all sections
};

export function packCompletion(
  sections: Array<{
    content: string | null | undefined;
    filled?: Record<string, string>;
  }>
): PackCompletion {
  let complete = 0;
  let wip = 0;
  let empty = 0;
  let totalPending = 0;
  for (const sec of sections) {
    const s = sectionStatus(sec.content, sec.filled);
    if (s === "complete") complete++;
    else if (s === "wip") wip++;
    else empty++;
    totalPending += sectionPendingCount(sec.content, sec.filled);
  }
  const total = sections.length;
  return {
    total,
    complete,
    wip,
    empty,
    percent: total === 0 ? 0 : Math.round((complete / total) * 100),
    totalPending,
  };
}
