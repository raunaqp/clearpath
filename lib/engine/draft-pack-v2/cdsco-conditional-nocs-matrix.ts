/**
 * CDSCO conditional NOCs matrix — source-of-truth lookup for §19.
 *
 * Feeds: section-19-conditional-nocs.ts.
 *
 * Co-edited with docs/seed-tables/cdsco-conditional-nocs-matrix.md.
 * The Markdown is the human-review surface
 * (per `feedback_moat_content_reviewable.md`); this .ts is what the
 * generator consumes.
 *
 * Why deterministic per-NOC content + only-emit-when-triggered: wrong-
 * included NOC sub-blocks are clear noise to a regulator, not a safety
 * win. So the standing blast-radius safeguard does NOT apply here —
 * §19 emits only the NOC sub-blocks whose trigger fires. Triggers
 * come from `section-gating.ts` exported helpers (drugContentNoc,
 * veterinaryNoc, radiationNoc, pndtNoc).
 */

export type NocKey = "dcg_i" | "dahd" | "barc_aerb" | "pndt";

export type NocBlock = {
  /** Founder-facing NOC name. */
  display_name: string;
  /** Authority issuing the NOC / approval. */
  authority: string;
  /** Applicable rule / Act / Rule citation. */
  applicable_rule: string;
  /** Plain-language trigger description (what marker / signal makes
   *  this NOC fire). */
  trigger_description: string;
  /** Per-NOC evidence-package attestation rows. */
  evidence_package: string[];
  /** Timeline placement vs the main MD-3 / MD-7 manufacturing licence. */
  timeline_placement: string[];
  /** Cross-section references the narrative should call out. */
  cross_refs: string[];
  /** [REVIEW] note for founder + CDSCO consultant sign-off. */
  review_note: string | null;
  /** Sign-off status. */
  review_status: "estimate" | "reviewed";
};

