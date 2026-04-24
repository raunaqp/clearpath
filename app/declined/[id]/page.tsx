import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Meta = {
  pre_router?: {
    rationale?: string;
    rejection_reason?: string | null;
  };
};

type DeclinedRow = {
  id: string;
  product_type: string | null;
  meta: Meta | null;
};

const COPY: Record<
  string,
  { eyebrow: string; heading: string; body: string }
> = {
  regulator: {
    eyebrow: "Not quite right for ClearPath",
    heading: "You look like a regulator — not a regulated product.",
    body:
      "ClearPath is built for founders shipping healthcare products that need to pass CDSCO, DPDP, and related Indian digital-health regulations. What you described is the public infrastructure running those rails. Drop us a line if you think we got that wrong — we read everything.",
  },
  investor: {
    eyebrow: "Not quite right for ClearPath",
    heading: "ClearPath is built for founders, not funds.",
    body:
      "If you're evaluating a portfolio company's regulatory readiness, ask them to run their own Readiness Card — we keep the founder as the subject of the analysis. Happy to chat about portfolio-wide views later.",
  },
  out_of_scope: {
    eyebrow: "Outside our scope today",
    heading: "This doesn't look like an Indian healthcare product.",
    body:
      "ClearPath covers the 9 regulations that apply to digital health in India — CDSCO, DPDP, ICMR AI, ABDM, NABH, MCI Telemedicine, IRDAI, NABL, and the D&C Act. If your product doesn't touch clinical care, diagnostics, or health data, those rules don't apply — which is good news. If we misread it, start a fresh analysis with more detail.",
  },
};

export default async function DeclinedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("assessments")
    .select("id, product_type, meta")
    .eq("id", id)
    .maybeSingle<DeclinedRow>();

  const productType = data?.product_type ?? "out_of_scope";
  const copy = COPY[productType] ?? COPY.out_of_scope;
  const customReason = data?.meta?.pre_router?.rejection_reason;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-4">
          {copy.eyebrow}
        </p>
        <h1 className="font-serif font-normal text-[clamp(26px,4vw,36px)] leading-[1.15] tracking-[-0.02em] text-[#0E1411] mb-5">
          {copy.heading}
        </h1>
        <p className="text-[#6B766F] text-base leading-relaxed mb-8">
          {copy.body}
        </p>

        {customReason && (
          <p className="text-sm text-[#6B766F] bg-[#FDFCF8] border border-[#D9D5C8] rounded-lg px-4 py-3 mb-8 text-left">
            <span className="font-medium text-[#0E1411]">
              Why we think so:
            </span>{" "}
            {customReason}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/start"
            className="inline-block bg-[#0F6E56] text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
          >
            Start a fresh analysis
          </Link>
          <Link
            href="/"
            className="text-sm text-[#0E1411] underline underline-offset-4 hover:text-[#0F6E56]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
