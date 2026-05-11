"use client";

type TocEntry = {
  number: number;
  title: string;
  status: "draft" | "complete" | "pending" | "failed";
};

function dotColor(status: TocEntry["status"]): string {
  switch (status) {
    case "complete":
      return "bg-teal-deep";
    case "failed":
      return "bg-coral-brand";
    case "pending":
      return "bg-muted";
    case "draft":
    default:
      return "bg-amber-brand";
  }
}

export function DraftPackTOC({ sections }: { sections: TocEntry[] }) {
  return (
    <nav aria-label="Sections" className="text-sm">
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted mb-3">
        Contents
      </p>
      <ol className="space-y-1.5">
        {sections.map((s) => (
          <li key={s.number}>
            <a
              href={`#section-${s.number}`}
              className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 -mx-2 hover:bg-bg-sink"
            >
              <span
                className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(
                  s.status
                )}`}
                aria-hidden
              />
              <span className="flex-1">
                <span className="font-mono text-xs text-muted">
                  {s.number.toString().padStart(2, "0")}
                </span>{" "}
                <span className="text-ink-2 group-hover:text-ink">
                  {s.title}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
