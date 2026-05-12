/**
 * Sprint 3 Story 3.1 — tier picker on /upgrade/[id].
 *
 * Two cards side-by-side. Selecting one navigates to
 * `/upgrade/[id]?tier=<choice>` (server-rendered next step). Kept as
 * URL state — no client useState — so refresh, back-button, and
 * Vercel preview-share links all behave naturally.
 */
import Link from "next/link";

type Tier = "draft_pack" | "draft_editor";

type Props = {
  assessmentId: string;
  /** Highlight when the customer has already chosen a tier (e.g.
   *  ?tier= already in the URL) but hasn't paid yet. */
  selected?: Tier | null;
};

export function TierPicker({ assessmentId, selected }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <TierCard
        title="Draft Pack"
        price="₹499"
        deliveredVia="Emailed to you"
        bullets={[
          "12 CDSCO MD-7 / MD-3 sections, AI-generated against your wizard answers",
          "Reviewed by an Indian regulatory expert before delivery",
          "PDF link in your inbox within 2 hours (worst-case 6)",
        ]}
        ctaLabel="Continue with Draft Pack →"
        ctaHref={`/upgrade/${assessmentId}?tier=draft_pack`}
        selected={selected === "draft_pack"}
        accent="amber"
      />
      <TierCard
        title="Draft Editor"
        price="₹2,499"
        deliveredVia="In-app editor"
        bullets={[
          "Everything in Draft Pack, plus:",
          "Inline section editor with [NEEDS INPUT] pills + revision history",
          "Per-section attachments (test reports, label artwork, study protocols)",
          "Re-render PDF anytime · cleaner View mode for regulator review",
        ]}
        ctaLabel="Continue with Draft Editor →"
        ctaHref={`/upgrade/${assessmentId}?tier=draft_editor`}
        selected={selected === "draft_editor"}
        accent="teal"
        recommended
      />
    </div>
  );
}

function TierCard({
  title,
  price,
  deliveredVia,
  bullets,
  ctaLabel,
  ctaHref,
  selected,
  accent,
  recommended,
}: {
  title: string;
  price: string;
  deliveredVia: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  selected?: boolean;
  accent: "amber" | "teal";
  recommended?: boolean;
}) {
  const accentBorder = selected
    ? accent === "teal"
      ? "border-[#0F6E56] ring-2 ring-[#0F6E56]/30"
      : "border-[#BA7517] ring-2 ring-[#BA7517]/30"
    : "border-[#D9D5C8]";
  const accentText = accent === "teal" ? "#0F6E56" : "#BA7517";
  const ctaCls =
    accent === "teal"
      ? "bg-[#0F6E56] hover:bg-[#0a5a47] text-white"
      : "bg-white hover:bg-[#FAEEDA] text-[#633806] border border-[#BA7517]";

  return (
    <div
      className={`relative rounded-card bg-white border ${accentBorder} px-5 py-5 flex flex-col`}
    >
      {recommended ? (
        <span className="absolute -top-2.5 left-5 inline-flex items-center rounded-pill bg-[#0F6E56] text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1">
          Recommended
        </span>
      ) : null}
      <p
        className="font-mono text-[11px] tracking-[0.14em] uppercase mb-2"
        style={{ color: accentText }}
      >
        {deliveredVia}
      </p>
      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="font-serif text-2xl text-[#0E1411]">{title}</h2>
        <span className="text-2xl font-medium text-[#0E1411]">{price}</span>
      </div>
      <ul className="mt-3 mb-5 space-y-2 text-sm text-[#2A3430] leading-relaxed">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span
              className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full"
              style={{ background: accentText }}
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Link
          href={ctaHref}
          className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${ctaCls}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
