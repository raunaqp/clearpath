import type { ReadinessCard } from "@/lib/schemas/readiness-card";

/**
 * Timeline compact block — sibling to Risk, TRL, Documents in the 2x2
 * grid on the readiness card.
 *
 * Replaces the large bottom-of-card TimelineBlock when the card uses
 * the new grid layout. The narrative anchor stays full-length so
 * regulators reading the card understand what drives the months range.
 */
export function TimelineCompactBlock({
  timeline,
}: {
  timeline: ReadinessCard["timeline"];
}) {
  const months =
    timeline.estimate_months_low === timeline.estimate_months_high
      ? `${timeline.estimate_months_low}`
      : `${timeline.estimate_months_low}–${timeline.estimate_months_high}`;

  return (
    <div className="rounded-lg border border-[#D9D5C8] bg-[#FAF8F2] px-4 py-3">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            Time to approval
          </span>
        </div>
        <div className="text-right">
          <span className="font-serif text-2xl tabular-nums text-[#0E1411]">
            {months}
          </span>
          <span className="text-xs text-[#6B766F] ml-1">months</span>
        </div>
      </div>

      <p className="text-sm text-[#0E1411] leading-snug mb-1">
        <span className="font-medium">Baseline estimate</span>
      </p>

      <p className="text-xs text-[#6B766F] leading-relaxed">
        {timeline.anchor}
      </p>
    </div>
  );
}
