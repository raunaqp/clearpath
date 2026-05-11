import Link from "next/link";
import { AuthShell } from "../../AuthShell";

export const dynamic = "force-dynamic";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthShell
      eyebrow="One more step"
      title="Check your email."
      intro={
        email
          ? `We sent a confirmation link to ${email}. Click it to finish creating your account.`
          : "We sent you a confirmation link. Click it to finish creating your account."
      }
    >
      <p className="text-sm text-[#6B766F] leading-relaxed">
        The link expires after 24 hours. If you don&apos;t see the email, check
        spam or{" "}
        <Link
          href="/signup"
          className="text-[#0F6E56] underline underline-offset-2 hover:no-underline"
        >
          try again with a different email
        </Link>
        .
      </p>
    </AuthShell>
  );
}
