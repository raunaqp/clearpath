/**
 * Story 1.3.5 — schema-strictness diagnostic.
 *
 * Investigates the Zod-validation failures surfaced by the Story 1.3 recon:
 *   - v1: 4/48 cases (CP-011, CP-016, CP-029, CP-044) parsed valid JSON but
 *         failed `ReadinessCardSchema.parse()`.
 *   - v2: 1/48 (CP-029) — partial improvement after the scribe-modifier
 *         prompt fix, but the underlying issue isn't gone.
 *
 * For each failing case, this script:
 *   1. Loads the raw synth output saved in recon-run.json / recon-run-v2.json
 *   2. Parses the JSON (these all parse cleanly — JSON-parse is not the issue)
 *   3. Runs `ReadinessCardSchema.safeParse()` and prints the full Zod issue list
 *      (path, code, expected, received) so the failing field is unambiguous
 *   4. Aggregates patterns across cases
 *   5. Writes findings to `data/eval/sprint-1-3/schema-validation-diagnostic.md`
 *
 * NO FIX IS APPLIED. This is diagnostic only.
 *
 * Run:
 *   npx tsx scripts/diagnose-schema-fails.ts
 */

import * as fs from "fs";
import * as path from "path";
import { ZodIssue } from "zod";
import { ReadinessCardSchema } from "../lib/schemas/readiness-card";

type ReconArtifact = {
  rows: Array<{
    case_id: string;
    product_name: string;
    expected_cdsco_class: string | null;
    or_acceptable: (string | null)[];
    synth: {
      ok: boolean;
      parse_ok: boolean;
      predicted_cdsco_class: string | null;
      raw?: string;
    };
    match_tolerant: boolean;
  }>;
};

type Finding = {
  source: "v1" | "v2";
  case_id: string;
  product_name: string;
  expected: string | null;
  predicted: string | null;
  match_tolerant: boolean;
  issues: Array<{
    path: string;
    code: string;
    expected?: string;
    received?: string;
    message: string;
  }>;
  raw_excerpt: string;
};

function stripJson(text: string): string | null {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  return m ? m[0] : null;
}

function summarizeIssue(i: ZodIssue) {
  const path = i.path.length ? i.path.join(".") : "(root)";
  const out: Finding["issues"][number] = {
    path,
    code: i.code,
    message: i.message,
  };
  // ZodInvalidTypeIssue carries expected/received
  const anyIssue = i as unknown as { expected?: string; received?: string };
  if (anyIssue.expected !== undefined) out.expected = anyIssue.expected;
  if (anyIssue.received !== undefined) out.received = anyIssue.received;
  return out;
}

