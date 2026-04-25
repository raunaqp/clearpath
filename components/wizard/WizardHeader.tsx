import type { JSX } from "react";
import WizardStepper from "./WizardStepper";
import { JourneyProgress } from "@/components/layout/JourneyProgress";

/**
 * Mobile/tablet wizard header. Hidden on lg+ where the right-pane
 * vertical stepper takes over. Renders the unified two-tier journey
 * progress + the legacy horizontal segments below.
 *
 * `productDisplayName` is retained on the prop signature for caller
 * compatibility but is no longer rendered (UX change — generic
 * "ASSESSMENT · QUESTION X OF 7" reads cleaner than the per-product
 * concatenation).
 */
export default function WizardHeader({
  productDisplayName: _productDisplayName,
  currentStep,
  totalSteps = 7,
}: {
  productDisplayName: string;
  currentStep: number;
  totalSteps?: number;
}): JSX.Element {
  void _productDisplayName;
  return (
    <div className="lg:hidden">
      <JourneyProgress
        phase="assessment"
        sub={{ current: currentStep, total: totalSteps }}
      />
      <WizardStepper currentStep={currentStep} totalSteps={totalSteps} />
    </div>
  );
}
