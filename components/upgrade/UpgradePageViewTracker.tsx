"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export function UpgradePageViewTracker({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    try {
      posthog.capture("upgrade_page_viewed", { assessment_id: assessmentId });
    } catch {
      // posthog may be uninitialised in some envs; never block rendering.
    }
  }, [assessmentId]);

  return null;
}
