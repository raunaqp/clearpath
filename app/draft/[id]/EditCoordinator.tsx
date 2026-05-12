"use client";

/**
 * Sprint 2 Story 2.5 Phase 5.5.B (revised) — section-edit coordinator.
 *
 * Hoists edit state out of individual SectionCards so we can enforce
 * "only one section editing at a time" and prompt the user when they
 * try to switch sections with unsaved changes.
 *
 * Public API (via useEditCoordinator()):
 *   - activeKey            current section in edit mode, or null
 *   - draft                current editor buffer (only relevant when active)
 *   - dirty                draft !== initial
 *   - saving               POST in flight
 *   - error                last save error, if any
 *   - requestEdit(key, initial)   ask to enter edit on `key`
 *                          if another section is editing AND dirty,
 *                          fires the modal instead of swapping
 *   - setDraft(value)      update buffer
 *   - save()               POST the buffer; on success, clears state
 *   - cancel()             close the editor; if dirty, fires modal
 *
 * Modal lives at provider root, rendered as a fixed overlay.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PendingAction =
  | { kind: "switch"; targetKey: string; targetInitial: string }
  | { kind: "cancel" }
  | null;

type EditState = {
  activeKey: string | null;
  initial: string;
  draft: string;
  saving: boolean;
  error: string | null;
};

type CoordinatorApi = {
  state: EditState;
  dirty: boolean;
  requestEdit: (key: string, initial: string) => void;
  setDraft: (value: string) => void;
  save: () => Promise<void>;
  cancel: () => void;
  /** Client-side overlay map: section_key → just-saved content. SectionCard
   *  prefers this over its server prop while the background refresh
   *  catches up. Persists for the life of the page; cleared by reload. */
  overrides: Record<string, string>;
  /** Phase 5.5.C — section_key → descriptor → filled value. Server-
   *  hydrated initial value; inline NeedsInputField saves bump it via
   *  updateNeedsInputField so TOC dots + completion % stay in sync. */
  needsInputFields: Record<string, Record<string, string>>;
  updateNeedsInputField: (
    sectionKey: string,
    descriptor: string,
    value: string
  ) => void;
};

const Ctx = createContext<CoordinatorApi | null>(null);

export function useEditCoordinator(): CoordinatorApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEditCoordinator must be used inside provider");
  return c;
}

