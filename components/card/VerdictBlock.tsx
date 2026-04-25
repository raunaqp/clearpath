export function VerdictBlock({ verdict }: { verdict: string }) {
  return (
    <section>
      <h2 className="font-serif text-xl text-[#0E1411] pb-1.5 mb-3 border-b border-[#D9D5C8]">
        Verdict
      </h2>
      <p className="text-[15px] leading-relaxed text-[#0E1411] whitespace-pre-line">
        {verdict}
      </p>
    </section>
  );
}
