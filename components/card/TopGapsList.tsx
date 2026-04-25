type Severity = "high" | "medium" | "low";

type Gap = {
  gap_title: string;
  fix_action: string;
  severity: Severity;
};

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

const SEVERITY_STYLE: Record<Severity, string> = {
  high: "bg-[#993C1D] text-white border border-[#993C1D]",
  medium: "bg-transparent text-[#BA7517] border border-[#BA7517]",
  low: "bg-transparent text-[#6B766F] border border-[#D9D5C8]",
};

export function TopGapsList({ gaps }: { gaps: Gap[] }) {
  return (
    <section>
      <h2 className="font-serif text-xl text-[#0E1411] pb-1.5 mb-3 border-b border-[#D9D5C8]">
        Fix first · Top 3 gaps
      </h2>
      <ul className="space-y-3">
        {gaps.map((gap, i) => (
          <li
            key={`${gap.gap_title}-${i}`}
            className="flex items-start gap-3"
          >
            <span
              className={`shrink-0 mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                SEVERITY_STYLE[gap.severity]
              }`}
            >
              {SEVERITY_LABEL[gap.severity]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#0E1411] leading-snug">
                {gap.gap_title}
              </p>
              <p className="text-sm text-[#6B766F] leading-relaxed mt-0.5">
                {gap.fix_action}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
