"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import WizardHeader from "./WizardHeader";
import RadioCard from "./RadioCard";
import CheckboxCard from "./CheckboxCard";
import WizardNav from "./WizardNav";
import Q2FollowupCard from "./Q2FollowupCard";
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

  const [answer, setAnswer] = useState<string | string[] | undefined>(() => {
    if (!question) return undefined;
    const key = `q${currentStep}` as keyof WizardAnswers;
    const v = initialAnswers[key];
    if (question.kind === "checkbox") return Array.isArray(v) ? (v as string[]) : [];
    return typeof v === "string" ? v : undefined;
  });
  const [skipped] = useState<number[]>(initialSkipped);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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

  const saveAnswer = useCallback(
    async (
      step: number,
      partial: Partial<WizardAnswers>
    ): Promise<boolean> => {
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

  const advanceTo = useCallback(
    (nextStep: number) => {
      router.push(`/wizard/${assessmentId}/q/${nextStep}`);
    },
    [assessmentId, router]
  );

  const completeWizard = useCallback(
    async (
      finalSkipped: number[],
      wizardStartMs: number
    ): Promise<boolean> => {
      const res = await fetch("/api/wizard/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          skipped: finalSkipped,
        }),
      });
      if (!res.ok) return false;
      const answered = ([1, 2, 3, 4, 5, 6, 7] as number[]).filter(
        (n) => !finalSkipped.includes(n)
      ).length;
      try {
        posthog.capture("wizard_completed", {
          product_type: productType,
          time_total_seconds: Math.round((Date.now() - wizardStartMs) / 1000),
          answered_count: answered,
          skipped_count: finalSkipped.length,
          conflict_encountered: conflictEncountered,
        });
      } catch {}
      return true;
    },
    [assessmentId, productType, conflictEncountered]
  );

  const handleNext = useCallback(async () => {
    if (!question || busy) return;

    // Q7 special: Generate button is always enabled. If the user hasn't
    // picked an option, treat the click as skip+submit (step 7 added to
    // wizard_skipped_questions, wizard marked complete).
    if (isLastStep && !canContinue) {
      setBusy(true);
      setError("");
      try {
        posthog.capture("wizard_step_skipped", { step_number: currentStep });
      } catch {}
      const finalSkipped = Array.from(
        new Set([...skipped, currentStep])
      ).sort((a, b) => a - b);
      const finished = await completeWizard(
        finalSkipped,
        wizardStartedAt.current
      );
      if (!finished) {
        setError("Couldn't finalise. Try again.");
        setBusy(false);
        return;
      }
      router.push(`/assess/${assessmentId}`);
      return;
    }

    if (!canContinue) return;
    setBusy(true);
    setError("");

    const partial: Partial<WizardAnswers> =
      question.kind === "checkbox"
        ? ({ [`q${currentStep}`]: answer as DataSensitivity[] } as Partial<WizardAnswers>)
        : ({ [`q${currentStep}`]: answer } as Partial<WizardAnswers>);

    const ok = await saveAnswer(currentStep, partial);
    if (!ok) {
      setError("Couldn't save. Try again.");
      setBusy(false);
      return;
    }

    try {
      posthog.capture("wizard_step_completed", {
        step_number: currentStep,
        time_on_step_seconds: Math.round(
          (Date.now() - stepStartedAt.current) / 1000
        ),
      });
    } catch {}

    // Q2 branch: check for decision-support mismatch
    if (currentStep === 2 && answer === "informs_only") {
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
            return; // don't advance yet
          }
        }
      } catch {
        // Network fail: let the user through rather than block.
      }
    }

    if (isLastStep) {
      const finished = await completeWizard(skipped, wizardStartedAt.current);
      if (!finished) {
        setError("Couldn't finalise. Try again.");
        setBusy(false);
        return;
      }
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
    saveAnswer,
    isLastStep,
    completeWizard,
    skipped,
    advanceTo,
    assessmentId,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep === 1) return;
    advanceTo(currentStep - 1);
  }, [currentStep, advanceTo]);

  const handleSkip = useCallback(async () => {
    if (!question || busy) return;
    if (question.required) return;
    setBusy(true);
    setError("");
    try {
      posthog.capture("wizard_step_skipped", { step_number: currentStep });
    } catch {}
    const nextSkipped = Array.from(new Set([...skipped, currentStep])).sort(
      (a, b) => a - b
    );
    if (isLastStep) {
      const finished = await completeWizard(
        nextSkipped,
        wizardStartedAt.current
      );
      if (!finished) {
        setError("Couldn't finalise. Try again.");
        setBusy(false);
        return;
      }
      router.push(`/assess/${assessmentId}`);
      return;
    }
    advanceTo(currentStep + 1);
  }, [
    question,
    busy,
    currentStep,
    skipped,
    isLastStep,
    completeWizard,
    advanceTo,
    assessmentId,
    router,
  ]);

  // Keyboard shortcuts: Enter, Escape, 1-4 (or more for checkbox toggles)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!question) return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "Enter" && canContinue && !busy) {
        e.preventDefault();
        void handleNext();
        return;
      }
      if (e.key === "Escape" && currentStep > 1) {
        e.preventDefault();
        handleBack();
        return;
      }
      // Number keys select options by index
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
  }, [question, canContinue, busy, currentStep, handleNext, handleBack]);

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
            await saveAnswer(2, {
              q2: "informs_only",
              q2_defended: true,
            });
            advanceTo(3);
          }}
          onChangeToDrives={async () => {
            await saveAnswer(2, { q2: "drives" });
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

      {error && (
        <p className="text-sm text-[#993C1D] bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-4 py-3 mb-4">
          {error}
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
        nextDisabled={busy || (!isLastStep && !canContinue)}
        showSkip={showSkip}
      />
    </div>
  );
}
