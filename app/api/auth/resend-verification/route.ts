/**
 * Sprint 2 closeout — resend the Supabase verification email for the
 * signed-in user. Used by EmailVerifyGate on /upgrade/[id].
 *
 * POST /api/auth/resend-verification { return_to?: string }
 *
 * Uses the customer's session (via cookie). Supabase's auth.resend
 * dispatches a fresh "signup" confirmation email; the link redirects
 * back to /auth/callback?next=<return_to>.
 *
 * Note: in Sprint 2 we don't ship transactional email (SMTP lands
 * Sprint 4). Supabase's built-in email-from-Supabase channel is the
 * only path — fine for the testing window before SMTP comes online.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerSupabase } from "@/lib/auth/supabase-server";
import { getUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function safeReturnTo(raw: unknown): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

// AUTH ONLY: requires sign-in but no per-assessment ownership join —
// the user is asking to resend their own verification email. Inline
// `getUser()` check below stays; helper not introduced because there
// is no ownership decision and no PII leak path here.
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (user.emailConfirmedAt) {
    return NextResponse.json({
      ok: true,
      already_verified: true,
    });
  }

  let body: { return_to?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }
  const returnTo = safeReturnTo(body.return_to);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });

  if (error) {
    console.error("[resend-verification]", error.message);
    return NextResponse.json(
      { error: "resend_failed", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
