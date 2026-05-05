import type { ReadinessCard as ReadinessCardType } from "@/lib/schemas/readiness-card";
import type { CompletenessResult } from "@/lib/completeness/types";
import Link from "next/link";
import { ABDMGapBlock } from "./ABDMGapBlock";
import { DocumentCompletenessBlock } from "./DocumentCompletenessBlock";
import { DPDPGapBlock } from "./DPDPGapBlock";
import { RegulationCountBadge } from "./RegulationCountBadge";
import { RegulationSnapshot } from "./RegulationSnapshot";
import { RiskBlock } from "./RiskBlock";
import { RiskTintedSurface } from "./RiskTintedSurface";
import { ShareRow } from "./ShareRow";
import { Tier23ButtonRow } from "./Tier23ButtonRow";
import { TimelineCompactBlock } from "./TimelineCompactBlock";
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
        {/* 1. Header — eyebrow + product + device type on left,
            regulation count chip top-right (single source of truth for
            "how many regs apply"). On mobile the chip drops below
            the eyebrow to avoid cramping the product name. */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
            REGULATORY RISK PROFILE
          </p>
          <div className="shrink-0">
            <RegulationCountBadge regulations={card.regulations} />
          </div>
        </div>
        <h1 className="font-serif text-[clamp(24px,3vw,36px)] leading-tight text-[#0E1411] mb-1">
          {productName}
        </h1>
        <p className="text-sm text-[#6B766F] leading-relaxed mb-6 max-w-2xl">
          {card.classification.device_type}
        </p>

        {/* 2. 2x2 grid of sibling metrics:
              Row 1: Risk · TRL
              Row 2: Documents · Timeline

            Three independent scores + a timeline. Never composited —
            partners see independent axes. Readiness 0/10 score has been
            retired from the visible card (data still lives in
            card.readiness for TRL derivation + draft-pack consumers).

            For non-medical-device or wellness cards: TRL and Documents
            don't apply, so the grid degrades gracefully to just Risk +
            Timeline (or a single Risk block if Timeline is N/A too).
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 auto-rows-fr">
          <div className="h-full">
            <RiskBlock
              riskLevel={card.risk.level}
              riskRationale={card.risk.rationale}
              cdscoClass={card.classification.cdsco_class}
              classQualifier={card.classification.class_qualifier}
              isMedicalDevice={
                card.classification.medical_device_status === "is_medical_device" ||
                card.classification.medical_device_status === "hybrid"
              }
            />
          </div>
          {showTrlBlock && card.trl && (
            <div className="h-full">
              <TRLBlock trl={card.trl} />
            </div>
          )}
          {showCompletenessBlock && (
            <div className="h-full">
              <DocumentCompletenessBlock
                result={completeness ?? null}
                cdscoClass={card.classification.cdsco_class}
              />
            </div>
          )}
          <div className="h-full">
            <TimelineCompactBlock timeline={card.timeline} />
          </div>
        </div>

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
