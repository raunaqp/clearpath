"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  /** Sprint 3 Phase 1.6 — used to disambiguate which kind of failure
   *  hit when status='failed'. Prefixes used by writers:
   *   - "Cashfree payment failed (..."  → payment-verification failure
   *   - "tier1-gen failed: ..."          → Tier 1 generator failure
   *   - "auto-gen failed: ..." etc.      → Tier 2 generator failure
   */
  notes: string | null;
};

type FailureKind = "payment" | "generation" | "unknown";

function failureKind(notes: string | null): FailureKind {
  if (!notes) return "unknown";
  if (notes.startsWith("Cashfree payment")) return "payment";
  if (notes.startsWith("tier1-gen failed") || notes.startsWith("auto-gen")) {
    return "generation";
  }
  return "unknown";
}

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

/** Total sections the v2 generator persists for a Submission Workspace
 *  order. The orchestrator emits one row per draft_pack_sections section
 *  as it completes — this is the denominator the loader shows. */
const SUBMISSION_WORKSPACE_SECTION_TOTAL = 12;

export function StatusPanel({
  initialOrder,
  initialSectionsComplete,
  assessmentId,
  email,
  cardHref,
  cashfreeEnv,
}: {
  initialOrder: Tier2Order;
  /** First-paint section-progress count for the Submission Workspace
   *  generating state. null when not applicable (different tier or
   *  status). Polling refreshes it. */
  initialSectionsComplete: number | null;
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
  const [sectionsComplete, setSectionsComplete] = useState<number | null>(
    initialSectionsComplete
  );
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
        const data = (await res.json()) as {
          order: Tier2Order | null;
          sections_complete: number | null;
        };
        if (cancelled || !data.order) return;
        if (data.order.status !== order.status || data.order.id !== order.id) {
          setOrder(data.order);
        }
        // Always update the progress count — it bumps 0 → 12 over the
        // wait even when the order's status string doesn't change.
        setSectionsComplete(data.sections_complete);
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
        {headline(order.status, tier, failureKind(order.notes))}
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
            tier={tier}
            sectionsComplete={sectionsComplete}
          />
        )}
        {order.status === "delivered" && (
          <DeliveredDetails
            order={order}
            email={email}
            draftHref={draftHref}
            assessmentId={assessmentId}
            cashfreeEnv={cashfreeEnv}
          />
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
  tier: "draft_pack" | "draft_editor",
  kind: FailureKind
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
      if (kind === "generation") {
        return `We hit a snag generating your ${name}.`;
      }
      if (kind === "payment") {
        return "There was an issue with your payment verification.";
      }
      return "Your order didn't complete.";
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
  tier,
  sectionsComplete,
}: {
  email: string;
  tier: "draft_pack" | "draft_editor";
  /** Live section-progress count (0–12) for Submission Workspace. null
   *  for Tier 1 or when not generating. */
  sectionsComplete: number | null;
}) {
  // Phase B Item 3 — the Submission Workspace generation is a 4–6
  // minute job. The old loader was a tiny grey spinner + "a few
  // minutes" — under-reassuring for the actual wait length. New UX:
  // concrete estimate, permission to leave, and section-by-section
  // progress driven by the count of draft_pack_sections rows the
  // orchestrator persists incrementally.
  if (tier === "draft_editor") {
    const done = Math.min(
      sectionsComplete ?? 0,
      SUBMISSION_WORKSPACE_SECTION_TOTAL
    );
    const percent = Math.round(
      (done / SUBMISSION_WORKSPACE_SECTION_TOTAL) * 100
    );
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="w-8 h-8 rounded-full border-[3px] border-[#0F6E56]/25 border-t-[#0F6E56] animate-spin shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#0E1411] font-medium text-base">
              Generating your Submission Workspace
            </p>
            <p className="text-sm text-[#6B766F] mt-0.5">
              Typically 4–6 minutes. We&apos;re drafting 12 sections in
              parallel.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#6B766F] mb-1.5">
            <span>
              {sectionsComplete === null
                ? "Starting…"
                : `Section ${done} of ${SUBMISSION_WORKSPACE_SECTION_TOTAL} ready`}
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-[#EFECE3] overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={SUBMISSION_WORKSPACE_SECTION_TOTAL}
            aria-valuenow={done}
            aria-label="Section generation progress"
          >
            <div
              className="h-full bg-[#0F6E56] transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <hr className="border-t border-[#D9D5C8]" />

        <div className="text-sm text-[#0E1411] leading-relaxed">
          Keep this tab open, or close it and check back — your workspace
          will be ready in your dashboard. We&apos;ll also email{" "}
          <span className="font-medium">{email}</span> when it&apos;s
          ready.
        </div>
      </div>
    );
  }
  return (
    <>
      <p className="text-[#0E1411] text-base">
        Your Regulatory Readiness Report is being generated.
      </p>
      <p className="text-sm text-[#6B766F]">
        This usually takes under a minute once started. You can leave this
        page — we&apos;ll email the finished report to{" "}
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
  draftHref,
  assessmentId,
  cashfreeEnv,
}: {
  order: Tier2Order;
  email: string;
  draftHref: string;
  assessmentId: string;
  cashfreeEnv: "TEST" | "PROD" | null;
}) {
  const tier = order.tier_choice ?? "draft_pack";
  if (tier === "draft_editor") {
    return <DeliveredWorkspace order={order} draftHref={draftHref} />;
  }
  return (
    <DeliveredReport
      order={order}
      email={email}
      assessmentId={assessmentId}
      cashfreeEnv={cashfreeEnv}
    />
  );
}

function DeliveredWorkspace({
  order,
  draftHref,
}: {
  order: Tier2Order;
  draftHref: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={draftHref}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Open Submission Workspace →
        </Link>
        {order.draft_pack_pdf_url ? (
          <a
            href={order.draft_pack_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white hover:bg-[#F7F6F2] border border-[#0F6E56] text-[#0F6E56] font-medium text-[15px] px-5 py-3 transition-colors"
          >
            Download PDF
          </a>
        ) : null}
      </div>
      <p className="text-sm text-[#6B766F]">
        Your Submission Workspace is ready. Open it to edit each section
        inline — saves persist instantly.
      </p>
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

function DeliveredReport({
  order,
  email,
  assessmentId,
  cashfreeEnv,
}: {
  order: Tier2Order;
  email: string;
  assessmentId: string;
  cashfreeEnv: "TEST" | "PROD" | null;
}) {
  // Phase 1.6 UX fix B — Tier 1 delivered page is intentionally
  // minimal: two actions only (Regenerate PDF · Back to dashboard).
  // The report has already been emailed; this surface is recovery,
  // not the primary delivery channel.
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade/regenerate-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        pdf_url?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !body.pdf_url) {
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      // Open the fresh PDF in a new tab; pull the new signed URL back
      // into the page so any later clicks use it too.
      window.open(body.pdf_url, "_blank", "noopener,noreferrer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <p className="text-sm text-[#6B766F]">
        Emailed to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span>. Your
        4–6 page Regulatory Readiness Report is ready — regenerate the
        PDF here if you need a fresh download.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          {pending ? "Regenerating…" : "Regenerate PDF →"}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-white hover:bg-[#F7F6F2] border border-[#0F6E56] text-[#0F6E56] font-medium text-[15px] px-5 py-3 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
      {error ? (
        <p className="text-sm text-[#993C1D]" role="alert">
          ⚠ {error}
        </p>
      ) : null}

      {/* Phase B Item 1 — upgrade path. Routes through the same
          /api/cashfree/create-order endpoint a fresh Tier 2 buyer uses;
          tier_choice='draft_editor' creates a NEW tier2_orders row
          (the delivered ₹499 row stays delivered, untouched). The
          /draft/[id] tier-guard then unlocks once the new order
          settles. Hidden when Cashfree isn't configured server-side. */}
      <hr className="border-t border-[#D9D5C8]" />
      <div>
        <p className="text-sm text-[#0E1411] mb-3">
          Need to actually <span className="font-medium">edit + file</span>?
          Upgrade to the Submission Workspace — all 17 MD-7 sections, editable
          inline, delivered in-app.
        </p>
        {cashfreeEnv ? (
          <CashfreePayButton
            assessmentId={assessmentId}
            cashfreeEnv={cashfreeEnv}
            tierChoice="draft_editor"
            label="Upgrade to Submission Workspace · ₹2,499 →"
          />
        ) : (
          <p className="text-sm text-[#993C1D]">
            Cashfree is not configured — email{" "}
            <a
              href="mailto:founder@clearpath.in"
              className="text-[#0F6E56] underline underline-offset-2"
            >
              founder@clearpath.in
            </a>{" "}
            to upgrade manually.
          </p>
        )}
      </div>
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
