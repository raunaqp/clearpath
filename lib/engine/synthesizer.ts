import Anthropic from "@anthropic-ai/sdk";
import {
  ReadinessCardSchema,
  type ReadinessCard,
} from "@/lib/schemas/readiness-card";
import { SYNTHESIZER_SYSTEM_PROMPT } from "@/lib/engine/synthesizer-system-prompt";
import { softenReadinessCard } from "@/lib/engine/soften-certainty";
import {
  computeOpusCost,
  trackApiCost,
  type OpusUsage,
} from "@/lib/engine/opus-cost";

const MODEL = "claude-opus-4-7";
const MAX_TOKENS = 4000;
const STRICT_SUFFIX =
  "\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.";

export type SynthesizerInput = {
  assessmentId: string;
  oneLiner: string;
  productType: string;
  urlContent: string | null;
  pdfSummaries: Array<{ sha256: string; summary: string }>;
  wizardAnswers: Record<string, unknown>;
  detectedSignals: unknown;
  conflictDetails: unknown | null;
};

export type SynthesizerResult = {
  card: ReadinessCard;
  rawModelResponse: string;
  usage: OpusUsage;
  costUsd: number;
};

function buildUserMessage(input: SynthesizerInput): string {
  return [
    `Assessment ID: ${input.assessmentId}`,
    `Product: ${input.oneLiner}`,
    `Product type: ${input.productType}`,
    `URL content: ${input.urlContent ?? "N/A"}`,
    `PDF summaries: ${JSON.stringify(input.pdfSummaries)}`,
    `Wizard answers: ${JSON.stringify(input.wizardAnswers)}`,
    `Detected signals: ${JSON.stringify(input.detectedSignals)}`,
    `Conflict details: ${JSON.stringify(input.conflictDetails)}`,
    "",
    "Generate the full Tier 0 Readiness Card per the output schema.",
    "",
    "When computing Top 3 gaps:",
    "- If classification is Class B/C/D and no high/medium confidence ISO 13485 detected → include as HIGH gap.",
    "- If classification is Class B/C/D and no high/medium confidence IEC 62304 detected AND product has software → include as HIGH gap.",
    "- If IVD classification and no NABL lab partnership detected → include as HIGH gap.",
    '- If product_type is hardware_software and no facility detected → add to verdict: "Since your product has a hardware component, state FDA approval may also apply depending on your manufacturing setup."',
  ].join("\n");
}

function extractText(response: Anthropic.Message): string {
  const first = response.content[0];
  return first && first.type === "text" ? first.text : "";
}

function stripFences(text: string): string {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

function parseAndValidate(rawText: string): ReadinessCard {
  const cleaned = stripFences(rawText);
  const parsed: unknown = JSON.parse(cleaned);
  return ReadinessCardSchema.parse(parsed);
}

function usageFrom(response: Anthropic.Message): OpusUsage {
  return {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };
}

export async function runSynthesizer(
  input: SynthesizerInput
): Promise<SynthesizerResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("synthesizer: ANTHROPIC_API_KEY missing");
  }
  const client = new Anthropic({ apiKey });

  const userText = buildUserMessage(input);

  // Accumulators across both attempts so we report total cost honestly.
  let totalUsage: OpusUsage = {
    input_tokens: 0,
    cache_read: 0,
    cache_write: 0,
    output_tokens: 0,
  };
  let totalCost = 0;
  let lastRawText = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const systemText =
      SYNTHESIZER_SYSTEM_PROMPT + (attempt === 2 ? STRICT_SUFFIX : "");

    // Note: temperature is deprecated for Opus 4.7 — model uses
    // its own internal sampling. See Anthropic API changelog.
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userText }],
    });

    const rawText = extractText(response);
    lastRawText = rawText;

    const usage = usageFrom(response);
    totalUsage = {
      input_tokens: totalUsage.input_tokens + usage.input_tokens,
      cache_read: totalUsage.cache_read + usage.cache_read,
      cache_write: totalUsage.cache_write + usage.cache_write,
      output_tokens: totalUsage.output_tokens + usage.output_tokens,
    };
    totalCost += computeOpusCost(usage);

    try {
      const card = parseAndValidate(rawText);
      const softened = softenReadinessCard(card);

      await trackApiCost({
        feature: "synthesizer",
        model: MODEL,
        usage: totalUsage,
        cost_usd: totalCost,
        cache_hit: totalUsage.cache_read > 0,
      });

      return {
        card: softened,
        rawModelResponse: rawText,
        usage: totalUsage,
        costUsd: totalCost,
      };
    } catch (err) {
      if (attempt === 2) {
        // Track even on failure so cost telemetry is honest.
        await trackApiCost({
          feature: "synthesizer",
          model: MODEL,
          usage: totalUsage,
          cost_usd: totalCost,
          cache_hit: totalUsage.cache_read > 0,
        });
        throw new Error(
          `synthesizer: JSON/schema validation failed after retry: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
      // attempt 1 failure: loop continues with strict suffix appended
    }
  }

  // Should be unreachable — both attempts either return or throw.
  throw new Error(
    `synthesizer: unreachable code path reached. Last raw text length=${lastRawText.length}`
  );
}
