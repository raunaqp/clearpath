import { getServiceClient } from "@/lib/supabase";
import { displayName } from "@/lib/wizard/display-name";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
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
        journey_stage: "",
        context: "",
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="font-serif font-normal text-2xl sm:text-3xl lg:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
            Get an expert on your case
          </h1>
          <p className="text-[#6B766F] text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
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
    journey_stage: "",
    context: "",
  };
}
