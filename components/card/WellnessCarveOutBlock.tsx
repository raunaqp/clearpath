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

export function WellnessCarveOutBlock({
  regulations,
}: {
  regulations: Regulations;
}) {
  const applicable = REG_ORDER.filter(
    ({ key }) => regulations[key].verdict !== "not_applicable"
  );

  return (
    <section className="mt-6 rounded-xl bg-[#EAF3DE] border border-[#3B6D11]/30 p-5">
      <h2 className="font-serif text-xl text-[#0E1411] mb-2">
        Your product likely doesn&apos;t need CDSCO approval.
      </h2>
      {applicable.length > 0 ? (
        <>
          <p className="text-sm text-[#0E1411] leading-relaxed mb-3">
            Your main compliance areas:
          </p>
          <ul className="space-y-1.5">
            {applicable.map(({ key, label }) => (
              <li
                key={key}
                className="flex items-center gap-2 text-sm text-[#0E1411]"
              >
                <span aria-hidden className="text-[#3B6D11]">
                  •
                </span>
                <span className="font-medium">{label}</span>
                <span className="text-[#6B766F]">·</span>
                <span className="text-[#6B766F]">
                  {VERDICT_TEXT[regulations[key].verdict]}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-[#0E1411] leading-relaxed">
          No active compliance obligations identified at your current scope.
        </p>
      )}
    </section>
  );
}
