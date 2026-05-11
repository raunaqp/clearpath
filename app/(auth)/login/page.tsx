import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

function sanitizeReturnTo(raw: string | string[] | undefined): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const { return_to } = await searchParams;
  const returnTo = sanitizeReturnTo(return_to);
  const user = await getUser();
  if (user) redirect(returnTo);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to ClearPath."
      intro="Your Readiness Cards and Draft Packs in one place."
    >
      <LoginForm returnTo={returnTo} />
    </AuthShell>
  );
}
