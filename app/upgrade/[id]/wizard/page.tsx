/**
 * Tier B wizard (Sprint 2 Story 2.5 Phase 3).
 *
 * Single-page save-on-blur wizard gated to paying Tier 2 customers.
 * Collects CDSCO manufacturing-license-specific data that the upgraded
 * Draft Pack needs (B1–B6 core + C1/C2 conditional). Inserted BEFORE
 * payment per Shape 1 architecture decision.
 *
 * Routing:
 *   - Risk Card CTA → /upgrade/{id}              (existing)
 *   - /upgrade/{id} redirects here if Tier B incomplete
 *   - On submit → /upgrade/{id} (payment page)
 *
 * Prefill sources (read-only at server, passed as initialValues):
 *   - B1: ai_extracted.fields.suggested_wizard_answers.intended_use → one_liner
 *   - B2: ai_extracted.fields.product_meta.setting_of_use (normalised)
 *   - B4: readiness_card.top_gaps (map gap_title → risk, fix_action → mitigation)
 *   - B5/B6: empty (no good prefill source)
 *
 * Conditional triggers (computed server-side):
 *   - C1 (software lifecycle): SaMD class qualifier OR ai_ml_flag
 *   - C2 (cybersecurity): wizard_answers.q6 includes any value ≠ 'none'
 *                          OR ai_extracted data_sensitivity ≠ 'none'
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { TierBWizardClient } from "@/components/wizard/TierBWizardClient";
import type {
  RiskMitigation,
  UseEnvironment,
  WizardAnswers,
} from "@/lib/wizard/types";
import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import type {
  AiExtractedRow,
  PitchAiExtracted,
} from "@/lib/intake/ai-extract";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  email: string;
  one_liner: string;
  share_token: string | null;
  wizard_answers: WizardAnswers | null;
  readiness_card: ReadinessCard | null;
  ai_extracted: AiExtractedRow | null;
};

const VALID_USE_ENVIRONMENTS: ReadonlySet<UseEnvironment> = new Set([
  "home",
  "opd",
  "inpatient",
  "surgical",
  "pre_hospital",
  "mixed",
]);

function normaliseUseEnvironment(raw: unknown): UseEnvironment | undefined {
  if (typeof raw !== "string") return undefined;
  const key = raw.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if ((VALID_USE_ENVIRONMENTS as Set<string>).has(key)) {
    return key as UseEnvironment;
  }
  return undefined;
}

function buildInitialB4(card: ReadinessCard | null): RiskMitigation[] {
  if (!card || !Array.isArray(card.top_gaps) || card.top_gaps.length === 0) {
    return [];
  }
  // Phase 3.5 Bug C — use full top_gaps (no slice), capped by max B4 rows.
  return card.top_gaps.slice(0, 5).map((gap) => ({
    risk: gap.gap_title,
    mitigation: gap.fix_action,
  }));
}

function computeC1Trigger(
  card: ReadinessCard | null,
  ai: PitchAiExtracted | null
): boolean {
  if (card?.classification.ai_ml_flag) return true;
  const qualifier = card?.classification.class_qualifier;
  if (qualifier && qualifier.startsWith("IVD-SaMD")) return true;
  const aiDeviceClass = ai?.suggested_wizard_answers?.device_class;
  if (aiDeviceClass && aiDeviceClass.startsWith("samd_")) return true;
  const aiMl = ai?.suggested_wizard_answers?.ai_ml;
  if (aiMl === "static" || aiMl === "adaptive") return true;
  return false;
}

function computeC2Trigger(
  answers: WizardAnswers | null,
  ai: PitchAiExtracted | null
): boolean {
  const q6 = answers?.q6;
  if (Array.isArray(q6) && q6.length > 0) {
    const allNone = q6.every((v) => v === "none");
    if (!allNone) return true;
  }
  const aiData = ai?.suggested_wizard_answers?.data_sensitivity;
  if (aiData && aiData !== "none") return true;
  return false;
}

export default async function TierBWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth gate — same pattern as /upgrade/[id]/page.tsx (Story 2.2).
  const user = await getUser();
  if (!user) {
    // Phase 3.7 Issue C — default to /login (signup link is on /login).
    redirect(`/login?return_to=${encodeURIComponent(`/upgrade/${id}/wizard`)}`);
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, email, one_liner, share_token, wizard_answers, readiness_card, ai_extracted"
    )
    .eq("id", id)
    .maybeSingle<Row>();

  if (error || !data) {
    notFound();
  }

  if (data.email !== user.email) {
    redirect("/dashboard");
  }

  // Phase 3.5 Bug A — never auto-redirect to payment based on field
  // presence. Wizard stays accessible while user is editing. The
  // canonical "wizard submitted" signal is meta.tier_b_completed_at.
  // The only auto-redirect we keep is: if an order exists, the user
  // is past the wizard. Send them to the payment/status page.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id")
    .eq("assessment_id", id)
    .neq("status", "failed")
    .limit(1)
    .maybeSingle();
  if (order) {
    redirect(`/upgrade/${id}`);
  }

  const ai =
    data.ai_extracted?.status === "complete" ? data.ai_extracted.fields : null;
  const card = data.readiness_card;

  const initialValues: WizardAnswers = {
    ...(data.wizard_answers ?? {}),
    b1_intended_use_statement:
      data.wizard_answers?.b1_intended_use_statement ??
      ai?.suggested_wizard_answers?.intended_use ??
      data.one_liner ??
      "",
    b2_use_environment:
      data.wizard_answers?.b2_use_environment ??
      normaliseUseEnvironment(ai?.product_meta?.setting_of_use) ??
      undefined,
    b3_predicate_devices: data.wizard_answers?.b3_predicate_devices ?? [],
    b3_no_predicate: data.wizard_answers?.b3_no_predicate ?? false,
    b4_risks_and_mitigations:
      data.wizard_answers?.b4_risks_and_mitigations ?? buildInitialB4(card),
    // Phase 3.5 INV-2 — prefill B5 / B6 from ai_extracted.regulatory_signals
    // when present. Existing saved values always win.
    b5_clinical_evidence_status:
      data.wizard_answers?.b5_clinical_evidence_status ??
      ai?.regulatory_signals?.clinical_evidence_level ??
      undefined,
    b6_iso_13485_status:
      data.wizard_answers?.b6_iso_13485_status ??
      ai?.regulatory_signals?.iso_13485_status ??
      undefined,
    c1_software_lifecycle_model:
      data.wizard_answers?.c1_software_lifecycle_model ?? undefined,
    c2_cybersecurity_posture:
      data.wizard_answers?.c2_cybersecurity_posture ?? undefined,
  };

  const c1Trigger = computeC1Trigger(card, ai);
  const c2Trigger = computeC2Trigger(data.wizard_answers ?? null, ai);

  const aiPrefilledHint =
    data.ai_extracted?.status === "complete" && ai !== null;
  const cardHref = data.share_token ? `/c/${data.share_token}` : "/";

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader signedIn />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
            Tier 2 · Submission Workspace intake
          </p>
          <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-3">
            A few more details so we can draft the right document.
          </h1>
          <p className="text-[#6B766F] text-base leading-relaxed mb-6">
            These six questions (plus up to two follow-ups) anchor the Draft
            Pack to your specific device — predicate, risk profile, ISO 13485
            status, and use environment. Estimated 5 minutes. Save-on-blur:
            your answers persist as you type.
          </p>

          {aiPrefilledHint && (
            <div className="mb-6 rounded-lg bg-[#FFF8E1] border border-[#D4A93C]/40 px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#7A5C0F] mb-1">
                AI prefilled from your pitch deck
              </p>
              <p className="text-sm text-[#3A2F0E]">
                We extracted answers from your uploaded deck — review each
                field and edit anything that&apos;s wrong before continuing
                to payment.
              </p>
            </div>
          )}

          <TierBWizardClient
            assessmentId={id}
            initialValues={initialValues}
            c1Trigger={c1Trigger}
            c2Trigger={c2Trigger}
            paymentHref={`/upgrade/${id}`}
          />

          <div className="mt-8">
            <Link
              href={cardHref}
              className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
            >
              ← Back to your Readiness Card
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
