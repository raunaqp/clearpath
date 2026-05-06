/**
 * Reusable Draft Pack generator. Used by both the CLI
 * (scripts/generate-draft-pack.ts) and the admin API route
 * (app/api/admin/generate-draft-pack/route.ts).
 *
 * Returns a discriminated-union result instead of throwing — the caller
 * decides what to do on failure (CLI exits non-zero, API route reverts
 * order status and returns 500 with the failure step).
 *
 * Tuned to fit Vercel Hobby's 60s function timeout: typical end-to-end
 * is ~30-40s (Opus dominates).
 */
import React from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getServiceClient } from "@/lib/supabase";
import { generateDraftPackContent } from "@/lib/engine/draft-pack";
import { DraftPackDocument } from "@/lib/pdf/draft-pack-template";
import { renderDraftPackEmail } from "@/lib/email/draft-pack-delivery";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import {
  getRelevantForms,
  type RelevantForm,
} from "@/lib/cdsco/relevant-forms";
import { deriveTRL } from "@/lib/engine/trl";
import { runCompletenessForCard } from "@/lib/completeness/category";
import type { CheckerDocument } from "@/lib/completeness/types";

const DRAFT_PACKS_BUCKET = "draft_packs";
const SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const RESEND_FROM = "Raunaq Pradhan from ClearPath <onboarding@resend.dev>";
const RESEND_REPLY_TO = "raunaq.pradhan@gmail.com";

export type GenerateStep =
  | "fetch_order"
  | "fetch_assessment"
  | "missing_readiness_card"
  | "opus"
  | "render_pdf"
  | "append_forms"
  | "upload"
  | "sign_url"
  | "update_order"
  | "email";

export type GenerateOptions = {
  orderId: string;
  /** When true, skip DB / Storage / email entirely. Returns PDF buffer instead. */
  dryRun?: boolean;
  /** When true, skip the Resend send step (still updates DB). */
  skipEmail?: boolean;
  /** Per-step logger; default no-op. */
  log?: (msg: string) => void;
};

type GenerateOkBase = {
  ok: true;
  orderId: string;
  pageCount: number;
  opusCostUsd: number;
  appendedFormIds: string[];
};

export type GenerateOk =
  | (GenerateOkBase & {
      mode: "live";
      pdfUrl: string;
      emailSent: boolean;
      emailRecipient: string;
    })
  | (GenerateOkBase & { mode: "dryRun"; pdfBuffer: Buffer });

export type GenerateErr = {
  ok: false;
  orderId: string;
  errorStep: GenerateStep;
  error: string;
};

export type GenerateResult = GenerateOk | GenerateErr;

type Tier2OrderRow = {
  id: string;
  status: string;
  assessment_id: string;
  email_sent_to: string | null;
};

type AssessmentRow = {
  id: string;
  name: string;
  email: string;
  one_liner: string;
  url_fetched_content: string | null;
  wizard_answers: Record<string, unknown> | null;
  readiness_card: unknown;
  share_token: string | null;
  uploaded_docs:
    | Array<{
        filename: string;
        sha256: string;
        doc_type?: string | null;
      }>
    | null;
};

type ReadinessCardMeta = { product_name?: string; company_name?: string };

const noop = () => {};

function err(
  orderId: string,
  step: GenerateStep,
  message: string
): GenerateErr {
  return { ok: false, orderId, errorStep: step, error: message };
}

