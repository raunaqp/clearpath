"use client";

import { useState } from "react";

export function DraftPackDownloadButton({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/draft/${assessmentId}/pdf`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (typeof url !== "string") throw new Error("no url in response");
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-teal-deep px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0a5a47] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Generating PDF…" : "Download PDF"}
      </button>
      {error ? (
        <p className="text-xs text-coral-brand">{error}</p>
      ) : null}
    </div>
  );
}
