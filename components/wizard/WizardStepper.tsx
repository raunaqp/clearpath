import type { JSX } from "react";

export default function WizardStepper({
  currentStep,
  totalSteps = 7,
}: {
  currentStep: number;
  totalSteps?: number;
}): JSX.Element {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div
      role="progressbar"
      aria-label={`Step ${currentStep} of ${totalSteps}`}
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      className="flex items-center gap-2 sm:gap-3"
    >
      {steps.map((n) => {
        const isPast = n < currentStep;
        const isCurrent = n === currentStep;
        const isFuture = n > currentStep;

        if (isCurrent) {
          return (
            <span
              key={n}
              aria-hidden
              className="w-[10px] h-[10px] rounded-full bg-[#0F6E56] ring-2 ring-[#0F6E56]/20 ring-offset-1 ring-offset-[#F7F6F2]"
            />
          );
        }

        if (isPast) {
          return (
            <span
              key={n}
              aria-hidden
              className="w-2 h-2 rounded-full bg-[#0F6E56]"
            />
          );
        }

        // isFuture
        return (
          <span
            key={n}
            aria-hidden
            className={`w-2 h-2 rounded-full bg-[#D9D5C8] ${isFuture ? "" : ""}`}
          />
        );
      })}
    </div>
  );
}
