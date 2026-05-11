/**
 * Pitch-deck AI extraction (Sprint 2 Story 2.5 Phase 2).
 *
 * Single Opus 4.7 call that pulls structured fields out of a pitch deck
 * (sent as PDF base64 via Anthropic's `document` content block — matching
 * the existing pre-router pattern in lib/engine/pre-router.ts). Output
 * pre-fills:
 *   - Tier A wizard (Q1–Q7 — applicant reviews + edits in the wizard)
 *   - Tier B Draft Pack wizard (B1–B6 + C1/C2 — Phase 3 wires this)
 *   - Section 9 Labeling (company info — Phase 4b reads from ai_extracted)
 *
 * Storage: assessments.ai_extracted (jsonb). Single cache slot per
 * assessment, keyed on source_sha256 — re-uploading the same PDF skips
 * extraction; uploading a different PDF overwrites with a fresh extract.
 *
 * Status field drives the wizard UX (Decision 3 refinement):
 *   - "pending"  — extraction in progress; wizard renders without prefill
 *   - "complete" — extraction done; wizard applies prefill suggestions
 *   - "failed"   — extraction errored; wizard renders without prefill
 *   - "skipped"  — no pitch_deck doc_type uploaded
 *
 * Cost tracking: logs to engine_costs via recordEngineCost with the new
 * "pitch_extraction" call_layer. A token-budget guard logs a warning
 * (no failure) when a single call exceeds USD 0.08.
 *
 * Failure modes are non-blocking — the caller (intake route) catches and
 * the row stays at 'pending' or moves to 'failed'. The wizard handles
 * either gracefully.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { downloadPdfAsBase64 } from "@/lib/engine/download-pdf";
import {
  calculateCallCost,
  type ModelKey,
  type TokenUsage,
} from "@/lib/engine/cost-calculator";
import { recordEngineCost } from "@/lib/engine/cost-recorder";
import { PITCH_EXTRACT_SYSTEM_PROMPT } from "@/lib/intake/pitch-extract-prompt";

const MODEL: ModelKey = "claude-opus-4-7";
const MAX_TOKENS = 1200;
const COST_BUDGET_USD = 0.08;

export const PitchAiExtractedSchema = z.object({
  device_name: z.string().min(1).max(160).nullable(),
  intended_use_one_liner: z.string().min(1).max(500).nullable(),
  suggested_classification: z
    .enum(["A", "B", "C", "D", "unknown"])
    .nullable(),
  suggested_wizard_answers: z.object({
    intended_use: z.string().nullable(),
    device_class: z
      .enum([
        "class_a_b",
        "class_c_d",
        "samd_class_a_b",
        "samd_class_c_d",
        "wellness",
      ])
      .nullable(),
    ai_ml: z.enum(["none", "static", "adaptive"]).nullable(),
    data_sensitivity: z
      .enum(["none", "deidentified", "identifiable"])
      .nullable(),
    target_market: z
      .array(z.enum(["india", "us", "eu", "other"]))
      .default([]),
  }),
  company: z
    .object({
      legal_name: z.string().max(200).nullable().optional(),
      constitution: z.string().max(80).nullable().optional(),
      cin: z.string().max(60).nullable().optional(),
      registered_address: z.string().max(400).nullable().optional(),
      manufacturing_address: z.string().max(400).nullable().optional(),
      founded_year: z.string().max(8).nullable().optional(),
      team_size: z.string().max(20).nullable().optional(),
    })
    .optional(),
  product_meta: z
    .object({
      model_number: z.string().max(80).nullable().optional(),
      sterile: z.string().max(40).nullable().optional(),
      patient_population: z.string().max(200).nullable().optional(),
      user_population: z.string().max(200).nullable().optional(),
      setting_of_use: z.string().max(200).nullable().optional(),
    })
    .optional(),
  // Story 2.5 Phase 3.5 — INV-2 fix: extract regulatory signals that map
  // directly to Tier B B5 (clinical evidence status) + B6 (ISO 13485).
  regulatory_signals: z
    .object({
      iso_13485_status: z
        .enum(["certified", "in_progress", "not_started", "not_applicable"])
        .nullable()
        .optional(),
      clinical_evidence_level: z
        .enum(["none", "pilot_data", "published_study", "multi_center_trial"])
        .nullable()
        .optional(),
    })
    .optional(),
  confidence: z.enum(["high", "medium", "low"]),
  notes: z.string().max(500).optional(),
});

export type PitchAiExtracted = z.infer<typeof PitchAiExtractedSchema>;

export type AiExtractedStatus = "pending" | "complete" | "failed" | "skipped";

export type AiExtractedRow = {
  status: AiExtractedStatus;
  source_sha256: string | null;
  source_filename: string | null;
  /** Populated when status === "complete". */
  fields: PitchAiExtracted | null;
  /** Populated on success only. */
  cost_usd: number | null;
  duration_ms: number | null;
  /** Populated on failure only. */
  error: string | null;
  started_at: string;
  completed_at: string | null;
};

/** Build the persistent shape we write to assessments.ai_extracted. */
export function buildPendingRow(args: {
  source_sha256: string;
  source_filename: string;
}): AiExtractedRow {
  return {
    status: "pending",
    source_sha256: args.source_sha256,
    source_filename: args.source_filename,
    fields: null,
    cost_usd: null,
    duration_ms: null,
    error: null,
    started_at: new Date().toISOString(),
    completed_at: null,
  };
}

export function buildSkippedRow(): AiExtractedRow {
  const now = new Date().toISOString();
  return {
    status: "skipped",
    source_sha256: null,
    source_filename: null,
    fields: null,
    cost_usd: null,
    duration_ms: null,
    error: null,
    started_at: now,
    completed_at: now,
  };
}

