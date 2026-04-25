import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import WizardClient from "@/components/wizard/WizardClient";
import { QuestionContextPane } from "@/components/layout/QuestionContextPane";
import { displayName } from "@/lib/wizard/display-name";
import { totalSteps } from "@/lib/wizard/questions";
import type { WizardAnswers } from "@/lib/wizard/types";

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
};

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
      "id, one_liner, uploaded_docs, status, share_token, product_type, wizard_answers, meta"
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
  const initialAnswers: WizardAnswers = data.wizard_answers ?? {};
  const initialSkipped = meta.wizard_skipped_questions ?? [];

  // Two-pane on lg+ (1024px+): left = question card, right = context pane.
  // Below lg: single column; the WizardClient's own horizontal stepper
  // handles progress visibility on mobile/tablet.
  return (
    <main className="flex-1 flex justify-center">
      <div className="w-full max-w-6xl flex">
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
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
