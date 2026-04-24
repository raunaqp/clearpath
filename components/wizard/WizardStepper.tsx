import type { JSX } from "react";

/**
 * Seven equal-width segments with small gaps between them. Completed
 * and current segments fill teal; upcoming segments fill light neutral.
 * Full bar spans the container width.
 */
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
      className="flex w-full gap-1"
    >
      {steps.map((n) => {
        const reached = n <= currentStep;
        return (
          <div
            key={n}
            aria-hidden
            className={`h-1.5 flex-1 rounded-[2px] transition-colors ${
              reached ? "bg-[#0F6E56]" : "bg-[#E5E5E5]"
            }`}
          />
        );
      })}
    </div>
  );
}
