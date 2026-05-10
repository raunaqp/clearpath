import type { ReadinessCard } from "@/lib/schemas/readiness-card";

type Regulations = ReadinessCard["regulations"];

/**
 * Regulation count chip — derived purely from card.regulations.
 *
 * Shows "4 / 9 regulations apply" with a hover/expand revealing the
 * breakdown by verdict (required / conditional / not_applicable).
 *
 * Deliberately a COUNT, not a composite score. Different regulations
 * carry vastly different burdens (DPDP-required vs CDSCO-required are
 * not commensurable), so summing into a single score would be dishonest.
 *
 * "Applicable" = required | required_SDF | required_for_procurement |
 *                required_sub_feature | conditional | optional |
 *                core_compliance_achieved.
 *
 * "Not applicable" = not_applicable verdict only.
 */
export function RegulationCountBadge({
  regulations,
}: {
  regulations: Regulations;
}) {
  const verdicts = Object.values(regulations).map((r) => r.verdict);
  const applicable = verdicts.filter((v) => v !== "not_applicable").length;
  const total = verdicts.length;

  // Breakdown for the small print
  const required = verdicts.filter(
    (v) =>
      v === "required" ||
      v === "required_SDF" ||
      v === "required_for_procurement" ||
      v === "required_sub_feature"
  ).length;
  const conditional = verdicts.filter((v) => v === "conditional").length;
  const achieved = verdicts.filter((v) => v === "core_compliance_achieved").length;

  return (
    <span
      className="inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-white border border-[#0F6E56]/40 text-[#0F6E56]"
      title={`${required} required · ${conditional} conditional · ${achieved} core compliance achieved · ${
        total - applicable
      } not applicable`}
    >
      <span className="font-serif tabular-nums text-sm">
        {applicable}
      </span>
      <span className="text-[10px] opacity-80">/ {total} regs apply</span>
    </span>
  );
}
