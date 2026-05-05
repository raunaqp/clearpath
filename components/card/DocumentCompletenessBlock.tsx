import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import type { CompletenessResult } from "@/lib/completeness/types";

/**
 * Document Completeness block — sibling to the Readiness circle and
 * TRL block. Three independent metrics, never collapsed:
 *
 *   - Readiness /10: paperwork preparedness across 5 dimensions
 *   - TRL 1-9: technical/clinical maturity (SERB / MAHA MedTech anchored)
 *   - Documents X / Y: CDSCO-required docs in place (uploaded + claimed)
 *
 * Two ways a requirement gets marked satisfied:
 *   • Uploaded — strong evidence (filename + doc_type matched)
 *   • Claimed — signal supplement from wizard answers (dim === 2)
 *
 * The component shows both counts so the founder isn't misled. Tier 2
 * Draft Pack (₹499) verifies claimed items against actual content.
 *
 * Source of truth: lib/completeness/checklist.ts — same registry the
 * Draft Pack uses, so card and pack always agree on what's needed.
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
  const uploaded = result.per_requirement.filter(
    (r) =>
      r.satisfied &&
      r.satisfied_by_document_ids.some((id) => !id.startsWith("signal:"))
  ).length;
  const viaSignalOnly = satisfied - uploaded;
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
    <div className="rounded-lg border border-[#D9D5C8] bg-[#FAF8F2] px-4 py-3 h-full">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
            CDSCO Documents
          </span>
          <span className="font-serif text-2xl tabular-nums text-[#0E1411]">
            {satisfied}
          </span>
          <span className="text-xs text-[#6B766F]">/ {total} in place</span>
        </div>
        <div className="text-right">
          <span className="font-serif text-lg tabular-nums text-[#0E1411]">
            {pct}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full rounded-full bg-[#E8E4D6] overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${satisfied} of ${total} CDSCO-required documents in place`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: bandColor }}
        />
      </div>

      {/* Breakdown of how the count was arrived at — honest about
          uploaded vs claimed-only */}
      {satisfied > 0 && (
        <p className="text-[11px] text-[#6B766F] leading-relaxed mb-2">
          {uploaded > 0 && (
            <>
              <span className="text-[#3B6D11] font-medium">{uploaded} uploaded</span>
              {viaSignalOnly > 0 && " · "}
            </>
          )}
          {viaSignalOnly > 0 && (
            <span className="text-[#BA7517]">
              {viaSignalOnly} claimed (not yet verified)
            </span>
          )}
        </p>
      )}

      {missingCount > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-[#0E1411]">
            <span className="font-medium">
              {missingCount} document{missingCount === 1 ? "" : "s"} not yet in place
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
          All required documents in place. Draft Pack verifies field-level
          completeness against CDSCO standards.
        </p>
      )}

      <p className="text-[10px] text-[#6B766F] leading-relaxed mt-2 italic">
        Estimated from uploaded files + your wizard answers. Tier 2 Draft Pack
        verifies content against CDSCO requirements.
      </p>
    </div>
  );
}
