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

  // CAS: only flip if currently verified. The actual generation runs in a
  // local CLI invocation (Vercel functions can't reliably do background work
  // on the hobby plan). The endpoint just hands off the command string.
  const { data, error } = await supabase
    .from("tier2_orders")
    .update({ status: "generating" })
    .eq("id", parsed.data.order_id)
    .eq("status", "verified")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    console.error("generate-draft-pack CAS update failed:", error);
    return NextResponse.json(
      { error: "Could not trigger generation. Please try again." },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "Order not in 'verified' state — verify it first." },
      { status: 409 }
    );
  }

  const cliCommand = `npm run generate-draft-pack -- --order-id ${data.id}`;

  return NextResponse.json(
    {
      ok: true,
      order_id: data.id,
      cli_command: cliCommand,
      message:
        "Draft Pack generation triggered. Run this from your terminal to complete:",
    },
    { status: 202 }
  );
}
