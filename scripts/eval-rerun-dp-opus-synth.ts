/**
 * Sprint 1 Story 1.2 — draft-pack re-run with Opus-synth output as input.
 *
 * Reasoning: original Layer 3 fed the Sonnet-synth output to both Opus and
 * Sonnet draft-pack branches. Now that we're locking synth on Opus 4.7, we
 * need to confirm the draft-pack A/B holds when the upstream input changes
 * to Opus-synth output.
 *
 * Critical case: CP-016. Opus synth assigned `cdsco_class: null` +
 * `medical_device_status: "wellness_carve_out"`. The draft-pack schema
 * requires cdsco_class ∈ {A,B,C,D} (not nullable), so the draft-pack
 * MUST pick a class. The real question: does the draft-pack prose
 * acknowledge the wellness positioning even while compelled to assign a
 * fallback class?
 *
 * Run:
 *   npx tsx scripts/eval-rerun-dp-opus-synth.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import {
  DRAFT_PACK_SYSTEM_PROMPT,
  DraftPackContentSchema,
} from "../lib/engine/draft-pack-prompts";

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
  console.error("ANTHROPIC_API_KEY missing");
  process.exit(1);
}

// ---- models + pricing ----
const SONNET = "claude-sonnet-4-6";
const OPUS = "claude-opus-4-7";

type Pricing = { input: number; output: number; cache_write: number; cache_read: number };
const PRICING: Record<string, Pricing> = {
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

async function runDraftPack(
  model: string,
  input: { productName: string; oneLiner: string; readinessCard: unknown }
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

async function main() {
  // Load existing layer-2 data — we want the Opus synth output for each case.
  const layer2 = JSON.parse(
    fs.readFileSync("data/eval/sprint-1/layer-2-synthesizer.json", "utf8")
  ) as Array<{
    case_id: string;
    product_name: string;
    one_liner: string;
    _opus_card: Record<string, unknown> | null;
  }>;

  const DP_IDS = ["CP-016", "CP-017", "CP-019", "CP-022", "CP-024"];

  type Row = {
    case_id: string;
    product_name: string;
    opus_synth_input: {
      cdsco_class: string | null;
      medical_device_status: string | null;
    };
    opus: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    sonnet: { cdsco_class: string | null; cost_usd: number; elapsed_ms: number; usage: Usage; parse_ok: boolean; attempts: number };
    cdsco_match: boolean;
    section_count_match: boolean;
    _opus_pack: Record<string, unknown> | null;
    _sonnet_pack: Record<string, unknown> | null;
  };

  const results: Row[] = [];

  console.log(`\n${"=".repeat(70)}`);
  console.log(`Layer 3 RERUN — draft-pack with Opus-synth input — 5 cases, with caching`);
  console.log(`${"=".repeat(70)}`);

  for (const cid of DP_IDS) {
    const r = layer2.find((x) => x.case_id === cid);
    if (!r || !r._opus_card) {
      console.log(`  ${cid} skipped (no Opus synth output cached)`);
      continue;
    }
    const opusCard = r._opus_card;
    const inputClassif =
      (opusCard.classification as { cdsco_class?: string | null; medical_device_status?: string } | undefined) ?? {};
    const inputCdsco = (inputClassif.cdsco_class as string | null) ?? null;
    const inputStatus = (inputClassif.medical_device_status as string) ?? null;

    const label = `${cid} ${r.product_name.substring(0, 28).padEnd(28)} (synth: cdsco_class=${inputCdsco}, status=${inputStatus})`;
    process.stdout.write(`  ${label} ... `);

    const dpInput = {
      productName: r.product_name,
      oneLiner: r.one_liner,
      readinessCard: opusCard,
    };
    const opus = await runDraftPack(OPUS, dpInput);
    const sonnet = await runDraftPack(SONNET, dpInput);

    const opusOutClass =
      ((opus.output?.risk_classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;
    const sonnetOutClass =
      ((sonnet.output?.risk_classification as { cdsco_class?: string } | undefined)
        ?.cdsco_class as string) ?? null;

    const sectionCountMatch =
      !!opus.output && !!sonnet.output &&
      Object.keys(opus.output).length === Object.keys(sonnet.output).length;

    results.push({
      case_id: cid,
      product_name: r.product_name,
      opus_synth_input: { cdsco_class: inputCdsco, medical_device_status: inputStatus },
      opus: {
        cdsco_class: opusOutClass,
        cost_usd: opus.cost,
        elapsed_ms: opus.elapsed_ms,
        usage: opus.usage,
        parse_ok: opus.parse_ok,
        attempts: opus.attempts,
      },
      sonnet: {
        cdsco_class: sonnetOutClass,
        cost_usd: sonnet.cost,
        elapsed_ms: sonnet.elapsed_ms,
        usage: sonnet.usage,
        parse_ok: sonnet.parse_ok,
        attempts: sonnet.attempts,
      },
      cdsco_match: opusOutClass === sonnetOutClass,
      section_count_match: sectionCountMatch,
      _opus_pack: opus.output,
      _sonnet_pack: sonnet.output,
    });
    console.log(
      `O=${opusOutClass}/sec=${opus.output ? Object.keys(opus.output).length : "?"} S=${sonnetOutClass}/sec=${sonnet.output ? Object.keys(sonnet.output).length : "?"}`
    );
  }

  fs.writeFileSync(
    "data/eval/sprint-1/layer-3-rerun-opus-synth.json",
    JSON.stringify(results, null, 2)
  );

  // Cost totals
  const opusCost = results.reduce((s, r) => s + r.opus.cost_usd, 0);
  const sonnetCost = results.reduce((s, r) => s + r.sonnet.cost_usd, 0);
  const total = opusCost + sonnetCost;
  console.log(`\n  Opus draft-pack total: $${opusCost.toFixed(4)} (${results.length} calls)`);
  console.log(`  Sonnet draft-pack total: $${sonnetCost.toFixed(4)} (${results.length} calls)`);
  console.log(`  Total spend on rerun: $${total.toFixed(4)} (budget: $1.50)`);

  // CP-016 specific check — wellness carry-over question
  const cp16 = results.find((r) => r.case_id === "CP-016");
  if (cp16) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`CP-016 wellness carry-over check (the high-risk case):`);
    console.log(`${"=".repeat(70)}`);
    console.log(`Input synth: cdsco_class=${cp16.opus_synth_input.cdsco_class}, status=${cp16.opus_synth_input.medical_device_status}`);
    console.log(`Opus draft-pack output: cdsco_class=${cp16.opus.cdsco_class}`);
    console.log(`Sonnet draft-pack output: cdsco_class=${cp16.sonnet.cdsco_class}`);
    console.log(`(Schema requires A/B/C/D; both forced to pick. Prose acknowledgment of wellness is what matters — see saved JSON for full prose review.)`);
  }

  console.log(`\nOutput: data/eval/sprint-1/layer-3-rerun-opus-synth.json\n`);
}

main().catch((e) => {
  console.error("\nRerun failed:", e);
  process.exit(1);
});
