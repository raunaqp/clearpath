import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import { RegulationCountBadge } from "./RegulationCountBadge";

type RiskLevel = ReadinessCard["risk"]["level"];
type MdStatus = ReadinessCard["classification"]["medical_device_status"];
type CdscoClass = ReadinessCard["classification"]["cdsco_class"];
type ClassQualifier = ReadinessCard["classification"]["class_qualifier"];
type Regulations = ReadinessCard["regulations"];

const RISK_LABEL: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  not_applicable: "N/A",
};

const RISK_STYLE: Record<RiskLevel, string> = {
  high: "bg-[#993C1D] text-white",
  medium: "bg-[#BA7517] text-white",
  low: "bg-[#3B6D11] text-white",
  not_applicable: "bg-[#E8E4D6] text-[#6B766F]",
};

const MD_LABEL: Record<MdStatus, string> = {
  is_medical_device: "Yes",
  not_medical_device: "No",
  hybrid: "Hybrid",
  wellness_carve_out: "Wellness",
};

function badgeBase(extra: string) {
  return `rounded-full px-3 py-1 text-xs font-medium ${extra}`;
}

export function BadgeRow({
  riskLevel,
  mdStatus,
  cdscoClass,
  classQualifier,
  timelineDisplay,
  regulations,
}: {
  riskLevel: RiskLevel;
  mdStatus: MdStatus;
  cdscoClass: CdscoClass;
  classQualifier: ClassQualifier;
  timelineDisplay: string;
  regulations: Regulations;
}) {
  const classText = (() => {
    const base = cdscoClass ?? "TBD";
    if (classQualifier) return `${base} (${classQualifier})`;
    return base;
  })();

  // "feature only" / scoped-feature reads as "Feature" in the MD pill — but the
  // medical_device_status enum doesn't carry that nuance, so we fall back on
  // the four enum values plus an in-text qualifier (handled by ReadinessCard).
  const mdLabel = MD_LABEL[mdStatus];

  const neutralPill = "bg-white border border-[#D9D5C8] text-[#0E1411]";

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
      <span className={badgeBase(RISK_STYLE[riskLevel])}>
        Risk: {RISK_LABEL[riskLevel]}
      </span>
      <span className={badgeBase(neutralPill)}>Device?: {mdLabel}</span>
      <span className={badgeBase(neutralPill)}>Class: {classText}</span>
      <span className={badgeBase(neutralPill)}>
        Timeline: {timelineDisplay}
      </span>
      <RegulationCountBadge regulations={regulations} />
    </div>
  );
}
