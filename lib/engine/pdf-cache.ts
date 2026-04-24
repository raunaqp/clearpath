import { getServiceClient } from "@/lib/supabase";

export type PdfCacheHit = {
  cached: true;
  summary: string;
  token_count: number | null;
};
export type PdfCacheMiss = { cached: false };

type CacheRow = {
  extracted_summary: string;
  token_count: number | null;
  hit_count: number;
};

export async function checkPdfCache(
  sha256: string
): Promise<PdfCacheHit | PdfCacheMiss> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("pdf_content_cache")
    .select("extracted_summary, token_count, hit_count")
    .eq("pdf_sha256", sha256)
    .maybeSingle<CacheRow>();

  if (!data) return { cached: false };

  // Fire-and-forget usage stats update
  void supabase
    .from("pdf_content_cache")
    .update({
      hit_count: data.hit_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("pdf_sha256", sha256)
    .then(() => undefined);

  return {
    cached: true,
    summary: data.extracted_summary,
    token_count: data.token_count,
  };
}

export async function savePdfSummary(input: {
  sha256: string;
  summary: string;
  token_count: number;
}): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await getServiceClient()
    .from("pdf_content_cache")
    .upsert(
      {
        pdf_sha256: input.sha256,
        extracted_summary: input.summary,
        token_count: input.token_count,
        created_at: now,
        last_used_at: now,
      },
      { onConflict: "pdf_sha256", ignoreDuplicates: true }
    );

  if (error) {
    throw new Error(`Failed to save PDF summary: ${error.message}`);
  }
}
