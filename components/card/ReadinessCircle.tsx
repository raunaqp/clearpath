type Band =
  | "red"
  | "amber"
  | "green"
  | "green_plus"
  | "not_applicable"
  | null;

const BAND_STYLE: Record<Exclude<Band, null>, string> = {
  red: "bg-[#993C1D] text-white border-[#993C1D]",
  amber: "bg-[#BA7517] text-white border-[#BA7517]",
  green: "bg-[#3B6D11] text-white border-[#3B6D11]",
  green_plus: "bg-[#1F4A08] text-white border-[#1F4A08]",
  not_applicable: "bg-[#F7F6F2] text-[#6B766F] border-[#D9D5C8]",
};

export function ReadinessCircle({
  score,
  band,
}: {
  score: number | null;
  band: Band;
}) {
  if (score === null) {
    return (
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F7F6F2] border border-[#D9D5C8] flex items-center justify-center">
          <span className="font-serif text-2xl text-[#6B766F]">N/A</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#6B766F] text-center">
          not a medical device
        </span>
      </div>
    );
  }

  const style = band ? BAND_STYLE[band] : BAND_STYLE.not_applicable;

  return (
    <div className="shrink-0">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex items-baseline justify-center ${style}`}
      >
        <span className="font-serif text-3xl sm:text-4xl leading-none tabular-nums">
          {score}
        </span>
        <span className="font-serif text-base leading-none opacity-80">
          /10
        </span>
      </div>
    </div>
  );
}
