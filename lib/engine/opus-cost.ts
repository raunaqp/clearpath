import { PostHog } from "posthog-node";

export type OpusUsage = {
  input_tokens: number;
  cache_read: number;
  cache_write: number;
  output_tokens: number;
};

/**
 * Per-1M token rates for Claude Opus 4.7.
 * Verified against docs/model-and-cost-policy.md Section 2 (2026-05-06).
 * Was previously holding Opus 4.x estimates (3x higher); corrected
 * 2026-05-07 — historical telemetry pre-correction is unreliable for
 * Opus calls. See docs/sprint-recaps/sprint-1.md "cost telemetry note".
 */
const PRICE_PER_MILLION = {
  input: 5.0,
  cache_write: 6.25,
  cache_read: 0.5,
  output: 25.0,
} as const;

export function computeOpusCost(usage: OpusUsage): number {
  return (
    (usage.input_tokens * PRICE_PER_MILLION.input) / 1_000_000 +
    (usage.cache_write * PRICE_PER_MILLION.cache_write) / 1_000_000 +
    (usage.cache_read * PRICE_PER_MILLION.cache_read) / 1_000_000 +
    (usage.output_tokens * PRICE_PER_MILLION.output) / 1_000_000
  );
}

export async function trackApiCost(props: {
  feature: string;
  model: string;
  usage: OpusUsage;
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
