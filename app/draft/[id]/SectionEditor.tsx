"use client";

import { useEditCoordinator } from "./EditCoordinator";

type Props = {
  sectionKey: string;
  sectionNumber: number;
  title: string;
  isAiBaseline: boolean;
};

/**
 * Sprint 2 Story 2.5 Phase 5.5.B (revised) — plain-textarea editor.
 *
 * The customer edits raw markdown directly. No live preview — view
 * mode renders formatted after save. Editor draft + save lifecycle
 * lives in EditCoordinator so only one section can be open at a
 * time and a modal fires on cross-section navigation with unsaved
 * changes.
 */
export function SectionEditor({
  sectionKey,
  sectionNumber,
  title,
  isAiBaseline,
}: Props) {
  const { state, dirty, setDraft, save, cancel } = useEditCoordinator();
  if (state.activeKey !== sectionKey) return null;

  const words =
    state.draft.trim() === "" ? 0 : state.draft.trim().split(/\s+/).length;

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

      <label
        htmlFor={`editor-${sectionKey}`}
        className="sr-only"
      >
        Section markdown
      </label>
      <textarea
        id={`editor-${sectionKey}`}
        value={state.draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck
        autoFocus
        className="w-full min-h-[520px] resize-y rounded-md border border-line bg-bg-card px-4 py-3 font-mono text-[13.5px] leading-relaxed text-ink-2 focus:outline-none focus:ring-2 focus:ring-teal-deep/40"
      />

      <p className="mt-2 text-xs text-muted leading-relaxed">
        Use Markdown for formatting:{" "}
        <code className="font-mono text-ink-2">#</code> H1,{" "}
        <code className="font-mono text-ink-2">##</code> H2,{" "}
        <code className="font-mono text-ink-2">**bold**</code>,{" "}
        <code className="font-mono text-ink-2">*italic*</code>,{" "}
        <code className="font-mono text-ink-2">- lists</code>. The section
        renders formatted when you save.
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted">
        {words.toLocaleString()} words
        {dirty ? " · unsaved changes" : ""}
      </p>

      {state.error ? (
        <div className="mt-4 rounded-md border border-coral-brand bg-coral-light px-4 py-3 text-sm text-coral-brand">
          Save failed: {state.error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || state.saving}
          className="inline-flex items-center rounded-md bg-teal-deep px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={state.saving}
          className="inline-flex items-center rounded-md border border-line bg-bg-card px-4 py-2 text-sm font-medium text-ink-2 hover:bg-bg-sink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
