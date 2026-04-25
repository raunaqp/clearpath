import Link from "next/link";

/**
 * Thin sticky 56px header used across the user-flow (intake, wizard,
 * conflict, assess, card, upgrade, concierge, confirmation). Not used
 * on landing (has its own marketing nav) or admin (has its own context).
 */
export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b border-[#E5E7EB]">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg leading-none text-[#0F6E56] hover:opacity-80 transition-opacity"
        >
          ClearPath
        </Link>
        {/* Right slot reserved for account menu — empty for now. */}
        <div aria-hidden />
      </div>
    </header>
  );
}
