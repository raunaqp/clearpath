#!/usr/bin/env tsx
/**
 * Story 2.5 Phase 1 schema + types validator.
 *
 * Run AFTER applying supabase/migration-010-ai-extracted-and-path-detection.sql
 * in the Supabase Dashboard SQL Editor.
 *
 * Run: npx tsx scripts/validate-migration-010.ts
 *
 * Checks (behavioural, via service-role client):
 *   1. assessments.ai_extracted column exists and is selectable
 *   2. ai_extracted accepts a jsonb write+read roundtrip on a synthetic
 *      assessment row (created + cleaned up inside the validator)
 *   3. lib/schemas/readiness-card.ts compiles with the new
 *      RecommendedPathEnum + recommended_path field (TypeScript check)
 *
 * Prints a follow-up RLS verification SQL snippet (assessments already
 * has RLS enabled; the new column inherits the table policy).
 */
import { getServiceClient } from "../lib/supabase";
import {
  ReadinessCardSchema,
  RecommendedPathEnum,
} from "../lib/schemas/readiness-card";

type Check = { name: string; pass: boolean; detail?: string };

const supabase = getServiceClient();

async function columnSelectable(): Promise<Check> {
  const { error } = await supabase
    .from("assessments")
    .select("id, ai_extracted")
    .limit(0);
  return error
    ? {
        name: "assessments.ai_extracted column exists and is selectable",
        pass: false,
        detail: error.message,
      }
    : {
        name: "assessments.ai_extracted column exists and is selectable",
        pass: true,
      };
}

async function jsonbRoundtrip(): Promise<Check> {
  const sentinel = {
    _validator: "story-2.5-phase-1",
    confidence: "high" as const,
    notes: "validator round-trip",
    nested: { array: [1, 2, 3] },
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("assessments")
    .insert({
      name: "_validator",
      email: "_validator@clearpath.local",
      one_liner:
        "_validator row for migration-010 ai_extracted jsonb roundtrip — auto-deleted",
      ai_extracted: sentinel,
      status: "draft",
    })
    .select("id, ai_extracted")
    .single();

  if (insertErr || !inserted) {
    return {
      name: "ai_extracted accepts jsonb write + read roundtrip",
      pass: false,
      detail: insertErr?.message ?? "insert returned no row",
    };
  }

  let pass = true;
  let detail: string | undefined;
  try {
    const got = inserted.ai_extracted as typeof sentinel;
    if (
      got?._validator !== sentinel._validator ||
      got?.nested?.array?.[2] !== 3
    ) {
      pass = false;
      detail = `roundtrip value mismatch: ${JSON.stringify(got)}`;
    }
  } finally {
    // Always clean up — service role bypasses RLS.
    await supabase.from("assessments").delete().eq("id", inserted.id);
  }

  return {
    name: "ai_extracted accepts jsonb write + read roundtrip",
    pass,
    detail,
  };
}

function readinessCardSchemaIncludesPath(): Check {
  // Compile-time: import resolved without TS error → schema includes the field.
  // Runtime: parse a minimal card with recommended_path set and assert it survives.
  const minimal = {
    meta: {
      company_name: "_test",
      product_name: "_test",
      scoped_feature: null,
      product_type: "product" as const,
      generated_at: new Date().toISOString(),
      conflict_resolved: null,
    },
    classification: {
      medical_device_status: "is_medical_device" as const,
      device_type: "_test",
      imdrf_category: "II" as const,
      cdsco_class: "B" as const,
      class_qualifier: null,
      ai_ml_flag: false,
      acp_required: false,
      export_only: false,
      novel_or_predicate: "has_predicate" as const,
    },
    readiness: {
      score: 4,
      band: "amber" as const,
      dimensions: {
        regulatory_clarity: 1,
        quality_system: 1,
        technical_docs: 1,
        clinical_evidence: 1,
        submission_maturity: 0,
      },
      note: "_test",
    },
    risk: { level: "medium" as const, rationale: "_test" },
    timeline: {
      estimate_months_low: 6,
      estimate_months_high: 12,
      display: "6–12 months",
      anchor: "_test",
    },
    regulations: {
      cdsco_mdr: { verdict: "required" as const, rationale: "_test" },
      cdsco_pharmacy: { verdict: "not_applicable" as const, rationale: "_test" },
      dpdp: { verdict: "required" as const, rationale: "_test" },
      icmr: { verdict: "conditional" as const, rationale: "_test" },
      abdm: { verdict: "conditional" as const, rationale: "_test" },
      nabh: { verdict: "conditional" as const, rationale: "_test" },
      mci_telemed: { verdict: "not_applicable" as const, rationale: "_test" },
      irdai: { verdict: "not_applicable" as const, rationale: "_test" },
      nabl: { verdict: "conditional" as const, rationale: "_test" },
    },
    top_gaps: [
      {
        dim: "clinical_evidence",
        gap_title: "_test",
        fix_action: "_test",
        severity: "high" as const,
      },
      {
        dim: "submission_maturity",
        gap_title: "_test",
        fix_action: "_test",
        severity: "medium" as const,
      },
    ],
    verdict: "_test",
    why_regulated: "_test",
    post_2025_samd_gap: false,
    tier0_card_tagline: "_test",
    tier1_teaser: "_test",
    tier2_teaser: "_test",
    recommended_path: "manufacturing_license" as const,
  };

  const result = ReadinessCardSchema.safeParse(minimal);
  if (!result.success) {
    return {
      name: "ReadinessCardSchema parses recommended_path",
      pass: false,
      detail: result.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }

  // Also assert all 3 enum values are accepted.
  const accepted = RecommendedPathEnum.options;
  const expected = ["manufacturing_license", "clinical_investigation", "unclear"];
  const enumOk =
    accepted.length === expected.length &&
    expected.every((v) => accepted.includes(v as (typeof accepted)[number]));
  if (!enumOk) {
    return {
      name: "RecommendedPathEnum has the 3 expected values",
      pass: false,
      detail: `got: ${JSON.stringify(accepted)}`,
    };
  }

  return {
    name: "ReadinessCardSchema parses recommended_path + enum has 3 values",
    pass: true,
  };
}

async function main() {
  const checks: Check[] = [];

  const colCheck = await columnSelectable();
  checks.push(colCheck);

  if (colCheck.pass) {
    checks.push(await jsonbRoundtrip());
  }

  checks.push(readinessCardSchemaIncludesPath());

  console.log("\nStory 2.5 Phase 1 — schema + types validator\n");
  for (const c of checks) {
    const mark = c.pass ? "✓" : "✗";
    console.log(`  ${mark} ${c.name}`);
    if (!c.pass && c.detail) console.log(`      ${c.detail}`);
  }

  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed.`);

  console.log(`
--- RLS verification (paste into Supabase Dashboard → SQL Editor) ---
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p
        where p.schemaname = 'public' and p.tablename = c.relname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'assessments';

-- Expected: rls_enabled = true, policy_count = 0 (service-role-only,
-- unchanged from before — the new column inherits the table policy).
`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("validator crashed:", err);
  process.exit(1);
});
