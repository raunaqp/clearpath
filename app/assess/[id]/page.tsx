import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { runPreRouter, type PreRouterPdf } from "@/lib/engine/pre-router";
import { fetchUrl } from "@/lib/engine/fetch-url";
import { downloadPdfAsBase64 } from "@/lib/engine/download-pdf";
import { checkPdfCache, savePdfSummary } from "@/lib/engine/pdf-cache";
import { runSynthesisForAssessment } from "@/lib/engine/run-synthesis";
import type { WizardAnswers } from "@/lib/wizard/types";
import { totalSteps } from "@/lib/wizard/questions";
import {
  SynthesizerErrorPanel,
  type SynthesizerErrorType,
} from "@/components/card/SynthesizerErrorPanel";
import { SynthesizerWaitingPanel } from "@/components/card/SynthesizerWaitingPanel";
import { retrySynthesis } from "./actions";

export const dynamic = "force-dynamic";

const MAX_SYNTHESIZER_RETRIES = 3;

type UploadedDoc = {
  filename: string;
  storage_path: string;
  size_bytes: number;
  sha256: string;
};

type AssessmentMeta = {
  conflict_detected?: boolean;
  conflict_details?: {
    severity?: "high" | "medium" | "low" | "none";
  } | null;
  conflict_acknowledged?: boolean;
};

type AssessmentRow = {
  id: string;
  one_liner: string;
  url: string | null;
  uploaded_docs: UploadedDoc[] | null;
  status: string;
  share_token: string | null;
  product_type: string | null;
  wizard_answers: WizardAnswers | null;
  meta: AssessmentMeta | null;
};

function firstUnansweredStep(answers: WizardAnswers | null): number {
  const a = answers ?? {};
  const total = totalSteps();
  for (let i = 1; i <= total; i++) {
    const key = `q${i}` as keyof WizardAnswers;
    const v = a[key];
    if (v === undefined || v === null) return i;
    if (Array.isArray(v) && v.length === 0) return i;
  }
  return 1;
}

export default async function AssessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select(
      "id, one_liner, url, uploaded_docs, status, share_token, product_type, wizard_answers, meta"
    )
    .eq("id", id)
    .maybeSingle<AssessmentRow>();

  if (error || !assessment) {
    return <NotFoundPanel />;
  }

  // Already landed somewhere — route user there
  if (assessment.status === "completed" && assessment.share_token) {
    redirect(`/c/${assessment.share_token}`);
  }
  if (assessment.status === "rejected") {
    redirect(`/declined/${id}`);
  }

  // First time through: run the pre-router. Then fall through to wizard redirect.
  if (assessment.status === "draft") {
    const outcome = await runPreRouterFlow(assessment);
    if (outcome === "rejected") redirect(`/declined/${id}`);
    // else: status is now routing_complete; fall through.
  }

  // routing_complete / wizard → jump into the wizard.
  // If an unacknowledged high/medium conflict exists, divert to
  // the dedicated /wizard/[id]/conflict screen first.
  if (
    assessment.status === "routing_complete" ||
    assessment.status === "wizard" ||
    assessment.status === "draft" // just processed
  ) {
    const meta = assessment.meta ?? {};
    const severity = meta.conflict_details?.severity;
    const showConflictScreen =
      meta.conflict_detected === true &&
      (severity === "high" || severity === "medium") &&
      meta.conflict_acknowledged !== true;

    if (showConflictScreen) {
      redirect(`/wizard/${id}/conflict`);
    }

    const step = firstUnansweredStep(assessment.wizard_answers);
    redirect(`/wizard/${id}/q/${step}`);
  }

  // synthesizer_error — show panel + retry button. Don't auto-retry on
  // every page load; the user clicks retry explicitly.
  if (assessment.status === "synthesizer_error") {
    const meta = (assessment.meta ?? {}) as Record<string, unknown>;
    const errMeta = meta.synthesizer_error as
      | { retry_count?: number; error_type?: string }
      | undefined;
    const retryCount =
      typeof errMeta?.retry_count === "number" ? errMeta.retry_count : 0;
    const errorType =
      (errMeta?.error_type as SynthesizerErrorType | undefined) ?? "unknown";

    async function handleRetry(): Promise<void> {
      "use server";
      await retrySynthesis(id);
    }

    return (
      <SynthesizerErrorPanel
        assessmentId={id}
        retryCount={retryCount}
        errorType={errorType}
        canRetry={retryCount < MAX_SYNTHESIZER_RETRIES}
        onRetry={handleRetry}
      />
    );
  }

  // wizard_complete | synthesizing — drive (or observe) synthesis. The helper
  // handles fresh-lock detection (returns "wait") and stale-lock takeover.
  if (
    assessment.status === "wizard_complete" ||
    assessment.status === "synthesizing"
  ) {
    const result = await runSynthesisForAssessment(id);

    if (result.kind === "redirect") {
      redirect(`/c/${result.shareToken}`);
    }

    if (result.kind === "wait") {
      return (
        <SynthesizerWaitingPanel
          ageSeconds={Math.floor(result.runningSinceMs / 1000)}
        />
      );
    }

    async function handleRetry(): Promise<void> {
      "use server";
      await retrySynthesis(id);
    }

    return (
      <SynthesizerErrorPanel
        assessmentId={id}
        retryCount={result.retryCount}
        errorType={result.errorType}
        canRetry={result.retryCount < MAX_SYNTHESIZER_RETRIES}
        onRetry={handleRetry}
      />
    );
  }

  // Unknown status — fall back to the holding card.
  return <EngineComingPanel productType={assessment.product_type} />;
}

