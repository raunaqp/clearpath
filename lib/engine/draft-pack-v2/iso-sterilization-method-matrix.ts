/**
 * ISO sterilization method matrix — source-of-truth lookup for §14.
 *
 * Feeds: section-14-sterilization.ts.
 *
 * Co-edited with docs/seed-tables/iso-sterilization-method-matrix.md.
 * The Markdown is the human-review surface (per
 * `feedback_moat_content_reviewable.md`); this .ts is what the
 * generator consumes. Same content, two formats.
 *
 * Why deterministic: same reasoning as the ISO 10993 tier matrix —
 * an LLM picking the method panel or omitting a key validation step
 * is a regulator-catchable content error the editor can't fix. The
 * LLM only writes narrative around this table.
 *
 * Why we emit all four methods when sterile=yes: the synthesizer's
 * `sterile` marker is yes/no only (bible §4.D #1 — sterilisation mode
 * is a Sprint-3 wizard-question gap). The blast-radius safe path is to
 * surface all four methods and let the founder remove the inapplicable
 * ones in the editor. A wrong-omitted method is invisible; a wrong-
 * included method is removable.
 */

/** Sterilization methods CDSCO recognises. */
export type SterilizationMethod = "eto" | "radiation" | "steam" | "aseptic";

export type ValidationStep = {
  label: string;
  /** Short rationale rendered into the per-method block. */
  rationale: string;
};

export type SterilizationMethodBlock = {
  /** Founder-facing method name. */
  display_name: string;
  /** Primary ISO standard reference. */
  primary_standard: string;
  /** SAL convention statement. */
  sal_convention: string;
  /** Material-compatibility constraint. */
  material_compat_note: string;
  /** One-line key gotcha — shown in the summary table + at the top
   *  of the method block. */
  key_gotcha: string;
  /** Validation steps the dossier needs to cover. Each renders as a
   *  ## sub-block + `- [ ]` attestation rows in the section content. */
  validation_steps: ValidationStep[];
  /** Byproduct concerns specific to this method. */
  byproduct_concerns: string[];
  /** Sterile barrier expectations specific to this method. */
  sterile_barrier_notes: string[];
  /** [REVIEW] note targeted for founder + CDSCO consultant sign-off
   *  on uncertain cells. */
  review_note: string | null;
  /** Sign-off status. "estimate" until reviewed. */
  review_status: "estimate" | "reviewed";
};

/** Per-method block. Codifies the same content as
 *  docs/seed-tables/iso-sterilization-method-matrix.md. */
export const STERILIZATION_METHODS: Record<
  SterilizationMethod,
  SterilizationMethodBlock