export const NOC_BLOCKS: Record<NocKey, NocBlock> = {
  dcg_i: {
    display_name: "DCG(I) joint review (combination product)",
    authority: "Drug Controller General (India), CDSCO",
    applicable_rule:
      "Drugs and Cosmetics Act 1940 §3(b); MD-7 checklist §11-12 for combination products; Bible §4.B Block 5",
    trigger_description:
      "Synthesizer `drug_content` marker is affirmative — device contains, releases, or pre-loads a drug, biological, or pharmacologically active substance.",
    evidence_package: [
      "Drug Master File covering chemistry, manufacturing, controls (CMC), pharmacology, toxicology, clinical safety/efficacy of the drug component",
      "Combination-product justification — why device + drug deliver a clinical benefit not achievable separately",
      "Pre-approval status of the drug component (new chemical entity vs previously-approved drug; route-of-administration novelty)",
      "Cross-reference to §8 Design & Manufacturing §8.12 medicinal-substances sub-block",
      "Cross-reference to §13 Biocompatibility ISO 10993-17 allowable-limits work covering drug + non-drug constituents",
      "Cross-reference to §12 Clinical Evidence — clinical data covering the combination product, not the components separately",
    ],
    timeline_placement: [
      "Joint review runs in parallel with the main MD-3 or MD-7 application.",
      "Grant of MD-5 / MD-9 typically waits for DCG(I) clearance.",
      "Pre-submission DCG(I) consultation is recommended for novel-drug combinations to scope toxicology requirements.",
    ],
    cross_refs: [
      "§8 Design & Manufacturing — §8.12 medicinal substances sub-block",
      "§13 Biocompatibility — ISO 10993-17 allowable limits",
      "§12 Clinical Evidence — combination-product clinical data",
    ],
    review_note:
      "Toxicology dossier scope differs significantly for previously-approved-drug vs novel-drug combinations — consultant call per submission.",
    review_status: "estimate",
  },

  dahd: {
    display_name: "DAHD NOC (veterinary)",
    authority:
      "Department of Animal Husbandry, Dairying and Fisheries (Ministry of Fisheries, Animal Husbandry and Dairying)",
    applicable_rule:
      "Bible Addendum FAQ §1-2; IVD FAQ §53(a)",
    trigger_description:
      "Synthesizer `veterinary_use` marker is not 'humans only' — device intended for veterinary use (animals only) or dual-use (humans + animals).",
    evidence_package: [
      "Veterinary intended-use statement",
      "Target species / species range",
      "Veterinary indication (diagnostic / therapeutic / monitoring)",
      "Declaration of veterinary-only vs dual-use (humans + animals)",
      "Cross-reference to §3 Intended Use (population statement must align)",
      "Cross-reference to §7 Labelling (veterinary labelling requirements)",
    ],
    timeline_placement: [
      "DAHD NOC accompanies MD-3 / MD-7 application — file together; NOC not granted independently of the manufacturing-licence pathway.",
    ],
    cross_refs: [
      "§3 Intended Use — population statement alignment",
      "§7 Labelling — veterinary labelling",
    ],
    review_note:
      "Dual-use products (humans + animals) — confirm whether separate human-use registration is also required.",
    review_status: "estimate",
  },

  barc_aerb: {
    display_name: "BARC NOC + AERB approval (ionising radiation)",
    authority:
      "Bhabha Atomic Research Centre (BARC) for the NOC; Atomic Energy Regulatory Board (AERB) for operational approval before patient use.",
    applicable_rule:
      "Bible Addendum §7 (ionising radiation devices); IVD FAQ §53(c) (radioactive content)",
    trigger_description:
      "Synthesizer `ionising_radiation` marker is affirmative — device emits ionising radiation (X-ray, CT, fluoroscopy, gamma) or contains radioactive sources (radioisotope, nuclear medicine).",
    evidence_package: [
      "Radioactive source / X-ray source specification — type, intensity, half-life (if applicable)",
      "Radiation safety officer designation + qualifications",
      "AERB type-approval certificate for the radiation-generating device class",
      "Site radiation plan covering installation, shielding, personnel exposure monitoring",
      "Cross-reference to §10 Risk Management — radiation-exposure hazards in the ISO 14971 file",
    ],
    timeline_placement: [
      "BARC NOC obtained before MD-3 / MD-7 application (NOC document accompanies submission).",
      "AERB approval is operational — required before the device is used on patients post-grant; site-specific.",
    ],
    cross_refs: [
      "§10 Risk Management — radiation-exposure hazards",
      "§4 Pathway — AERB cycle time can materially extend overall timeline",
    ],
    review_note:
      "AERB type-approval cycle time can extend the overall MD-3 / MD-7 timeline materially — flag in the §4 pathway timeline.",
    review_status: "estimate",
  },

  pndt: {
    display_name: "PNDT NOC (PCPNDT Act compliance)",
    authority:
      "Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Cell, Ministry of Health and Family Welfare",
    applicable_rule:
      "PCPNDT Act 1994 §3 + §4 — bans pre-natal sex determination; restricts ownership and transfer of capable equipment",
    trigger_description:
      "Sprint-4 candidate trigger — not currently inferred by the synthesizer. When a Sprint-4 wizard question or keyword scan flags ultrasound / pre-natal / fetal-sex / NIPT scope, the trigger fires.",
    evidence_package: [
      "Statement of non-applicability if device is NOT used for pre-natal sex determination",
      "OR PCPNDT procurement-only registration if device is sold to PCPNDT-registered facilities only",
      "Cross-reference to §3 Intended Use — explicit exclusion of pre-natal sex determination",
      "Cross-reference to §7 Labelling — required PCPNDT compliance statement on label",
    ],
    timeline_placement: [
      "Statement of non-applicability accompanies MD-3 / MD-7 submission.",
      "Procurement-only registration is operational — handled at sale time, not at MD-grant time.",
    ],
    cross_refs: [
      "§3 Intended Use — explicit exclusion of pre-natal sex determination",
      "§7 Labelling — PCPNDT compliance statement",
    ],
    review_note:
      "Sprint-4 candidate — add `pndt_in_scope` synthesizer marker fed by an ultrasound / pre-natal / NIPT keyword scan.",
    review_status: "estimate",
  },
};
