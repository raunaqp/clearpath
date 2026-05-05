import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import { ReadinessCardContainer } from "@/components/card/ReadinessCardContainer";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { deriveTRL } from "@/lib/engine/trl";
import { runCompletenessForCard } from "@/lib/completeness/category";
import type { CheckerDocument } from "@/lib/completeness/types";

export const dynamic = "force-dynamic";

type UploadedDoc = {
  filename: string;
  storage_path: string;
  size_bytes: number;
  sha256: string;
  doc_type?: string | null;
};

type AssessmentRow = {
  id: string;
  share_token: string;
  email: string;
  readiness_card: unknown;
  abdm_intent_captured_at: string | null;
  dpdp_intent_captured_at: string | null;
  uploaded_docs: UploadedDoc[] | null;
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ share_token: string }>;
}) {
  const { share_token } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, share_token, email, readiness_card, abdm_intent_captured_at, dpdp_intent_captured_at, uploaded_docs"
    )
    .eq("share_token", share_token)
    .eq("status", "completed")
    .maybeSingle<AssessmentRow>();

  if (error || !data || data.readiness_card == null) {
    notFound();
  }

  const parsed = ReadinessCardSchema.safeParse(data.readiness_card);
  if (!parsed.success) {
    notFound();
  }
  const card = parsed.data;

  // Backfill TRL deterministically for cards generated before the synthesizer
  // started populating it. Anchored to the SERB / ANRF MAHA MedTech Mission
  // framework (CDSCO-form-anchored TRL definitions).
  if (!card.trl) {
    const derived = deriveTRL(card);
    if (derived !== null) {
      card.trl = derived;
    }
  }

  // Run document-completeness check using the uploaded_docs at intake.
  // Source of truth: lib/completeness/checklist.ts (ported from
  // cdsco-reviewer-tool). Returns null for non-medical-device or
  // unknown-class cards — the card UI handles the null gracefully.
  const checkerDocs: CheckerDocument[] = (data.uploaded_docs ?? []).map(
    (d, idx) => ({
      id: d.sha256 || `doc-${idx}`,
      filename: d.filename,
      doc_type: d.doc_type ?? null,
    })
  );
  const completeness = runCompletenessForCard(card, checkerDocs);

  const h = await headers();
  const host = h.get("host") ?? "clearpath.in";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${proto}://${host}/c/${share_token}`;

  const isWellness =
    card.classification.medical_device_status === "wellness_carve_out";
  const showAbdmBlock =
    !isWellness && card.regulations.abdm.verdict === "required";
  const showDpdpBlock =
    card.regulations.dpdp.verdict === "required" ||
    card.regulations.dpdp.verdict === "conditional";

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <ReadinessCardContainer
            card={card}
            assessmentId={data.id}
            shareToken={share_token}
            shareUrl={shareUrl}
            email={data.email}
            abdmAlreadyCaptured={!!data.abdm_intent_captured_at}
            dpdpAlreadyCaptured={!!data.dpdp_intent_captured_at}
            showAbdmBlock={showAbdmBlock}
            showDpdpBlock={showDpdpBlock}
            isWellness={isWellness}
            completeness={completeness}
          />
        </div>
      </main>
    </div>
  );
}
