"use client";

import type { SectionStatus } from "./completion";

type TocEntry = {
  number: number;
  title: string;
  status: SectionStatus;
  pendingCount: number;
};

function dotColor(status: SectionStatus): string {
  switch (status) {
    case "complete":
      return "bg-[#0F6E56]";
    case "wip":
      return "bg-[#BA7517]";
    case "empty":
    default:
      return "bg-[#6B766F]";
  }
}

export function DraftPackTOC({ sections }: { sections: TocEntry[] }) {
  return (
    <nav aria-label="Sections" className="text-sm">
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F] mb-3">
        Contents
      </p>
      <ol className="space-y-1.5">
        {sections.map((s) => (
          <li key={s.number}>
            <a
              href={`#section-${s.number}`}
              className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 -mx-2 hover:bg-[#EFECE3]"
            >
              <span
                className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(
                  s.status
                )}`}
                aria-label={
                  s.status === "complete"
                    ? "Complete"
                    : s.status === "wip"
                    ? `Needs input (${s.pendingCount})`
                    : "Empty"
                }
              />
              <span className="flex-1">
                <span className="font-mono text-xs text-[#6B766F]">
                  MD-7 Section {s.number.toString().padStart(2, "0")}
                </span>
                <span className="block text-[#2A3430] group-hover:text-[#0E1411] leading-snug">
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
