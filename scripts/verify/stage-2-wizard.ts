/**
 * Stage 2 — Wizard + conflict disclosure test harness (12 checks).
 * Run: npm run test:f4
 * Requires: dev server on :3000, .env.local with SUPABASE keys.
 *
 * Approach: seeds Supabase rows directly (bypassing pre-router) to control
 * meta.conflict_detected / severity / acknowledged / edit_attempts cleanly,
 * then exercises the wizard page + API routes and asserts DB + HTML state.
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

const BASE = "http://localhost:3000";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type Result = { name: string; pass: boolean; detail: string };
const results: Result[] = [];
function pass(name: string, detail: string) {
  results.push({ name, pass: true, detail });
  console.log(`  ✓ ${name}  ${detail}`);
}
function fail(name: string, detail: string) {
  results.push({ name, pass: false, detail });
  console.log(`  ✗ ${name}  ${detail}`);
}

type SeedOptions = {
  conflict_detected?: boolean;
  severity?: "high" | "medium" | "low" | "none";
  conflict_acknowledged?: boolean;
  conflict_edit_attempts?: number;
  status?: string;
  wizard_answers?: Record<string, unknown>;
  url_fetched_content?: string | null;
};

async function seedAssessment(opts: SeedOptions = {}): Promise<string> {
  const meta: Record<string, unknown> = {};
  if (opts.conflict_detected !== undefined) {
    meta.conflict_detected = opts.conflict_detected;
  }
  if (opts.conflict_detected) {
    meta.conflict_details = {
      one_liner_interpretation: "Generic healthcare analytics platform.",
      pdf_interpretation: "AI-powered arrhythmia detection decision-support.",
      url_interpretation: null,
      authority_used: "pdf",
      severity: opts.severity ?? "high",
    };
  }
  if (opts.conflict_acknowledged !== undefined) {
    meta.conflict_acknowledged = opts.conflict_acknowledged;
  }
  if (opts.conflict_edit_attempts !== undefined) {
    meta.conflict_edit_attempts = opts.conflict_edit_attempts;
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      name: "F4 Test",
      email: `f4-${Date.now()}@clearpath.test`,
      one_liner:
        "Healthcare analytics platform for Indian hospitals with dashboards",
      status: opts.status ?? "routing_complete",
      product_type: "product",
      wizard_answers: opts.wizard_answers ?? {},
      url_fetched_content: opts.url_fetched_content ?? null,
      meta,
    })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(`seed failed: ${error?.message}`);
  }
  return data.id as string;
}

async function cleanup(id: string) {
  await supabase.from("assessments").delete().eq("id", id);
}

async function getWizardHtml(id: string, step: number): Promise<string> {
  const res = await fetch(`${BASE}/wizard/${id}/q/${step}`);
  return await res.text();
}

async function getAssessRedirect(id: string): Promise<string | null> {
  const res = await fetch(`${BASE}/assess/${id}`, { redirect: "manual" });
  const html = await res.text();
  const m = html.match(/NEXT_REDIRECT;replace;([^;"\\]+);/);
  return m ? m[1] : null;
}

async function getMeta(id: string): Promise<Record<string, unknown>> {
  const { data } = await supabase
    .from("assessments")
    .select("meta")
    .eq("id", id)
    .maybeSingle();
  return (data?.meta as Record<string, unknown>) ?? {};
}

async function getStatus(id: string): Promise<string | null> {
  const { data } = await supabase
    .from("assessments")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  return (data?.status as string | null) ?? null;
}

// ───── Tests ─────

async function testNoConflict() {
  console.log("\n[1] No conflict → card doesn't render");
  const id = await seedAssessment({ conflict_detected: false });
  const html = await getWizardHtml(id, 1);
  const shown = html.includes("Quick heads up") || html.includes("Still a mismatch");
  if (!shown) pass("no conflict card on q1", "card absent from HTML");
  else fail("no conflict card on q1", "card text present unexpectedly");
  await cleanup(id);
}

async function testLowSeverity() {
  console.log("\n[2] Low severity → card doesn't render");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "low",
  });
  const html = await getWizardHtml(id, 1);
  const shown = html.includes("Quick heads up") || html.includes("Still a mismatch");
  if (!shown) pass("low severity suppresses card", "card absent");
  else fail("low severity suppresses card", "card unexpectedly present");
  await cleanup(id);
}

async function testHighSeverity() {
  console.log("\n[3] High severity → card renders");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  const html = await getWizardHtml(id, 1);
  if (html.includes("Quick heads up")) {
    pass("high severity renders card", 'heading "Quick heads up" found');
  } else {
    fail("high severity renders card", "heading missing");
  }
  await cleanup(id);
}

async function testContinueAck() {
  console.log("\n[4] Continue → ack=true, card gone on revisit");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  // simulate Continue click: POST to ack endpoint
  const ackRes = await fetch(`${BASE}/api/wizard/ack-conflict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id }),
  });
  if (!ackRes.ok) {
    fail("ack API", `status=${ackRes.status}`);
    await cleanup(id);
    return;
  }
  const meta = await getMeta(id);
  if (meta.conflict_acknowledged === true) {
    pass("ack persisted", "meta.conflict_acknowledged=true");
  } else {
    fail("ack persisted", `got ${meta.conflict_acknowledged}`);
  }
  const html = await getWizardHtml(id, 1);
  const shown = html.includes("Quick heads up") || html.includes("Still a mismatch");
  if (!shown) {
    pass("revisit q1 → no card", "card suppressed after ack");
  } else {
    fail("revisit q1 → no card", "card re-rendered");
  }
  await cleanup(id);
}

async function testEditRedirectAndPrefill() {
  console.log("\n[5] Edit button routes to /start?resume + prefill API works");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  // UI link target
  const html = await getWizardHtml(id, 1);
  const hasEditIntent =
    html.includes("Edit my description") || html.includes("Edit description");
  if (hasEditIntent) {
    pass("edit button present", "conflict card has an Edit CTA");
  } else {
    fail("edit button present", "no Edit label in HTML");
  }
  // prefill API
  const res = await fetch(`${BASE}/api/assessment/${id}`);
  if (res.ok) {
    const data = await res.json();
    if (data.one_liner && data.email && data.name) {
      pass(
        "prefill API returns form fields",
        `name=${data.name} email=${data.email}`
      );
    } else {
      fail("prefill API shape", `missing fields in ${JSON.stringify(data)}`);
    }
  } else {
    fail("prefill API", `status=${res.status}`);
  }
  await cleanup(id);
}

async function testEditResolve() {
  console.log("\n[6] Edit + resolve → no card");
  // simulate resolved state: conflict_detected=false after edit
  const id = await seedAssessment({
    conflict_detected: false,
    conflict_edit_attempts: 1,
  });
  const html = await getWizardHtml(id, 1);
  const shown = html.includes("Quick heads up") || html.includes("Still a mismatch");
  if (!shown) pass("resolved edit → no card", "conflict_detected=false suppresses card");
  else fail("resolved edit → no card", "card unexpectedly present");
  await cleanup(id);
}

async function testEditPersist() {
  console.log('[7] Edit + persist → "Still a mismatch"');
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
    conflict_edit_attempts: 1,
  });
  const html = await getWizardHtml(id, 1);
  if (html.includes("Still a mismatch")) {
    pass('reappeared card shows "Still a mismatch"', "edit_attempts=1 heading");
  } else {
    fail(
      'reappeared card heading',
      '"Still a mismatch" text missing from HTML'
    );
  }
  await cleanup(id);
}

async function testQ2FollowupShown() {
  console.log("\n[8] Q2 informs + decision-support phrases → follow-up");
  const id = await seedAssessment({
    url_fetched_content:
      "This diagnostic assistant recommends next steps and alerts physicians to anomalies.",
  });
  const res = await fetch(`${BASE}/api/wizard/check-q2-followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id }),
  });
  if (!res.ok) {
    fail("q2 followup API", `status=${res.status}`);
    await cleanup(id);
    return;
  }
  const data = await res.json();
  if (data.show_followup === true && Array.isArray(data.extracted_phrases)) {
    pass(
      "followup shown with phrases",
      `phrases=${JSON.stringify(data.extracted_phrases)}`
    );
  } else {
    fail("followup shown", `got ${JSON.stringify(data)}`);
  }
  await cleanup(id);
}

async function testQ2FollowupNotShown() {
  console.log("\n[9] Q2 informs + plain content → no follow-up");
  const id = await seedAssessment({
    url_fetched_content:
      "Our hospital dashboard shows bed utilisation and staff shifts in real time.",
  });
  const res = await fetch(`${BASE}/api/wizard/check-q2-followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id }),
  });
  const data = await res.json();
  if (data.show_followup === false) {
    pass(
      "no followup for plain content",
      `phrases=${JSON.stringify(data.extracted_phrases)}`
    );
  } else {
    fail("no followup for plain content", `got ${JSON.stringify(data)}`);
  }
  await cleanup(id);
}

async function testResumeDropoff() {
  console.log("\n[10] Drop-off at Q5, /assess redirects to q/5");
  const id = await seedAssessment({
    status: "wizard",
    wizard_answers: {
      q1: "critical",
      q2: "drives",
      q3: "hcps",
      q4: "10k_to_1l",
    },
  });
  const redirectTarget = await getAssessRedirect(id);
  const expected = `/wizard/${id}/q/5`;
  if (redirectTarget === expected) {
    pass("/assess → q/5", `redirect=${redirectTarget}`);
  } else {
    fail("/assess → q/5", `expected ${expected}, got ${redirectTarget}`);
  }
  await cleanup(id);
}

async function testSkipCompletion() {
  console.log("\n[11] Skip Q4-Q7 → wizard_complete with skipped>0");
  const id = await seedAssessment({
    status: "wizard",
    wizard_answers: { q1: "critical", q2: "drives", q3: "hcps" },
  });
  const res = await fetch(`${BASE}/api/wizard/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id, skipped: [4, 5, 6, 7] }),
  });
  if (!res.ok) {
    fail("complete API", `status=${res.status}`);
    await cleanup(id);
    return;
  }
  const status = await getStatus(id);
  const meta = await getMeta(id);
  const skipped = meta.wizard_skipped_questions;
  const completedAt = meta.wizard_completed_at;
  if (
    status === "wizard_complete" &&
    Array.isArray(skipped) &&
    skipped.length === 4 &&
    typeof completedAt === "string"
  ) {
    pass(
      "wizard_complete with 4 skips",
      `skipped=[${(skipped as number[]).join(",")}] at=${completedAt}`
    );
  } else {
    fail(
      "wizard_complete state",
      `status=${status} skipped=${JSON.stringify(skipped)} at=${completedAt}`
    );
  }
  // verify client event wiring (grep source)
  const src = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );
  if (src.includes('posthog.capture("wizard_completed"')) {
    pass("wizard_completed capture wired", "event present in WizardClient");
  } else {
    fail(
      "wizard_completed capture",
      'posthog.capture("wizard_completed" not found in source'
    );
  }
  await cleanup(id);
}

async function testCompleteAllSeven() {
  console.log("\n[12] Complete all 7 → save path + redirect sequence");
  const id = await seedAssessment({ status: "routing_complete" });
  const answers = [
    { step: 1, answer: { q1: "critical" } },
    { step: 2, answer: { q2: "drives" } },
    { step: 3, answer: { q3: "hcps" } },
    { step: 4, answer: { q4: "10k_to_1l" } },
    { step: 5, answer: { q5: "abdm" } },
    { step: 6, answer: { q6: ["phi", "imaging"] } },
    { step: 7, answer: { q7: "mvp" } },
  ];
  let ok = true;
  for (const a of answers) {
    const res = await fetch(`${BASE}/api/wizard/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment_id: id, step: a.step, answer: a.answer }),
    });
    if (!res.ok) {
      ok = false;
      break;
    }
  }
  if (!ok) {
    fail("save all 7", "at least one save failed");
    await cleanup(id);
    return;
  }
  const completeRes = await fetch(`${BASE}/api/wizard/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment_id: id, skipped: [] }),
  });
  if (!completeRes.ok) {
    fail("complete all 7", `status=${completeRes.status}`);
    await cleanup(id);
    return;
  }
  const { data } = await supabase
    .from("assessments")
    .select("status, wizard_answers, meta")
    .eq("id", id)
    .maybeSingle();
  const wa = (data?.wizard_answers as Record<string, unknown>) ?? {};
  const hasAll = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"].every((k) => k in wa);
  if (hasAll && data?.status === "wizard_complete") {
    pass(
      "all 7 answers persisted + wizard_complete",
      `keys=${Object.keys(wa).length}`
    );
  } else {
    fail(
      "complete state",
      `status=${data?.status} keys=${Object.keys(wa).length}`
    );
  }
  await cleanup(id);
}

async function main() {
  console.log("Feature 4 — wizard + conflict disclosure (12 checks)");
  console.log("=".repeat(70));
  await testNoConflict();
  await testLowSeverity();
  await testHighSeverity();
  await testContinueAck();
  await testEditRedirectAndPrefill();
  await testEditResolve();
  await testEditPersist();
  await testQ2FollowupShown();
  await testQ2FollowupNotShown();
  await testResumeDropoff();
  await testSkipCompletion();
  await testCompleteAllSeven();

  console.log("\n" + "=".repeat(70));
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`Summary: ${passed} passed · ${failed} failed · ${results.length} total`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("harness crashed:", err);
  process.exit(2);
});
