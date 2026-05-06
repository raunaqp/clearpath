import { PostHog } from "posthog-node";

export type TokenUsage = {
  input_tokens: number;
  cache_read: number;
  cache_write: number;
  output_tokens: number;
};

const SONNET_PRICE_PER_MILLION = {
  input: 3.0,
  cache_write: 3.75,
  cache_read: 0.3,
  output: 15.0,
};

const HAIKU_PRICE_PER_MILLION = {
  input: 1.0,
  cache_write: 1.25,
  cache_read: 0.1,
  output: 5.0,
};

function compute(
  usage: TokenUsage,
  rates: { input: number; cache_write: number; cache_read: number; output: number }
): number {
  return (
    (usage.input_tokens * rates.input) / 1_000_000 +
    (usage.cache_write * rates.cache_write) / 1_000_000 +
    (usage.cache_read * rates.cache_read) / 1_000_000 +
    (usage.output_tokens * rates.output) / 1_000_000
  );
}

export function computeSonnetCost(usage: TokenUsage): number {
  return compute(usage, SONNET_PRICE_PER_MILLION);
}

export function computeHaikuCost(usage: TokenUsage): number {
  return compute(usage, HAIKU_PRICE_PER_MILLION);
}

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
  const client = new PostHog(key, { host });
  try {
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
