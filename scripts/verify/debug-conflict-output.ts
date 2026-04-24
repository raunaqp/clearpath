/**
 * One-off: runs the CerviAI-style conflict case through runPreRouter
 * and prints the full PreRouterResult (including raw_model_response).
 * Does not write to DB. Run: npx tsx scripts/show-conflict-output.ts
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

import { runPreRouter } from "../lib/engine/pre-router";

async function main() {
  const result = await runPreRouter({
    oneLiner: "Women's health data platform",
    urlContent:
      "AI-powered cervical cancer screening from colposcopy images. A diagnostic decision-support tool for gynaecologists. FDA-class equivalent device under evaluation.",
    pdfs: [],
  });
  console.log("\n=== STRUCTURED RESULT ===\n");
  console.log(
    JSON.stringify(
      { ...result, raw_model_response: "<see below>" },
      null,
      2
    )
  );
  console.log("\n=== RAW MODEL RESPONSE ===\n");
  console.log(result.raw_model_response);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
