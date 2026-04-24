/**
 * One-off: walks a clean intake through pre-router → wizard Q1-Q7 on
 * production and reads back state from Supabase. Exercises the same
 * endpoints a real browser would.
 */
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const BASE = "https://clearpath-medtech.vercel.app";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  console.log(`Target: ${BASE}`);
  console.log("=".repeat(70));

  console.log("\n[1] POST /api/intake — clean healthcare intake");
  const intakeRes = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Stage2 Prod Verify",
      email: "s2-verify@clearpath.test",
      one_liner:
        "AI-powered medical scribe that transcribes doctor-patient consultations for clinics",
    }),
  });
  const intake = await intakeRes.json();
  if (!intake.assessmentId) {
    console.error("intake failed:", intake);
    process.exit(1);
  }
  const id = intake.assessmentId as string;
  console.log(`  ok · id=${id}`);

  console.log("\n[2] GET /assess/[id] — runs pre-router, redirects into wizard");
  const assessRes = await fetch(`${BASE}/assess/${id}`, { redirect: "manual" });
  const assessHtml = await assessRes.text();
  const redirectTarget = (assessHtml.match(/NEXT_REDIRECT;replace;([^;"\\]+);/) || [])[1] ?? null;
  console.log(`  status=${assessRes.status} redirectTarget=${redirectTarget}`);
  const expected = `/wizard/${id}/q/1`;
  if (redirectTarget !== expected) {
    console.error(`  expected redirect to ${expected}`);
    await supabase.from("assessments").delete().eq("id", id);
    process.exit(1);
  }
  console.log("  → /wizard/{id}/q/1");

  console.log("\n[3] GET /wizard/{id}/q/1 — wizard renders");
  const q1res = await fetch(`${BASE}/wizard/${id}/q/1`);
  const q1html = await q1res.text();
  const hasQ1Prompt = q1html.includes("What clinical state does your product address?");
  const hasCard = q1html.includes("Quick heads up") || q1html.includes("Still a mismatch");
  console.log(`  Q1 prompt present: ${hasQ1Prompt}`);
  console.log(`  conflict card present: ${hasCard}  (expected false for clean intake)`);

  console.log("\n[4] Walk Q1-Q7 via /api/wizard/save");
  const answers = [
    { step: 1, answer: { q1: "critical" }, prompt: "Q1 clinical=critical" },
    { step: 2, answer: { q2: "drives" }, prompt: "Q2 info=drives" },
    { step: 3, answer: { q3: "hcps" }, prompt: "Q3 users=hcps" },
    { step: 4, answer: { q4: "10k_to_1l" }, prompt: "Q4 scale=10k-1l" },
    { step: 5, answer: { q5: "abdm" }, prompt: "Q5 integrations=abdm" },
    { step: 6, answer: { q6: ["phi", "imaging"] }, prompt: "Q6 data=[phi,imaging]" },
    { step: 7, answer: { q7: "mvp" }, prompt: "Q7 stage=mvp" },
  ];
  for (const a of answers) {
    const res = await fetch(`${BASE}/api/wizard/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment_id: id, step: a.step, answer: a.answer }),
    });
    if (!res.ok) {
      console.error(`  ${a.prompt} FAILED status=${res.status}`);
      process.exit(1);
    }
    console.log(`  ${a.prompt} saved`);
  }

  console.log("\n[5] POST /api/wizard/complete");
  const cRes = await fetch(`${BASE}/api/wizard/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id, skipped: [] }),
  });
  if (!cRes.ok) {
    console.error(`  complete failed: ${cRes.status}`);
    process.exit(1);
  }
  console.log("  ok");

  console.log("\n[6] Read final assessment state");
  const { data } = await supabase
    .from("assessments")
    .select("status, wizard_answers, meta")
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    console.error("  row disappeared");
    process.exit(1);
  }
  const wa = (data.wizard_answers as Record<string, unknown>) ?? {};
  const meta = (data.meta as Record<string, unknown>) ?? {};
  const answered = Object.keys(wa).length;
  console.log(`  status=${data.status}`);
  console.log(`  wizard_answers keys=${answered}: ${Object.keys(wa).join(", ")}`);
  console.log(`  meta.wizard_started_at=${meta.wizard_started_at}`);
  console.log(`  meta.wizard_completed_at=${meta.wizard_completed_at}`);
  console.log(`  meta.wizard_skipped_questions=${JSON.stringify(meta.wizard_skipped_questions)}`);

  console.log("\n[7] GET /assess/[id] after completion — placeholder panel");
  const finalAssess = await fetch(`${BASE}/assess/${id}`);
  const finalHtml = await finalAssess.text();
  const hasPlaceholder =
    finalHtml.includes("Pre-routing complete") ||
    finalHtml.includes("classified your product");
  console.log(`  placeholder panel present: ${hasPlaceholder}  (F5 slot)`);

  // assertions
  let passed = 0, failed = 0;
  const assertion = (label: string, cond: boolean) => {
    console.log(`  ${cond ? "✓" : "✗"} ${label}`);
    cond ? passed++ : failed++;
  };
  console.log("\n=== production assertions ===");
  assertion("/assess redirected into wizard", redirectTarget === expected);
  assertion("Q1 prompt rendered", hasQ1Prompt);
  assertion("no conflict card (clean intake)", !hasCard);
  assertion("all 7 answers saved", answered === 7);
  assertion("status=wizard_complete", data.status === "wizard_complete");
  assertion("wizard_started_at set", typeof meta.wizard_started_at === "string");
  assertion("wizard_completed_at set", typeof meta.wizard_completed_at === "string");
  assertion("placeholder renders after completion", hasPlaceholder);

  await supabase.from("assessments").delete().eq("id", id);
  console.log("\ncleanup: done");
  console.log(`\nResult: ${passed} pass · ${failed} fail`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("verify crashed:", err);
  process.exit(2);
});
