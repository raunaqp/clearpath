/**
 * Right-pane context for the desktop wizard. Hidden below md breakpoint —
 * mobile/tablet keep the existing horizontal stepper at the top of the
 * question card.
 *
 * Content is intentionally calm: a vertical stepper with short labels,
 * a "what we're checking" paragraph, and a minimal trust footer.
 *
 * Trust footer copy is deliberately conservative — see commit message.
 * "Encrypted at rest" is true (Supabase encrypts at rest by default).
 * The 90-day deletion claim is intentionally omitted because we don't
 * yet have a documented auto-delete job.
 */

const STEP_LABELS: Record<number, string> = {
  1: "Clinical state",
  2: "Decision influence",
  3: "Users",
  4: "Year 1 scale",
  5: "Integrations",
  6: "Data types",
  7: "Commercial stage",
};

export function QuestionContextPane({
  currentStep,
  totalSteps = 7,
}: {
  currentStep: number;
  totalSteps?: number;
}) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <aside
      aria-label="Wizard progress and context"
      className="hidden xl:flex w-80 shrink-0 flex-col border-l border-[#E5E7EB] bg-white"
    >
      <div className="p-6 flex-1">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B7280] mb-4">
          Question {currentStep} of {totalSteps}
        </p>

        <ol className="space-y-3 mb-6">
          {steps.map((n) => {
            const isPast = n < currentStep;
            const isCurrent = n === currentStep;
            return (
              <li key={n} className="flex items-start gap-3">
                <StepIndicator state={isPast ? "past" : isCurrent ? "current" : "future"} />
                <span
                  className={
                    isCurrent
                      ? "text-sm font-medium text-[#0E1411] leading-snug"
                      : isPast
                        ? "text-sm text-[#374151] leading-snug"
                        : "text-sm text-[#9CA3AF] leading-snug"
                  }
                >
                  {STEP_LABELS[n] ?? `Step ${n}`}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-[#E5E7EB] my-6" />

        <p className="text-sm font-medium text-[#0E1411] mb-2">
          What we&apos;re checking
        </p>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          We&apos;re mapping your product against the IMDRF SaMD framework
          and CDSCO MDR 2017 classification rules. Each answer narrows the
          regulatory pathway and the forms you&apos;ll likely need.
        </p>
      </div>

      <div className="p-6 border-t border-[#E5E7EB]">
        <p className="text-xs text-[#6B7280] flex items-start gap-2">
          <span aria-hidden>🔒</span>
          <span>
            Encrypted at rest. We treat your product data carefully.
          </span>
        </p>
      </div>
    </aside>
  );
}

function StepIndicator({
  state,
}: {
  state: "past" | "current" | "future";
}) {
  const baseClasses =
    "mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] shrink-0";
  if (state === "past") {
    return (
      <span
        aria-hidden
        className={`${baseClasses} bg-[#0F6E56] text-white`}
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        aria-hidden
        className={`${baseClasses} bg-[#0F6E56] text-white ring-4 ring-[#0F6E56]/15`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${baseClasses} border border-[#D1D5DB] bg-white`}
    />
  );
}
