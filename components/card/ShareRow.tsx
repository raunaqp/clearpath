"use client";

import { useState } from "react";
import posthog from "posthog-js";

export function ShareRow({
  shareUrl,
  shareToken,
  productName,
}: {
  shareUrl: string;
  shareToken: string;
  productName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can fail in unsupported contexts; surface nothing.
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/card/${encodeURIComponent(shareToken)}/pdf`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        pdf_url?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.pdf_url) {
        throw new Error(body.error ?? "Download failed.");
      }
      try {
        posthog.capture("card_pdf_downloaded", {
          share_token: shareToken,
          product_name: productName ?? null,
        });
      } catch {
        // telemetry only; never block the download
      }
      // Trigger the actual download via a hidden anchor — Supabase signed
      // URLs serve with `Content-Type: application/pdf` and most browsers
      // open inline; the `download` attribute hints the browser to save.
      const filename = `ClearPath-Readiness-Card-${slug(productName ?? shareToken)}.pdf`;
      const link = document.createElement("a");
      link.href = body.pdf_url;
      link.download = filename;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setDownloadError(
        e instanceof Error ? e.message : "Download failed. Try copy link instead."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {downloading ? (
            <>
              <span
                aria-hidden
                className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"
              />
              <span>Generating PDF…</span>
            </>
          ) : (
            <>
              <span aria-hidden>⬇</span>
              <span>Download PDF</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="text-sm text-[#6B766F] hover:text-[#0F6E56] underline underline-offset-2"
        >
          {copied ? "Link copied ✓" : "or copy share link"}
        </button>
      </div>
      {downloadError && (
        <p className="text-xs text-[#993C1D]" role="alert">
          {downloadError}
        </p>
      )}
      <p className="text-xs text-[#6B766F] leading-relaxed">
        The PDF is branded for sharing with co-founders, regulators, or
        investors. Link valid 90 days.
      </p>
    </div>
  );
}

function slug(s: string): string {
  return (
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "card"
  );
}