export function EditCoordinatorProvider({
  assessmentId,
  initialNeedsInputFields,
  children,
}: {
  assessmentId: string;
  initialNeedsInputFields?: Record<string, Record<string, string>>;
  children: ReactNode;
}) {
  const [state, setState] = useState<EditState>({
    activeKey: null,
    initial: "",
    draft: "",
    saving: false,
    error: null,
  });
  const [pending, setPending] = useState<PendingAction>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [needsInputFields, setNeedsInputFields] = useState<
    Record<string, Record<string, string>>
  >(initialNeedsInputFields ?? {});

  const updateNeedsInputField = useCallback(
    (sectionKey: string, descriptor: string, value: string) => {
      setNeedsInputFields((prev) => {
        const next = { ...prev };
        const sectionMap = { ...(next[sectionKey] ?? {}) };
        if (value === "") {
          delete sectionMap[descriptor];
        } else {
          sectionMap[descriptor] = value;
        }
        if (Object.keys(sectionMap).length === 0) {
          delete next[sectionKey];
        } else {
          next[sectionKey] = sectionMap;
        }
        return next;
      });
    },
    []
  );

  const dirty = state.activeKey !== null && state.draft !== state.initial;

  const performSwitch = useCallback((key: string, initial: string) => {
    setState({
      activeKey: key,
      initial,
      draft: initial,
      saving: false,
      error: null,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      activeKey: null,
      initial: "",
      draft: "",
      saving: false,
      error: null,
    });
  }, []);

  const requestEdit = useCallback(
    (key: string, initial: string) => {
      if (state.activeKey === key) return;
      if (state.activeKey !== null && state.draft !== state.initial) {
        setPending({ kind: "switch", targetKey: key, targetInitial: initial });
        return;
      }
      performSwitch(key, initial);
    },
    [state.activeKey, state.draft, state.initial, performSwitch]
  );

  const setDraft = useCallback((value: string) => {
    setState((s) => ({ ...s, draft: value }));
  }, []);

  const saveCore = useCallback(
    async (
      key: string,
      content: string
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      try {
        const res = await fetch(
          `/api/draft/${encodeURIComponent(assessmentId)}/section/${encodeURIComponent(key)}/save`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          return { ok: false, message: body.error ?? `HTTP ${res.status}` };
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [assessmentId]
  );

  const save = useCallback(async () => {
    if (!state.activeKey) return;
    const key = state.activeKey;
    const draft = state.draft;
    setState((s) => ({ ...s, saving: true, error: null }));
    const result = await saveCore(key, draft);
    if (!result.ok) {
      setState((s) => ({ ...s, saving: false, error: result.message }));
      return;
    }
    // Proper UX: stamp the override map with the just-saved content
    // BEFORE closing the editor, so the section card re-renders with
    // the new content in the same React commit. No reload flash, no
    // scroll jump. We skip router.refresh() entirely — it was showing
    // a top-of-page Chrome loading indicator while the server component
    // re-rendered. The override is already correct (matches DB), so
    // next natural navigation refresh picks up server data cleanly.
    setOverrides((o) => ({ ...o, [key]: draft }));
    close();
  }, [state.activeKey, state.draft, saveCore, close]);

  const cancel = useCallback(() => {
    if (dirty) {
      setPending({ kind: "cancel" });
      return;
    }
    close();
  }, [dirty, close]);

  // Modal resolutions
  const modalSave = useCallback(async () => {
    if (!state.activeKey) {
      setPending(null);
      return;
    }
    setState((s) => ({ ...s, saving: true, error: null }));
    const result = await saveCore(state.activeKey, state.draft);
    if (!result.ok) {
      setState((s) => ({ ...s, saving: false, error: result.message }));
      setPending(null); // keep editor open with the error
      return;
    }
    // Save succeeded — stamp the override map for the section we just
    // wrote so its card re-renders with new content immediately. Skip
    // router.refresh() (Chrome loader bar).
    const savedKey = state.activeKey;
    const savedDraft = state.draft;
    setOverrides((o) => ({ ...o, [savedKey]: savedDraft }));

    if (pending?.kind === "switch") {
      performSwitch(pending.targetKey, pending.targetInitial);
    } else {
      close();
    }
    setPending(null);
  }, [state.activeKey, state.draft, saveCore, pending, performSwitch, close]);

  const modalDiscard = useCallback(() => {
    if (pending?.kind === "switch") {
      performSwitch(pending.targetKey, pending.targetInitial);
    } else {
      close();
    }
    setPending(null);
  }, [pending, performSwitch, close]);

  const modalCancel = useCallback(() => {
    setPending(null);
  }, []);

  // beforeunload prompt so the browser back/refresh also warns.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const api = useMemo<CoordinatorApi>(
    () => ({
      state,
      dirty,
      requestEdit,
      setDraft,
      save,
      cancel,
      overrides,
      needsInputFields,
      updateNeedsInputField,
    }),
    [
      state,
      dirty,
      requestEdit,
      setDraft,
      save,
      cancel,
      overrides,
      needsInputFields,
      updateNeedsInputField,
    ]
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      {pending !== null ? (
        <UnsavedChangesModal
          pending={pending}
          saving={state.saving}
          onSave={modalSave}
          onDiscard={modalDiscard}
          onCancel={modalCancel}
        />
      ) : null}
    </Ctx.Provider>
  );
}

function UnsavedChangesModal({
  pending,
  saving,
  onSave,
  onDiscard,
  onCancel,
}: {
  pending: NonNullable<PendingAction>;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1411]/40 px-4"
    >
      <div className="w-full max-w-md rounded-card bg-[#FDFCF8] border border-[#D9D5C8] shadow-xl px-6 py-5">
        <h2
          id="unsaved-changes-heading"
          className="font-serif text-lg text-[#0E1411]"
        >
          Save changes?
        </h2>
        <p className="mt-2 text-sm text-[#2A3430] leading-relaxed">
          {pending.kind === "switch"
            ? "You have unsaved edits in the current section. Save them before opening a different section?"
            : "You have unsaved edits. Save them before closing the editor?"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-sm font-medium text-[#2A3430] hover:bg-[#EFECE3] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="inline-flex items-center rounded-md border border-[#993C1D]/50 bg-[#FDFCF8] px-3 py-1.5 text-sm font-medium text-[#993C1D] hover:bg-[#FAECE7] disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0a5a47] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
