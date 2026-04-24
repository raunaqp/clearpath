export const Q2_DECISION_SUPPORT_PHRASES: readonly string[] = [
  "recommends",
  "prompts",
  "guides",
  "suggests action",
  "alerts",
  "flags",
  "escalates",
  "notifies clinician",
  "suggests referral",
];

/**
 * Case-insensitive substring scan. Returns up to 3 distinct phrases in the
 * order they appear in `Q2_DECISION_SUPPORT_PHRASES` (not in the order they
 * appear inside `text`). Returns [] when `text` is empty or nothing matches.
 */
export function scanForDecisionSupport(text: string): string[] {
  if (!text) return [];
  const haystack = text.toLowerCase();
  const matches: string[] = [];
  for (const phrase of Q2_DECISION_SUPPORT_PHRASES) {
    if (haystack.includes(phrase.toLowerCase())) {
      matches.push(phrase);
      if (matches.length >= 3) break;
    }
  }
  return matches;
}
