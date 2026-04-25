"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export function Tier2CTABlock({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();

  function handleClick() {
    try {
      posthog.capture("tier2_cta_clicked", { source: "card_bottom" });
    } catch {
      // posthog may be uninitialised in some envs (e.g., SSR-stripped tests);
      // never block the navigation on telemetry.
    }
    router.push(`/upgrade/${assessmentId}`);
  }

  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl text-[#0E1411] mb-5">
        Ready to file? Get your Draft Pack — ₹499
      </h2>

      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[15px] px-6 py-3 transition-colors"
        >
          Get the Draft Pack — ₹499 →
        </button>
        <p className="text-xs text-[#6B766F]">
          10 minutes. Emailed to you. Replaces ₹50K-3L of consultant work.
        </p>
      </div>
    </section>
  );
}
