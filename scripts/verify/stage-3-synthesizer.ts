/**
 * Stage 3 verify: smoke-tests the Tier 0 synthesizer against 5 calibration
 * products and the cache-key determinism guarantee.
 *
 * Each Opus call costs ~$0.10–0.20 — run on demand only. Reads env from
 * `.env.local` (must contain ANTHROPIC_API_KEY and Supabase service-role keys
 * — the latter is touched only by `trackApiCost` writes).
 *
 *   npx tsx scripts/verify/stage-3-synthesizer.ts
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

import {
  runSynthesizer,
  type SynthesizerInput,
} from "../../lib/engine/synthesizer";
import { computeCacheKey } from "../../lib/engine/readiness-cache";
import type { ReadinessCard } from "../../lib/schemas/readiness-card";

type CalibrationCase = {
  name: string;
  input: SynthesizerInput;
  expect: (card: ReadinessCard) => string | null;
};

function expectField<T>(
  label: string,
  actual: T,
  predicate: (v: T) => boolean,
  describe: (v: T) => string
): string | null {
  if (predicate(actual)) return null;
  return `${label}: ${describe(actual)}`;
}

const CASES: CalibrationCase[] = [
  {
    name: "CerviAI — pure medical device, Class C",
    input: {
      assessmentId: "verify-cervi-ai",
      oneLiner:
        "AI-powered cervical cancer screening from colposcopy images for Indian gynaecologists.",
      productType: "product",
      urlContent: null,
      pdfSummaries: [],
      wizardAnswers: {
        q1: "diagnostic_aid",
        q2: "ai_cds",
        q3: "no",
        q4: "domestic",
        q5: "no",
        q6: "in_progress",
        q7: "fda_510k",
      },
      detectedSignals: { ai_cds: true },
      conflictDetails: null,
    },
    expect: (c) =>
      expectField(
        "medical_device_status",
        c.classification.medical_device_status,
        (v) => v === "is_medical_device",
        (v) => `expected is_medical_device, got ${v}`
      ) ??
      expectField(
        "cdsco_class",
        c.classification.cdsco_class,
        (v) => v === "C" || v === "D",
        (v) => `expected Class C/D, got ${v}`
      ),
  },
  {
    name: "EkaScribe — sub-feature scoped Class B/C",
    input: {
      assessmentId: "verify-eka-scribe",
      oneLiner:
        "EkaScribe — AI medical scribe sub-feature inside the Eka Care clinician platform. Auto-summarises consultations into SOAP notes.",
      productType: "platform",
      urlContent: null,
      pdfSummaries: [],
      wizardAnswers: {
        q1: "documentation_assist",
        q2: "ai_cds",
        q3: "no",
        q4: "domestic",
        q5: "no",
        q6: "none",
        q7: "none",
      },
      detectedSignals: { ai_cds: true, sub_feature: "EkaScribe" },
      conflictDetails: null,
    },
    expect: (c) =>
      expectField(
        "scoped_feature",
        c.meta.scoped_feature,
        (v) => typeof v === "string" && v.length > 0,
        (v) => `expected non-null scoped_feature, got ${JSON.stringify(v)}`
      ) ??
      expectField(
        "cdsco_class",
        c.classification.cdsco_class,
        (v) => v === "B" || v === "C",
        (v) => `expected Class B/C scoped, got ${v}`
      ),
  },
  {
    name: "HealthifyMe — wellness carve-out, score=null",
    input: {
      assessmentId: "verify-healthifyme",
      oneLiner:
        "HealthifyMe — consumer wellness app for diet tracking, calorie counting, and AI fitness coaching. Not a medical device.",
      productType: "product",
      urlContent: null,
      pdfSummaries: [],
      wizardAnswers: {
        q1: "wellness",
        q2: "none",
        q3: "no",
        q4: "domestic",
        q5: "no",
        q6: "none",
        q7: "none",
      },
      detectedSignals: { wellness: true },
      conflictDetails: null,
    },
    expect: (c) =>
      expectField(
        "medical_device_status",
        c.classification.medical_device_status,
        (v) => v === "wellness_carve_out",
        (v) => `expected wellness_carve_out, got ${v}`
      ) ??
      expectField(
        "readiness.score",
        c.readiness.score,
        (v) => v === null,
        (v) => `expected null score for wellness, got ${v}`
      ),
  },
  {
    name: "Biopeak — export-only, manufacturing license scope",
    input: {
      assessmentId: "verify-biopeak",
      oneLiner:
        "Biopeak — point-of-care cardiac troponin diagnostic strip manufactured in India for export to EU and SEA markets only. Not sold domestically.",
      productType: "export_only",
      urlContent: null,
      pdfSummaries: [],
      wizardAnswers: {
        q1: "diagnostic",
        q2: "ivd",
        q3: "yes",
        q4: "export_only",
        q5: "no",
        q6: "in_progress",
        q7: "ce_mark",
      },
      detectedSignals: { ivd: true, export_only: true },
      conflictDetails: null,
    },
    expect: (c) =>
      expectField(
        "export_only",
        c.classification.export_only,
        (v) => v === true,
        (v) => `expected export_only=true, got ${v}`
      ),
  },
  {
    name: "Vyuhaa — resolved conflict, cancer screening over data platform",
    input: {
      assessmentId: "verify-vyuhaa",
      oneLiner:
        "Vyuhaa — AI-powered breast cancer screening from mammograms. (Resolved: not a generic data platform.)",
      productType: "product",
      urlContent: null,
      pdfSummaries: [],
      wizardAnswers: {
        q1: "diagnostic_aid",
        q2: "ai_cds",
        q3: "no",
        q4: "domestic",
        q5: "no",
        q6: "none",
        q7: "none",
      },
      detectedSignals: { ai_cds: true },
      conflictDetails: {
        severity: "high",
        resolution: "kept_one_liner_diagnostic_intent",
      },
    },
    expect: (c) =>
      expectField(
        "conflict_resolved",
        c.meta.conflict_resolved,
        (v) => typeof v === "string" && v.length > 0,
        (v) => `expected non-null conflict_resolved, got ${JSON.stringify(v)}`
      ) ??
      expectField(
        "medical_device_status",
        c.classification.medical_device_status,
        (v) => v === "is_medical_device",
        (v) => `expected is_medical_device after resolution, got ${v}`
      ),
  },
];

async function runCase(c: CalibrationCase): Promise<{
  ok: boolean;
  failure: string | null;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
}> {
  const result = await runSynthesizer(c.input);
  const failure = c.expect(result.card);
  return {
    ok: failure === null,
    failure,
    costUsd: result.costUsd,
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
  };
}

function verifyCacheKeyDeterminism(): boolean {
  const base = {
    email: "test@example.com",
    oneLiner: "AI cancer screening platform",
    url: "https://example.com",
    pdfHashes: ["sha2", "sha1"],
    wizardAnswers: { q1: "a", q2: "b" },
  };
  const k1 = computeCacheKey(base);
  const k2 = computeCacheKey({ ...base, pdfHashes: ["sha1", "sha2"] }); // re-ordered
  const k3 = computeCacheKey({ ...base, email: "TEST@example.com  " }); // case + whitespace
  const k4 = computeCacheKey({ ...base, oneLiner: "different one-liner" });

  const sameKey = k1 === k2 && k1 === k3;
  const differsOnContent = k1 !== k4;
  return sameKey && differsOnContent;
}

async function main() {
  console.log("Stage 3 verify — synthesizer calibration\n");

  let passed = 0;
  let totalCost = 0;
  for (const c of CASES) {
    process.stdout.write(`• ${c.name} … `);
    try {
      const r = await runCase(c);
      totalCost += r.costUsd;
      if (r.ok) {
        passed++;
        console.log(
          `pass ($${r.costUsd.toFixed(4)}, in=${r.inputTokens} out=${r.outputTokens})`
        );
      } else {
        console.log(`FAIL — ${r.failure}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`THROW — ${msg}`);
    }
  }

  console.log("\n• cache-key determinism … ");
  const cacheOk = verifyCacheKeyDeterminism();
  console.log(cacheOk ? "  pass" : "  FAIL");

  console.log(
    `\nResults: ${passed}/${CASES.length} calibration cases passed · cache key ${
      cacheOk ? "deterministic" : "NON-DETERMINISTIC"
    } · total Opus spend ≈ $${totalCost.toFixed(4)}`
  );

  const allPassed = passed === CASES.length && cacheOk;
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("verify run threw:", err);
  process.exit(1);
});
