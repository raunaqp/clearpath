/**
 * CLI: npm run generate-draft-pack -- --order-id <uuid>
 *
 * 1. Loads env from .env.local
 * 2. Reads tier2_orders + assessments + readiness_card
 * 3. Calls Opus for Draft Pack section content
 * 4. Renders PDF via @react-pdf/renderer
 * 5. Uploads to draft_packs bucket; signed URL valid 90 days
 * 6. Updates tier2_orders: status=delivered, delivered_at, draft_pack_pdf_url
 * 7. Sends email via Resend with banner + download link
 *
 * Designed for manual founder runs after admin verifies a payment.
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

import React from "react";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { generateDraftPackContent } from "../lib/engine/draft-pack";
import { DraftPackDocument } from "../lib/pdf/draft-pack-template";
import { renderDraftPackEmail } from "../lib/email/draft-pack-delivery";

const ORDER_ID_FLAG = "--order-id";
const DRY_RUN_FLAG = "--dry-run";
const SKIP_EMAIL_FLAG = "--skip-email";
const DRAFT_PACKS_BUCKET = "draft_packs";
const SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type CliArgs = {
  orderId: string;
  dryRun: boolean;
  skipEmail: boolean;
};

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf(ORDER_ID_FLAG);
  if (idx < 0 || idx === argv.length - 1) {
    console.error(
      `Usage: npm run generate-draft-pack -- ${ORDER_ID_FLAG} <uuid> [${DRY_RUN_FLAG}] [${SKIP_EMAIL_FLAG}]`
    );
    process.exit(2);
  }
  const orderId = argv[idx + 1];
  if (!UUID_RE.test(orderId)) {
    console.error(`Invalid order_id: ${orderId}`);
    process.exit(2);
  }
  return {
    orderId,
    dryRun: argv.includes(DRY_RUN_FLAG),
    skipEmail: argv.includes(SKIP_EMAIL_FLAG),
  };
}

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
};

type ReadinessCardMeta = { product_name?: string; company_name?: string };

function step(n: number, label: string) {
  console.log(`\n[${n}] ${label}`);
}

async function main() {
  const args = parseArgs();
  console.log(`▶ Generating Draft Pack for order ${args.orderId}`);
  if (args.dryRun) console.log("  (dry-run: PDF rendered locally, no DB / Storage / email)");
  if (args.skipEmail) console.log("  (skip-email: no Resend call)");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  step(1, "Fetch order");
  const { data: order, error: orderErr } = await supabase
    .from("tier2_orders")
    .select("id, status, assessment_id, email_sent_to")
    .eq("id", args.orderId)
    .maybeSingle<Tier2OrderRow>();
  if (orderErr || !order) {
    throw new Error(
      `Order not found: ${orderErr?.message ?? "no row"}`
    );
  }
  console.log(`  ✓ order found · status=${order.status}`);
  if (order.status !== "generating" && order.status !== "verified") {
    console.warn(
      `  ! order status is '${order.status}' (expected 'generating' or 'verified'). Continuing anyway.`
    );
  }

  step(2, "Fetch assessment + readiness card");
  const { data: assessment, error: assErr } = await supabase
    .from("assessments")
    .select(
      "id, name, email, one_liner, url_fetched_content, wizard_answers, readiness_card, share_token"
    )
    .eq("id", order.assessment_id)
    .maybeSingle<AssessmentRow>();
  if (assErr || !assessment) {
    throw new Error(`Assessment not found: ${assErr?.message ?? "no row"}`);
  }
  if (!assessment.readiness_card) {
    throw new Error("Assessment has no readiness_card — synthesizer hasn't run.");
  }

  const cardMeta =
    typeof assessment.readiness_card === "object" &&
    assessment.readiness_card !== null
      ? (assessment.readiness_card as { meta?: ReadinessCardMeta }).meta ?? {}
      : {};
  const productName =
    cardMeta.product_name?.trim() ||
    cardMeta.company_name?.trim() ||
    assessment.one_liner.slice(0, 60);
  console.log(`  ✓ assessment ${assessment.id} · product="${productName}"`);

  step(3, "Call Opus for Draft Pack content");
  const { content, costUsd } = await generateDraftPackContent({
    productName,
    oneLiner: assessment.one_liner,
    urlContent: assessment.url_fetched_content,
    wizardAnswers: assessment.wizard_answers ?? {},
    readinessCard: assessment.readiness_card,
  });
  console.log(
    `  ✓ content generated · cost ≈ $${costUsd.toFixed(4)} · CDSCO class=${content.risk_classification.cdsco_class}`
  );

  step(4, "Render PDF");
  const generated_date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pdfBuffer = await renderToBuffer(
    React.createElement(DraftPackDocument, {
      data: {
        product_name: productName,
        generated_date,
        assessment_id: assessment.id,
        share_token: assessment.share_token ?? undefined,
        applicant_name: assessment.name,
        applicant_email: assessment.email,
      },
      content,
    })
  );
  console.log(`  ✓ PDF rendered · ${(pdfBuffer.length / 1024).toFixed(0)} KB`);

  if (args.dryRun) {
    const out = path.resolve(
      process.cwd(),
      `draft-pack-${order.id}.pdf`
    );
    fs.writeFileSync(out, pdfBuffer);
    console.log(`  ✓ dry-run: wrote PDF to ${out}`);
    console.log("\nDone (dry-run). No DB / Storage / email actions taken.");
    return;
  }

  step(5, "Upload PDF to Storage");
  const objectPath = `${order.id}/draft-pack.pdf`;
  const { error: upErr } = await supabase.storage
    .from(DRAFT_PACKS_BUCKET)
    .upload(objectPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) {
    throw new Error(`Storage upload failed: ${upErr.message}`);
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(DRAFT_PACKS_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    throw new Error(
      `Signed URL creation failed: ${signErr?.message ?? "no URL returned"}`
    );
  }
  const pdfUrl = signed.signedUrl;
  console.log(`  ✓ uploaded · signed URL valid 90 days`);

  step(6, "Update tier2_orders");
  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from("tier2_orders")
    .update({
      status: "delivered",
      delivered_at: now,
      draft_pack_pdf_url: pdfUrl,
    })
    .eq("id", order.id);
  if (updErr) {
    throw new Error(`Order update failed: ${updErr.message}`);
  }
  console.log(`  ✓ order ${order.id} marked delivered`);

  step(7, "Send email via Resend");
  if (args.skipEmail) {
    console.log("  - skipped (--skip-email flag)");
  } else {
    const recipient = order.email_sent_to ?? assessment.email;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "  ! RESEND_API_KEY not set — skipping email. Order is delivered but founder must email manually."
      );
    } else {
      const { subject, text, html } = renderDraftPackEmail({
        name: assessment.name,
        product_name: productName,
        share_token: assessment.share_token ?? "",
        pdf_url: pdfUrl,
        include_resend_banner: true,
      });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Raunaq Pradhan from ClearPath <onboarding@resend.dev>",
          to: recipient,
          reply_to: "raunaq.pradhan@gmail.com",
          subject,
          text,
          html,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
      }
      console.log(`  ✓ email sent to ${recipient}`);
    }
  }

  console.log(`\n✓ Draft Pack delivered for order ${order.id}`);
  console.log(`  PDF: ${pdfUrl}`);
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
