"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CostsDashboardData, EngineCostRow } from "@/lib/admin/costs-data";

// Recharts dynamic-imported to keep customer bundle unaffected (admin-only route).
// `ssr: false` is required because recharts measures DOM during render.
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });

const TEAL = "#0F6E56";
const AMBER = "#BA7517";
const RED = "#993C1D";
const INK = "#0E1411";
const MUTED = "#6B766F";
const BORDER = "#D9D5C8";
const BG_PANEL = "#FFFFFF";
const BG_PAGE = "#F7F6F2";

// Cache effectiveness target indicator (per founder spec):
//   green ≥40, amber 20-40, red <20
function cacheTargetColor(pct: number): string {
  const p = pct * 100;
  if (p >= 40) return TEAL;
  if (p >= 20) return AMBER;
  return RED;
}

function fmtUsd(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 10) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(1)}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return id.slice(0, 8);
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { hour12: false });
}

type SortKey = keyof EngineCostRow | "parent";
type SortDir = "asc" | "desc";

export function CostDashboard({ data }: { data: CostsDashboardData }) {
  return (
    <div
      className="mx-auto p-6 space-y-6"
      style={{ minWidth: 960, maxWidth: 1280, color: INK, backgroundColor: BG_PAGE }}
    >
      <header className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl">Cost dashboard</h1>
        <span className="text-xs" style={{ color: MUTED }}>
          generated {new Date(data.generated_at).toLocaleString("en-IN", { hour12: false })}
        </span>
      </header>

      {/* Top row: today's spend + cache effectiveness side-by-side */}
      <div className="grid grid-cols-2 gap-6">
        <TodaySpendWidget value={data.today_spend_usd} />
        <CacheEffectivenessWidget value={data.cache_effectiveness} />
      </div>

      {/* 30-day trend (full width) */}
      <DailyTrendChart daily={data.daily_30d} />

      {/* Per-model + per-tier side-by-side */}
      <div className="grid grid-cols-2 gap-6">
        <PerModelChart per_model={data.per_model} />
        <CostPerTierTable per_tier={data.cost_per_tier} />
      </div>

      {/* Recent calls (full width) */}
      <RecentCallsTable rows={data.recent_calls} />
    </div>
  );
}

