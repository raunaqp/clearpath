import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import ConflictDisclosureCard from "@/components/wizard/ConflictDisclosureCard";
import { JourneyProgress } from "@/components/layout/JourneyProgress";

export const dynamic = "force-dynamic";

type ConflictMeta = {
  conflict_detected?: boolean;
  conflict_details?: {
    severity?: "high" | "medium" | "low" | "none";
    authority_used?: "pdf" | "url" | "one_liner";
    one_liner_interpretation?: string;
    pdf_interpretation?: string | null;
    url_interpretation?: string | null;
  } | null;
  conflict_acknowledged?: boolean;
  conflict_edit_attempts?: number;
};

type Row = {
  id: string;
  one_liner: string;
  status: string;
  share_token: string | null;
  meta: ConflictMeta | null;
};

export default async function WizardConflictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, one_liner, status, share_token, meta")
    .eq("id", id)
    .maybeSingle<Row>();

  if (error || !data) {
    return <NotFoundPanel />;
  }

  if (data.status === "draft") redirect(`/assess/${id}`);
  if (data.status === "rejected") redirect(`/declined/${id}`);
  if (data.status === "completed" && data.share_token) {
    redirect(`/c/${data.share_token}`);
  }

  const meta = data.meta ?? {};
  const cd = meta.conflict_details ?? null;
  const severity = cd?.severity;

  const shouldShow =
    meta.conflict_detected === true &&
    (severity === "high" || severity === "medium") &&
    meta.conflict_acknowledged !== true;

  if (!shouldShow) {
    redirect(`/wizard/${id}/q/1`);
  }

  const narrowedSeverity = severity as "high" | "medium";

  return (
    <main className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-8 lg:pt-12 pb-12">
      <div className="w-full max-w-3xl">
        <JourneyProgress
          phase="assessment"
          sub={{ current: 0, total: 7 }}
          bottomTierLabel="ASSESSMENT · CONFLICT REVIEW"
        />
        <ConflictDisclosureCard
          assessmentId={id}
          severity={narrowedSeverity}
          authorityUsed={cd?.authority_used ?? "pdf"}
          oneLinerInterpretation={
            cd?.one_liner_interpretation ?? data.one_liner
          }
          contentInterpretation={
            cd?.pdf_interpretation ?? cd?.url_interpretation ?? null
          }
          contentSource={cd?.authority_used === "url" ? "url" : "pdf"}
          editAttemptCount={meta.conflict_edit_attempts ?? 0}
        />
      </div>
    </main>
  );
}

function NotFoundPanel() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#993C1D] mb-3">
          Not found
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-3">
          We couldn&apos;t find this assessment
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
