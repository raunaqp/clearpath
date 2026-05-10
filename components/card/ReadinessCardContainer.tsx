"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { ReadinessCard } from "./ReadinessCard";
import { IntentConfirmationModal } from "./IntentConfirmationModal";
import {
  captureAbdmIntent,
  captureDpdpIntent,
} from "@/app/c/[share_token]/actions";
import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";
import type { CompletenessResult } from "@/lib/completeness/types";

type ModalState = { type: "abdm" | "dpdp" } | null;

export function ReadinessCardContainer({
  card,
  assessmentId,
  shareToken,
  shareUrl,
  email,
  abdmAlreadyCaptured,
  dpdpAlreadyCaptured,
  showAbdmBlock,
  showDpdpBlock,
  isWellness,
  completeness,
}: {
  card: ReadinessCardType;
  assessmentId: string;
  shareToken: string;
  shareUrl: string;
  email: string;
  abdmAlreadyCaptured: boolean;
  dpdpAlreadyCaptured: boolean;
  showAbdmBlock: boolean;
  showDpdpBlock: boolean;
  isWellness: boolean;
  completeness?: CompletenessResult | null;
}) {
  const [modal, setModal] = useState<ModalState>(null);

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
    setModal({ type: "abdm" });
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
    setModal({ type: "dpdp" });
  }

  return (
    <>
      <ReadinessCard
        card={card}
        assessmentId={assessmentId}
        shareUrl={shareUrl}
        shareToken={shareToken}
        abdmAlreadyCaptured={abdmAlreadyCaptured}
        dpdpAlreadyCaptured={dpdpAlreadyCaptured}
        showAbdmBlock={showAbdmBlock}
        showDpdpBlock={showDpdpBlock}
        isWellness={isWellness}
        onAbdmSubmit={handleAbdmSubmit}
        onDpdpSubmit={handleDpdpSubmit}
        completeness={completeness ?? null}
        hideDownload={true}
      />
      <IntentConfirmationModal
        open={modal !== null}
        type={modal?.type ?? "abdm"}
        email={email}
        onClose={() => setModal(null)}
      />
    </>
  );
}
