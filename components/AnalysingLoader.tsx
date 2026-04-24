"use client";

import { useEffect, useState } from "react";

const COPY = [
  "Reading your description…",
  "Cross-checking your website…",
  "Reading through your documents…",
  "Mapping against 9 regulations…",
  "Almost ready…",
];

export default function AnalysingLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % COPY.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full border-2 border-[#D9D5C8] border-t-[#0F6E56] animate-spin mx-auto mb-6" />
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          Analysing your product
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-2 min-h-[32px] transition-opacity">
          {COPY[idx]}
        </h1>
        <p className="text-sm text-[#6B766F]">
          Your Readiness Card will be ready shortly.
        </p>
      </div>
    </div>
  );
}
