import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { AuthShell, AuthError } from "../AuthShell";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

const ERROR_COPY: Record<string, string> = {
  missing_token:
    "The verification link is missing its token. The Supabase email templates need to be updated to the SSR token-hash format — see Story 2.2 follow-up notes.",
  missing_code:
    "The verification link is missing its code. Try requesting a new link.",
  verify_failed:
    "That verification link has expired or has already been used. Request a new one.",
  exchange_failed:
    "The verification link could not be exchanged for a session. Request a new one.",
  unknown_type: "Unknown auth flow type. Try the email link again.",
  auth_not_configured:
    "Auth isn't configured on this deployment yet (missing NEXT_PUBLIC_SUPABASE_ANON_KEY).",
};

function sanitizeReturnTo(raw: string | string[] | undefined): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const { return_to, error } = await searchParams;
  const returnTo = sanitizeReturnTo(return_to);
  const user = await getUser();
  if (user) redirect(returnTo);

  const errorMsg = error ? ERROR_COPY[error] ?? "Something went wrong with that link." : undefined;

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to ClearPath."
      intro="Your Readiness Cards and Draft Packs in one place."
    >
      {errorMsg ? (
        <div className="mb-4">
          <AuthError message={errorMsg} />
        </div>
      ) : null}
      <LoginForm returnTo={returnTo} />
    </AuthShell>
  );
}
