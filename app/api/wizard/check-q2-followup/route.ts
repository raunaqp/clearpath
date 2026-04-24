import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { scanForDecisionSupport } from "@/lib/wizard/q2-phrases";

const bodySchema = z.object({
  assessment_id: z.string().uuid(),
});

type UploadedDoc = {
  filename?: string;
  storage_path?: string;
  size_bytes?: number;
  sha256?: string;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message }, { status: 422 });
  }

  const { assessment_id } = parsed.data;

  const supabase = getServiceClient();
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("url_fetched_content, uploaded_docs, meta")
    .eq("id", assessment_id)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return NextResponse.json({ error: "Could not load assessment." }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const urlContent: string = (assessment.url_fetched_content as string | null) ?? "";
  const uploadedDocs: UploadedDoc[] =
    (assessment.uploaded_docs as UploadedDoc[] | null) ?? [];

  // Fast path: nothing to scan.
  if (!urlContent && uploadedDocs.length === 0) {
    return NextResponse.json(
      { show_followup: false, extracted_phrases: [] },
      { status: 200 }
    );
  }

  const sha256List = uploadedDocs
    .map((d) => d.sha256)
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  let pdfSummaries: string[] = [];
  if (sha256List.length > 0) {
    // Single batched lookup keeps this to one round-trip regardless of PDF count.
    const { data: cacheRows, error: cacheError } = await supabase
      .from("pdf_content_cache")
      .select("extracted_summary")
      .in("pdf_sha256", sha256List);

    if (cacheError) {
      console.error("Supabase pdf_content_cache fetch error:", cacheError);
      // Degrade gracefully: scan URL content alone rather than 500ing.
    } else if (cacheRows) {
      pdfSummaries = cacheRows
        .map((r) => (r.extracted_summary as string | null) ?? "")
        .filter((s) => s.length > 0);
    }
  }

  const corpus = [urlContent, ...pdfSummaries].join("\n").toLowerCase();
  const phrases = scanForDecisionSupport(corpus);

  return NextResponse.json(
    { show_followup: phrases.length > 0, extracted_phrases: phrases },
    { status: 200 }
  );
}
