/**
 * Pick a hero-friendly product name from the pitch-extract + intake
 * one-liner, in priority order:
 *   1. AI-extracted `device_name` (e.g. "RetinaFlag DR", "CerviAI",
 *      "Bioresorbable Cardiac Stent") when ≤60 chars — preserves
 *      brand casing.
 *   2. AI-extracted `intended_use_one_liner` — curated short form;
 *      noun-phrase chopped to keep just the noun phrase.
 *   3. The raw assessment `one_liner` — last-resort noun-phrase chop.
 *
 * Returns `""` when no source is available; callers fall back to
 * `assessment.name` or "Your device" in that case.
 *
 * Sprint 3 Day 5 EOD — extracted from `lib/engine/readiness-report-
 * trigger.ts` into its own module because three other call sites
 * (`scripts/regen-report-pdf.ts`, `scripts/verify-short-device-name.ts`,
 * `scripts/generate-readiness-report-sample.ts`) had each grown their
 * own copy or — worse, the sample script — used the wrong helper
 * (`displayName(one_liner)` which is a dumb 40-char clamp + "…").
 * That divergence rendered "A bioresorbable cardiac stent for…" in
 * the founder's hero. Single source of truth ends the drift.
 */

import type { PitchAiExtracted } from "@/lib/intake/ai-extract";

export function shortDeviceName(
  ai: PitchAiExtracted | null,
  oneLiner: string
): string {
  // 1. Prefer the deck-extracted device_name when it's short enough to
  //    fit the hero card (~1 line at the heroTitle font size).
  if (ai?.device_name) {
    const cleaned = ai.device_name.trim();
    if (cleaned.length > 0 && cleaned.length <= 60) return cleaned;
  }

  // 2. Derive from the curated short one-liner if available; else the
  //    raw assessment one_liner.
  const source =
    (ai?.intended_use_one_liner ?? "").trim() || oneLiner.trim();
  if (!source) return "";

  return deriveNounPhrase(source);
}

function deriveNounPhrase(source: string): string {
  // Strip a leading article + trailing punctuation, then cut at the
  // first clause-break stop word so we keep just the noun phrase.
  const trimmed = source
    .replace(/^(A|An|The)\s+/i, "")
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  const STOP_WORDS =
    /\b(for|to|that|which|designed|intended|used|enabling|enables|enable|powered|by|with|in|when|while|so\s+that|aimed|aims)\b/i;
  const match = trimmed.match(STOP_WORDS);
  let head = match ? trimmed.slice(0, match.index).trim() : trimmed;
  const words = head.split(/\s+/).filter(Boolean);
  if (words.length > 5) head = words.slice(0, 5).join(" ");
  if (!head) return source.slice(0, 40).trim();
  return titleCase(head);
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => {
      if (!w) return w;
      // Preserve all-caps acronyms (≥2 uppercase letters).
      if (/^[A-Z]{2,}$/.test(w)) return w;
      // Preserve already-title-cased words (e.g. "RetinaFlag").
      if (/^[A-Z][a-z]+[A-Z]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}
