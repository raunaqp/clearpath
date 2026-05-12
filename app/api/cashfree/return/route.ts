/**
 * Story 2.8 — return URL handler after Cashfree checkout.
 *
 * Cashfree redirects the customer here when they complete (or
 * cancel) checkout. We don't trust the redirect — the authoritative
 * status arrives via webhook. We just redirect the customer back
 * to /upgrade/[assessment_id] where StatusPanel polls for the row's
 * current state.
 *
 * Query: ?order_id=<tier2_order_id> (we set this in create-order's
 * return_url).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  const supabase = getServiceClient();
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("assessment_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order?.assessment_id) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.redirect(
    new URL(`/upgrade/${order.assessment_id}`, req.url)
  );
}
