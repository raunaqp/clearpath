import type { JSX } from "react";
import WizardStepper from "./WizardStepper";

export default function WizardHeader({
  productDisplayName,
  currentStep,
  totalSteps = 7,
}: {
  productDisplayName: string;
  currentStep: number;
  totalSteps?: number;
}): JSX.Element {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
        {productDisplayName} · Question {currentStep} of {totalSteps}
      </p>
      <div className="mt-3">
        <WizardStepper currentStep={currentStep} totalSteps={totalSteps} />
      </div>
    </div>
  );
}
