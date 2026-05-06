/**
 * Shared cost-dashboard data fetcher for /admin/costs.
 *
 * Single SQL implementation, consumed by both:
 *   - app/admin/costs/page.tsx       (server-renders initial dashboard)
 *   - app/api/admin/costs/route.ts   (refresh / programmatic access)
 *
 * Aggregations run in JS (not SQL GROUP BY) — at low admin-page traffic
 * volumes (admin route, basic-auth gated), grouping ~3K rows/30d in
 * TypeScript is faster to maintain than a stored procedure or a
 * PostgREST aggregate query. Revisit if engine_costs > 100K rows.
 *
 * Six widgets, six conceptual aggregations:
 *   1. Today's spend (sum where created_at >= today midnight)
 *   2. 30-day daily trend (group by date, sum)
 *   3. Per-model breakdown (group by model, sum)
 *   4. Cache effectiveness — pre_router + synth ONLY (excludes draft-pack
 *      per Story 1.4b: prompt below Sonnet's 1024-token cache minimum)
 *   5. Recent 50 calls (no time filter — separate query)
 *   6. Cost per Tier (T0 / T1) — 30-day rolling window per founder spec
 */

import { getServiceClient } from "@/lib/supabase";

export type CallLayer = "pre_router" | "synthesizer" | "draft_pack" | "form_fill";

export type EngineCostRow = {
  id: string;
  assessment_id: string | null;
  order_id_tier2: string | null;
  call_layer: CallLayer;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: number;
  created_at: string;
};

export type CostsDashboardData = {
  today_spend_usd: number;
  daily_30d: Array<{ date: string; cost_usd: number; call_count: number }>;
  per_model: Array<{ model: string; cost_usd: number; call_count: number }>;
  cache_effectiveness: {
    cache_read_tokens: number;
    input_tokens: number;
    pct: number; // cache_read / (cache_read + input), pre_router + synth ONLY
    layers_included: CallLayer[];
  };
  recent_calls: EngineCostRow[]; // last 50, sorted by created_at desc
  cost_per_tier: {
    tier_0: { avg_cost_usd: number; assessment_count: number };
    tier_1: { avg_cost_usd: number; order_count: number };
    window_days: 30;
  };
  generated_at: string;
};

const CACHE_LAYERS: CallLayer[] = ["pre_router", "synthesizer"];

function todayMidnightIso(): string {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return midnight.toISOString();
}

