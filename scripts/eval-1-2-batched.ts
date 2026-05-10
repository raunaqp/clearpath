/**
 * Sprint 1 Story 1.2 — batched A/B eval.
 *
 * Three layers compared in isolation:
 *   Layer 1 (pre-router):  Sonnet 4.6 baseline   vs.  Haiku 4.5 (new)        — 13 cases
 *   Layer 2 (synthesizer): Opus 4.7 baseline     vs.  Sonnet 4.6 (new)        — 10 healthcare cases, NO caching
 *   Layer 3 (draft-pack):  Opus 4.7 baseline     vs.  Sonnet 4.6 (new)        —  5 cases, WITH caching
 *
 * Synthesizer A/B reuses the new Haiku pre-router output for both branches
 * (testing one variable at a time). Draft-pack A/B reuses the new Sonnet
 * synthesizer output for both branches.
 *
 * Bars locked in `docs/sprint-recaps/sprint-1.md` BEFORE this script ran.
 *
 * Outputs:
 *   data/eval/sprint-1/layer-1-pre-router.json
 *   data/eval/sprint-1/layer-2-synthesizer.json
 *   data/eval/sprint-1/layer-3-draft-pack.json
 *   data/eval/sprint-1/summary.md
 *
 * Run:
 *   npx tsx scripts/eval-1-2-batched.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { PRE_ROUTER_SYSTEM_PROMPT } from "../lib/engine/system-prompts";
import { SYNTHESIZER_SYSTEM_PROMPT } from "../lib/engine/synthesizer-system-prompt";
import {
  DRAFT_PACK_SYSTEM_PROMPT,
  DraftPackContentSchema,
} from "../lib/engine/draft-pack-prompts";
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

// ---- models + pricing ----
const HAIKU = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";
const OPUS = "claude-opus-4-7";

type Pricing = { input: number; output: number; cache_write: number; cache_read: number };
const PRICING: Record<string, Pricing> = {
  [HAIKU]: { input: 1.0, output: 5.0, cache_write: 1.25, cache_read: 0.1 },
  [SONNET]: { input: 3.0, output: 15.0, cache_write: 3.75, cache_read: 0.3 },
  [OPUS]: { input: 5.0, output: 25.0, cache_write: 6.25, cache_read: 0.5 },
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

function costOf(model: string, u: Usage): number {
  const p = PRICING[model];
  if (!p) throw new Error(`No pricing for ${model}`);
  return (
    (u.input_tokens * p.input +
      u.output_tokens * p.output +
      u.cache_write * p.cache_write +
      u.cache_read * p.cache_read) /
    1_000_000
  );
}

function usageFromResp(r: Anthropic.Message): Usage {
  return {
    input_tokens: r.usage.input_tokens,
    output_tokens: r.usage.output_tokens,
    cache_read: r.usage.cache_read_input_tokens ?? 0,
    cache_write: r.usage.cache_creation_input_tokens ?? 0,
  };
}

function stripJson(text: string): string | null {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

const client = new Anthropic();

// ---- pre-router runner (with caching) ----
async function runPreRouter(
  model: string,
  oneLiner: string
): Promise<{
  output: Record<string, unknown> | null;
  usage: Usage;
  cost: number;
  elapsed_ms: number;
  raw: string;
  parse_ok: boolean;
}> {
  const userText =
    `One-liner: ${oneLiner}\n` +
    `URL content: N/A\n` +
    `Cached PDF summaries:\nN/A\n\n` +
    `No fresh PDFs attached.`;

  const t0 = Date.now();
  const resp = await client.messages.create({
    model,
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
  });
  const elapsed_ms = Date.now() - t0;
  const usage = usageFromResp(resp);
  const cost = costOf(model, usage);
  const first = resp.content[0];
  const raw = first && first.type === "text" ? first.text : "";
  const json = stripJson(raw);
  let output: Record<string, unknown> | null = null;
  let parse_ok = false;
  if (json) {
    try {
      output = JSON.parse(json);
      parse_ok = true;
    } catch {
      // parse_ok stays false
    }
  }
  return { output, usage, cost, elapsed_ms, raw, parse_ok };
}

// ---- synthesizer runner (NO caching, mirrors prod 2-attempt retry) ----
async function runSynth(
  model: string,
  input: {
    assessmentId: string;
    oneLiner: string;
    productType: string;
    detectedSignals: unknown;
    conflictDetails: unknown | null;
  }
): Promise<{
  output: Record<string, unknown> | null;
  usage: Usage;
  cost: number;
  elapsed_ms: number;
  raw: string;
  parse_ok: boolean;
  attempts: number;
}> {
  const STRICT_SUFFIX =
    "\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.";
  const userText = [
    `Assessment ID: ${input.assessmentId}`,
    `Product: ${input.oneLiner}`,
    `Product type: ${input.productType}`,
    `URL content: N/A`,
    `PDF summaries: []`,
    `Wizard answers: {}`,
    `Detected signals: ${JSON.stringify(input.detectedSignals)}`,
    `Conflict details: ${JSON.stringify(input.conflictDetails)}`,
    "",
    "Generate the full Tier 0 Readiness Card per the output schema.",
    "",
    "When computing Top 3 gaps:",
    "- If classification is Class B/C/D and no high/medium confidence ISO 13485 detected → include as HIGH gap.",
    "- If classification is Class B/C/D and no high/medium confidence IEC 62304 detected AND product has software → include as HIGH gap.",
    "- If IVD classification and no NABL lab partnership detected → include as HIGH gap.",
    '- If product_type is hardware_software and no facility detected → add to verdict: "Since your product has a hardware component, state FDA approval may also apply depending on your manufacturing setup."',
  ].join("\n");

  let totalUsage = emptyUsage();
  let totalCost = 0;
  let lastRaw = "";
  let parsed: Record<string, unknown> | null = null;
  let parse_ok = false;
  let attempts = 0;
  const t0 = Date.now();

  for (let attempt = 1; attempt <= 2; attempt++) {
    attempts = attempt;
    const sysText =
      SYNTHESIZER_SYSTEM_PROMPT + (attempt === 2 ? STRICT_SUFFIX : "");
    const resp = await client.messages.create({
      model,
      max_tokens: 4000,
      // NO cache_control: caching disabled during eval per Clarification A.
      system: sysText,
      messages: [{ role: "user", content: userText }],
    });
    const usage = usageFromResp(resp);
    totalUsage = {
      input_tokens: totalUsage.input_tokens + usage.input_tokens,
      output_tokens: totalUsage.output_tokens + usage.output_tokens,
      cache_read: totalUsage.cache_read + usage.cache_read,
      cache_write: totalUsage.cache_write + usage.cache_write,
    };
    totalCost += costOf(model, usage);
    const first = resp.content[0];
    lastRaw = first && first.type === "text" ? first.text : "";
    const json = stripJson(lastRaw);
    if (json) {
      try {
        const validated = ReadinessCardSchema.parse(JSON.parse(json));
        parsed = validated as unknown as Record<string, unknown>;
        parse_ok = true;
        break;
      } catch {
        // attempt 2 will retry with strict suffix
      }
    }
  }
  const elapsed_ms = Date.now() - t0;
  return { output: parsed, usage: totalUsage, cost: totalCost, elapsed_ms, raw: lastRaw, parse_ok, attempts };
}

// ---- draft-pack runner (with caching, mirrors prod 2-attempt retry) ----
async function runDraftPack(
  model: string,
  input: {
    productName: string;
    oneLiner: string;
    readinessCard: unknown;
  }
): Promise<{
  output: Record<string, unknown> | null;
  usage: Usage;
  cost: number;
  elapsed_ms: number;
  raw: string;
  parse_ok: boolean;
  attempts: number;
}> {
  const STRICT_SUFFIX =
    "\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.";
  const userMessage = JSON.stringify(
    {
      product_name: input.productName,
      one_liner: input.oneLiner,
      url_content: null,
      wizard_answers: {},
      readiness_card: input.readinessCard,
    },
    null,
    2
  );

  let totalUsage = emptyUsage();
  let totalCost = 0;
  let lastRaw = "";
  let parsed: Record<string, unknown> | null = null;
  let parse_ok = false;
  let attempts = 0;
  const t0 = Date.now();

  for (let attempt = 1; attempt <= 2; attempt++) {
    attempts = attempt;
    const sysText =
      DRAFT_PACK_SYSTEM_PROMPT + (attempt === 2 ? STRICT_SUFFIX : "");
    const resp = await client.messages.create({
      model,
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: sysText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });
    const usage = usageFromResp(resp);
    totalUsage = {
      input_tokens: totalUsage.input_tokens + usage.input_tokens,
      output_tokens: totalUsage.output_tokens + usage.output_tokens,
      cache_read: totalUsage.cache_read + usage.cache_read,
      cache_write: totalUsage.cache_write + usage.cache_write,
    };
    totalCost += costOf(model, usage);
    const first = resp.content[0];
    lastRaw = first && first.type === "text" ? first.text : "";
    const json = stripJson(lastRaw);
    if (json) {
      try {
        const validated = DraftPackContentSchema.parse(JSON.parse(json));
        parsed = validated as unknown as Record<string, unknown>;
        parse_ok = true;
        break;
      } catch {
        // attempt 2 will retry
      }
    }
  }
  const elapsed_ms = Date.now() - t0;
  return { output: parsed, usage: totalUsage, cost: totalCost, elapsed_ms, raw: lastRaw, parse_ok, attempts };
}

// ---- main flow ----
type CalibrationCase = {
  case_id: string;
  product_name: string;
  one_liner: string;
  cdsco_risk?: string;
  [k: string]: unknown;
};

async function main() {
  // Load calibration JSON
  const calibPath = path.resolve(
    process.cwd(),
    "data/calibration/clearpath_additional_35_with_trl.json"
  );
  const calib = JSON.parse(fs.readFileSync(calibPath, "utf8")) as {
    cases: CalibrationCase[];
  };

  const HEALTHCARE_IDS = [
    "CP-016",
    "CP-017",
    "CP-018",
    "CP-019",
    "CP-020",
    "CP-021",
    "CP-022",
    "CP-023",
    "CP-024",
    "CP-025",
  ];
  const DRAFT_PACK_IDS = ["CP-016", "CP-017", "CP-019", "CP-022", "CP-024"];
  const healthcareCases = calib.cases.filter((c) =>
    HEALTHCARE_IDS.includes(c.case_id)
  );
  if (healthcareCases.length !== 10) {
    console.error(`Expected 10 healthcare cases, got ${healthcareCases.length}`);
    process.exit(1);
  }

  // Edge cases (verbatim from sprint-1.md — do NOT paraphrase)
  const edgeCases: CalibrationCase[] = [
    {
      case_id: "EDGE-1-regulator",
      product_name: "Karnataka SDA inspector",
      one_liner:
        "Inspecting CDSCO compliance documents for the Karnataka State Drug Authority",
    },
    {
      case_id: "EDGE-2-investor",
      product_name: "Medtech VC",
      one_liner:
        "Looking to invest in Series A medtech startups working on AI diagnostics in India",
    },
    {
      case_id: "EDGE-3-fintech",
      product_name: "Tier-2 credit scorer",
      one_liner:
        "AI-powered credit scoring app for Tier 2 city loan applicants in India",
    },
  ];

  const allPreRouterCases = [...healthcareCases, ...edgeCases];

  const outDir = path.resolve(process.cwd(), "data/eval/sprint-1");
  fs.mkdirSync(outDir, { recursive: true });

  // ============== LAYER 1: pre-router ==============
  console.log(`\n${"=".repeat(70)}`);
  console.log(`LAYER 1: pre-router (Sonnet 4.6 baseline vs. Haiku 4.5 new) — 13 cases`);
  console.log(`${"=".repeat(70)}`);
  type Layer1Row = {
    case_id: string;
    product_name: string;
    one_liner: string;
    sonnet: { product_type: unknown; next_action: unknown; cost_usd: number; elapsed_ms: number; usage: Usage };
    haiku: { product_type: unknown; next_action: unknown; cost_usd: number; elapsed_ms: number; usage: Usage };
    match: boolean;
    _haiku_full: Record<string, unknown> | null;
    _sonnet_full: Record<string, unknown> | null;
  };
  const layer1: Layer1Row[] = [];

  for (const c of allPreRouterCases) {
    const label = `${c.case_id} ${c.product_name.substring(0, 28).padEnd(28)}`;
    process.stdout.write(`  ${label} ... `);
    const sonnet = await runPreRouter(SONNET, c.one_liner);
    const haiku = await runPreRouter(HAIKU, c.one_liner);
    const sType = sonnet.output?.product_type;
    const sAction = sonnet.output?.next_action;
    const hType = haiku.output?.product_type;
    const hAction = haiku.output?.next_action;
    const match = sType === hType && sAction === hAction;
    layer1.push({
      case_id: c.case_id,
      product_name: c.product_name,
      one_liner: c.one_liner,
      sonnet: {
        product_type: sType,
        next_action: sAction,
        cost_usd: sonnet.cost,
        elapsed_ms: sonnet.elapsed_ms,
        usage: sonnet.usage,
      },
      haiku: {
        product_type: hType,
        next_action: hAction,
        cost_usd: haiku.cost,
        elapsed_ms: haiku.elapsed_ms,
        usage: haiku.usage,
      },
      match,
      _haiku_full: haiku.output,
      _sonnet_full: sonnet.output,
    });
    console.log(`${match ? "✓" : "✗"} S=${sType}/${sAction} H=${hType}/${hAction}`);
  }
  fs.writeFileSync(path.join(outDir, "layer-1-pre-router.json"), JSON.stringify(layer1, null, 2));
  const l1Match = layer1.filter((r) => r.match).length;
  console.log(`\n  Layer 1 match: ${l1Match}/${layer1.length} (bar: ≥12/13)`);

  // ============== LAYER 2: synthesizer ==============
  console.log(`\n${"=".repeat(70)}`);
  console.log(`LAYER 2: synthesizer (Opus 4.7 baseline vs. Sonnet 4.6 new) — 10 cases, NO caching`);
  console.log(`${"=".repeat(70)}`);
  type Layer2Row = {
    case_id: string;
    product_name: string;
    one_liner: string;
    opus: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    sonnet: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    cdsco_match: boolean;
    _opus_card: Record<string, unknown> | null;
    _sonnet_card: Record<string, unknown> | null;
  };
  const layer2: Layer2Row[] = [];
  for (const c of healthcareCases) {
    const l1Row = layer1.find((r) => r.case_id === c.case_id);
    const haikuPrer = l1Row?._haiku_full;
    if (!haikuPrer || haikuPrer.next_action !== "run_wizard") {
      console.log(`  ${c.case_id} skipped (Haiku pre-router didn't return run_wizard: got ${haikuPrer?.next_action})`);
      continue;
    }
    const label = `${c.case_id} ${c.product_name.substring(0, 28).padEnd(28)}`;
    process.stdout.write(`  ${label} ... `);

    const synthInput = {
      assessmentId: c.case_id,
      oneLiner: c.one_liner,
      productType: String(haikuPrer.product_type ?? "product"),
      detectedSignals: haikuPrer.detected_signals ?? {},
      conflictDetails: haikuPrer.conflict_details ?? null,
    };

    const opus = await runSynth(OPUS, synthInput);
    const sonnet = await runSynth(SONNET, synthInput);
    const opusClass =
      ((opus.output?.classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;
    const sonnetClass =
      ((sonnet.output?.classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;
    // Treat null === null as a match: both models agreeing "no class / wellness"
    // is genuine agreement, not divergence.
    const cdscoMatch = opusClass === sonnetClass;

    layer2.push({
      case_id: c.case_id,
      product_name: c.product_name,
      one_liner: c.one_liner,
      opus: {
        cdsco_class: opusClass,
        cost_usd: opus.cost,
        elapsed_ms: opus.elapsed_ms,
        usage: opus.usage,
        parse_ok: opus.parse_ok,
        attempts: opus.attempts,
      },
      sonnet: {
        cdsco_class: sonnetClass,
        cost_usd: sonnet.cost,
        elapsed_ms: sonnet.elapsed_ms,
        usage: sonnet.usage,
        parse_ok: sonnet.parse_ok,
        attempts: sonnet.attempts,
      },
      cdsco_match: cdscoMatch,
      _opus_card: opus.output,
      _sonnet_card: sonnet.output,
    });
    console.log(`${cdscoMatch ? "✓" : "✗"} O=${opusClass} S=${sonnetClass}`);
  }
  fs.writeFileSync(path.join(outDir, "layer-2-synthesizer.json"), JSON.stringify(layer2, null, 2));
  const l2Match = layer2.filter((r) => r.cdsco_match).length;
  console.log(`\n  Layer 2 cdsco_class match: ${l2Match}/${layer2.length} (bar: ≥9/10)`);

  // ============== LAYER 3: draft-pack ==============
  console.log(`\n${"=".repeat(70)}`);
  console.log(`LAYER 3: draft-pack (Opus 4.7 baseline vs. Sonnet 4.6 new) — 5 cases, WITH caching`);
  console.log(`${"=".repeat(70)}`);
  type Layer3Row = {
    case_id: string;
    product_name: string;
    opus: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    sonnet: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    cdsco_match: boolean;
    section_count_match: boolean;
    _opus_pack: Record<string, unknown> | null;
    _sonnet_pack: Record<string, unknown> | null;
  };
  const layer3: Layer3Row[] = [];
  for (const cid of DRAFT_PACK_IDS) {
    const c = healthcareCases.find((h) => h.case_id === cid);
    const l2Row = layer2.find((r) => r.case_id === cid);
    if (!c || !l2Row || !l2Row._sonnet_card) {
      console.log(`  ${cid} skipped (no Sonnet synth output to feed)`);
      continue;
    }
    const label = `${cid} ${c.product_name.substring(0, 28).padEnd(28)}`;
    process.stdout.write(`  ${label} ... `);

    const dpInput = {
      productName: c.product_name,
      oneLiner: c.one_liner,
      readinessCard: l2Row._sonnet_card,
    };
    const opus = await runDraftPack(OPUS, dpInput);
    const sonnet = await runDraftPack(SONNET, dpInput);
    const opusClass =
      ((opus.output?.risk_classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;
    const sonnetClass =
      ((sonnet.output?.risk_classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;
    const sectionMatch =
      !!opus.output && !!sonnet.output &&
      Object.keys(opus.output).length === Object.keys(sonnet.output).length;
    layer3.push({
      case_id: cid,
      product_name: c.product_name,
      opus: {
        cdsco_class: opusClass,
        cost_usd: opus.cost,
        elapsed_ms: opus.elapsed_ms,
        usage: opus.usage,
        parse_ok: opus.parse_ok,
        attempts: opus.attempts,
      },
      sonnet: {
        cdsco_class: sonnetClass,
        cost_usd: sonnet.cost,
        elapsed_ms: sonnet.elapsed_ms,
        usage: sonnet.usage,
        parse_ok: sonnet.parse_ok,
        attempts: sonnet.attempts,
      },
      cdsco_match: opusClass === sonnetClass,
      section_count_match: sectionMatch,
      _opus_pack: opus.output,
      _sonnet_pack: sonnet.output,
    });
    console.log(
      `O=${opusClass}/sec=${opus.output ? Object.keys(opus.output).length : "?"} S=${sonnetClass}/sec=${sonnet.output ? Object.keys(sonnet.output).length : "?"}`
    );
  }
  fs.writeFileSync(path.join(outDir, "layer-3-draft-pack.json"), JSON.stringify(layer3, null, 2));

  // ============== summary ==============
  const totals = {
    sonnetPR: layer1.reduce((s, r) => s + r.sonnet.cost_usd, 0),
    haikuPR: layer1.reduce((s, r) => s + r.haiku.cost_usd, 0),
    opusSynth: layer2.reduce((s, r) => s + r.opus.cost_usd, 0),
    sonnetSynth: layer2.reduce((s, r) => s + r.sonnet.cost_usd, 0),
    opusDP: layer3.reduce((s, r) => s + r.opus.cost_usd, 0),
    sonnetDP: layer3.reduce((s, r) => s + r.sonnet.cost_usd, 0),
  };
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const elapsedTotals = {
    sonnetPR: layer1.reduce((s, r) => s + r.sonnet.elapsed_ms, 0),
    haikuPR: layer1.reduce((s, r) => s + r.haiku.elapsed_ms, 0),
    opusSynth: layer2.reduce((s, r) => s + r.opus.elapsed_ms, 0),
    sonnetSynth: layer2.reduce((s, r) => s + r.sonnet.elapsed_ms, 0),
    opusDP: layer3.reduce((s, r) => s + r.opus.elapsed_ms, 0),
    sonnetDP: layer3.reduce((s, r) => s + r.sonnet.elapsed_ms, 0),
  };

  let summary = `# sprint 1.2 batched a/b eval — results\n\n`;
  summary += `**run date:** ${new Date().toISOString()}\n`;
  summary += `**run-by:** scripts/eval-1-2-batched.ts\n\n`;

  summary += `## cost actuals (vs. budget)\n\n`;
  summary += `| layer | model | total cost | total elapsed | avg per call |\n|---|---|---|---|---|\n`;
  summary += `| pre-router | Sonnet 4.6 (baseline) | $${totals.sonnetPR.toFixed(4)} | ${(elapsedTotals.sonnetPR/1000).toFixed(1)}s | $${(totals.sonnetPR/layer1.length).toFixed(4)} |\n`;
  summary += `| pre-router | Haiku 4.5 (new) | $${totals.haikuPR.toFixed(4)} | ${(elapsedTotals.haikuPR/1000).toFixed(1)}s | $${(totals.haikuPR/layer1.length).toFixed(4)} |\n`;
  summary += `| synthesizer | Opus 4.7 (baseline) | $${totals.opusSynth.toFixed(4)} | ${(elapsedTotals.opusSynth/1000).toFixed(1)}s | $${(totals.opusSynth/Math.max(layer2.length,1)).toFixed(4)} |\n`;
  summary += `| synthesizer | Sonnet 4.6 (new) | $${totals.sonnetSynth.toFixed(4)} | ${(elapsedTotals.sonnetSynth/1000).toFixed(1)}s | $${(totals.sonnetSynth/Math.max(layer2.length,1)).toFixed(4)} |\n`;
  summary += `| draft-pack | Opus 4.7 (baseline) | $${totals.opusDP.toFixed(4)} | ${(elapsedTotals.opusDP/1000).toFixed(1)}s | $${(totals.opusDP/Math.max(layer3.length,1)).toFixed(4)} |\n`;
  summary += `| draft-pack | Sonnet 4.6 (new) | $${totals.sonnetDP.toFixed(4)} | ${(elapsedTotals.sonnetDP/1000).toFixed(1)}s | $${(totals.sonnetDP/Math.max(layer3.length,1)).toFixed(4)} |\n`;
  summary += `| **grand total** | | **$${grandTotal.toFixed(4)}** | | |\n\n`;
  summary += `**Budget approved:** $5.88. **Actual:** $${grandTotal.toFixed(4)}.\n\n`;

  summary += `## layer 1 — pre-router (Sonnet → Haiku 4.5)\n\n`;
  summary += `| case | one-liner (truncated) | Sonnet | Haiku | match |\n|---|---|---|---|---|\n`;
  for (const r of layer1) {
    const ol = r.one_liner.length > 60 ? r.one_liner.substring(0, 57) + "..." : r.one_liner;
    summary += `| ${r.case_id} | ${ol} | ${r.sonnet.product_type}/${r.sonnet.next_action} | ${r.haiku.product_type}/${r.haiku.next_action} | ${r.match ? "✓" : "✗"} |\n`;
  }
  summary += `\n**match rate: ${l1Match}/${layer1.length} (${((l1Match/layer1.length)*100).toFixed(0)}%)** — bar: ≥12/13 (~92%) for lock\n\n`;

  summary += `## layer 2 — synthesizer (Opus → Sonnet 4.6, no caching)\n\n`;
  summary += `| case | product | Opus cdsco_class | Sonnet cdsco_class | match | parse |\n|---|---|---|---|---|---|\n`;
  for (const r of layer2) {
    const parseFlag = `O:${r.opus.parse_ok ? "✓" : "✗"}/${r.opus.attempts}att S:${r.sonnet.parse_ok ? "✓" : "✗"}/${r.sonnet.attempts}att`;
    summary += `| ${r.case_id} | ${r.product_name} | ${r.opus.cdsco_class} | ${r.sonnet.cdsco_class} | ${r.cdsco_match ? "✓" : "✗"} | ${parseFlag} |\n`;
  }
  summary += `\n**cdsco_class match: ${l2Match}/${layer2.length} (${((l2Match/Math.max(layer2.length,1))*100).toFixed(0)}%)** — bar: ≥9/10 (90%) for lock\n\n`;
  summary += `Subjective prose review (5 cases) is human-only — see raw cards in \`layer-2-synthesizer.json\` field \`_opus_card.gaps[*]\` and similar narrative fields. Compare side-by-side.\n\n`;

  summary += `## layer 3 — draft-pack (Opus → Sonnet 4.6, with caching)\n\n`;
  summary += `| case | Opus cdsco | Opus sec | Sonnet cdsco | Sonnet sec | cdsco match | sec match | parse |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of layer3) {
    const opusSec = r._opus_pack ? Object.keys(r._opus_pack).length : "?";
    const sonnetSec = r._sonnet_pack ? Object.keys(r._sonnet_pack).length : "?";
    const parseFlag = `O:${r.opus.parse_ok ? "✓" : "✗"}/${r.opus.attempts}att S:${r.sonnet.parse_ok ? "✓" : "✗"}/${r.sonnet.attempts}att`;
    summary += `| ${r.case_id} | ${r.opus.cdsco_class} | ${opusSec} | ${r.sonnet.cdsco_class} | ${sonnetSec} | ${r.cdsco_match ? "✓" : "✗"} | ${r.section_count_match ? "✓" : "✗"} | ${parseFlag} |\n`;
  }
  summary += `\nManual PDF/prose review on first 2 sections is human-only. Raw structured packs in \`layer-3-draft-pack.json\`.\n\n`;

  summary += `## next steps\n\n`;
  summary += `1. Founder reviews subjective prose calls (synth narrative on 5 cases, draft-pack first 2 sections).\n`;
  summary += `2. Decide locks per bar criteria in sprint-1.md.\n`;
  summary += `3. If pre-router locks: stays as-is (already committed in b031a05).\n`;
  summary += `4. If synth locks: apply model swap to claude-sonnet-4-6 + add caching back. (Caching was disabled FOR EVAL ONLY; prod should re-enable.)\n`;
  summary += `5. If draft-pack locks: apply model swap to claude-sonnet-4-6 (caching already in code).\n`;
  summary += `6. Single batched commit: \`feat(engine): rightsize models — Haiku/Sonnet/Sonnet — eval validated\`.\n`;

  fs.writeFileSync(path.join(outDir, "summary.md"), summary);

  console.log(`\n${"=".repeat(70)}`);
  console.log(`DONE. Grand total: $${grandTotal.toFixed(4)} (budget: $5.88)`);
  console.log(`Outputs:`);
  console.log(`  ${path.join(outDir, "layer-1-pre-router.json")}`);
  console.log(`  ${path.join(outDir, "layer-2-synthesizer.json")}`);
  console.log(`  ${path.join(outDir, "layer-3-draft-pack.json")}`);
  console.log(`  ${path.join(outDir, "summary.md")}`);
  console.log(`${"=".repeat(70)}\n`);
}

main().catch((e) => {
  console.error("\nEval failed:", e);
  process.exit(1);
});
