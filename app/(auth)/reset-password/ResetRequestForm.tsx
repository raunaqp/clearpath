"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AuthInput,
  AuthLabel,
  AuthSubmit,
  AuthError,
  AuthOk,
} from "../AuthShell";
import { requestPasswordResetAction, type FormState } from "../actions";

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <AuthLabel htmlFor="email">Email</AuthLabel>
        <AuthInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </div>
      <AuthError message={state?.error} />
      <AuthOk message={state?.ok} />
      <AuthSubmit pending={pending}>Email me a reset link</AuthSubmit>
      <p className="text-sm text-[#6B766F] text-center pt-2">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-[#0F6E56] underline underline-offset-2 hover:no-underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
