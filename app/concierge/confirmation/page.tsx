import Link from "next/link";
import { nameFromEmail } from "@/lib/concierge/validation";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ConciergeConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const emailRaw = first(params.email) ?? "";
  const name = nameFromEmail(emailRaw);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3EF] border border-[#0F6E56]/30">
            <span
              aria-hidden
              className="w-4 h-4 rounded-full bg-[#0F6E56] text-white text-[10px] leading-[16px] text-center font-bold"
            >
              ✓
            </span>
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F6E56]">
              Saved
            </span>
          </div>

          <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-6">
            Request received
          </h1>

          <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 space-y-5 text-[#0E1411] leading-relaxed">
            <p>
              Thanks{name ? `, ${name}` : ""}. Here&apos;s what happens next:
            </p>

            <ol className="list-decimal pl-5 space-y-3 text-[15px]">
              <li>
                Within 48 hours, we&apos;ll email you with a regulatory expert
                matched to your case.
              </li>
              <li>The expert will schedule a 30-minute kick-off call.</li>
              <li>
                We&apos;ll send a Razorpay link for ₹50,000 — payment is only
                due after the kick-off call confirms fit.
              </li>
              <li>
                Review starts immediately after payment. 12-month engagement
                begins.
              </li>
            </ol>

            <p>
              Questions in the meantime? Reply to this email or write to{" "}
              <a
                href="mailto:founder@clearpath.in"
                className="underline underline-offset-2 hover:text-[#0F6E56]"
              >
                founder@clearpath.in
              </a>
              .
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[#6B766F] hover:text-[#0E1411] underline underline-offset-2"
            >
              ← Back to ClearPath
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
