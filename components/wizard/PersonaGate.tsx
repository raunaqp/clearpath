"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import type { Persona } from "@/lib/wizard/types";

type Option = {
  value: Persona;
  title: string;
  subtitle: string;
  detail: string;
  forms: string;
};

// Founder-locked persona set (Phase 2a). Copy emphasises *intent*
// over *product shape* so customers self-select correctly without
// needing to know form numbers.
const OPTIONS: Option[] = [
  {
    value: "manufacturer_samd",
    title: "I'm bringing a software-based medical product to market",
    subtitle: "Software as a Medical Device (SaMD)",
    detail:
      "An app, SaaS, AI tool, or other software product that diagnoses, treats, monitors, or supports clinical decision-making. You're seeking a CDSCO manufacturing licence to sell or distribute the software.",
    forms: "MD-3 / MD-7 path · software-centric questions",
  },
  {
    value: "manufacturer_hardware",
    title: "I'm bringing a physical medical device to market",
    subtitle: "Hardware / instrument manufacturer",
    detail:
      "A physical device — diagnostic equipment, implant, instrument, monitor, or accessory — manufactured for sale or distribution. You need a CDSCO manufacturing licence for the device class.",
    forms: "MD-3 (Class A/B) or MD-7 (Class C/D) · facility + ISO 13485 questions",
  },
  {
    value: "clinical_investigation_researcher",
    title: "I'm running a clinical investigation of a medical device",
    subtitle: "Clinical Investigation researcher",
    detail:
      "A systematic study of an investigational medical device on human participants to assess safety, performance, or effectiveness. You need CDSCO permission to conduct the investigation, separate from any manufacturing licence.",
    forms: "MD-22 → MD-23 · sponsor / EC / protocol questions",
  },
];

export function PersonaGate({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Persona | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/wizard/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          step: 0,
          answer: { persona: selected },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      try {
        posthog.capture("wizard_persona_selected", {
          assessment_id: assessmentId,
          persona: selected,
        });
      } catch {
        // telemetry only
      }
      router.push(`/wizard/${assessmentId}/q/1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
        Before we start
      </p>
      <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
        Which path applies to you?
      </h1>
      <p className="text-[#6B766F] text-sm sm:text-base mb-7 leading-relaxed">
        Pick the one that matches your goal. We&apos;ll tune the rest of the
        wizard, the gap analysis, and your Readiness Report to your path. You
        can&apos;t change this later for this assessment — start a new one if
        you pick the wrong path.
      </p>

      <div className="space-y-3 mb-6">
        {OPTIONS.map((opt) => {
          const checked = selected === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={`persona_${opt.value}`}
              className={`block px-5 py-4 rounded-xl cursor-pointer transition-colors ${
                checked
                  ? "border-2 border-[#0F6E56] bg-[#EAF3EF]"
                  : "border border-[#D9D5C8] bg-white hover:bg-[#FAFAF7]"
              }`}
            >
              <input
                id={`persona_${opt.value}`}
                type="radio"
                name="persona"
                value={opt.value}
                checked={checked}
                onChange={() => setSelected(opt.value)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 inline-flex w-4 h-4 rounded-full shrink-0 ${
                    checked
                      ? "bg-[#0F6E56] ring-4 ring-[#0F6E56]/20"
                      : "border border-[#D9D5C8] bg-white"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-[#0E1411] leading-snug">
                    {opt.title}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mt-1.5">
                    {opt.subtitle}
                  </p>
                  <p className="text-sm text-[#2A3430] leading-relaxed mt-2">
                    {opt.detail}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BA7517] mt-2">
                    {opt.forms}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-[#993C1D] bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selected || submitting}
        className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[15px] px-6 py-3.5 transition-colors"
      >
        {submitting ? "Saving…" : "Continue →"}
      </button>
    </div>
  );
}
