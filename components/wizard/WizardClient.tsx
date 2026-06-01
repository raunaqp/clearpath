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
import {
  getNextVisibleStep,
  getPrevVisibleStep,
  getQuestion,
  getVisibleOrdinal,
  totalSteps,
} from "@/lib/wizard/questions";
import type {
  DataSensitivity,
  Persona,
  WizardAnswers,
} from "@/lib/wizard/types";
import { useElapsedPhase } from "@/lib/hooks/use-elapsed-phase";

type Props = {
  assessmentId: string;
  productDisplayName: string;
  currentStep: number;
  initialAnswers: WizardAnswers;
  initialSkipped: number[];
  productType: string | null;
  /** Phase 2c — persona drives whether the wizard ends at Q7 (SaMD /
   *  clinical) or Q9 (hardware). Already verified non-null on the server
   *  by the persona-gate redirect in q/[n]/page.tsx. */
  persona: Persona;
  conflictEncountered: boolean;
  pdfCount: number; // for Q2 follow-up source label
  /** True when all 7 answers are prefilled (e.g. demo packets).
   * Surfaces a "Skip to card →" affordance so partners can jump
   * straight to synthesis after one click of narration. */
  allAnswersPrefilled?: boolean;
  /** Phase 3.5 INV-1 — show the "AI prefilled from your pitch deck"
   *  banner. True when extraction provided defaults that the user
   *  hasn't overridden yet. */
  aiBannerVisible?: boolean;
  /** Phase 3.7 Issue B — number of prefilled questions, used in the
   *  banner copy. */
  aiPrefilledCount?: number;
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
  persona,
  conflictEncountered,
  pdfCount,
  allAnswersPrefilled = false,
  aiBannerVisible = false,
  aiPrefilledCount = 0,
}: Props) {
  const router = useRouter();
  const total = totalSteps(persona);
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
  // Sprint 4B ITEM 1B — 3s/10s/30s threshold UX so a slow Q2 / Q7
  // await never looks like a dead click. Hook ticks while busy is
  // true; phase resets on busy→false transitions.
  // `busy` is only used when we MUST block — i.e. the Q2 follow-up
  // check (which decides the routing target). Optimistic paths never
  // set busy because they route immediately.
  const [busy, setBusy] = useState(false);
  const { phase: busyPhase, elapsedSeconds: busyElapsedSeconds } =
    useElapsedPhase(busy);
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

  // Phase 2c — last visible step depends on persona (Q7 for SaMD,
  // Q9 for hardware). `currentStep === total` is no longer correct
  // because hardware visible steps include 8/9 with total=7.
  const nextVisibleStep = useMemo(
    () => getNextVisibleStep(currentStep, persona),
    [currentStep, persona]
  );
  const prevVisibleStep = useMemo(
    () => getPrevVisibleStep(currentStep, persona),
    [currentStep, persona]
  );
  const isLastStep = nextVisibleStep === null;
  // Last visible step hides the Skip link — the Generate button auto-skips
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
   * Awaited wizard completion. Throws on network / non-2xx failure.
   * Fires wizard_completed on success.
   */
  const completeWizardAttempt = useCallback(
    async (finalSkipped: number[], wizardStartMs: number): Promise<void> => {
      const snapshot = finalSkipped.slice();
      const res = await fetch("/api/wizard/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          skipped: snapshot,
        }),
      });
      if (!res.ok) throw new Error(`complete failed: ${res.status}`);
      // Phase 2c — answered count walks 1..total (7 for SaMD, 9 for hardware).
      const allSteps = Array.from({ length: total }, (_, i) => i + 1);
      const answered = allSteps.filter((n) => !snapshot.includes(n)).length;
      try {
        posthog.capture("wizard_completed", {
          product_type: productType,
          time_total_seconds: Math.round((Date.now() - wizardStartMs) / 1000),
          answered_count: answered,
          skipped_count: snapshot.length,
          conflict_encountered: conflictEncountered,
        });
      } catch {}
    },
    [assessmentId, productType, conflictEncountered, total]
  );

  /**
   * Fire-and-forget wrapper. Kept available for non-Q7 callers; Q7 now
   * uses the awaited attempt directly (see handleNext) to avoid the
   * /assess race where wizard_complete status hadn't landed before the
   * page read the row.
   */
  const completeWizardBackground = useCallback(
    (finalSkipped: number[], wizardStartMs: number) => {
      completeWizardAttempt(finalSkipped, wizardStartMs).catch(() => {
        showToast("Couldn't finalise your submission. Retry?", () =>
          completeWizardAttempt(finalSkipped, wizardStartMs)
        );
      });
    },
    [completeWizardAttempt, showToast]
  );

  /**
   * Skip-to-card affordance — only shown when allAnswersPrefilled (e.g.
   * demo packets). Marks the wizard complete with skipped=[] (because
   * all 7 are answered) and routes to /assess/[id] to drive synthesis.
   * Saves partners ~60 seconds of click-throughs during a demo.
   */
  const [skipping, setSkipping] = useState(false);
  const handleSkipToCard = useCallback(async () => {
    if (skipping) return;
    setSkipping(true);
    try {
      await completeWizardAttempt([], wizardStartedAt.current);
      router.push(`/assess/${assessmentId}`);
    } catch {
      setSkipping(false);
      showToast("Couldn't skip ahead. Try clicking Next instead.");
    }
  }, [skipping, completeWizardAttempt, router, assessmentId, showToast]);

  const advanceTo = useCallback(
    (nextStep: number) => {
      router.push(`/wizard/${assessmentId}/q/${nextStep}`);
    },
    [assessmentId, router]
  );

  /**
   * Prefetch the next destination on step mount so clicking Next uses
   * the cached RSC payload instead of a cold server fetch. Phase 2c —
   * the next destination is the next *visible* step for the persona,
   * not currentStep + 1 (hardware skips Q2 and Q4).
   */
  useEffect(() => {
    const nextUrl =
      isLastStep || nextVisibleStep === null
        ? `/assess/${assessmentId}`
        : `/wizard/${assessmentId}/q/${nextVisibleStep}`;
    router.prefetch(nextUrl);
  }, [assessmentId, isLastStep, nextVisibleStep, router]);

  const handleNext = useCallback(async () => {
    if (!question) return;

    const stepCompletedSeconds = Math.round(
      (Date.now() - stepStartedAt.current) / 1000
    );

    // ── Q7 unanswered → auto-skip + await complete (fix for /assess race).
    if (isLastStep && !canContinue) {
      if (busy) return;
      setBusy(true);
      try {
        posthog.capture("wizard_step_skipped", { step_number: currentStep });
      } catch {}
      const finalSkipped = Array.from(
        new Set([...skipped, currentStep])
      ).sort((a, b) => a - b);
      try {
        await completeWizardAttempt(finalSkipped, wizardStartedAt.current);
      } catch {
        showToast("Couldn't submit — please try again");
        setBusy(false);
        return;
      }
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

    // ── Q7 answered → await save + complete, then route (fix for /assess race).
    if (isLastStep) {
      if (busy) return;
      setBusy(true);
      try {
        posthog.capture("wizard_step_completed", {
          step_number: currentStep,
          time_on_step_seconds: stepCompletedSeconds,
        });
      } catch {}
      try {
        const saveOk = await saveAnswerAwaited(currentStep, partial);
        if (!saveOk) throw new Error("save failed");
        await completeWizardAttempt(skipped, wizardStartedAt.current);
      } catch {
        showToast("Couldn't submit — please try again");
        setBusy(false);
        return;
      }
      router.push(`/assess/${assessmentId}`);
      return;
    }

    // ── Optimistic path — Phase 2c advances to next visible step
    // (hardware skips Q2/Q4; SaMD walks 1→7 contiguously).
    try {
      posthog.capture("wizard_step_completed", {
        step_number: currentStep,
        time_on_step_seconds: stepCompletedSeconds,
      });
    } catch {}
    saveAnswerBackground(currentStep, partial);
    if (nextVisibleStep !== null) {
      advanceTo(nextVisibleStep);
    }
  }, [
    question,
    busy,
    canContinue,
    answer,
    currentStep,
    isLastStep,
    nextVisibleStep,
    skipped,
    saveAnswerAwaited,
    saveAnswerBackground,
    completeWizardAttempt,
    advanceTo,
    assessmentId,
    router,
    showToast,
  ]);

  const handleBack = useCallback(() => {
    // Phase 2c — back navigates to previous visible step. Hardware
    // founder on Q3 goes back to Q1 (Q2 is hidden); on Q9 goes back
    // to Q8.
    if (prevVisibleStep === null) return;
    advanceTo(prevVisibleStep);
  }, [prevVisibleStep, advanceTo]);

  const handleSkip = useCallback(() => {
    // Optional questions only — showSkip already excludes required
    // questions and the last step. Advances to next visible step.
    if (!question) return;
    if (question.required || isLastStep) return;
    try {
      posthog.capture("wizard_step_skipped", { step_number: currentStep });
    } catch {}
    // Note: we don't persist `skipped` here step-by-step — it's
    // collected and submitted on wizard_complete. Since navigating
    // mounts a fresh WizardClient, the local `skipped` is reset to
    // initialSkipped each mount. Acceptable: the complete endpoint
    // accepts the final array at last-step submit.
    if (nextVisibleStep !== null) {
      advanceTo(nextVisibleStep);
    }
  }, [question, isLastStep, currentStep, nextVisibleStep, advanceTo]);

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
      {aiBannerVisible && !allAnswersPrefilled && (
        <div className="mb-4 rounded-lg border border-[#D4A93C]/40 bg-[#FFF8E1] px-3 py-2">
          <p className="text-xs text-[#3A2F0E] leading-snug">
            We&apos;ve helped prefill some answers from your pitch deck —
            review and adjust as needed.
          </p>
        </div>
      )}
      {allAnswersPrefilled && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#0F6E56]/30 bg-[#E1F5EE]/50 px-3 py-2">
          <p className="text-xs text-[#0E1411] leading-snug">
            <span className="font-medium">Demo mode</span>
            <span className="text-[#6B766F]">
              {" "}
              · all {total} answers prefilled. Click Next to walk partners
              through, or skip straight to the card.
            </span>
          </p>
          <button
            type="button"
            onClick={handleSkipToCard}
            disabled={skipping}
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 transition-colors"
          >
            {skipping ? "Skipping…" : "Skip to card →"}
          </button>
        </div>
      )}
      <WizardHeader
        productDisplayName={productDisplayName}
        currentStep={getVisibleOrdinal(currentStep, persona)}
        totalSteps={total}
      />

      <h1 className="font-serif font-normal text-2xl sm:text-3xl xl:text-4xl leading-[1.15] tracking-[-0.01em] text-[#0E1411] mt-4 mb-2">
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
        <p className="text-[#6B766F] text-sm leading-relaxed mb-5 italic">
          {question.helper}
        </p>
      )}

      <div className="space-y-2 sm:space-y-3 mb-8">
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

      {busy && busyPhase !== "idle" ? (
        <div
          role="status"
          aria-live="polite"
          className={
            busyPhase === "stuck"
              ? "mb-3 rounded-md border border-[#BA7517]/30 bg-[#FFF7E6] px-3 py-2 text-sm text-[#7A4E0F] flex items-center gap-2"
              : "mb-3 rounded-md border border-[#0F6E56]/20 bg-[#EAF3EF] px-3 py-2 text-sm text-[#0F6E56] flex items-center gap-2"
          }
        >
          <span
            aria-hidden
            className={
              busyPhase === "stuck"
                ? "inline-block h-3.5 w-3.5 rounded-full bg-[#BA7517]"
                : "inline-block h-3.5 w-3.5 rounded-full border-2 border-[#0F6E56]/30 border-t-[#0F6E56] animate-spin"
            }
          />
          <span>
            {busyPhase === "saving" && "Saving your answer…"}
            {busyPhase === "longer" &&
              "This is taking longer than usual — still working."}
            {busyPhase === "stuck" &&
              "Still working. If this doesn't resolve, refresh the page and try again."}
          </span>
          <span className="ml-auto font-mono text-xs opacity-60">
            {busyElapsedSeconds}s
          </span>
        </div>
      ) : null}

      <WizardNav
        onBack={currentStep > 1 ? handleBack : undefined}
        onNext={handleNext}
        onSkip={showSkip ? handleSkip : undefined}
        nextLabel={
          isLastStep
            ? busy
              ? "Generating…"
              : "Generate my Readiness Card →"
            : "Next →"
        }
        // Q7 Generate is always enabled until the await starts (then busy blocks).
        // Q1–Q6 Next stays disabled until an answer is picked.
        nextDisabled={busy || (!isLastStep && !canContinue)}
        showSkip={showSkip}
      />
    </div>
  );
}
