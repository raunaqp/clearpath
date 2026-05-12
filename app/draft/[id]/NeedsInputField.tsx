"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  assessmentId: string;
  sectionKey: string;
  descriptor: string;
  initialValue: string | null;
  /** Called after a successful save so the parent can update its local
   *  map of filled values without re-fetching the page. Receives the
   *  new value (or empty string when cleared). */
  onSaved?: (descriptor: string, value: string) => void;
};

/**
 * Phase 5.5.C — one inline-editable NEEDS INPUT marker.
 *
 * Renders as a pill in two visual states:
 *   - filled (teal background, shows the customer's answer)
 *   - unfilled (amber background, shows the descriptor)
 * Click → expands into an inline <input> populated with the current
 * value. Enter saves, Esc cancels, Blur saves.
 */
export function NeedsInputField({
  assessmentId,
  sectionKey,
  descriptor,
  initialValue,
  onSaved,
}: Props) {
  const [value, setValue] = useState<string | null>(initialValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep external initialValue in sync when the server prop changes.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function save(next: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/draft/${encodeURIComponent(
          assessmentId
        )}/needs-input/save`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            section_key: sectionKey,
            descriptor,
            value: next,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      const stored = next.trim() === "" ? null : next;
      setValue(stored);
      setDraft(stored ?? "");
      setEditing(false);
      onSaved?.(descriptor, stored ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Keep editing so customer can retry/correct.
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(value ?? "");
    setEditing(false);
    setError(null);
  }

  // Pill rendering (not editing)
  if (!editing) {
    const isFilled = value !== null && value !== "";
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value ?? "");
          setEditing(true);
        }}
        title={
          isFilled
            ? `Edit "${descriptor}"`
            : `Fill in: ${descriptor}`
        }
        className={`needs-input-pill ${
          isFilled ? "needs-input-pill--filled" : "needs-input-pill--unfilled"
        }`}
      >
        {isFilled ? (
          <span className="needs-input-pill__value">{value}</span>
        ) : (
          <span className="needs-input-pill__placeholder">
            [NEEDS INPUT: {descriptor}]
          </span>
        )}
      </button>
    );
  }

  // Inline editor
  return (
    <span className="needs-input-edit">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          // Save on blur if dirty; otherwise treat as cancel
          if (draft !== (value ?? "") && !saving) {
            void save(draft);
          } else if (!saving) {
            cancel();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save(draft);
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        placeholder={descriptor}
        disabled={saving}
        className="needs-input-edit__input"
      />
      {saving ? (
        <span className="needs-input-edit__saving">saving…</span>
      ) : null}
      {error ? (
        <span className="needs-input-edit__error" title={error}>
          ⚠ {error}
        </span>
      ) : null}
    </span>
  );
}
