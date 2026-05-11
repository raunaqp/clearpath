"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { getServerSupabase } from "@/lib/auth/supabase-server";

const SignupSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

const ResetRequestSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

const UpdatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type FormState = {
  error?: string;
  ok?: string;
} | null;

function safeReturnTo(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const returnTo = safeReturnTo(formData.get("return_to") as string | null);
  const supabase = await getServerSupabase();
  const origin = await originFromHeaders();
  // emailRedirectTo is where Supabase appends ?code or (in the token_hash
  // template recommended for SSR) where {{ .SiteURL }} resolves to. Either
  // way, our /auth/callback handles both shapes. `next` survives the round
  // trip and tells the callback where to send the user post-verification.
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });
  if (error) return { error: error.message };
  // If email confirmation is OFF in Supabase, signUp returns a session and the
  // cookies are set on this response — we can go straight through. If it's ON,
  // there's no session yet; show a "check your email" page instead.
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    redirect(returnTo);
  }
  redirect(`/signup/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const returnTo = safeReturnTo(formData.get("return_to") as string | null);
  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: "That email and password don't match an account." };
  redirect(returnTo);
}

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = ResetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email." };
  const supabase = await getServerSupabase();
  const origin = await originFromHeaders();
  // Callback branches on `type` and forces recovery to /reset-password/update.
  // We still pass `next` for completeness — harmless for recovery flow.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password/update")}`,
  });
  if (error) {
    // Don't leak whether the email exists — generic ok message.
  }
  return { ok: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = UpdatePasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }
  const supabase = await getServerSupabase();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Reset link expired. Request a new one." };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
