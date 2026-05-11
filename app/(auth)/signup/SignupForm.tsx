"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AuthInput,
  AuthLabel,
  AuthSubmit,
  AuthError,
} from "../AuthShell";
import { signupAction, type FormState } from "../actions";

export function SignupForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signupAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="return_to" value={returnTo} />
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
      <div>
        <AuthLabel htmlFor="password">Password</AuthLabel>
        <AuthInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <p className="text-xs text-[#6B766F] mt-1.5">
          Used to sign back in. We don&apos;t share it.
        </p>
      </div>
      <AuthError message={state?.error} />
      <AuthSubmit pending={pending}>Create account →</AuthSubmit>
      <p className="text-sm text-[#6B766F] text-center pt-2">
        Already have an account?{" "}
        <Link
          href={`/login${returnTo !== "/dashboard" ? `?return_to=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-[#0F6E56] underline underline-offset-2 hover:no-underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
