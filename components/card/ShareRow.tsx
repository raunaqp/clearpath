"use client";

import { useState } from "react";

export function ShareRow({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can fail in unsupported contexts (e.g., insecure origin);
      // surface nothing rather than crash. Fallback is the visible URL.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#0F6E56] border border-[#0F6E56] hover:bg-[#EAF3EF] transition-colors"
        >
          <span aria-hidden>📋</span>
          <span>Copy link</span>
        </button>
        {copied && (
          <span
            role="status"
            aria-live="polite"
            className="text-sm text-[#0F6E56] font-medium"
          >
            Copied!
          </span>
        )}
      </div>
      <p className="text-xs text-[#6B766F] leading-relaxed">
        Save this card — bookmark the URL or copy the link to share.
      </p>
    </div>
  );
}
