import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";
import { ABDMGapBlock } from "./ABDMGapBlock";
import { BadgeRow } from "./BadgeRow";
import { DPDPGapBlock } from "./DPDPGapBlock";
import { ReadinessCircle } from "./ReadinessCircle";
import { RegulationSnapshot } from "./RegulationSnapshot";
import { RiskTintedSurface } from "./RiskTintedSurface";
import { ShareRow } from "./ShareRow";
import { Tier2CTABlock } from "./Tier2CTABlock";
import { Tier3SecondaryLink } from "./Tier3SecondaryLink";
import { TimelineBlock } from "./TimelineBlock";
import { TopGapsList } from "./TopGapsList";
import { VerdictBlock } from "./VerdictBlock";
import { WellnessCarveOutBlock } from "./WellnessCarveOutBlock";
import { WhyRegulatedBlock } from "./WhyRegulatedBlock";

function formatToday(): string {
  const today = new Date();
  // Locale-stable, short, human-readable: "24 Apr 2026"
  return today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReadinessCard({
  card,
  assessmentId,
  shareUrl,
  abdmAlreadyCaptured,
  dpdpAlreadyCaptured,
  onAbdmSubmit,
  onDpdpSubmit,
  showAbdmBlock,
  showDpdpBlock,
  isWellness,
}: {
  card: ReadinessCardType;
  assessmentId: string;
  shareUrl: string;
  abdmAlreadyCaptured: boolean;
  dpdpAlreadyCaptured: boolean;
  onAbdmSubmit: (message: string) => Promise<void>;
  onDpdpSubmit: () => Promise<void>;
  showAbdmBlock: boolean;
  showDpdpBlock: boolean;
  isWellness: boolean;
}) {
  const productName = card.meta.product_name || card.meta.company_name;
  const shortId = assessmentId.slice(0, 6);
  const generatedDate = formatToday();

  return (
    <RiskTintedSurface riskLevel={card.risk.level}>
      <div className="bg-white rounded-xl border border-[#D9D5C8] p-5 sm:p-7">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          REGULATORY RISK PROFILE
        </p>

        <h1 className="font-serif text-[clamp(24px,3.2vw,32px)] leading-tight text-[#0E1411] mb-1">
          {productName}
        </h1>
        <p className="text-sm text-[#6B766F] leading-relaxed mb-6">
          {card.classification.device_type}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
          <ReadinessCircle
            score={card.readiness.score}
            band={card.readiness.band}
          />
          <div className="flex-1 min-w-0">
            <BadgeRow
              riskLevel={card.risk.level}
              mdStatus={card.classification.medical_device_status}
              cdscoClass={card.classification.cdsco_class}
              classQualifier={card.classification.class_qualifier}
              timelineDisplay={card.timeline.display}
            />
          </div>
        </div>

        <div className="space-y-7">
          <VerdictBlock verdict={card.verdict} />
          <WhyRegulatedBlock whyRegulated={card.why_regulated} />
          <TopGapsList gaps={card.top_gaps} />
          <RegulationSnapshot regulations={card.regulations} />
          <TimelineBlock
            low={card.timeline.estimate_months_low}
            high={card.timeline.estimate_months_high}
            display={card.timeline.display}
            anchor={card.timeline.anchor}
          />
        </div>
      </div>

      {isWellness ? (
        <WellnessCarveOutBlock regulations={card.regulations} />
      ) : (
        <Tier2CTABlock assessmentId={assessmentId} />
      )}

      {showAbdmBlock && (
        <ABDMGapBlock
          assessmentId={assessmentId}
          alreadyCaptured={abdmAlreadyCaptured}
          onSubmit={onAbdmSubmit}
        />
      )}

      {showDpdpBlock && (
        <DPDPGapBlock
          assessmentId={assessmentId}
          alreadyCaptured={dpdpAlreadyCaptured}
          onSubmit={onDpdpSubmit}
        />
      )}

      <Tier3SecondaryLink assessmentId={assessmentId} />

      <hr className="border-t border-[#D9D5C8] my-6" />

      <ShareRow shareUrl={shareUrl} />

      <p className="text-xs text-[#6B766F] mt-6 font-mono leading-relaxed">
        Card ID: {shortId} · Generated: {generatedDate} · ClearPath — not legal
        advice
      </p>
    </RiskTintedSurface>
  );
}
