/**
 * Stage 6a verify — Tier 2 payment + admin + CLI scaffolding.
 *
 * Tests against a deployed BASE URL (default: production alias). Creates
 * three throwaway assessment rows, runs the 10 test cases from the spec,
 * and cleans up.
 *
 *   npx tsx scripts/verify/stage-6a-tier2.ts
 *
 * Override BASE: VERIFY_BASE_URL=https://clearpath-preview... npx tsx ...
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

import { createClient } from "@supabase/supabase-js";
import { DraftPackContentSchema } from "../../lib/engine/draft-pack-prompts";
import { renderDraftPackEmail } from "../../lib/email/draft-pack-delivery";

const BASE = process.env.VERIFY_BASE_URL ?? "https://clearpath-medtech.vercel.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(2);
}
if (!ADMIN_PASSWORD) {
  console.error("Missing ADMIN_PASSWORD in .env.local — required for tests 7-9");
  process.exit(2);
}

const adminAuth =
  "Basic " + Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// 1×1 transparent PNG, 70 bytes.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

let pass = 0;
let fail = 0;
const failures: string[] = [];

function record(label: string, ok: boolean, note?: string) {
  const tag = ok ? "  ✓" : "  ✗";
  console.log(`${tag} ${label}${note ? ` — ${note}` : ""}`);
  if (ok) pass++;
  else {
    fail++;
    failures.push(label);
  }
}

async function createTestAssessment(emailSlug: string): Promise<string> {
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      name: "Stage 6a Verify",
      email: `${emailSlug}-${Date.now()}@clearpath.test`,
      one_liner: "Verify stub — AI medical scribe (do not use in prod)",
      status: "completed",
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) {
    throw new Error(
      `setup: createTestAssessment failed: ${error?.message ?? "no row"}`
    );
  }
  return data.id;
}

async function cleanup(assessmentIds: string[]) {
  // Delete orders first, then assessments. RLS bypassed via service role.
  await supabase.from("tier2_orders").delete().in("assessment_id", assessmentIds);
  await supabase.from("assessments").delete().in("id", assessmentIds);
}

function makeForm(opts: {
  assessmentId?: string;
  txn?: string | null;
  withFile?: boolean;
}): FormData {
  const fd = new FormData();
  if (opts.assessmentId !== undefined) {
    fd.append("assessment_id", opts.assessmentId);
  }
  if (opts.txn) fd.append("transaction_id", opts.txn);
  if (opts.withFile) {
    fd.append(
      "payment_screenshot",
      new Blob([TINY_PNG], { type: "image/png" }),
      "test.png"
    );
  }
  return fd;
}

async function main() {
  console.log(`Stage 6a verify — BASE=${BASE}\n`);

  console.log("• setup — creating 3 test assessments");
  const a1 = await createTestAssessment("verify-6a-1");
  const a2 = await createTestAssessment("verify-6a-2");
  const a3 = await createTestAssessment("verify-6a-3");
  console.log(`  ✓ ${a1}\n  ✓ ${a2}\n  ✓ ${a3}\n`);

  let order1Id: string | null = null;

  try {
    // Test 4: empty payload → 422 (run early so it doesn't create a row).
    {
      const r = await fetch(`${BASE}/api/upgrade/submit-payment-proof`, {
        method: "POST",
        body: makeForm({ assessmentId: a1 }),
      });
      record(
        "Test 4: empty payload → 422",
        r.status === 422,
        `got ${r.status}`
      );
    }

    // Test 1: screenshot only → 201.
    {
      const r = await fetch(`${BASE}/api/upgrade/submit-payment-proof`, {
        method: "POST",
        body: makeForm({ assessmentId: a1, withFile: true }),
      });
      const body = (await r.json().catch(() => ({}))) as {
        order_id?: string;
      };
      if (body.order_id) order1Id = body.order_id;
      record(
        "Test 1: screenshot only → 201",
        r.status === 201 && !!body.order_id,
        `status=${r.status}`
      );
    }

    // Test 2: txn_id only → 201 (different assessment).
    {
      const r = await fetch(`${BASE}/api/upgrade/submit-payment-proof`, {
        method: "POST",
        body: makeForm({ assessmentId: a2, txn: "TEST_TXN_2" }),
      });
      record(
        "Test 2: txn_id only → 201",
        r.status === 201,
        `status=${r.status}`
      );
    }

    // Test 3: both → 201 (a3).
    {
      const r = await fetch(`${BASE}/api/upgrade/submit-payment-proof`, {
        method: "POST",
        body: makeForm({
          assessmentId: a3,
          txn: "TEST_TXN_3",
          withFile: true,
        }),
      });
      record(
        "Test 3: both screenshot + txn → 201",
        r.status === 201,
        `status=${r.status}`
      );
    }

    // Test 5: duplicate (a1 again) → 409.
    {
      const r = await fetch(`${BASE}/api/upgrade/submit-payment-proof`, {
        method: "POST",
        body: makeForm({ assessmentId: a1, txn: "DUP_ATTEMPT" }),
      });
      record(
        "Test 5: duplicate order → 409",
        r.status === 409,
        `status=${r.status}`
      );
    }

    // Test 6: GET /api/upgrade/status returns the current order.
    {
      const r = await fetch(
        `${BASE}/api/upgrade/status?assessment_id=${a1}`
      );
      const body = (await r.json().catch(() => ({}))) as {
        order: { status?: string; id?: string } | null;
      };
      record(
        "Test 6: GET status returns pending_verification",
        r.status === 200 &&
          body.order?.status === "pending_verification",
        `status=${r.status} · order.status=${body.order?.status ?? "null"}`
      );
    }

    // Test 7: /admin/orders without auth → 401.
    {
      const r = await fetch(`${BASE}/admin/orders`, { redirect: "manual" });
      record(
        "Test 7: /admin/orders without auth → 401",
        r.status === 401,
        `got ${r.status}`
      );
    }

    // Test 8: /admin/orders with auth → 200.
    {
      const r = await fetch(`${BASE}/admin/orders`, {
        headers: { Authorization: adminAuth },
        redirect: "manual",
      });
      record(
        "Test 8: /admin/orders with auth → 200",
        r.status === 200,
        `got ${r.status}`
      );
    }

    // Test 9: POST /api/admin/verify-order updates status.
    {
      if (!order1Id) {
        record("Test 9: verify-order skipped — no order_id from Test 1", false);
      } else {
        const r = await fetch(`${BASE}/api/admin/verify-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: adminAuth,
          },
          body: JSON.stringify({ order_id: order1Id }),
        });
        const body = (await r.json().catch(() => ({}))) as {
          ok?: boolean;
          status?: string;
        };
        record(
          "Test 9: verify-order → 200, status=verified",
          r.status === 200 && body.ok === true && body.status === "verified",
          `status=${r.status} · ok=${body.ok} · order.status=${body.status}`
        );
      }
    }

    // Test 10: scaffolding — schema accepts a known-good fixture, email
    // template renders banner + pdf_url. (Skips real Opus + Resend.)
    {
      const fixture = {
        executive_summary: {
          body: "x".repeat(20),
          product_class: "Class B medical device",
          pathway: "MD-7 to CDSCO Central Authority",
          headline_gaps: ["a", "b", "c"],
        },
        intended_use: {
          indication: "x",
          intended_user: "x",
          use_environment: "x",
          contraindications: "x",
        },
        device_description: {
          components_architecture: "x",
          principle_of_operation: "x",
          materials_standards: "x",
          variants_accessories: "x",
          lifecycle_disposal: "x",
        },
        risk_classification: {
          imdrf_significance: "Drive clinical management",
          imdrf_situation: "Serious",
          imdrf_category: "III",
          imdrf_rationale: "x",
          cdsco_class: "C",
          cdsco_rationale: "x",
        },
        clinical_context: {
          clinical_need: "x",
          predicate_devices: "x",
          evidence_plan: "x",
        },
        algorithm_change_protocol: {
          applicable: false,
          pccp: null,
          change_protocol: null,
          real_world_monitoring: null,
        },
      };
      const parsed = DraftPackContentSchema.safeParse(fixture);
      record("Test 10a: DraftPackContentSchema accepts fixture", parsed.success);

      const email = renderDraftPackEmail({
        name: "Smoke",
        product_name: "AcmeScan",
        share_token: "abc123",
        pdf_url: "https://example.com/draft.pdf",
        include_resend_banner: true,
      });
      record(
        "Test 10b: email contains Resend banner",
        email.text.includes("Resend") && email.html.includes("Resend")
      );
      record(
        "Test 10c: email contains pdf_url",
        email.text.includes("https://example.com/draft.pdf") &&
          email.html.includes("https://example.com/draft.pdf")
      );
    }
  } finally {
    console.log("\n• cleanup — removing test assessments + orders");
    try {
      await cleanup([a1, a2, a3]);
      console.log("  ✓ cleaned");
    } catch (err) {
      console.warn(
        "  ! cleanup failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log(`\nResults: ${pass} pass · ${fail} fail`);
  if (fail > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("verify run threw:", err);
  process.exit(1);
});
