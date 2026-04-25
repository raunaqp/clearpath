import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { UpgradePageViewTracker } from "@/components/upgrade/UpgradePageViewTracker";

export const dynamic = "force-dynamic";

const PILLARS: ReadonlyArray<{ icon: string; label: string; detail: string }> =
  [
    {
      icon: "📋",
      label: "The regulations that apply to your product",
      detail: "3-5 of 9 — specific to your classification",
    },
    {
      icon: "📄",
      label: "The blank CDSCO forms you'll need to fill",
      detail: "MD-7, MD-12, etc. — real government PDFs",
    },
    {
      icon: "🗺",
      label: "A submission guide",
      detail: "Which form goes where, in what order",
    },
    {
      icon: "✍",
      label: "Drafted content for each section",
      detail:
        "Intended Use, Device Description, Risk Justification, Clinical Context — tailored to your product",
    },
  ];

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

  const cardHref = data.share_token ? `/c/${data.share_token}` : "/";

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-4 py-12">
      <UpgradePageViewTracker assessmentId={id} />
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          Tier 2 — Draft Pack
        </p>
        <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
          The Draft Pack is shipping soon.
        </h1>
        <p className="text-[#6B766F] text-base leading-relaxed mb-8">
          We&apos;ve noted your interest. Here&apos;s what you&apos;ll get
          when the ₹499 Draft Pack is live.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              className="flex items-start gap-3 rounded-xl bg-white border border-[#D9D5C8] p-4"
            >
              <span aria-hidden className="text-xl leading-none mt-0.5">
                {pillar.icon}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[15px] text-[#0E1411] leading-snug">
                  {pillar.label}
                </p>
                <p className="text-sm text-[#6B766F] mt-1 leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[#0E1411] text-base leading-relaxed mb-8">
          We&apos;ll email you the moment it&apos;s live.
        </p>

        <div className="flex flex-col items-start gap-3">
          <Link
            href={cardHref}
            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
          >
            ← Back to your Readiness Card
          </Link>
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
