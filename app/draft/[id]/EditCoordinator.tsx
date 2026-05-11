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
import { useRouter } from "next/navigation";

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
};

const Ctx = createContext<CoordinatorApi | null>(null);

export function useEditCoordinator(): CoordinatorApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEditCoordinator must be used inside provider");
  return c;
}

export function EditCoordinatorProvider({
  assessmentId,
  children,
}: {
  assessmentId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<EditState>({
    activeKey: null,
    initial: "",
    draft: "",
    saving: false,
    error: null,
  });
  const [pending, setPending] = useState<PendingAction>(null);

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
    setState((s) => ({ ...s, saving: true, error: null }));
    const result = await saveCore(state.activeKey, state.draft);
    if (!result.ok) {
      setState((s) => ({ ...s, saving: false, error: result.message }));
      return;
    }
    close();
    router.refresh();
  }, [state.activeKey, state.draft, saveCore, close, router]);

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
    // Save succeeded; resolve pending action.
    if (pending?.kind === "switch") {
      performSwitch(pending.targetKey, pending.targetInitial);
    } else {
      close();
    }
    setPending(null);
    router.refresh();
  }, [state.activeKey, state.draft, saveCore, pending, performSwitch, close, router]);

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
    () => ({ state, dirty, requestEdit, setDraft, save, cancel }),
    [state, dirty, requestEdit, setDraft, save, cancel]
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
    >
      <div className="w-full max-w-md rounded-card bg-bg-card border border-line shadow-xl px-6 py-5">
        <h2
          id="unsaved-changes-heading"
          className="font-serif text-lg text-ink"
        >
          Save changes?
        </h2>
        <p className="mt-2 text-sm text-ink-2 leading-relaxed">
          {pending.kind === "switch"
            ? "You have unsaved edits in the current section. Save them before opening a different section?"
            : "You have unsaved edits. Save them before closing the editor?"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center rounded-md border border-line bg-bg-card px-3 py-1.5 text-sm font-medium text-ink-2 hover:bg-bg-sink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="inline-flex items-center rounded-md border border-coral-brand/50 bg-bg-card px-3 py-1.5 text-sm font-medium text-coral-brand hover:bg-coral-light disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-teal-deep px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0a5a47] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
