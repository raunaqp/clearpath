import type { ReadinessCard } from "@/lib/schemas/readiness-card";

/**
 * Static reference data for the 9 regulations evaluated in a Readiness Card.
 * URLs and submission processes are stable — they don't go through Opus.
 *
 * Keys here MUST match the keys in `ReadinessCardSchema.regulations`.
 */

export type RegulationKey = keyof ReadinessCard["regulations"];

export type RegulationReference = {
  display_name: string;
  authority: string;
  url: string;
  submission_process: string;
  /** Forms that may apply when this regulation is in scope. PDF appendix logic uses `relevant-forms.ts`. */
  associated_forms: string[];
};

export const REGULATION_REFERENCES: Record<RegulationKey, RegulationReference> =
  {
    cdsco_mdr: {
      display_name: "CDSCO MDR 2017",
      authority: "Central Drugs Standard Control Organisation",
      url: "https://cdsco.gov.in",
      submission_process:
        "Submit via the State Licensing Authority for Class A/B (MD-5). Submit via CDSCO Central Licensing Authority for Class C/D (MD-7) and all imports (MD-14). Online portal at cdsco.gov.in.",
      associated_forms: ["MD-5", "MD-7", "MD-9", "MD-14"],
    },
    cdsco_pharmacy: {
      display_name: "CDSCO Pharmacy / Drugs",
      authority: "Central Drugs Standard Control Organisation",
      url: "https://cdsco.gov.in",
      submission_process:
        "Drug-related applications via CDSCO portal. Applies if your product includes drug-device combinations or drug delivery components.",
      associated_forms: [],
    },
    dpdp: {
      display_name: "DPDP Act 2023",
      authority: "Ministry of Electronics & IT",
      url: "https://dpdp.gov.in",
      submission_process:
        "Self-attestation. Appoint a Data Protection Officer if classified as a Significant Data Fiduciary. Reporting obligations to the Data Protection Board once notified by MeitY.",
      associated_forms: [],
    },
    icmr: {
      display_name: "ICMR AI in Healthcare Guidelines",
      authority: "Indian Council of Medical Research",
      url: "https://icmr.gov.in",
      submission_process:
        "Institutional Ethics Committee (IEC) approval required for any clinical investigation. Reference ICMR Ethical Guidelines for Application of AI in Biomedical Research and Healthcare (2023).",
      associated_forms: [],
    },
    abdm: {
      display_name: "ABDM Integration",
      authority: "National Health Authority",
      url: "https://sandbox.abdm.gov.in",
      submission_process:
        "Self-onboard at sandbox.abdm.gov.in. Apply Health Information Provider / Health Information User credentials. Partnership / production-keys: pm.adoption@nha.gov.in.",
      associated_forms: [],
    },
    nabh: {
      display_name: "NABH Digital Health Standards",
      authority: "National Accreditation Board for Hospitals",
      url: "https://nabh.co/digital",
      submission_process:
        "Self-assessment + on-site assessment by NABH assessors. Required for procurement by NABH-accredited hospitals; does not gate market entry.",
      associated_forms: [],
    },
    mci_telemed: {
      display_name: "MCI Telemedicine Practice Guidelines",
      authority: "National Medical Commission (formerly MCI)",
      url: "https://www.nmc.org.in",
      submission_process:
        "Practitioners must hold valid Indian medical registration with state medical councils. Telemedicine providers register with respective state medical councils.",
      associated_forms: [],
    },
    irdai: {
      display_name: "IRDAI",
      authority: "Insurance Regulatory and Development Authority of India",
      url: "https://irdai.gov.in",
      submission_process:
        "If your product processes insurance claims, register as a TPA / Insurance Repository / Web-Aggregator via the IRDAI portal.",
      associated_forms: [],
    },
    nabl: {
      display_name: "NABL Accreditation",
      authority:
        "National Accreditation Board for Testing and Calibration Laboratories",
      url: "https://nabl-india.org",
      submission_process:
        "Required for diagnostic labs running validation studies. Apply via the NABL online portal (nabl-india.org). Typical SLA: 6–12 months to accreditation.",
      associated_forms: [],
    },
  };

export const VERDICT_LABEL: Record<string, string> = {
  required: "required",
  required_SDF: "likely required (SDF pathway)",
  required_for_procurement: "required for procurement",
  required_sub_feature: "applies to feature scope only",
  conditional: "conditional",
  optional: "optional",
  core_compliance_achieved: "compliant",
};

const REGULATION_ORDER: RegulationKey[] = [
  "cdsco_mdr",
  "cdsco_pharmacy",
  "dpdp",
  "icmr",
  "abdm",
  "nabh",
  "mci_telemed",
  "irdai",
  "nabl",
];

export type ApplicableRegulation = {
  key: RegulationKey;
  ref: RegulationReference;
  verdict: ReadinessCard["regulations"][RegulationKey]["verdict"];
  verdict_label: string;
  rationale: string;
  forms_from_card: string[];
  pathway_note: string | null;
};

/** Returns regulations whose verdict is anything other than `not_applicable`, in display order. */
export function applicableRegulations(
  regulations: ReadinessCard["regulations"]
): ApplicableRegulation[] {
  return REGULATION_ORDER.flatMap((key) => {
    const entry = regulations[key];
    if (entry.verdict === "not_applicable") return [];
    return [
      {
        key,
        ref: REGULATION_REFERENCES[key],
        verdict: entry.verdict,
        verdict_label: VERDICT_LABEL[entry.verdict] ?? entry.verdict,
        rationale: entry.rationale,
        forms_from_card: entry.forms ?? [],
        pathway_note: entry.pathway_note ?? null,
      },
    ];
  });
}
