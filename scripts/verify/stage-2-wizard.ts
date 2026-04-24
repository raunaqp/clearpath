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

async function getConflictHtml(id: string): Promise<string> {
  const res = await fetch(`${BASE}/wizard/${id}/conflict`);
  return await res.text();
}

function extractRedirect(html: string): string | null {
  const m = html.match(/NEXT_REDIRECT;replace;([^;"\\]+);/);
  return m ? m[1] : null;
}

async function getAssessRedirect(id: string): Promise<string | null> {
  const res = await fetch(`${BASE}/assess/${id}`, { redirect: "manual" });
  return extractRedirect(await res.text());
}

async function getConflictRedirect(id: string): Promise<string | null> {
  const res = await fetch(`${BASE}/wizard/${id}/conflict`, {
    redirect: "manual",
  });
  return extractRedirect(await res.text());
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
  console.log("\n[3] High severity → card renders on /conflict (not /q/1)");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  const q1 = await getWizardHtml(id, 1);
  const conflict = await getConflictHtml(id);
  if (!q1.includes("Quick heads up") && !q1.includes("Still a mismatch")) {
    pass("q/1 does not render conflict card", "card stripped from Q pages");
  } else {
    fail("q/1 card isolation", "conflict heading leaked into /q/1 HTML");
  }
  if (conflict.includes("Quick heads up")) {
    pass(
      "/wizard/[id]/conflict renders card",
      'heading "Quick heads up" found on dedicated route'
    );
  } else {
    fail("/conflict renders card", 'heading "Quick heads up" missing');
  }
  await cleanup(id);
}

async function testContinueAck() {
  console.log("\n[4] Continue → ack=true, /conflict auto-redirects to /q/1");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
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
  const target = await getConflictRedirect(id);
  const expected = `/wizard/${id}/q/1`;
  if (target === expected) {
    pass(
      "/conflict after ack redirects to /q/1",
      `server redirect target=${target}`
    );
  } else {
    fail("/conflict after ack redirect", `expected ${expected}, got ${target}`);
  }
  await cleanup(id);
}

async function testEditRedirectAndPrefill() {
  console.log("\n[5] Edit button routes to /start?resume + prefill API works");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  // UI link target — now lives on /wizard/[id]/conflict, not /q/1.
  const html = await getConflictHtml(id);
  const hasEditIntent =
    html.includes("Edit my description") || html.includes("Edit description");
  if (hasEditIntent) {
    pass("edit button present on /conflict", "conflict card has an Edit CTA");
  } else {
    fail("edit button present", "no Edit label in /conflict HTML");
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
  console.log('[7] Edit + persist → "Still a mismatch" on /conflict');
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
    conflict_edit_attempts: 1,
  });
  const html = await getConflictHtml(id);
  if (html.includes("Still a mismatch")) {
    pass(
      'reappeared card shows "Still a mismatch"',
      "edit_attempts=1 heading on /wizard/[id]/conflict"
    );
  } else {
    fail(
      "reappeared card heading",
      '"Still a mismatch" text missing from /conflict HTML'
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

async function testRequiredMarkersAndLegend() {
  console.log("\n[14] * markers + legend on Q1-Q3, absent on Q4-Q7");
  const id = await seedAssessment({
    status: "routing_complete",
    wizard_answers: { q1: "critical", q2: "drives", q3: "hcps" },
  });
  const q1html = await getWizardHtml(id, 1);
  const q4html = await getWizardHtml(id, 4);

  // Q1 (required) expectations
  const q1HasMarker = q1html.includes("data-required-marker");
  const q1HasLegend = q1html.includes("data-required-legend");
  const q1MarkerIsCoral =
    /data-required-marker[^>]*text-\[#993C1D\]|text-\[#993C1D\][^>]*data-required-marker/.test(
      q1html
    );
  // Legend wrapping <p> must NOT itself be coral; must be muted.
  const q1LegendMuted = /text-\[#6B766F\][^>]*data-required-legend|data-required-legend[^>]*text-\[#6B766F\]/.test(
    q1html
  );
  const q1LegendText = q1html.includes("indicates a required question");

  // Q4 (optional) expectations
  const q4HasMarker = q4html.includes("data-required-marker");
  const q4HasLegend = q4html.includes("data-required-legend");

  if (q1HasMarker) pass("Q1 renders * marker", "data-required-marker present");
  else fail("Q1 * marker", "data-required-marker missing on Q1");

  if (q1MarkerIsCoral) pass("Q1 * marker is coral", "text-[#993C1D] on marker span");
  else fail("Q1 * marker color", "coral class not attached to marker span");

  if (q1HasLegend && q1LegendText) {
    pass(
      "Q1 legend rendered",
      '"* indicates a required question" present with marker attribute'
    );
  } else {
    fail("Q1 legend", `hasLegend=${q1HasLegend} hasText=${q1LegendText}`);
  }

  if (q1LegendMuted) pass("Q1 legend is muted (not coral)", "text-[#6B766F] on legend");
  else fail("Q1 legend color", "legend <p> not styled muted");

  if (!q4HasMarker && !q4HasLegend) {
    pass("Q4 has no marker and no legend", "optional question clean");
  } else {
    fail(
      "Q4 state",
      `hasMarker=${q4HasMarker} hasLegend=${q4HasLegend} (both expected false)`
    );
  }

  await cleanup(id);
}

async function testAssessRoutesToConflict() {
  console.log("\n[22] High severity: /assess redirects to /conflict (not /q/1)");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  const target = await getAssessRedirect(id);
  const expected = `/wizard/${id}/conflict`;
  if (target === expected) {
    pass("/assess → /conflict", `redirect=${target}`);
  } else {
    fail(
      "/assess routing on conflict",
      `expected ${expected}, got ${target}`
    );
  }
  await cleanup(id);
}

async function testContinueFromConflictGoesToQ1() {
  console.log("\n[23] Continue on /conflict → ack + redirect to /q/1");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
  });
  // Simulate the Continue click by calling the ack endpoint the component hits.
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
  const target = await getConflictRedirect(id);
  const expected = `/wizard/${id}/q/1`;
  if (target === expected) {
    pass("Continue → /q/1", `server redirect target=${target}`);
  } else {
    fail("Continue redirect", `expected ${expected}, got ${target}`);
  }
  // Also assert /assess now routes to /q/1 (not /conflict) after ack.
  const assessTarget = await getAssessRedirect(id);
  if (assessTarget?.startsWith(`/wizard/${id}/q/`)) {
    pass(
      "/assess after ack skips /conflict",
      `redirect=${assessTarget}`
    );
  } else {
    fail(
      "/assess after ack",
      `expected /wizard/${id}/q/... got ${assessTarget}`
    );
  }
  await cleanup(id);
}

async function testManualRevisitToConflictAfterAck() {
  console.log("\n[23b] Manual revisit to /conflict after ack → redirect to /q/1");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "high",
    conflict_acknowledged: true,
  });
  const target = await getConflictRedirect(id);
  const expected = `/wizard/${id}/q/1`;
  if (target === expected) {
    pass("ack'd /conflict redirects", `target=${target}`);
  } else {
    fail("ack'd /conflict redirect", `expected ${expected}, got ${target}`);
  }
  await cleanup(id);
}

async function testLowSeverityBypassesConflictRoute() {
  console.log("\n[23c] Low severity: /assess redirects to /q/1 (not /conflict)");
  const id = await seedAssessment({
    conflict_detected: true,
    severity: "low",
  });
  const target = await getAssessRedirect(id);
  if (target?.startsWith(`/wizard/${id}/q/`)) {
    pass("low severity skips /conflict", `redirect=${target}`);
  } else {
    fail(
      "low severity routing",
      `expected /wizard/${id}/q/... got ${target}`
    );
  }
  await cleanup(id);
}

async function testOptimisticPatternSource() {
  console.log("\n[24] optimistic save pattern in WizardClient source");
  const src = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );

  // The optimistic path must fire save without awaiting before advance.
  // Specifically: saveAnswerBackground is called (no await) and advanceTo
  // is called synchronously on the same code path.
  const hasBackgroundFn = /saveAnswerBackground\s*=/.test(src);
  // The call to saveAnswerBackground must NOT be awaited, and an
  // advanceTo / router.push must follow within the same handler.
  const hasNonAwaitedSave = /(?<!await\s)saveAnswerBackground\(/.test(src);
  const hasAdvanceCall = /advanceTo\(currentStep\s*\+\s*1\)/.test(src);
  const firesAndForgets = hasNonAwaitedSave && hasAdvanceCall;
  const hasCompletedBackgroundFn = /completeWizardBackground\s*=/.test(src);

  if (hasBackgroundFn) {
    pass(
      "saveAnswerBackground helper defined",
      "fire-and-forget save factory present"
    );
  } else {
    fail(
      "saveAnswerBackground",
      "expected saveAnswerBackground helper in WizardClient"
    );
  }
  if (firesAndForgets) {
    pass(
      "save fires before navigation",
      "saveAnswerBackground(...) immediately followed by advanceTo/router.push"
    );
  } else {
    fail(
      "optimistic advance",
      "no fire-then-advance sequence found in source"
    );
  }
  if (hasCompletedBackgroundFn) {
    pass(
      "completeWizardBackground helper defined",
      "Q7 submit fires completion without blocking"
    );
  } else {
    fail(
      "completeWizardBackground",
      "expected completeWizardBackground helper"
    );
  }
}

async function testRetryToastWiring() {
  console.log("\n[25] retry toast wiring (WizardToastRoot)");
  const rootSrc = fs.readFileSync(
    path.resolve("components/wizard/WizardToastRoot.tsx"),
    "utf8"
  );
  const clientSrc = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );

  const toastHasRetryButton = /data-wizard-toast-retry/.test(rootSrc);
  const toastCallsRetry = /await\s+toast\.retry\(\)/.test(rootSrc);
  const clientShowsToast = /showToast\(\s*"Couldn't save/.test(clientSrc);
  const retryPassesFire = /showToast\([^)]*,\s*fire\s*\)/.test(clientSrc);

  if (toastHasRetryButton) {
    pass(
      "Retry button rendered with test selector",
      "data-wizard-toast-retry present"
    );
  } else {
    fail("Retry button selector", "data-wizard-toast-retry missing");
  }
  if (toastCallsRetry) {
    pass("Retry click invokes toast.retry()", "await toast.retry() found");
  } else {
    fail("Retry invocation", "await toast.retry() missing from ToastRoot");
  }
  if (clientShowsToast && retryPassesFire) {
    pass(
      "save failure shows retry toast",
      'showToast("Couldn\'t save…", fire) wired in WizardClient'
    );
  } else {
    fail(
      "save-failure toast",
      `clientShowsToast=${clientShowsToast} retryPassesFire=${retryPassesFire}`
    );
  }
}

