"use client";

/**
 * Phase B Item 2 follow-up — the header completion strip on
 * /draft/[id] was server-rendered from packCompletion at request time
 * and never refreshed, so editing a section / filling a NEEDS-INPUT
 * marker bumped the in-section badge to "Complete" but left the
 * header still reading the old percentage.
 *
 * Same root cause as the TOC dot: server snapshot vs live
 * EditCoordinator state. Same fix shape: recompute on the client from
 * the same overrides + filledFields the SectionCard uses.
 */

import {
  packCompletion,
  type PackCompletion,
} from "./completion";
import { useEditCoordinator } from "./EditCoordinator";

type Section = {
  sectionKey: string;
  /** Server-baseline content (content_edited overlay if present,
   *  else AI baseline). Same string SectionCard receives. */
  content: string;
};

export function LiveCompletionStrip({
  sections,
  initial,
}: {
  sections: Section[];
  /** Server-rendered packCompletion. Used as the first paint and as
   *  the fallback when no client overrides have happened yet. */
  initial: PackCompletion;
}) {
  const { overrides, needsInputFields } = useEditCoordinator();

  // Recompute against the live state. Cheap — 12 small regex scans.
  // Fall back to the server snapshot when no live signal has fired
  // so the first paint matches what the server rendered.
  const liveSignal =
    Object.keys(overrides).length > 0 ||
    Object.keys(needsInputFields).length > 0;
  const completion = liveSignal
    ? packCompletion(
        sections.map((s) => ({
          content: overrides[s.sectionKey] ?? s.content,
          filled: needsInputFields[s.sectionKey] ?? {},
        }))
      )
    : initial;

  return (
    <div
      className="mt-5 flex flex-wrap items-center gap-3 text-sm"
      title={`${completion.complete} of ${completion.total} sections complete · ${completion.wip} need input · ${completion.empty} empty · ${completion.totalPending} pending marker${completion.totalPending === 1 ? "" : "s"} total`}
    >
      <div className="inline-flex items-center gap-2 rounded-pill bg-[#FDFCF8] border border-[#E8E4D6] px-3 py-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[#0F6E56]"
          aria-hidden
        />
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B766F]">
          Document
        </span>
        <span className="font-medium text-[#0E1411]">
          {completion.percent}% complete
        </span>
      </div>
      <span className="text-xs text-[#6B766F] font-mono">
        {completion.complete}/{completion.total} sections ·{" "}
        {completion.totalPending} item
        {completion.totalPending === 1 ? "" : "s"} pending
      </span>
    </div>
  );
}
