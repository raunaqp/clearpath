import { getUser } from "@/lib/auth/session";
import { GlobalHeaderView } from "./GlobalHeaderView";

/**
 * Thin sticky 56px header used across the user-flow (intake, wizard,
 * conflict, assess, card, upgrade, concierge, confirmation). Not used
 * on landing (has its own marketing nav) or admin (has its own context).
 *
 * Sprint 3 Phase 1.5 — async by default. Most callsites just render
 * `<GlobalHeader />` and the right-slot resolves to "Dashboard" or
 * "Sign in" based on the request's session. Pass `signedIn` explicitly
 * to skip the lookup (handy on pages that already redirect away
 * unauthenticated users — `/upgrade`, `/draft`, etc.).
 *
 * Client Components can't render this directly — import
 * `GlobalHeaderView` from `./GlobalHeaderView` and pass `signedIn`.
 */
export async function GlobalHeader({
  signedIn,
}: {
  signedIn?: boolean;
} = {}) {
  let resolved = signedIn;
  if (resolved === undefined) {
    const user = await getUser();
    resolved = !!user;
  }
  return <GlobalHeaderView signedIn={resolved} />;
}
