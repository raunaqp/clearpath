import { NextRequest, NextResponse } from "next/server";
import React from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { getServiceClient } from "@/lib/supabase";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import { ReadinessCardDocument } from "@/lib/pdf/readiness-card-template";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const READINESS_CARDS_BUCKET = "readiness_cards";
const SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

type AssessmentRow = {
  id: string;
  share_token: string;
  readiness_card: unknown;
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 4) {
    return NextResponse.json(
      { error: "Invalid share token." },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, share_token, readiness_card")
    .eq("share_token", token)
    .eq("status", "completed")
    .maybeSingle<AssessmentRow>();

  if (error || !data || data.readiness_card == null) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  const parsed = ReadinessCardSchema.safeParse(data.readiness_card);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Card data is malformed; cannot render." },
      { status: 500 }
    );
  }

  // Render the PDF. Same pattern as the Draft Pack CLI — cast the
  // function-component element through `unknown` because @react-pdf/renderer
  // narrows `renderToBuffer` to ReactElement<DocumentProps> directly.
  const generated_date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let pdfBytes: Buffer;
  try {
    const element = React.createElement(ReadinessCardDocument, {
      data: {
        card: parsed.data,
        assessment_id: data.id,
        generated_date,
      },
    });
    pdfBytes = await renderToBuffer(
      element as unknown as React.ReactElement<DocumentProps>
    );
  } catch (e) {
    console.error("readiness-card pdf render failed:", e);
    return NextResponse.json(
      {
        error: "Could not render the PDF. Please try again or copy the link.",
      },
      { status: 500 }
    );
  }

  // Upload (always upsert — fresh PDF per request keeps things simple).
  // The signed URL is fresh per request with a 90-day TTL.
  const objectPath = `${data.share_token}/readiness-card.pdf`;
  const { error: upErr } = await supabase.storage
    .from(READINESS_CARDS_BUCKET)
    .upload(objectPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (upErr) {
    console.error("readiness-card pdf upload failed:", upErr);
    // Specific hint for the most common cause: bucket doesn't exist.
    const bucketMissing = /bucket.*not.*found|bucket.*does.*not/i.test(
      upErr.message ?? ""
    );
    return NextResponse.json(
      {
        error: bucketMissing
          ? "Storage bucket 'readiness_cards' is not yet created. The site admin needs to create it in Supabase dashboard."
          : "Could not save the PDF. Please try again.",
      },
      { status: 500 }
    );
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(READINESS_CARDS_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      {
        error: "Could not generate a download link. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      pdf_url: signed.signedUrl,
      page_count: 2,
      bytes: pdfBytes.length,
    },
    { status: 200 }
  );
}
