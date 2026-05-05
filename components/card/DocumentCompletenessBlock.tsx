import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import type { CompletenessResult } from "@/lib/completeness/types";

/**
 * Document Completeness block — sibling to the Readiness circle and
 * TRL block. Three independent metrics, never collapsed:
 *
 *   - Readiness /10: paperwork preparedness across 5 dimensions
 *   - TRL 1-9: technical/clinical maturity (SERB / MAHA MedTech anchored)
 *   - Documents X / Y: which CDSCO-required documents are detected
 *
 * The doc count is estimated from filename + doc_type matching of the
 * documents the founder uploaded at intake. It is intentionally a
 * UNDER-estimate for the free Tier 0 card — exact field-level detection
 * is a Tier 2 (₹499) feature in the Draft Pack.
 *
 * Source of truth: lib/completeness/checklist.ts — same registry the
 * Draft Pack uses, so the card and the pack always agree on what's
 * needed.
 */
export function DocumentCompletenessBlock({
  result,
  cdscoClass,
}: {
  result: CompletenessResult | null;
  cdscoClass: ReadinessCard["classification"]["cdsco_class"];
}) {
  // No checklist available — not a medical device, or class unknown.
  if (!result) {
    return null;
  }

  const total = result.per_requirement.length;
  const satisfied = result.per_requirement.filter((r) => r.satisfied).length;
  const missingCount = total - satisfied;
  const pct = result.overall_pct;

  const bandColor = (() => {
    if (pct >= 75) return "#3B6D11"; // green
    if (pct >= 40) return "#0F6E56"; // teal
    if (pct >= 15) return "#BA7517"; // amber
    return "#993C1D"; // coral — almost nothing
  })();

  // Show up to 4 missing docs; the rest are "Tier 2 will list the others"
  const missingShortlist = result.missing.slice(0, 4);
  const missingOverflow = result.missing.length - missingShortlist.length;

  return (
    <div className="rounded-lg border border-[#D9D5C8] bg-[#FAF8F2] px-4 py-3">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            CDSCO Documents
          </span>
          <span className="font-serif text-2xl tabular-nums text-[#0E1411]">
            {satisfied}
          </span>
          <span className="text-xs text-[#6B766F]">/ {total}</span>
        </div>
        <div className="text-right">
          <span className="font-serif text-lg tabular-nums text-[#0E1411]">
            {pct}%
          </span>
          <span className="text-[10px] text-[#6B766F] ml-1">detected</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full rounded-full bg-[#E8E4D6] overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${satisfied} of ${total} CDSCO-required documents detected`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: bandColor }}
        />
      </div>

      {missingCount > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-[#0E1411]">
            <span className="font-medium">
              {missingCount} document{missingCount === 1 ? "" : "s"} not yet detected
            </span>{" "}
            <span className="text-[#6B766F]">
              for likely Class {cdscoClass ?? "TBD"} pathway
            </span>
          </p>
          <ul className="text-xs text-[#6B766F] leading-relaxed list-disc list-inside space-y-0.5">
            {missingShortlist.map((r) => (
              <li key={r.id}>{r.name}</li>
            ))}
            {missingOverflow > 0 && (
              <li className="italic">
                …and {missingOverflow} more — Draft Pack lists all + provides
                templates
              </li>
            )}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-[#3B6D11] leading-relaxed">
          All required documents detected from your uploads. Draft Pack will
          verify field-level completeness.
        </p>
      )}

      <p className="text-[10px] text-[#6B766F] leading-relaxed mt-2 italic">
        Estimated from filenames + uploaded docs. Field-level verification is
        part of the ₹499 Draft Pack.
      </p>
    </div>
  );
}
