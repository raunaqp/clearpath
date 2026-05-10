import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { UpgradePageViewTracker } from "@/components/upgrade/UpgradePageViewTracker";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { PaymentForm } from "./PaymentForm";
import { StatusPanel, type Tier2Order } from "./StatusPanel";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <UpgradePageViewTracker assessmentId={id} />
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
            Tier 2 · ₹499 Draft Pack
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
              Drafted for your product, not a generic template.
            </h1>
            <p className="text-[#6B766F] text-base leading-relaxed mb-8">
              An Indian regulatory expert reviews and ships a 20+ page CDSCO-aligned
              Draft Pack tailored to your wizard answers and uploaded
              documents. Most deliveries within 2 hours, worst case 6.
            </p>

            {/* Time-saved hook — anchors the ₹499 against what a consultant
                would charge for the same scope. Same framing as on the
                Risk Card so the founder sees consistent value-prop copy. */}
            <div className="mb-5 rounded-lg bg-[#FFF5DA] border border-[#E0C988] px-5 py-4">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#7A5E10] mb-1.5">
                What you&apos;re saving
              </p>
              <p className="text-[15px] text-[#0E1411] leading-relaxed">
                Drafting CDSCO submission documents typically takes <span className="font-medium">8–12
                weeks</span> with a regulatory consultant at <span className="font-medium">₹3–5L</span>.
                Tier 2 ships a starter draft for each section in <span className="font-medium">~10
                minutes</span> for ₹499 — so your team starts with words on the page, not a blank doc.
              </p>
            </div>

            {/* What's included — 3 sibling blocks, eyebrow + headline +
                detail. Mirrors the Risk Card's sibling-metric layout. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg bg-white border border-[#D9D5C8] px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1">
                  Sections 01 – 02
                </p>
                <p className="font-medium text-[15px] text-[#0E1411] mb-1">
                  Executive Summary &amp; Maturity
                </p>
                <p className="text-sm text-[#6B766F] leading-relaxed">
                  The one-pager you share with investors and partners. Plus your TRL and document completeness anchored to the SERB / ANRF MAHA framework.
                </p>
              </div>

              <div className="rounded-lg bg-white border border-[#D9D5C8] px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1">
                  Sections 03 – 09
                </p>
                <p className="font-medium text-[15px] text-[#0E1411] mb-1">
                  CDSCO Narrative Drafts
                </p>
                <p className="text-sm text-[#6B766F] leading-relaxed">
                  Intended Use, Device Description, Risk Classification, Clinical Context, Essential Principles, Algorithm Change Protocol — written in CDSCO-aligned language for your product.
                </p>
              </div>

              <div className="rounded-lg bg-white border border-[#D9D5C8] px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1">
                  Section 10 + Appendices
                </p>
                <p className="font-medium text-[15px] text-[#0E1411] mb-1">
                  Forms &amp; Filing Order
                </p>
                <p className="text-sm text-[#6B766F] leading-relaxed">
                  The frameworks that apply to your product, the forms you&apos;ll need (MD-7, MD-12, etc.), filing order, and blank CDSCO PDFs appended for direct use.
                </p>
              </div>
            </div>

            {/* What this is NOT — honesty block, sets expectations
                before payment. Coral matches Concierge upsell on card. */}
            <div className="mb-7 rounded-lg bg-[#FAEDE5] border border-[#E0B8A4] px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#993C1D] mb-1.5">
                What ₹499 doesn&apos;t include
              </p>
              <p className="text-sm text-[#0E1411] leading-relaxed">
                The Draft Pack gives you the <span className="italic">narrative</span>{" "}
                content for each CDSCO section. The blank forms come back
                blank — you (or your regulatory team) fill in company-specific
                fields like CIN, manufacturing site, ISO 13485 certificate
                number, signatory.{" "}
                <span className="font-medium">Concierge (₹50K, 12 months)</span>{" "}
                is where our team works alongside you to populate those fields,
                cross-check against the Draft Pack narrative, and push the
                submission through CDSCO.
              </p>
              <p className="text-sm text-[#0E1411] leading-relaxed mt-2">
                Every Concierge filing is reviewed by a{" "}
                <span className="font-medium">former CDSCO regulator</span>, a{" "}
                <span className="font-medium">practising clinician</span> in
                your therapeutic area, and a{" "}
                <span className="font-medium">scientific subject-matter expert</span>{" "}
                before submission — so what you file is what reviewers expect to see.
              </p>
            </div>

            {/* What happens next — process timeline, addresses
                'what am I actually buying' anxiety before they pay. */}
            <div className="mb-8 rounded-lg bg-white border border-[#D9D5C8] px-5 py-4">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-3">
                What happens after payment
              </p>
              <ol className="space-y-2.5 text-sm text-[#0E1411] leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-mono text-[11px] text-[#0F6E56] font-bold mt-0.5">01</span>
                  <span>Upload your transaction screenshot and ID below. Pay via UPI or card to the displayed account.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[11px] text-[#0F6E56] font-bold mt-0.5">02</span>
                  <span>Our team verifies the payment (typically &lt;30 min during business hours).</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[11px] text-[#0F6E56] font-bold mt-0.5">03</span>
                  <span>Draft Pack generation runs against your wizard answers, uploads, and Risk Card. Reviewed by an Indian regulatory expert before delivery.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[11px] text-[#0F6E56] font-bold mt-0.5">04</span>
                  <span>You receive a download link by email. Most within 2 hours, worst case 6.</span>
                </li>
              </ol>
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
    </div>
  );
}
