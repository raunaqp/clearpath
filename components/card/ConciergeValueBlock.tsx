/**
 * Concierge value prop block — sits below the Time-saved block, above
 * the Tier 2/3 button row.
 *
 * Purpose: re-frame the ₹50K concierge as a clear escalation from the
 * ₹499 Draft Pack. Tier 2 = "we draft it, you review and submit."
 * Tier 3 = "our team handles document generation and helps you push it
 * through CDSCO."
 *
 * Honest framing — 'alongside,' not 'for you'. We're not promising
 * zero-touch regulatory submission. The founder is still on the
 * application; we accelerate, we don't replace.
 */
export function ConciergeValueBlock() {
  return (
    <div className="mb-5 rounded-lg bg-[#FAEDE5] border border-[#E0B8A4] px-4 py-3">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#993C1D]">
          Need it done sooner?
        </span>
      </div>
      <p className="text-sm text-[#0E1411] leading-relaxed">
        Our Concierge team handles document generation, regulatory
        coordination and CDSCO submission alongside you — typically
        in <span className="font-medium">weeks</span>, where a traditional
        regulatory consultant would take <span className="font-medium">6–12 months</span>{" "}
        for the same scope. ₹50K covers 12 months of ongoing review and
        revisions.
      </p>
    </div>
  );
}
