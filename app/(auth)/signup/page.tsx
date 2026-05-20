import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

function sanitizeReturnTo(raw: string | string[] | undefined): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function SignupPage({
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
      eyebrow="Create an account"
      title="Save your work and unlock paid tiers."
      intro="One account holds your Readiness Cards, Readiness Reports, and any Submission Workspaces you open. Free to create."
    >
      <SignupForm returnTo={returnTo} />
    </AuthShell>
  );
}
