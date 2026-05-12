"use client";

/**
 * Phase 5.5.D — drag-drop attachment zone for one section.
 *
 * Displays the existing attachment list + a drop target / file picker.
 * Each row exposes: open (signed URL), replace (delete + re-upload),
 * delete. Caption (notes) + doc_type are inline-editable via PATCH.
 *
 * State is local to this component for now; on success we update the
 * local list optimistically and the parent page picks up server data
 * on the next natural navigation. (Pack-level completion % is content-
 * marker-driven, so it's unaffected by attachment changes.)
 */
import { useRef, useState } from "react";
import {
  ATTACHMENT_FILE_LIMITS,
  docTypesFor,
  defaultDocTypeFor,
  isAcceptedMime,
} from "@/lib/attachments/doc-types";

export type Attachment = {
  id: string;
  filename: string;
  content_type: string | null;
  size_bytes: number;
  doc_type: string | null;
  notes: string | null;
};

type Props = {
  assessmentId: string;
  sectionKey: string;
  initialAttachments: Attachment[];
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function AttachmentZone({
  assessmentId,
  sectionKey,
  initialAttachments,
}: Props) {
  const [items, setItems] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docTypes = docTypesFor(sectionKey);

  async function uploadFile(file: File, docType: string) {
    if (file.size > ATTACHMENT_FILE_LIMITS.maxBytes) {
      setError(
        `File too large: ${fmtBytes(file.size)} (max ${fmtBytes(ATTACHMENT_FILE_LIMITS.maxBytes)})`
      );
      return;
    }
    if (!isAcceptedMime(file.type)) {
      setError(`Unsupported type: ${file.type || "(unknown)"} — PDF / PNG / JPG only`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("section_key", sectionKey);
      fd.append("doc_type", docType);
      const res = await fetch(
        `/api/draft/${encodeURIComponent(assessmentId)}/attachments`,
        { method: "POST", body: fd }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.message ?? body.error ?? `HTTP ${res.status}`
        );
      }
      const att = body.attachment as Attachment | null;
      if (att) {
        setItems((prev) => {
          // Deduplicate by id (server may return the existing row).
          if (prev.some((p) => p.id === att.id)) return prev;
          return [...prev, att];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  function onFileSelected(file: File | null | undefined) {
    if (!file) return;
    void uploadFile(file, defaultDocTypeFor(sectionKey));
  }

  async function deleteAttachment(id: string) {
    const ok = window.confirm("Remove this attachment?");
    if (!ok) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/draft/${encodeURIComponent(assessmentId)}/attachments/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function replaceAttachment(id: string) {
    // Replace = delete existing + open file picker. Keep the previous
    // file's doc_type if known so the new upload defaults sensibly.
    const oldRow = items.find((p) => p.id === id);
    const ok = window.confirm("Replace this file? Old file will be removed.");
    if (!ok) return;
    setError(null);
    try {
      const delRes = await fetch(
        `/api/draft/${encodeURIComponent(assessmentId)}/attachments/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!delRes.ok) {
        const body = await delRes.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${delRes.status}`);
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    // Open the file picker for the new upload; remember the old doc_type
    // so we re-apply it on the next upload.
    if (oldRow?.doc_type) {
      pendingDocTypeRef.current = oldRow.doc_type;
    }
    fileInputRef.current?.click();
  }

  const pendingDocTypeRef = useRef<string | null>(null);

  async function openAttachment(id: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/draft/${encodeURIComponent(assessmentId)}/attachments/${encodeURIComponent(id)}/url`
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      window.open(body.url, "_blank", "noopener");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function updateMeta(id: string, patch: { doc_type?: string; notes?: string }) {
    setError(null);
    const optimistic = (prev: Attachment[]) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setItems(optimistic);
    try {
      const res = await fetch(
        `/api/draft/${encodeURIComponent(assessmentId)}/attachments/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      // Optimistic update was wrong; force user to retry. Easier than
      // re-fetching the row from server for a single field.
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className="mt-6 rounded-card border border-[#E8E4D6] bg-[#FDFCF8] px-4 py-3 text-sm">
      <header className="flex items-center justify-between mb-2">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F]">
          Evidence{items.length > 0 ? ` (${items.length})` : ""}
        </p>
      </header>

      {items.length > 0 ? (
        <ul className="space-y-2 mb-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-[#E8E4D6] bg-white px-3 py-2 flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                onClick={() => openAttachment(a.id)}
                className="font-medium text-[#0F6E56] hover:underline"
                title="Open"
              >
                {a.filename}
              </button>
              <span className="text-[11px] font-mono text-[#6B766F]">
                {fmtBytes(a.size_bytes)}
              </span>
              <select
                value={a.doc_type ?? defaultDocTypeFor(sectionKey)}
                onChange={(e) => updateMeta(a.id, { doc_type: e.target.value })}
                className="text-xs rounded border border-[#D9D5C8] bg-white px-2 py-1 text-[#2A3430]"
              >
                {docTypes.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="caption (optional)"
                defaultValue={a.notes ?? ""}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v !== (a.notes ?? "")) {
                    void updateMeta(a.id, { notes: v });
                  }
                }}
                className="flex-1 min-w-[140px] text-xs rounded border border-[#D9D5C8] bg-white px-2 py-1 text-[#2A3430]"
              />
              <button
                type="button"
                onClick={() => replaceAttachment(a.id)}
                className="text-xs text-[#0F6E56] hover:underline"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => deleteAttachment(a.id)}
                className="text-xs text-[#993C1D] hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFileSelected(file);
        }}
        className={`block cursor-pointer rounded-md border-2 border-dashed px-4 py-4 text-center transition-colors ${
          dragOver
            ? "border-[#0F6E56] bg-[#E1F5EE]"
            : "border-[#D9D5C8] bg-[#FDFCF8] hover:bg-[#EFECE3]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // If a previous Replace remembered a doc_type, use it now.
            if (pendingDocTypeRef.current && file) {
              const docType = pendingDocTypeRef.current;
              pendingDocTypeRef.current = null;
              void uploadFile(file, docType);
              e.target.value = "";
              return;
            }
            onFileSelected(file);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-[#6B766F]">
          {uploading
            ? "Uploading…"
            : "Drop file here or click to upload · PDF / PNG / JPG · max 10 MB"}
        </p>
      </label>

      {error ? (
        <p className="mt-2 text-xs text-[#993C1D]">⚠ {error}</p>
      ) : null}
    </section>
  );
}
