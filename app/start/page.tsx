"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

export default function StartPage() {
  const router = useRouter();
  const [oneLiner, setOneLiner] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tooShort = oneLiner.length > 0 && oneLiner.length < 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      posthog.capture("intake_submitted", { has_url: !!url, newsletter });
    } catch {}

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        one_liner: oneLiner,
        url: url || undefined,
        email,
        newsletter_opt_in: newsletter,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/assess/${json.assessmentId}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Minimal nav */}
      <nav className="px-6 py-4 border-b border-[#E8E4D6]">
        <Link
          href="/"
          className="font-serif text-[20px] text-[#0E1411] hover:text-[#0F6E56] transition-colors"
        >
          ClearPath
        </Link>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-xl">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-4">
            Regulatory Readiness Engine
          </p>
          <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
            Tell us about your product
          </h1>
          <p className="text-[#6B766F] text-base mb-8 leading-relaxed">
            We&apos;ll analyse it against 9 Indian regulations in about 5 minutes — free.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 space-y-6">

              {/* One-liner */}
              <div>
                <label
                  htmlFor="one_liner"
                  className="block text-sm font-medium text-[#0E1411] mb-1.5"
                >
                  What does your product do?
                  <span className="text-[#993C1D] ml-0.5">*</span>
                </label>
                <textarea
                  id="one_liner"
                  rows={3}
                  maxLength={200}
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder='E.g. "AI tool that flags early Alzheimer&apos;s from MRI scans for radiologists"'
                  className="w-full rounded-lg border border-[#D9D5C8] bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] resize-none transition-colors"
                  required
                />
                <div className="flex justify-between mt-1.5">
                  {tooShort ? (
                    <p className="text-xs text-[#993C1D]">
                      A little more detail helps — aim for 20 characters minimum.
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ml-auto ${
                      oneLiner.length > 180 ? "text-[#BA7517]" : "text-[#6B766F]"
                    }`}
                  >
                    {oneLiner.length} / 200
                  </p>
                </div>
              </div>

              {/* URL */}
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-[#0E1411] mb-1.5"
                >
                  Product website{" "}
                  <span className="text-[#6B766F] font-normal">(optional)</span>
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  className="w-full rounded-lg border border-[#D9D5C8] bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-colors"
                />
                <p className="text-xs text-[#6B766F] mt-1.5">
                  We&apos;ll read your site to cross-check your description — helps catch features you might have missed.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#0E1411] mb-1.5"
                >
                  Your email
                  <span className="text-[#993C1D] ml-0.5">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@yourcompany.com"
                  className="w-full rounded-lg border border-[#D9D5C8] bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-colors"
                  required
                />
                <p className="text-xs text-[#6B766F] mt-1.5">
                  We&apos;ll send your Readiness Card here. No spam.
                </p>
              </div>

              {/* Newsletter */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-0.5 rounded border-[#D9D5C8] accent-[#0F6E56]"
                />
                <span className="text-sm text-[#6B766F] leading-relaxed">
                  Send me weekly updates on Indian digital health regulation — no fluff, just what changed.
                </span>
              </label>

              {/* Error */}
              {error && (
                <p className="text-sm text-[#993C1D] bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || oneLiner.length < 20 || !email}
                className="w-full bg-[#0F6E56] text-white font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving your submission…
                  </>
                ) : (
                  "Start analysis →"
                )}
              </button>

              {/* DPDP notice */}
              <p className="text-xs text-[#6B766F] text-center leading-relaxed">
                Your data is used only to generate your Readiness Card. Stored
                encrypted, deleted after 90 days, never shared.{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-[#0E1411]">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
