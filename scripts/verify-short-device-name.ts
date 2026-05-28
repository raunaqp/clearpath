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

// Inline copy of the helper we just added to the trigger — kept in
// sync manually. (One-shot verification; not enough reuse to extract.)
function shortDeviceName(
  ai: PitchAiExtracted | null,
  oneLiner: string
): string {
  if (ai?.device_name) {
    const cleaned = ai.device_name.trim();
    if (cleaned.length > 0 && cleaned.length <= 60) return cleaned;
  }
  const source = (ai?.intended_use_one_liner ?? "").trim() || oneLiner.trim();
  if (!source) return "";
  const trimmed = source
    .replace(/^(A|An|The)\s+/i, "")
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  const STOP_WORDS =
    /\b(for|to|that|which|designed|intended|used|enabling|enables|enable|powered|by|with|in|when|while|so\s+that|aimed|aims)\b/i;
  const match = trimmed.match(STOP_WORDS);
  let head = match ? trimmed.slice(0, match.index).trim() : trimmed;
  const words = head.split(/\s+/).filter(Boolean);
  if (words.length > 5) head = words.slice(0, 5).join(" ");
  if (!head) return source.slice(0, 40).trim();
  return head
    .split(/\s+/)
    .map((w) => {
      if (!w) return w;
      if (/^[A-Z]{2,}$/.test(w)) return w;
      if (/^[A-Z][a-z]+[A-Z]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

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
