"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 3000;

export function SynthesizerWaitingPanel({
  ageSeconds,
}: {
  ageSeconds: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), REFRESH_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div
          aria-hidden
          className="inline-block w-8 h-8 rounded-full border-2 border-[#0F6E56]/20 border-t-[#0F6E56] animate-spin mb-4"
        />
        <h1 className="font-serif text-xl text-[#0E1411] mb-2">
          Generating your Readiness Card…
        </h1>
        <p className="text-sm text-[#6B766F]">
          Already trying — please wait. This page refreshes itself
          {ageSeconds > 0 ? ` (${ageSeconds}s elapsed).` : "."}
        </p>
      </div>
    </div>
  );
}
