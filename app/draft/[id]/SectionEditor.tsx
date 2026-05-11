"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { highlightMarkers } from "@/components/draft/SectionRenderer";

type Props = {
  assessmentId: string;
  sectionKey: string;
  sectionNumber: number;
  title: string;
  /** Current effective content — content_edited if set, else AI baseline. */
  initialContent: string;
  /** True iff this is the AI baseline (i.e. no customer overlay yet). */
  isAiBaseline: boolean;
  onCancel: () => void;
  onSaved: () => void;
};

export function SectionEditor({
  assessmentId,
  sectionKey,
  sectionNumber,
  title,
  initialContent,
  isAiBaseline,
  onCancel,
  onSaved,
}: Props) {
  const [draft, setDraft] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = draft !== initialContent;
  const words = draft.trim() === "" ? 0 : draft.trim().split(/\s+/).length;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/draft/${encodeURIComponent(
          assessmentId
        )}/section/${encodeURIComponent(sectionKey)}/save`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: draft }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="not-prose">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Section {sectionNumber} · Editing
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ink leading-snug">
            {title}
          </h2>
        </div>
        <span
          className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium uppercase tracking-wide ${
            isAiBaseline
              ? "bg-bg-sink text-muted"
              : "bg-amber-light text-amber-deep"
          }`}
        >
          {isAiBaseline ? "AI baseline" : "Customer overlay"}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor={`editor-${sectionKey}`}
            className="block font-mono text-[11px] tracking-widest uppercase text-muted mb-2"
          >
            Markdown
          </label>
          <textarea
            id={`editor-${sectionKey}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck
            className="w-full min-h-[420px] resize-y rounded-md border border-line bg-bg-card px-3 py-3 font-mono text-[13px] leading-relaxed text-ink-2 focus:outline-none focus:ring-2 focus:ring-teal-deep/40"
          />
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            {words.toLocaleString()} words · markdown + GFM tables + raw HTML
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted mb-2">
            Preview
          </p>
          <div className="rounded-md border border-line-soft bg-bg-card px-4 py-3 min-h-[420px] max-h-[640px] overflow-auto">
            <div className="draft-prose font-serif text-base leading-relaxed text-ink-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {highlightMarkers(draft)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-coral-brand bg-coral-light px-4 py-3 text-sm text-coral-brand">
          Save failed: {error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center rounded-md bg-teal-deep px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center rounded-md border border-line bg-bg-card px-4 py-2 text-sm font-medium text-ink-2 hover:bg-bg-sink"
        >
          Cancel
        </button>
        {dirty ? (
          <span className="text-xs text-muted font-mono">unsaved changes</span>
        ) : null}
      </div>
    </div>
  );
}
