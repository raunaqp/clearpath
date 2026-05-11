import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { AuthShell } from "../../AuthShell";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const user = await getUser();
  if (!user) {
    // No session — the reset link wasn't used or has expired. Send them back.
    redirect("/reset-password");
  }
  return (
    <AuthShell
      eyebrow="Reset password"
      title="Choose a new password."
      intro="You're signed in via the reset link. Set a new password to finish."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
