/**
 * Two-tier journey progress shown across intake + wizard.
 *
 *   ┌──────────────┬──────────────────┐
 *   │ ● Intake     │ ○ Assessment     │   ← top tier (2 phases)
 *   └──────────────┴──────────────────┘
 *   ASSESSMENT · QUESTION 3 OF 7              ← bottom tier (label)
 *
 * Bottom-tier label uses the existing monospace eyebrow styling so it
 * blends with the surrounding wizard/intake aesthetic. The horizontal
 * segment bar (WizardStepper) is rendered separately below this on
 * /q/[n] for mobile/tablet.
 */

const TEAL = "#0F6E56";
const TEAL_BG = "#EAF3EF";
const GRAY_LINE = "#D9D5C8";
const GRAY_TEXT = "#6B766F";
const TEXT_DARK = "#0E1411";

const PHASE_LABELS = {
  intake: "Intake",
  assessment: "Assessment",
} as const;

export type JourneyPhase = "intake" | "assessment";

export type JourneyProgressProps = {
  phase: JourneyPhase;
  /** Sub-progress within the current phase. e.g. {current: 3, total: 7}. */
  sub: { current: number; total: number };
  /**
   * Optional override for the bottom-tier label prefix. Defaults to
   * "STEP" for intake and "QUESTION" for assessment. Pass "Conflict
   * review" to suppress the X-of-Y suffix and show a flat label instead.
   */
  bottomTierLabel?: string;
};

export function JourneyProgress({
  phase,
  sub,
  bottomTierLabel,
}: JourneyProgressProps) {
  const isIntakeActive = phase === "intake";
  const isAssessmentActive = phase === "assessment";

  // Computed bottom-tier label.
  const computedLabel = (() => {
    if (bottomTierLabel) {
      // Flat label — caller knows what to render.
      return bottomTierLabel;
    }
    const prefix = isIntakeActive ? "STEP" : "QUESTION";
    const phaseTag = isIntakeActive ? "INTAKE" : "ASSESSMENT";
    return `${phaseTag} · ${prefix} ${sub.current} OF ${sub.total}`;
  })();

  return (
    <div className="mb-6">
      {/* Top tier: two phase chips, joined by a connector */}
      <div className="flex items-center gap-3 mb-3">
        <PhaseChip
          label={PHASE_LABELS.intake}
          state={
            isIntakeActive ? "current" : isAssessmentActive ? "past" : "future"
          }
        />
        <span aria-hidden className="flex-1 h-px max-w-[64px]" style={{ backgroundColor: GRAY_LINE }} />
        <PhaseChip
          label={PHASE_LABELS.assessment}
          state={isAssessmentActive ? "current" : "future"}
        />
      </div>

      {/* Bottom tier: monospace label */}
      <p
        className="font-mono text-[11px] tracking-[0.14em] uppercase"
        style={{ color: isIntakeActive ? GRAY_TEXT : TEAL }}
      >
        {computedLabel}
      </p>
    </div>
  );
}

function PhaseChip({
  label,
  state,
}: {
  label: string;
  state: "past" | "current" | "future";
}) {
  const dotClasses =
    "inline-flex w-4 h-4 rounded-full items-center justify-center text-[9px] shrink-0";
  return (
    <span className="inline-flex items-center gap-2">
      {state === "past" ? (
        <span aria-hidden className={dotClasses} style={{ backgroundColor: TEAL, color: "#FFFFFF" }}>
          ✓
        </span>
      ) : state === "current" ? (
        <span
          aria-hidden
          className={dotClasses}
          style={{
            backgroundColor: TEAL,
            color: "#FFFFFF",
            boxShadow: `0 0 0 4px ${TEAL_BG}`,
          }}
        />
      ) : (
        <span
          aria-hidden
          className={dotClasses}
          style={{ border: `1px solid ${GRAY_LINE}`, backgroundColor: "#FFFFFF" }}
        />
      )}
      <span
        className="text-sm leading-tight"
        style={{
          color: state === "future" ? GRAY_TEXT : TEXT_DARK,
          fontWeight: state === "current" ? 600 : 500,
        }}
      >
        {label}
      </span>
    </span>
  );
}