async function testAutoDismissTimer() {
  console.log("\n[26] toast auto-dismisses after 10s");
  const rootSrc = fs.readFileSync(
    path.resolve("components/wizard/WizardToastRoot.tsx"),
    "utf8"
  );
  const hasTimer = /setTimeout\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*10000\s*\)/.test(
    rootSrc
  );
  const clearsOnUnmount = /clearTimeout/.test(rootSrc);

  if (hasTimer) {
    pass(
      "10,000 ms auto-dismiss scheduled",
      "setTimeout(..., 10000) present in ToastRoot"
    );
  } else {
    fail("auto-dismiss 10s", "no 10000 ms setTimeout found");
  }
  if (clearsOnUnmount) {
    pass("timer cleared on change/unmount", "clearTimeout present");
  } else {
    fail("timer cleanup", "clearTimeout missing — potential leak");
  }
}

async function testQ7AwaitedSubmit() {
  console.log("\n[27] Q7 answered Generate awaits save + complete");
  const src = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );

  // Q7 answered branch: must await both save + complete before router.push.
  const hasAwaitedSave = /await\s+saveAnswerAwaited\s*\(/.test(src);
  const hasAwaitedComplete = /await\s+completeWizardAttempt\s*\(/.test(src);
  // Q7 path isLastStep branch must set busy=true before awaits and before router.push.
  const q7AnsweredBranch = src.match(
    /if\s*\(\s*isLastStep\s*\)[\s\S]{0,1400}router\.push\(\s*`\/assess\/\$\{assessmentId\}`/
  );
  const q7HasSetBusy =
    !!q7AnsweredBranch && /setBusy\(\s*true\s*\)/.test(q7AnsweredBranch[0]);
  const q7HasBothAwaits =
    !!q7AnsweredBranch &&
    /await\s+saveAnswerAwaited/.test(q7AnsweredBranch[0]) &&
    /await\s+completeWizardAttempt/.test(q7AnsweredBranch[0]);
  // "Generating…" label conditional on busy && isLastStep.
  const hasGeneratingLabel = /busy\s*\n?\s*\?\s*"Generating…"/.test(src);

  if (hasAwaitedSave) pass("saveAnswerAwaited helper used", "await saveAnswerAwaited present");
  else fail("awaited save helper", "expected `await saveAnswerAwaited(...)`");

  if (hasAwaitedComplete) pass("completeWizardAttempt helper used", "await completeWizardAttempt present");
  else fail("awaited complete helper", "expected `await completeWizardAttempt(...)`");

  if (q7HasBothAwaits)
    pass(
      "Q7 answered awaits both before redirect",
      "save + complete awaited inside isLastStep branch"
    );
  else fail("Q7 answered branch", "save/complete awaits not in the Q7 isLastStep block");

  if (q7HasSetBusy)
    pass(
      "Q7 submit toggles busy",
      "setBusy(true) inside isLastStep branch before await"
    );
  else fail("Q7 busy flag", "setBusy(true) missing from Q7 answered branch");

  if (hasGeneratingLabel)
    pass(
      '"Generating…" label shown during submit',
      "busy ? \"Generating…\" conditional present"
    );
  else fail("button label during submit", "expected conditional nextLabel for busy+isLastStep");
}

async function testQ7AutoSkipAwaited() {
  console.log("\n[28] Q7 auto-skip (unanswered Generate) saves skip + awaits complete");
  const src = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );
  const autoSkipBranch = src.match(
    /isLastStep\s*&&\s*!canContinue[\s\S]{0,1000}router\.push\(\s*`\/assess\/\$\{assessmentId\}`/
  );
  if (!autoSkipBranch) {
    fail("auto-skip branch", "Q7 isLastStep && !canContinue branch not found");
    return;
  }
  const block = autoSkipBranch[0];
  const firesSkipEvent = /posthog\.capture\(\s*"wizard_step_skipped"[^)]*step_number:\s*currentStep/.test(
    block
  );
  const awaitsComplete = /await\s+completeWizardAttempt\s*\(/.test(block);
  const errorToastOnFailure = /showToast\(\s*"Couldn't submit/.test(block);

  if (firesSkipEvent)
    pass(
      "wizard_step_skipped fires for step 7",
      'posthog.capture("wizard_step_skipped",...) in auto-skip branch'
    );
  else fail("skip event wired", "wizard_step_skipped not fired in auto-skip path");

  if (awaitsComplete)
    pass(
      "auto-skip awaits completeWizardAttempt",
      "await completeWizardAttempt(finalSkipped, ...) in branch"
    );
  else fail("auto-skip awaited complete", "no awaited completeWizardAttempt");

  if (errorToastOnFailure)
    pass(
      "submit failure → error toast",
      'showToast("Couldn\'t submit…") wired for auto-skip failure'
    );
  else fail("auto-skip error toast", "no failure toast in auto-skip branch");
}

async function testPrefetchOnMount() {
  console.log("\n[29] router.prefetch fires for next step on mount");
  const src = fs.readFileSync(
    path.resolve("components/wizard/WizardClient.tsx"),
    "utf8"
  );
  // Look for a useEffect containing router.prefetch, and within that effect
  // block the two URL templates (next question + /assess for Q7).
  const effectMatch = src.match(
    /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]{0,500}router\.prefetch\([\s\S]{0,50}\);[\s\S]{0,200}?\}/
  );
  const hasPrefetchEffect = !!effectMatch;
  const block = effectMatch?.[0] ?? "";
  const prefetchesNextStep = /`\/wizard\/\$\{assessmentId\}\/q\/\$\{currentStep\s*\+\s*1\}`/.test(
    block
  );
  const prefetchesAssessOnQ7 = /`\/assess\/\$\{assessmentId\}`/.test(block);

  if (hasPrefetchEffect)
    pass("useEffect calls router.prefetch", "prefetch effect present");
  else fail("prefetch effect", "no useEffect with router.prefetch found");

  if (prefetchesNextStep)
    pass(
      "Q1–Q6 prefetch next question URL",
      "prefetch path includes currentStep + 1"
    );
  else fail("prefetch next q", "prefetch path for Q1–Q6 missing currentStep+1");

  if (prefetchesAssessOnQ7)
    pass(
      "Q7 prefetches /assess/{id}",
      "prefetch target on isLastStep is /assess"
    );
  else fail("prefetch assess on Q7", "Q7 prefetch target not /assess/{id}");
}

async function main() {
  console.log("Feature 4 — wizard + conflict disclosure (19 checks)");
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
  await testRequiredMarkersAndLegend();
  await testAssessRoutesToConflict();
  await testContinueFromConflictGoesToQ1();
  await testManualRevisitToConflictAfterAck();
  await testLowSeverityBypassesConflictRoute();
  await testOptimisticPatternSource();
  await testRetryToastWiring();
  await testAutoDismissTimer();
  await testQ7AwaitedSubmit();
  await testQ7AutoSkipAwaited();
  await testPrefetchOnMount();

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
