/**
 * Phase 1.6 — Tier 1 ₹499 Regulatory Readiness Report auto-trigger.
 *
 * Parallel to `triggerV2GenerationForOrder` (which serves Tier 2).
 * Dispatched from the Cashfree webhook (and admin/verify-order)
 * AFTER `tier2_orders.status` has been flipped to `generating`.
 *
 * Pipeline:
 *   1. Load order + assessment.{readiness_card, wizard_answers, name, email}
 *   2. CAS-check status === 'generating' (idempotent re-runs are safe)
 *   3. Run `generateReadinessReport(input)` — 4 small Opus calls
 *   4. `renderToBuffer(<ReadinessReportDocument report={...} />)` via react-pdf
 *   5. Upload to Supabase Storage at `tier1_reports/<order_id>/report.pdf`
 *   6. Create a signed URL (90-day TTL)
 *   7. Update tier2_orders: status=delivered, draft_pack_pdf_url,
 *      email_sent_to, delivered_at, updated_at
 *
 * Notes on shared state:
 *   - `draft_pack_pdf_url` column reuse is intentional (founder lock,
 *     Phase 1.6 decision). The URL points to a 4–6 page Readiness
 *     Report PDF for Tier 1, and to the full 12-section v2 PDF for
 *     Tier 2. The column is dual-purpose; do not rename it without
 *     a migration that updates both call sites.
 *   - Email delivery is still a `console.log` placeholder until
 *     Sprint 4 Story 4.1 (production SMTP), mirroring the v2 path.
 */

import React from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { getServiceClient } from "@/lib/supabase";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import type { WizardAnswers } from "@/lib/wizard/types";
import { generateReadinessReport } from "./readiness-report-v1-generator";
import { ReadinessReportDocument } from "@/lib/pdf/readiness-report-template";
import type { AiExtractedRow } from "@/lib/intake/ai-extract";
import { shortDeviceName } from "@/lib/intake/short-device-name";

