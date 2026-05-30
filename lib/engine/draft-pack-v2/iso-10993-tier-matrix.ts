/**
 * ISO 10993 biocompatibility tier matrix — source-of-truth lookup.
 *
 * Feeds: section-13-biocompatibility.ts.
 *
 * Co-edited with docs/seed-tables/iso-10993-tier-matrix.md. The Markdown
 * is the human-review surface (per `feedback_moat_content_reviewable.md`);
 * this .ts is what the generator consumes. Same content, two formats.
 *
 * Why deterministic: §13 is the highest-blast-radius generator in the
 * hardware pack. An LLM picking the test panel could miss 10993-13 for
 * a bioresorbable implant or call for wrong-tier 10993-23 mucosal on a
 * pure surface device — content errors the editor can't fix because the
 * recommendation logic itself was wrong. So the LLM only writes
 * narrative around this deterministic table.
 *
 * Standards baseline:
 *   ISO 10993-1:2018  framework + selection matrix (Annex A)
 *   ISO 10993-3:2014  genotox / carcinogenicity / reproductive
 *   ISO 10993-4:2017  blood interactions
 *   ISO 10993-5:2009  in-vitro cytotoxicity
 *   ISO 10993-6:2016  local effects after implantation
 *   ISO 10993-9:2019  framework for degradation identification
 *   ISO 10993-10:2021 sensitization (irritation moved to -23 in 2021)
 *   ISO 10993-11:2017 systemic toxicity
 *   ISO 10993-13/-14/-15  degradation products: polymeric/ceramic/metallic
 *   ISO 10993-16:2017 toxicokinetic study design
 *   ISO 10993-17:2023 allowable limits
 *   ISO 10993-18:2020 chemical characterization
 *   ISO 10993-23:2021 irritation
 *
 * Indian context: DMF §8.11 (bible §4.B Block 4); test reports must
 * come from a NABL-accredited lab for CDSCO acceptance.
 */

import type { PatientContact } from "@/lib/wizard/types";

/** Single test row in a panel. `applicability_basis` is the rationale
 *  shown to the founder for *why* this test appears at this tier. */
export type IsoTest = {
  iso_part: string; // e.g., "ISO 10993-5"
  test_name: string; // e.g., "Cytotoxicity (in vitro)"
  applicability: "core" | "conditional";
  /** Plain-language reason this test appears in this tier. */
  rationale: string;
  /** Sign-off status. "estimate" until founder/consultant confirms. */
  review_status: "estimate" | "reviewed";
};

/** Per-Q9-value tier definition. */
export type BiocompTier = {
  /** ISO 10993-1:2018 contact category label (e.g., "Implant — tissue/bone"). */
  iso_10993_1_category: string;
  /** Default contact-duration assumption. Founder can override in editor. */
  duration_default: "limited" | "prolonged" | "long_term";
  /** The test panel for this tier. Order matters — table-rendering
   *  preserves the row order. */
  panel: IsoTest[];
};

/** A core test row used in nearly every tier. Pulled out as a constant
 *  to keep the per-tier panels readable and to make additions consistent. */
const CYTOTOX: IsoTest = {
  iso_part: "ISO 10993-5",
  test_name: "Cytotoxicity (in vitro)",
  applicability: "core",
  rationale: "Baseline for every patient-contact device.",
  review_status: "estimate",
};

const SENSITIZATION: IsoTest = {
  iso_part: "ISO 10993-10",
  test_name: "Skin sensitization",
  applicability: "core",
  rationale:
    "Standard for any patient-contact material; LLNA or guinea-pig maximization.",
  review_status: "estimate",
};

function irritation(method: string): IsoTest {
  return {
    iso_part: "ISO 10993-23",
    test_name: `Irritation (${method})`,
    applicability: "core",
    rationale:
      "Irritation testing moved from -10 to its own standard in the 2021 revision.",
    review_status: "estimate",
  };
}

/** Per-Q9 panel. Codifies the same content as
 *  docs/seed-tables/iso-10993-tier-matrix.md. `no_contact` is absent
 *  because the section-gating predicate skips §13 for that Q9 value. */
export const BIOCOMP_TIER_MATRIX: Record<
  Exclude<PatientContact, "no_contact">,
  BiocompTier
