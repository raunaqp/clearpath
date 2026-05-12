"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditCoordinator } from "./EditCoordinator";

type Props = {
  sectionKey: string;
  sectionNumber: number;
  title: string;
  isAiBaseline: boolean;
};

const GAP_RE = /\[NEEDS INPUT:[^\]]*\]|\[TBD\]/g;

/**
 * Sprint 2 Story 2.5 Phase 5.5.B (revised) — plain-textarea editor.
 *
 * The customer edits raw markdown directly. No live preview — view
 * mode renders formatted after save. Editor draft + save lifecycle
 * lives in EditCoordinator so only one section can be open at a
 * time and a modal fires on cross-section navigation with unsaved
 * changes.
 *
 * Find-next-gap button cycles the cursor through [NEEDS INPUT: …]
 * and [TBD] markers so the customer can fill them without scanning.
 */
export function SectionEditor({
  sectionKey,
  sectionNumber,
  title,
  isAiBaseline,
}: Props) {
  const { state, dirty, setDraft, save, cancel } = useEditCoordinator();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [gapCursor, setGapCursor] = useState<number>(-1);

  // All gap positions in the current draft. Recomputed every keystroke.
  const gaps = useMemo(() => {
    const out: Array<{ start: number; end: number }> = [];
    if (!state.draft) return out;
    GAP_RE.lastIndex = 0;
    let m;
    while ((m = GAP_RE.exec(state.draft)) !== null) {
      out.push({ start: m.index, end: m.index + m[0].length });
    }
    return out;
  }, [state.draft]);

  if (state.activeKey !== sectionKey) return null;

  const words =
    state.draft.trim() === "" ? 0 : state.draft.trim().split(/\s+/).length;

  function findNextGap() {
    if (gaps.length === 0) return;
    const next = (gapCursor + 1) % gaps.length;
    setGapCursor(next);
    // DOM mutation (focus + setSelectionRange + scrollTop) is deferred
    // to a useEffect below — running it synchronously here loses the
    // selection on the controlled-input re-render that follows state.
  }

  // Apply focus/selection/scroll AFTER the React commit, so the
  // textarea's value reconciliation doesn't blow away the selection.
  //
  // Scroll calculation uses a mirror <div> styled identically to the
  // textarea — measuring offsetTop of a marker span gives us the
  // marker's true visual top accounting for soft wraps, which the
  // naive '\n'-split approach misses entirely on long lines.
  useEffect(() => {
    if (gapCursor < 0 || gapCursor >= gaps.length) return;
    const g = gaps[gapCursor];
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(g.start, g.end);

    const computed = window.getComputedStyle(ta);
    const mirror = document.createElement("div");
    const props: (keyof CSSStyleDeclaration)[] = [
      "boxSizing",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
      "tabSize",
    ];
    for (const p of props) {
      const v = computed.getPropertyValue(
        // Convert camelCase to dash-case for getPropertyValue
        String(p).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())
      );
      if (v) mirror.style.setProperty(String(p as string), v);
    }
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.width = `${ta.clientWidth}px`;
    mirror.style.height = "auto";
    mirror.style.top = "0";
    mirror.style.left = "0";

    mirror.textContent = state.draft.slice(0, g.start);
    const markerSpan = document.createElement("span");
    markerSpan.textContent = state.draft.slice(g.start, g.end) || ".";
    mirror.appendChild(markerSpan);

    document.body.appendChild(mirror);
    const markerTop = markerSpan.offsetTop;
    document.body.removeChild(mirror);

    const margin = 60;
    ta.scrollTop = Math.max(0, markerTop - margin);
  }, [gapCursor, gaps, state.draft]);

  const saveBtnClasses =
    "inline-flex items-center rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-50 disabled:cursor-not-allowed";
  const cancelBtnClasses =
    "inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-sm font-medium text-[#2A3430] hover:bg-[#EFECE3]";
  const gapBtnClasses =
    "inline-flex items-center rounded-md border border-[#BA7517]/40 bg-[#FAEEDA] px-3 py-1.5 text-sm font-medium text-[#633806] hover:bg-[#F5E2BC] disabled:opacity-50 disabled:cursor-not-allowed";

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
            onClick={findNextGap}
            disabled={gaps.length === 0}
            className={gapBtnClasses}
            title={
              gaps.length === 0
                ? "No [NEEDS INPUT] or [TBD] markers in this section"
                : "Jump cursor to the next gap marker"
            }
          >
            Find next gap{" "}
            {gaps.length > 0
              ? gapCursor >= 0
                ? `(${gapCursor + 1}/${gaps.length})`
                : `(${gaps.length})`
              : "(0)"}
          </button>
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

      <label htmlFor={`editor-${sectionKey}`} className="sr-only">
        Section markdown
      </label>
      <textarea
        ref={textareaRef}
        id={`editor-${sectionKey}`}
        value={state.draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck
        autoFocus
        className="w-full min-h-[520px] resize-y rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-4 py-3 font-mono text-[13.5px] leading-relaxed text-[#2A3430] focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/40"
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
        {gaps.length > 0
          ? ` · ${gaps.length} gap${gaps.length === 1 ? "" : "s"} remaining`
          : ""}
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
