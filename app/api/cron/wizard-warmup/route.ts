/**
 * Sprint 4B ITEM 1D — wizard warm-up cron.
 *
 * Vercel cron pings this endpoint every 5 minutes. The act of being
 * invoked keeps the Fluid Compute project warm — instances are reused
 * across endpoints, so a single ping every 5 minutes is enough to
 * shave the ~1-3s cold-start latency off the first user-facing wizard
 * save/complete call after an idle window.
 *
 * Schedule lives in vercel.json under crons[].
 *
 * Auth: Bearer token against CRON_SECRET (Vercel-managed env var). The
 * cron runtime sets the Authorization header automatically on its
 * invocations. Without the secret check, anyone could DoS-amplify by
 * hitting the endpoint repeatedly.
 *
 * No DB writes. No LLM calls. Cost per ping is the bare-minimum
 * Active CPU charge for the response.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // SYSTEM: Vercel-cron-authenticated via CRON_SECRET bearer token.
  // No user session — the secret check IS the auth boundary.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error(
      "[cron/wizard-warmup] CONFIG ERROR: CRON_SECRET not set; refusing to run open"
    );
    return NextResponse.json(
      { error: "cron_not_configured" },
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    warmed_at: new Date().toISOString(),
  });
}