export async function generateDraftPack(
  opts: GenerateOptions
): Promise<GenerateResult> {
  const log = opts.log ?? noop;
  const supabase = getServiceClient();

  log(`▶ Generating Draft Pack for order ${opts.orderId}`);

  // 1. Fetch order
  log(`[1] Fetch order`);
  const { data: order, error: orderErr } = await supabase
    .from("tier2_orders")
    .select("id, status, assessment_id, email_sent_to")
    .eq("id", opts.orderId)
    .maybeSingle<Tier2OrderRow>();
  if (orderErr || !order) {
    return err(
      opts.orderId,
      "fetch_order",
      orderErr?.message ?? "order not found"
    );
  }
  log(`  ✓ status=${order.status}`);

  // 2. Fetch assessment + readiness card
  log(`[2] Fetch assessment + readiness card`);
  const { data: assessment, error: assErr } = await supabase
    .from("assessments")
    .select(
      "id, name, email, one_liner, url_fetched_content, wizard_answers, readiness_card, share_token, uploaded_docs"
    )
    .eq("id", order.assessment_id)
    .maybeSingle<AssessmentRow>();
  if (assErr || !assessment) {
    return err(
      opts.orderId,
      "fetch_assessment",
      assErr?.message ?? "assessment not found"
    );
  }
  if (!assessment.readiness_card) {
    return err(
      opts.orderId,
      "missing_readiness_card",
      "assessment has no readiness_card"
    );
  }

  const cardMeta =
    typeof assessment.readiness_card === "object" &&
    assessment.readiness_card !== null
      ? (assessment.readiness_card as { meta?: ReadinessCardMeta }).meta ?? {}
      : {};
  // Robust productName resolution. Order:
  //   1. card.meta.product_name from synthesizer (preferred)
  //   2. card.meta.company_name fallback
  //   3. First proper-noun phrase from one_liner (heuristic)
  //   4. assessment.name as last resort (e.g. "Demo: Vyuhaa CerviAI")
  //
  // Avoids the "Unnamed product" hole when synthesizer returned empty
  // strings for the meta fields (which it should not, but does sometimes
  // when the URL scrape was sparse).
  function extractFirstProperNoun(text: string): string | null {
    // Look for a 2-3 word capitalized phrase at the start of the one-liner.
    // E.g. "Vyuhaa CerviAI is..." → "Vyuhaa CerviAI"
    const match = text.match(/^([A-Z][A-Za-z0-9-]+(?:\s+[A-Z][A-Za-z0-9-]+){0,2})\b/);
    return match ? match[1].trim() : null;
  }
  const productName =
    cardMeta.product_name?.trim() ||
    cardMeta.company_name?.trim() ||
    extractFirstProperNoun(assessment.one_liner) ||
    assessment.name?.replace(/^Demo:\s*/i, "").trim() ||
    "Your product";

  const cardParsed = ReadinessCardSchema.safeParse(assessment.readiness_card);
  if (!cardParsed.success) {
    log(
      `  ! readiness_card failed schema validation — Section 09 will fall back to placeholder. (${cardParsed.error.issues[0]?.message ?? "unknown"})`
    );
  }
  const validatedCard = cardParsed.success ? cardParsed.data : null;
  log(`  ✓ assessment ${assessment.id} · product="${productName}"`);

  // 3. Opus
  log(`[3] Call Opus for Draft Pack content`);
  let content;
  let opusCostUsd: number;
  try {
    const result = await generateDraftPackContent({
      productName,
      oneLiner: assessment.one_liner,
      urlContent: assessment.url_fetched_content,
      wizardAnswers: assessment.wizard_answers ?? {},
      readinessCard: assessment.readiness_card,
    });
    content = result.content;
    opusCostUsd = result.costUsd;
    log(
      `  ✓ content generated · cost ≈ $${opusCostUsd.toFixed(4)} · CDSCO class=${content.risk_classification.cdsco_class}`
    );
  } catch (e) {
    return err(opts.orderId, "opus", e instanceof Error ? e.message : String(e));
  }

  // 4. Render main PDF
  log(`[4] Render PDF`);
  const generated_date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let mainPdfBuffer: Buffer;
  try {
    // Compute TRL + completeness from the validated card so the Draft Pack
    // and the Risk Card always show consistent numbers.
    //   - TRL: backfilled deterministically when missing (same logic as
    //     app/c/[share_token]/page.tsx). Anchored to SERB / ANRF.
    //   - Completeness: same render-time pattern. Pulls uploaded_docs from
    //     the assessment row + uses readiness dimensions as signal supplement.
    const trlForPack =
      validatedCard?.trl && validatedCard.trl.level !== null
        ? validatedCard.trl
        : validatedCard
          ? deriveTRL(validatedCard) ?? undefined
          : undefined;
    const checkerDocs: CheckerDocument[] = (assessment.uploaded_docs ?? []).map(
      (d, idx) => ({
        id: d.sha256 || `doc-${idx}`,
        filename: d.filename,
        doc_type: d.doc_type ?? null,
      })
    );
    const completenessForPack = validatedCard
      ? runCompletenessForCard(validatedCard, checkerDocs)
      : null;

    // Compute relevant forms once here so:
    //   1) Section 09 in the PDF lists exactly the forms that match the
    //      device profile (no hardcoded MD-7/MD-12/MD-14/MD-22 list)
    //   2) The list and the appended-appendix pages stay consistent
    //      (forms with available=true get appended; downloadable=false
    //      get listed but not appended)
    // Single getRelevantForms() call shared between the template and the
    // append loop below.
    const relevantFormsForPack = validatedCard
      ? getRelevantForms(validatedCard).map((f) => ({
          id: f.id,
          description: f.description,
          available: f.available,
        }))
      : [];

    // `DraftPackDocument` wraps a `<Document>`, but @react-pdf/renderer's
    // type for `renderToBuffer` insists on `ReactElement<DocumentProps>`
    // directly (rejecting a wrapping function-component). The runtime
    // behaviour is fine — cast through `unknown` to satisfy tsc.
    const element = React.createElement(DraftPackDocument, {
      data: {
        product_name: productName,
        generated_date,
        assessment_id: assessment.id,
        share_token: assessment.share_token ?? undefined,
        applicant_name: assessment.name,
        applicant_email: assessment.email,
      },
      content,
      regulations: validatedCard?.regulations,
      trl: trlForPack,
      completeness: completenessForPack,
      relevantForms: relevantFormsForPack,
    });
    mainPdfBuffer = await renderToBuffer(
      element as unknown as React.ReactElement<DocumentProps>
    );
  } catch (e) {
    return err(
      opts.orderId,
      "render_pdf",
      e instanceof Error ? e.message : String(e)
    );
  }
  log(`  ✓ main PDF rendered · ${(mainPdfBuffer.length / 1024).toFixed(0)} KB`);

  // 5. Append blank forms
  log(`[5] Append relevant blank CDSCO forms`);
  const relevant = validatedCard ? getRelevantForms(validatedCard) : [];
  let merged: { buffer: Buffer; pageCount: number; appendedIds: string[] };
  try {
    merged = await appendForms(mainPdfBuffer, relevant, log);
  } catch (e) {
    return err(
      opts.orderId,
      "append_forms",
      e instanceof Error ? e.message : String(e)
    );
  }

  if (opts.dryRun) {
    return {
      ok: true,
      mode: "dryRun",
      orderId: opts.orderId,
      pdfBuffer: merged.buffer,
      pageCount: merged.pageCount,
      opusCostUsd,
      appendedFormIds: merged.appendedIds,
    };
  }

  // 6. Upload PDF
  log(`[6] Upload PDF to Storage`);
  const objectPath = `${order.id}/draft-pack.pdf`;
  const { error: upErr } = await supabase.storage
    .from(DRAFT_PACKS_BUCKET)
    .upload(objectPath, merged.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) {
    return err(opts.orderId, "upload", upErr.message);
  }

  // 7. Signed URL
  const { data: signed, error: signErr } = await supabase.storage
    .from(DRAFT_PACKS_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    return err(
      opts.orderId,
      "sign_url",
      signErr?.message ?? "no URL returned"
    );
  }
  const pdfUrl = signed.signedUrl;
  log(`  ✓ uploaded · signed URL valid 90 days`);

  // 8. Update tier2_orders
  log(`[7] Update tier2_orders`);
  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from("tier2_orders")
    .update({
      status: "delivered",
      delivered_at: now,
      draft_pack_pdf_url: pdfUrl,
      updated_at: now,
    })
    .eq("id", order.id);
  if (updErr) {
    return err(opts.orderId, "update_order", updErr.message);
  }
  log(`  ✓ order ${order.id} marked delivered`);

  // 9. Send email
  log(`[8] Send email via Resend`);
  let emailSent = false;
  const recipient = order.email_sent_to ?? assessment.email;
  if (opts.skipEmail) {
    log(`  - skipped (skipEmail flag)`);
  } else {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      log(
        `  ! RESEND_API_KEY not set — skipping email. Order is delivered but founder must email manually.`
      );
    } else {
      const { subject, text, html } = renderDraftPackEmail({
        name: assessment.name,
        product_name: productName,
        share_token: assessment.share_token ?? "",
        pdf_url: pdfUrl,
        include_resend_banner: true,
      });
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: recipient,
            reply_to: RESEND_REPLY_TO,
            subject,
            text,
            html,
          }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          // Don't fail the whole generation — order is already delivered.
          log(
            `  ! Resend ${res.status}: ${detail.slice(0, 200)} — continuing without email`
          );
        } else {
          emailSent = true;
          log(`  ✓ email sent to ${recipient}`);
        }
      } catch (e) {
        log(
          `  ! Resend network error: ${e instanceof Error ? e.message : e} — continuing without email`
        );
      }
    }
  }

  return {
    ok: true,
    mode: "live",
    orderId: opts.orderId,
    pdfUrl,
    pageCount: merged.pageCount,
    opusCostUsd,
    appendedFormIds: merged.appendedIds,
    emailSent,
    emailRecipient: recipient,
  };
}

