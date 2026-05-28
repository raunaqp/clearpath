/**
 * Phase 2c — re-render the ₹499 PDF report for a given assessment ID
 * using the fixed trigger logic (shortDeviceName) so the founder can
 * visually confirm the hero now shows a clean short product label.
 *
 * Output: data/smoke/report-<short-id>.pdf
 *
 * Usage:
 *   npx tsx scripts/regen-report-pdf.ts <assessment-id> [<assessment-id> ...]
 *
 * Or, with no args, runs the two assessments the founder used during
 * the Day 2 re-validation pass:
 *   0be5a3db-7d8a-41f3-869e-c3a8cdaa4ceb (hardware)
 *   c363730c-b13f-4167-bf5c-692a34592202 (SaMD)
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
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY missing");
  process.exit(1);
}

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getServiceClient } from "@/lib/supabase";
import { generateReadinessReport } from "@/lib/engine/readiness-report-v1-generator";
import { ReadinessReportDocument } from "@/lib/pdf/readiness-report-template";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import type { WizardAnswers } from "@/lib/wizard/types";
import type { PitchAiExtracted } from "@/lib/intake/ai-extract";

// Inline copy of shortDeviceName — kept in sync with the trigger.
function shortDeviceName(
  ai: PitchAiExtracted | null,
  oneLiner: string
): string {
  if (ai?.device_name) {
    const cleaned = ai.device_name.trim();
    if (cleaned.length > 0 && cleaned.length <= 60) return cleaned;
  }
  const source = (ai?.intended_use_one_liner ?? "").trim() || oneLiner.trim();
  if (!source) return "";
  const trimmed = source
    .replace(/^(A|An|The)\s+/i, "")
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  const STOP_WORDS =
    /\b(for|to|that|which|designed|intended|used|enabling|enables|enable|powered|by|with|in|when|while|so\s+that|aimed|aims)\b/i;
  const match = trimmed.match(STOP_WORDS);
  let head = match ? trimmed.slice(0, match.index).trim() : trimmed;
  const words = head.split(/\s+/).filter(Boolean);
  if (words.length > 5) head = words.slice(0, 5).join(" ");
  if (!head) return source.slice(0, 40).trim();
  return head
    .split(/\s+/)
    .map((w) => {
      if (!w) return w;
      if (/^[A-Z]{2,}$/.test(w)) return w;
      if (/^[A-Z][a-z]+[A-Z]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

async function regen(assessmentId: string): Promise<void> {
  const sb = getServiceClient();
  const { data: assessment } = await sb
    .from("assessments")
    .select(
      "id, name, email, one_liner, readiness_card, wizard_answers, ai_extracted"
    )
    .eq("id", assessmentId)
    .maybeSingle();
  if (!assessment) {
    console.log(`  ✗ ${assessmentId.slice(0, 8)} — assessment not found`);
    return;
  }

  const cardParsed = ReadinessCardSchema.safeParse(assessment.readiness_card);
  if (!cardParsed.success) {
    console.log(
      `  ✗ ${assessmentId.slice(0, 8)} — invalid card: ${cardParsed.error.issues[0]?.message}`
    );
    return;
  }

  const ai = assessment.ai_extracted as { status?: string; fields?: PitchAiExtracted } | null;
  const aiFields = ai && ai.status === "complete" ? ai.fields ?? null : null;
  const productName =
    shortDeviceName(aiFields, (assessment.one_liner as string) || "") ||
    (assessment.name as string) ||
    "Your device";
  const companyName = (assessment.name as string) || "Your company";

  console.log(`\n=== ${assessmentId.slice(0, 8)} ===`);
  console.log(`  product_name (NEW): ${productName}`);
  console.log(`  raw one_liner: ${(assessment.one_liner as string).slice(0, 80)}…`);

  const wizard = (assessment.wizard_answers as WizardAnswers | null) ?? {};

  const { report, cost_usd } = await generateReadinessReport({
    assessment_id: assessmentId,
    company_name: companyName,
    product_name: productName,
    scoped_feature: cardParsed.data.meta.scoped_feature,
    readiness_card: cardParsed.data,
    wizard_answers: wizard,
  });
  console.log(`  cost: $${cost_usd.toFixed(4)}`);
  console.log(`  report.meta.product_name: ${report.meta.product_name}`);
  console.log(`  report.scorecard.classification_label: ${report.scorecard.classification_label}`);
  console.log(`  report.pathway.forms: ${report.pathway.forms.join(", ")}`);

  const buffer = await renderToBuffer(
    React.createElement(ReadinessReportDocument, { report })
  );

  const outDir = path.resolve(process.cwd(), "data/smoke");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${assessmentId.slice(0, 8)}.pdf`);
  fs.writeFileSync(outPath, buffer);
  console.log(`  wrote ${outPath} (${buffer.length} bytes)`);
}

const argv = process.argv.slice(2);
const ids =
  argv.length > 0
    ? argv
    : [
        "0be5a3db-7d8a-41f3-869e-c3a8cdaa4ceb",
        "c363730c-b13f-4167-bf5c-692a34592202",
      ];

(async () => {
  for (const id of ids) {
    await regen(id);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
