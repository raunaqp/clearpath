/**
 * Story 1.3.5 — production parity test.
 *
 * Why this exists: the Story 1.3 recon scripts (`recon-50.ts`,
 * `eval-1-2-batched.ts`) had permissive fallback extraction that masked the
 * Zod schema-validation bug eventually fixed in Story 1.3.5. Future eval
 * pipelines must exercise the *actual* production code path, not parallel
 * scoring-only logic. This script does exactly that.
 *
 * What it does:
 *   1. Builds a realistic `SynthesizerInput` for a known wellness case
 *      (CP-001 SymptomGuide) — the kind of input that triggered
 *      `trl.next_milestone: null` rejections before the schema fix.
 *   2. Calls `runSynthesizer()` from `lib/engine/synthesizer.ts` directly.
 *      This is the same function the API route calls. No fallback,
 *      no permissive extraction — if `ReadinessCardSchema.parse()` fails
 *      twice, the function throws at line 179 just like prod would.
 *   3. Asserts the call returns a valid `ReadinessCard`.
 *   4. Asserts `cdsco_class === null` (wellness expected outcome).
 *   5. Asserts `trl` is `null` OR a `trl` object (whichever shape Opus
 *      emitted — both are now schema-valid post Story 1.3.5).
 *
 * If anything throws, exit 1 with a clear failure message. Otherwise exit 0.
 *
 * Run:
 *   npx tsx scripts/test-prod-parity.ts
 *
 * Cost: 1 Opus call (~$0.10–0.15 list, no batch discount available for
 * sync calls). Acceptable for a CI/sanity test.
 */

import * as fs from "fs";
import * as path from "path";
import {
  runSynthesizer,
  type SynthesizerInput,
} from "../lib/engine/synthesizer";

// Load .env.local so ANTHROPIC_API_KEY is available.
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

// CP-001 SymptomGuide — chosen because:
//   - It's a wellness/non-device case (expected_cdsco_class === null in
//     the calibration set)
//   - This is exactly the class of case that triggered the latent
//     parse-validate-throw bug before the Story 1.3.5 schema fix.
const TEST_INPUT: SynthesizerInput = {
  assessmentId: "PARITY-CP-001",
  oneLiner:
    "Consumer symptom education app that explains common symptoms and suggests when to consult a doctor.",
  productType: "product",
  urlContent: null,
  pdfSummaries: [],
  wizardAnswers: {},
  detectedSignals: {
    certifications: [],
    partnerships: [],
    prior_regulatory_work: [],
    has_physical_facility: "no",
    facility_details: null,
  },
  conflictDetails: null,
};

async function main() {
  console.log("[parity] Calling runSynthesizer (production path) on wellness case CP-001 SymptomGuide…");
  const t0 = Date.now();

  let result;
  try {
    result = await runSynthesizer(TEST_INPUT);
  } catch (err) {
    console.error(
      "\n[parity] ✗ FAIL — runSynthesizer threw:",
      err instanceof Error ? err.message : err
    );
    console.error(
      "\nThis is the latent prod bug Story 1.3.5 was supposed to fix.\n" +
        "If this fires after the schema loosening landed, either:\n" +
        "  - The schema change didn't reach the resolved import path, OR\n" +
        "  - Opus produced a different shape that's still schema-invalid.\n"
    );
    process.exit(1);
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // ---- assertions ----
  const failures: string[] = [];

  if (!result.card) {
    failures.push("result.card is missing");
  }
  const cls = result.card?.classification?.cdsco_class;
  if (cls !== null) {
    failures.push(
      `expected classification.cdsco_class === null for wellness case; got ${JSON.stringify(cls)}`
    );
  }
  // trl: must be `null`, or `undefined`, or an object (Story 1.3.5
  // accepts all three). Anything else is a schema regression.
  const trl = result.card?.trl;
  const trlOk =
    trl === null || trl === undefined || (typeof trl === "object" && trl !== null);
  if (!trlOk) {
    failures.push(`trl has unexpected shape: ${JSON.stringify(trl)}`);
  }

  // Echo what we got, then verdict.
  console.log(`[parity] returned in ${elapsed}s`);
  console.log(`[parity] cdsco_class: ${cls === null ? "null" : cls}`);
  console.log(
    `[parity] medical_device_status: ${result.card?.classification?.medical_device_status}`
  );
  console.log(
    `[parity] trl shape: ${trl === null ? "null" : trl === undefined ? "(omitted)" : "object"}`
  );

  if (failures.length > 0) {
    console.error(`\n[parity] ✗ FAIL — ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `\n[parity] ✓ PASS — ReadinessCardSchema.parse() succeeded on the production path. Story 1.3.5 schema fix verified end-to-end.`
  );
}

main().catch((e) => {
  console.error("[parity] unexpected error:", e);
  process.exit(1);
});
