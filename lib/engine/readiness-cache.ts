import { createHash } from "crypto";
import { getServiceClient } from "@/lib/supabase";

export type CacheKeyInput = {
  email: string;
  oneLiner: string;
  url: string | null;
  pdfHashes: string[];
  wizardAnswers: Record<string, unknown>;
};

/**
 * Deterministic cache key for the Readiness Card.
 * Same input + same wizard answers must produce the same key. PDFs are
 * order-independent (sorted), email is normalized to lowercase+trim, and
 * the URL is trimmed (or null).
 */
export function computeCacheKey(input: CacheKeyInput): string {
  const normalized = {
    email: input.email.toLowerCase().trim(),
    oneLiner: input.oneLiner.trim(),
    url: input.url ? input.url.trim() : null,
    pdfHashes: [...input.pdfHashes].sort(),
    wizardAnswers: input.wizardAnswers,
  };
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export type ReadinessCacheHit = {
  hit: true;
  fromAssessmentId: string;
  shareToken: string;
  /** Caller validates with ReadinessCardSchema before use. */
  readinessCard: unknown;
};

export type ReadinessCacheMiss = { hit: false };

export async function checkReadinessCache(args: {
  cacheKey: string;
  cacheVersion: number;
  thirtyDaysAgoIso: string;
}): Promise<ReadinessCacheHit | ReadinessCacheMiss> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, share_token, readiness_card")
    .eq("cache_key", args.cacheKey)
    .eq("cache_version", args.cacheVersion)
    .eq("status", "completed")
    .gte("created_at", args.thirtyDaysAgoIso)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `readiness-cache: lookup failed: ${error.message ?? String(error)}`
    );
  }
  if (!data) return { hit: false };

  const row = data as {
    id: string;
    share_token: string | null;
    readiness_card: unknown;
  };
  if (!row.share_token || row.readiness_card == null) {
    return { hit: false };
  }
  return {
    hit: true,
    fromAssessmentId: row.id,
    shareToken: row.share_token,
    readinessCard: row.readiness_card,
  };
}
