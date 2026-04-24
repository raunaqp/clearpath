"use client";
import Link from "next/link";
import posthog from "posthog-js";

function trackCta(location: string, text: string) {
  try {
    posthog.capture("cta_clicked", {
      cta_location: location,
      cta_text: text,
      destination: "/start",
    });
  } catch {}
}

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E8E4D6]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex items-center justify-between h-16">
        <Link href="/" className="font-serif text-xl text-[#0E1411] tracking-tight">
          ClearPath
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#2A3430]">
          <a href="#how-it-works" className="hover:text-[#0F6E56] transition-colors">
            How it works
          </a>
          <a href="#report-preview" className="hover:text-[#0F6E56] transition-colors">
            Sample report
          </a>
          <a href="#faq" className="hover:text-[#0F6E56] transition-colors">
            FAQ
          </a>
        </div>
        <Link
          href="/start"
          onClick={() => trackCta("header", "Get your free card →")}
          className="bg-[#0F6E56] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#0d5c48] transition-colors"
        >
          Get your free card →
        </Link>
      </div>
    </nav>
  );
}
