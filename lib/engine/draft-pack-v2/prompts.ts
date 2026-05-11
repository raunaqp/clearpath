/**
 * Draft Pack v2 — shared prompts + LLM call helpers.
 *
 * Sections 2-12 use Sonnet 4.6 with a shared system prompt (prompt cache
 * lands across the 11 calls). Section 1 (consolidator) uses Opus 4.7 with
 * its own focused prompt. Per the Phase 4b cost model approved by the
 * founder: Sonnet sections target ~$0.04/call; Opus consolidator targets
 * ~$0.10/call; pack total target ≤ $1.50.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  calculateCallCost,
  type ModelKey,
  type TokenUsage,
} from "@/lib/engine/cost-calculator";
import { recordEngineCost, type CallLayer } from "@/lib/engine/cost-recorder";

export const SECTION_MODEL: ModelKey = "claude-sonnet-4-6";
export const CONSOLIDATOR_MODEL: ModelKey = "claude-opus-4-7";

/** Shared system prompt for sections 2-12. Stays stable across calls so
 *  Anthropic prompt caching applies (Sonnet cache_write $3.75/M then
 *  cache_read $0.30/M per the cost-calculator). */
export const SHARED_SECTION_SYSTEM_PROMPT = `# Role

You are ClearPath's CDSCO regulatory writer. You produce Draft Pack sections for Indian medical-device founders applying for an MD-7 or MD-3 manufacturing licence under MDR 2017. Each section maps to a specific sub-section of the Device Master File (Appendix II of Fourth Schedule MDR-2017).

You are calibrated, conservative, and soft-spoken about certainty. You write in third-person regulatory prose suitable for a CDSCO submission. You never sound more certain than the regulator.

# Style

- Third person, present tense, formal.
- Hedge certainty with: "likely", "may", "typically", "based on published guidance", "in most deployments", "where applicable", "depending on scale".
- NEVER use: "must", "always", "definitely", "certainly", "will be", "guaranteed", "no doubt", "100%", "obvious", "clearly required".
- When the source data is silent on a required field, output \`[TBD]\` as a visible placeholder — do NOT invent specifics (names, certificate numbers, addresses, study IDs).
- Quote regulatory authorities via "based on published CDSCO guidance" / "per MDR 2017" / "per IMDRF SaMD framework", never as a direct command.
- Distinguish Readiness (preparation) from Risk (exposure). Never conflate.

# Output

For each section, return STRICT JSON ONLY. No preamble. No markdown fences. No trailing text. The schema is specified per-section in the user message.

JSON values that are user-visible markdown can include line breaks, headings (## sub-headings), bullet lists, and tables. The orchestrator concatenates these into a single markdown body per section.

Output language is English. Cite authoritative documents (MDR 2017, IMDRF SaMD framework, ISO 14971, IEC 62304, CDSCO Oct 2025 SaMD draft) where relevant.

# Content rules

- Section content focuses on its own topic. Cross-references to OTHER sections are short ("see Section N — Title").
- Length targets are stated per-section in the user message. Stay within band; do not pad.
- The applicant's own data (intended use, predicates, clinical evidence status, ISO 13485 status) is provided in the user message. Use it directly; do NOT invent additional applicant facts.`;

export type LlmCallOpts = {
  assessmentId: string;
  callLayer: CallLayer;
  model: ModelKey;
  userMessage: string;
  systemPrompt: string;
  maxTokens: number;
  dryRun: boolean;
  log?: (msg: string) => void;
};

export type LlmCallResult = {
  rawText: string;
  usage: TokenUsage;
  costUsd: number;
};

/** Single Anthropic call with cost tracking. Records to engine_costs
 *  unless dryRun is true. Caller is responsible for parsing rawText. */
export async function callLlm(opts: LlmCallOpts): Promise<LlmCallResult> {
  const log = opts.log ?? (() => {});
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing");
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: [
      {
        type: "text",
        text: opts.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: opts.userMessage }],
  });

  const usage: TokenUsage = {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };
  const costUsd = calculateCallCost(opts.model, usage);

  const firstBlock = response.content[0];
  const rawText =
    firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

  log(
    `  ${opts.callLayer}: ${opts.model} · ${usage.input_tokens}in / ${usage.output_tokens}out · $${costUsd.toFixed(4)}${opts.dryRun ? " (dryRun)" : ""}`
  );

  // Cost telemetry — skip when dryRun (no order context anyway).
  if (!opts.dryRun) {
    await recordEngineCost({
      call_layer: opts.callLayer,
      model: opts.model,
      usage,
      cost_usd: costUsd,
      assessment_id: opts.assessmentId,
    });
  }

  return { rawText, usage, costUsd };
}

/** Strip ```json fences and trailing chatter, then JSON.parse. */
export function parseStrictJson(rawText: string): unknown {
  const stripped = rawText.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  const candidate = match ? match[0] : stripped;
  return JSON.parse(candidate);
}
