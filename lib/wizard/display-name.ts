/**
 * Derives the header product display name from the intake one-liner.
 * Word-boundary truncation at ~40 chars.
 */
export function displayName(oneLiner: string): string {
  const max = 40;
  if (oneLiner.length <= max) return oneLiner;
  const truncated = oneLiner.slice(0, max);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 20) {
    return truncated.slice(0, lastSpace) + "…";
  }
  return truncated + "…";
}
