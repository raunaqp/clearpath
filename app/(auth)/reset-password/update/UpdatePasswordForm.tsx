"use client";

import { useActionState } from "react";
import {
  AuthInput,
  AuthLabel,
  AuthSubmit,
  AuthError,
} from "../../AuthShell";
import { updatePasswordAction, type FormState } from "../../actions";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updatePasswordAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <AuthLabel htmlFor="password">New password</AuthLabel>
        <AuthInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>
      <AuthError message={state?.error} />
      <AuthSubmit pending={pending}>Set new password →</AuthSubmit>
    </form>
  );
}
