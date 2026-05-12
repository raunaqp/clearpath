/**
 * Story 2.8 — create a Cashfree order for the customer's tier2_orders row.
 *
 * POST /api/cashfree/create-order { assessment_id }
 *   1. Authn — must be the signed-in owner of the assessment.
 *   2. Locate or create a tier2_orders row for this assessment.
 *      - If a row already exists in pending_verification / created /
 *        paid, return its existing checkout URL (idempotent).
 *      - Otherwise insert a new row in 'created'.
 *   3. Call Cashfree to create their order. Persist the payment
 *      session id on the tier2_orders row.
 *   4. Return { checkout_url, session_id, order_id }.
 *
 * Cashfree config (CASHFREE_APP_ID / CASHFREE_SECRET_KEY) is read
 * from env at runtime. When unset, the endpoint returns 503 so the
 * upgrade page can fall back to the legacy UPI-QR flow.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";
import {
  checkoutUrlFor,
  createOrder,
  getCashfreeConfig,
} from "@/lib/cashfree/client";

export const dynamic = "force-dynamic";

const TIER2_AMOUNT_INR = 499;
const REUSABLE_STATUSES = ["created", "pending_verification", "paid"] as const;

const schema = z.object({
  assessment_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const cfg = getCashfreeConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        error: "cashfree_not_configured",
        message:
          "Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Vercel env to enable this flow.",
      },
      { status: 503 }
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Sprint 2 closeout — Tier 2 delivery is by email, so we require a
  // verified email at payment time. Sprint 3 makes this tier-aware
  // (₹2,499 in-app editor skips the check). The page-level gate
  // surfaces the same precondition with a UI affordance; this is
  // belt-and-suspenders in case a client bypasses the page.
  if (!user.emailConfirmedAt) {
    return NextResponse.json(
      {
        error: "email_not_verified",
        message:
          "Your Draft Pack arrives by email — please verify your address first. Check your inbox for the confirmation link sent at signup.",
      },
      { status: 412 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, email")
    .eq("id", parsed.data.assessment_id)
    .maybeSingle();
  if (!assessment) {
    return NextResponse.json(
      { error: "assessment_not_found" },
      { status: 404 }
    );
  }

  // Reuse an existing reusable row if present.
  const { data: existing } = await supabase
    .from("tier2_orders")
    .select(
      "id, status, cashfree_payment_session_id, cashfree_order_id, amount_inr"
    )
    .eq("assessment_id", assessment.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    existing &&
    REUSABLE_STATUSES.includes(
      existing.status as (typeof REUSABLE_STATUSES)[number]
    ) &&
    existing.cashfree_payment_session_id
  ) {
    return NextResponse.json({
      checkout_url: checkoutUrlFor(cfg, existing.cashfree_payment_session_id),
      session_id: existing.cashfree_payment_session_id,
      order_id: existing.id,
      reused: true,
    });
  }

  // Create our row first so we have a UUID for the cashfree order_id.
  const { data: orderRow, error: insErr } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id: assessment.id,
      status: "created",
      amount_inr: TIER2_AMOUNT_INR,
      payment_method: "cashfree",
    })
    .select("id")
    .single();
  if (insErr || !orderRow) {
    console.error("[cashfree/create-order] insert failed:", insErr?.message);
    return NextResponse.json(
      { error: "db_insert_failed", message: insErr?.message },
      { status: 500 }
    );
  }

  const cashfreeOrderId = `cp_${orderRow.id.replace(/-/g, "").slice(0, 32)}`;
  const origin = req.nextUrl.origin;
  const returnUrl = `${origin}/api/cashfree/return?order_id=${orderRow.id}`;
  const notifyUrl = `${origin}/api/cashfree/webhook`;

  const cfRes = await createOrder(cfg, {
    orderId: cashfreeOrderId,
    amountInr: TIER2_AMOUNT_INR,
    customer: {
      id: assessment.id,
      email: assessment.email,
    },
    returnUrl,
    notifyUrl,
  });

  if (!cfRes.ok) {
    // Roll back the empty row so the next attempt re-enters the
    // 'created' state cleanly.
    await supabase.from("tier2_orders").delete().eq("id", orderRow.id);
    console.error(
      "[cashfree/create-order] Cashfree API rejected:",
      cfRes.error
    );
    return NextResponse.json(
      { error: "cashfree_rejected", message: cfRes.error },
      { status: cfRes.status }
    );
  }

  const sessionId = cfRes.data.payment_session_id;
  if (!sessionId) {
    await supabase.from("tier2_orders").delete().eq("id", orderRow.id);
    return NextResponse.json(
      {
        error: "cashfree_response_missing_session",
        message: "Cashfree did not return a payment_session_id.",
      },
      { status: 502 }
    );
  }

  await supabase
    .from("tier2_orders")
    .update({
      cashfree_order_id: cashfreeOrderId,
      cashfree_payment_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderRow.id);

  return NextResponse.json({
    checkout_url: checkoutUrlFor(cfg, sessionId),
    session_id: sessionId,
    order_id: orderRow.id,
    reused: false,
  });
}
