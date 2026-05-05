import type { ReadinessCard } from "@/lib/schemas/readiness-card";

type RiskLevel = ReadinessCard["risk"]["level"];
type ClassQualifier = ReadinessCard["classification"]["class_qualifier"];

const RISK_BG: Record<RiskLevel, string> = {
  high: "#FAECE7",
  medium: "#FAEEDA",
  low: "#EAF3DE",
  not_applicable: "#F7F6F2",
};

const RISK_ACCENT: Record<RiskLevel, string> = {
  high: "#993C1D",
  medium: "#BA7517",
  low: "#3B6D11",
  not_applicable: "#6B766F",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  not_applicable: "N/A",
};

/**
 * Risk block — sibling to TRL, Documents, Timeline in the 2x2 grid.
 *
 * Surfaces the patient/regulatory risk level + the CDSCO class +
 * device-type qualifier so partners get a one-glance regulatory
 * profile. Pulls all data from `card.classification` + `card.risk`
 * with no derivation.
 *
 * Risk level visual language:
 *   - High: coral
 *   - Medium: amber
 *   - Low: green
 *   - N/A: muted
 */
export function RiskBlock({
  riskLevel,
  riskRationale,
  cdscoClass,
  classQualifier,
  isMedicalDevice,
}: {
  riskLevel: RiskLevel;
  riskRationale: string;
  cdscoClass: ReadinessCard["classification"]["cdsco_class"];
  classQualifier: ClassQualifier;
  isMedicalDevice: boolean;
}) {
  const accent = RISK_ACCENT[riskLevel];
  const bg = RISK_BG[riskLevel];

  const classText = (() => {
    if (!cdscoClass) return isMedicalDevice ? "TBD" : "N/A";
    if (classQualifier) return `${cdscoClass} (${classQualifier})`;
    return cdscoClass;
  })();

  return (
    <div
      className="rounded-lg border border-[#D9D5C8] px-4 py-3"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            Risk
          </span>
          <span
            className="font-serif text-2xl tabular-nums"
            style={{ color: accent }}
          >
            {RISK_LABEL[riskLevel]}
          </span>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            CDSCO Class
          </span>
          <span
            className="ml-2 font-serif text-lg tabular-nums"
            style={{ color: accent }}
          >
            {classText}
          </span>
        </div>
      </div>

      <p className="text-sm text-[#0E1411] leading-snug mb-1">
        <span className="font-medium">
          {isMedicalDevice ? "Medical device" : "Not a medical device"}
        </span>
      </p>

      <p className="text-xs text-[#6B766F] leading-relaxed">
        {riskRationale}
      </p>
    </div>
  );
}
