import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import { TRL_COMPLETION_PCT, getTRLDefinition } from "@/lib/engine/trl";

type TRL = NonNullable<ReadinessCard["trl"]>;

/**
 * TRL block — sits next to the Readiness circle on the card.
 *
 * Three independent metrics, never collapsed into one composite score
 * (per "Readiness ≠ Risk" engineering principle):
 *
 *   - Readiness (existing): paperwork preparedness 0-10
 *   - TRL (this component): actual technical/clinical maturity 1-9
 *   - Risk (existing): patient/regulatory risk H/M/L
 *
 * TRL is anchored to the SERB / ANRF MAHA MedTech Mission framework —
 * the same vocabulary BIRAC, ANRF and IKP use when evaluating funding
 * applications. Each level maps to a CDSCO form/license, which makes
 * it objectively verifiable rather than vibes-based.
 */
export function TRLBlock({ trl }: { trl: TRL | null | undefined }) {
  if (!trl || trl.level === null) {
    return null;
  }

  const def = getTRLDefinition(trl.level, trl.track ?? "investigational");
  const pct = trl.completion_pct ?? TRL_COMPLETION_PCT[trl.level];

  // Bar color follows TRL band — early stages amber, mid stages teal,
  // late stages deep green. Avoids "low completion = bad" framing.
  const bandColor = (() => {
    if (trl.level <= 3) return "#BA7517"; // amber — early
    if (trl.level <= 6) return "#0F6E56"; // teal — mid
    return "#3B6D11"; // green — late
  })();

  const trackLabel =
    trl.track === "has_predicate" ? "predicate track" : "investigational track";

  return (
    <div className="rounded-lg border border-[#D9D5C8] bg-[#FAF8F2] px-4 py-3 h-full">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            TRL
          </span>
          <span className="font-serif text-2xl tabular-nums text-[#0E1411]">
            {trl.level}
          </span>
          <span className="text-xs text-[#6B766F]">/ 9</span>
        </div>
        <div className="text-right">
          <span className="font-serif text-lg tabular-nums text-[#0E1411]">
            {pct}%
          </span>
          <span className="text-[10px] text-[#6B766F] ml-1">complete</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full rounded-full bg-[#E8E4D6] overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`TRL ${trl.level} of 9 — ${pct}% complete`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: bandColor }}
        />
      </div>

      <p className="text-sm text-[#0E1411] leading-snug mb-1">
        <span className="font-medium">{def.label}</span>
        <span className="text-[#6B766F]"> · {trackLabel}</span>
      </p>

      {def.anchor_form && (
        <p className="text-xs text-[#6B766F] font-mono mb-2">
          Anchor: {def.anchor_form}
        </p>
      )}

      <p className="text-xs text-[#6B766F] leading-relaxed">
        <span className="font-medium text-[#0E1411]">Next:</span>{" "}
        {trl.next_milestone}
      </p>
    </div>
  );
}
