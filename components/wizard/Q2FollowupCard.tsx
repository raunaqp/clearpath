"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

type Props = {
  extractedPhrases: string[];
  sourceLabel: "website" | "uploaded documents";
  onKeepInforms: () => Promise<void> | void;
  onChangeToDrives: () => Promise<void> | void;
};

export default function Q2FollowupCard({
  extractedPhrases,
  sourceLabel,
  onKeepInforms,
  onChangeToDrives,
}: Props) {
  const [busy, setBusy] = useState(false);
  const firedOnce = useRef(false);

  useEffect(() => {
    if (firedOnce.current) return;
    firedOnce.current = true;
    try {
      posthog.capture("wizard_q2_followup_shown", {
        extracted_phrases_count: extractedPhrases.length,
      });
    } catch {}
  }, [extractedPhrases.length]);

  async function handleKeep() {
    if (busy) return;
    setBusy(true);
    try {
      posthog.capture("wizard_q2_defended", { kept_answer: "informs_only" });
    } catch {}
    await onKeepInforms();
  }

  async function handleChange() {
    if (busy) return;
    setBusy(true);
    try {
      posthog.capture("wizard_q2_changed", {
        from: "informs_only",
        to: "drives",
      });
    } catch {}
    await onChangeToDrives();
  }

  return (
    <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8">
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
        Quick check
      </p>
      <h2 className="font-serif font-normal text-[clamp(22px,3vw,28px)] leading-snug text-[#0E1411] mb-3">
        Your {sourceLabel} suggest this tool does more than inform.
      </h2>
      <p className="text-[#6B766F] text-base leading-relaxed mb-4">
        You said <strong className="text-[#0E1411]">“informs only.”</strong>{" "}
        But your {sourceLabel} mention phrases like:
      </p>

      <ul className="mb-5 space-y-1.5">
        {extractedPhrases.map((p) => (
          <li
            key={p}
            className="text-sm text-[#0E1411] before:content-['·'] before:mr-2 before:text-[#BA7517]"
          >
            <span className="italic">“{p}”</span>
          </li>
        ))}
      </ul>

      <p className="text-[#6B766F] text-base leading-relaxed mb-6">
        These sound more like <strong className="text-[#0E1411]">“drives”</strong>{" "}
        — the tool nudges the clinician toward an action.
      </p>

      <p className="text-sm text-[#0E1411] font-medium mb-4">
        Should we update your answer?
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleChange}
          disabled={busy}
          className="bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-full px-6 py-3.5 text-[15px] font-medium disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2"
        >
          {busy ? "Saving…" : "Yes, change to “drives” →"}
        </button>
        <button
          type="button"
          onClick={handleKeep}
          disabled={busy}
          className="text-[#0E1411] rounded-full px-6 py-3.5 text-[15px] font-medium bg-white border border-[#D9D5C8] hover:bg-[#F7F6F2] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2"
        >
          No, keep “informs only”
        </button>
      </div>
    </div>
  );
}
