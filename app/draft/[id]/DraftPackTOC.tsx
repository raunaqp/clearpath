"use client";

import {
  sectionPendingCount,
  sectionStatus,
  type SectionStatus,
} from "./completion";
import { useEditCoordinator } from "./EditCoordinator";

type TocEntry = {
  number: number;
  title: string;
  /** DB-anchored section identifier; lets the TOC look up the live
   *  content override + filled NEEDS-INPUT fields for this row. */
  sectionKey: string;
  /** Server-baseline content (content_edited overlay if present,
   *  else AI baseline) — same string SectionCard receives. */
  content: string;
  /** Server-computed status — used as the floor when no client
   *  override or live filled fields exist for this section. */
  status: SectionStatus;
  /** Server-computed pending count — same fallback semantics. */
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
  // Read the same EditCoordinator state SectionCard reads so the dot
  // tracks the in-section badge: applies the just-saved override AND
  // any locally-filled NEEDS-INPUT fields before computing status.
  // Without this the dot lags every edit until a full page refresh.
  const { overrides, needsInputFields } = useEditCoordinator();

  return (
    <nav aria-label="Sections" className="text-sm">
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F] mb-3">
        Contents
      </p>
      <ol className="space-y-1.5">
        {sections.map((s) => {
          const override = overrides[s.sectionKey];
          const filled = needsInputFields[s.sectionKey] ?? {};
          const hasLiveSignal =
            override !== undefined || Object.keys(filled).length > 0;
          const effectiveContent = override ?? s.content;
          const effectiveStatus: SectionStatus = hasLiveSignal
            ? sectionStatus(effectiveContent, filled)
            : s.status;
          const effectivePending = hasLiveSignal
            ? sectionPendingCount(effectiveContent, filled)
            : s.pendingCount;
          return (
            <li key={s.number}>
              <a
                href={`#section-${s.number}`}
                className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 -mx-2 hover:bg-[#EFECE3]"
              >
                <span
                  className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(
                    effectiveStatus
                  )}`}
                  aria-label={
                    effectiveStatus === "complete"
                      ? "Complete"
                      : effectiveStatus === "wip"
                      ? `Needs input (${effectivePending})`
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
          );
        })}
      </ol>
    </nav>
  );
}
