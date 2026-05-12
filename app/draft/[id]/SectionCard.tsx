"use client";

import {
  SectionRenderer,
  type RenderableSection,
} from "@/components/draft/SectionRenderer";
import { SectionEditor } from "./SectionEditor";
import { useEditCoordinator } from "./EditCoordinator";
import {
  sectionPendingCount,
  sectionStatus,
  type SectionStatus,
} from "./completion";
import { AttachmentZone, type Attachment } from "./AttachmentZone";

type Props = {
  assessmentId: string;
  /** Phase 5.5.D — initial attachment list for this section, loaded
   *  server-side from draft_pack_attachments. */
  attachments?: Attachment[];
  section: RenderableSection;
  /** True iff the customer has an overlay (content_edited is set) per
   *  the server-loaded data. May be overridden client-side after save. */
  hasOverlay: boolean;
  /** Editor's initial buffer: content_edited when present, else AI baseline. */
  initialEditContent: string;
  /** Server-computed status; may be overridden client-side after save. */
  status: SectionStatus;
  /** Server-computed pending-marker count; same override note. */
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
  assessmentId,
  attachments,
  section,
  hasOverlay,
  initialEditContent,
  status,
  pendingCount,
}: Props) {
  const {
    state,
    requestEdit,
    overrides,
    needsInputFields,
    updateNeedsInputField,
  } = useEditCoordinator();
  const isEditing = state.activeKey === section.section_key;

  // Client-side override takes precedence over the server prop. This
  // makes the just-saved content appear instantly without waiting for
  // router.refresh() to round-trip. Same data, just sooner.
  const override = overrides[section.section_key];
  const effectiveContent = override ?? section.content;
  const effectiveHasOverlay = override !== undefined ? true : hasOverlay;
  // Live filled fields for this section drive status + pendingCount
  // alongside the content override so the badge stays accurate while
  // the customer fills marker after marker.
  const filledFields = needsInputFields[section.section_key] ?? {};
  const liveStatus: SectionStatus = sectionStatus(effectiveContent, filledFields);
  const livePendingCount = sectionPendingCount(effectiveContent, filledFields);
  const effectiveStatus =
    override !== undefined || Object.keys(filledFields).length > 0
      ? liveStatus
      : status;
  const effectivePendingCount =
    override !== undefined || Object.keys(filledFields).length > 0
      ? livePendingCount
      : pendingCount;
  const effectiveSection: RenderableSection =
    override !== undefined ? { ...section, content: override } : section;
  // Editor opens with the freshest content we know about.
  const editorInitialContent = override ?? initialEditContent;

  function startEditing() {
    requestEdit(section.section_key, editorInitialContent);
  }

  // Phase 5.5.F — §6 has a special "edit predicate inputs" link
  // that sends customers back to the Tier B wizard where they
  // entered their predicates, plus a footer note about the Sprint 3
  // predicate-DB upgrade. Hardcoded to "06_predicate_comparison"
  // for now; if the section taxonomy ever changes, update here.
  const isPredicateSection = section.section_key === "06_predicate_comparison";

  return (
    <article
      className={`rounded-card bg-[#FDFCF8] border border-[#E8E4D6] ${EDGE_BY_STATUS[effectiveStatus]} px-6 py-6 sm:px-8 sm:py-7`}
    >
      {isEditing ? (
        <SectionEditor
          sectionKey={section.section_key}
          sectionNumber={section.section_number}
          title={section.title}
          isAiBaseline={!effectiveHasOverlay}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={effectiveStatus}
                pendingCount={effectivePendingCount}
              />
              {effectiveHasOverlay ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#FAEEDA] text-[#633806] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#BA7517]"
                    aria-hidden
                  />
                  Customer edited
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {isPredicateSection ? (
                <a
                  href={`/upgrade/${assessmentId}/wizard#b3`}
                  className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-xs font-medium text-[#0F6E56] hover:bg-[#E1F5EE]"
                  title="Edit the predicate devices you entered in the Tier B wizard"
                >
                  Edit predicate inputs ↗
                </a>
              ) : null}
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-xs font-medium text-[#2A3430] hover:bg-[#EFECE3]"
              >
                Edit section
              </button>
            </div>
          </div>
          <SectionRenderer
            section={effectiveSection}
            inlineFields={{
              assessmentId,
              sectionKey: section.section_key,
              filled: filledFields,
              onSaved: (descriptor, value) =>
                updateNeedsInputField(section.section_key, descriptor, value),
            }}
          />
          {isPredicateSection ? (
            <p className="mt-4 rounded-md bg-[#EFECE3] border border-[#E8E4D6] px-4 py-3 text-xs text-[#6B766F] leading-relaxed">
              Searchable predicate database (FDA 510(k) + CDSCO approved
              devices) with side-by-side attribute comparison and a
              substantial-equivalence narrative editor — shipping in
              Sprint 3.
            </p>
          ) : null}
          <AttachmentZone
            assessmentId={assessmentId}
            sectionKey={section.section_key}
            initialAttachments={attachments ?? []}
          />
        </>
      )}
    </article>
  );
}