> = {
  surface_intact_skin: {
    iso_10993_1_category: "Surface contact — intact skin",
    duration_default: "prolonged",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("skin patch"),
      {
        iso_part: "ISO 10993-3",
        test_name: "Genotoxicity",
        applicability: "conditional",
        rationale: "Required when cumulative contact exceeds 30 days.",
        review_status: "estimate",
      },
    ],
  },

  surface_mucosal: {
    iso_10993_1_category: "Surface contact — mucous membrane",
    duration_default: "prolonged",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("mucosal route per -23 Annex"),
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (acute)",
        applicability: "core",
        rationale: "Mucosal route — systemic absorption potential.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Genotoxicity",
        applicability: "conditional",
        rationale: "Required when cumulative contact >24h.",
        review_status: "estimate",
      },
    ],
  },

  blood_path_indirect: {
    iso_10993_1_category: "External communicating — blood (indirect)",
    duration_default: "limited",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("skin route at user end"),
      {
        iso_part: "ISO 10993-4",
        test_name: "Hemocompatibility (limited panel: hemolysis + thrombogenicity)",
        applicability: "core",
        rationale:
          "Even indirect blood contact triggers a minimum hemocompatibility panel.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (acute)",
        applicability: "core",
        rationale: "Leachables systemic-exposure pathway.",
        review_status: "estimate",
      },
    ],
  },

  blood_path_direct: {
    iso_10993_1_category: "External communicating — blood (direct circulation)",
    duration_default: "prolonged",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("standard"),
      {
        iso_part: "ISO 10993-4",
        test_name:
          "Hemocompatibility (full panel: hemolysis, thrombogenicity, complement, leukocytes, coagulation)",
        applicability: "core",
        rationale: "Direct blood circulation requires the full -4 panel.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (acute + sub-acute)",
        applicability: "core",
        rationale: "Direct circulation exposure to leachables.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Genotoxicity",
        applicability: "core",
        rationale: "Direct blood contact + prolonged duration.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-18",
        test_name: "Chemical characterization",
        applicability: "core",
        rationale: "Leachables enter circulation directly.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-17",
        test_name: "Allowable limits",
        applicability: "conditional",
        rationale: "Risk-evaluate extractables identified in -18.",
        review_status: "estimate",
      },
    ],
  },

  invasive_transient_lt_24h: {
    iso_10993_1_category: "External communicating — tissue/bone (limited)",
    duration_default: "limited",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("intracutaneous"),
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (acute)",
        applicability: "core",
        rationale: "Transient exposure but extractables possible.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-6",
        test_name: "Local effects (after implantation)",
        applicability: "conditional",
        rationale: "Required when tissue retention or fragmentation possible.",
        review_status: "estimate",
      },
    ],
  },

  invasive_long_term_30d: {
    iso_10993_1_category: "External communicating — tissue/bone (prolonged)",
    duration_default: "prolonged",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("standard"),
      {
        iso_part: "ISO 10993-6",
        test_name: "Local effects after implantation (sub-chronic)",
        applicability: "core",
        rationale: "Tissue retention requires sub-chronic local effects.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (sub-acute / sub-chronic)",
        applicability: "core",
        rationale: "Prolonged systemic exposure.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Genotoxicity",
        applicability: "core",
        rationale: "Prolonged tissue contact triggers genotox.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-18",
        test_name: "Chemical characterization",
        applicability: "core",
        rationale: "Leachables identification baseline.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-17",
        test_name: "Allowable limits",
        applicability: "conditional",
        rationale: "Risk-evaluate extractables identified in -18.",
        review_status: "estimate",
      },
    ],
  },

  implant_gt_30d: {
    iso_10993_1_category: "Implant — tissue/bone OR blood (long-term)",
    duration_default: "long_term",
    panel: [
      CYTOTOX,
      SENSITIZATION,
      irritation("standard"),
      {
        iso_part: "ISO 10993-6",
        test_name: "Local effects after implantation (chronic histopathology)",
        applicability: "core",
        rationale: "Implant retention requires chronic local effects.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-11",
        test_name: "Systemic toxicity (sub-chronic + chronic)",
        applicability: "core",
        rationale: "Long-term systemic exposure.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Genotoxicity",
        applicability: "core",
        rationale: "Long-term contact threshold.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Carcinogenicity",
        applicability: "conditional",
        rationale:
          "Required when genotox flags or material in known carcinogen class. [REVIEW] — consultant call on default trigger.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-3",
        test_name: "Reproductive / developmental toxicity",
        applicability: "conditional",
        rationale:
          "Rare — implant near reproductive tissue or in pregnancy population.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-18",
        test_name: "Chemical characterization",
        applicability: "core",
        rationale: "Baseline leachables identification.",
        review_status: "estimate",
      },
      {
        iso_part: "ISO 10993-17",
        test_name: "Allowable limits",
        applicability: "core",
        rationale: "Mandatory risk-evaluation for chronic exposure.",
        review_status: "estimate",
      },
    ],
  },
};