function stripFences(text: string): string {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

function buildIntakeContext(args: {
  oneLiner: string;
  filename: string;
}): string {
  return [
    "Intake one-liner (provided by applicant on the form):",
    `- Description: ${args.oneLiner}`,
    "",
    `Pitch deck filename: ${args.filename}`,
    "",
    "The PDF document is attached. Extract per the JSON schema above.",
  ].join("\n");
}

async function persistRow(
  assessmentId: string,
  row: AiExtractedRow
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("assessments")
    .update({
      ai_extracted: row,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);
  if (error) {
    console.error(
      "[ai-extract] persistRow failed",
      assessmentId,
      row.status,
      error.message
    );
  }
}

export type RunPitchExtractionInput = {
  assessmentId: string;
  oneLiner: string;
  pitchDeck: {
    sha256: string;
    storage_path: string;
    filename: string;
  };
};

/**
 * Async, fire-and-forget extractor. Call without awaiting from the
 * intake route — failures are caught and persisted to ai_extracted.error.
 *
 * Caller responsibility: write a 'pending' row BEFORE calling this so
 * the wizard never sees a missing column when extraction is in flight.
 */
export async function runPitchExtraction(
  input: RunPitchExtractionInput
): Promise<void> {
  const startedAt = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await persistRow(input.assessmentId, {
      status: "failed",
      source_sha256: input.pitchDeck.sha256,
      source_filename: input.pitchDeck.filename,
      fields: null,
      cost_usd: null,
      duration_ms: null,
      error: "ANTHROPIC_API_KEY missing",
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
    });
    return;
  }

  let pdfBase64: string;
  try {
    pdfBase64 = await downloadPdfAsBase64(input.pitchDeck.storage_path);
  } catch (err) {
    await persistRow(input.assessmentId, {
      status: "failed",
      source_sha256: input.pitchDeck.sha256,
      source_filename: input.pitchDeck.filename,
      fields: null,
      cost_usd: null,
      duration_ms: null,
      error: `download failed: ${err instanceof Error ? err.message : String(err)}`,
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
    });
    return;
  }

  const client = new Anthropic({ apiKey });
  const intakeText = buildIntakeContext({
    oneLiner: input.oneLiner,
    filename: input.pitchDeck.filename,
  });

  const userContent: Anthropic.MessageParam["content"] = [
    { type: "text", text: intakeText },
    {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdfBase64,
      },
    },
  ];

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: PITCH_EXTRACT_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
    });
  } catch (err) {
    await persistRow(input.assessmentId, {
      status: "failed",
      source_sha256: input.pitchDeck.sha256,
      source_filename: input.pitchDeck.filename,
      fields: null,
      cost_usd: null,
      duration_ms: Date.now() - startedAt,
      error: `Opus call failed: ${err instanceof Error ? err.message : String(err)}`,
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
    });
    return;
  }

  const usage: TokenUsage = {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };
  const cost = calculateCallCost(MODEL, usage);
  const durationMs = Date.now() - startedAt;

  // Token-budget guard — log warning if a single call blows past the soft cap.
  if (cost > COST_BUDGET_USD) {
    console.warn(
      `[ai-extract] cost USD ${cost.toFixed(4)} exceeded budget ${COST_BUDGET_USD} for assessment ${input.assessmentId} (input=${usage.input_tokens}, output=${usage.output_tokens})`
    );
  }

  // Cost tracking goes through regardless of parse success — honest telemetry.
  await recordEngineCost({
    call_layer: "pitch_extraction",
    model: MODEL,
    usage,
    cost_usd: cost,
    assessment_id: input.assessmentId,
  });

  const firstBlock = response.content[0];
  const rawText =
    firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

  let parsedFields: PitchAiExtracted;
  try {
    const cleaned = stripFences(rawText);
    const parsed = JSON.parse(cleaned);
    parsedFields = PitchAiExtractedSchema.parse(parsed);
  } catch (err) {
    await persistRow(input.assessmentId, {
      status: "failed",
      source_sha256: input.pitchDeck.sha256,
      source_filename: input.pitchDeck.filename,
      fields: null,
      cost_usd: cost,
      duration_ms: durationMs,
      error: `JSON/schema parse failed: ${err instanceof Error ? err.message : String(err)}`,
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
    });
    return;
  }

  await persistRow(input.assessmentId, {
    status: "complete",
    source_sha256: input.pitchDeck.sha256,
    source_filename: input.pitchDeck.filename,
    fields: parsedFields,
    cost_usd: cost,
    duration_ms: durationMs,
    error: null,
    started_at: new Date(startedAt).toISOString(),
    completed_at: new Date().toISOString(),
  });
}

/**
 * Pick the pitch_deck file (if any) from an uploaded_docs array.
 * Returns the first match by spec — logs a warning if multiple are present.
 */
export function findPitchDeck(
  uploadedDocs: Array<{
    sha256?: string | null;
    storage_path?: string | null;
    filename?: string | null;
    doc_type?: string | null;
  }> | null | undefined
): { sha256: string; storage_path: string; filename: string } | null {
  if (!uploadedDocs || uploadedDocs.length === 0) return null;
  const matches = uploadedDocs.filter((d) => d?.doc_type === "pitch_deck");
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.warn(
      `[ai-extract] multiple pitch_deck uploads (${matches.length}); using the first`
    );
  }
  const m = matches[0];
  if (!m.sha256 || !m.storage_path || !m.filename) {
    console.warn(
      "[ai-extract] pitch_deck doc missing sha256/storage_path/filename — skipping"
    );
    return null;
  }
  return {
    sha256: m.sha256,
    storage_path: m.storage_path,
    filename: m.filename,
  };
}
