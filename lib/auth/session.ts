import "server-only";
import { cache } from "react";
import { getServerSupabase, isAuthConfigured } from "./supabase-server";

export type AuthedUser = {
  id: string;
  email: string;
};

// If auth isn't configured (env var missing in a deploy), return null instead
// of throwing — the request render shouldn't 500. Protected routes will then
// just redirect to /login, where the form still renders.
export const getUser = cache(async (): Promise<AuthedUser | null> => {
  if (!isAuthConfigured()) return null;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
});
