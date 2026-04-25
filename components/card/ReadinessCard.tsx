import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";
import { ABDMGapBlock } from "./ABDMGapBlock";
import { BadgeRow } from "./BadgeRow";
import { DPDPGapBlock } from "./DPDPGapBlock";
import { ReadinessCircle } from "./ReadinessCircle";
import { RegulationSnapshot } from "./RegulationSnapshot";
import { RiskTintedSurface } from "./RiskTintedSurface";
import { ShareRow } from "./ShareRow";
import { Tier23ButtonRow } from "./Tier23ButtonRow";
import { TimelineBlock } from "./TimelineBlock";
import { TopGapsList } from "./TopGapsList";
import { VerdictBlock } from "./VerdictBlock";
import { WellnessCarveOutBlock } from "./WellnessCarveOutBlock";
import { WhyRegulatedBlock } from "./WhyRegulatedBlock";

function formatToday(): string {
  const today = new Date();
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
  shareToken,
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
  shareToken: string;
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
      <div className="bg-white rounded-xl border border-[#D9D5C8] px-5 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* 1. Header (eyebrow + product + device type) */}
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
          REGULATORY RISK PROFILE
        </p>
        <h1 className="font-serif text-[clamp(24px,3vw,36px)] leading-tight text-[#0E1411] mb-1">
          {productName}
        </h1>
        <p className="text-sm text-[#6B766F] leading-relaxed mb-6 max-w-2xl">
          {card.classification.device_type}
        </p>

        {/* 2. Score + Badge Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
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

        {/* 3-5. Verdict + Why regulated + Top gaps */}
        <div className="space-y-7">
          <VerdictBlock verdict={card.verdict} />
          <WhyRegulatedBlock whyRegulated={card.why_regulated} />
          <TopGapsList gaps={card.top_gaps} />
        </div>

        {/* 6. Tier 2/3 row (combined, equal hierarchy) — wellness path
            shows the carve-out block instead, since Tier 2 doesn't apply */}
        <div className="mt-7">
          {isWellness ? (
            <WellnessCarveOutBlock regulations={card.regulations} />
          ) : (
            <Tier23ButtonRow assessmentId={assessmentId} />
          )}
        </div>

        {/* 7. DPDP intent block (moved up — was after ABDM) */}
        {showDpdpBlock && (
          <DPDPGapBlock
            assessmentId={assessmentId}
            alreadyCaptured={dpdpAlreadyCaptured}
            onSubmit={onDpdpSubmit}
          />
        )}

        {/* 8. ABDM intent block (moved down — was mid-card) */}
        {showAbdmBlock && (
          <ABDMGapBlock
            assessmentId={assessmentId}
            alreadyCaptured={abdmAlreadyCaptured}
            onSubmit={onAbdmSubmit}
          />
        )}

        {/* 9. Regulation snapshot + 10. Timeline (reference depth at bottom) */}
        <div className="mt-7 space-y-7">
          <RegulationSnapshot regulations={card.regulations} />
          <TimelineBlock
            low={card.timeline.estimate_months_low}
            high={card.timeline.estimate_months_high}
            display={card.timeline.display}
            anchor={card.timeline.anchor}
          />
        </div>
      </div>

      {/* 11. ShareRow (Download PDF + secondary copy link) */}
      <div className="mt-6">
        <ShareRow
          shareUrl={shareUrl}
          shareToken={shareToken}
          productName={productName}
        />
      </div>

      {/* 12. Disclaimer footer */}
      <p className="text-xs text-[#6B766F] mt-6 font-mono leading-relaxed text-center">
        Card ID: {shortId} · Generated: {generatedDate} · ClearPath — not legal
        advice
      </p>
    </RiskTintedSurface>
  );
}
