import Link from "next/link";

/**
 * Sync, prop-driven header. Safe to import from Client Components.
 * For Server Components that should auto-detect auth, prefer
 * `<GlobalHeader />` from `./GlobalHeader` — it wraps this view with
 * a server-side getUser() lookup.
 */
export function GlobalHeaderView({ signedIn = false }: { signedIn?: boolean }) {
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
