import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const schema = z.object({ order_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid order_id." },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  const now = new Date().toISOString();

  // CAS: only flip if currently pending_verification.
  const { data, error } = await supabase
    .from("tier2_orders")
    .update({
      status: "verified",
      verified_at: now,
      verified_by: "admin",
    })
    .eq("id", parsed.data.order_id)
    .eq("status", "pending_verification")
    .select("id, status")
    .maybeSingle<{ id: string; status: string }>();

  if (error) {
    console.error("verify-order update failed:", error);
    return NextResponse.json(
      { error: "Could not verify order. Please try again." },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "Order not in pending_verification state." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, order_id: data.id, status: data.status });
}
