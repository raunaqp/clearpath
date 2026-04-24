"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import WizardHeader from "./WizardHeader";
import RadioCard from "./RadioCard";
import CheckboxCard from "./CheckboxCard";
import WizardNav from "./WizardNav";
import Q2FollowupCard from "./Q2FollowupCard";
import { useToast } from "./WizardToastRoot";
import { getQuestion, totalSteps } from "@/lib/wizard/questions";
import type { WizardAnswers, DataSensitivity } from "@/lib/wizard/types";

type Props = {
  assessmentId: string;
  productDisplayName: string;
  currentStep: number;
  initialAnswers: WizardAnswers;
  initialSkipped: number[];
  productType: string | null;
  conflictEncountered: boolean;
  pdfCount: number; // for Q2 follow-up source label
};

type CheckResponse = {
  show_followup: boolean;
  extracted_phrases: string[];
};

export default function WizardClient({
  assessmentId,
  productDisplayName,
  currentStep,
  initialAnswers,
  initialSkipped,
  productType,
  conflictEncountered,
  pdfCount,
}: Props) {
  const router = useRouter();
  const total = totalSteps();
  const question = getQuestion(currentStep);
  const { showToast } = useToast();

  const [answer, setAnswer] = useState<string | string[] | undefined>(() => {
    if (!question) return undefined;
    const key = `q${currentStep}` as keyof WizardAnswers;
    const v = initialAnswers[key];
    if (question.kind === "checkbox") return Array.isArray(v) ? (v as string[]) : [];
    return typeof v === "string" ? v : undefined;
  });
  const [skipped] = useState<number[]>(initialSkipped);
  // `busy` is only used when we MUST block — i.e. the Q2 follow-up
  // check (which decides the routing target). Optimistic paths never
  // set busy because they route immediately.
  const [busy, setBusy] = useState(false);
  const [q2Phrases, setQ2Phrases] = useState<string[] | null>(null);
  const stepStartedAt = useRef<number>(Date.now());
  const wizardStartedAt = useRef<number>(Date.now());

  // Fire wizard_started once per assessment+session on first landing.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `wizard_started_${assessmentId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, String(Date.now()));
    try {
      posthog.capture("wizard_started", {
        assessment_id: assessmentId,
        product_type: productType,
        has_conflict: conflictEncountered,
      });
    } catch {}
  }, [assessmentId, productType, conflictEncountered]);

  const canContinue = useMemo(() => {
    if (!question) return false;
    if (question.kind === "checkbox") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return typeof answer === "string" && answer.length > 0;
  }, [question, answer]);

  const isLastStep = currentStep === total;
  // Q7 (last step) hides the Skip link — the Generate button auto-skips
  // when unanswered, so a separate Skip would be a redundant click.
  const showSkip = question ? !question.required && !isLastStep : false;

  /**
   * Awaited save — still used by the Q2 follow-up resolver where we
   * want to write q2_defended / q2='drives' before advancing.
   */
  const saveAnswerAwaited = useCallback(
    async (step: number, partial: Partial<WizardAnswers>): Promise<boolean> => {
      const res = await fetch("/api/wizard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          step,
          answer: partial,
        }),
      });
      return res.ok;
    },
    [assessmentId]
  );

  /**
   * Fire-and-forget save. The closure captures (step, partial) at call
   * time so Retry re-fires the ORIGINAL answer, not a stale snapshot of
   * current wizard state. On failure, a toast appears at the layout
   * level (survives page navigation).
   *
   * Drop-off edge case (documented): if the user closes the tab while a
   * save is in flight — or after ignoring a failed toast — they resume
   * at the last SUCCESSFULLY persisted question, one step behind their
   * visible position. They re-answer one question, flow continues.
   */
  const saveAnswerBackground = useCallback(
    (step: number, partial: Partial<WizardAnswers>) => {
      const fire = async (): Promise<void> => {
        const res = await fetch("/api/wizard/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessment_id: assessmentId,
            step,
            answer: partial,
          }),
        });
        if (!res.ok) throw new Error(`save failed: ${res.status}`);
      };
      fire().catch(() => {
        showToast("Couldn't save your answer. Retry?", fire);
      });
    },
    [assessmentId, showToast]
  );

  /**
   * Fire-and-forget wizard completion.
   */
  const completeWizardBackground = useCallback(
    (finalSkipped: number[], wizardStartMs: number) => {
      const snapshot = finalSkipped.slice();
      const fire = async (): Promise<void> => {
        const res = await fetch("/api/wizard/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessment_id: assessmentId,
            skipped: snapshot,
          }),
        });
        if (!res.ok) throw new Error(`complete failed: ${res.status}`);
        const answered = ([1, 2, 3, 4, 5, 6, 7] as number[]).filter(
          (n) => !snapshot.includes(n)
        ).length;
        try {
          posthog.capture("wizard_completed", {
            product_type: productType,
            time_total_seconds: Math.round((Date.now() - wizardStartMs) / 1000),
            answered_count: answered,
            skipped_count: snapshot.length,
            conflict_encountered: conflictEncountered,
          });
        } catch {}
      };
      fire().catch(() => {
        showToast("Couldn't finalise your submission. Retry?", fire);
      });
    },
    [assessmentId, productType, conflictEncountered, showToast]
  );

  const advanceTo = useCallback(
    (nextStep: number) => {
      router.push(`/wizard/${assessmentId}/q/${nextStep}`);
    },
    [assessmentId, router]
  );

  const handleNext = useCallback(async () => {
    if (!question) return;

    const stepCompletedSeconds = Math.round(
      (Date.now() - stepStartedAt.current) / 1000
    );

    // ── Q7 unanswered → auto-skip + complete optimistically.
    if (isLastStep && !canContinue) {
      try {
        posthog.capture("wizard_step_skipped", { step_number: currentStep });
      } catch {}
      const finalSkipped = Array.from(
        new Set([...skipped, currentStep])
      ).sort((a, b) => a - b);
      completeWizardBackground(finalSkipped, wizardStartedAt.current);
      router.push(`/assess/${assessmentId}`);
      return;
    }

    if (!canContinue) return;

    const partial: Partial<WizardAnswers> =
      question.kind === "checkbox"
        ? ({ [`q${currentStep}`]: answer as DataSensitivity[] } as Partial<WizardAnswers>)
        : ({ [`q${currentStep}`]: answer } as Partial<WizardAnswers>);

    // ── Q2 informs_only → MUST await the follow-up check (decides routing).
    // Save fires in parallel (optimistic).
    if (currentStep === 2 && answer === "informs_only" && !busy) {
      setBusy(true);
      saveAnswerBackground(currentStep, partial);
      try {
        posthog.capture("wizard_step_completed", {
          step_number: currentStep,
          time_on_step_seconds: stepCompletedSeconds,
        });
      } catch {}
      try {
        const res = await fetch("/api/wizard/check-q2-followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessment_id: assessmentId }),
        });
        if (res.ok) {
          const data = (await res.json()) as CheckResponse;
          if (data.show_followup && data.extracted_phrases.length > 0) {
            setQ2Phrases(data.extracted_phrases);
            setBusy(false);
            return;
          }
        }
      } catch {
        // Let the user through on network failure.
      }
      setBusy(false);
      advanceTo(3);
      return;
    }

    // ── Optimistic path for Q1, Q3–Q7 answered.
    try {
      posthog.capture("wizard_step_completed", {
        step_number: currentStep,
        time_on_step_seconds: stepCompletedSeconds,
      });
    } catch {}
    saveAnswerBackground(currentStep, partial);

    // Q7 answered → also fire completion + route to /assess.
    if (isLastStep) {
      completeWizardBackground(skipped, wizardStartedAt.current);
      router.push(`/assess/${assessmentId}`);
      return;
    }

    advanceTo(currentStep + 1);
  }, [
    question,
    busy,
    canContinue,
    answer,
    currentStep,
    isLastStep,
    skipped,
    saveAnswerBackground,
    completeWizardBackground,
    advanceTo,
    assessmentId,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep === 1) return;
    advanceTo(currentStep - 1);
  }, [currentStep, advanceTo]);

  const handleSkip = useCallback(() => {
    // handleSkip only fires for Q4–Q6 (showSkip excludes Q1–Q3 and Q7).
    // No answer to save; just mark step as skipped and advance.
    if (!question) return;
    if (question.required || isLastStep) return;
    try {
      posthog.capture("wizard_step_skipped", { step_number: currentStep });
    } catch {}
    // Note: we don't persist `skipped` here step-by-step — it's
    // collected and submitted on wizard_complete. Since navigating
    // mounts a fresh WizardClient, the local `skipped` is reset to
    // initialSkipped each mount. Acceptable: the complete endpoint
    // accepts the final array at Q7 submit, and the navigation
    // forward-only pattern means we typically reach Q7 in one session.
    advanceTo(currentStep + 1);
  }, [question, isLastStep, currentStep, advanceTo]);

  // Keyboard shortcuts: Enter, Escape, 1-N (digit keys select options)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!question) return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "Enter" && !busy && (canContinue || isLastStep)) {
        e.preventDefault();
        void handleNext();
        return;
      }
      if (e.key === "Escape" && currentStep > 1) {
        e.preventDefault();
        handleBack();
        return;
      }
      const idx = parseInt(e.key, 10);
      if (!Number.isNaN(idx) && idx >= 1 && idx <= question.options.length) {
        e.preventDefault();
        const option = question.options[idx - 1];
        if (question.kind === "radio") {
          setAnswer(option.value);
        } else {
          setAnswer((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const i = arr.indexOf(option.value);
            if (i >= 0) arr.splice(i, 1);
            else arr.push(option.value);
            return arr;
          });
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question, canContinue, busy, isLastStep, currentStep, handleNext, handleBack]);

  if (!question) {
    return (
      <div className="text-center max-w-md mx-auto">
        <p className="text-[#6B766F]">Question not found.</p>
      </div>
    );
  }

  if (q2Phrases) {
    const sourceLabel: "website" | "uploaded documents" =
      pdfCount > 0 ? "uploaded documents" : "website";
    return (
      <div className="max-w-xl mx-auto w-full">
        <Q2FollowupCard
          extractedPhrases={q2Phrases}
          sourceLabel={sourceLabel}
          onKeepInforms={async () => {
            // Q2 resolution writes q2_defended; route after write completes.
            await saveAnswerAwaited(2, {
              q2: "informs_only",
              q2_defended: true,
            });
            advanceTo(3);
          }}
          onChangeToDrives={async () => {
            await saveAnswerAwaited(2, { q2: "drives" });
            advanceTo(3);
          }}
        />
      </div>
    );
  }

  const checkboxSelected = Array.isArray(answer) ? (answer as string[]) : [];
  const radioSelected = typeof answer === "string" ? answer : "";

  return (
    <div className="max-w-xl mx-auto w-full">
      <WizardHeader
        productDisplayName={productDisplayName}
        currentStep={currentStep}
        totalSteps={total}
      />

      <h1 className="font-serif font-normal text-[clamp(24px,3.4vw,32px)] leading-[1.15] tracking-[-0.01em] text-[#0E1411] mt-6 mb-2">
        {question.required && (
          <>
            <span
              aria-hidden
              className="text-[#993C1D]"
              data-required-marker
            >
              *
            </span>{" "}
          </>
        )}
        {question.prompt}
      </h1>
      {question.helper && (
        <p className="text-[#6B766F] text-sm leading-relaxed mb-6 italic">
          {question.helper}
        </p>
      )}

      <div className="space-y-3 mb-8">
        {question.options.map((opt, i) =>
          question.kind === "radio" ? (
            <RadioCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={radioSelected === opt.value}
              onSelect={() => setAnswer(opt.value)}
              keyboardHint={String(i + 1)}
            />
          ) : (
            <CheckboxCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={checkboxSelected.includes(opt.value)}
              onToggle={() =>
                setAnswer((prev) => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const idx = arr.indexOf(opt.value);
                  if (idx >= 0) arr.splice(idx, 1);
                  else arr.push(opt.value);
                  return arr;
                })
              }
            />
          )
        )}
      </div>

      {question.required && (
        <p
          className="text-sm italic text-[#6B766F] mb-6"
          data-required-legend
        >
          <span aria-hidden className="text-[#993C1D]">
            *
          </span>{" "}
          indicates a required question
        </p>
      )}

      <WizardNav
        onBack={currentStep > 1 ? handleBack : undefined}
        onNext={handleNext}
        onSkip={showSkip ? handleSkip : undefined}
        nextLabel={
          isLastStep ? "Generate my Readiness Card →" : "Next →"
        }
        // Q7 Generate is always enabled (auto-skips if unanswered).
        // Q1–Q6 Next stays disabled until an answer is picked.
        // `busy` only blocks during the Q2 follow-up check.
        nextDisabled={busy || (!isLastStep && !canContinue)}
        showSkip={showSkip}
      />
    </div>
  );
}
