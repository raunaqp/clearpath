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
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { SectionRenderer, type RenderableSection } from "@/components/draft/SectionRenderer";
import { DraftPackTOC } from "./DraftPackTOC";
import { LiveCompletionStrip } from "./LiveCompletionStrip";
import { DraftPackDownloadButton } from "./DraftPackDownloadButton";
import { ValidationSummary } from "./ValidationSummary";
import { SectionCard } from "./SectionCard";
import { OtherDocumentsBucket } from "./OtherDocumentsBucket";
import { EditCoordinatorProvider } from "./EditCoordinator";
import {
  packCompletion,
  sectionPendingCount,
  sectionStatus,
  type SectionStatus,
} from "./completion";
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
  content_edited: string | null;
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
  searchParams: Promise<{ print?: string; view?: string }>;
}) {
  const { id } = await params;
  const { print, view } = await searchParams;
  const printMode = print === "1";
  const viewMode = !printMode && view === "document";

  // PDF v2 (Phase 6) bypass: Chrome headless inside the same Vercel
  // function fetches this page with an internal token in headers. The
  // token never leaves the server. Required to render PDFs without
  // forwarding the customer's session cookie.
  const hdrs = await headers();
  const presentedToken = hdrs.get("x-internal-print-token");
  const expectedToken = process.env.INTERNAL_PRINT_TOKEN;
  const isInternalPrint =
    printMode &&
    !!expectedToken &&
    !!presentedToken &&
    presentedToken === expectedToken;

  if (!isInternalPrint) {
    const user = await getUser();
    if (!user) {
      redirect(`/login?return_to=${encodeURIComponent(`/draft/${id}`)}`);
    }
  }

  const supabase = getServiceClient();

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select("id, name, email, one_liner, readiness_card, meta")
    .eq("id", id)
    .maybeSingle();

  if (aErr || !assessment) notFound();

  // E4 gate — only paid+verified customers get the reader.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status, created_at, delivered_at, draft_pack_pdf_url, tier_choice")
    .eq("assessment_id", id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order || !READABLE_ORDER_STATUSES.includes(order.status as (typeof READABLE_ORDER_STATUSES)[number])) {
    redirect(`/upgrade/${id}`);
  }

  // Phase 1.6 tier guard — the editor (this page) is the Submission
  // Workspace, available only to draft_editor (₹2,499) customers.
  // draft_pack (₹499) customers receive a PDF Regulatory Readiness
  // Report by email and never reach this route. Legacy rows back-filled
  // to 'draft_pack' by migration 016 are intentionally locked out.
  // The internal-print bypass keeps trusted server-side PDF renders
  // unaffected.
  if (!isInternalPrint && (order.tier_choice ?? "draft_pack") !== "draft_editor") {
    redirect(`/upgrade/${id}`);
  }

  // Load sections + their citations.
  const { data: sectionRows } = await supabase
    .from("draft_pack_sections")
    .select(
      "id, section_key, title, content, content_edited, completion_status, word_count, meta"
    )
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

  // Phase 5.5.D — attachments per (order_id, section_key).
  type AttachmentRow = {
    id: string;
    section_key: string;
    filename: string;
    content_type: string | null;
    size_bytes: number;
    doc_type: string | null;
    notes: string | null;
  };
  const { data: attachmentRows } = await supabase
    .from("draft_pack_attachments")
    .select("id, section_key, filename, content_type, size_bytes, doc_type, notes")
    .eq("order_id", order.id)
    .order("uploaded_at", { ascending: true })
    .returns<AttachmentRow[]>();
  const attachmentsBySection = new Map<string, AttachmentRow[]>();
  for (const a of attachmentRows ?? []) {
    const arr = attachmentsBySection.get(a.section_key) ?? [];
    arr.push(a);
    attachmentsBySection.set(a.section_key, arr);
  }

  // Display rule: prefer the customer overlay (content_edited) when set;
  // otherwise the AI baseline (content). The editor's initial buffer
  // matches whichever is current. `hasOverlay` drives the "Customer
  // edited" badge in the reader.
  type DraftSection = {
    renderable: RenderableSection;
    hasOverlay: boolean;
    initialEditContent: string;
    status: SectionStatus;
    pendingCount: number;
  };
  // Phase 5.5.C — inline-filled NEEDS INPUT values live in
  // assessments.meta.needs_input_fields[section_key][descriptor].
  const assessmentMeta =
    (assessment.meta as { needs_input_fields?: Record<string, Record<string, string>> } | null) ?? {};
  const needsInputFields = assessmentMeta.needs_input_fields ?? {};

  const draftSections: DraftSection[] = (sectionRows ?? [])
    .map((r) => {
      // hasOverlay = "customer saved an edit, even an empty one".
      // The previous `length > 0` check meant saving an empty string
      // reverted to the AI baseline — confirmed bug.
      const hasOverlay =
        r.content_edited !== null && r.content_edited !== undefined;
      const displayContent = hasOverlay
        ? (r.content_edited as string)
        : r.content ?? "";
      const sectionFilled = needsInputFields[r.section_key] ?? {};
      return {
        renderable: {
          section_key: r.section_key,
          section_number: sectionNumberFromKey(r.section_key),
          title: r.title,
          content: displayContent,
          citations: (citationsBySection.get(r.id) ?? []).map((c) => ({
            citation_id: c.citation_id,
            source_doc: c.source_doc,
            quote: c.quote,
            exact_reference: c.exact_reference,
          })),
          completion_status: r.completion_status,
          word_count: r.word_count,
          meta: r.meta,
        },
        hasOverlay,
        initialEditContent: displayContent,
        status: sectionStatus(displayContent, sectionFilled),
        pendingCount: sectionPendingCount(displayContent, sectionFilled),
      };
    })
    .sort(
      (a, b) =>
        a.renderable.section_number - b.renderable.section_number
    );

  // Pack-level completion summary for the header strip + tooltip.
  const completion = packCompletion(
    draftSections.map((d) => ({
      content: d.renderable.content,
      filled: needsInputFields[d.renderable.section_key] ?? {},
    }))
  );
  const renderable: RenderableSection[] = draftSections.map((d) => d.renderable);

  // Empty state — paid + verified but generator hasn't populated yet.
  if (renderable.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <GlobalHeader signedIn />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
              Tier 2 · Submission Workspace
            </p>
            <h1 className="font-serif text-3xl text-[#0E1411] leading-tight mb-4">
              Your Submission Workspace is being prepared
            </h1>
            <p className="text-[#6B766F] text-base leading-relaxed mb-8">
              Payment is verified. Generation runs against your wizard answers,
              uploads, and Risk Card. We&apos;ll email you at{" "}
              <span className="text-[#2A3430] font-medium">{assessment.email}</span>{" "}
              when it&apos;s ready — most within 2 hours, worst case 6.
            </p>
            <a
              href={`/upgrade/${id}`}
              className="inline-flex items-center text-sm text-[#0F6E56] underline underline-offset-2 hover:text-[#0E1411]"
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
    // Use plain block-level wrappers — Tailwind classes on <main>/<div>
    // can introduce subtle layout containers that suppress Chrome's
    // page-break-before. Inline styles for the print container keep
    // the page-break behaviour predictable.
    return (
      <div style={{ background: "#ffffff", color: "#0E1411", fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}>
        <div
          style={{
            padding: "48px 40px 24px",
            borderBottom: "1px solid #D9D5C8",
            pageBreakAfter: "always",
            breakAfter: "page",
          }}
        >
          <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#BA7517", margin: 0 }}>
            Tier 2 · Submission Workspace · MD-7 / MD-3
          </p>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "30px", color: "#0E1411", margin: "8px 0 0" }}>
            {deviceName}
          </h1>
          {classLabel ? (
            <p style={{ color: "#6B766F", fontSize: "14px", margin: "4px 0 0" }}>{classLabel}</p>
          ) : null}
          <p style={{ color: "#6B766F", fontSize: "12px", margin: "12px 0 0" }}>
            Assessment {id} · Generated{" "}
            {new Date(order.delivered_at ?? order.created_at).toLocaleString()}
          </p>
        </div>
        <div style={{ padding: "32px 40px" }}>
          {renderable.map((s, idx) => (
            <div
              key={s.section_key}
              style={{
                pageBreakBefore: idx === 0 ? undefined : "always",
                breakBefore: idx === 0 ? undefined : "page",
                pageBreakInside: "avoid",
                breakInside: "avoid-page",
              }}
            >
              <SectionRenderer
                section={s}
                printMode
                inlineFields={{
                  assessmentId: id,
                  sectionKey: s.section_key,
                  filled: needsInputFields[s.section_key] ?? {},
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Phase 5.5.G — clean read-only "View document" mode. Hides TOC
  // sidebar, completion %, Edit buttons, status dots, attachment
  // widgets and badges. Customer sees a continuous document with a
  // table of contents at the top + "Back to editor" affordance.
  if (viewMode) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <GlobalHeader signedIn />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-8 pb-24">
          <div className="max-w-[820px] mx-auto">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`/draft/${id}`}
                className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-3 py-1.5 text-sm font-medium text-[#0F6E56] hover:bg-[#E1F5EE]"
              >
                ← Back to editor
              </a>
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F]">
                View mode · read only
              </span>
            </div>

            <header className="border-b border-[#D9D5C8] pb-6 mb-8">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
                Tier 2 · Submission Workspace · MD-7 / MD-3
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl text-[#0E1411] mt-3 leading-tight">
                {deviceName}
              </h1>
              {classLabel ? (
                <p className="text-[#6B766F] text-base mt-2">{classLabel}</p>
              ) : null}
              <p className="text-[#6B766F] text-xs mt-4 font-mono">
                Assessment {id} · Generated{" "}
                {new Date(order.delivered_at ?? order.created_at).toLocaleString()}
              </p>
            </header>

            <nav
              aria-label="Table of contents"
              className="mb-12 rounded-card bg-[#FDFCF8] border border-[#E8E4D6] px-6 py-5"
            >
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F] mb-3">
                Contents
              </p>
              <ol className="space-y-1.5 text-sm">
                {draftSections.map((d) => (
                  <li key={d.renderable.section_key}>
                    <a
                      href={`#section-${d.renderable.section_number}`}
                      className="text-[#0F6E56] hover:underline"
                    >
                      <span className="font-mono text-xs text-[#6B766F] mr-2">
                        MD-7 Section{" "}
                        {d.renderable.section_number
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <span className="text-[#0E1411]">
                        {d.renderable.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-14">
              {draftSections.map((d) => (
                <section
                  key={d.renderable.section_key}
                  className="draft-view-section"
                >
                  <SectionRenderer
                    section={d.renderable}
                    hideStatusBadge
                    hideMetaPanel
                    inlineFields={{
                      assessmentId: id,
                      sectionKey: d.renderable.section_key,
                      filled:
                        needsInputFields[d.renderable.section_key] ?? {},
                    }}
                  />
                </section>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <a
                href={`/draft/${id}`}
                className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-4 py-2 text-sm font-medium text-[#0F6E56] hover:bg-[#E1F5EE]"
              >
                ← Back to editor
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader signedIn />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <EditCoordinatorProvider
          assessmentId={id}
          initialNeedsInputFields={needsInputFields}
        >
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <DraftPackTOC
                sections={draftSections.map((d) => ({
                  number: d.renderable.section_number,
                  title: d.renderable.title,
                  sectionKey: d.renderable.section_key,
                  content: d.renderable.content,
                  status: d.status,
                  pendingCount: d.pendingCount,
                }))}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <header className="mb-6">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
                Tier 2 · Submission Workspace · MD-7 / MD-3
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#0E1411] mt-2 leading-tight">
                {deviceName}
              </h1>
              {classLabel ? (
                <p className="text-[#6B766F] text-base mt-2">{classLabel}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <DraftPackDownloadButton assessmentId={id} />
                <a
                  href={`/draft/${id}?view=document`}
                  className="inline-flex items-center rounded-md border border-[#D9D5C8] bg-[#FDFCF8] px-4 py-2 text-sm font-medium text-[#0F6E56] hover:bg-[#E1F5EE]"
                  title="Read-only clean view of the full pack"
                >
                  View document →
                </a>
                <a
                  href={`/upgrade/${id}`}
                  className="text-sm text-[#6B766F] underline underline-offset-2 hover:text-[#0E1411]"
                >
                  Order status
                </a>
              </div>

              {/* Completion strip — Phase B Item 2 follow-up. Now a
                  client component that recomputes from EditCoordinator
                  state so it tracks the in-section badges in real time
                  (same fix as the TOC dot). */}
              <LiveCompletionStrip
                sections={draftSections.map((d) => ({
                  sectionKey: d.renderable.section_key,
                  content: d.renderable.content,
                }))}
                initial={completion}
              />
            </header>

            {validationReport ? (
              <ValidationSummary report={validationReport} />
            ) : null}

            <div className="space-y-10 mt-8">
              {draftSections.map((d) => (
                <SectionCard
                  key={d.renderable.section_key}
                  assessmentId={id}
                  attachments={
                    attachmentsBySection.get(d.renderable.section_key) ?? []
                  }
                  section={d.renderable}
                  hasOverlay={d.hasOverlay}
                  initialEditContent={d.initialEditContent}
                  status={d.status}
                  pendingCount={d.pendingCount}
                />
              ))}
              <OtherDocumentsBucket
                assessmentId={id}
                initialAttachments={attachmentsBySection.get("other") ?? []}
              />
            </div>
          </div>
        </div>
        </EditCoordinatorProvider>
      </main>
    </div>
  );
}
