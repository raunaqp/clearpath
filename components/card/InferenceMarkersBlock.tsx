import type { InferenceMarker } from "@/lib/schemas/readiness-card";

/**
 * Phase 2c — surfaces the assumptions and estimates the synthesizer
 * made about the founder's hardware device. Hardware persona only;
 * SaMD / clinical-investigation founders rarely see this block (empty
 * marker array → null render).
 *
 * Founder requirement: "A founder whose device DOES contain a drug
 * must not miss that 'non-drug' was assumed." This block is placed
 * directly under the metric grid and above the Verdict so the founder
 * sees it before reading any prose conclusions.
 *
 * Each marker carries a status ([ESTIMATED] / [ASSUMED] / [EXTRACTED]),
 * a plain-language basis line, and a pointer to where the founder can
 * correct it.
 */

const STATUS_COPY: Record<
  InferenceMarker["status"],
  { label: string; bg: string; fg: string; ring: string }
> = {
  estimated: {
    label: "ESTIMATED",
    bg: "#FAEEDA",
    fg: "#BA7517",
    ring: "#E8D4A6",
  },
  assumed: {
    label: "ASSUMED",
    bg: "#FAECE7",
    fg: "#993C1D",
    ring: "#E8C8B8",
  },
  extracted: {
    label: "EXTRACTED",
    bg: "#E1F5EE",
    fg: "#0F6E56",
    ring: "#B5DECD",
  },
};

export function InferenceMarkersBlock({
  markers,
}: {
  markers: InferenceMarker[] | undefined;
}) {
  if (!markers || markers.length === 0) return null;

  return (
    <section
      className="mb-7 rounded-lg border border-[#E8D4A6] bg-[#FCF8F1] px-4 sm:px-5 py-4"
      aria-label="Assumptions and estimates"
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-serif text-base text-[#0E1411]">
          What we assumed about your device
        </h2>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#BA7517] shrink-0">
          Correct in your editor
        </p>
      </div>
      <p className="text-[13px] leading-relaxed text-[#6B766F] mb-4">
        We inferred the fields below from your wizard answers and uploaded
        materials. If any is wrong &mdash; especially the highlighted ones
        &mdash; tap to correct it. Your Submission Pack regenerates from
        the corrected values.
      </p>
      <ul className="space-y-3">
        {markers.map((m) => {
          const sc = STATUS_COPY[m.status];
          return (
            <li
              key={`${m.field}-${m.label}`}
              className="rounded-md border border-[#E5E0D0] bg-white px-3 py-2.5"
            >
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <span
                  className="font-mono text-[10px] tracking-[0.14em] uppercase rounded px-1.5 py-0.5 shrink-0"
                  style={{
                    backgroundColor: sc.bg,
                    color: sc.fg,
                    boxShadow: `inset 0 0 0 1px ${sc.ring}`,
                  }}
                >
                  {sc.label}
                </span>
                <span className="font-medium text-[14px] text-[#0E1411]">
                  {m.label}
                </span>
                <span className="text-[14px] text-[#0E1411]">
                  &mdash; {m.value}
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#6B766F]">
                {m.basis}
              </p>
              <p className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-[#0F6E56] mt-1.5">
                ↳ correct at {m.correctable_at}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
