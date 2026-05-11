import Link from "next/link";

export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <header className="sticky top-0 z-10 h-14 bg-white border-b border-[#E5E7EB]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <Link
            href="/"
            className="font-serif text-lg leading-none text-[#0F6E56] hover:opacity-80 transition-opacity"
          >
            ClearPath
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="max-w-md mx-auto">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
            {eyebrow}
          </p>
          <h1 className="font-serif text-[clamp(26px,3.4vw,32px)] leading-tight text-[#0E1411] mb-2">
            {title}
          </h1>
          {intro ? (
            <p className="text-[#6B766F] text-base leading-relaxed mb-7">{intro}</p>
          ) : (
            <div className="mb-7" />
          )}
          <div className="rounded-lg bg-white border border-[#D9D5C8] px-6 py-6">
            {children}
          </div>
          {footer ? <div className="mt-5 text-sm text-[#6B766F]">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

export function AuthLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[#0E1411] mb-1.5"
    >
      {children}
    </label>
  );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-[#D9D5C8] bg-white px-3 py-2.5 text-[15px] text-[#0E1411] placeholder:text-[#9CA39E] focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30 focus:border-[#0F6E56] ${
        props.className ?? ""
      }`}
    />
  );
}

export function AuthSubmit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[15px] px-6 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 focus-visible:ring-offset-2"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-[#993C1D] bg-[#FAEDE5] border border-[#E0B8A4] rounded-md px-3 py-2 mt-1">
      {message}
    </p>
  );
}

export function AuthOk({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-[#0F6E56] bg-[#E8F4EF] border border-[#B6D9CC] rounded-md px-3 py-2 mt-1">
      {message}
    </p>
  );
}
