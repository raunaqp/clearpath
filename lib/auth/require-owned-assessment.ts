/**
 * Shared API-route auth helper — single source of truth for the
 * "authenticated + owns the assessment" pattern.
 *
 * Before this helper landed (2026-05-31, P0 auth incident — see
 * `docs/incidents/2026-05-31-prod-auth-regression.md`), API routes
 * each rolled their own auth + ownership logic. Several routes
 * called `getServiceClient()` with NO auth check at all and leaked
 * PII (`/api/assessment/[id]`, `/api/upgrade/status`) or accepted
 * unauthenticated mutations (`/api/wizard/save`, `/complete`,
 * `/ack-conflict`, `/check-q2-followup`, `/upgrade/submit-payment-
 * proof`). Other routes had `getUser()` but skipped the ownership
 * join, leaving every authenticated user able to read or write
 * every other assessment by guessing UUIDs (`/api/draft/[id]/*`,
 * `/api/cashfree/create-order`).
 *
 * This module centralises both shapes:
 *   - `requireAuth()`             — must be signed in.
 *   - `requireAuthOwnedAssessment(assessmentId)`  — must be signed
 *     in AND own the assessment.
 *
 * Both return a {user[, assessment]} discriminator on success OR a
 * `NextResponse` the route handler should return directly. The
 * Response pattern avoids throwing across the request boundary;
 * caller checks `instanceof NextResponse` to branch.
 *
 * Ownership compare is **case-insensitive email match** between the
 * authenticated session email and `assessments.email`, matching
 * the existing precedent at `app/api/upgrade/regenerate-pdf/route.ts:74`
 * and `app/api/wizard/save-tier-b/route.ts:93`. No new ownership
 * primitive invented here.
 *
 * Failure modes return:
 *   - 401 `unauthorized`           — no signed-in user
 *   - 404 `not_found`              — assessment missing OR ownership
 *                                    mismatch. Wire response is
 *                                    identical per OWASP A01:2021
 *                                    (don't leak resource existence
 *                                    to non-owners). Server-side
 *                                    console line distinguishes the
 *                                    two cases via the `reason` field
 *                                    so engineers can debug without
 *                                    eyeballing the bytes returned.
 */
import "server-only";
import { NextResponse } from "next/server";
import { getUser, type AuthedUser } from "@/lib/auth/session";
import { getServiceClient } from "@/lib/supabase";

export type OwnedAssessment = {
  id: string;
  email: string;
};

/** Sign-in gate. Use on endpoints that mutate per-user state but
 *  don't tie to a specific assessment (none today; here for symmetry
 *  with the OWN variant). */
export async function requireAuth(): Promise<
  { user: AuthedUser } | NextResponse
> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return { user };
}

/** Sign-in + ownership gate. The default choice for every endpoint
 *  that reads or writes an assessment-scoped resource. */
export async function requireAuthOwnedAssessment(
  assessmentId: string
): Promise<{ user: AuthedUser; assessment: OwnedAssessment } | NextResponse> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("id, email")
    .eq("id", assessmentId)
    .maybeSingle<{ id: string; email: string }>();

  if (error) {
    console.error(
      `[require-owned-assessment] supabase error loading ${assessmentId}: ${error.message}`
    );
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!assessment) {
    console.warn(
      `[require-owned-assessment] not_found: user=${user.email} assessment_id=${assessmentId} reason=missing_row`
    );
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (
    assessment.email.toLowerCase() !== user.email.toLowerCase()
  ) {
    // OWASP A01:2021 — wire response is 404, not 403. Log line
    // surfaces enough context (user + owner + assessment_id) to
    // debug confused-deputy / wrong-link / shared-screenshot
    // scenarios in production without leaking to the API caller.
    console.warn(
      `[require-owned-assessment] not_found: user=${user.email} assessment_id=${assessmentId} owner=${assessment.email} reason=ownership_mismatch`
    );
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return { user, assessment };
}
