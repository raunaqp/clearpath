import { getServiceClient } from "@/lib/supabase";
import {
  runSynthesizer,
  type SynthesizerInput,
} from "@/lib/engine/synthesizer";
import {
  computeCacheKey,
  checkReadinessCache,
} from "@/lib/engine/readiness-cache";
import { generateShareToken } from "@/lib/engine/share-token";
import {
  ReadinessCardSchema,
  type ReadinessCard,
} from "@/lib/schemas/readiness-card";
import { checkPdfCache } from "@/lib/engine/pdf-cache";
import type { SynthesizerErrorType } from "@/components/card/SynthesizerErrorPanel";

/**
 * Window after which a `synthesizer_running_at` timestamp is considered stale
 * and another worker may take over the lock. Picked to be longer than typical
 * Opus latency (~30s) but short enough that a crashed worker doesn't block
 * the user for long.
 */
const RUNNING_LOCK_TTL_MS = 60_000;

const TAKEOVER_STATUSES = [
  "wizard_complete",
  "synthesizer_error",
  "synthesizing",
] as const;

type AssessmentRow = {
  id: string;
  email: string;
  one_liner: string;
  url: string | null;
  url_fetched_content: string | null;
  uploaded_docs: { sha256: string }[] | null;
  product_type: string | null;
  wizard_answers: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  status: string;
  share_token: string | null;
  readiness_card: unknown;
};

export type RunSynthesisResult =
  | { kind: "redirect"; shareToken: string }
  | {
      kind: "error";
      errorType: SynthesizerErrorType;
      retryCount: number;
      message: string;
    }
  | { kind: "wait"; runningSinceMs: number };

