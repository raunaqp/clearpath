import type { JSX } from "react";

export default function WizardNav({
  onBack,
  onNext,
  onSkip,
  nextLabel = "Next →",
  nextDisabled = false,
  showSkip = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showSkip?: boolean;
}): JSX.Element {
  const backButton = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className="text-[#0E1411] font-medium text-[15px] px-5 py-3.5 rounded-full border border-[#D9D5C8] bg-white hover:bg-[#F7F6F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2]"
    >
      ← Back
    </button>
  ) : null;

  const skipButton =
    showSkip && onSkip ? (
      <button
        type="button"
        onClick={onSkip}
        className="text-sm text-[#6B766F] underline hover:text-[#0E1411] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2] rounded"
      >
        Skip this question
      </button>
    ) : null;

  const nextButton = (
    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled}
      className="bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-full px-6 py-3.5 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2]"
    >
      {nextLabel}
    </button>
  );

  return (
    <div className="w-full">
      {/* Mobile (< 640px): full-width Next on top, Back + Skip row below */}
      <div className="flex flex-col gap-3 sm:hidden">
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-full px-6 py-3.5 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2]"
        >
          {nextLabel}
        </button>
        {(onBack || (showSkip && onSkip)) && (
          <div className="flex items-center justify-between gap-3">
            <div>{backButton}</div>
            <div>{skipButton}</div>
          </div>
        )}
      </div>

      {/* Desktop (sm+): Back | Skip | Next */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div className="flex-1 flex justify-start">{backButton}</div>
        <div className="flex-1 flex justify-center">{skipButton}</div>
        <div className="flex-1 flex justify-end">{nextButton}</div>
      </div>
    </div>
  );
}
