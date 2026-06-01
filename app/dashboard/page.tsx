import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { getServiceClient } from "@/lib/supabase";
import { LogoutButton } from "./LogoutButton";
import { UnverifiedEmailBanner } from "./UnverifiedEmailBanner";

export const dynamic = "force-dynamic";

type AssessmentRow = {
  id: string;
  created_at: string;
  updated_at: string;
  share_token: string | null;
  status: string;
  one_liner: string | null;
  product_type: string | null;
};

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  assessment_id: string;
  draft_pack_pdf_url: string | null;
  delivered_at: string | null;
  /** Phase 1.6 — null on legacy rows (treat as 'draft_pack' per migration 016). */
  tier_choice: "draft_pack" | "draft_editor" | null;
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_verification: "Awaiting payment verification",
  verified: "Payment verified — generating",
  generating: "Generating",
  delivered: "Delivered",
  failed: "Failed",
};

const CARD_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  routing: "Routing",
  wizard: "Wizard in progress",
  completed: "Readiness Card",
  rejected: "Carve-out detected",
  abandoned: "Abandoned",
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?return_to=/dashboard");

  const supabase = getServiceClient();
  const email = user.email.toLowerCase();

  // Phase 3.9 FIX 1 — sort by updated_at so the "current application"
  // (most recently touched) lands first regardless of creation order.
  const cardsRes = await supabase
    .from("assessments")
    .select(
      "id, created_at, updated_at, share_token, status, one_liner, product_type"
    )
    .ilike("email", email)
    .order("updated_at", { ascending: false })
    .limit(50);
  const cards = (cardsRes.data ?? []) as AssessmentRow[];

  // Orders are joined via assessment_id so we catch pending/verified orders
  // even before draft_pack delivery (when email_sent_to is still null).
  const assessmentIds = cards.map((c) => c.id);
  const ordersRes = assessmentIds.length
    ? await supabase
        .from("tier2_orders")
        .select("id, created_at, status, assessment_id, draft_pack_pdf_url, delivered_at, tier_choice")
        .in("assessment_id", assessmentIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const orders = (ordersRes.data ?? []) as OrderRow[];
  const ordersByAssessment = new Map<string, OrderRow>();
  for (const o of orders) {
    if (!ordersByAssessment.has(o.assessment_id)) {
      ordersByAssessment.set(o.assessment_id, o);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <header className="sticky top-0 z-10 h-14 bg-white border-b border-[#E5E7EB]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg leading-none text-[#0F6E56] hover:opacity-80 transition-opacity"
          >
            ClearPath
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B766F] hidden sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <div className="max-w-4xl mx-auto">
          {!user.emailConfirmedAt ? (
            <UnverifiedEmailBanner email={user.email} />
          ) : null}
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-3">
            Your account
          </p>
          <h1 className="font-serif text-[clamp(28px,3.6vw,36px)] leading-tight text-[#0E1411] mb-2">
            Dashboard
          </h1>
          <p className="text-[#6B766F] text-base leading-relaxed mb-10">
            Everything you&apos;ve generated with ClearPath. Pick up where you left off.
          </p>

          {/* Phase 3.9 FIX 1 — split into "current application" (most
              recently touched) + collapsed "previous applications".
              Hides clutter for repeat users; prominent landing target
              for fresh post-Risk-Card returns. */}
          {cards.length === 0 ? (
            <Section title="Your current application" count={0}>
              <EmptyState
                copy="No Readiness Cards yet — start one to see your CDSCO classification, risk class, and timeline."
                ctaHref="/start"
                ctaLabel="Start your assessment →"
              />
            </Section>
          ) : (
            <>
              <Section title="Your current application" count={1}>
                <CardRow
                  card={cards[0]}
                  order={ordersByAssessment.get(cards[0].id)}
                  highlight
                />
              </Section>

              {cards.length > 1 && (
                <details className="mb-10 group">
                  <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-sm text-[#6B766F] hover:text-[#0E1411] transition-colors mb-4 select-none">
                    <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
                      ›
                    </span>
                    Show previous applications ({cards.length - 1})
                  </summary>
                  <ul className="space-y-3">
                    {cards.slice(1).map((c) => (
                      <CardRow
                        key={c.id}
                        card={c}
                        order={ordersByAssessment.get(c.id)}
                      />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CardRow({
  card,
  order,
  highlight = false,
}: {
  card: AssessmentRow;
  order: OrderRow | undefined;
  highlight?: boolean;
}) {
  // "Current" card gets accent border + tinted bg + roomier padding;
  // previous applications keep the muted styling.
  const wrapperClass = highlight
    ? "rounded-xl bg-[#EAF3EF] border-2 border-[#0F6E56] px-5 sm:px-6 lg:px-7 py-5 sm:py-6"
    : "rounded-lg bg-white border border-[#D9D5C8] px-4 sm:px-5 py-4";

  // Highlighted card lives directly inside <Section> (already a <section>),
  // so use <div> rather than nesting <section>s. Non-highlighted lives in
  // the <ul> below and stays an <li>.
  const Tag = highlight ? "div" : "li";
  return (
    <Tag className={wrapperClass}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p
            className={
              highlight
                ? "text-[16px] sm:text-[17px] text-[#0E1411] leading-snug font-medium"
                : "text-[15px] text-[#0E1411] leading-snug"
            }
          >
            {card.one_liner ?? "Untitled product"}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6B766F] mt-1.5">
            {new Date(card.updated_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            <span className="mx-2">·</span>
            {CARD_STATUS_LABEL[card.status] ?? card.status}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {card.status === "completed" && card.share_token ? (
            <Link
              href={`/c/${card.share_token}`}
              className="text-sm text-[#0F6E56] underline underline-offset-2 hover:no-underline"
            >
              View card
            </Link>
          ) : card.status === "wizard" ? (
            <Link
              href={`/assess/${card.id}`}
              className="text-sm text-[#0F6E56] underline underline-offset-2 hover:no-underline"
            >
              Resume wizard
            </Link>
          ) : (
            // Phase 3.7 Sub-fix A2 — universal CTA: /assess/[id] is the
            // central status router and resolves to the right next page.
            <Link
              href={`/assess/${card.id}`}
              className="text-sm text-[#0F6E56] underline underline-offset-2 hover:no-underline"
            >
              Continue →
            </Link>
          )}
          {card.status === "completed" && !order ? (
            <Link
              href={`/upgrade/${card.id}`}
              className="text-sm rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-3 py-1.5"
            >
              Upgrade →
            </Link>
          ) : null}
        </div>
      </div>
      {order ? (
        <div className="mt-3 pt-3 border-t border-[#0F6E56]/20 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#6B766F]">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#BA7517] mr-2">
              {order.tier_choice === "draft_editor"
                ? "Submission Workspace"
                : "Readiness Report"}
            </span>
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </p>
          <Link
            href={`/upgrade/${card.id}`}
            className="text-sm text-[#0F6E56] underline underline-offset-2 hover:no-underline"
          >
            {order.status === "delivered"
              ? order.tier_choice === "draft_editor"
                ? "Open Workspace →"
                : "Download Report →"
              : "View status →"}
          </Link>
        </div>
      ) : null}
    </Tag>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl text-[#0E1411]">{title}</h2>
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B766F]">
          {count} total
        </span>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  copy,
  ctaHref,
  ctaLabel,
}: {
  copy: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-lg bg-white border border-dashed border-[#D9D5C8] px-5 py-8 text-center">
      <p className="text-sm text-[#6B766F] mb-4 leading-relaxed">{copy}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white font-medium text-[14px] px-5 py-2.5"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
