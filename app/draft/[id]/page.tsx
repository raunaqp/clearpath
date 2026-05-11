/**
 * Sprint 2 Story 2.5 Phase 5 — Draft Pack v2 sectioned reader.
 *
 * Auth gate (E4): user must be signed in AND have a tier2_order
 * with status in {verified, generating, delivered}. Otherwise we
 * redirect to /upgrade/[id] for them to complete payment.
 *
 * Empty state: tier2_order is verified but no draft_pack_sections rows
 * yet → show "your pack is being prepared".
 */
import { notFound, redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { SectionRenderer, type RenderableSection } from "@/components/draft/SectionRenderer";
import { DraftPackTOC } from "./DraftPackTOC";
import { DraftPackDownloadButton } from "./DraftPackDownloadButton";
import { ValidationSummary } from "./ValidationSummary";
import { loadSourceData } from "@/lib/engine/draft-pack-v2/persist";
import { validateDraftPackV2 } from "@/lib/engine/draft-pack-v2-validator";
import type { SectionOutput, SectionKey, SectionCompletionStatus } from "@/lib/engine/draft-pack-v2/types";
import type { ModelKey } from "@/lib/engine/cost-calculator";

export const dynamic = "force-dynamic";

const READABLE_ORDER_STATUSES = ["verified", "generating", "delivered"] as const;

type SectionRow = {
  id: string;
  section_key: string;
  title: string;
  content: string | null;
  completion_status: SectionCompletionStatus;
  word_count: number | null;
  meta: RenderableSection["meta"];
};

type CitationRow = {
  section_id: string;
  citation_id: string;
  source_doc: string;
  quote: string;
  exact_reference: string;
};

function sectionNumberFromKey(key: string): number {
  const m = key.match(/^(\d+)_/);
  return m ? parseInt(m[1], 10) : 0;
}

export default async function DraftPackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const printMode = print === "1";

  const user = await getUser();
  if (!user) {
    redirect(`/login?return_to=${encodeURIComponent(`/draft/${id}`)}`);
  }

  const supabase = getServiceClient();

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select("id, name, email, one_liner, readiness_card")
    .eq("id", id)
    .maybeSingle();

  if (aErr || !assessment) notFound();

  // E4 gate — only paid+verified customers get the reader.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status, created_at, delivered_at, draft_pack_pdf_url")
    .eq("assessment_id", id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order || !READABLE_ORDER_STATUSES.includes(order.status as (typeof READABLE_ORDER_STATUSES)[number])) {
    redirect(`/upgrade/${id}`);
  }

  // Load sections + their citations.
  const { data: sectionRows } = await supabase
    .from("draft_pack_sections")
    .select("id, section_key, title, content, completion_status, word_count, meta")
    .eq("order_id", order.id)
    .order("section_key", { ascending: true })
    .returns<SectionRow[]>();

  const { data: citationRows } = await supabase
    .from("draft_pack_citations")
    .select("section_id, citation_id, source_doc, quote, exact_reference")
    .in("section_id", (sectionRows ?? []).map((s) => s.id))
    .returns<CitationRow[]>();

  const citationsBySection = new Map<string, CitationRow[]>();
  for (const c of citationRows ?? []) {
    const arr = citationsBySection.get(c.section_id) ?? [];
    arr.push(c);
    citationsBySection.set(c.section_id, arr);
  }

  const renderable: RenderableSection[] = (sectionRows ?? [])
    .map((r) => ({
      section_key: r.section_key,
      section_number: sectionNumberFromKey(r.section_key),
      title: r.title,
      content: r.content ?? "",
      citations: (citationsBySection.get(r.id) ?? []).map((c) => ({
        citation_id: c.citation_id,
        source_doc: c.source_doc,
        quote: c.quote,
        exact_reference: c.exact_reference,
      })),
      completion_status: r.completion_status,
      word_count: r.word_count,
      meta: r.meta,
    }))
    .sort((a, b) => a.section_number - b.section_number);

  // Empty state — paid + verified but generator hasn't populated yet.
  if (renderable.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <GlobalHeader signedIn />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-amber-brand mb-3">
              Tier 2 · Draft Pack
            </p>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-4">
              Your Draft Pack is being prepared
            </h1>
            <p className="text-muted text-base leading-relaxed mb-8">
              Payment is verified. Generation runs against your wizard answers,
              uploads, and Risk Card. We&apos;ll email you at{" "}
              <span className="text-ink-2 font-medium">{assessment.email}</span>{" "}
              when it&apos;s ready — most within 2 hours, worst case 6.
            </p>
            <a
              href={`/upgrade/${id}`}
              className="inline-flex items-center text-sm text-teal-deep underline underline-offset-2 hover:text-ink"
            >
              ← Back to order status
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Run validator for the in-page summary (best-effort — if source data
  // load fails, we still render the sections; validation block is hidden).
  let validationReport: ReturnType<typeof validateDraftPackV2> | null = null;
  try {
    const sources = await loadSourceData(id);
    const sectionOutputs: SectionOutput[] = renderable.map((r) => ({
      section_key: r.section_key as SectionKey,
      section_number: r.section_number,
      title: r.title,
      content: r.content,
      citations: r.citations,
      completion_status: r.completion_status,
      word_count: r.word_count ?? 0,
      meta: {
        generation_strategy:
          (r.meta?.generation_strategy as
            | "deterministic"
            | "templated"
            | "llm_synthesized"
            | undefined) ?? "llm_synthesized",
        source_fields: r.meta?.source_fields ?? [],
        model: (r.meta?.model as ModelKey | null) ?? null,
        llm_cost_usd: r.meta?.llm_cost_usd ?? 0,
        generated_at: r.meta?.generated_at ?? new Date().toISOString(),
        dry_run: r.meta?.dry_run ?? false,
        error_message: r.meta?.error_message ?? null,
        usage: null,
      },
    }));
    validationReport = validateDraftPackV2(sectionOutputs, sources);
  } catch {
    validationReport = null;
  }

  const totalCost = renderable.reduce(
    (acc, r) => acc + (r.meta?.llm_cost_usd ?? 0),
    0
  );

  // Heading for the dossier — pulls from readiness_card if available.
  const card = assessment.readiness_card as {
    classification?: { cdsco_class?: string; class_qualifier?: string | null };
    recommended_path?: string | null;
  } | null;
  const deviceName = assessment.name || "Your Device";
  const classLabel = card?.classification
    ? `Class ${card.classification.cdsco_class}${
        card.classification.class_qualifier
          ? ` · ${card.classification.class_qualifier}`
          : ""
      }`
    : null;

  if (printMode) {
    // Stripped-down body Chrome headless screenshots into PDF v2.
    return (
      <main className="bg-white text-ink font-sans">
        <header className="px-10 pt-12 pb-6 border-b border-line">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-amber-brand">
            Tier 2 · CDSCO MD-7 / MD-3 Draft Pack
          </p>
          <h1 className="font-serif text-3xl text-ink mt-2">{deviceName}</h1>
          {classLabel ? (
            <p className="text-muted text-sm mt-1">{classLabel}</p>
          ) : null}
          <p className="text-muted text-xs mt-3">
            Assessment {id} · Generated{" "}
            {new Date(order.delivered_at ?? order.created_at).toLocaleString()}
          </p>
        </header>
        <div className="px-10 py-8 space-y-12">
          {renderable.map((s) => (
            <SectionRenderer key={s.section_key} section={s} printMode />
          ))}
        </div>
        <footer className="px-10 py-6 border-t border-line text-xs text-muted font-mono">
          INTERNAL DRAFT — pending consultant review
        </footer>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <GlobalHeader signedIn />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <DraftPackTOC
                sections={renderable.map((r) => ({
                  number: r.section_number,
                  title: r.title,
                  status: r.completion_status,
                }))}
              />
            </div>
          </aside>

          <div>
            <header className="mb-6">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-amber-brand">
                Tier 2 · CDSCO MD-7 / MD-3 Draft Pack
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-2 leading-tight">
                {deviceName}
              </h1>
              {classLabel ? (
                <p className="text-muted text-base mt-2">{classLabel}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <DraftPackDownloadButton assessmentId={id} />
                <a
                  href={`/upgrade/${id}`}
                  className="text-sm text-muted underline underline-offset-2 hover:text-ink"
                >
                  Order status
                </a>
                <span className="text-xs text-muted font-mono">
                  {renderable.length} sections · ${totalCost.toFixed(2)} cost
                </span>
              </div>
            </header>

            {validationReport ? (
              <ValidationSummary report={validationReport} />
            ) : null}

            <div className="space-y-10 mt-8">
              {renderable.map((s) => (
                <article
                  key={s.section_key}
                  className="rounded-card bg-bg-card border border-line-soft px-6 py-6 sm:px-8 sm:py-7"
                >
                  <SectionRenderer section={s} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
