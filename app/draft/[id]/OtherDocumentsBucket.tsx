"use client";

/**
 * Phase 5.5.D — "Other documents" 13th bucket.
 *
 * NOT one of the 12 official MD-7 sections; this is a catch-all for
 * supporting files (correspondence, references, etc.) the customer
 * wants attached to the pack but that don't map cleanly to a section.
 *
 * Visual treatment: deliberately understated — gray header, no left-
 * edge color stripe — to signal it's a non-canonical container.
 */
import { AttachmentZone, type Attachment } from "./AttachmentZone";
import { OTHER_BUCKET_SECTION_KEY } from "@/lib/attachments/doc-types";

type Props = {
  assessmentId: string;
  initialAttachments: Attachment[];
};

export function OtherDocumentsBucket({
  assessmentId,
  initialAttachments,
}: Props) {
  return (
    <article className="rounded-card bg-[#EFECE3] border border-[#D9D5C8] border-l-4 border-l-[#6B766F] px-6 py-6 sm:px-8 sm:py-7 mt-6">
      <header className="mb-3 flex items-start justify-between gap-3 border-b border-[#D9D5C8] pb-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B766F]">
            Supplementary
          </p>
          <h2 className="mt-1 font-serif text-xl text-[#2A3430] leading-snug">
            Other documents
          </h2>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-pill bg-[#FDFCF8] text-[#6B766F] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest border border-[#D9D5C8]"
          title="Not tied to a specific MD-7 section"
        >
          Not a section
        </span>
      </header>
      <p className="text-sm text-[#6B766F] mb-3 leading-relaxed">
        For files that don&apos;t belong to a specific MD-7 section —
        e-mail threads, reference materials, exploratory drafts. These
        are attached to the pack as supporting evidence but won&apos;t
        appear in the generated PDF as their own section.
      </p>
      <AttachmentZone
        assessmentId={assessmentId}
        sectionKey={OTHER_BUCKET_SECTION_KEY}
        initialAttachments={initialAttachments}
      />
    </article>
  );
}
