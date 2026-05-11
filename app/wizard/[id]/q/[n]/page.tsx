import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import WizardClient from "@/components/wizard/WizardClient";
import { QuestionContextPane } from "@/components/layout/QuestionContextPane";
import { displayName } from "@/lib/wizard/display-name";
import { totalSteps } from "@/lib/wizard/questions";
import type {
  DataSensitivity,
  InfoSignificance,
  WizardAnswers,
} from "@/lib/wizard/types";
import type {
  AiExtractedRow,
  PitchAiExtracted,
} from "@/lib/intake/ai-extract";

export const dynamic = "force-dynamic";

type UploadedDoc = { sha256: string; filename: string };

type AssessmentMeta = {
  conflict_detected?: boolean;
  wizard_skipped_questions?: number[];
};

type Row = {
  id: string;
  one_liner: string;
  uploaded_docs: UploadedDoc[] | null;
  status: string;
  share_token: string | null;
  product_type: string | null;
  wizard_answers: WizardAnswers | null;
  meta: AssessmentMeta | null;
  ai_extracted: AiExtractedRow | null;
};

// Phase 3.5 INV-1 — heuristics to map ai_extracted suggestions to Tier A
// answer values. Conservative: only prefill where the extraction signal
// is clear. Q1/Q3/Q4/Q5/Q7 have no clean extraction counterpart — leave
// blank so the user fills them.

function deriveQ2FromExtraction(
  ai: PitchAiExtracted | null
): InfoSignificance | undefined {
  if (!ai) return undefined;
  const aiMl = ai.suggested_wizard_answers?.ai_ml;
  const intendedUse = (
    ai.suggested_wizard_answers?.intended_use ??
    ai.intended_use_one_liner ??
    ""
  ).toLowerCase();
  // Only emit a default when the deck signals an active model. Static
  // displays without ML inference stay blank.
  if (aiMl !== "static" && aiMl !== "adaptive") return undefined;
  if (/diagnos|treat|autonom|automated decision/.test(intendedUse)) {
    return "diagnoses_treats";
  }
  if (/recommend|flag|alert|predict|suggest|support|decision/.test(intendedUse)) {
    return "drives";
  }
  // AI/ML present but copy doesn't disambiguate — pick the safer middle
  // option. The user can adjust on Q2 with full context.
  return "drives";
}

function deriveQ6FromExtraction(
  ai: PitchAiExtracted | null
): DataSensitivity[] | undefined {
  if (!ai) return undefined;
  const sens = ai.suggested_wizard_answers?.data_sensitivity;
  if (sens === "identifiable" || sens === "deidentified") return ["phi"];
  if (sens === "none") return ["none"];
  return undefined;
}

export default async function WizardStepPage({
  params,
}: {
  params: Promise<{ id: string; n: string }>;
}) {
  const { id, n } = await params;
  const step = parseInt(n, 10);
  const total = totalSteps();

  if (Number.isNaN(step) || step < 1 || step > total) {
    return <NotFoundPanel message={`Question ${n} doesn't exist.`} />;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, one_liner, uploaded_docs, status, share_token, product_type, wizard_answers, meta, ai_extracted"
    )
    .eq("id", id)
    .maybeSingle<Row>();

  if (error || !data) {
    return <NotFoundPanel message="We couldn't find this assessment." />;
  }

  if (data.status === "draft") redirect(`/assess/${id}`);
  if (data.status === "rejected") redirect(`/declined/${id}`);

  const meta = data.meta ?? {};
  const productDisplayName = displayName(data.one_liner);
  const pdfCount = Array.isArray(data.uploaded_docs)
    ? data.uploaded_docs.length
    : 0;
  const savedAnswers: WizardAnswers = data.wizard_answers ?? {};
  const initialSkipped = meta.wizard_skipped_questions ?? [];

  // Phase 3.5 INV-1 — merge ai_extracted suggestions into initial values
  // for fields the user hasn't saved yet. Saved values always win.
  const aiFields =
    data.ai_extracted?.status === "complete"
      ? data.ai_extracted.fields
      : null;
  const derivedQ2 = savedAnswers.q2 ?? deriveQ2FromExtraction(aiFields);
  const derivedQ6 =
    savedAnswers.q6 && savedAnswers.q6.length > 0
      ? savedAnswers.q6
      : deriveQ6FromExtraction(aiFields);
  const initialAnswers: WizardAnswers = {
    ...savedAnswers,
    ...(derivedQ2 ? { q2: derivedQ2 } : {}),
    ...(derivedQ6 ? { q6: derivedQ6 } : {}),
  };
  const aiBannerVisible =
    aiFields !== null &&
    Object.keys(savedAnswers).length === 0 &&
    (derivedQ2 !== undefined || derivedQ6 !== undefined);

  // All-answers-prefilled detection — true when every q1..q7 is non-null
  // (and arrays are non-empty). Demo packets prefill all 7 at intake;
  // real users won't hit this until they've answered everything. When
  // true, the wizard exposes a "Skip to card →" affordance.
  const allAnswersPrefilled = (() => {
    const a = initialAnswers as Record<string, unknown>;
    for (let i = 1; i <= total; i++) {
      const v = a[`q${i}`];
      if (v === undefined || v === null) return false;
      if (Array.isArray(v) && v.length === 0) return false;
    }
    return true;
  })();

  // Two-pane on xl+ (1280px+): left = question card, right = context pane.
  // Below xl: single column with horizontal stepper. The 1024-1279 band
  // sits in the single-column path because at 1024 the right pane only
  // leaves 704px on the left, which feels cramped.
  return (
    <main className="flex-1 flex justify-center">
      <div className="w-full max-w-6xl flex">
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 lg:pt-12 xl:pt-16 pb-12">
          <div className="mx-auto w-full max-w-3xl">
            <WizardClient
              assessmentId={id}
              productDisplayName={productDisplayName}
              currentStep={step}
              initialAnswers={initialAnswers}
              initialSkipped={initialSkipped}
              productType={data.product_type}
              conflictEncountered={meta.conflict_detected === true}
              pdfCount={pdfCount}
              allAnswersPrefilled={allAnswersPrefilled}
              aiBannerVisible={aiBannerVisible}
            />
          </div>
        </div>
        <QuestionContextPane currentStep={step} totalSteps={total} />
      </div>
    </main>
  );
}

function NotFoundPanel({ message }: { message: string }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#993C1D] mb-3">
          Not found
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-3">
          {message}
        </h1>
        <Link
          href="/start"
          className="inline-block bg-[#0F6E56] text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
        >
          Start over →
        </Link>
      </div>
    </main>
  );
}
