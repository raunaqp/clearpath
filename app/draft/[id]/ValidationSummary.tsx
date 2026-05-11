import type { ValidationReport } from "@/lib/engine/draft-pack-v2-validator";

export function ValidationSummary({ report }: { report: ValidationReport }) {
  const hasAny =
    report.critical_failures.length > 0 ||
    report.warnings.length > 0 ||
    report.gaps.length > 0;

  return (
    <section className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Stat
        label="Words"
        value={report.total_word_count.toLocaleString()}
        tone="neutral"
      />
      <Stat
        label="Pending markers"
        value={String(report.total_tbd_count)}
        tone={report.total_tbd_count > 12 ? "amber" : "neutral"}
      />
      <Stat
        label="Sections"
        value={`${report.passing_count} ok / ${report.failing_count} flagged`}
        tone={report.failing_count > 0 ? "amber" : "teal"}
      />
      {report.critical_failures.length > 0 ? (
        <FindingsBlock
          title={`${report.critical_failures.length} critical`}
          findings={report.critical_failures}
          tone="coral"
        />
      ) : null}
      {report.warnings.length > 0 ? (
        <FindingsBlock
          title={`${report.warnings.length} warning${
            report.warnings.length === 1 ? "" : "s"
          }`}
          findings={report.warnings}
          tone="amber"
        />
      ) : null}
      {report.gaps.length > 0 ? (
        <FindingsBlock
          title={`${report.gaps.length} info`}
          findings={report.gaps}
          tone="neutral"
        />
      ) : null}
      {!hasAny ? (
        <div className="sm:col-span-3 rounded-card border border-teal-deep/30 bg-teal-light px-4 py-3 text-sm text-teal-deep">
          No critical findings. Draft Pack passes all 10 cross-section
          invariants.
        </div>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "teal" | "amber" | "coral";
}) {
  const toneCls = {
    neutral: "border-line-soft bg-bg-card text-ink-2",
    teal: "border-teal-deep/30 bg-teal-light text-teal-deep",
    amber: "border-amber-brand/40 bg-amber-light text-amber-deep",
    coral: "border-coral-brand/40 bg-coral-light text-coral-brand",
  }[tone];
  return (
    <div className={`rounded-card border px-4 py-3 ${toneCls}`}>
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl">{value}</p>
    </div>
  );
}

function FindingsBlock({
  title,
  findings,
  tone,
}: {
  title: string;
  findings: { invariant: string; message: string; section_keys: string[] }[];
  tone: "neutral" | "amber" | "coral";
}) {
  const toneCls = {
    neutral: "border-line-soft bg-bg-card text-ink-2",
    amber: "border-amber-brand/40 bg-amber-light text-amber-deep",
    coral: "border-coral-brand/40 bg-coral-light text-coral-brand",
  }[tone];
  return (
    <details
      className={`sm:col-span-3 rounded-card border px-4 py-3 text-sm ${toneCls}`}
    >
      <summary className="cursor-pointer select-none font-mono text-[11px] tracking-[0.14em] uppercase">
        {title}
      </summary>
      <ul className="mt-3 space-y-2">
        {findings.map((f, i) => (
          <li key={`${f.invariant}-${i}`}>
            <span className="font-mono text-xs opacity-70">[{f.invariant}]</span>{" "}
            {f.message}
            {f.section_keys.length > 0 ? (
              <span className="block text-xs opacity-70 mt-0.5">
                Sections: {f.section_keys.join(", ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
