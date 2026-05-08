/**
 * recon-50 resume helper.
 *
 * If a `recon-50.ts` run crashes mid-poll due to a network blip (the original
 * Story 1.3.5 v4 run hit ENOTFOUND on api.anthropic.com during a synth poll),
 * the batches at Anthropic are still processing — only local visibility is
 * lost. This script picks up from the existing batch IDs and produces the
 * same artifacts as a normal `recon-50.ts` run.
 *
 * Run:
 *   npx tsx scripts/recon-50-resume.ts <tag> <pre_router_batch_id> <synth_batch_id> [comma_case_ids]
 *
 * Example (the one we used to recover Story 1.3.5 v4):
 *   npx tsx scripts/recon-50-resume.ts \
 *     targeted-v4 \
 *     msgbatch_019UFN4D7kfmWAaENQtWdjQ3 \
 *     msgbatch_01JLTkUVT4WSz9WhSBNQDFA3 \
 *     CP-045,CP-001,CP-016,CP-021,CP-017,CP-024,CP-046,CP-020,CP-019
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { ReadinessCardSchema } from "../lib/schemas/readiness-card";

// ---- env ----
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY missing.");
  process.exit(1);
}

const HAIKU = "claude-haiku-4-5-20251001";
const OPUS = "claude-opus-4-7";

type Pricing = { input: number; output: number; cache_write: number; cache_read: number };
const BATCH_PRICING: Record<string, Pricing> = {
  [HAIKU]: { input: 0.5, output: 2.5, cache_write: 0.625, cache_read: 0.05 },
  [OPUS]: { input: 2.5, output: 12.5, cache_write: 3.125, cache_read: 0.25 },
};

type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_read: number;
  cache_write: number;
};

const emptyUsage = (): Usage => ({
  input_tokens: 0,
  output_tokens: 0,
  cache_read: 0,
  cache_write: 0,
});

const addUsage = (a: Usage, b: Usage): Usage => ({
  input_tokens: a.input_tokens + b.input_tokens,
  output_tokens: a.output_tokens + b.output_tokens,
  cache_read: a.cache_read + b.cache_read,
  cache_write: a.cache_write + b.cache_write,
});

function costOf(model: string, u: Usage): number {
  const p = BATCH_PRICING[model];
  return (
    (u.input_tokens * p.input +
      u.output_tokens * p.output +
      u.cache_write * p.cache_write +
      u.cache_read * p.cache_read) /
    1_000_000
  );
}

const usageFromMessage = (m: Anthropic.Messages.Message): Usage => ({
  input_tokens: m.usage.input_tokens,
  output_tokens: m.usage.output_tokens,
  cache_read: m.usage.cache_read_input_tokens ?? 0,
  cache_write: m.usage.cache_creation_input_tokens ?? 0,
});

const stripJson = (text: string): string | null => {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  return m ? m[0] : null;
};

const extractText = (m: Anthropic.Messages.Message): string => {
  const f = m.content[0];
  return f && f.type === "text" ? f.text : "";
};

const client = new Anthropic();

async function pollUntilEnded(
  label: string,
  batchId: string
): Promise<Anthropic.Messages.Batches.MessageBatch> {
  let cur = await client.messages.batches.retrieve(batchId);
  while (cur.processing_status !== "ended") {
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      cur = await client.messages.batches.retrieve(batchId);
    } catch (e) {
      console.warn(`[batch:${label}] poll retry after error:`, e instanceof Error ? e.message : e);
      continue;
    }
    const c = cur.request_counts;
    console.log(
      `[batch:${label}] status=${cur.processing_status} succ=${c.succeeded} proc=${c.processing} err=${c.errored}`
    );
  }
  return cur;
}

async function fetchBatchResults(
  batchId: string
): Promise<Map<string, Anthropic.Messages.Batches.MessageBatchIndividualResponse>> {
  const map = new Map<string, Anthropic.Messages.Batches.MessageBatchIndividualResponse>();
  const decoder = await client.messages.batches.results(batchId);
  for await (const row of decoder) map.set(row.custom_id, row);
  return map;
}

type CalibrationCase = {
  case_id: string;
  product_name: string;
  one_liner: string;
  expected_cdsco_class: "A" | "B" | "C" | "D" | null;
  or_acceptable: ("A" | "B" | "C" | "D" | null)[];
  rationale: string;
  [k: string]: unknown;
};

async function main() {
  const tag = process.argv[2];
  const preBatchId = process.argv[3];
  const synthBatchId = process.argv[4];
  const caseFilterArg = process.argv[5];
  if (!tag || !preBatchId || !synthBatchId) {
    console.error("Usage: recon-50-resume.ts <tag> <pre_batch_id> <synth_batch_id> [case_ids]");
    process.exit(1);
  }
  const suffix = `-${tag}`;
  const caseFilter = caseFilterArg
    ? new Set(caseFilterArg.split(",").map((s) => s.trim()).filter(Boolean))
    : null;

  const calibPath = path.resolve(
    process.cwd(),
    "data/calibration/clearpath_synthetic_50_full_schema_v2_1.json"
  );
  const fullCalib = JSON.parse(fs.readFileSync(calibPath, "utf8")) as {
    cases: CalibrationCase[];
  };
  const cases = caseFilter
    ? fullCalib.cases.filter((c) => caseFilter.has(c.case_id))
    : fullCalib.cases;
  console.log(`[resume] tag=${tag} cases=${cases.length}`);

  // ---- pre-router ----
  console.log(`[resume] polling pre-router batch ${preBatchId}…`);
  const preBatch = await pollUntilEnded("pre-router", preBatchId);
  if (preBatch.request_counts.errored > 0) {
    console.warn(`[resume] pre-router has ${preBatch.request_counts.errored} errored — proceeding anyway`);
  }
  const preResults = await fetchBatchResults(preBatchId);

  type PrePerCase = {
    ok: boolean;
    parse_ok: boolean;
    product_type: string | null;
    next_action: string | null;
    detected_signals: unknown;
    conflict_details: unknown;
    cost_usd: number;
    usage: Usage;
    error?: string;
    raw?: string;
  };
  const pre = new Map<string, PrePerCase>();
  for (const c of cases) {
    const r = preResults.get(c.case_id);
    if (!r) {
      pre.set(c.case_id, { ok: false, parse_ok: false, product_type: null, next_action: null, detected_signals: null, conflict_details: null, cost_usd: 0, usage: emptyUsage(), error: "no row" });
      continue;
    }
    if (r.result.type !== "succeeded") {
      pre.set(c.case_id, { ok: false, parse_ok: false, product_type: null, next_action: null, detected_signals: null, conflict_details: null, cost_usd: 0, usage: emptyUsage(), error: `type=${r.result.type}` });
      continue;
    }
    const usage = usageFromMessage(r.result.message);
    const cost = costOf(HAIKU, usage);
    const text = extractText(r.result.message);
    const json = stripJson(text);
    let parsed: Record<string, unknown> | null = null;
    let parse_ok = false;
    if (json) { try { parsed = JSON.parse(json); parse_ok = true; } catch {} }
    pre.set(c.case_id, {
      ok: true,
      parse_ok,
      product_type: (parsed?.product_type as string) ?? null,
      next_action: (parsed?.next_action as string) ?? null,
      detected_signals: parsed?.detected_signals ?? {},
      conflict_details: parsed?.conflict_details ?? null,
      cost_usd: cost,
      usage,
      raw: parse_ok ? undefined : text,
    });
  }

  // ---- synth ----
  console.log(`[resume] polling synth batch ${synthBatchId}…`);
  await pollUntilEnded("synth", synthBatchId);
  const synthResults = await fetchBatchResults(synthBatchId);

  type SynthPerCase = {
    ok: boolean;
    parse_ok: boolean;
    predicted_cdsco_class: string | null;
    rationale_string: string | null;
    trl_level: number | null;
    trl_stage: string | null;
    trl_track: string | null;
    cost_usd: number;
    usage: Usage;
    skipped_reason?: string;
    error?: string;
    raw?: string;
  };
  const synthBy = new Map<string, SynthPerCase>();
  for (const c of cases) {
    const p = pre.get(c.case_id)!;
    if (!p.ok || !p.parse_ok || p.next_action !== "run_wizard") {
      synthBy.set(c.case_id, {
        ok: false, parse_ok: false, predicted_cdsco_class: null, rationale_string: null,
        trl_level: null, trl_stage: null, trl_track: null,
        cost_usd: 0, usage: emptyUsage(),
        skipped_reason: !p.ok ? "pre_router_errored" : !p.parse_ok ? "pre_router_parse_failed" : `pre_router_next_action=${p.next_action ?? "null"}`,
      });
      continue;
    }
    const r = synthResults.get(c.case_id);
    if (!r) { synthBy.set(c.case_id, { ok: false, parse_ok: false, predicted_cdsco_class: null, rationale_string: null, trl_level: null, trl_stage: null, trl_track: null, cost_usd: 0, usage: emptyUsage(), error: "no row" }); continue; }
    if (r.result.type !== "succeeded") { synthBy.set(c.case_id, { ok: false, parse_ok: false, predicted_cdsco_class: null, rationale_string: null, trl_level: null, trl_stage: null, trl_track: null, cost_usd: 0, usage: emptyUsage(), error: `type=${r.result.type}` }); continue; }
    const usage = usageFromMessage(r.result.message);
    const cost = costOf(OPUS, usage);
    const text = extractText(r.result.message);
    const json = stripJson(text);
    let predicted: string | null = null;
    let rationaleString: string | null = null;
    let trlLevel: number | null = null;
    let trlStage: string | null = null;
    let trlTrack: string | null = null;
    let parse_ok = false;
    let raw: string | undefined = text;

    const extractTrl = (obj: unknown) => {
      const o = obj as { trl?: { level?: unknown; stage?: unknown; track?: unknown } | null };
      const t = o?.trl;
      if (t && typeof t === "object") {
        if (typeof t.level === "number") trlLevel = t.level;
        if (typeof t.stage === "string") trlStage = t.stage;
        if (typeof t.track === "string") trlTrack = t.track;
      }
    };

    if (json) {
      try {
        const obj = JSON.parse(json);
        const validated = ReadinessCardSchema.parse(obj);
        const cls = validated.classification?.cdsco_class;
        predicted = cls === undefined ? null : (cls as string | null);
        rationaleString = (validated.classification as { rationale?: string } | undefined)?.rationale ?? null;
        extractTrl(validated);
        parse_ok = true;
        raw = undefined;
      } catch {
        try {
          const obj = JSON.parse(json) as { classification?: { cdsco_class?: string | null; rationale?: string } };
          const cls = obj.classification?.cdsco_class;
          if (cls === null || cls === "A" || cls === "B" || cls === "C" || cls === "D") predicted = cls ?? null;
          rationaleString = obj.classification?.rationale ?? null;
          extractTrl(obj);
        } catch {}
      }
    }
    synthBy.set(c.case_id, {
      ok: true, parse_ok, predicted_cdsco_class: predicted, rationale_string: rationaleString,
      trl_level: trlLevel, trl_stage: trlStage, trl_track: trlTrack,
      cost_usd: cost, usage, raw,
    });
  }

  // ---- score + write ----
  const rows = cases.map((c) => {
    const p = pre.get(c.case_id)!;
    const s = synthBy.get(c.case_id)!;
    const expected = c.expected_cdsco_class;
    const orAcceptable = c.or_acceptable;
    const predicted = s.predicted_cdsco_class;
    const strict = predicted === expected;
    const tolerant = strict || (orAcceptable.length > 0 && orAcceptable.some((alt) => alt === predicted));
    const bucket = tolerant ? "AGREE" : "UNSURE";
    return {
      case_id: c.case_id,
      product_name: c.product_name,
      one_liner: c.one_liner,
      expected_cdsco_class: expected,
      or_acceptable: orAcceptable,
      label_rationale: c.rationale,
      pre_router: { ok: p.ok, parse_ok: p.parse_ok, product_type: p.product_type, next_action: p.next_action, elapsed_ms: null, cost_usd: p.cost_usd, usage: p.usage, error: p.error, raw: p.raw },
      synth: { ok: s.ok, parse_ok: s.parse_ok, predicted_cdsco_class: s.predicted_cdsco_class, rationale_string: s.rationale_string, trl_level: s.trl_level, trl_stage: s.trl_stage, trl_track: s.trl_track, elapsed_ms: null, cost_usd: s.cost_usd, usage: s.usage, skipped_reason: s.skipped_reason, error: s.error, raw: s.raw },
      match_strict: strict,
      match_tolerant: tolerant,
      disagreement_bucket: bucket,
    };
  });

  const total = rows.length;
  const tol = rows.filter((r) => r.match_tolerant).length;
  const str = rows.filter((r) => r.match_strict).length;
  const synthAttempted = rows.filter((r) => r.synth.ok).length;
  const synthParseFails = rows.filter((r) => r.synth.ok && !r.synth.parse_ok).length;
  const totalUsage = rows.reduce(
    (a, r) => ({ pre_router: addUsage(a.pre_router, r.pre_router.usage), synth: addUsage(a.synth, r.synth.usage) }),
    { pre_router: emptyUsage(), synth: emptyUsage() }
  );
  const cost = {
    pre_router: rows.reduce((s, r) => s + r.pre_router.cost_usd, 0),
    synth: rows.reduce((s, r) => s + r.synth.cost_usd, 0),
  };
  const grand = cost.pre_router + cost.synth;

  const summary = {
    run_at: new Date().toISOString(),
    resumed_from: { pre_router_batch_id: preBatchId, synth_batch_id: synthBatchId },
    calibration_file: "data/calibration/clearpath_synthetic_50_full_schema_v2_1.json",
    total_cases: total,
    tolerant_match: { hits: tol, pct: tol / total },
    strict_match: { hits: str, pct: str / total },
    pre_router_errors: rows.filter((r) => !r.pre_router.ok).length,
    pre_router_parse_fails: rows.filter((r) => r.pre_router.ok && !r.pre_router.parse_ok).length,
    synth_attempted: synthAttempted,
    synth_parse_fails: synthParseFails,
    cost_usd: { pre_router: cost.pre_router, synth: cost.synth, grand_total: grand },
    usage: totalUsage,
    bar_tolerant: 0.9,
    passes_bar: tol / total >= 0.9,
  };

  const outDir = path.resolve(process.cwd(), "data/eval/sprint-1-3");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `recon-run${suffix}.json`), JSON.stringify({ summary, rows }, null, 2));

  console.log(`\n${"=".repeat(72)}`);
  console.log(`RESUMED RECON DONE`);
  console.log(`Tolerant: ${tol}/${total} (${(summary.tolerant_match.pct * 100).toFixed(1)}%) bar≥90% ${summary.passes_bar ? "PASS" : "FAIL"}`);
  console.log(`Strict:   ${str}/${total} (${(summary.strict_match.pct * 100).toFixed(1)}%)`);
  console.log(`Synth parse fail: ${synthParseFails}/${synthAttempted}`);
  console.log(`Cost: $${grand.toFixed(4)}`);
  console.log(`Outputs: ${path.join(outDir, `recon-run${suffix}.json`)}`);
  console.log(`${"=".repeat(72)}\n`);
}

main().catch((e) => { console.error("[resume] failed:", e); process.exit(1); });
