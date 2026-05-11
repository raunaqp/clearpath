"use client";

import {
  SectionRenderer,
  type RenderableSection,
} from "@/components/draft/SectionRenderer";
import { SectionEditor } from "./SectionEditor";
import { useEditCoordinator } from "./EditCoordinator";
import type { SectionStatus } from "./completion";

type Props = {
  section: RenderableSection;
  /** True iff the customer has an overlay (content_edited is set). */
  hasOverlay: boolean;
  /** Editor's initial buffer: content_edited when present, else AI baseline. */
  initialEditContent: string;
  /** Phase 5.5.E — empty / wip / complete drives the left-edge tint
   *  and the per-section status badge. */
  status: SectionStatus;
  /** Pending-marker count for the "Needs input (N items)" badge. */
  pendingCount: number;
};

const EDGE_BY_STATUS: Record<SectionStatus, string> = {
  complete: "border-l-4 border-l-[#0F6E56]",
  wip:      "border-l-4 border-l-[#BA7517]",
  empty:    "border-l-4 border-l-[#D9D5C8]",
};

function StatusBadge({
  status,
  pendingCount,
}: {
  status: SectionStatus;
  pendingCount: number;
}) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#E1F5EE] text-[#0F6E56] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0F6E56]" aria-hidden />
        Complete
      </span>
    );
  }
  if (status === "wip") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#FAEEDA] text-[#633806] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
        <span className="h-1.5 w-1.5 rounded-full bg-[#BA7517]" aria-hidden />
        Needs input
        {pendingCount > 0 ? ` (${pendingCount})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#EFECE3] text-[#6B766F] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
      <span className="h-1.5 w-1.5 rounded-full bg-[#6B766F]" aria-hidden />
      Empty
    </span>
  );
}

export function SectionCard({
  section,
  hasOverlay,
  initialEditContent,
  status,
  pendingCount,
}: Props) {
  const { state, requestEdit } = useEditCoordinator();
  const isEditing = state.activeKey === section.section_key;

  function startEditing() {
    requestEdit(section.section_key, initialEditContent);
  }

  return (
    <article
      className={`rounded-card bg-[#FDFCF8] border border-[#E8E4D6] ${EDGE_BY_STATUS[status]} px-6 py-6 sm:px-8 sm:py-7`}
    >
      {isEditing ? (
        <SectionEditor
          sectionKey={section.section_key}
          sectionNumber={section.section_number}
          title={section.title}
          isAiBaseline={!hasOverlay}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={status} pendingCount={pendingCount} />
              {hasOverlay ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#FAEEDA] text-[#633806] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#BA7517]"
                    aria-hidden
                  />
                  Customer edited
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-xs font-medium text-[#2A3430] hover:bg-[#EFECE3]"
            >
              Edit section
            </button>
          </div>
          <SectionRenderer section={section} />
        </>
      )}
    </article>
  );
}
