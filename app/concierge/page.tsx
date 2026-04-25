import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { displayName } from "@/lib/wizard/display-name";
import { ConciergeForm, type ConciergeInitialValues } from "./form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function ConciergePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const source = first(params.source);
  const assessmentId = first(params.assessment_id);

  let initial: ConciergeInitialValues = empty();
  let prefilled = false;
  let sourceAssessmentId: string | null = null;

  if (source === "card" && assessmentId && UUID_RE.test(assessmentId)) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("assessments")
      .select("id, name, email, mobile, one_liner")
      .eq("id", assessmentId)
      .maybeSingle();
    if (!error && data) {
      sourceAssessmentId = data.id as string;
      prefilled = true;
      initial = {
        name: (data.name as string) ?? "",
        email: (data.email as string) ?? "",
        mobile: (data.mobile as string) ?? "",
        product_name: data.one_liner ? displayName(data.one_liner as string) : "",
        cdsco_application_number: "",
        target_submission_date: "",
        context: "",
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <nav className="px-6 py-4 border-b border-[#E8E4D6]">
        <Link
          href="/"
          className="font-serif text-[20px] text-[#0E1411] hover:text-[#0F6E56] transition-colors"
        >
          ClearPath
        </Link>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-xl">
          <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
            Get an expert on your case
          </h1>
          <p className="text-[#6B766F] text-base mb-8 leading-relaxed">
            ₹50,000 for 12 months · Indian regulatory experts review your
            submission. 1 iteration included.
          </p>

          <ConciergeForm
            initial={initial}
            prefilled={prefilled}
            sourceAssessmentId={sourceAssessmentId}
          />
        </div>
      </main>
    </div>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function empty(): ConciergeInitialValues {
  return {
    name: "",
    email: "",
    mobile: "",
    product_name: "",
    cdsco_application_number: "",
    target_submission_date: "",
    context: "",
  };
}
