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

  const saveBtnClasses =
    "inline-flex items-center rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-50 disabled:cursor-not-allowed";
  const cancelBtnClasses =
    "inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-sm font-medium text-[#2A3430] hover:bg-[#EFECE3]";

  return (
    <div className="not-prose">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#D9D5C8] pb-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B766F]">
            MD-7 Section {sectionNumber.toString().padStart(2, "0")} · Editing
          </p>
          <h2 className="mt-1 font-serif text-2xl text-[#0E1411] leading-snug">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium uppercase tracking-wide ${
              isAiBaseline
                ? "bg-[#EFECE3] text-[#6B766F]"
                : "bg-[#FAEEDA] text-[#633806]"
            }`}
          >
            {isAiBaseline ? "AI baseline" : "Customer overlay"}
          </span>
          <button
            type="button"
            onClick={cancel}
            disabled={state.saving}
            className={cancelBtnClasses}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || state.saving}
            className={saveBtnClasses}
          >
            {state.saving ? "Saving…" : "Save"}
          </button>
        </div>
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
        className="w-full min-h-[520px] resize-y rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-4 py-3 font-mono text-[13.5px] leading-relaxed text-[#2A3430] focus:outline-none focus:ring-2 focus:ring-teal-deep/40"
      />

      <p className="mt-2 text-xs text-[#6B766F] leading-relaxed">
        Use Markdown for formatting:{" "}
        <code className="font-mono text-[#2A3430]">#</code> H1,{" "}
        <code className="font-mono text-[#2A3430]">##</code> H2,{" "}
        <code className="font-mono text-[#2A3430]">**bold**</code>,{" "}
        <code className="font-mono text-[#2A3430]">*italic*</code>,{" "}
        <code className="font-mono text-[#2A3430]">- lists</code>. The section
        renders formatted when you save.
      </p>
      <p className="mt-1 font-mono text-[11px] text-[#6B766F]">
        {words.toLocaleString()} words
        {dirty ? " · unsaved changes" : ""}
      </p>

      {state.error ? (
        <div className="mt-4 rounded-md border border-[#993C1D] bg-[#FAECE7] px-4 py-3 text-sm text-[#993C1D]">
          Save failed: {state.error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || state.saving}
          className="inline-flex items-center rounded-md bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={state.saving}
          className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-4 py-2 text-sm font-medium text-[#2A3430] hover:bg-[#EFECE3]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
