import { PostHog } from "posthog-node";

export type TokenUsage = {
  input_tokens: number;
  cache_read: number;
  cache_write: number;
  output_tokens: number;
};

const PRICE_PER_MILLION = {
  input: 3.0,
  cache_write: 3.75,
  cache_read: 0.3,
  output: 15.0,
};

export function computeSonnetCost(usage: TokenUsage): number {
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