> = {
  eto: {
    display_name: "Ethylene oxide (EtO)",
    primary_standard: "ISO 11135:2014",
    sal_convention: "10⁻⁶ standard",
    material_compat_note:
      "Most polymers + metals; sensitive to moisture for some materials.",
    key_gotcha:
      "Residuals — ISO 10993-7 sets limits on residual EtO and ethylene chlorohydrin (ECH); long aeration cycles required.",
    validation_steps: [
      {
        label: "Bioburden characterisation (ISO 11737-1)",
        rationale: "Pre-sterilization microbial load.",
      },
      {
        label: "Process challenge device (PCD) qualification + BI placement",
        rationale: "Biological indicators verify the lethality challenge.",
      },
      {
        label:
          "Process parameter validation: gas concentration, humidity, temperature, exposure time, aeration time",
        rationale: "Each parameter linked to acceptance criteria.",
      },
      {
        label: "Cycle development + half-cycle verification (overkill or bioburden method)",
        rationale: "Establishes the validated routine cycle.",
      },
      {
        label: "Residual testing per ISO 10993-7 — residual EtO + ECH within limits",
        rationale: "Cross-references §13 chemical characterization.",
      },
      {
        label: "Routine release strategy — parametric or BI-based (state which)",
        rationale: "Drives per-batch release record content.",
      },
    ],
    byproduct_concerns: [
      "Residual EtO + ethylene chlorohydrin per ISO 10993-7 — Tier 1 / Tier 2 limits per duration of contact.",
    ],
    sterile_barrier_notes: [
      "Packaging qualification per ISO 11607-1/-2 with EtO-permeable material (Tyvek typical).",
      "Shelf-life claim cross-referenced with §15 Stability.",
    ],
    review_note:
      "Routine release strategy (parametric vs BI) is device-family specific — consultant call.",
    review_status: "estimate",
  },

  radiation: {
    display_name: "Radiation (gamma / e-beam / X-ray)",
    primary_standard: "ISO 11137-1/-2/-3",
    sal_convention: "10⁻⁶ at 25 kGy reference dose",
    material_compat_note:
      "Metals + many polymers OK; PP / PVC degrade; resorbable polymers (PLA/PLGA) accelerated degradation under dose.",
    key_gotcha:
      "Material degradation — cumulative dose affects mechanical properties; bioresorbable matrices particularly affected.",
    validation_steps: [
      {
        label: "Bioburden characterisation (ISO 11737-1)",
        rationale: "Establishes the initial microbial load.",
      },
      {
        label:
          "Dose verification per ISO 11137-2 — VDmax25 or Method 1 dose audit",
        rationale: "Confirms 25 kGy (or chosen dose) achieves SAL 10⁻⁶.",
      },
      {
        label: "Dose mapping",
        rationale: "Min + max dose across load configuration.",
      },
      {
        label: "Material compatibility verification post-dose",
        rationale: "Device performance unchanged after cumulative validated dose.",
      },
      {
        label: "Routine release: dose monitor per batch",
        rationale: "Continuous-process dosimetry record.",
      },
    ],
    byproduct_concerns: [
      "Polymer degradation: PP, PVC, some adhesives fail.",
      "Bioresorbable polymers (PLA, PLGA) accelerate degradation under dose — gamma typically avoided; e-beam at lower validated doses may be acceptable with bridging studies.",
      "Drug stability under dose — drug-eluting devices typically use lower-dose e-beam or shift to aseptic.",
    ],
    sterile_barrier_notes: [
      "Packaging qualification per ISO 11607-1/-2; radiation-stable materials selected.",
      "Shelf-life claim cross-referenced with §15 Stability (degradation kinetics matter).",
    ],
    review_note:
      "Lower-dose e-beam protocols for bioresorbable / drug-eluting cases are site- and device-specific — consultant call.",
    review_status: "estimate",
  },

  steam: {
    display_name: "Steam / moist heat (autoclave)",
    primary_standard: "ISO 17665-1:2006 (rev. ISO 17665:2024)",
    sal_convention: "10⁻⁶ standard",
    material_compat_note:
      "Limited to heat-stable + moisture-tolerant materials only — metals, PTFE, PEEK, some glass. Most plastics, all electronics, all drug-loaded devices, all bioresorbable polymers fail.",
    key_gotcha:
      "Material compatibility — not suitable for most plastics, drug-loaded devices, electronics, or temperature-sensitive devices.",
    validation_steps: [
      {
        label: "Bioburden characterisation (ISO 11737-1)",
        rationale: "Pre-sterilization microbial load.",
      },
      {
        label: "Heat-penetration / F0 (lethality) study",
        rationale: "Verify each load configuration receives the required F0.",
      },
      {
        label: "Biological indicator (BI) placement at coldest point of load + kill verification",
        rationale: "Confirms the lethality model in worst-case load location.",
      },
      {
        label: "Cycle qualification — temperature, pressure, time",
        rationale: "Each parameter linked to acceptance criteria.",
      },
      {
        label: "Empty-chamber + loaded-chamber commissioning",
        rationale: "Establishes operational envelope of the autoclave.",
      },
      {
        label: "Routine release: parametric (F0) or BI confirmation",
        rationale: "Drives per-batch release record content.",
      },
    ],
    byproduct_concerns: [
      "No chemical residuals (steam + heat) — simplifies ISO 10993-7 obligations.",
    ],
    sterile_barrier_notes: [
      "Packaging qualification per ISO 11607-1/-2 with steam-tolerant materials (paper / Tyvek / specific film blends).",
      "Shelf-life claim cross-referenced with §15 Stability.",
    ],
    review_note:
      "F0 target — 121 °C / 15 min is the common reference but device-specific cycles may apply.",
    review_status: "estimate",
  },

  aseptic: {
    display_name: "Aseptic processing",
    primary_standard:
      "ISO 13408 series + ISO 11737 + ISO 14644 (cleanroom)",
    sal_convention:
      "Harder to achieve 10⁻⁶; typically used when terminal sterilization is incompatible.",
    material_compat_note:
      "Any material — components sterilized separately + assembled aseptically.",
    key_gotcha:
      "Process-control intensive — process simulation (media fills) + continuous environmental monitoring required. Widely used for drug-eluting + bioresorbable devices.",
    validation_steps: [
      {
        label: "Process simulation (media fills) at the production line",
        rationale: "Simulate worst-case aseptic operation with growth medium.",
      },
      {
        label: "Environmental monitoring programme — viable + non-viable particles (ISO 14644)",
        rationale: "Cleanroom class A/B/C/D maintained per the process.",
      },
      {
        label: "Bioburden monitoring at each upstream processing stage (ISO 11737-1)",
        rationale: "Tracks microbial load through assembly.",
      },
      {
        label: "Operator gowning + behaviour qualification",
        rationale: "Personnel are the primary contamination source in aseptic.",
      },
      {
        label: "Component sterilization upstream",
        rationale:
          "Pre-sterilized components enter aseptic processing; each component carries its own sterilization validation.",
      },
      {
        label: "Routine release: continuous environmental monitoring + periodic process simulation",
        rationale: "Aseptic does not have a terminal-process release record.",
      },
    ],
    byproduct_concerns: [
      "No chemical or radiation byproducts.",
      "SAL claim — typically harder to achieve 10⁻⁶ through aseptic processing; some submissions claim a nominal SAL with strong process-control justification.",
    ],
    sterile_barrier_notes: [
      "Component sterilization standards apply upstream (per chosen method per component).",
      "Final packaging qualification per ISO 11607-1/-2.",
    ],
    review_note:
      "Scope of process-simulation programme + cleanroom-class anchor are operationally heavy — consultant + facilities engineering call.",
    review_status: "estimate",
  },
};

