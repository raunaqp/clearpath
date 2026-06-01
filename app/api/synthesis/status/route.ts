/**
 * Sprint 4B ITEM 1A — synthesis status poll endpoint.
 *
 * Client-side companion to the dispatchSynthesisForAssessment refactor.
 * The /assess/[id] page now fires the Opus call via after() and returns
 * a polling shell instead of blocking on the 20-30s LLM latency. The
 * shell polls this endpoint until the worker stamps completion (or an
 * error) on the assessment row.
 *
 * Auth: requireAuthOwnedAssessment — only the row owner can poll.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";

const idSchema = z.string().uuid();

type Row = {
  status: string;
  share_token: string | null;
  meta: Record<string, unknown> | null;
};

export async function GET(req: NextRequest) {
  const assessment_id = req.nextUrl.searchParams.get("assessment_id");
  const parsed = idSchema.safeParse(assessment_id);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid assessment_id." },
      { status: 422 }
    );
  }

  const auth = await requireAuthOwnedAssessment(parsed.data);
  if (auth instanceof NextResponse) return auth;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("status, share_token, meta")
    .eq("id", parsed.data)
    .maybeSingle<Row>();
  if (error || !data) {
    return NextResponse.json(
      { error: "Could not load assessment status." },
      { status: 500 }
    );
  }

  const meta = (data.meta ?? {}) as Record<string, unknown>;
  const runningAt = meta.synthesizer_running_at as string | undefined;
  const ageSeconds =
    runningAt && data.status === "synthesizing"
      ? Math.max(0, Math.floor((Date.now() - new Date(runningAt).getTime()) / 1000))
      : null;

  const errMeta = meta.synthesizer_error as
    | { error_type?: string; message?: string; retry_count?: number }
    | undefined;

  return NextResponse.json({
    status: data.status,
    share_token: data.share_token,
    age_seconds: ageSeconds,
    error_type: errMeta?.error_type ?? null,
    error_message: errMeta?.message ?? null,
    retry_count: errMeta?.retry_count ?? 0,
  });
}
