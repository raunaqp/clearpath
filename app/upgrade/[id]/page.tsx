import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { UpgradePageViewTracker } from "@/components/upgrade/UpgradePageViewTracker";
import { PaymentForm } from "./PaymentForm";
import { StatusPanel, type Tier2Order } from "./StatusPanel";

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
  email: string;
  tier2_intent_clicked: string | null;
};

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("id, share_token, status, email, tier2_intent_clicked")
    .eq("id", id)
    .maybeSingle<AssessmentRow>();

  if (error || !assessment) {
    notFound();
  }

  if (!assessment.tier2_intent_clicked) {
    const now = new Date().toISOString();
    await supabase
      .from("assessments")
      .update({ tier2_intent_clicked: now, updated_at: now })
      .eq("id", id)
      .is("tier2_intent_clicked", null);
  }

  const { data: order } = await supabase
    .from("tier2_orders")
    .select(
      "id, status, transaction_id, payment_screenshot_url, draft_pack_pdf_url, delivered_at, created_at, email_sent_to"
    )
    .eq("assessment_id", id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Tier2Order>();

  const cardHref = assessment.share_token ? `/c/${assessment.share_token}` : "/";

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-4 py-12">
      <UpgradePageViewTracker assessmentId={id} />
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          Tier 2 — Draft Pack
        </p>

        {order ? (
          <StatusPanel
            initialOrder={order}
            assessmentId={id}
            email={assessment.email}
            cardHref={cardHref}
          />
        ) : (
          <>
            <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
              Get your Draft Pack — ₹499
            </h1>
            <p className="text-[#6B766F] text-base leading-relaxed mb-8">
              Indian regulatory experts review your submission. Most deliveries
              within 2 hours, worst case 6 hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
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

            <PaymentForm assessmentId={id} email={assessment.email} />

            <div className="mt-8">
              <a
                href={cardHref}
                className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
              >
                ← Back to your Readiness Card
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
