import { notFound, redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import { UpgradePageViewTracker } from "@/components/upgrade/UpgradePageViewTracker";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { PaymentForm } from "./PaymentForm";
import { CashfreePayButton } from "./CashfreePayButton";
import { EmailVerifyGate } from "./EmailVerifyGate";
import { TierPicker } from "./TierPicker";
import { TierIntentSync } from "./TierIntentSync";
import { TIER_PRICING } from "@/lib/cashfree/tiers";
import { isCashfreeConfigured } from "@/lib/cashfree/client";
import { StatusPanel, type Tier2Order } from "./StatusPanel";
import type { WizardAnswers } from "@/lib/wizard/types";

export const dynamic = "force-dynamic";

type AssessmentMeta = {
  tier_b_completed_at?: string;
};

type AssessmentRow = {
  id: string;
  share_token: string | null;
  status: string;
  email: string;
  tier2_intent_clicked: string | null;
  wizard_answers: WizardAnswers | null;
  meta: AssessmentMeta | null;
};

export default async function UpgradePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { id } = await params;
  const { tier: tierFromUrl } = await searchParams;
  const selectedTier: "draft_pack" | "draft_editor" | null =
    tierFromUrl === "draft_editor"
      ? "draft_editor"
      : tierFromUrl === "draft_pack"
        ? "draft_pack"
        : null;

  // Auth gate — clicking "Generate Draft Pack" requires an account (Story 2.2).
  // Risk Card flow stays anonymous; the gate kicks in here, at the
  // Card → Draft Pack transition. Phase 3.7 Issue C — default to /login
  // (which links to /signup for new users), since most Tier 2 customers
  // already have an account from the Risk Card email gate.
  const user = await getUser();
  if (!user) {
    redirect(`/login?return_to=${encodeURIComponent(`/upgrade/${id}`)}`);
  }

  const supabase = getServiceClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select(
      "id, share_token, status, email, tier2_intent_clicked, wizard_answers, meta"
    )
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

  // Phase B B1 — fetch up to 5 most-recent orders and skip
  // payment-failed ones in app code so we can differentiate:
  //   - payment-failed (Cashfree webhook flipped to 'failed' before
  //     any charge cleared)  → hide, let customer retry payment
  //   - generation-failed (tier1-gen / auto-gen failed AFTER customer
  //     paid)                → surface so they see the "contact support"
  //     state and don't accidentally pay a second time
  //   - null notes / unknown prefix → surface (safer default — never
  //     risk charging an already-paid customer twice)
  // The old `.neq("status","failed")` filter conflated both kinds of
  // failure and let paid+gen-failed customers see the TierPicker again.
  const { data: recentOrders } = await supabase
    .from("tier2_orders")
    .select(
      "id, status, transaction_id, payment_screenshot_url, draft_pack_pdf_url, delivered_at, created_at, email_sent_to, tier_choice, notes"
    )
    .eq("assessment_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const isPaymentFailed = (o: Tier2Order): boolean =>
    o.status === "failed" && (o.notes ?? "").startsWith("Cashfree payment");

  const order =
    (recentOrders as Tier2Order[] | null)?.find(
      (o) => !isPaymentFailed(o)
    ) ?? null;

  // Phase B Item 3 — first-paint section-progress count for the
  // Submission Workspace generating state. Mirrors the /api/upgrade/status
  // logic so the loader doesn't render "Section ? of 12" until first poll.
  let initialSectionsComplete: number | null = null;
  if (
    order &&
    (order.tier_choice ?? "draft_pack") === "draft_editor" &&
    (order.status === "verified" || order.status === "generating")
  ) {
    const { count } = await supabase
      .from("draft_pack_sections")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);
    initialSectionsComplete = count ?? 0;
  }

  // Sprint 2 Story 2.5 Phase 3.5 Bug A — gate payment on the explicit
  // submission flag (meta.tier_b_completed_at), not on field presence.
  // Field-presence broke on refresh because save-on-blur populates b1
  // mid-edit. Customers with an existing order bypass this (past wizard).
  const tierBComplete = !!assessment.meta?.tier_b_completed_at;
  if (!order && !tierBComplete) {
    redirect(`/upgrade/${id}/wizard`);
  }

  const cardHref = assessment.share_token ? `/c/${assessment.share_token}` : "/";
  const wizardHref = `/upgrade/${id}/wizard`;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader signedIn />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <UpgradePageViewTracker assessmentId={id} />
        <div className="max-w-3xl mx-auto">
          <TierEyebrow
            selectedTier={selectedTier}
            orderTier={order?.tier_choice ?? null}
          />

        {order ? (
          <StatusPanel
            initialOrder={order}
            initialSectionsComplete={initialSectionsComplete}
            assessmentId={id}
            email={assessment.email}
            cardHref={cardHref}
            cashfreeEnv={
              isCashfreeConfigured()
                ? (process.env.CASHFREE_ENVIRONMENT ?? "TEST") === "PROD"
                  ? "PROD"
                  : "TEST"
                : null
            }
          />
        ) : (
          <>
            <TierIntentSync currentTier={selectedTier} />
            <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
              Built for your product, not a generic template.
            </h1>
            <p className="text-[#6B766F] text-base leading-relaxed mb-8">
              Two paid tiers, calibrated to your assessment: a 4–6 page
              Regulatory Readiness Report (₹499, emailed) or the full
              Submission Workspace (₹2,499, in-app editor + 12-section
              draft). Pick the one that matches where you are today.
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
                The Submission Workspace gives you the{" "}
                <span className="italic">narrative</span> content for each
                CDSCO section. The blank forms come back blank — you (or
                your regulatory team) fill in company-specific fields like
                CIN, manufacturing site, ISO 13485 certificate number,
                signatory.{" "}
                <span className="font-medium">Human Concierge</span> is
                where our team works alongside you to populate those fields,
                cross-check against the workspace narrative, and push the
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
                  <span>Generation runs against your wizard answers, uploads, and Readiness Card. Reviewed by an Indian regulatory expert before delivery.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[11px] text-[#0F6E56] font-bold mt-0.5">04</span>
                  <span>You receive a download link by email. Most within 2 hours, worst case 6.</span>
                </li>
              </ol>
            </div>

            {/* Sprint 3 Story 3.1 — tier picker. Shown when the customer
                hasn't yet chosen a tier (no ?tier= in URL). Once they
                click a card, the URL gains ?tier=<choice> and the
                page server-renders the pay block tuned for that tier. */}
            {!selectedTier ? <TierPicker assessmentId={id} /> : null}

            {selectedTier ? (
              <>
                <ChosenTierBanner
                  tier={selectedTier}
                  changeHref={`/upgrade/${id}?change=1`}
                />

                {/* Email-verify gate fires only for the email-delivered
                    tier (₹499 Readiness Report). ₹2,499 Submission
                    Workspace skips it since delivery is in-app. */}
                {TIER_PRICING[selectedTier].requiresVerifiedEmail &&
                !user.emailConfirmedAt ? (
                  <EmailVerifyGate
                    email={user.email}
                    returnTo={`/upgrade/${id}?tier=${selectedTier}`}
                  />
                ) : null}

                {isCashfreeConfigured() &&
                (!TIER_PRICING[selectedTier].requiresVerifiedEmail ||
                  user.emailConfirmedAt) ? (
                  <div className="mb-6 rounded-lg bg-white border border-[#D9D5C8] px-5 py-5">
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F6E56] mb-2">
                      One-click payment · ₹
                      {TIER_PRICING[selectedTier].amountInr.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                    <CashfreePayButton
                      assessmentId={id}
                      tierChoice={selectedTier}
                      cashfreeEnv={
                        (process.env.CASHFREE_ENVIRONMENT ?? "TEST") === "PROD"
                          ? "PROD"
                          : "TEST"
                      }
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            <PaymentForm
              email={assessment.email}
              tier={selectedTier ?? undefined}
            />

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3">
              <a
                href={cardHref}
                className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
              >
                ← Back to your Readiness Card
              </a>
              {/* Phase 3.5 Bug B — keep the wizard reachable from the
                  payment page so users can revise their answers before
                  paying. */}
              <a
                href={wizardHref}
                className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
              >
                Edit wizard answers
              </a>
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function TierEyebrow({
  selectedTier,
  orderTier,
}: {
  selectedTier: "draft_pack" | "draft_editor" | null;
  orderTier: "draft_pack" | "draft_editor" | null;
}) {
  // Order tier wins if present (post-click state). Otherwise the
  // selection from the URL drives the eyebrow. With neither, fall back
  // to a generic "Tier 2" label so we never lie about price.
  const tier = orderTier ?? selectedTier;
  const cfg = tier ? TIER_PRICING[tier] : null;
  return (
    <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
      {cfg
        ? `${cfg.tierLabel} · ₹${cfg.amountInr.toLocaleString("en-IN")} ${cfg.label}`
        : "Upgrade"}
    </p>
  );
}

function ChosenTierBanner({
  tier,
  changeHref,
}: {
  tier: "draft_pack" | "draft_editor";
  changeHref: string;
}) {
  const cfg = TIER_PRICING[tier];
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white border border-[#D9D5C8] px-4 py-3">
      <div>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
          You picked
        </p>
        <p className="text-[#0E1411] font-medium mt-0.5">
          {cfg.label}{" "}
          <span className="text-[#6B766F] font-normal">
            · ₹{cfg.amountInr.toLocaleString("en-IN")} · {cfg.deliveryChannel}
          </span>
        </p>
      </div>
      <a
        href={changeHref}
        className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
      >
        Change tier
      </a>
    </div>
  );
}