/** Method-selection constraints by device profile. The §14 narrative
 *  references these when the device profile triggers them. */
export type MethodSelectionConstraint = {
  trigger: string;
  guidance: string;
};

export const METHOD_SELECTION_CONSTRAINTS: ReadonlyArray<MethodSelectionConstraint> =
  [
    {
      trigger: "drug_eluting",
      guidance:
        "High-dose gamma typically degrades the drug; EtO may leave residuals on drug surface that complicate ISO 10993-17 allowable-limits work; aseptic processing is the typical industry default for drug-eluting coronary stents and similar devices. The §13 drug-eluting overlay (ISO 10993-17 + -18 + -16) scope shifts with the chosen sterilization method.",
    },
    {
      trigger: "bioresorbable",
      guidance:
        "Gamma accelerates degradation of resorbable polymers (PLA, PLGA, Mg alloys); e-beam at lower validated doses may work but requires bridging studies; aseptic or low-dose e-beam are typical paths. The §13 bioresorbable overlay (ISO 10993-13/-14/-15 degradation products) is sensitive to the sterilization-induced baseline degradation.",
    },
  ];

/** Cross-cutting concerns the narrative ties together — same set
 *  regardless of method. */
export const CROSS_CUTTING_CONCERNS: ReadonlyArray<string> = [
  "Bioburden control before sterilization (ISO 11737-1)",
  "Sterility testing in process validation (ISO 11737-2 — not a release test, but used in validation)",
  "Sterile barrier system qualification (ISO 11607-1/-2) with shelf-life claim aligned to §15 Stability",
  "Sterilization-changes-leachables sequencing — §14 validation precedes final §13 ISO 10993-17 / -18; pre-sterilization leachables data requires a bridging justification",
];
