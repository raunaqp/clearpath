import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { generateDraftPack } from "@/lib/engine/draft-pack-generator";

// Vercel Hobby plan caps function execution at 60 seconds. Typical
// end-to-end is ~30-40s (Opus dominates), which fits comfortably.
// If Opus stalls past the cap, the function will be killed and the
// caller sees a connection error — the caller's UI must treat that
// as a failure path (don't fake success). The order will be left in
// 'generating' state and an admin retry (or CLI run) recovers.
export const maxDuration = 60;

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

  const orderId = parsed.data.order_id;
  const supabase = getServiceClient();

  // CAS verified → generating. Only one request can hold the lock; concurrent
  // clicks will see 409.
  const { data: locked, error: casErr } = await supabase
    .from("tier2_orders")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "verified")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (casErr) {
    console.error("generate-draft-pack CAS update failed:", casErr);
    return NextResponse.json(
      { error: "Could not trigger generation. Please try again." },
      { status: 500 }
    );
  }
  if (!locked) {
    return NextResponse.json(
      { error: "Order not in 'verified' state — verify it first." },
      { status: 409 }
    );
  }

  // Run end-to-end. Logs land in Vercel function logs.
  const result = await generateDraftPack({
    orderId,
    log: (msg) => console.log(`[generate-draft-pack] ${msg}`),
  });

  if (!result.ok) {
    // Revert lock so admin can retry (or run the CLI).
    await supabase
      .from("tier2_orders")
      .update({ status: "verified", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "generating");

    return NextResponse.json(
      {
        error: `Generation failed at step "${result.errorStep}": ${result.error}`,
        step: result.errorStep,
      },
      { status: 500 }
    );
  }

  // Live mode (only mode the API uses — no dryRun from admin).
  if (result.mode !== "live") {
    return NextResponse.json(
      { error: "Internal mismatch: generator returned non-live result." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      order_id: result.orderId,
      pdf_url: result.pdfUrl,
      page_count: result.pageCount,
      email_sent: result.emailSent,
      email_recipient: result.emailRecipient,
      appended_form_ids: result.appendedFormIds,
    },
    { status: 200 }
  );
}
