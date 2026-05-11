/**
 * Shared section renderer used by:
 *   - /draft/[id] (browser HTML)
 *   - /draft/[id]?print=1 (Chrome-headless source for PDF v2)
 *
 * Renders ONE section: status badge, heading, markdown body with
 * [TBD] / [NEEDS INPUT: ...] markers highlighted, citations, meta panel.
 *
 * Pure rendering component — no client state, server-renderable.
 * Section-level expand/collapse on the reader page is owned by the parent.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

export type RenderableCitation = {
  citation_id: string;
  source_doc: string;
  quote: string;
  exact_reference: string;
};

export type RenderableSection = {
  section_key: string;
  section_number: number;
  title: string;
  content: string;
  citations: RenderableCitation[];
  completion_status: "draft" | "complete" | "pending" | "failed";
  word_count: number | null;
  meta: {
    generation_strategy?: string | null;
    source_fields?: string[] | null;
    model?: string | null;
    llm_cost_usd?: number | null;
    generated_at?: string | null;
    dry_run?: boolean | null;
    error_message?: string | null;
  } | null;
};

type StatusVisual = { label: string; cls: string };

function statusVisual(status: RenderableSection["completion_status"]): StatusVisual {
  switch (status) {
    case "complete":
      return { label: "Complete", cls: "bg-[#E1F5EE] text-[#0F6E56]" };
    case "failed":
      return { label: "Failed", cls: "bg-[#FAECE7] text-[#993C1D]" };
    case "pending":
      return { label: "Pending", cls: "bg-[#EFECE3] text-[#6B766F]" };
    case "draft":
    default:
      return { label: "Draft", cls: "bg-[#FAEEDA] text-[#633806]" };
  }
}

// Pre-process markdown to wrap [TBD] and [NEEDS INPUT: <desc>] in span
// tags rehype-raw can render. The HTML uses inline styles so it's still
// visible in print/PDF even if Tailwind classes aren't applied to raw HTML.
// Exported so the inline editor's preview pane can reuse identical
// marker rendering.
export function highlightMarkers(md: string): string {
  return md
    .replace(
      /\[NEEDS INPUT:\s*([^\]]+)\]/g,
      (_, descriptor: string) =>
        `<mark class="marker-needs-input" data-descriptor="${escapeAttr(
          descriptor.trim()
        )}" title="Pending input: ${escapeAttr(descriptor.trim())}">[NEEDS INPUT: ${escapeHtml(
          descriptor.trim()
        )}]</mark>`
    )
    .replace(
      /\[TBD\]/g,
      `<mark class="marker-tbd" title="Pending: Sprint 3 follow-up">[TBD]</mark>`
    );
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Props = {
  section: RenderableSection;
  /** Render in PDF-friendly mode: meta panel open, no interactive chrome,
   *  print-safe colors. */
  printMode?: boolean;
};

export function SectionRenderer({ section, printMode = false }: Props) {
  const sv = statusVisual(section.completion_status);
  const processedContent = highlightMarkers(section.content);
  const headingId = `section-${section.section_number}`;

  return (
    <section
      id={headingId}
      data-section-key={section.section_key}
      className={cn(
        "draft-section",
        "scroll-mt-24",
        printMode && "draft-section--print"
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-4 border-b border-[#D9D5C8] pb-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B766F]">
            MD-7 Section {section.section_number.toString().padStart(2, "0")}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-[#0E1411] leading-snug">
            {section.title}
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium uppercase tracking-wide",
            sv.cls
          )}
        >
          {sv.label}
        </span>
      </header>

      {section.completion_status === "failed" && section.meta?.error_message ? (
        <div className="mb-4 rounded-lg border border-[#993C1D] bg-[#FAECE7] px-4 py-3 text-sm text-[#993C1D]">
          <strong>Generation error:</strong> {section.meta.error_message}
        </div>
      ) : null}

      <div className="draft-prose font-serif text-base leading-relaxed text-[#2A3430]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {section.citations.length > 0 ? (
        <div className="mt-6 rounded-card border border-[#E8E4D6] bg-[#FDFCF8] px-4 py-3 text-sm">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#6B766F]">
            References
          </p>
          <ul className="space-y-2">
            {section.citations.map((c) => (
              <li key={c.citation_id} className="text-[#2A3430]">
                <span className="font-medium text-[#0F6E56]">
                  {c.citation_id}
                </span>{" "}
                {c.source_doc}
                {c.exact_reference ? (
                  <span className="text-[#6B766F]">
                    {" — "}
                    <em>{c.exact_reference}</em>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details
        className="mt-4 text-sm text-[#6B766F]"
        // PDF/print pass forces all <details> open via CSS, but we also
        // open them in markup for the print=1 server render so the meta
        // appears even without JS.
        open={printMode || undefined}
      >
        <summary className="cursor-pointer select-none text-xs font-mono uppercase tracking-widest hover:text-[#2A3430]">
          Generation meta
        </summary>
        <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs">
          {section.meta?.generation_strategy ? (
            <>
              <dt className="text-[#6B766F]">strategy</dt>
              <dd className="font-mono text-[#2A3430]">
                {section.meta.generation_strategy}
              </dd>
            </>
          ) : null}
          {section.meta?.model ? (
            <>
              <dt className="text-[#6B766F]">model</dt>
              <dd className="font-mono text-[#2A3430]">{section.meta.model}</dd>
            </>
          ) : null}
          {typeof section.meta?.llm_cost_usd === "number" ? (
            <>
              <dt className="text-[#6B766F]">cost</dt>
              <dd className="font-mono text-[#2A3430]">
                ${section.meta.llm_cost_usd.toFixed(4)}
              </dd>
            </>
          ) : null}
          {section.word_count != null ? (
            <>
              <dt className="text-[#6B766F]">words</dt>
              <dd className="font-mono text-[#2A3430]">{section.word_count}</dd>
            </>
          ) : null}
          {section.meta?.source_fields?.length ? (
            <>
              <dt className="text-[#6B766F]">source fields</dt>
              <dd className="font-mono text-[#2A3430] break-all">
                {section.meta.source_fields.join(", ")}
              </dd>
            </>
          ) : null}
          {section.meta?.generated_at ? (
            <>
              <dt className="text-[#6B766F]">generated</dt>
              <dd className="font-mono text-[#2A3430]">
                {new Date(section.meta.generated_at).toLocaleString()}
              </dd>
            </>
          ) : null}
        </dl>
      </details>
    </section>
  );
}
