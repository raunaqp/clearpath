import Link from "next/link";

/**
 * Thin sticky 56px header used across the user-flow (intake, wizard,
 * conflict, assess, card, upgrade, concierge, confirmation). Not used
 * on landing (has its own marketing nav) or admin (has its own context).
 *
 * Right slot: pass `signedIn` to show "Dashboard" instead of the default
 * "Sign in" link. Kept sync so this component is usable from Client
 * Components (e.g. /start).
 */
export function GlobalHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b border-[#E5E7EB]">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg leading-none text-[#0F6E56] hover:opacity-80 transition-opacity"
        >
          ClearPath
        </Link>
        {signedIn ? (
          <Link
            href="/dashboard"
            className="text-sm text-[#0E1411] hover:text-[#0F6E56] transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-[#0E1411] hover:text-[#0F6E56] transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
