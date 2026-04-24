import Anthropic from "@anthropic-ai/sdk";
import { PRE_ROUTER_SYSTEM_PROMPT } from "./system-prompts";
import { computeSonnetCost, trackApiCost, type TokenUsage } from "./cost";

export type PreRouterPdf =
  | { type: "cached"; sha256: string; summary: string }
  | { type: "fresh"; sha256: string; base64: string; filename: string };

export type PreRouterInput = {
  oneLiner: string;
  urlContent: string | null;
  pdfs: PreRouterPdf[];
};

export type PreRouterResult = {
  product_type:
    | "product"
    | "platform"
    | "hardware_software"
    | "export_only"
    | "regulator"
    | "investor"
    | "out_of_scope";
  next_action: "run_wizard" | "run_decomposer" | "reject";
  rejection_reason: string | null;
  rationale: string;
  conflict_detected: boolean;
  conflict_note: string | null;
  pdf_summaries: Array<{ sha256: string; summary: string }>;
  usage: {
    input_tokens: number;
    cache_read: number;
    cache_write: number;
    output_tokens: number;
  };
  cost_usd: number;
  raw_model_response: string;
};

const MODEL = "claude-sonnet-4-6";

type ParsedModelJson = {
  product_type?: unknown;
  next_action?: unknown;
  rejection_reason?: unknown;
  rationale?: unknown;
  conflict_detected?: unknown;
  conflict_note?: unknown;
  pdf_summaries?: unknown;
};

function extractJson(text: string): ParsedModelJson {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("pre-router: no JSON object found in model response");
  }
  try {
    return JSON.parse(match[0]) as ParsedModelJson;
  } catch (err) {
    throw new Error(
      `pre-router: JSON parse failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

const VALID_PRODUCT_TYPES = new Set<PreRouterResult["product_type"]>([
  "product",
  "platform",
  "hardware_software",
  "export_only",
  "regulator",
  "investor",
  "out_of_scope",
]);

const VALID_NEXT_ACTIONS = new Set<PreRouterResult["next_action"]>([
  "run_wizard",
  "run_decomposer",
  "reject",
]);

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function asPdfSummaries(
  v: unknown
): Array<{ sha256: string; summary: string }> {
  if (!Array.isArray(v)) return [];
  const out: Array<{ sha256: string; summary: string }> = [];
  for (const item of v) {
    if (
      item &&
      typeof item === "object" &&
      "sha256" in item &&
      "summary" in item
    ) {
      const rec = item as { sha256: unknown; summary: unknown };
      if (typeof rec.sha256 === "string" && typeof rec.summary === "string") {
        out.push({ sha256: rec.sha256, summary: rec.summary });
      }
    }
  }
  return out;
}

export async function runPreRouter(
  input: PreRouterInput
): Promise<PreRouterResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("pre-router: ANTHROPIC_API_KEY missing");
  }

  const client = new Anthropic({ apiKey });

  const cachedPdfs = input.pdfs.filter(
    (p): p is Extract<PreRouterPdf, { type: "cached" }> => p.type === "cached"
  );
  const freshPdfs = input.pdfs.filter(
    (p): p is Extract<PreRouterPdf, { type: "fresh" }> => p.type === "fresh"
  );

  const cachedSummariesBlock =
    cachedPdfs.length === 0
      ? "N/A"
      : cachedPdfs
          .map(
            (p, i) =>
              `${i + 1}. [cached sha256: ${p.sha256}] ${p.summary}`
          )
          .join("\n");

  const headerText = `One-liner: ${input.oneLiner}
URL content: ${input.urlContent ?? "N/A"}
Cached PDF summaries:
${cachedSummariesBlock}

${freshPdfs.length === 0 ? "No fresh PDFs attached." : `Fresh PDFs (${freshPdfs.length}) follow, each preceded by its sha256 marker.`}`;

  const userContent: Anthropic.MessageParam["content"] = [
    { type: "text", text: headerText },
  ];

  for (const pdf of freshPdfs) {
    userContent.push({
      type: "text",
      text: `[PDF sha256: ${pdf.sha256}] filename: ${pdf.filename}`,
    });
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdf.base64,
      },
    });
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: [
      {
        type: "text",
        text: PRE_ROUTER_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const firstBlock = response.content[0];
  const rawText = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

  const parsed = extractJson(rawText);

  const productType = asString(parsed.product_type) as PreRouterResult["product_type"];
  const nextAction = asString(parsed.next_action) as PreRouterResult["next_action"];
  if (!VALID_PRODUCT_TYPES.has(productType)) {
    throw new Error(`pre-router: invalid product_type "${String(parsed.product_type)}"`);
  }
  if (!VALID_NEXT_ACTIONS.has(nextAction)) {
    throw new Error(`pre-router: invalid next_action "${String(parsed.next_action)}"`);
  }

  const usage: TokenUsage = {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };

  const cost_usd = computeSonnetCost(usage);
  const cache_hit = usage.cache_read > 0;

  await trackApiCost({
    feature: "pre_router",
    model: MODEL,
    usage,
    cost_usd,
    cache_hit,
  });

  return {
    product_type: productType,
    next_action: nextAction,
    rejection_reason: asStringOrNull(parsed.rejection_reason),
    rationale: asString(parsed.rationale),
    conflict_detected: asBool(parsed.conflict_detected),
    conflict_note: asStringOrNull(parsed.conflict_note),
    pdf_summaries: asPdfSummaries(parsed.pdf_summaries),
    usage,
    cost_usd,
    raw_model_response: rawText,
  };
}