function Panel({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section
      className="rounded-xl p-5 border"
      style={{ backgroundColor: BG_PANEL, borderColor: BORDER }}
    >
      {title && (
        <h2 className="font-serif text-lg mb-1" style={{ color: INK }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-xs mb-3" style={{ color: MUTED }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function TodaySpendWidget({ value }: { value: number }) {
  return (
    <Panel title="Today's spend" subtitle="Sum of cost_usd from today (UTC offset by server clock).">
      <div className="font-serif text-5xl tracking-tight" style={{ color: TEAL }}>
        {fmtUsd(value)}
      </div>
    </Panel>
  );
}

function CacheEffectivenessWidget({
  value,
}: {
  value: CostsDashboardData["cache_effectiveness"];
}) {
  const color = cacheTargetColor(value.pct);
  const targetLabel =
    value.pct >= 0.4
      ? "above 40% target"
      : value.pct >= 0.2
        ? "below 40% target — investigate if persistent"
        : "below 20% — caching ineffective";
  const layersLabel = value.layers_included
    .map((l) => l.replace("_", "-"))
    .join(" + ");
  return (
    <Panel
      title={`Cache effectiveness (${layersLabel})`}
      subtitle={`cache_read / (cache_read + input). Excludes draft-pack — prompt below Sonnet's 1024-token cache minimum (Story 1.4b).`}
    >
      <div className="font-serif text-5xl tracking-tight" style={{ color }}>
        {fmtPct(value.pct)}
      </div>
      <p className="text-xs mt-2" style={{ color: MUTED }}>
        {targetLabel} · cache_read: {value.cache_read_tokens.toLocaleString()} tokens · input: {value.input_tokens.toLocaleString()} tokens
      </p>
    </Panel>
  );
}

function DailyTrendChart({
  daily,
}: {
  daily: CostsDashboardData["daily_30d"];
}) {
  const chartData = daily.map((d) => ({
    date: d.date.slice(5), // MM-DD for chart label
    cost: Number(d.cost_usd.toFixed(4)),
    calls: d.call_count,
  }));
  return (
    <Panel title="30-day spend trend" subtitle="Daily aggregate cost_usd from engine_costs.">
      <div style={{ width: "100%", height: 240 }}>
        {chartData.length === 0 ? (
          <p className="text-sm py-12 text-center" style={{ color: MUTED }}>
            No cost data in the last 30 days.
          </p>
        ) : (
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: MUTED }} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${Number(v ?? 0).toFixed(4)}`} />
              <Line
                type="monotone"
                dataKey="cost"
                stroke={TEAL}
                strokeWidth={2}
                dot={{ r: 3, fill: TEAL }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}

function PerModelChart({
  per_model,
}: {
  per_model: CostsDashboardData["per_model"];
}) {
  const chartData = per_model.map((m) => ({
    // friendly model labels — keep both for tooltip clarity
    model: m.model.replace("claude-", "").replace("-20251001", ""),
    cost: Number(m.cost_usd.toFixed(4)),
    calls: m.call_count,
  }));
  return (
    <Panel title="Per-model breakdown" subtitle="30-day total cost_usd grouped by model.">
      <div style={{ width: "100%", height: 240 }}>
        {chartData.length === 0 ? (
          <p className="text-sm py-12 text-center" style={{ color: MUTED }}>
            No data.
          </p>
        ) : (
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="model" tick={{ fontSize: 11, fill: MUTED }} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${Number(v ?? 0).toFixed(4)}`} />
              <Bar dataKey="cost" fill={TEAL} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}

function CostPerTierTable({
  per_tier,
}: {
  per_tier: CostsDashboardData["cost_per_tier"];
}) {
  return (
    <Panel
      title="Cost per Tier (avg)"
      subtitle={`Average over last ${per_tier.window_days} days. T2/T3 not yet shipped.`}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
            <th className="py-2 font-medium">Tier</th>
            <th className="py-2 font-medium text-right">Avg cost</th>
            <th className="py-2 font-medium text-right">N</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td className="py-2">Tier 0 (free Risk Card)</td>
            <td className="py-2 text-right font-mono">{fmtUsd(per_tier.tier_0.avg_cost_usd)}</td>
            <td className="py-2 text-right" style={{ color: MUTED }}>
              {per_tier.tier_0.assessment_count}
            </td>
          </tr>
          <tr>
            <td className="py-2">Tier 1 (Draft Pack)</td>
            <td className="py-2 text-right font-mono">{fmtUsd(per_tier.tier_1.avg_cost_usd)}</td>
            <td className="py-2 text-right" style={{ color: MUTED }}>
              {per_tier.tier_1.order_count}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs mt-3" style={{ color: MUTED }}>
        T1 = T0 average + draft-pack incremental average. Approximation; exact T1
        per-order would join each order to its underlying assessment.
      </p>
    </Panel>
  );
}

function RecentCallsTable({ rows }: { rows: EngineCostRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      let av: string | number | null;
      let bv: string | number | null;
      if (sortKey === "parent") {
        av = a.assessment_id ?? a.order_id_tier2 ?? "";
        bv = b.assessment_id ?? b.order_id_tier2 ?? "";
      } else {
        av = (a[sortKey as keyof EngineCostRow] ?? "") as string | number;
        bv = (b[sortKey as keyof EngineCostRow] ?? "") as string | number;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, sortKey, sortDir]);

  function sortBy(k: SortKey) {
    if (sortKey === k) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  function arrow(k: SortKey): string {
    if (sortKey !== k) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <Panel
      title="Recent calls (last 50)"
      subtitle="Click column headers to sort. Hover IDs for full UUID."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
              <Th onClick={() => sortBy("created_at")}>When{arrow("created_at")}</Th>
              <Th onClick={() => sortBy("call_layer")}>Layer{arrow("call_layer")}</Th>
              <Th onClick={() => sortBy("model")}>Model{arrow("model")}</Th>
              <Th onClick={() => sortBy("input_tokens")} align="right">In{arrow("input_tokens")}</Th>
              <Th onClick={() => sortBy("output_tokens")} align="right">Out{arrow("output_tokens")}</Th>
              <Th onClick={() => sortBy("cache_read_tokens")} align="right">Cache R{arrow("cache_read_tokens")}</Th>
              <Th onClick={() => sortBy("cache_write_tokens")} align="right">Cache W{arrow("cache_write_tokens")}</Th>
              <Th onClick={() => sortBy("cost_usd")} align="right">Cost{arrow("cost_usd")}</Th>
              <Th onClick={() => sortBy("parent")}>Parent{arrow("parent")}</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center" style={{ color: MUTED }}>
                  No engine_costs rows.
                </td>
              </tr>
            )}
            {sorted.map((r) => {
              const parentId = r.assessment_id ?? r.order_id_tier2;
              const parentLabel = r.assessment_id ? "a:" : r.order_id_tier2 ? "o:" : "";
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td className="py-2 font-mono whitespace-nowrap" style={{ color: MUTED }}>
                    {fmtTime(r.created_at)}
                  </td>
                  <td className="py-2">{r.call_layer}</td>
                  <td className="py-2 font-mono" style={{ color: MUTED }}>
                    {r.model.replace("claude-", "").replace("-20251001", "")}
                  </td>
                  <td className="py-2 text-right font-mono">{r.input_tokens.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">{r.output_tokens.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">{r.cache_read_tokens.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">{r.cache_write_tokens.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">{fmtUsd(Number(r.cost_usd))}</td>
                  <td className="py-2 font-mono" title={parentId ?? ""} style={{ color: MUTED }}>
                    {parentLabel}{shortId(parentId)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Th({
  children,
  onClick,
  align,
}: {
  children: React.ReactNode;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`py-2 font-medium cursor-pointer select-none hover:text-[${INK}] ${align === "right" ? "text-right" : "text-left"}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}
