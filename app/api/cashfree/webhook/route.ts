/**
 * Story 2.8 — Cashfree webhook receiver.
 *
 * Cashfree POSTs payment-event notifications here. We verify the
 * HMAC-SHA256 signature, then update the matching tier2_orders row.
 *
 * Headers:
 *   x-webhook-timestamp
 *   x-webhook-signature  (base64(HMAC(timestamp + body)))
 *
 * Body shape (PG v2025):
 *   {
 *     type: "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | ...,
 *     data: {
 *       order: { order_id, ... },
 *       payment: { cf_payment_id, payment_status, ... }
 *     }
 *   }
 *
 * Per Cashfree docs, return 200 within 5s. We update the order row
 * and return immediately. Admin verification (status: paid → verified)
 * stays manual for sandbox per the founder lock.
 */
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import {
  getCashfreeConfig,
  verifyWebhookSignature,
} from "@/lib/cashfree/client";
import { dispatchGenerationForOrder } from "@/lib/engine/trigger-dispatch";

export const dynamic = "force-dynamic";
// Webhook returns fast (we promise Cashfree <5s). The v2 orchestrator
// runs via after() and needs the extended window.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const cfg = getCashfreeConfig();
  if (!cfg) {
    // Without keys we can't verify — drop the event quietly. We
    // surface 200 so Cashfree doesn't retry endlessly during a
    // transient misconfiguration.
    console.warn(
      "[cashfree/webhook] dropped event: cashfree keys not configured"
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  const rawBody = await req.text();
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
  const signature = req.headers.get("x-webhook-signature") ?? "";

  const ok = verifyWebhookSignature({
    rawBody,
    timestamp,
    signature,
    secretKey: cfg.secretKey,
  });
  if (!ok) {
    console.warn("[cashfree/webhook] signature mismatch");
    return NextResponse.json(
      { error: "invalid_signature" },
      { status: 401 }
    );
  }

  let payload: {
    type?: string;
    data?: {
      order?: { order_id?: string };
      payment?: { cf_payment_id?: string; payment_status?: string };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const cashfreeOrderId = payload.data?.order?.order_id;
  const cfPaymentId = payload.data?.payment?.cf_payment_id;
  const paymentStatus = payload.data?.payment?.payment_status;
  const eventType = payload.type ?? "";

  if (!cashfreeOrderId) {
    console.warn("[cashfree/webhook] missing order_id");
    return NextResponse.json({ ok: true, no_match: true });
  }

  const supabase = getServiceClient();
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("cashfree_order_id", cashfreeOrderId)
    .maybeSingle();
  if (!order) {
    console.warn(
      `[cashfree/webhook] no matching order for ${cashfreeOrderId}`
    );
    return NextResponse.json({ ok: true, no_match: true });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (cfPaymentId) updates.cashfree_payment_id = cfPaymentId;

  let shouldAutoTrigger = false;
  if (
    eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
    paymentStatus === "SUCCESS"
  ) {
    // Story 3.2 — collapse paid → generating in the same write so
    // the v2 trigger can fire immediately. Skipping the intermediate
    // 'paid' state (still used by the legacy admin verify path)
    // eliminates the race we saw in Sprint 2. Don't overwrite later
    // states (generating / delivered) — those came from admin or a
    // prior webhook delivery.
    if (
      order.status === "created" ||
      order.status === "pending_verification"
    ) {
      updates.status = "generating";
      shouldAutoTrigger = true;
    }
  } else if (
    eventType === "PAYMENT_FAILED_WEBHOOK" ||
    paymentStatus === "FAILED"
  ) {
    if (
      order.status === "created" ||
      order.status === "pending_verification"
    ) {
      updates.status = "failed";
      updates.notes = `Cashfree payment failed (event ${eventType})`;
    }
  }
  // USER_DROPPED / EXPIRED webhook types: leave status untouched;
  // customer can retry checkout.

  await supabase.from("tier2_orders").update(updates).eq("id", order.id);

  console.log(
    `[cashfree/webhook] ${eventType} · order ${order.id} · ${order.status} → ${updates.status ?? order.status}`
  );

  // Story 3.2 + Phase 1.6 — fire tier-aware generation in the
  // background once status has landed at 'generating'. after() keeps
  // the function alive past the response so Cashfree gets its <5s ack
  // and the orchestrator (v2: ~4 min, Tier 1: ~30s) still runs.
  // dispatchGenerationForOrder branches on tier_choice internally.
  if (shouldAutoTrigger) {
    after(async () => {
      await dispatchGenerationForOrder(order.id);
    });
  }

  return NextResponse.json({ ok: true });
}
