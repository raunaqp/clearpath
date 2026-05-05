import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";
import type { CompletenessResult } from "@/lib/completeness/types";
import Link from "next/link";
import { ABDMGapBlock } from "./ABDMGapBlock";
import { BadgeRow } from "./BadgeRow";
import { DocumentCompletenessBlock } from "./DocumentCompletenessBlock";
import { DPDPGapBlock } from "./DPDPGapBlock";
import { ReadinessCircle } from "./ReadinessCircle";
import { RegulationSnapshot } from "./RegulationSnapshot";
import { RiskTintedSurface } from "./RiskTintedSurface";
import { ShareRow } from "./ShareRow";
import { Tier23ButtonRow } from "./Tier23ButtonRow";
import { TimelineBlock } from "./TimelineBlock";
import { TopGapsList } from "./TopGapsList";
import { TRLBlock } from "./TRLBlock";
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
  completeness,
  hideDownload,
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
  completeness?: CompletenessResult | null;
  /** Static demo cards (e.g. /demo/trl-cards) have no real share token,
   * so the PDF generation API would 404. Pass true to hide the download
   * button while keeping the share link copy affordance. */
  hideDownload?: boolean;
}) {
  const productName = card.meta.product_name || card.meta.company_name;
  const shortId = assessmentId.slice(0, 6);
  const generatedDate = formatToday();
  const showCompletenessBlock = !isWellness && completeness !== null && completeness !== undefined;
  const showTrlBlock = card.trl && card.trl.level !== null;

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

        {/* 2. Readiness circle + Badge Row.
            Readiness /10 = paperwork preparedness across 5 dimensions
            (regulatory clarity, QMS, technical docs, clinical evidence,
            submission maturity). Sibling to TRL (technical/clinical
            maturity) and Documents (CDSCO doc count). Three independent
            metrics — never composited per "Readiness ≠ Risk" rule. */}
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
              regulations={card.regulations}
            />
          </div>
        </div>

        {/* 2b. TRL + Documents (sibling metrics, side-by-side on desktop). */}
        {(showTrlBlock || showCompletenessBlock) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {showTrlBlock && card.trl && <TRLBlock trl={card.trl} />}
            {showCompletenessBlock && (
              <DocumentCompletenessBlock
                result={completeness ?? null}
                cdscoClass={card.classification.cdsco_class}
              />
            )}
          </div>
        )}

        {/* 3. Verdict + Why regulated */}
        <div className="space-y-7 mb-7">
          <VerdictBlock verdict={card.verdict} />
          <WhyRegulatedBlock whyRegulated={card.why_regulated} />
        </div>

        {/* 4. Regulation snapshot — moved ABOVE gaps so the founder sees
            scope first, then the actionable gaps to fix. */}
        <div className="mb-7">
          <RegulationSnapshot regulations={card.regulations} />
        </div>

        {/* 5. Top gaps — actionable next steps */}
        <div className="mb-7">
          <TopGapsList gaps={card.top_gaps} />
        </div>

        {/* 6. Pick your path — Tier 2/3 CTAs.
            Wellness: shows carve-out block instead since paid tiers don't apply. */}
        <div className="mb-7">
          {isWellness ? (
            <WellnessCarveOutBlock regulations={card.regulations} />
          ) : (
            <Tier23ButtonRow assessmentId={assessmentId} />
          )}
        </div>

        {/* 7. Edit inputs — full re-entry into the wizard. The card was
            generated from these inputs; editing kicks off a fresh
            synthesis. Same path used by demo packets and real assessments. */}
        <div className="mb-7 pt-5 border-t border-[#E8E4D6]">
          <Link
            href={`/wizard/${assessmentId}/q/1`}
            className="inline-flex items-center gap-2 text-sm text-[#6B766F] hover:text-[#0F6E56] underline underline-offset-4"
          >
            ← Edit your answers and regenerate
          </Link>
          <p className="text-xs text-[#6B766F] mt-1.5 leading-relaxed">
            Step through the 7 questions again with prefilled answers; submit
            to generate a fresh card.
          </p>
        </div>

        {/* 8. DPDP intent block — kept simple, optional. */}
        {showDpdpBlock && (
          <DPDPGapBlock
            assessmentId={assessmentId}
            alreadyCaptured={dpdpAlreadyCaptured}
            onSubmit={onDpdpSubmit}
          />
        )}

        {/* 9. ABDM intent block */}
        {showAbdmBlock && (
          <ABDMGapBlock
            assessmentId={assessmentId}
            alreadyCaptured={abdmAlreadyCaptured}
            onSubmit={onAbdmSubmit}
          />
        )}

        {/* 10. Timeline (reference depth at bottom) */}
        <div className="mt-7">
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
          hideDownload={hideDownload}
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
