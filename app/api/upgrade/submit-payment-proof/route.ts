import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const PAYMENT_PROOFS_BUCKET = "payment_proofs";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB — matches Supabase bucket limit
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const SIGNED_URL_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SCREENSHOT_FIELD = "payment_screenshot";

const idSchema = z.string().uuid();
const txnSchema = z.string().trim().min(1).max(120);

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const rawAssessmentId = formData.get("assessment_id");
  const parsedId = idSchema.safeParse(rawAssessmentId);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "Missing or invalid assessment_id." },
      { status: 422 }
    );
  }
  const assessment_id = parsedId.data;

  const rawTxn = formData.get("transaction_id");
  let transaction_id: string | null = null;
  if (typeof rawTxn === "string" && rawTxn.trim().length > 0) {
    const txnParsed = txnSchema.safeParse(rawTxn);
    if (!txnParsed.success) {
      return NextResponse.json(
        { error: "Transaction ID looks malformed." },
        { status: 422 }
      );
    }
    transaction_id = txnParsed.data;
  }

  const rawFile = formData.get(SCREENSHOT_FIELD);
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;

  if (!file && !transaction_id) {
    return NextResponse.json(
      {
        error:
          "Please upload a payment screenshot or enter a transaction ID.",
      },
      { status: 422 }
    );
  }

  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Screenshot must be 5 MB or smaller." },
        { status: 422 }
      );
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Screenshot must be PNG, JPEG, or WebP." },
        { status: 422 }
      );
    }
  }

  const supabase = getServiceClient();

  const { data: assessment, error: assErr } = await supabase
    .from("assessments")
    .select("id, email")
    .eq("id", assessment_id)
    .maybeSingle<{ id: string; email: string }>();
  if (assErr) {
    return NextResponse.json(
      { error: "Could not load assessment." },
      { status: 500 }
    );
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const { data: existing, error: existErr } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("assessment_id", assessment_id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; status: string }>();
  if (existErr) {
    return NextResponse.json(
      { error: "Could not check existing orders." },
      { status: 500 }
    );
  }
  if (existing) {
    return NextResponse.json(
      {
        error: "Order already exists for this assessment, see status.",
        order_id: existing.id,
      },
      { status: 409 }
    );
  }

  let payment_screenshot_url: string | null = null;
  if (file) {
    const ext = extFor(file.type);
    const objectPath = `${assessment_id}/${Date.now()}.${ext}`;
    const buf = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .upload(objectPath, buf, {
        contentType: file.type,
        upsert: false,
      });
    if (upErr) {
      console.error("payment_proofs upload failed:", upErr);
      return NextResponse.json(
        { error: "Could not save your screenshot. Please try again." },
        { status: 500 }
      );
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
    if (signErr || !signed) {
      console.error("signed URL creation failed:", signErr);
      return NextResponse.json(
        { error: "Could not finalise your screenshot. Please try again." },
        { status: 500 }
      );
    }
    payment_screenshot_url = signed.signedUrl;
  }

  const { data: order, error: insErr } = await supabase
    .from("tier2_orders")
    .insert({
      assessment_id,
      amount_inr: 499,
      status: "pending_verification",
      payment_method: "upi_qr",
      payment_screenshot_url,
      transaction_id,
      email_sent_to: assessment.email,
    })
    .select("id")
    .single<{ id: string }>();

  if (insErr || !order) {
    console.error("tier2_orders insert error:", insErr);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      order_id: order.id,
      has_screenshot: !!file,
      has_txn_id: !!transaction_id,
    },
    { status: 201 }
  );
}
