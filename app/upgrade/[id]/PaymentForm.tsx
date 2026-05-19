"use client";

/**
 * Sprint 3 Phase 1.1 — manual UPI fallback panel.
 *
 * Two changes from the Sprint 2 version:
 *   1. Tier-aware amount + copy. Reads from TIER_PRICING so ₹499 vs
 *      ₹2,499 stays consistent with the Cashfree button above it.
 *   2. Customer-facing "Submit payment proof" CTA removed. Cashfree is
 *      the primary flow; this panel is now a visible fallback only —
 *      customer pays via UPI and emails a screenshot to support.
 *      Admin can verify manual payments via /admin or Supabase.
 */
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { TIER_PRICING, type TierChoice } from "@/lib/cashfree/tiers";

const UPI_ID = "raunaq.pradhan-2@oksbi";
const SUPPORT_EMAIL = "founder@clearpath.in";

export function PaymentForm({
  email,
  tier,
}: {
  email: string;
  /** Drives amount + copy. Defaults to draft_pack for back-compat. */
  tier?: TierChoice;
}) {
  const tierKey: TierChoice = tier ?? "draft_pack";
  const cfg = TIER_PRICING[tierKey];
  const amount = cfg.amountInr;
  const amountLabel = amount.toLocaleString("en-IN");
  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=ClearPath&am=${amount}&cu=INR`;

  const [copied, setCopied] = useState(false);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked in some contexts; ignore
    }
  }

  return (
    <section className="rounded-xl bg-white border border-[#D9D5C8] p-5 sm:p-7">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F] mb-1.5">
        Manual UPI · fallback
      </p>
      <div className="text-center mb-5">
        <h2 className="font-serif text-2xl text-[#0E1411] mb-1">
          Pay ₹{amountLabel} via UPI
        </h2>
        <p className="text-sm text-[#6B766F]">
          Cashfree giving you trouble? Scan the QR with any UPI app, or
          copy the UPI ID below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-white p-3 border border-[#D9D5C8]">
            <QRCodeSVG
              value={upiUrl}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#0E1411"
            />
          </div>
          <p className="text-xs text-[#6B766F]">Scan to pay ₹{amountLabel}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
              UPI ID
            </p>
            <p className="font-mono text-sm text-[#0E1411] break-all">
              {UPI_ID}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
              Name
            </p>
            <p className="font-mono text-sm text-[#0E1411]">ClearPath</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
              Amount
            </p>
            <p className="font-mono text-sm text-[#0E1411]">₹{amountLabel}</p>
          </div>
          <button
            type="button"
            onClick={copyUpi}
            className="self-start inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white font-medium text-sm px-4 py-1.5 transition-colors"
          >
            {copied ? "Copied ✓" : "Copy UPI ID"}
          </button>
        </div>
      </div>

      <p className="text-sm text-[#0E1411] leading-relaxed">
        After paying, email a screenshot from{" "}
        <span className="font-medium">{email}</span> to{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
            `Manual UPI payment · ${cfg.label} · ₹${amountLabel}`
          )}`}
          className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0a5a47]"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        — we&apos;ll verify it manually within 6 hours.
      </p>
    </section>
  );
}
