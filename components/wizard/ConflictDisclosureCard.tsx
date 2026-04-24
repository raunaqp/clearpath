"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

type Props = {
  assessmentId: string;
  severity: "high" | "medium";
  authorityUsed: "pdf" | "url" | "one_liner";
  oneLinerInterpretation: string;
  contentInterpretation: string | null; // pdf_interp, else url_interp
  contentSource: "pdf" | "url";
  editAttemptCount: number;
};

const LEFT_LABEL = "WHAT YOU SAID";
const RIGHT_LABEL_PDF = "WHAT YOUR DOCS SAY";
const RIGHT_LABEL_URL = "WHAT YOUR WEBSITE SAYS";

export default function ConflictDisclosureCard({
  assessmentId,
  severity,
  authorityUsed,
  oneLinerInterpretation,
  contentInterpretation,
  contentSource,
  editAttemptCount,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isReappearance = editAttemptCount > 0;
  const firedOnce = useRef(false);

  useEffect(() => {
    if (firedOnce.current) return;
    firedOnce.current = true;
    try {
      posthog.capture("wizard_conflict_shown", {
        severity,
        authority_used: authorityUsed,
      });
      if (isReappearance) {
        posthog.capture("wizard_conflict_reappeared", {
          severity,
          edit_attempt_count: editAttemptCount,
        });
      }
    } catch {}
  }, [severity, authorityUsed, isReappearance, editAttemptCount]);

  async function handleContinue() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      posthog.capture("wizard_conflict_continued", { severity });
    } catch {}
    try {
      const res = await fetch("/api/wizard/ack-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId }),
      });
      if (!res.ok) throw new Error(`ack failed: ${res.status}`);
      // Reload the page so server re-evaluates and hides the card.
      router.refresh();
    } catch (e) {
      console.error("ack-conflict failed:", e);
      setError("Couldn't save. Try again.");
      setBusy(false);
    }
  }

  function handleEdit() {
    try {
      posthog.capture("wizard_conflict_edit_clicked", { severity });
    } catch {}
    router.push(`/start?resume=${assessmentId}`);
  }

  return (
    <div
      aria-label="Conflict disclosure"
      className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 mb-8"
    >
      <h3 className="font-serif font-normal text-[22px] leading-tight text-[#0E1411] mb-5">
        {isReappearance ? "Still a mismatch" : "Quick heads up"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="bg-white border border-[#D9D5C8] rounded-lg px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1.5">
            {LEFT_LABEL}
          </p>
          <p className="text-sm font-semibold text-[#0E1411] leading-snug">
            “{oneLinerInterpretation}”
          </p>
        </div>
        <div className="bg-white border border-[#D9D5C8] rounded-lg px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1.5">
            {contentSource === "pdf" ? RIGHT_LABEL_PDF : RIGHT_LABEL_URL}
          </p>
          <p className="text-sm font-semibold text-[#0E1411] leading-snug">
            “{contentInterpretation ?? "—"}”
          </p>
        </div>
      </div>

      <p className="text-sm text-[#6B766F] leading-relaxed mb-6">
        {isReappearance
          ? "Your updated description still classifies differently from your documents. This is fine — we'll continue using your documents as the primary source. You can edit again, or proceed."
          : "Your uploaded documents usually have more detail than a short description, so we're using them as the primary source for your classification. If your description is actually correct, you can go back and edit it now."}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <button
          type="button"
          onClick={handleEdit}
          disabled={busy}
          className="order-1 sm:order-1 text-[#0F6E56] font-medium text-[15px] px-5 py-3 rounded-full border-2 border-[#0F6E56] bg-white hover:bg-[#EAF3EF] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2"
        >
          ← Edit my description
        </button>
        <div className="flex-1 hidden sm:block" />
        <button
          type="button"
          onClick={handleContinue}
          disabled={busy}
          className="order-2 sm:order-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-full px-6 py-3 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2"
        >
          {busy ? "Saving…" : "Continue to questions →"}
        </button>
      </div>

      <p className="text-xs italic text-[#6B766F] leading-relaxed">
        For this assessment, our priority is: uploaded documents first, website
        content second, your description third.
      </p>

      {error && (
        <p className="text-sm text-[#993C1D] mt-3">{error}</p>
      )}
    </div>
  );
}