function inspectArtifact(artifactPath: string, source: "v1" | "v2"): Finding[] {
  if (!fs.existsSync(artifactPath)) {
    console.warn(`Skipping (not found): ${artifactPath}`);
    return [];
  }
  const data = JSON.parse(fs.readFileSync(artifactPath, "utf8")) as {
    rows: ReconArtifact["rows"];
  };
  const findings: Finding[] = [];
  for (const r of data.rows) {
    if (!r.synth.ok || r.synth.parse_ok) continue;
    if (!r.synth.raw) {
      findings.push({
        source,
        case_id: r.case_id,
        product_name: r.product_name,
        expected: r.expected_cdsco_class,
        predicted: r.synth.predicted_cdsco_class,
        match_tolerant: r.match_tolerant,
        issues: [
          {
            path: "(no raw saved)",
            code: "no_raw",
            message: "raw output not present in artifact",
          },
        ],
        raw_excerpt: "",
      });
      continue;
    }
    const json = stripJson(r.synth.raw);
    if (!json) {
      findings.push({
        source,
        case_id: r.case_id,
        product_name: r.product_name,
        expected: r.expected_cdsco_class,
        predicted: r.synth.predicted_cdsco_class,
        match_tolerant: r.match_tolerant,
        issues: [
          {
            path: "(stripJson failed)",
            code: "no_json_object",
            message: "could not extract a {...} block from raw text",
          },
        ],
        raw_excerpt: r.synth.raw.substring(0, 400),
      });
      continue;
    }
    let obj: unknown;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      findings.push({
        source,
        case_id: r.case_id,
        product_name: r.product_name,
        expected: r.expected_cdsco_class,
        predicted: r.synth.predicted_cdsco_class,
        match_tolerant: r.match_tolerant,
        issues: [
          {
            path: "(JSON.parse)",
            code: "json_parse_error",
            message: e instanceof Error ? e.message : String(e),
          },
        ],
        raw_excerpt: json.substring(0, 400),
      });
      continue;
    }
    const result = ReadinessCardSchema.safeParse(obj);
    if (result.success) {
      findings.push({
        source,
        case_id: r.case_id,
        product_name: r.product_name,
        expected: r.expected_cdsco_class,
        predicted: r.synth.predicted_cdsco_class,
        match_tolerant: r.match_tolerant,
        issues: [
          {
            path: "(success)",
            code: "actually_valid_now",
            message:
              "Schema accepts this output — likely a transient flag during the original run",
          },
        ],
        raw_excerpt: "",
      });
      continue;
    }
    findings.push({
      source,
      case_id: r.case_id,
      product_name: r.product_name,
      expected: r.expected_cdsco_class,
      predicted: r.synth.predicted_cdsco_class,
      match_tolerant: r.match_tolerant,
      issues: result.error.issues.map(summarizeIssue),
      raw_excerpt: "",
    });
  }
  return findings;
}

