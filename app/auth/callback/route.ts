import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase, isAuthConfigured } from "@/lib/auth/supabase-server";

// Handles every email-link auth flow Supabase sends users back through:
//
// 1. Token-hash flow (recommended for SSR — Supabase templates customised
//    to send users to `?token_hash={{ .TokenHash }}&type={{ .EmailActionType }}`).
//    We call verifyOtp({ type, token_hash }) which sets the session cookies.
//
// 2. PKCE code flow (`?code=...`), used by some OAuth/magiclink setups.
//    We call exchangeCodeForSession(code).
//
// The default Supabase template (`{{ .ConfirmationURL }}` → `/auth/v1/verify`)
// sends the session back in a URL hash fragment, which the server cannot
// read. If templates aren't customised, users land here without `code` or
// `token_hash` and we bounce them to /login with a clear error. The fix
// is in Supabase Dashboard → Authentication → Email Templates; see Story
// 2.2 follow-up notes in the commit body.
//
// Destination after verification branches on the auth `type`:
//   recovery     → /reset-password/update      (session is short-lived; user must set new password)
//   signup       → /dashboard                  (or `next` / `return_to` if specified)
//   magiclink    → /dashboard                  (same)
//   email_change → /dashboard                  (same)
//   unknown      → /login?error=...            (fail closed)

type SupabaseOtpType =
  | "signup"
  | "recovery"
  | "magiclink"
  | "email_change"
  | "invite"
  | "email";

const KNOWN_TYPES: SupabaseOtpType[] = [
  "signup",
  "recovery",
  "magiclink",
  "email_change",
  "invite",
  "email",
];

function safePath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function destinationFor(type: string | null, explicit: string | null): string {
  // Explicit `next` / `return_to` always wins for non-recovery types; recovery
  // must land on the password form so the user can actually set a new pw.
  if (type === "recovery") return "/reset-password/update";
  return explicit ?? "/dashboard";
}

function asOtpType(raw: string | null): SupabaseOtpType | null {
  if (!raw) return null;
  return (KNOWN_TYPES as string[]).includes(raw) ? (raw as SupabaseOtpType) : null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = url.searchParams;

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=auth_not_configured", url.origin));
  }

  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const typeRaw = params.get("type");
  const explicitNext = safePath(params.get("next")) ?? safePath(params.get("return_to"));

  const supabase = await getServerSupabase();

  if (tokenHash) {
    const otpType = asOtpType(typeRaw);
    if (!otpType) {
      return NextResponse.redirect(new URL("/login?error=unknown_type", url.origin));
    }
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=verify_failed&type=${otpType}`, url.origin)
      );
    }
    return NextResponse.redirect(new URL(destinationFor(otpType, explicitNext), url.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=exchange_failed", url.origin));
    }
    return NextResponse.redirect(new URL(destinationFor(typeRaw, explicitNext), url.origin));
  }

  // No token_hash and no code — the user came back via the default Supabase
  // template that puts the session in a URL fragment. The server can't read
  // it. Send them to /login with a clear signal; the fix is in Supabase
  // email templates (see route header comment).
  return NextResponse.redirect(new URL("/login?error=missing_token", url.origin));
}