/** Conditional add-on panel — drug-eluting devices. Stacks on top of
 *  the Q9 tier panel. Tests already in the base panel are NOT
 *  duplicated; the section-13 generator merges by ISO part. The
 *  device is also treated as a combination product (§8.12 + §19 DCG(I)
 *  NOC) — the §13 narrative cross-references those. */
export const DRUG_ELUTING_ADDON: IsoTest[] = [
  {
    iso_part: "ISO 10993-17",
    test_name: "Allowable limits (drug + non-drug constituents)",
    applicability: "core",
    rationale:
      "Drug-eluting devices always require allowable-limits evaluation. Promotes -17 from conditional to core.",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-18",
    test_name: "Chemical characterization (extended for drug + carrier)",
    applicability: "core",
    rationale:
      "Drug + carrier extractables / leachables fully characterized.",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-16",
    test_name: "Toxicokinetic study design",
    applicability: "core",
    rationale:
      "Drug release profile + systemic absorption modelling.",
    review_status: "estimate",
  },
];

/** Conditional add-on panel — bioresorbable / biodegradable devices. */
export const BIORESORBABLE_ADDON: IsoTest[] = [
  {
    iso_part: "ISO 10993-9",
    test_name: "Framework for degradation product identification",
    applicability: "core",
    rationale: "Risk-management framework for degradation products.",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-13",
    test_name: "Degradation products — polymeric matrix",
    applicability: "conditional",
    rationale: "Fires when matrix is polymeric (e.g., PLA / PLGA stents).",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-14",
    test_name: "Degradation products — ceramic matrix",
    applicability: "conditional",
    rationale: "Fires when matrix is ceramic (e.g., bioglass).",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-15",
    test_name: "Degradation products — metallic matrix",
    applicability: "conditional",
    rationale: "Fires when matrix is metallic (e.g., Mg-alloy stents).",
    review_status: "estimate",
  },
  {
    iso_part: "ISO 10993-16",
    test_name: "Toxicokinetic study design",
    applicability: "core",
    rationale:
      "Tracks systemic distribution of degradation products. Merges with the drug-eluting add-on if both fire.",
    review_status: "estimate",
  },
];

/** Merge a base Q9 panel with one or more add-on panels. Add-on rows
 *  with the same `iso_part` either replace the base row (when add-on
 *  applicability promotes to "core") or are skipped (when base already
 *  has stricter applicability). Preserves order: base first, then
 *  add-on extras. */
export function mergePanel(
  base: IsoTest[],
  ...addons: IsoTest[][]
): IsoTest[] {
  const merged = new Map<string, IsoTest>();
  // base panel first — preserves rationale phrasing
  for (const t of base) merged.set(t.iso_part + "::" + t.test_name, t);

  for (const addon of addons) {
    for (const t of addon) {
      const sameIsoPart = [...merged.values()].find(
        (existing) => existing.iso_part === t.iso_part
      );
      if (!sameIsoPart) {
        // brand-new ISO part — append
        merged.set(t.iso_part + "::" + t.test_name, t);
        continue;
      }
      // If add-on promotes applicability core ← conditional, replace.
      if (
        sameIsoPart.applicability === "conditional" &&
        t.applicability === "core"
      ) {
        merged.delete(
          sameIsoPart.iso_part + "::" + sameIsoPart.test_name
        );
        merged.set(t.iso_part + "::" + t.test_name, t);
      }
      // Otherwise the base row stays.
    }
  }
  return [...merged.values()];
}
