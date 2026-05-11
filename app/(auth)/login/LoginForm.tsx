"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AuthInput,
  AuthLabel,
  AuthSubmit,
  AuthError,
} from "../AuthShell";
import { loginAction, type FormState } from "../actions";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    loginAction,
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
        <div className="flex items-center justify-between mb-1.5">
          <AuthLabel htmlFor="password">Password</AuthLabel>
          <Link
            href="/reset-password"
            className="text-xs text-[#0F6E56] underline underline-offset-2 hover:no-underline"
          >
            Forgot?
          </Link>
        </div>
        <AuthInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <AuthError message={state?.error} />
      <AuthSubmit pending={pending}>Sign in →</AuthSubmit>
      <p className="text-sm text-[#6B766F] text-center pt-2">
        New here?{" "}
        <Link
          href={`/signup${returnTo !== "/dashboard" ? `?return_to=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-[#0F6E56] underline underline-offset-2 hover:no-underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