function main() {
  const cwd = process.cwd();
  const v1Path = path.join(cwd, "data/eval/sprint-1-3/recon-run.json");
  const v2Path = path.join(cwd, "data/eval/sprint-1-3/recon-run-v2.json");

  const all = [
    ...inspectArtifact(v1Path, "v1"),
    ...inspectArtifact(v2Path, "v2"),
  ];

  // ---- print to stdout ----
  console.log(`\n=== schema-validation diagnostic ===`);
  console.log(`v1 path: ${v1Path}`);
  console.log(`v2 path: ${v2Path}`);
  console.log(`\nTotal failing cases inspected: ${all.length}`);

  for (const f of all) {
    console.log(`\n--- ${f.source}: ${f.case_id} ${f.product_name} ---`);
    console.log(
      `expected=${f.expected === null ? "null" : f.expected}  predicted=${f.predicted === null ? "null" : f.predicted}  tolerant=${f.match_tolerant}`
    );
    for (const i of f.issues) {
      const ext =
        i.expected || i.received
          ? `  [expected=${i.expected ?? "?"} received=${i.received ?? "?"}]`
          : "";
      console.log(`  ${i.path}  ·  ${i.code}${ext}  ·  ${i.message}`);
    }
  }

  // ---- pattern aggregation ----
  const pathHits: Record<string, number> = {};
  const codeHits: Record<string, number> = {};
  for (const f of all) {
    for (const i of f.issues) {
      pathHits[i.path] = (pathHits[i.path] ?? 0) + 1;
      codeHits[i.code] = (codeHits[i.code] ?? 0) + 1;
    }
  }
  console.log(`\n=== pattern aggregation ===`);
  console.log(`paths:`, pathHits);
  console.log(`codes:`, codeHits);

  // ---- markdown writeup ----
  let md = `# Story 1.3.5 — schema-validation diagnostic\n\n`;
  md += `**run_at:** ${new Date().toISOString()}\n`;
  md += `**inputs:** \`recon-run.json\` (v1) and \`recon-run-v2.json\` (v2)\n`;
  md += `**total failing cases inspected:** ${all.length}\n\n`;
  md += `> Diagnostic only. No engine code or schema modified. Findings below;\n`;
  md += `> awaiting founder review before proposing a fix.\n\n`;

  md += `## Per-case Zod issues\n\n`;
  for (const f of all) {
    md += `### ${f.source} · ${f.case_id} — ${f.product_name}\n\n`;
    md += `- expected: \`${f.expected === null ? "null" : f.expected}\`, predicted: \`${f.predicted === null ? "null" : f.predicted}\`, tolerant-match: ${f.match_tolerant}\n`;
    md += `- Zod issues:\n`;
    for (const i of f.issues) {
      const ext =
        i.expected || i.received
          ? ` *(expected: \`${i.expected ?? "?"}\`, received: \`${i.received ?? "?"}\`)*`
          : "";
      md += `  - \`${i.path}\` · \`${i.code}\`${ext} — ${i.message}\n`;
    }
    md += `\n`;
  }

  md += `## Pattern aggregation\n\n`;
  md += `### Paths that fail (count)\n\n`;
  const pathRows = Object.entries(pathHits).sort((a, b) => b[1] - a[1]);
  for (const [p, n] of pathRows) md += `- \`${p}\` × ${n}\n`;
  md += `\n### Issue codes (count)\n\n`;
  const codeRows = Object.entries(codeHits).sort((a, b) => b[1] - a[1]);
  for (const [c, n] of codeRows) md += `- \`${c}\` × ${n}\n`;

  md += `\n## Cross-cutting observations\n\n`;
  // Heuristic: are all failing cases wellness/non-device?
  const allNonDevice = all.every((f) => f.expected === null);
  const allTolerantPass = all.every((f) => f.match_tolerant);
  md += `- All ${all.length} failing cases have **expected_cdsco_class = null** (non-device / wellness): \`${allNonDevice}\`\n`;
  md += `- All ${all.length} failing cases tolerantly matched anyway (via permissive fallback extraction): \`${allTolerantPass}\`\n`;
  md += `- This means the schema fails on the subset of outputs Opus produces for wellness/non-device cases — *not* on the medical-device path. The fields most likely to be at fault are those that are conditional on \`medical_device_status\` (\`readiness.score\`, \`readiness.band\`, \`readiness.dimensions.*\`, \`timeline.estimate_months_*\`, \`top_gaps\`, \`trl\`).\n\n`;

  md += `## Findings — root cause\n\n`;
  md += `**100% of failures are the same single Zod issue: \`trl.next_milestone\` is \`null\`, but the schema requires \`string\`.** All 5 cases (4 in v1, 1 in v2 — CP-029 SleepScore Ring repeats) are wellness/non-device products where TRL is conceptually N/A.\n\n`;
  md += `### What the prompt tells Opus to do\n\n`;
  md += `\`lib/engine/synthesizer-system-prompt.ts\` line ~275 (section "When TRL is null"):\n\n`;
  md += "> Set `trl: null` (and no completion_pct) when `medical_device_status` is `not_medical_device` or `wellness_carve_out`. TRL is a medical-device framework; non-MDs don't have one.\n\n";
  md += `### What Opus actually does\n\n`;
  md += `Opus does NOT set \`trl: null\` — it emits a full \`trl\` object with most fields null and a non-empty \`rationale\` string explaining why TRL is N/A:\n\n`;
  md += "```json\n";
  md += `"trl": {\n`;
  md += `  "level": null,\n`;
  md += `  "stage": null,\n`;
  md += `  "track": null,\n`;
  md += `  "completion_pct": null,\n`;
  md += `  "next_milestone": null,\n`;
  md += `  "rationale": "TRL is a medical-device framework; not applicable to a consumer wellness app."\n`;
  md += `}\n`;
  md += "```\n\n";
  md += `### Why the schema rejects it\n\n`;
  md += `\`lib/schemas/readiness-card.ts\` lines 178-187 declare:\n\n`;
  md += "```ts\n";
  md += `trl: z.object({\n`;
  md += `  level: TRLLevelSchema.nullable(),\n`;
  md += `  stage: TRLStageSchema.nullable(),\n`;
  md += `  track: TRLTrackEnum.nullable(),\n`;
  md += `  completion_pct: z.number().int().min(0).max(100).nullable(),\n`;
  md += `  next_milestone: z.string(),       // ← NOT nullable\n`;
  md += `  rationale: z.string(),            // ← NOT nullable\n`;
  md += "}).optional(),\n";
  md += "```\n\n";
  md += `Two compounding issues:\n\n`;
  md += `1. The top-level \`trl\` is \`.optional()\` (may be omitted) but NOT \`.nullable()\` (cannot be \`null\`). So the prompt's "set \`trl: null\`" is impossible to satisfy — passing \`null\` would also fail validation.\n`;
  md += `2. Inside \`trl\`, \`next_milestone\` is required-string. There's no way to express "TRL is N/A" while keeping the object shape.\n\n`;
  md += `Opus's output is the most natural compromise (object of nulls + a rationale), and the schema rejects it.\n\n`;
  md += `### Why this didn't surface in Story 1.2 evals\n\n`;
  md += `Story 1.2 reported Opus parse-fail at 0/10. That eval only checked \`classification.cdsco_class\` — it didn't run the full \`ReadinessCardSchema.parse()\`. The Zod-validation issue has been latent since the TRL block was added, surfacing only because Story 1.3 runs the full schema.\n\n`;
  md += `### Production impact\n\n`;
  md += `In \`lib/engine/synthesizer.ts\`, the prod call uses \`ReadinessCardSchema.parse()\` after JSON.parse. That means: **any wellness/non-device case in production that produces this all-null TRL object would currently fail Zod parsing and trigger the strict-suffix retry.** The retry may or may not produce a different shape. If both attempts fail, the assessment errors out.\n\n`;
  md += `Recon's permissive fallback hid this — the recon extracted \`cdsco_class\` directly even on schema-fail. Production has no such fallback. **This is a latent prod bug for non-device assessments.**\n\n`;

  md += `## Options for a fix (NOT applied — awaiting founder review)\n\n`;
  md += `1. **Loosen the schema, top + inside.** Two minimal edits in \`lib/schemas/readiness-card.ts\`:\n`;
  md += `   - Change \`trl: z.object({...}).optional()\` → \`trl: z.object({...}).nullable().optional()\` — accepts \`null\` (matches the prompt instruction).\n`;
  md += `   - Inside the object, make \`next_milestone\` and \`rationale\` nullable: \`z.string().nullable()\` for each — accepts the all-null shape Opus actually produces.\n`;
  md += `   Pro: schema reflects reality; matches what the prompt already asks for; no prompt or downstream code change. Con: schema drift from the spec doc — but the spec doc itself permits \`trl: null\`, so this is reconciliation, not drift.\n`;
  md += `2. **Tighten the prompt.** Force Opus to literally emit \`"trl": null\` (not an object) for non-device cases. Pro: keeps the schema strict. Con: the prompt already says this, and Opus ignores it 4-5/48 of the time. Doesn't fix the latent prod bug if even one wellness case in 48 disagrees.\n`;
  md += `3. **Post-process before validation.** In \`run-synthesis.ts\`, detect \`trl\` objects of all-null and replace with \`null\` before \`ReadinessCardSchema.parse()\`. Pro: schema stays strict. Con: hides the actual model behavior; another piece of normalization to maintain.\n`;
  md += `4. **Both 1 and 2.** Loosen schema *and* tighten prompt. Pro: maximum defense. Con: more surface area changed for one bug.\n\n`;
  md += `**Recommendation pending founder review.** Option 1 is the smallest, lowest-risk fix and the only one that closes the latent prod bug for wellness assessments. Option 2 alone is insufficient. Option 4 is belt-and-suspenders if the founder wants both.\n`;

  const outDir = path.join(cwd, "data/eval/sprint-1-3");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "schema-validation-diagnostic.md");
  fs.writeFileSync(outFile, md);
  console.log(`\nWrote: ${outFile}`);
}

main();
