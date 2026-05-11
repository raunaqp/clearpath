import { AuthShell } from "../AuthShell";
import { ResetRequestForm } from "./ResetRequestForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Forgot your password?"
      intro="Enter your account email and we'll send you a link to set a new one."
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
