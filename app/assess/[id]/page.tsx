import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { runPreRouter, type PreRouterPdf } from "@/lib/engine/pre-router";
import { fetchUrl } from "@/lib/engine/fetch-url";
import { downloadPdfAsBase64 } from "@/lib/engine/download-pdf";
import { checkPdfCache, savePdfSummary } from "@/lib/engine/pdf-cache";
import type { WizardAnswers } from "@/lib/wizard/types";
import { totalSteps } from "@/lib/wizard/questions";

export const dynamic = "force-dynamic";

type UploadedDoc = {
  filename: string;
  storage_path: string;
  size_bytes: number;
  sha256: string;
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
      "id, one_liner, url, uploaded_docs, status, share_token, product_type, wizard_answers"
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

  // routing_complete / wizard → jump into the wizard at the first unanswered question.
  if (
    assessment.status === "routing_complete" ||
    assessment.status === "wizard" ||
    assessment.status === "draft" // just processed
  ) {
    const step = firstUnansweredStep(assessment.wizard_answers);
    redirect(`/wizard/${id}/q/${step}`);
  }

  // wizard_complete — feature 5 not built yet, show a holding card.
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
