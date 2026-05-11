"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SectionRenderer,
  type RenderableSection,
} from "@/components/draft/SectionRenderer";
import { SectionEditor } from "./SectionEditor";

type Props = {
  assessmentId: string;
  section: RenderableSection;
  /** True iff the customer has an overlay (i.e. content_edited is set). */
  hasOverlay: boolean;
  /** Editor's initial buffer. Equals content_edited when present, else the
   *  AI baseline content. */
  initialEditContent: string;
};

export function SectionCard({
  assessmentId,
  section,
  hasOverlay,
  initialEditContent,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  function startEditing() {
    setEditing(true);
  }
  function cancel() {
    setEditing(false);
  }
  function onSaved() {
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <article className="rounded-card bg-bg-card border border-line-soft px-6 py-6 sm:px-8 sm:py-7">
        <SectionEditor
          assessmentId={assessmentId}
          sectionKey={section.section_key}
          sectionNumber={section.section_number}
          title={section.title}
          initialContent={initialEditContent}
          isAiBaseline={!hasOverlay}
          onCancel={cancel}
          onSaved={onSaved}
        />
      </article>
    );
  }

  return (
    <article className="rounded-card bg-bg-card border border-line-soft px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        {hasOverlay ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-amber-light text-amber-deep px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-brand" aria-hidden />
            Customer edited
          </span>
        ) : (
          <span aria-hidden />
        )}
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex items-center rounded-md border border-line bg-bg-card px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-bg-sink"
        >
          Edit section
        </button>
      </div>
      <SectionRenderer section={section} />
    </article>
  );
}
