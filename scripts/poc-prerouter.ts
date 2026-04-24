/**
 * POC: pre-router classifier
 *
 * Proves Sonnet can classify the 4 calibration cases before we wire supabase,
 * URL fetch, and PDF handling. Run with: npm run poc:prerouter
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually (plain node doesn't do this)
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are ClearPath's pre-router classifier. ClearPath is a regulatory readiness engine for Indian digital-health (healthtech) founders. Your job: given a founder's submission, classify the entity, so the rest of the engine can route correctly.

## Classification types (pick ONE \`product_type\`)

- **product** — A single healthcare offering (software, device, or app) aimed at patients, clinicians, labs, hospitals, or payers. Examples: AI scribe, cancer screening tool, MRI analysis, condition-specific telehealth, wellness/habit app. Most real submissions land here.
- **platform** — A healthcare offering with multiple distinct features where at least one MIGHT be a medical device (e.g. a data platform that also runs diagnostic scoring). Needs the decomposer to scope each feature.
- **hardware_software** — A physical medical device with a companion app / firmware / algorithm. Device determines the base class; software typically inherits.
- **export_only** — A manufacturer whose entire business is exporting to US/EU/global markets with no Indian sales. Still needs CDSCO MD-5 manufacturing license + MD-20 NOC, so runs the wizard.
- **regulator** — A government mission, framework, or public infrastructure body. NOT a product subject to CDSCO. Examples: ABDM, National Digital Health Mission, NABH, NABL. Reject.
- **investor** — A VC fund, accelerator, or incubator investing in healthtech. NOT a product. Examples: Rainmatter, W Health, 100x.VC. Reject.
- **out_of_scope** — NOT a healthcare product at all. Fintech, edtech, gaming, generic SaaS, e-commerce, logistics, HR tools, agritech. ClearPath only covers Indian healthcare regulations — these submissions are outside scope. Reject.

## Authority when sources disagree

Submission may include a one-liner + URL content + PDF summaries. If they classify the product differently, trust this order: **PDFs > URL content > one-liner**. Founders often use investor-deck language ("data platform", "infrastructure", "analytics") to describe what is in reality a regulated medical device. Set \`conflict_detected: true\` with a one-line \`conflict_note\` when this happens. Do not silently override.

## Calibration examples

1. One-liner: "National Health Authority mission for digital health consent and ABHA IDs"
   → product_type: "regulator", next_action: "reject". ABDM is the regulator itself.

2. One-liner: "AI-powered scribe that transcribes and summarises doctor-patient consultations"
   → product_type: "product", next_action: "run_wizard". Single healthcare offering, likely SaMD.

3. One-liner: "women's health data platform"; URL content mentions AI cervical cancer screening from colposcopy images
   → product_type: "product", next_action: "run_wizard", conflict_detected: true. Trust URL — this is a diagnostic tool misdescribed as a data platform.

4. One-liner: "Payment platform that helps businesses simplify collection and distribution of payments to vendors and employees"
   → product_type: "out_of_scope", next_action: "reject". Fintech — no healthcare regulation relevance.

5. One-liner: "Wellness and calorie-tracking habit app"
   → product_type: "product", next_action: "run_wizard". Healthcare-adjacent; wizard will determine whether wellness carve-out applies.

6. One-liner: "Early-stage VC fund investing in Indian digital health startups"
   → product_type: "investor", next_action: "reject".

## Output format

Return ONLY a single JSON object — no markdown fences, no prose before or after.

{
  "product_type": "product" | "platform" | "hardware_software" | "export_only" | "regulator" | "investor" | "out_of_scope",
  "next_action": "run_wizard" | "run_decomposer" | "reject",
  "rejection_reason": string | null,
  "rationale": string,
  "conflict_detected": boolean,
  "conflict_note": string | null
}

Routing rules (apply strictly):
- product, hardware_software, export_only → next_action: "run_wizard"
- platform → next_action: "run_decomposer"
- regulator, investor, out_of_scope → next_action: "reject"

When next_action is "reject", \`rejection_reason\` must be a polite 1-sentence explanation the user will see. Otherwise null.`;

type ExpectedOutcome = {
  product_type: string;
  next_action: string;
  conflict_detected?: boolean;
};

type TestCase = {
  name: string;
  oneLiner: string;
  urlContent?: string;
  expected: ExpectedOutcome;
};

const TEST_CASES: TestCase[] = [
  {
    name: "ABDM (regulator)",
    oneLiner:
      "National Health Authority mission for a digital health consent layer, ABHA IDs, and the unified health interface",
    expected: { product_type: "regulator", next_action: "reject" },
  },
  {
    name: "EkaScribe (product, healthcare)",
    oneLiner:
      "AI-powered medical scribe that transcribes and summarises doctor-patient consultations, integrates with hospital EMRs",
    expected: { product_type: "product", next_action: "run_wizard" },
  },
  {
    name: "CerviAI-style conflict",
    oneLiner: "Women's health data platform",
    urlContent:
      "AI-powered cervical cancer screening from colposcopy images. A diagnostic decision-support tool for gynaecologists. FDA-class equivalent device under evaluation.",
    expected: {
      product_type: "product",
      next_action: "run_wizard",
      conflict_detected: true,
    },
  },
  {
    name: "Fintech payment platform (out_of_scope)",
    oneLiner:
      "Payment platform that helps businesses simplify the collection and distribution of payments to vendors and employees",
    expected: { product_type: "out_of_scope", next_action: "reject" },
  },
];

type PocResult = {
  name: string;
  expected: ExpectedOutcome;
  actual: Record<string, unknown>;
  pass: boolean;
  failReasons: string[];
  latency_ms: number;
  cost_usd: number;
  usage: {
    input_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
    output_tokens: number;
  };
};

// Approx Sonnet 4.6 pricing per 1M tokens
const PRICE = {
  input: 3.0,
  cache_write: 3.75,
  cache_read: 0.3,
  output: 15.0,
};

function computeCost(usage: PocResult["usage"]) {
  return (
    (usage.input_tokens * PRICE.input) / 1_000_000 +
    (usage.cache_creation_input_tokens * PRICE.cache_write) / 1_000_000 +
    (usage.cache_read_input_tokens * PRICE.cache_read) / 1_000_000 +
    (usage.output_tokens * PRICE.output) / 1_000_000
  );
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function runCase(
  client: Anthropic,
  tc: TestCase
): Promise<PocResult> {
  const start = Date.now();

  const userMessage = `One-liner: ${tc.oneLiner}
URL content: ${tc.urlContent || "N/A"}
PDF summaries: N/A`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const latency_ms = Date.now() - start;

  const firstBlock = response.content[0];
  const text = firstBlock.type === "text" ? firstBlock.text : "";
  const parsed = extractJson(text) || { error: "JSON_PARSE_FAILED", raw: text };

  const failReasons: string[] = [];
  if (parsed.product_type !== tc.expected.product_type) {
    failReasons.push(
      `product_type: expected ${tc.expected.product_type}, got ${parsed.product_type}`
    );
  }
  if (parsed.next_action !== tc.expected.next_action) {
    failReasons.push(
      `next_action: expected ${tc.expected.next_action}, got ${parsed.next_action}`
    );
  }
  if (
    tc.expected.conflict_detected !== undefined &&
    parsed.conflict_detected !== tc.expected.conflict_detected
  ) {
    failReasons.push(
      `conflict_detected: expected ${tc.expected.conflict_detected}, got ${parsed.conflict_detected}`
    );
  }

  const usage = {
    input_tokens: response.usage.input_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens || 0,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens || 0,
    output_tokens: response.usage.output_tokens,
  };

  return {
    name: tc.name,
    expected: tc.expected,
    actual: parsed,
    pass: failReasons.length === 0,
    failReasons,
    latency_ms,
    cost_usd: computeCost(usage),
    usage,
  };
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY missing. Set it in .env.local.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log(`\nPre-router POC · model=${MODEL} · ${TEST_CASES.length} cases`);
  console.log("=".repeat(70));

  const results: PocResult[] = [];
  for (const tc of TEST_CASES) {
    const r = await runCase(client, tc);
    results.push(r);

    const marker = r.pass ? "✓ PASS" : "✗ FAIL";
    console.log(`\n${marker}  ${r.name}`);
    console.log(
      `  expected: product_type=${r.expected.product_type} next_action=${r.expected.next_action}${
        r.expected.conflict_detected !== undefined
          ? ` conflict=${r.expected.conflict_detected}`
          : ""
      }`
    );
    console.log(
      `  actual:   product_type=${r.actual.product_type} next_action=${r.actual.next_action}${
        r.actual.conflict_detected !== undefined
          ? ` conflict=${r.actual.conflict_detected}`
          : ""
      }`
    );
    if (typeof r.actual.rationale === "string") {
      console.log(`  rationale: ${r.actual.rationale}`);
    }
    if (r.actual.conflict_note) {
      console.log(`  conflict_note: ${r.actual.conflict_note}`);
    }
    if (r.actual.rejection_reason) {
      console.log(`  rejection_reason: ${r.actual.rejection_reason}`);
    }
    if (!r.pass) {
      for (const reason of r.failReasons) console.log(`  ! ${reason}`);
    }
    console.log(
      `  latency: ${r.latency_ms}ms · cost: $${r.cost_usd.toFixed(4)} · tokens: in=${r.usage.input_tokens} cache_read=${r.usage.cache_read_input_tokens} cache_write=${r.usage.cache_creation_input_tokens} out=${r.usage.output_tokens}`
    );
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const totalCost = results.reduce((s, r) => s + r.cost_usd, 0);
  const totalCacheRead = results.reduce(
    (s, r) => s + r.usage.cache_read_input_tokens,
    0
  );

  console.log("\n" + "=".repeat(70));
  console.log(
    `Result: ${passed}/${total} passed · total cost: $${totalCost.toFixed(4)} · cache_read tokens: ${totalCacheRead}`
  );
  if (passed === total) {
    console.log("POC green — safe to scale to the full feature.");
  } else {
    console.log("POC failing — iterate the system prompt before scaling.");
  }

  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => {
  console.error("POC crashed:", err);
  process.exit(1);
});
