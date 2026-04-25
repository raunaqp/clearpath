import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { UpgradePageViewTracker } from "@/components/upgrade/UpgradePageViewTracker";

export const dynamic = "force-dynamic";

type AssessmentRow = {
  id: string;
  share_token: string | null;
  status: string;
  tier2_intent_clicked: string | null;
};

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("id, share_token, status, tier2_intent_clicked")
    .eq("id", id)
    .maybeSingle<AssessmentRow>();

  if (error || !data) {
    notFound();
  }

  // Idempotent: only stamp once.
  if (!data.tier2_intent_clicked) {
    const now = new Date().toISOString();
    await supabase
      .from("assessments")
      .update({ tier2_intent_clicked: now, updated_at: now })
      .eq("id", id)
      .is("tier2_intent_clicked", null);
  }

  const cardHref = data.share_token ? `/c/${data.share_token}` : null;

  return (
    <main className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-12">
      <UpgradePageViewTracker assessmentId={id} />
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          Tier 2 — Draft Pack
        </p>
        <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
          The Draft Pack is shipping soon.
        </h1>
        <p className="text-[#6B766F] text-base leading-relaxed mb-6">
          We&apos;ve noted your interest. You&apos;ll be the first to know
          when the ₹499 Draft Pack — forms, submission guide, and drafted
          content — is live.
        </p>

        <div className="flex flex-col items-center gap-3">
          {cardHref ? (
            <Link
              href={cardHref}
              className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
            >
              ← Back to your Readiness Card
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
            >
              Back to home
            </Link>
          )}
          <p className="text-xs text-[#6B766F]">
            Questions? Email{" "}
            <a
              href="mailto:founder@clearpath.in"
              className="underline underline-offset-2 hover:text-[#0E1411]"
            >
              founder@clearpath.in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
