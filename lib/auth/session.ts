import "server-only";
import { cache } from "react";
import { getServerSupabase } from "./supabase-server";

export type AuthedUser = {
  id: string;
  email: string;
};

export const getUser = cache(async (): Promise<AuthedUser | null> => {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
});
