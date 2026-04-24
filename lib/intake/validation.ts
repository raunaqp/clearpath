/**
 * Intake form validators — used client-side (blur + submit) and
 * mirrored server-side in /api/intake. Return a user-visible error
 * string, or null when the value is OK. Do NOT throw.
 */

export const ONE_LINER_MIN = 20;
export const ONE_LINER_MAX = 300;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLACEHOLDER_LEAK_RE = /^\s*e\.g\./i;

export function validateName(v: string): string | null {
  if (!v || !v.trim()) return "Please enter your name";
  return null;
}

export function validateEmail(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return "Please enter your email";
  if (!EMAIL_REGEX.test(t)) {
    return "Please enter a valid email, e.g. abc@xyz.com";
  }
  return null;
}

/**
 * Mobile is OPTIONAL. Return null for empty. When filled, require
 * exactly 10 digits (spaces, dashes, and a leading +91 prefix are
 * tolerated for display but stripped for the length check).
 */
export function validateMobile(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  // Strip an optional +91 prefix, then count digits.
  const withoutPrefix = t.replace(/^\+?91[\s-]*/, "");
  const digits = withoutPrefix.replace(/[^0-9]/g, "");
  if (digits.length !== 10) {
    return "Please enter a 10-digit mobile number";
  }
  return null;
}

export function validateOneLiner(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return "Please describe what your product does";
  if (PLACEHOLDER_LEAK_RE.test(t)) {
    return "Please replace the example text with your own product description";
  }
  if (t.length < ONE_LINER_MIN) {
    return "Please add more detail (at least 20 characters)";
  }
  if (t.length > ONE_LINER_MAX) {
    return "Keep it to 300 characters or under.";
  }
  return null;
}

export function validateUrl(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  if (!/^https?:\/\/.+\..+/.test(t)) {
    return "Enter a valid URL starting with http:// or https://";
  }
  return null;
}

export type IntakeErrors = Partial<{
  name: string;
  email: string;
  mobile: string;
  oneLiner: string;
  url: string;
}>;

export function runAllValidations(values: {
  name: string;
  email: string;
  mobile: string;
  oneLiner: string;
  url: string;
}): IntakeErrors {
  const errors: IntakeErrors = {};
  const n = validateName(values.name);
  if (n) errors.name = n;
  const e = validateEmail(values.email);
  if (e) errors.email = e;
  const m = validateMobile(values.mobile);
  if (m) errors.mobile = m;
  const o = validateOneLiner(values.oneLiner);
  if (o) errors.oneLiner = o;
  const u = validateUrl(values.url);
  if (u) errors.url = u;
  return errors;
}
