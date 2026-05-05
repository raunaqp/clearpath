import type { CompletenessResult } from "@/lib/completeness/types";

/**
 * Time-saved block — sits above the Tier 2/3 CTA row.
 *
 * Renders only when there are missing CDSCO documents to draft. Uses
 * the same completeness count that powers the Documents block, so
 * card and CTA copy never disagree.
 *
 * Honest framing:
 *   - Consultant rates and timelines are anchored to public Indian
 *     med-device consultancy benchmarks (₹3-5L for full submission
 *     dossier, 8-12 weeks of work). These are conservative defaults;
 *     the actual cost depends on device class and consultant tier.
 *   - 'Starter draft' deliberately distinguishes from 'finalised
 *     submission' — Tier 2 produces drafts the founder reviews and
 *     edits, not zero-touch final docs.
 *   - We don't promise 'days of saved time'; we give a band. Promising
 *     a precise number invites pushback when reality differs.
 */
export function TimeSavedBlock({
  result,
}: {
  result: CompletenessResult | null;
}) {
  if (!result) return null;

  const missingCount = result.missing.length;
  if (missingCount === 0) return null;

  const docWord = missingCount === 1 ? "document" : "documents";

  return (
    <div className="mb-5 rounded-lg bg-[#FAF8F2] border border-[#D9D5C8] px-4 py-3">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F6E56]">
          Time saved with Draft Pack
        </span>
      </div>
      <p className="text-sm text-[#0E1411] leading-relaxed">
        Drafting {missingCount} CDSCO {docWord} typically takes{" "}
        <span className="font-medium">8–12 weeks with a consultant</span> at
        roughly <span className="font-medium">₹3–5L</span>. Tier 2 produces a
        starter draft for each in <span className="font-medium">about 10 minutes</span>{" "}
        for <span className="font-medium">₹499</span> — review and edit instead
        of writing from scratch.
      </p>
    </div>
  );
}
