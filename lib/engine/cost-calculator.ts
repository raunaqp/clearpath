/**
 * Per-model cost calculator for Anthropic API calls.
 *
 * Single source of truth for cost computation across all engine layers.
 * Replaces lib/engine/cost.ts (Sonnet + Haiku) and lib/engine/opus-cost.ts
 * (Opus 4.7) — both deleted in this commit. The split helpers caused the
 * Opus 4.x pricing bug fixed in commit ca2e0e7; one file = one source.
 *
 * Pricing verified against docs/model-and-cost-policy.md Section 2 (2026-05-06).
 */

import { PostHog } from "posthog-node";

export type ModelKey =
  | "claude-haiku-4-5-20251001"
  | "claude-sonnet-4-6"
  | "claude-opus-4-7";

export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read: number;
  cache_write: number;
};

type Pricing = {
  input: number;
  output: number;
  cache_write: number;
  cache_read: number;
};

// Per-1M token rates. Verified against cost-policy Section 2.
// Add a new entry here when adopting a new model — DO NOT branch the calculator.
const PRICING_PER_MTOK: Record<ModelKey, Pricing> = {
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0,  cache_write: 1.25, cache_read: 0.1 },
  "claude-sonnet-4-6":         { input: 3.0, output: 15.0, cache_write: 3.75, cache_read: 0.3 },
  "claude-opus-4-7":           { input: 5.0, output: 25.0, cache_write: 6.25, cache_read: 0.5 },
};

export function calculateCallCost(model: ModelKey, usage: TokenUsage): number {
  const p = PRICING_PER_MTOK[model];
  if (!p) {
    throw new Error(
      `cost-calculator: no pricing for model "${model}". Add to PRICING_PER_MTOK.`
    );
  }
  return (
    (usage.input_tokens * p.input +
      usage.output_tokens * p.output +
      usage.cache_write * p.cache_write +
      usage.cache_read * p.cache_read) /
    1_000_000
  );
}

/**
 * Telemetry helper — emits a per-call cost event to PostHog. Falls back to
 * console.log when POSTHOG_KEY is missing. DB row write is a separate
 * concern (Story 1.4b will add cost-recorder.ts that writes to the
 * engine_costs table; this helper stays for product analytics).
 */
export async function trackApiCost(props: {
  feature: string;
  model: string;
  usage: TokenUsage;
  cost_usd: number;
  cache_hit: boolean;
}): Promise<void> {
  const key = process.env.POSTHOG_KEY;
  const eventName = "api_cost_tracked";
  const payload = {
    feature: props.feature,
    model: props.model,
    input_tokens: props.usage.input_tokens,
    cache_read: props.usage.cache_read,
    cache_write: props.usage.cache_write,
    output_tokens: props.usage.output_tokens,
    cost_usd: props.cost_usd,
    cache_hit: props.cache_hit,
  };

  if (!key) {
    console.log(`[${eventName}]`, payload);
    return;
  }

  const host = process.env.POSTHOG_HOST || "https://eu.i.posthog.com";
  try {
    const client = new PostHog(key, { host });
    client.capture({
      distinctId: "server",
      event: eventName,
      properties: payload,
    });
    await client.shutdown();
  } catch (err) {
    console.log(`[${eventName}] posthog error`, err);
  }
}
