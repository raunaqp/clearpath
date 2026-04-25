import type { ReadinessCard, Verdict } from "@/lib/schemas/readiness-card";

type Regulations = ReadinessCard["regulations"];
type RegKey = keyof Regulations;

const REG_ORDER: ReadonlyArray<{ key: RegKey; label: string }> = [
  { key: "cdsco_mdr", label: "CDSCO MDR" },
  { key: "cdsco_pharmacy", label: "CDSCO Pharmacy" },
  { key: "dpdp", label: "DPDP" },
  { key: "icmr", label: "ICMR" },
  { key: "abdm", label: "ABDM" },
  { key: "nabh", label: "NABH" },
  { key: "mci_telemed", label: "MCI Telemed" },
  { key: "irdai", label: "IRDAI" },
  { key: "nabl", label: "NABL" },
];

const VERDICT_TEXT: Record<Verdict, string> = {
  required: "required",
  required_SDF: "likely required (SDF)",
  required_for_procurement: "for procurement",
  required_sub_feature: "feature only",
  conditional: "conditional",
  optional: "optional",
  core_compliance_achieved: "compliant",
  not_applicable: "n/a",
};

const VERDICT_STYLE: Record<Verdict, string> = {
  required: "bg-[#0F6E56] text-white border border-[#0F6E56]",
  required_SDF: "bg-[#0F6E56] text-white border border-[#0F6E56]",
  required_for_procurement: "bg-[#0F6E56] text-white border border-[#0F6E56]",
  required_sub_feature: "bg-[#0F6E56] text-white border border-[#0F6E56]",
  conditional: "bg-transparent text-[#BA7517] border border-[#BA7517]",
  optional: "bg-transparent text-[#BA7517]/80 border border-[#BA7517]/60",
  core_compliance_achieved:
    "bg-transparent text-[#3B6D11] border border-[#3B6D11]",
  not_applicable: "bg-transparent text-[#6B766F] border border-[#D9D5C8]",
};

export function RegulationSnapshot({
  regulations,
}: {
  regulations: Regulations;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-[#0E1411] pb-1.5 mb-3 border-b border-[#D9D5C8]">
        Regulation snapshot
      </h2>
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
        {REG_ORDER.map(({ key, label }) => {
          const entry = regulations[key];
          const verdict = entry.verdict;
          return (
            <span
              key={key}
              className={`rounded-full px-3 py-1.5 text-[11px] leading-tight ${VERDICT_STYLE[verdict]}`}
            >
              <span className="font-mono uppercase tracking-wider">
                {label}
              </span>
              <span className="opacity-60 mx-1">·</span>
              <span className="font-medium">{VERDICT_TEXT[verdict]}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
