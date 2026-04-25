"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import posthog from "posthog-js";

const UPI_ID = "raunaq.pradhan-2@oksbi";
const AMOUNT_INR = 499;
const UPI_URL = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=ClearPath&am=${AMOUNT_INR}&cu=INR`;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

export function PaymentForm({
  assessmentId,
  email,
}: {
  assessmentId: string;
  email: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [txnId, setTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("Screenshot must be 5 MB or smaller.");
      e.target.value = "";
      setFile(null);
      return;
    }
    if (!ALLOWED_MIME.includes(f.type as (typeof ALLOWED_MIME)[number])) {
      setError("Screenshot must be PNG, JPEG, or WebP.");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(f);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked in some contexts; ignore
    }
  }

  async function handleSubmit() {
    setError(null);
    const trimmedTxn = txnId.trim();
    if (!file && !trimmedTxn) {
      setError("Upload a screenshot or enter a transaction ID.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("assessment_id", assessmentId);
    if (file) fd.append("payment_screenshot", file);
    if (trimmedTxn) fd.append("transaction_id", trimmedTxn);

    try {
      const res = await fetch("/api/upgrade/submit-payment-proof", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Submission failed." }));
        setError(body?.error ?? "Submission failed.");
        setSubmitting(false);
        return;
      }
      try {
        posthog.capture("payment_proof_submitted", {
          assessment_id: assessmentId,
          has_screenshot: !!file,
          has_txn_id: !!trimmedTxn,
        });
      } catch {
        // telemetry only
      }
      // Server component will see the new order on refresh and render StatusPanel.
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl bg-white border border-[#D9D5C8] p-5 sm:p-7">
      <div className="text-center mb-5">
        <h2 className="font-serif text-2xl text-[#0E1411] mb-1">Pay ₹499</h2>
        <p className="text-sm text-[#6B766F]">
          Scan the QR with any UPI app, or copy the UPI ID below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-white p-3 border border-[#D9D5C8]">
            <QRCodeSVG
              value={UPI_URL}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#0E1411"
            />
          </div>
          <p className="text-xs text-[#6B766F]">Scan to pay ₹{AMOUNT_INR}</p>
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
            <p className="font-mono text-sm text-[#0E1411]">₹{AMOUNT_INR}</p>
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

      <hr className="border-t border-[#D9D5C8] my-6" />

      <p className="text-sm text-[#0E1411] font-medium mb-4 text-center">
        After paying, share proof below.
      </p>

      <div className="space-y-4 mb-5">
        <div>
          <label
            htmlFor="payment-screenshot"
            className="block text-sm font-medium text-[#0E1411] mb-1"
          >
            Upload payment screenshot
          </label>
          <input
            id="payment-screenshot"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={submitting}
            className="block w-full text-sm text-[#0E1411] file:mr-3 file:rounded-full file:border-0 file:bg-[#E1F5EE] file:px-3 file:py-1.5 file:text-[#0F6E56] file:font-medium hover:file:bg-[#cdefe1] disabled:opacity-60"
          />
          {file && (
            <p className="text-xs text-[#6B766F] mt-1">
              {file.name} ({Math.round(file.size / 1024)} KB){" "}
              <button
                type="button"
                onClick={clearFile}
                className="underline underline-offset-2 hover:text-[#0E1411]"
              >
                remove
              </button>
            </p>
          )}
        </div>

        <p className="text-xs uppercase tracking-wider text-[#6B766F] text-center">
          or
        </p>

        <div>
          <label
            htmlFor="transaction-id"
            className="block text-sm font-medium text-[#0E1411] mb-1"
          >
            Enter transaction ID
          </label>
          <input
            id="transaction-id"
            type="text"
            inputMode="numeric"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="e.g., 426123456789"
            disabled={submitting}
            className="block w-full rounded-lg bg-white px-3 py-2 text-sm text-[#0E1411] placeholder:text-[#6B766F] border border-[#D9D5C8] focus:outline-none focus:ring-1 focus:ring-[#0F6E56] focus:border-[#0F6E56] disabled:opacity-60"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          {submitting ? "Submitting…" : "Submit payment proof →"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-[#993C1D] mt-3" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-[#6B766F] mt-4 text-center">
        We&apos;ll email your Draft Pack to{" "}
        <span className="font-medium text-[#0E1411]">{email}</span> within 6
        hours.
      </p>
    </section>
  );
}
