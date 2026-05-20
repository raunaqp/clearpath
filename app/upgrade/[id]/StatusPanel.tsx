"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CashfreePayButton } from "./CashfreePayButton";

const POLL_INTERVAL_MS = 30_000;

export type Tier2Order = {
  id: string;
  status: string;
  transaction_id: string | null;
  payment_screenshot_url: string | null;
  draft_pack_pdf_url: string | null;
  delivered_at: string | null;
  created_at: string | null;
  email_sent_to: string | null;
  /** Sprint 3 Story 3.1 — null on legacy rows (treat as draft_pack). */
  tier_choice: "draft_pack" | "draft_editor" | null;
};

const STATUS_LABEL: Record<string, string> = {
  created: "Awaiting payment",
  paid: "Payment received",
  pending_verification: "Pending payment verification",
  verified: "Payment verified",
  generating: "Generating",
  delivered: "Delivered",
  failed: "Verification failed",
};

// Phase 1.6 — customer-facing product names per tier. DB enum stays
// 'draft_pack' / 'draft_editor'; only the visible labels rename.
function productName(tier: "draft_pack" | "draft_editor"): string {
  return tier === "draft_editor"
    ? "Submission Workspace"
    : "Regulatory Readiness Report";
}

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  created: { bg: "#FAEEDA", fg: "#BA7517" },
  paid: { bg: "#E1F5EE", fg: "#0F6E56" },
  pending_verification: { bg: "#FAEEDA", fg: "#BA7517" },
  verified: { bg: "#E1F5EE", fg: "#0F6E56" },
  generating: { bg: "#E1F5EE", fg: "#0F6E56" },
  delivered: { bg: "#EAF3DE", fg: "#3B6D11" },
  failed: { bg: "#FAECE7", fg: "#993C1D" },
};

