export function TimelineBlock({
  low,
  high,
  display,
  anchor,
}: {
  low: number;
  high: number;
  display: string;
  anchor: string;
}) {
  // `display` is unused for the headline (we render low–high explicitly per
  // §5.7), but kept on the prop signature so callers can pass the schema's
  // pre-formatted string. The badge already shows it.
  void display;
  return (
    <section>
      <h2 className="font-serif text-xl text-[#0E1411] pb-1.5 mb-3 border-b border-[#D9D5C8]">
        Time to approval
      </h2>
      <p className="text-[15px] text-[#0E1411] leading-relaxed">
        <span className="font-semibold">
          {low}–{high} months
        </span>{" "}
        <span className="text-[#6B766F]">(baseline)</span>
      </p>
      <p className="text-sm text-[#6B766F] leading-relaxed mt-1">{anchor}</p>
    </section>
  );
}