function cacheVersion(): number {
  const raw = process.env.CACHE_VERSION;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getRetryCount(meta: Record<string, unknown>): number {
  const e = meta.synthesizer_error as { retry_count?: unknown } | undefined;
  const c = e?.retry_count;
  return typeof c === "number" && Number.isInteger(c) && c >= 0 ? c : 0;
}

function isLockFresh(meta: Record<string, unknown>, nowMs: number): {
  fresh: boolean;
  ageMs: number;
} {
  const runningAt = meta.synthesizer_running_at as string | undefined;
  if (!runningAt) return { fresh: false, ageMs: Infinity };
  const ageMs = nowMs - new Date(runningAt).getTime();
  return { fresh: ageMs >= 0 && ageMs < RUNNING_LOCK_TTL_MS, ageMs };
}

/**
 * Drives the synthesizer for a wizard-complete assessment with single-flight
 * semantics. Idempotent: safe to call repeatedly. Returns the action the
 * caller should take (redirect / wait / show error).
 */
export async function runSynthesisForAssessment(
  id: string
): Promise<RunSynthesisResult> {
  const supabase = getServiceClient();

  const { data, error: fetchErr } = await supabase
    .from("assessments")
    .select(
      "id, email, one_liner, url, url_fetched_content, uploaded_docs, product_type, wizard_answers, meta, status, share_token, readiness_card"
    )
    .eq("id", id)
    .maybeSingle<AssessmentRow>();

  if (fetchErr || !data) {
    return {
      kind: "error",
      errorType: "fetch_failed",
      retryCount: 0,
      message: fetchErr?.message ?? "assessment not found",
    };
  }

  // Already done — short-circuit to redirect.
  if (data.status === "completed" && data.share_token) {
    return { kind: "redirect", shareToken: data.share_token };
  }

  const meta: Record<string, unknown> = (data.meta ?? {}) as Record<
    string,
    unknown
  >;
  const nowMs = Date.now();
  const { fresh: lockFresh, ageMs } = isLockFresh(meta, nowMs);

  if (data.status === "synthesizing" && lockFresh) {
    return { kind: "wait", runningSinceMs: ageMs };
  }

  // Acquire the lock atomically. We update only if status is still in
  // a takeover-eligible state. If no row matches, another worker raced
  // ahead — treat as a wait.
  const lockMeta: Record<string, unknown> = {
    ...meta,
    synthesizer_running_at: new Date(nowMs).toISOString(),
  };
  const lockedAtIso = new Date(nowMs).toISOString();

  const { data: locked, error: lockErr } = await supabase
    .from("assessments")
    .update({
      status: "synthesizing",
      meta: lockMeta,
      updated_at: lockedAtIso,
    })
    .eq("id", id)
    .in("status", TAKEOVER_STATUSES as unknown as string[])
    .select("id")
    .maybeSingle();

  if (lockErr) {
    return {
      kind: "error",
      errorType: "save_failed",
      retryCount: getRetryCount(meta),
      message: lockErr.message,
    };
  }
  if (!locked) {
    // Race lost; assume the other worker is making progress.
    return { kind: "wait", runningSinceMs: 0 };
  }

  // Past this point: this worker owns the synthesis attempt.
  const pdfHashes = (data.uploaded_docs ?? []).map((d) => d.sha256);
  const cacheKey = computeCacheKey({
    email: data.email,
    oneLiner: data.one_liner,
    url: data.url,
    pdfHashes,
    wizardAnswers: data.wizard_answers ?? {},
  });
  const ver = cacheVersion();

  let cardToSave: ReadinessCard | null = null;
  let usedFromAssessmentId: string | null = null;

  // 1) Cache check (any failure here is non-fatal — we just synthesize fresh).
  try {
    const thirtyDaysAgoIso = new Date(
      nowMs - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const cacheResult = await checkReadinessCache({
      cacheKey,
      cacheVersion: ver,
      thirtyDaysAgoIso,
    });
    if (cacheResult.hit) {
      const parsed = ReadinessCardSchema.safeParse(cacheResult.readinessCard);
      if (parsed.success) {
        cardToSave = parsed.data;
        usedFromAssessmentId = cacheResult.fromAssessmentId;
      }
    }
  } catch (err) {
    console.warn("readiness cache lookup failed:", err);
  }

  // 2) Cache miss → run Opus.
  if (!cardToSave) {
    const pdfSummaries: { sha256: string; summary: string }[] = [];
    for (const sha of pdfHashes) {
      try {
        const cached = await checkPdfCache(sha);
        if (cached.cached) {
          pdfSummaries.push({ sha256: sha, summary: cached.summary });
        }
      } catch (err) {
        console.warn(`pdf-cache lookup failed for ${sha}:`, err);
      }
    }

    const detectedSignals = meta.detected_signals ?? null;
    const conflictDetails = meta.conflict_details ?? null;

    const input: SynthesizerInput = {
      assessmentId: data.id,
      oneLiner: data.one_liner,
      productType: data.product_type ?? "product",
      urlContent: data.url_fetched_content,
      pdfSummaries,
      wizardAnswers: data.wizard_answers ?? {},
      detectedSignals,
      conflictDetails,
    };

    try {
      const synthResult = await runSynthesizer(input);
      cardToSave = synthResult.card;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const newCount = getRetryCount(meta) + 1;
      const errMeta: Record<string, unknown> = {
        ...lockMeta,
        synthesizer_running_at: null,
        synthesizer_error: {
          message,
          error_type: "opus_failure",
          retry_count: newCount,
          failed_at: new Date().toISOString(),
        },
      };
      await supabase
        .from("assessments")
        .update({
          status: "synthesizer_error",
          meta: errMeta,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      return {
        kind: "error",
        errorType: "opus_failure",
        retryCount: newCount,
        message,
      };
    }
  }

  // 3) Save card + share_token, mark completed.
  const shareToken = await generateShareToken();
  const finishedAtIso = new Date().toISOString();
  const finalMeta: Record<string, unknown> = {
    ...lockMeta,
    synthesizer_running_at: null,
    synthesizer_completed_at: finishedAtIso,
    synthesizer_cache_hit_from: usedFromAssessmentId,
    synthesizer_error: null,
  };

  // Denormalise TRL into convenience columns for admin queries / indexes.
  // Source of truth remains readiness_card JSONB.
  const cardWithTRL = cardToSave as { trl?: { level?: number | null; track?: string | null; completion_pct?: number | null } };
  const trlLevel = cardWithTRL?.trl?.level ?? null;
  const trlTrack = cardWithTRL?.trl?.track ?? null;
  const trlPct = cardWithTRL?.trl?.completion_pct ?? null;

  const { error: saveErr } = await supabase
    .from("assessments")
    .update({
      readiness_card: cardToSave,
      share_token: shareToken,
      cache_key: cacheKey,
      cache_version: ver,
      status: "completed",
      meta: finalMeta,
      trl_level: trlLevel,
      trl_track: trlTrack,
      trl_completion_pct: trlPct,
      updated_at: finishedAtIso,
    })
    .eq("id", id);

  if (saveErr) {
    const newCount = getRetryCount(meta) + 1;
    const errMeta: Record<string, unknown> = {
      ...lockMeta,
      synthesizer_running_at: null,
      synthesizer_error: {
        message: saveErr.message,
        error_type: "save_failed",
        retry_count: newCount,
        failed_at: new Date().toISOString(),
      },
    };
    await supabase
      .from("assessments")
      .update({
        status: "synthesizer_error",
        meta: errMeta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return {
      kind: "error",
      errorType: "save_failed",
      retryCount: newCount,
      message: saveErr.message,
    };
  }

  return { kind: "redirect", shareToken };
}