function thirtyDaysAgoIso(): string {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

function dateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export async function fetchCostsData(): Promise<CostsDashboardData> {
  const supabase = getServiceClient();
  const since30d = thirtyDaysAgoIso();
  const sinceToday = todayMidnightIso();

  // Two parallel fetches: 30-day window for widgets 1-4 + 6, and last-50
  // for widget 5. Recent_calls is unbounded by time so it can include
  // records older than 30 days if the engine has been quiet.
  const [last30dResult, recent50Result] = await Promise.all([
    supabase
      .from("engine_costs")
      .select(
        "id, assessment_id, order_id_tier2, call_layer, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, created_at"
      )
      .gte("created_at", since30d)
      .order("created_at", { ascending: false }),
    supabase
      .from("engine_costs")
      .select(
        "id, assessment_id, order_id_tier2, call_layer, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (last30dResult.error) {
    throw new Error(
      `costs-data: 30d fetch failed: ${last30dResult.error.message}`
    );
  }
  if (recent50Result.error) {
    throw new Error(
      `costs-data: recent-50 fetch failed: ${recent50Result.error.message}`
    );
  }

  const rows30d = (last30dResult.data ?? []) as EngineCostRow[];
  const recent50 = (recent50Result.data ?? []) as EngineCostRow[];

  // Widget 1: Today's spend (sum cost_usd where created_at >= today midnight)
  const today_spend_usd = rows30d
    .filter((r) => r.created_at >= sinceToday)
    .reduce((s, r) => s + Number(r.cost_usd), 0);

  // Widget 2: 30-day daily trend (group by YYYY-MM-DD)
  const dailyMap = new Map<string, { cost_usd: number; call_count: number }>();
  for (const r of rows30d) {
    const k = dateKey(r.created_at);
    const existing = dailyMap.get(k) ?? { cost_usd: 0, call_count: 0 };
    existing.cost_usd += Number(r.cost_usd);
    existing.call_count += 1;
    dailyMap.set(k, existing);
  }
  const daily_30d = Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, cost_usd: v.cost_usd, call_count: v.call_count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  // Widget 3: Per-model breakdown (group by model)
  const modelMap = new Map<string, { cost_usd: number; call_count: number }>();
  for (const r of rows30d) {
    const existing = modelMap.get(r.model) ?? { cost_usd: 0, call_count: 0 };
    existing.cost_usd += Number(r.cost_usd);
    existing.call_count += 1;
    modelMap.set(r.model, existing);
  }
  const per_model = Array.from(modelMap.entries())
    .map(([model, v]) => ({ model, cost_usd: v.cost_usd, call_count: v.call_count }))
    .sort((a, b) => b.cost_usd - a.cost_usd);

  // Widget 4: Cache effectiveness — pre_router + synth ONLY (excludes draft-pack)
  let cacheRead = 0;
  let inputTokens = 0;
  for (const r of rows30d) {
    if (!CACHE_LAYERS.includes(r.call_layer)) continue;
    cacheRead += r.cache_read_tokens;
    inputTokens += r.input_tokens;
  }
  const denom = cacheRead + inputTokens;
  const cachePct = denom === 0 ? 0 : cacheRead / denom;

  // Widget 5: Recent 50 (already sorted desc, already limited)
  const recent_calls = recent50;

  // Widget 6: Cost per Tier — 30-day rolling
  // T0 = pre_router + synthesizer cost grouped by assessment_id, then averaged
  const t0AssessmentTotals = new Map<string, number>();
  for (const r of rows30d) {
    if (r.call_layer !== "pre_router" && r.call_layer !== "synthesizer") continue;
    if (!r.assessment_id) continue;
    t0AssessmentTotals.set(
      r.assessment_id,
      (t0AssessmentTotals.get(r.assessment_id) ?? 0) + Number(r.cost_usd)
    );
  }
  const t0Sum = Array.from(t0AssessmentTotals.values()).reduce((s, v) => s + v, 0);
  const t0Count = t0AssessmentTotals.size;
  const t0Avg = t0Count === 0 ? 0 : t0Sum / t0Count;

  // T1 incremental = draft_pack cost grouped by order_id_tier2
  const t1OrderTotals = new Map<string, number>();
  for (const r of rows30d) {
    if (r.call_layer !== "draft_pack") continue;
    if (!r.order_id_tier2) continue;
    t1OrderTotals.set(
      r.order_id_tier2,
      (t1OrderTotals.get(r.order_id_tier2) ?? 0) + Number(r.cost_usd)
    );
  }
  const t1IncrementalSum = Array.from(t1OrderTotals.values()).reduce((s, v) => s + v, 0);
  const t1OrderCount = t1OrderTotals.size;
  const t1IncrementalAvg = t1OrderCount === 0 ? 0 : t1IncrementalSum / t1OrderCount;
  // T1 total = T0 average (per assessment) + T1 incremental average (per draft pack).
  // Approximation: assumes the average order's underlying assessment cost ~= T0 average.
  // Exact would require joining each order to its assessment_id, then averaging combined cost.
  // For dashboard purposes this is acceptable; revisit if accuracy matters.
  const t1Avg = t0Avg + t1IncrementalAvg;

  return {
    today_spend_usd,
    daily_30d,
    per_model,
    cache_effectiveness: {
      cache_read_tokens: cacheRead,
      input_tokens: inputTokens,
      pct: cachePct,
      layers_included: CACHE_LAYERS,
    },
    recent_calls,
    cost_per_tier: {
      tier_0: { avg_cost_usd: t0Avg, assessment_count: t0Count },
      tier_1: { avg_cost_usd: t1Avg, order_count: t1OrderCount },
      window_days: 30,
    },
    generated_at: new Date().toISOString(),
  };
}
