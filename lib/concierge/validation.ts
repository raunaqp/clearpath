/**
 * Concierge waitlist validators — used client-side (blur + submit) and
 * mirrored server-side in /api/concierge/submit. Each returns a
 * user-visible error string, or null when the value is OK. Do NOT throw.
 */

import { EMAIL_REGEX, validateEmail, validateMobile, validateName } from "@/lib/intake/validation";

export const CONTEXT_MAX_WORDS = 200;
export const PRODUCT_NAME_MAX = 200;
export const CDSCO_APP_MAX = 80;

export const JOURNEY_STAGE_VALUES = [
  "not_started",
  "0_3_months",
  "3_6_months",
  "6_12_months",
  "12_24_months",
  "over_24_months",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGE_VALUES)[number];

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  not_started: "Not started yet",
  "0_3_months": "0–3 months",
  "3_6_months": "3–6 months",
  "6_12_months": "6–12 months",
  "12_24_months": "12–24 months",
  over_24_months: "24+ months",
};

export function validateJourneyStage(v: string): string | null {
  if (!v) return "Please pick how long you've been on this journey";
  if (!(JOURNEY_STAGE_VALUES as readonly string[]).includes(v)) {
    return "Please pick a valid option";
  }
  return null;
}

export { EMAIL_REGEX, validateEmail, validateMobile, validateName };

export function validateProductName(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return "Please enter the product name";
  if (t.length > PRODUCT_NAME_MAX) {
    return `Keep the product name under ${PRODUCT_NAME_MAX} characters`;
  }
  return null;
}

export function validateCdscoApplicationNumber(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  if (t.length > CDSCO_APP_MAX) {
    return `Keep the application number under ${CDSCO_APP_MAX} characters`;
  }
  return null;
}

export function validateTargetDate(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return "Please pick a target submission/response date";
  // YYYY-MM-DD shape
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return "Please pick a valid date";
  }
  const parsed = Date.parse(t);
  if (Number.isNaN(parsed)) {
    return "Please pick a valid date";
  }
  return null;
}

export function countWords(v: string): number {
  const t = (v ?? "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function validateContext(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return "Please share a brief context";
  const words = countWords(t);
  if (words > CONTEXT_MAX_WORDS) {
    return `Keep it to ${CONTEXT_MAX_WORDS} words or under (currently ${words}).`;
  }
  return null;
}

export type ConciergeErrors = Partial<{
  name: string;
  email: string;
  mobile: string;
  product_name: string;
  journey_stage: string;
  context: string;
}>;

export type ConciergeValues = {
  name: string;
  email: string;
  mobile: string;
  product_name: string;
  journey_stage: string;
  context: string;
};

export function runAllValidations(values: ConciergeValues): ConciergeErrors {
  const errors: ConciergeErrors = {};
  const n = validateName(values.name);
  if (n) errors.name = n;
  const e = validateEmail(values.email);
  if (e) errors.email = e;
  const m = validateMobile(values.mobile);
  if (m) errors.mobile = m;
  const p = validateProductName(values.product_name);
  if (p) errors.product_name = p;
  const j = validateJourneyStage(values.journey_stage);
  if (j) errors.journey_stage = j;
  const ctx = validateContext(values.context);
  if (ctx) errors.context = ctx;
  return errors;
}

/** Days from today to the target date (positive = future). */
export function daysUntil(dateStr: string): number | null {
  const t = (dateStr ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const parsed = Date.parse(t + "T00:00:00Z");
  if (Number.isNaN(parsed)) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((parsed - todayUtc) / (24 * 60 * 60 * 1000));
}

/** Best-effort name extraction from email username (e.g. "raunaq" from "raunaq@x.com"). */
export function nameFromEmail(email: string): string | null {
  const t = (email ?? "").trim().toLowerCase();
  if (!t || !EMAIL_REGEX.test(t)) return null;
  const local = t.split("@")[0];
  if (!local) return null;
  // Take the first chunk before . _ - + and capitalise.
  const first = local.split(/[._\-+]/)[0];
  if (!first || !/^[a-z]+$/i.test(first)) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}
