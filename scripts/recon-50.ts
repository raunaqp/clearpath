/**
 * Story 1.3 RECON — 50-case calibration set, locked Haiku/Opus stack, Batch API.
 *
 * Pipeline (per case):
 *   1. Haiku 4.5 pre-router → product_type + next_action + detected_signals
 *   2. Opus 4.7 synthesizer  → cdsco_class (only if pre-router says run_wizard)
 *
 * Scoring:
 *   - TOLERANT (gates ≥90% bar): predicted ∈ {expected_cdsco_class} ∪ or_acceptable
 *   - STRICT  (internal):        predicted == expected_cdsco_class exactly
 *
 * Run:
 *   npx tsx scripts/recon-50.ts            # writes recon-run.json + disagreements.md
 *   npx tsx scripts/recon-50.ts v2         # writes recon-run-v2.json + disagreements-v2.md
 *
 * The optional positional arg becomes a filename suffix so re-runs (after
 * a prompt fix or label correction) don't clobber prior artifacts.
 *
 * Outputs (no tag):
 *   data/eval/sprint-1-3/recon-run.json
 *   data/eval/sprint-1-3/disagreements.md
 *   data/eval/sprint-1-3/recon-run.log  (stdout tee)
 *
 * NOTE: This is RECON ONLY. Do not iterate engine code based on this run alone —
 * categorize disagreements first, then decide.
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { PRE_ROUTER_SYSTEM_PROMPT } from "../lib/engine/system-prompts";
import { SYNTHESIZER_SYSTEM_PROMPT } from "../lib/engine/synthesizer-system-prompt";
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
  console.error("ANTHROPIC_API_KEY missing. Add to .env.local.");
  process.exit(1);
}

// ---- models + pricing (Batch API: 50% off list rates) ----
const HAIKU = "claude-haiku-4-5-20251001";
const OPUS = "claude-opus-4-7";

type Pricing = { input: number; output: number; cache_write: number; cache_read: number };
// Batch API rates = 50% of list rates.
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

function emptyUsage(): Usage {
  return { input_tokens: 0, output_tokens: 0, cache_read: 0, cache_write: 0 };
}

function addUsage(a: Usage, b: Usage): Usage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_read: a.cache_read + b.cache_read,
    cache_write: a.cache_write + b.cache_write,
  };
}

function costOf(model: string, u: Usage): number {
  const p = BATCH_PRICING[model];
  if (!p) throw new Error(`No batch pricing for ${model}`);
  return (
    (u.input_tokens * p.input +
      u.output_tokens * p.output +
      u.cache_write * p.cache_write +
      u.cache_read * p.cache_read) /
    1_000_000
  );
}

function usageFromMessage(m: Anthropic.Messages.Message): Usage {
  return {
    input_tokens: m.usage.input_tokens,
    output_tokens: m.usage.output_tokens,
    cache_read: m.usage.cache_read_input_tokens ?? 0,
    cache_write: m.usage.cache_creation_input_tokens ?? 0,
  };
}

function stripJson(text: string): string | null {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function extractText(m: Anthropic.Messages.Message): string {
  const first = m.content[0];
  return first && first.type === "text" ? first.text : "";
}

const client = new Anthropic();

// ---- batch submit + poll ----
async function runBatch(
  label: string,
  requests: Anthropic.Messages.Batches.BatchCreateParams.Request[]
): Promise<Map<string, Anthropic.Messages.Batches.MessageBatchIndividualResponse>> {
  console.log(`\n[batch:${label}] submitting ${requests.length} requests...`);
  const created = await client.messages.batches.create({ requests });
  console.log(`[batch:${label}] id=${created.id} status=${created.processing_status}`);

  // Poll. 30s cadence — light enough that small batches finish in 1-3 polls,
  // large enough that we don't spam the API.
  let current = created;
  const t0 = Date.now();
  while (current.processing_status !== "ended") {
    await new Promise((r) => setTimeout(r, 30_000));
    current = await client.messages.batches.retrieve(created.id);
    const c = current.request_counts;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(
      `[batch:${label}] +${elapsed}s  status=${current.processing_status}  succ=${c.succeeded} proc=${c.processing} err=${c.errored} exp=${c.expired} cancel=${c.canceled}`
    );
  }
  console.log(`[batch:${label}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  // Stream JSONL results.
  const results = new Map<
    string,
    Anthropic.Messages.Batches.MessageBatchIndividualResponse
  >();
  const decoder = await client.messages.batches.results(created.id);
  for await (const row of decoder) {
    results.set(row.custom_id, row);
  }
  return results;
}

// ---- calibration types ----
type CalibrationCase = {
  case_id: string;
  product_name: string;
  one_liner: string;
  product_type?: string;
  expected_cdsco_class: "A" | "B" | "C" | "D" | null;
  or_acceptable: ("A" | "B" | "C" | "D" | null)[];
  rationale: string;
  labeled_by: string;
  labeled_at: string;
  [k: string]: unknown;
};

type ReconRow = {
  case_id: string;
  product_name: string;
  one_liner: string;
  expected_cdsco_class: string | null;
  or_acceptable: (string | null)[];
  label_rationale: string;

  pre_router: {
    ok: boolean;
    parse_ok: boolean;
    product_type: string | null;
    next_action: string | null;
    elapsed_ms: number | null;
    cost_usd: number;
    usage: Usage;
    error?: string;
    raw?: string;
  };

  synth: {
    ok: boolean;
    parse_ok: boolean;
    predicted_cdsco_class: string | null;
    rationale_string: string | null;
    elapsed_ms: number | null;
    cost_usd: number;
    usage: Usage;
    skipped_reason?: string;
    error?: string;
    raw?: string;
  };

  match_strict: boolean;
  match_tolerant: boolean;
  disagreement_bucket: "AGREE" | "OPUS_WRONG" | "LABEL_WRONG" | "BORDERLINE" | "UNSURE";
};

async function main() {
  const t_total = Date.now();

  // Optional tag → filename suffix. e.g. "v2" → recon-run-v2.json
  const rawTag = process.argv[2]?.trim();
  const tag = rawTag && rawTag.length > 0 ? rawTag : null;
  const suffix = tag ? `-${tag}` : "";

  // ---- 1. validate + load calibration ----
  const calibPath = path.resolve(
    process.cwd(),
    "data/calibration/clearpath_synthetic_50_full_schema_v2_1.json"
  );
  console.log(`\n[recon-50] calibration: ${calibPath}`);
  const calib = JSON.parse(fs.readFileSync(calibPath, "utf8")) as {
    cases: CalibrationCase[];
  };
  if (calib.cases.length !== 50) {
    console.error(`Expected 50 cases, got ${calib.cases.length}. Run validator first.`);
    process.exit(1);
  }
  console.log(`[recon-50] loaded ${calib.cases.length} cases`);

  const outDir = path.resolve(process.cwd(), "data/eval/sprint-1-3");
  fs.mkdirSync(outDir, { recursive: true });

  // ---- 2. pre-router batch (Haiku) ----
  const preRouterRequests: Anthropic.Messages.Batches.BatchCreateParams.Request[] =
    calib.cases.map((c) => {
      const userText =
        `One-liner: ${c.one_liner}\n` +
        `URL content: N/A\n` +
        `Cached PDF summaries:\nN/A\n\n` +
        `No fresh PDFs attached.`;
      return {
        custom_id: c.case_id,
        params: {
          model: HAIKU,
          max_tokens: 2000,
          temperature: 0,
          system: [
            {
              type: "text",
              text: PRE_ROUTER_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: [{ type: "text", text: userText }] }],
        },
      };
    });

  const preRouterResults = await runBatch("pre-router", preRouterRequests);

  // Materialize pre-router parsed output per case.
  const preRouterByCase = new Map<
    string,
    {
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
    }
  >();

  for (const c of calib.cases) {
    const row = preRouterResults.get(c.case_id);
    if (!row) {
      preRouterByCase.set(c.case_id, {
        ok: false,
        parse_ok: false,
        product_type: null,
        next_action: null,
        detected_signals: null,
        conflict_details: null,
        cost_usd: 0,
        usage: emptyUsage(),
        error: "no result row from batch",
      });
      continue;
    }
    if (row.result.type !== "succeeded") {
      preRouterByCase.set(c.case_id, {
        ok: false,
        parse_ok: false,
        product_type: null,
        next_action: null,
        detected_signals: null,
        conflict_details: null,
        cost_usd: 0,
        usage: emptyUsage(),
        error: `batch result type=${row.result.type}`,
      });
      continue;
    }
    const message = row.result.message;
    const usage = usageFromMessage(message);
    const cost = costOf(HAIKU, usage);
    const text = extractText(message);
    const json = stripJson(text);
    let parsed: Record<string, unknown> | null = null;
    let parse_ok = false;
    if (json) {
      try {
        parsed = JSON.parse(json);
        parse_ok = true;
      } catch {
        // parse_ok stays false
      }
    }
    preRouterByCase.set(c.case_id, {
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

  // ---- 3. synth batch (Opus) — only run_wizard cases ----
  const synthCandidates = calib.cases.filter((c) => {
    const pr = preRouterByCase.get(c.case_id);
    return pr?.ok && pr.parse_ok && pr.next_action === "run_wizard";
  });
  console.log(
    `\n[recon-50] synth candidates: ${synthCandidates.length}/${calib.cases.length} (rest were pre-router rejected/errored)`
  );

  const synthRequests: Anthropic.Messages.Batches.BatchCreateParams.Request[] =
    synthCandidates.map((c) => {
      const pr = preRouterByCase.get(c.case_id)!;
      const userText = [
        `Assessment ID: ${c.case_id}`,
        `Product: ${c.one_liner}`,
        `Product type: ${pr.product_type ?? "product"}`,
        `URL content: N/A`,
        `PDF summaries: []`,
        `Wizard answers: {}`,
        `Detected signals: ${JSON.stringify(pr.detected_signals)}`,
        `Conflict details: ${JSON.stringify(pr.conflict_details)}`,
        "",
        "Generate the full Tier 0 Readiness Card per the output schema.",
        "",
        "When computing Top 3 gaps:",
        "- If classification is Class B/C/D and no high/medium confidence ISO 13485 detected → include as HIGH gap.",
        "- If classification is Class B/C/D and no high/medium confidence IEC 62304 detected AND product has software → include as HIGH gap.",
        "- If IVD classification and no NABL lab partnership detected → include as HIGH gap.",
        '- If product_type is hardware_software and no facility detected → add to verdict: "Since your product has a hardware component, state FDA approval may also apply depending on your manufacturing setup."',
      ].join("\n");
      return {
        custom_id: c.case_id,
        params: {
          model: OPUS,
          max_tokens: 4000,
          system: [
            {
              type: "text",
              text: SYNTHESIZER_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: userText }],
        },
      };
    });

  const synthResultsRaw = synthRequests.length
    ? await runBatch("synth", synthRequests)
    : new Map<string, Anthropic.Messages.Batches.MessageBatchIndividualResponse>();

  const synthByCase = new Map<
    string,
    {
      ok: boolean;
      parse_ok: boolean;
      predicted_cdsco_class: string | null;
      rationale_string: string | null;
      cost_usd: number;
      usage: Usage;
      skipped_reason?: string;
      error?: string;
      raw?: string;
    }
  >();

  for (const c of calib.cases) {
    const pr = preRouterByCase.get(c.case_id)!;
    if (!pr.ok || !pr.parse_ok || pr.next_action !== "run_wizard") {
      synthByCase.set(c.case_id, {
        ok: false,
        parse_ok: false,
        predicted_cdsco_class: null,
        rationale_string: null,
        cost_usd: 0,
        usage: emptyUsage(),
        skipped_reason: !pr.ok
          ? "pre_router_errored"
          : !pr.parse_ok
            ? "pre_router_parse_failed"
            : `pre_router_next_action=${pr.next_action ?? "null"}`,
      });
      continue;
    }
    const row = synthResultsRaw.get(c.case_id);
    if (!row) {
      synthByCase.set(c.case_id, {
        ok: false,
        parse_ok: false,
        predicted_cdsco_class: null,
        rationale_string: null,
        cost_usd: 0,
        usage: emptyUsage(),
        error: "no result row from batch",
      });
      continue;
    }
    if (row.result.type !== "succeeded") {
      synthByCase.set(c.case_id, {
        ok: false,
        parse_ok: false,
        predicted_cdsco_class: null,
        rationale_string: null,
        cost_usd: 0,
        usage: emptyUsage(),
        error: `batch result type=${row.result.type}`,
      });
      continue;
    }
    const message = row.result.message;
    const usage = usageFromMessage(message);
    const cost = costOf(OPUS, usage);
    const text = extractText(message);
    const json = stripJson(text);
    let predicted: string | null = null;
    let rationaleString: string | null = null;
    let parse_ok = false;
    let raw: string | undefined = text;
    if (json) {
      try {
        const obj = JSON.parse(json);
        // Validate against full Readiness Card schema (matches prod expectations).
        const validated = ReadinessCardSchema.parse(obj);
        const cls = validated.classification?.cdsco_class;
        predicted = cls === undefined ? null : (cls as string | null);
        rationaleString =
          (validated.classification as { rationale?: string } | undefined)?.rationale ??
          null;
        parse_ok = true;
        raw = undefined;
      } catch {
        // Schema-validate failed. Try permissive extraction so we still surface a
        // predicted class for scoring (parse_ok stays false to flag the issue).
        try {
          const obj = JSON.parse(json) as {
            classification?: { cdsco_class?: string | null; rationale?: string };
          };
          const cls = obj.classification?.cdsco_class;
          if (cls === null || cls === "A" || cls === "B" || cls === "C" || cls === "D") {
            predicted = cls ?? null;
          }
          rationaleString = obj.classification?.rationale ?? null;
        } catch {
          // give up
        }
      }
    }
    synthByCase.set(c.case_id, {
      ok: true,
      parse_ok,
      predicted_cdsco_class: predicted,
      rationale_string: rationaleString,
      cost_usd: cost,
      usage,
      raw,
    });
  }

  // ---- 4. score + bucket ----
  const rows: ReconRow[] = [];
  for (const c of calib.cases) {
    const pr = preRouterByCase.get(c.case_id)!;
    const sy = synthByCase.get(c.case_id)!;
    const expected = c.expected_cdsco_class;
    const orAcceptable = c.or_acceptable;
    const predicted = sy.predicted_cdsco_class;

    const strict = predicted === expected;
    const tolerant =
      strict ||
      (orAcceptable.length > 0 &&
        orAcceptable.some((alt) => alt === predicted));

    let bucket: ReconRow["disagreement_bucket"];
    if (tolerant) {
      bucket = "AGREE";
    } else if (sy.skipped_reason) {
      // Engine never produced a class because pre-router rejected. Mark UNSURE
      // for human review — this could be Opus-wrong (synth would have got it
      // right if reached) OR pre-router-wrong OR label-wrong.
      bucket = "UNSURE";
    } else {
      bucket = "UNSURE"; // default; founder re-buckets manually in disagreements.md
    }

    rows.push({
      case_id: c.case_id,
      product_name: c.product_name,
      one_liner: c.one_liner,
      expected_cdsco_class: expected,
      or_acceptable: orAcceptable,
      label_rationale: c.rationale,
      pre_router: {
        ok: pr.ok,
        parse_ok: pr.parse_ok,
        product_type: pr.product_type,
        next_action: pr.next_action,
        elapsed_ms: null,
        cost_usd: pr.cost_usd,
        usage: pr.usage,
        error: pr.error,
        raw: pr.raw,
      },
      synth: {
        ok: sy.ok,
        parse_ok: sy.parse_ok,
        predicted_cdsco_class: sy.predicted_cdsco_class,
        rationale_string: sy.rationale_string,
        elapsed_ms: null,
        cost_usd: sy.cost_usd,
        usage: sy.usage,
        skipped_reason: sy.skipped_reason,
        error: sy.error,
        raw: sy.raw,
      },
      match_strict: strict,
      match_tolerant: tolerant,
      disagreement_bucket: bucket,
    });
  }

  // ---- 5. aggregates ----
  const totalCases = rows.length;
  const tolerantHits = rows.filter((r) => r.match_tolerant).length;
  const strictHits = rows.filter((r) => r.match_strict).length;
  const synthAttempted = rows.filter((r) => r.synth.ok).length;
  const synthParseFailed = rows.filter((r) => r.synth.ok && !r.synth.parse_ok).length;
  const preRouterErrors = rows.filter((r) => !r.pre_router.ok).length;
  const preRouterParseFails = rows.filter((r) => r.pre_router.ok && !r.pre_router.parse_ok).length;

  const totalUsage = rows.reduce(
    (acc, r) => ({
      pre_router: addUsage(acc.pre_router, r.pre_router.usage),
      synth: addUsage(acc.synth, r.synth.usage),
    }),
    { pre_router: emptyUsage(), synth: emptyUsage() }
  );

  const totalCost = {
    pre_router: rows.reduce((s, r) => s + r.pre_router.cost_usd, 0),
    synth: rows.reduce((s, r) => s + r.synth.cost_usd, 0),
  };
  const grandTotalCost = totalCost.pre_router + totalCost.synth;

  const elapsedSec = ((Date.now() - t_total) / 1000).toFixed(0);

  // ---- 6. write artifacts ----
  const summary = {
    run_at: new Date().toISOString(),
    elapsed_sec: Number(elapsedSec),
    calibration_file: "data/calibration/clearpath_synthetic_50_full_schema_v2_1.json",
    total_cases: totalCases,
    tolerant_match: { hits: tolerantHits, pct: tolerantHits / totalCases },
    strict_match: { hits: strictHits, pct: strictHits / totalCases },
    pre_router_errors: preRouterErrors,
    pre_router_parse_fails: preRouterParseFails,
    synth_attempted: synthAttempted,
    synth_parse_fails: synthParseFailed,
    cost_usd: {
      pre_router: totalCost.pre_router,
      synth: totalCost.synth,
      grand_total: grandTotalCost,
    },
    usage: totalUsage,
    bar_tolerant: 0.9,
    passes_bar: tolerantHits / totalCases >= 0.9,
  };

  fs.writeFileSync(
    path.join(outDir, `recon-run${suffix}.json`),
    JSON.stringify({ summary, rows }, null, 2)
  );

  // disagreements.md
  const disagreements = rows.filter((r) => !r.match_tolerant);
  let md = `# Story 1.3 recon — disagreements\n\n`;
  md += `**run_at:** ${summary.run_at}\n`;
  md += `**stack:** Haiku 4.5 pre-router → Opus 4.7 synth (Batch API)\n`;
  md += `**calibration:** ${summary.calibration_file}\n\n`;
  md += `## Headline\n\n`;
  md += `- **Tolerant match:** ${tolerantHits}/${totalCases} (${(summary.tolerant_match.pct * 100).toFixed(1)}%) — bar ≥90%: ${summary.passes_bar ? "**PASS**" : "**FAIL**"}\n`;
  md += `- **Strict match:** ${strictHits}/${totalCases} (${(summary.strict_match.pct * 100).toFixed(1)}%) — internal monitoring only\n`;
  md += `- **Disagreements:** ${disagreements.length}/${totalCases}\n`;
  md += `- **Pre-router errors:** ${preRouterErrors}, parse fails: ${preRouterParseFails}\n`;
  md += `- **Synth parse fails:** ${synthParseFailed}/${synthAttempted} (Story 1.2 expectation: 0%)\n`;
  md += `- **Cost (Batch API, 50%-off):** pre-router $${totalCost.pre_router.toFixed(4)} + synth $${totalCost.synth.toFixed(4)} = **$${grandTotalCost.toFixed(4)}**\n`;
  md += `- **Elapsed:** ${elapsedSec}s\n\n`;

  md += `## Disagreement bucket distribution\n\n`;
  const buckets = ["AGREE", "OPUS_WRONG", "LABEL_WRONG", "BORDERLINE", "UNSURE"] as const;
  for (const b of buckets) {
    md += `- ${b}: ${rows.filter((r) => r.disagreement_bucket === b).length}\n`;
  }
  md += `\n*Initial bucketing is heuristic — all non-tolerant-matches default to UNSURE. Founder must re-bucket manually below.*\n\n`;

  md += `## Disagreements (${disagreements.length})\n\n`;
  if (disagreements.length === 0) {
    md += `_None — all 50 cases tolerant-match._\n\n`;
  } else {
    for (const r of disagreements) {
      md += `### ${r.case_id} — ${r.product_name}\n\n`;
      md += `**One-liner:** ${r.one_liner}\n\n`;
      md += `- **Expected:** \`${r.expected_cdsco_class === null ? "null" : r.expected_cdsco_class}\``;
      if (r.or_acceptable.length) {
        md += ` (or_acceptable: ${r.or_acceptable.map((v) => (v === null ? "null" : v)).join(", ")})`;
      }
      md += `\n`;
      md += `- **Predicted:** \`${r.synth.predicted_cdsco_class === null ? "null" : r.synth.predicted_cdsco_class ?? "(no output)"}\`\n`;
      md += `- **Pre-router:** product_type=${r.pre_router.product_type ?? "?"}, next_action=${r.pre_router.next_action ?? "?"}\n`;
      if (r.synth.skipped_reason) md += `- **Synth skipped:** ${r.synth.skipped_reason}\n`;
      if (r.synth.error) md += `- **Synth error:** ${r.synth.error}\n`;
      if (!r.synth.parse_ok && r.synth.ok)
        md += `- **Synth parse fail** (raw output saved in recon-run.json)\n`;
      md += `- **Label rationale:** ${r.label_rationale}\n`;
      if (r.synth.rationale_string)
        md += `- **Synth rationale:** ${r.synth.rationale_string}\n`;
      md += `- **Initial bucket:** ${r.disagreement_bucket} _(re-bucket manually: OPUS_WRONG / LABEL_WRONG / BORDERLINE / UNSURE)_\n\n`;
    }
  }

  md += `\n## Categorization legend\n\n`;
  md += "- **OPUS_WRONG** — Opus made a clear mistake; the label (and `or_acceptable`) is correct.\n";
  md += "- **LABEL_WRONG** — Opus's prediction is regulatorily defensible; the label is the issue.\n";
  md += "- **BORDERLINE** — Genuinely ambiguous; neither call is wrong; `or_acceptable` should probably include the prediction.\n";
  md += "- **UNSURE** — Need regulatory advisor to break the tie.\n";

  fs.writeFileSync(path.join(outDir, `disagreements${suffix}.md`), md);

  // ---- 7. console summary ----
  console.log(`\n${"=".repeat(72)}`);
  console.log(`RECON DONE in ${elapsedSec}s`);
  console.log(`${"=".repeat(72)}`);
  console.log(`Tolerant match: ${tolerantHits}/${totalCases} (${(summary.tolerant_match.pct * 100).toFixed(1)}%)  bar ≥90%: ${summary.passes_bar ? "PASS" : "FAIL"}`);
  console.log(`Strict   match: ${strictHits}/${totalCases} (${(summary.strict_match.pct * 100).toFixed(1)}%)  internal only`);
  console.log(`Disagreements:  ${disagreements.length}`);
  console.log(`Pre-router err: ${preRouterErrors}  parse-fail: ${preRouterParseFails}`);
  console.log(`Synth parse fail: ${synthParseFailed}/${synthAttempted}`);
  console.log(`Cost (Batch API): pre-router $${totalCost.pre_router.toFixed(4)} + synth $${totalCost.synth.toFixed(4)} = $${grandTotalCost.toFixed(4)}`);
  console.log(`Outputs:`);
  console.log(`  ${path.join(outDir, `recon-run${suffix}.json`)}`);
  console.log(`  ${path.join(outDir, `disagreements${suffix}.md`)}`);
  console.log(`${"=".repeat(72)}\n`);
}

main().catch((e) => {
  console.error("\n[recon-50] failed:", e);
  process.exit(1);
});
