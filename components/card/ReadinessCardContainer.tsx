"use client";

import posthog from "posthog-js";
import { ReadinessCard } from "./ReadinessCard";
import {
  captureAbdmIntent,
  captureDpdpIntent,
} from "@/app/c/[share_token]/actions";
import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";

export function ReadinessCardContainer({
  card,
  assessmentId,
  shareToken,
  shareUrl,
  abdmAlreadyCaptured,
  dpdpAlreadyCaptured,
  showAbdmBlock,
  showDpdpBlock,
  isWellness,
}: {
  card: ReadinessCardType;
  assessmentId: string;
  shareToken: string;
  shareUrl: string;
  abdmAlreadyCaptured: boolean;
  dpdpAlreadyCaptured: boolean;
  showAbdmBlock: boolean;
  showDpdpBlock: boolean;
  isWellness: boolean;
}) {
  async function handleAbdmSubmit(message: string) {
    try {
      posthog.capture("abdm_intent_submitted", {
        assessment_id: assessmentId,
        has_message: message.trim().length > 0,
      });
    } catch {
      // telemetry only — never block the action
    }
    await captureAbdmIntent(assessmentId, shareToken, message);
  }

  async function handleDpdpSubmit() {
    try {
      posthog.capture("dpdp_intent_submitted", {
        assessment_id: assessmentId,
      });
    } catch {
      // telemetry only
    }
    await captureDpdpIntent(assessmentId, shareToken);
  }

  return (
    <ReadinessCard
      card={card}
      assessmentId={assessmentId}
      shareUrl={shareUrl}
      abdmAlreadyCaptured={abdmAlreadyCaptured}
      dpdpAlreadyCaptured={dpdpAlreadyCaptured}
      showAbdmBlock={showAbdmBlock}
      showDpdpBlock={showDpdpBlock}
      isWellness={isWellness}
      onAbdmSubmit={handleAbdmSubmit}
      onDpdpSubmit={handleDpdpSubmit}
    />
  );
}
