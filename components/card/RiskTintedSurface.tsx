import type { ReactNode } from "react";

type RiskLevel = "high" | "medium" | "low" | "not_applicable";

const SURFACE_BY_RISK: Record<RiskLevel, string> = {
  high: "bg-[#FAECE7] border-[#993C1D]/40",
  medium: "bg-[#FAEEDA] border-[#BA7517]/40",
  low: "bg-[#EAF3DE] border-[#3B6D11]/40",
  not_applicable: "bg-[#F7F6F2] border-[#D9D5C8]",
};

export function RiskTintedSurface({
  riskLevel,
  children,
}: {
  riskLevel: RiskLevel;
  children: ReactNode;
}) {
  const tint = SURFACE_BY_RISK[riskLevel];
  return (
    <div className={`rounded-2xl border ${tint} p-5 sm:p-7`}>{children}</div>
  );
}