async function runPreRouterFlow(
  assessment: AssessmentRow
): Promise<"rejected" | "routing_complete" | "error"> {
  const supabase = getServiceClient();

  try {
    const urlContent = assessment.url ? await fetchUrl(assessment.url) : null;

    const pdfs: PreRouterPdf[] = [];
    for (const doc of assessment.uploaded_docs ?? []) {
      const cached = await checkPdfCache(doc.sha256);
      if (cached.cached) {
        pdfs.push({ type: "cached", sha256: doc.sha256, summary: cached.summary });
      } else {
        try {
          const base64 = await downloadPdfAsBase64(doc.storage_path);
          pdfs.push({
            type: "fresh",
            sha256: doc.sha256,
            base64,
            filename: doc.filename,
          });
        } catch (err) {
          console.warn(`Skipping PDF ${doc.filename}: ${(err as Error).message}`);
        }
      }
    }

    const result = await runPreRouter({
      oneLiner: assessment.one_liner,
      urlContent,
      pdfs,
    });

    for (const s of result.pdf_summaries) {
      try {
        await savePdfSummary({
          sha256: s.sha256,
          summary: s.summary,
          token_count: 0,
        });
      } catch (err) {
        console.warn(`PDF cache write failed for ${s.sha256}:`, err);
      }
    }

    const newStatus =
      result.next_action === "reject" ? "rejected" : "routing_complete";

    await supabase
      .from("assessments")
      .update({
        product_type: result.product_type,
        url_fetched_content: urlContent,
        status: newStatus,
        meta: {
          pre_router: {
            rationale: result.rationale,
            conflict_detected: result.conflict_detected,
            conflict_note: result.conflict_note,
            rejection_reason: result.rejection_reason,
            cost_usd: result.cost_usd,
            ran_at: new Date().toISOString(),
          },
          conflict_detected: result.conflict_detected,
          conflict_details: result.conflict_details,
          detected_signals: result.detected_signals,
        },
      })
      .eq("id", assessment.id);

    return newStatus === "rejected" ? "rejected" : "routing_complete";
  } catch (err) {
    console.error("Pre-router flow failed:", err);
    return "error";
  }
}

function NotFoundPanel() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#993C1D] mb-3">
          Not found
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-3">
          We couldn&apos;t find this assessment
        </h1>
        <p className="text-sm text-[#6B766F] mb-6">
          The link may be broken or the submission was never saved. Start a fresh
          analysis below.
        </p>
        <Link
          href="/start"
          className="inline-block bg-[#0F6E56] text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
        >
          Start over →
        </Link>
      </div>
    </div>
  );
}

function EngineComingPanel({ productType }: { productType: string | null }) {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F6E56] mb-3">
          Pre-routing complete
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-3">
          We&apos;ve classified your product
          {productType && <span className="text-[#6B766F]"> — {productType}</span>}.
        </h1>
        <p className="text-sm text-[#6B766F] mb-6">
          The full Readiness Card generator is shipping next. We&apos;ve saved your
          submission and will email you the card as soon as it&apos;s live.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-[#0E1411] underline underline-offset-4 hover:text-[#0F6E56]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