export function StatusPanel({
  initialOrder,
  assessmentId,
  email,
  cardHref,
  cashfreeEnv,
}: {
  initialOrder: Tier2Order;
  assessmentId: string;
  email: string;
  cardHref: string;
  /** Null when Cashfree isn't configured server-side — UPI-QR is the
   *  only path. Otherwise the env mode for the SDK so a customer in
   *  'created' state can retry payment. */
  cashfreeEnv: "TEST" | "PROD" | null;
}) {
  const draftHref = `/draft/${assessmentId}`;
  const [order, setOrder] = useState<Tier2Order>(initialOrder);
  const isTerminal = order.status === "delivered" || order.status === "failed";

  useEffect(() => {
    if (isTerminal) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/upgrade/status?assessment_id=${encodeURIComponent(assessmentId)}`,
          { cache: "no-store" }
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { order: Tier2Order | null };
        if (cancelled || !data.order) return;
        if (data.order.status !== order.status || data.order.id !== order.id) {
          setOrder(data.order);
        }
      } catch {
        // best-effort poll; never throw to UI
      }
    };
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isTerminal, assessmentId, order.status, order.id]);

  const tint = STATUS_TINT[order.status] ?? STATUS_TINT.pending_verification;
  const tier = order.tier_choice ?? "draft_pack";

  return (
    <section>
      <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
        {headline(order.status, tier)}
      </h1>

      <div
        className="inline-flex items-center rounded-full text-xs font-medium px-3 py-1 mb-6"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        {STATUS_LABEL[order.status] ?? order.status}
      </div>

      <div className="rounded-xl bg-white border border-[#D9D5C8] p-5 sm:p-6 space-y-4">
        {order.status === "created" && (
          <CreatedDetails
            assessmentId={assessmentId}
            email={email}
            cashfreeEnv={cashfreeEnv}
            tierChoice={order.tier_choice ?? "draft_pack"}
          />
        )}
        {order.status === "pending_verification" && (
          <PendingDetails order={order} email={email} />
        )}
        {(order.status === "verified" || order.status === "generating") && (
          <GeneratingDetails
            email={email}
            draftHref={draftHref}
            tier={tier}
          />
        )}
        {order.status === "delivered" && (
          <DeliveredDetails order={order} email={email} draftHref={draftHref} />
        )}
        {order.status === "failed" && <FailedDetails order={order} />}
      </div>

      <div className="mt-8">
        <Link
          href={cardHref}
          className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
        >
          ← Back to your Readiness Card
        </Link>
      </div>
    </section>
  );
}

function headline(
  status: string,
  tier: "draft_pack" | "draft_editor"
): string {
  const name = productName(tier);
  switch (status) {
    case "created":
      return "We're holding your order. Complete payment to start.";
    case "paid":
      return "Payment received. We're verifying it now.";
    case "pending_verification":
      return `Got it. Your ${name} is being prepared.`;
    case "verified":
      return `Payment verified. Generating your ${name} now…`;
    case "generating":
      return `Generating your ${name}…`;
    case "delivered":
      return `Your ${name} is ready.`;
    case "failed":
      return "There was an issue with your payment verification.";
    default:
      return "Your order is being processed.";
  }
}

function CreatedDetails({
  assessmentId,
  email,
  cashfreeEnv,
  tierChoice,
}: {
  assessmentId: string;
  email: string;
  cashfreeEnv: "TEST" | "PROD" | null;
  tierChoice: "draft_pack" | "draft_editor";
}) {
  return (
    <>
      <p className="text-[#0E1411] text-base">
        Your order is on hold until payment goes through. Tap the button
        below to complete payment via Cashfree.
      </p>
      <p className="text-sm text-[#6B766F]">
        We&apos;ll email confirmation to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span> once
        the payment lands.
      </p>
      {cashfreeEnv ? (
        <CashfreePayButton
          assessmentId={assessmentId}
          cashfreeEnv={cashfreeEnv}
          tierChoice={tierChoice}
        />
      ) : (
        <p className="text-sm text-[#993C1D]">
          Cashfree is currently not configured. Email{" "}
          <a
            href="mailto:raunaq.pradhan@gmail.com"
            className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0a5a47]"
          >
            raunaq.pradhan@gmail.com
          </a>{" "}
          and we&apos;ll process your order via the manual UPI flow.
        </p>
      )}
    </>
  );
}

function PendingDetails({
  order,
  email,
}: {
  order: Tier2Order;
  email: string;
}) {
  return (
    <>
      <p className="text-[#0E1411] text-base">
        ETA: <span className="font-medium">Within 6 hours.</span>
      </p>
      <p className="text-sm text-[#6B766F]">
        We&apos;ll email it to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span>. Bookmark
        this page to check status.
      </p>
      <hr className="border-t border-[#D9D5C8]" />
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-2">
          Submitted
        </p>
        {order.transaction_id && (
          <p className="text-sm text-[#0E1411]">
            Transaction ID:{" "}
            <span className="font-mono">{order.transaction_id}</span>
          </p>
        )}
        {order.payment_screenshot_url && (
          <div className="mt-3">
            <p className="text-sm text-[#0E1411] mb-1">Payment screenshot</p>
            <a
              href={order.payment_screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment_screenshot_url}
                alt="Payment screenshot"
                className="max-h-40 rounded-lg border border-[#D9D5C8]"
              />
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function GeneratingDetails({
  email,
  draftHref,
  tier,
}: {
  email: string;
  draftHref: string;
  tier: "draft_pack" | "draft_editor";
}) {
  const name = productName(tier);
  return (
    <>
      <p className="text-[#0E1411] text-base">
        Your {name} is being generated.
      </p>
      <p className="text-sm text-[#6B766F]">
        {tier === "draft_editor"
          ? "This usually takes a few minutes once started. You can leave this page — we'll notify you when the workspace is ready."
          : "This usually takes under a minute once started. You can leave this page — we'll email the finished report to "}
        {tier === "draft_pack" ? (
          <>
            <span className="font-medium text-[#0E1411]">{email}</span>.
          </>
        ) : null}
      </p>
      <div className="flex items-center gap-2 text-sm text-[#6B766F]">
        <span
          aria-hidden
          className="w-3 h-3 rounded-full border-2 border-[#0F6E56]/30 border-t-[#0F6E56] animate-spin"
        />
        Working on it…
      </div>
      {tier === "draft_editor" ? (
        <Link
          href={draftHref}
          className="inline-flex items-center text-sm text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
        >
          Open the workspace →
        </Link>
      ) : null}
    </>
  );
}

function DeliveredDetails({
  order,
  email,
  draftHref,
}: {
  order: Tier2Order;
  email: string;
  draftHref: string;
}) {
  // Phase 1.6 — tier-aware delivered UX.
  // draft_editor → editor link (the Submission Workspace) primary CTA.
  // draft_pack   → "Emailed to {email}" + Download Report only; the
  //                editor is intentionally NOT linked. The /draft/[id]
  //                route is also guarded server-side so a direct URL
  //                hit bounces back here.
  const tier = order.tier_choice ?? "draft_pack";
  const isEditor = tier === "draft_editor";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {isEditor ? (
          <Link
            href={draftHref}
            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
          >
            Open Submission Workspace →
          </Link>
        ) : null}
        {order.draft_pack_pdf_url ? (
          <a
            href={order.draft_pack_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isEditor
                ? "inline-flex items-center justify-center rounded-full bg-white hover:bg-[#F7F6F2] border border-[#0F6E56] text-[#0F6E56] font-medium text-[15px] px-5 py-3 transition-colors"
                : "inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
            }
          >
            {isEditor ? "Download PDF" : "Download Report"}
          </a>
        ) : null}
      </div>
      {isEditor ? (
        <p className="text-sm text-[#6B766F]">
          Your Submission Workspace is ready. Open it to edit each
          section inline — saves persist instantly.
        </p>
      ) : (
        <p className="text-sm text-[#6B766F]">
          Emailed to{" "}
          <span className="font-medium text-[#0E1411]">{email}</span>.
          Download the 4–6 page report — it's yours to keep.
        </p>
      )}
      <hr className="border-t border-[#D9D5C8]" />
      <p className="text-sm text-[#0E1411]">
        Want an expert to review + refine before you file?{" "}
        <Link
          href="/concierge"
          className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
        >
          Human Concierge — talk to us →
        </Link>
      </p>
    </>
  );
}

function FailedDetails({ order }: { order: Tier2Order }) {
  return (
    <>
      <p className="text-[#0E1411] text-base">
        Please email{" "}
        <a
          href="mailto:founder@clearpath.in"
          className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
        >
          founder@clearpath.in
        </a>{" "}
        with this reference and we&apos;ll sort it out.
      </p>
      <p className="text-xs text-[#6B766F]">
        Reference:{" "}
        <code className="font-mono text-[#0E1411] bg-[#F7F6F2] px-1.5 py-0.5 rounded border border-[#D9D5C8]">
          {order.id}
        </code>
      </p>
    </>
  );
}
