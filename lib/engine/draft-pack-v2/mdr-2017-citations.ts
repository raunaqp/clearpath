/**
 * Verified MDR-2017 citation anchors for hardware-overlay generators.
 *
 * Why this file exists: a §3 stent dump (Sprint 3 Day 5 afternoon)
 * surfaced a hallucinated "Schedule III of MDR 2017" reference. The
 * LLM reached for a Schedule citation because it knew the body-contact
 * tier needed one; with no anchor in the prompt, it invented an
 * Indian-regulatory-plausible-but-wrong reference. A CDSCO consultant
 * would catch it on first review.
 *
 * Fix pattern: every hardware-overlay generator that asks Sonnet to
 * cite MDR-2017 Schedules embeds the verified-citations block from
 * `MDR_2017_VERIFIED_CITATIONS_BLOCK` in its user message. The LLM
 * is instructed to use only references from that block and to fall
 * back to `[REVIEW: schedule reference uncertain]` if it would
 * otherwise invent one.
 *
 * Schedules are spelled out (Indian regulatory writing convention),
 * never Roman numerals ("Fifth Schedule", not "Schedule V").
 *
 * Sourced from `docs/specs/cdsco-regulatory-forms-reference.md`:
 *   First Schedule  — bible lines 114, 116, 751
 *   Second Schedule — bible line 251
 *   Third Schedule  — not enumerated in the bible quick references; [REVIEW]
 *   Fourth Schedule — bible lines 198–199, 255, 285
 *   Fifth Schedule  — bible lines 196, 270, 273, 283
 *   Sixth Schedule  — bible lines 233, 237
 *   Seventh Schedule — bible lines 215, 951, 1041, 1060
 *
 * Consumed by: section-03-intended-use.ts (hardware overlay) and any
 * future hardware overlay (§6 / §8 / §11 / §12 in Sprint 3 Day-5
 * afternoon) that needs to cite MDR-2017 Schedules.
 */

/** Single Schedule entry. Body strings are short, factual descriptions
 *  drawn from bible quick references — not pulled from MDR-2017 text
 *  directly. */
export type MdrSchedule = {
  /** Indian regulatory convention: written-out ordinal, never Roman. */
  display_name: string;
  /** Plain-language scope of the Schedule. */
  scope: string;
  /** Source confidence: confirmed = bible quick reference;
   *  review = not directly enumerated, founder/consultant to confirm. */
  review_status: "confirmed" | "review";
  /** Bible line citations supporting this entry. Empty when review. */
  bible_lines: number[];
};

export const MDR_2017_SCHEDULES: ReadonlyArray<MdrSchedule> = [
  {
    display_name: "First Schedule",
    scope:
      "Risk classification of medical devices into Class A/B/C/D. Part I covers devices; Part II covers IVDs.",
    review_status: "confirmed",
    bible_lines: [114, 116, 751],
  },
  {
    display_name: "Second Schedule",
    scope: "Fee structure / fee challan for applications.",
    review_status: "confirmed",
    bible_lines: [251],
  },
  {
    display_name: "Third Schedule",
    scope: "[REVIEW] — not enumerated in the bible's quick references.",
    review_status: "review",
    bible_lines: [],
  },
  {
    display_name: "Fourth Schedule",
    scope:
      "Plant Master File (Appendix I) + Device Master File (Appendix II) + Essential Principles.",
    review_status: "confirmed",
    bible_lines: [198, 199, 255, 285],
  },
  {
    display_name: "Fifth Schedule",
    scope:
      "Quality Management System requirements (incl. Annexure A environmental requirements).",
    review_status: "confirmed",
    bible_lines: [196, 270, 273, 283],
  },
  {
    display_name: "Sixth Schedule",
    scope: "Post-Market Surveillance + vigilance reporting.",
    review_status: "confirmed",
    bible_lines: [233, 237],
  },
  {
    display_name: "Seventh Schedule",
    scope:
      "Clinical Investigation Plan + Investigator's Brochure (clinical investigation framework).",
    review_status: "confirmed",
    bible_lines: [215, 951, 1041, 1060],
  },
];

/** Prompt-injection block for the user message of any hardware-overlay
 *  generator that may cite MDR-2017 Schedules. Embed verbatim in the
 *  user message, typically under a "## Verified citation anchors"
 *  heading.
 *
 *  The instruction at the bottom is the load-bearing piece: it tells
 *  the LLM to use ONLY the verified list and to mark uncertain
 *  references rather than invent. */
export const MDR_2017_VERIFIED_CITATIONS_BLOCK: string = (() => {
  const lines: string[] = [];
  lines.push("## Verified MDR-2017 Schedule citations");
  lines.push("");
  lines.push(
    "When referring to an MDR-2017 Schedule, use ONLY the entries below. Indian regulatory convention writes the ordinal in full (\"Fifth Schedule\"), never Roman numeral (\"Schedule V\")."
  );
  lines.push("");
  for (const s of MDR_2017_SCHEDULES) {
    const reviewTag = s.review_status === "review" ? " [REVIEW]" : "";
    lines.push(`- **${s.display_name}**${reviewTag}: ${s.scope}`);
  }
  lines.push("");
  lines.push(
    "If you would otherwise need to cite an MDR-2017 Schedule that is NOT in the list above, do NOT invent one. Write `[REVIEW: Schedule reference uncertain]` instead, and the founder / CDSCO consultant will fill it in. This list is the verified subset; \"Schedule III\" or any Roman-numeral form is not in it and must not appear."
  );
  return lines.join("\n");
})();