const TIER1_REPORTS_BUCKET = "tier1_reports";
const SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export async function triggerReadinessReportForOrder(
  orderId: string
): Promise<void> {
  const supabase = getServiceClient();
  const startedAt = Date.now();

  const { data: order, error: orderErr } = await supabase
    .from("tier2_orders")
    .select("id, assessment_id, status, tier_choice")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      assessment_id: string;
      status: string;
      tier_choice: string | null;
    }>();

  if (orderErr || !order) {
    console.error(
      `[tier1-trigger] could not load order ${orderId}:`,
      orderErr?.message ?? "no row"
    );
    return;
  }

  if ((order.tier_choice ?? "draft_pack") !== "draft_pack") {
    console.log(
      `[tier1-trigger] order ${orderId} tier_choice=${order.tier_choice} — not a Tier 1 order, skipping`
    );
    return;
  }

  if (order.status !== "generating") {
    console.log(
      `[tier1-trigger] order ${orderId} status=${order.status} (expected 'generating') — skip`
    );
    return;
  }

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select(
      "id, name, email, one_liner, readiness_card, wizard_answers, ai_extracted"
    )
    .eq("id", order.assessment_id)
    .maybeSingle();

  if (aErr || !assessment) {
    console.error(
      `[tier1-trigger] could not load assessment ${order.assessment_id}:`,
      aErr?.message ?? "no row"
    );
    await stampFailure(orderId, "assessment_load_failed");
    return;
  }

  const cardParsed = ReadinessCardSchema.safeParse(assessment.readiness_card);
  if (!cardParsed.success) {
    console.error(
      `[tier1-trigger] readiness_card invalid for ${order.assessment_id}: ${cardParsed.error.issues[0]?.message ?? "unknown"}`
    );
    await stampFailure(orderId, "readiness_card_invalid");
    return;
  }

  const wizard = (assessment.wizard_answers as WizardAnswers | null) ?? {};
  // Phase 2c Bug — the PDF hero used to render the full one_liner
  // ("A bioresorbable cardiac stent for percutaneous coronary…") with
  // an ellipsis. Derive a short device label preferring the pitch-
  // extract's `device_name`, then a noun-phrase chopped from the curated
  // one-liner, and only finally the raw one_liner / contact name as a
  // last resort.
  const aiRow = assessment.ai_extracted as AiExtractedRow | null;
  const aiFields =
    aiRow && aiRow.status === "complete" ? aiRow.fields : null;
  const productName =
    shortDeviceName(aiFields, (assessment.one_liner as string) || "") ||
    (assessment.name as string) ||
    "Your device";
  const companyName = (assessment.name as string) || "Your company";

  // ── Generate report JSON ─────────────────────────────────
  let report: Awaited<ReturnType<typeof generateReadinessReport>>["report"];
  let costUsd = 0;
  try {
    const result = await generateReadinessReport({
      assessment_id: order.assessment_id,
      company_name: companyName,
      product_name: productName,
      scoped_feature: cardParsed.data.meta.scoped_feature,
      readiness_card: cardParsed.data,
      wizard_answers: wizard,
    });
    report = result.report;
    costUsd = result.cost_usd;
  } catch (err) {
    console.error(
      `[tier1-trigger] generator failed for order ${orderId}:`,
      err instanceof Error ? err.message : String(err)
    );
    await stampFailure(
      orderId,
      `generator_failed: ${err instanceof Error ? err.message : "unknown"}`
    );
    return;
  }

  // ── Persist generator JSON ──────────────────────────────
  // Stored alongside the PDF so the customer-facing "Regenerate PDF"
  // CTA on the StatusPanel can re-render without re-calling Opus.
  // Source of truth for regenerate; failure here aborts the order
  // before we render anything, since regenerate would be impossible.
  const jsonPath = `${orderId}/report.json`;
  const { error: jsonErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .upload(jsonPath, Buffer.from(JSON.stringify(report)), {
      contentType: "application/json",
      upsert: true,
    });
  if (jsonErr) {
    const bucketMissing = /bucket.*not.*found|bucket.*does.*not/i.test(
      jsonErr.message ?? ""
    );
    console.error(
      `[tier1-trigger] report.json upload failed for ${orderId}: ${jsonErr.message}`
    );
    await stampFailure(
      orderId,
      bucketMissing
        ? "storage_bucket_missing_tier1_reports"
        : `storage_json_upload_failed: ${jsonErr.message}`
    );
    return;
  }

  // ── Render PDF ──────────────────────────────────────────
  let pdfBytes: Buffer;
  try {
    const element = React.createElement(ReadinessReportDocument, { report });
    pdfBytes = await renderToBuffer(
      element as unknown as React.ReactElement<DocumentProps>
    );
  } catch (err) {
    console.error(
      `[tier1-trigger] PDF render failed for order ${orderId}:`,
      err instanceof Error ? err.message : String(err)
    );
    await stampFailure(orderId, "pdf_render_failed");
    return;
  }

  // ── Upload + sign ───────────────────────────────────────
  const objectPath = `${orderId}/report.pdf`;
  const { error: upErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .upload(objectPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (upErr) {
    const bucketMissing = /bucket.*not.*found|bucket.*does.*not/i.test(
      upErr.message ?? ""
    );
    console.error(
      `[tier1-trigger] PDF upload failed for ${orderId}: ${upErr.message}`
    );
    await stampFailure(
      orderId,
      bucketMissing
        ? "storage_bucket_missing_tier1_reports"
        : `storage_upload_failed: ${upErr.message}`
    );
    return;
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(TIER1_REPORTS_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

  if (signErr || !signed?.signedUrl) {
    console.error(
      `[tier1-trigger] sign URL failed for ${orderId}: ${signErr?.message ?? "no url"}`
    );
    await stampFailure(orderId, "storage_sign_failed");
    return;
  }

  // ── Finalize: deliver + record email recipient ──────────
  const recipient = (assessment.email as string) ?? null;
  const nowIso = new Date().toISOString();
  await supabase
    .from("tier2_orders")
    .update({
      status: "delivered",
      delivered_at: nowIso,
      updated_at: nowIso,
      draft_pack_pdf_url: signed.signedUrl,
      email_sent_to: recipient,
    })
    .eq("id", orderId)
    .eq("status", "generating");

  const durationS = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[tier1-trigger] delivered in ${durationS}s · cost $${costUsd.toFixed(4)} · ${pdfBytes.length} bytes`
  );

  if (recipient) {
    console.log(
      `[tier1-trigger] would send email: to=${recipient} subject="Your ClearPath Regulatory Readiness Report is ready" body_url=${signed.signedUrl}`
    );
  } else {
    console.warn(
      "[tier1-trigger] no recipient email recorded; skipping notification placeholder"
    );
  }
}

/**
 * Phase 2c — derive a short product label for the PDF report hero.
 * The legacy code used the founder's full one_liner (20–300 chars)
 * which the PDF then truncated mid-sentence with an ellipsis. The
 * hero should display something a regulator-facing reader recognises
 * as a name, not a half-sentence:
 *
 *   "A bioresorbable cardiac stent for…"         (legacy, broken)
 *   →
 *   "Bioresorbable Cardiac Stent"                (target)
 *
 * Source order:
 *   1. Pitch-extract `device_name` — when the deck declared a clean
 *      product label, use it verbatim (proper-noun capitalisation
 *      preserved — e.g. "RetinaFlag DR", "CerviAI").
 *   2. Pitch-extract `intended_use_one_liner` — curated short form,
 *      typically already a good source for noun-phrase extraction.
 *   3. The raw assessment `one_liner` — fallback.
 *
 * The noun-phrase chop strips the leading article ("A"/"An"/"The"),
 * cuts at the first clause-break stop word ("for", "to", "that",
 * "designed", etc.), caps at 5 words, and title-cases the result.
 */
// Extracted to `lib/intake/short-device-name.ts` (Day-5 EOD) — single
// source of truth shared with regen-report-pdf, verify-short-device-
// name, and generate-readiness-report-sample scripts.

async function stampFailure(orderId: string, note: string): Promise<void> {
  // CAS to 'failed' only from 'generating' — never reverse a delivered
  // order, and never re-flip an already-failed one.
  const supabase = getServiceClient();
  await supabase
    .from("tier2_orders")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
      notes: `tier1-gen failed: ${note}`,
    })
    .eq("id", orderId)
    .eq("status", "generating");
}
