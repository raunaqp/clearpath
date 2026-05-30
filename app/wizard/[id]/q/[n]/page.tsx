import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import WizardClient from "@/components/wizard/WizardClient";
import { QuestionContextPane } from "@/components/layout/QuestionContextPane";
import { displayName } from "@/lib/wizard/display-name";
import {
  getNextVisibleStep,
  getQuestionsForPersona,
  getStepLabelsForPersona,
  getVisibleOrdinal,
  isStepVisibleFor,
  totalSteps,
} from "@/lib/wizard/questions";
import type {
  ClinicalState,
  CommercialStage,
  DataSensitivity,
  InfoSignificance,
  Integrations,
  UserType,
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
  // Phase 3.5 follow-up FIX 1 — regex-on-intended-use mishandled negation
  // ("does not perform autonomous diagnosis" matched 'diagnos' and
  // 'autonom'). Replaced with ai_ml signal only: if the deck declares an
  // active model, default Q2 to "drives" (the safer middle option). User
  // adjusts on Q2 with full context. Static displays without ML stay blank.
  if (aiMl !== "static" && aiMl !== "adaptive") return undefined;
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

// Phase 3.7 Issue B — expanded prefill heuristics for Q1, Q3, Q5, Q7.
// Q4 (scale) is intentionally not derived — decks rarely state volume
// reliably. Conservative throughout: skip when ambiguous.

function deriveQ1FromExtraction(
  ai: PitchAiExtracted | null
): ClinicalState | undefined {
  if (!ai) return undefined;
  const cls = ai.suggested_classification;
  // Use the curated one-liner — typically positive-tense and short, so
  // less likely to trip on negations like "does not perform diagnosis".
  const text = (ai.intended_use_one_liner ?? "").toLowerCase();
  if (cls === "C" || cls === "D") {
    if (/\btreat\w*|deliver\w*|intervention|therap\w*|inject|infus/.test(text)) {
      return "critical";
    }
    if (/diagnos|detect|predict|screen|early warning|monitor.*risk/.test(text)) {
      return "serious";
    }
    return undefined;
  }
  if (cls === "A" || cls === "B") {
    if (/monitor|track|measure|record|display|wellness|fitness/.test(text)) {
      return "non_serious";
    }
    return undefined;
  }
  return undefined;
}

function deriveQ3FromExtraction(
  ai: PitchAiExtracted | null
): UserType | undefined {
  if (!ai) return undefined;
  const pop = (ai.product_meta?.user_population ?? "").toLowerCase();
  if (!pop) return undefined;
  const hcp = /cardiolog|doctor|nurse|clinician|physician|radiolog|surgeon|icu|hcp|healthcare prof|specialist|consultant/.test(
    pop
  );
  const patient =
    /\bpatient|consumer|general public|lay user|self.administered|caregiver/.test(
      pop
    );
  const admin = /administrator|manager|operator|back.office|clerk|registrar/.test(
    pop
  );
  if (hcp && patient) return "both";
  if (hcp) return "hcps";
  if (patient) return "patients";
  if (admin) return "admin";
  return undefined;
}

function deriveQ5FromExtraction(
  ai: PitchAiExtracted | null
): Integrations | undefined {
  if (!ai) return undefined;
  const corpus = [
    ai.suggested_wizard_answers?.intended_use ?? "",
    ai.intended_use_one_liner ?? "",
    ai.product_meta?.setting_of_use ?? "",
    ai.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
  if (!corpus.trim()) return undefined;
  const hospital =
    /\b(emr|ehr|hms|his|pacs|lims|hospital information|hospital system|hospital integration)\b/.test(
      corpus
    );
  const abdm = /\b(abdm|abha|ayushman bharat)\b/.test(corpus);
  const standalone = /standalone|no integration|self.contained/.test(corpus);
  if (hospital && abdm) return "both";
  if (hospital) return "hospital";
  if (abdm) return "abdm";
  if (standalone) return "neither";
  return undefined;
}

function deriveQ7FromExtraction(
  ai: PitchAiExtracted | null
): CommercialStage | undefined {
  if (!ai) return undefined;
  const corpus = [
    ai.notes ?? "",
    ai.suggested_wizard_answers?.intended_use ?? "",
    ai.intended_use_one_liner ?? "",
  ]
    .join(" ")
    .toLowerCase();
  if (!corpus.trim()) return undefined;
  if (/\bfiled\b|applied for licen|cdsco application submitted|md-?7 application|grant(ed)?/.test(
    corpus
  )) {
    return "filed";
  }
  if (/series [a-z]\b|scaling|growth stage|commercial launch|in[- ]market/.test(corpus)) {
    return "scaling";
  }
  if (/\bpilot\b|\bmvp\b|early traction|\bbeta\b|first customers|first hospital/.test(
    corpus
  )) {
    return "mvp";
  }
  if (/idea stage|prototype|concept stage|pre.mvp|early stage/.test(corpus)) {
    return "pre_mvp";
  }
  return undefined;
}

export default async function WizardStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; n: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id, n } = await params;
  const sp = await searchParams;
  // Phase 3.5 follow-up FIX 3 — `?force_prefill=1` ignores saved q-values
  // and re-derives from ai_extracted. Smoke-test affordance; harmless if
  // non-devs find it (it just shows the extraction-derived suggestions).
  const forcePrefill = sp.force_prefill === "1";
  const step = parseInt(n, 10);

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

  // Phase 2a — persona gate. If the customer hasn't picked a persona
  // yet, force them through /persona before any Tier 1 question. The
  // gate is a one-time lock (it self-redirects to /q/1 if persona is
  // already set), so this is safe on resume too.
  if (!data.wizard_answers?.persona) {
    redirect(`/wizard/${id}/persona`);
  }

  // Phase 2c — total is persona-aware. Hardware founders see 7 questions
  // (Q1, Q3, Q5, Q6, Q7 + Q8 predicate + Q9 patient-contact); SaMD /
  // clinical-investigation founders see 7 (Q1-Q7). Q2 and Q4 are inferred
  // for hardware persona; Q8/Q9 only render for hardware persona.
  // Compute *after* the persona gate so persona is always defined.
  const persona = data.wizard_answers.persona;
  const total = totalSteps(persona);

  if (Number.isNaN(step) || step < 1 || step > 9) {
    return <NotFoundPanel message={`Question ${n} doesn't exist.`} />;
  }

  // Phase 2c — if the requested step isn't visible for this persona
  // (e.g. hardware founder hitting q/2 or q/4 directly, or SaMD founder
  // hitting q/8 or q/9), redirect to the next visible step. Resume-safe.
  if (!isStepVisibleFor(step, persona)) {
    const nextVisible = getNextVisibleStep(step - 1, persona);
    if (nextVisible === null) {
      // No visible question at or after this step → wizard is done.
      redirect(`/assess/${id}`);
    }
    redirect(`/wizard/${id}/q/${nextVisible}`);
  }

  const meta = data.meta ?? {};
  const productDisplayName = displayName(data.one_liner);
  const pdfCount = Array.isArray(data.uploaded_docs)
    ? data.uploaded_docs.length
    : 0;
  const savedAnswers: WizardAnswers = data.wizard_answers ?? {};
  const initialSkipped = meta.wizard_skipped_questions ?? [];

  // Phase 3.5 INV-1 — merge ai_extracted suggestions into initial values
  // for fields the user hasn't saved yet. Saved values normally win,
  // unless ?force_prefill=1 is set (FIX 3 — smoke-test affordance).
  const aiFields =
    data.ai_extracted?.status === "complete"
      ? data.ai_extracted.fields
      : null;
  // Phase 3.7 Issue B — 6 derivable questions (Q1/Q2/Q3/Q5/Q6/Q7).
  // Q4 stays unprefilled (decks rarely state user volume reliably).
  const extractedQ1 = deriveQ1FromExtraction(aiFields);
  const extractedQ2 = deriveQ2FromExtraction(aiFields);
  const extractedQ3 = deriveQ3FromExtraction(aiFields);
  const extractedQ5 = deriveQ5FromExtraction(aiFields);
  const extractedQ6 = deriveQ6FromExtraction(aiFields);
  const extractedQ7 = deriveQ7FromExtraction(aiFields);

  const derivedQ1 = forcePrefill ? extractedQ1 : savedAnswers.q1 ?? extractedQ1;
  const derivedQ2 = forcePrefill ? extractedQ2 : savedAnswers.q2 ?? extractedQ2;
  const derivedQ3 = forcePrefill ? extractedQ3 : savedAnswers.q3 ?? extractedQ3;
  const derivedQ5 = forcePrefill ? extractedQ5 : savedAnswers.q5 ?? extractedQ5;
  const derivedQ6 = forcePrefill
    ? extractedQ6
    : savedAnswers.q6 && savedAnswers.q6.length > 0
    ? savedAnswers.q6
    : extractedQ6;
  const derivedQ7 = forcePrefill ? extractedQ7 : savedAnswers.q7 ?? extractedQ7;

  const initialAnswers: WizardAnswers = {
    ...savedAnswers,
    ...(derivedQ1 ? { q1: derivedQ1 } : {}),
    ...(derivedQ2 ? { q2: derivedQ2 } : {}),
    ...(derivedQ3 ? { q3: derivedQ3 } : {}),
    ...(derivedQ5 ? { q5: derivedQ5 } : {}),
    ...(derivedQ6 ? { q6: derivedQ6 } : {}),
    ...(derivedQ7 ? { q7: derivedQ7 } : {}),
  };

  // Banner persists while any extracted-derived answer still needs user
  // attention. Counts the actual number of prefilled questions for the
  // banner copy ("AI prefilled N questions from your pitch deck").
  const q1NeedsAttention =
    extractedQ1 !== undefined && (forcePrefill || !savedAnswers.q1);
  const q2NeedsAttention =
    extractedQ2 !== undefined && (forcePrefill || !savedAnswers.q2);
  const q3NeedsAttention =
    extractedQ3 !== undefined && (forcePrefill || !savedAnswers.q3);
  const q5NeedsAttention =
    extractedQ5 !== undefined && (forcePrefill || !savedAnswers.q5);
  const q6NeedsAttention =
    extractedQ6 !== undefined &&
    (forcePrefill || !savedAnswers.q6 || savedAnswers.q6.length === 0);
  const q7NeedsAttention =
    extractedQ7 !== undefined && (forcePrefill || !savedAnswers.q7);
  const aiPrefilledCount =
    (q1NeedsAttention ? 1 : 0) +
    (q2NeedsAttention ? 1 : 0) +
    (q3NeedsAttention ? 1 : 0) +
    (q5NeedsAttention ? 1 : 0) +
    (q6NeedsAttention ? 1 : 0) +
    (q7NeedsAttention ? 1 : 0);
  const aiBannerVisible = aiFields !== null && aiPrefilledCount > 0;

  // All-answers-prefilled detection — true when every q1..q7 is non-null
  // (and arrays are non-empty). Demo packets prefill all 7 at intake;
  // real users won't hit this until they've answered everything. When
  // true, the wizard exposes a "Skip to card →" affordance.
  //
  // Phase 3.5 follow-up — in force_prefill mode the AI banner should
  // win over the "Skip to card" demo affordance, so treat the wizard
  // as not-fully-prefilled in that mode.
  const allAnswersPrefilled = forcePrefill
    ? false
    : (() => {
        // Phase 2c — walk only the VISIBLE questions for this persona.
        // Hardware founders never have q2/q4, so checking 1..total
        // contiguously would always fail for them.
        const a = initialAnswers as Record<string, unknown>;
        const visible = getQuestionsForPersona(persona);
        for (const q of visible) {
          const v = a[`q${q.step}`];
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
              persona={persona}
              conflictEncountered={meta.conflict_detected === true}
              pdfCount={pdfCount}
              allAnswersPrefilled={allAnswersPrefilled}
              aiBannerVisible={aiBannerVisible}
              aiPrefilledCount={aiPrefilledCount}
            />
          </div>
        </div>
        <QuestionContextPane
          currentStep={getVisibleOrdinal(step, persona)}
          totalSteps={total}
          labels={getStepLabelsForPersona(persona)}
          frameworkCopy={
            persona === "manufacturer_hardware"
              ? "We're mapping your device against CDSCO MDR 2017's hardware classification (Class A/B/C/D), the Device Master File checklist (Appendix II, Fourth Schedule), and the form pair you'll likely need — MD-3/MD-5 (SLA) or MD-7/MD-9 (CLA)."
              : "We're mapping your product against the IMDRF SaMD framework and CDSCO MDR 2017 classification rules. Each answer narrows the regulatory pathway and the forms you'll likely need."
          }
        />
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
