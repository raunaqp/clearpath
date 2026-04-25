"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
};

const STATUS_LABEL: Record<string, string> = {
  pending_verification: "Pending payment verification",
  verified: "Payment verified",
  generating: "Generating your Draft Pack",
  delivered: "Delivered",
  failed: "Verification failed",
};

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
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
}: {
  initialOrder: Tier2Order;
  assessmentId: string;
  email: string;
  cardHref: string;
}) {
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

  return (
    <section>
      <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
        {headline(order.status)}
      </h1>

      <div
        className="inline-flex items-center rounded-full text-xs font-medium px-3 py-1 mb-6"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        {STATUS_LABEL[order.status] ?? order.status}
      </div>

      <div className="rounded-xl bg-white border border-[#D9D5C8] p-5 sm:p-6 space-y-4">
        {order.status === "pending_verification" && (
          <PendingDetails order={order} email={email} />
        )}
        {(order.status === "verified" || order.status === "generating") && (
          <GeneratingDetails email={email} />
        )}
        {order.status === "delivered" && (
          <DeliveredDetails order={order} email={email} />
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

function headline(status: string): string {
  switch (status) {
    case "pending_verification":
      return "Got it. Your Draft Pack is being prepared.";
    case "verified":
      return "Payment verified. Generating your Draft Pack now…";
    case "generating":
      return "Generating your Draft Pack…";
    case "delivered":
      return "Your Draft Pack is ready.";
    case "failed":
      return "There was an issue with your payment verification.";
    default:
      return "Your order is being processed.";
  }
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

function GeneratingDetails({ email }: { email: string }) {
  return (
    <>
      <p className="text-[#0E1411] text-base">
        Your CDSCO Draft Pack is being generated.
      </p>
      <p className="text-sm text-[#6B766F]">
        This usually takes 2–3 minutes once started. You can leave this page —
        we&apos;ll email the finished pack to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span>.
      </p>
      <div className="flex items-center gap-2 text-sm text-[#6B766F]">
        <span
          aria-hidden
          className="w-3 h-3 rounded-full border-2 border-[#0F6E56]/30 border-t-[#0F6E56] animate-spin"
        />
        Working on it…
      </div>
    </>
  );
}

function DeliveredDetails({
  order,
  email,
}: {
  order: Tier2Order;
  email: string;
}) {
  return (
    <>
      {order.draft_pack_pdf_url ? (
        <a
          href={order.draft_pack_pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Download PDF →
        </a>
      ) : (
        <p className="text-sm text-[#993C1D]">
          PDF link missing. Please email founder@clearpath.in.
        </p>
      )}
      <p className="text-sm text-[#6B766F]">
        Also emailed to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span>.
      </p>
      <hr className="border-t border-[#D9D5C8]" />
      <p className="text-sm text-[#0E1411]">
        Want an expert to review + refine before you file?{" "}
        <Link
          href="/concierge"
          className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0d5c48]"
        >
          Submission Concierge · ₹50,000 for 12 months →
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
