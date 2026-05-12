import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { triggerV2GenerationForOrder } from "@/lib/engine/draft-pack-v2/auto-trigger";

// Sprint 2 Story 2.6 — auto-trigger v2 generation when admin verifies
// the payment. The response returns immediately (status: 'verified');
// the v2 orchestrator runs in the background via Vercel's after().
// maxDuration extended to fit a ~4-minute pack gen.
export const maxDuration = 300;

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

  // CAS pending_verification → generating in ONE write. Skipping the
  // intermediate 'verified' state eliminates a race we observed in
  // production: admin clicked Verify, then immediately clicked the
  // legacy v1 "Generate" button, whose CAS verified→generating
  // succeeded before the auto-trigger v2 (scheduled via after()) ever
  // ran. v1 set status='delivered' + draft_pack_pdf_url but writes
  // nothing to draft_pack_sections — leaving /draft/[id] empty.
  // Result for the affected order b54a20ec-…: PDF exists, but the
  // sectioned editor sees zero rows.
  //
  // By landing 'generating' in the verify response, any v1 click after
  // that returns 409 cleanly. Status semantics shift slightly: we no
  // longer pass through 'verified'. Existing customers in 'verified'
  // still work — the v1 endpoint accepts that state. Sprint 3 will
  // replace this whole chain with Cashfree-paid → generating.
  const { data, error } = await supabase
    .from("tier2_orders")
    .update({
      status: "generating",
      verified_at: now,
      verified_by: "admin",
      updated_at: now,
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

  // Auto-trigger Phase 5.5 v2 generation in the background. The admin
  // response returns immediately. Fluid Compute keeps the function
  // alive past the response to run after()-scheduled work.
  after(async () => {
    await triggerV2GenerationForOrder(data.id);
  });

  return NextResponse.json({ ok: true, order_id: data.id, status: data.status });
}
