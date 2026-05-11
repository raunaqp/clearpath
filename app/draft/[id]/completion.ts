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
const NEEDS_INPUT_RE_G = /\[NEEDS INPUT:[^\]]*\]/g;
const TBD_RE_G = /\[TBD\]/g;

export function sectionStatus(content: string | null | undefined): SectionStatus {
  if (!content || content.trim() === "") return "empty";
  return sectionPendingCount(content) > 0 ? "wip" : "complete";
}

export function sectionPendingCount(content: string | null | undefined): number {
  if (!content) return 0;
  const ni = content.match(NEEDS_INPUT_RE_G)?.length ?? 0;
  const tbd = content.match(TBD_RE_G)?.length ?? 0;
  return ni + tbd;
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
  contents: Array<string | null | undefined>
): PackCompletion {
  let complete = 0;
  let wip = 0;
  let empty = 0;
  let totalPending = 0;
  for (const c of contents) {
    const s = sectionStatus(c);
    if (s === "complete") complete++;
    else if (s === "wip") wip++;
    else empty++;
    totalPending += sectionPendingCount(c);
  }
  const total = contents.length;
  return {
    total,
    complete,
    wip,
    empty,
    percent: total === 0 ? 0 : Math.round((complete / total) * 100),
    totalPending,
  };
}
