/**
 * Concierge waitlist validators — used client-side (blur + submit) and
 * mirrored server-side in /api/concierge/submit. Each returns a
 * user-visible error string, or null when the value is OK. Do NOT throw.
 */

import { EMAIL_REGEX, validateEmail, validateMobile, validateName } from "@/lib/intake/validation";

export const CONTEXT_MAX_WORDS = 200;
export const PRODUCT_NAME_MAX = 200;
export const CDSCO_APP_MAX = 80;

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
  cdsco_application_number: string;
  target_submission_date: string;
  context: string;
}>;

export type ConciergeValues = {
  name: string;
  email: string;
  mobile: string;
  product_name: string;
  cdsco_application_number: string;
  target_submission_date: string;
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
  const c = validateCdscoApplicationNumber(values.cdsco_application_number);
  if (c) errors.cdsco_application_number = c;
  const t = validateTargetDate(values.target_submission_date);
  if (t) errors.target_submission_date = t;
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
