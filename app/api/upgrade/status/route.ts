import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const idSchema = z.string().uuid();

export async function GET(req: NextRequest) {
  const assessment_id = req.nextUrl.searchParams.get("assessment_id");
  const parsed = idSchema.safeParse(assessment_id);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid assessment_id." },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tier2_orders")
    .select(
      "id, status, transaction_id, payment_screenshot_url, draft_pack_pdf_url, delivered_at, created_at, email_sent_to"
    )
    .eq("assessment_id", parsed.data)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Could not load order." },
      { status: 500 }
    );
  }

  return NextResponse.json({ order: data ?? null });
}
