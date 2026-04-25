import type { ReadinessCard } from "@/lib/schemas/readiness-card";

/**
 * Certainty calibration post-processor.
 * See `.claude/skills/clearpath/SKILL.md` §1 — every user-visible string
 * runs through this so we never sound more certain than the regulator.
 */

const HARD_TO_SOFT: ReadonlyArray<readonly [string, string]> = [
  ["Class C SaMD", "likely Class B/C"],
  ["CDSCO required", "approval likely required"],
  ["MD-12 + MD-9 required", "SaMD pathway evolving · forms TBD"],
  ["SDF required", "may qualify as SDF"],
  ["predicate exists", "international comparables exist"],
  ["you need to", "you likely need to"],
  ["must file", "typically files"],
  ["is required", "is likely required"],
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Heuristic for matching the leading-character case-style of the matched
 * substring. If the original matched text starts with an uppercase letter,
 * uppercase the first character of the replacement; otherwise lowercase it.
 */
function matchLeadingCase(matched: string, replacement: string): string {
  if (replacement.length === 0) return replacement;
  const first = matched.charAt(0);
  if (!/[A-Za-z]/.test(first)) return replacement;
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.charAt(0).toLowerCase() + replacement.slice(1);
}

export function softenCertainty(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [hard, soft] of HARD_TO_SOFT) {
    const re = new RegExp(escapeRegex(hard), "gi");
    out = out.replace(re, (matched) => matchLeadingCase(matched, soft));
  }
  return out;
}

/**
 * Apply softenCertainty to every user-visible text field on a readiness card.
 * Returns a new object — does not mutate input.
 */
export function softenReadinessCard(card: ReadinessCard): ReadinessCard {
  const regKeys = [
    "cdsco_mdr",
    "cdsco_pharmacy",
    "dpdp",
    "icmr",
    "abdm",
    "nabh",
    "mci_telemed",
    "irdai",
    "nabl",
  ] as const;

  const softenedRegs = {} as ReadinessCard["regulations"];
  for (const k of regKeys) {
    const r = card.regulations[k];
    softenedRegs[k] = {
      ...r,
      rationale: softenCertainty(r.rationale),
      ...(r.pathway_note !== undefined
        ? { pathway_note: softenCertainty(r.pathway_note) }
        : {}),
    };
  }

  return {
    ...card,
    readiness: {
      ...card.readiness,
      note: softenCertainty(card.readiness.note),
    },
    risk: {
      ...card.risk,
      rationale: softenCertainty(card.risk.rationale),
    },
    regulations: softenedRegs,
    top_gaps: card.top_gaps.map((g) => ({
      ...g,
      gap_title: softenCertainty(g.gap_title),
      fix_action: softenCertainty(g.fix_action),
    })),
    verdict: softenCertainty(card.verdict),
    why_regulated: softenCertainty(card.why_regulated),
    tier0_card_tagline: softenCertainty(card.tier0_card_tagline),
    tier1_teaser: softenCertainty(card.tier1_teaser),
    tier2_teaser: softenCertainty(card.tier2_teaser),
  };
}