async function appendForms(
  mainBytes: Buffer,
  forms: RelevantForm[],
  log: (msg: string) => void
): Promise<{ buffer: Buffer; pageCount: number; appendedIds: string[] }> {
  if (forms.length === 0) {
    log(`  - no relevant forms identified — skipping appendix`);
    const doc = await PDFDocument.load(mainBytes, { ignoreEncryption: true });
    return {
      buffer: mainBytes,
      pageCount: doc.getPageCount(),
      appendedIds: [],
    };
  }

  log(
    `  - ${forms.length} relevant form(s): ${forms.map((f) => f.id).join(", ")}`
  );

  const main = await PDFDocument.load(mainBytes, { ignoreEncryption: true });
  const helvetica = await main.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await main.embedFont(StandardFonts.HelveticaBold);

  let appendixIdx = 0;
  const appendedIds: string[] = [];

  for (const form of forms) {
    if (!form.available || !form.url) {
      log(
        `  - ${form.id}: not in mirror — founder downloads from cdsco.gov.in`
      );
      continue;
    }

    let formBytes: ArrayBuffer;
    try {
      const res = await fetch(form.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      formBytes = await res.arrayBuffer();
    } catch (e) {
      log(
        `  ! ${form.id}: fetch failed — ${e instanceof Error ? e.message : e}. Skipping.`
      );
      continue;
    }

    let formDoc: PDFDocument;
    try {
      formDoc = await PDFDocument.load(formBytes, { ignoreEncryption: true });
    } catch (e) {
      log(
        `  ! ${form.id}: PDF parse failed — ${e instanceof Error ? e.message : e}. Skipping.`
      );
      continue;
    }

    const letter = String.fromCharCode(65 + appendixIdx);
    appendixIdx++;

    const sep = main.addPage([595, 842]);
    sep.drawText(`APPENDIX ${letter}`, {
      x: 56,
      y: 760,
      size: 11,
      font: helveticaBold,
      color: rgb(0.73, 0.46, 0.09),
    });
    sep.drawText(`Blank Form ${form.id}`, {
      x: 56,
      y: 720,
      size: 24,
      font: helveticaBold,
      color: rgb(0.06, 0.43, 0.34),
    });
    sep.drawText(form.description, {
      x: 56,
      y: 690,
      size: 13,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 480,
    });
    sep.drawText("Source: cdsco.gov.in (mirror cached in ClearPath Storage)", {
      x: 56,
      y: 645,
      size: 9,
      font: helvetica,
      color: rgb(0.42, 0.42, 0.42),
    });
    sep.drawText("Why this form applies", {
      x: 56,
      y: 600,
      size: 10,
      font: helveticaBold,
      color: rgb(0.42, 0.42, 0.42),
    });
    sep.drawText(form.reason, {
      x: 56,
      y: 580,
      size: 11,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 480,
      lineHeight: 14,
    });
    sep.drawText("How to use this form", {
      x: 56,
      y: 480,
      size: 10,
      font: helveticaBold,
      color: rgb(0.42, 0.42, 0.42),
    });
    sep.drawText(
      "Fill this form using the drafted content from earlier sections — Intended Use (Section 02), Device Description (Section 03), Risk Classification (Section 04), and Clinical Context (Section 05). Cross-reference your wording so the form, the Device Master File, and any clinical evaluation say the same thing.",
      {
        x: 56,
        y: 460,
        size: 10,
        font: helvetica,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: 480,
        lineHeight: 14,
      }
    );
    sep.drawText(
      "ClearPath · Regulatory Draft Pack — appendix separator. Not legal advice.",
      {
        x: 56,
        y: 40,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6),
      }
    );

    const pageIndices = formDoc.getPageIndices();
    const copied = await main.copyPages(formDoc, pageIndices);
    for (const p of copied) main.addPage(p);

    appendedIds.push(form.id);
    log(
      `  ✓ appendix ${letter}: ${form.id} (${pageIndices.length} pages copied)`
    );
  }

  if (appendedIds.length === 0) {
    log(`  - 0 forms appended (all skipped)`);
    return {
      buffer: mainBytes,
      pageCount: main.getPageCount(),
      appendedIds: [],
    };
  }

  const out = await main.save();
  log(
    `  ✓ merged · ${(out.length / 1024).toFixed(0)} KB · ${main.getPageCount()} pages total`
  );
  return {
    buffer: Buffer.from(out),
    pageCount: main.getPageCount(),
    appendedIds,
  };
}
