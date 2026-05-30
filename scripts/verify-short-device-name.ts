/**
 * Phase 2c Day 2 — verify shortDeviceName() against the production
 * assessments the founder used during re-validation.
 *
 * Imports the helper indirectly by re-implementing the same logic in
 * a self-contained form. Faster than running the full trigger and
 * sufficient to confirm the right product_name is produced.
 */

import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

import { getServiceClient } from "@/lib/supabase";
import type { PitchAiExtracted } from "@/lib/intake/ai-extract";
// Day-5 EOD — was an inline copy; now imports the single source of
// truth that the production trigger also uses.
import { shortDeviceName } from "@/lib/intake/short-device-name";

(async () => {
  const sb = getServiceClient();
  const ids = [
    {
      id: "0be5a3db-7d8a-41f3-869e-c3a8cdaa4ceb",
      label: "hardware (stent)",
      expectIncludes: "Stent",
    },
    {
      id: "c363730c-b13f-4167-bf5c-692a34592202",
      label: "SaMD (DR)",
      expectIncludes: "Retinopathy",
    },
  ];
  let allPass = true;
  for (const t of ids) {
    const { data } = await sb
      .from("assessments")
      .select("one_liner, ai_extracted")
      .eq("id", t.id)
      .maybeSingle();
    const ai = (data?.ai_extracted ?? null) as
      | { status?: string; fields?: PitchAiExtracted }
      | null;
    const aiFields = ai && ai.status === "complete" ? ai.fields ?? null : null;
    const result = shortDeviceName(aiFields, (data?.one_liner as string) || "");
    const ok =
      result.length > 0 &&
      result.length <= 60 &&
      !result.includes("…") &&
      result.includes(t.expectIncludes);
    console.log(`  ${ok ? "✓" : "✗"} ${t.label}: "${result}"`);
    if (!ok) allPass = false;
  }
  if (!allPass) process.exit(1);
  console.log("\nAll product names render cleanly.");
})();
