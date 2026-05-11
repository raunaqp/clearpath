import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function isAuthConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getServerSupabase() {
  if (!isAuthConfigured()) {
    throw new Error(
      "Supabase auth not configured — NEXT_PUBLIC_SUPABASE_ANON_KEY missing."
    );
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component invocation — write happens in middleware/proxy or route handler.
          }
        },
      },
    }
  );
}
