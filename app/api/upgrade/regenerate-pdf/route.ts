/**
 * Sprint 3 Phase 1.6 — Tier 1 "Regenerate PDF" endpoint.
 *
 * Pure re-render. No Opus calls, no cost. Loads the generator JSON
 * that was stashed at `tier1_reports/<order_id>/report.json` when
 * the report was first generated, validates it against the schema,
 * renders the PDF with the current template, replaces the stored
 * PDF, refreshes the signed URL, stamps the order.
 *
 * Authorisation:
 *   - Caller must be signed in (so we can verify ownership).
 *   - The owning assessment's email must match the session email.
 *   - Order must be tier_choice = 'draft_pack' AND status = 'delivered'.
 *
 * Idempotent: hitting this twice in quick succession just produces
 * an identical PDF and bumps the signed URL.
 */
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { z } from "zod";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";
import {
  ReadinessReportSchema,
  type ReadinessReport,
} from "@/lib/schemas/readiness-report";
import { ReadinessReportDocument } from "@/lib/pdf/readiness-report-template";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TIER1_REPORTS_BUCKET = "tier1_reports";
const SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days, matches initial delivery.

const bodySchema = z.object({
  assessment_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 422 }
    );
  }
  const { assessment_id } = parsed.data;

  const auth = await requireAuthOwnedAssessment(assessment_id);
  if (auth instanceof NextResponse) return auth;

  const supabase = getServiceClient();

  // Pick the latest delivered draft_pack order for this assessment.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status, tier_choice")
    .eq("assessment_id", assessment_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string;
      status: string;
      tier_choice: "draft_pack" | "draft_editor" | null;
    }>();
  if (!order) {
    return NextResponse.json({ error: "no_order" }, { status: 404 });
  }
  if ((order.tier_choice ?? "draft_pack") !== "draft_pack") {
    return NextResponse.json(
      { error: "wrong_tier", message: "Regenerate is only available for the Regulatory Readiness Report tier." },
      { status: 409 }
    );
  }
  if (order.status !== "delivered") {
    return NextResponse.json(
      {
        error: "not_delivered",
        message: "Regenerate is only available after the report has been delivered.",
      },
      { status: 409 }
    );
  }

  // Load the persisted generator JSON.
  const jsonPath = `${order.id}/report.json`;
  const { data: jsonBlob, error: dlErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .download(jsonPath);
  if (dlErr || !jsonBlob) {
    return NextResponse.json(
      {
        error: "report_json_missing",
        message:
          "We couldn't find the saved report content for this order. Email founder@clearpath.in and we'll regenerate it for you.",
      },
      { status: 410 }
    );
  }

  let report: ReadinessReport;
  try {
    const text = await jsonBlob.text();
    const parsedJson: unknown = JSON.parse(text);
    report = ReadinessReportSchema.parse(parsedJson);
  } catch (err) {
    console.error(
      `[regenerate-pdf] schema validation failed for ${order.id}:`,
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "report_json_invalid" },
      { status: 500 }
    );
  }

  // Re-render via the current template. Cheap (no LLM); the bottleneck
  // is the react-pdf render itself (~1–2s for this 4–6 page template).
  let pdfBytes: Buffer;
  try {
    const element = React.createElement(ReadinessReportDocument, { report });
    pdfBytes = await renderToBuffer(
      element as unknown as React.ReactElement<DocumentProps>
    );
  } catch (err) {
    console.error(
      `[regenerate-pdf] render failed for ${order.id}:`,
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "render_failed" },
      { status: 500 }
    );
  }

  // Overwrite the stored PDF + mint a fresh signed URL.
  const pdfPath = `${order.id}/report.pdf`;
  const { error: upErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) {
    console.error(
      `[regenerate-pdf] upload failed for ${order.id}: ${upErr.message}`
    );
    return NextResponse.json(
      { error: "upload_failed", message: upErr.message },
      { status: 500 }
    );
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .createSignedUrl(pdfPath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      {
        error: "sign_failed",
        message: signErr?.message ?? "no URL returned",
      },
      { status: 500 }
    );
  }

  await supabase
    .from("tier2_orders")
    .update({
      draft_pack_pdf_url: signed.signedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  console.log(
    `[regenerate-pdf] re-rendered order ${order.id} · ${(pdfBytes.length / 1024).toFixed(0)}KB`
  );

  return NextResponse.json({
    ok: true,
    pdf_url: signed.signedUrl,
    bytes: pdfBytes.length,
  });
}
