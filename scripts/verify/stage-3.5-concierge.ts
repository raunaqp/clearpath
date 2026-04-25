/**
 * Stage 3.5 — Concierge waitlist test harness (10 checks).
 * Run: npx tsx scripts/verify/stage-3.5-concierge.ts
 * Requires: dev server on :3000, .env.local with SUPABASE keys.
 *
 * Notes:
 * - Email send is best-effort. If RESEND_API_KEY is missing on the server,
 *   the row is still inserted and POST returns 201; we don't assert email
 *   delivery here.
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

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
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

const insertedWaitlistIds: string[] = [];
const insertedAssessmentIds: string[] = [];

async function seedAssessment(): Promise<{
  id: string;
  name: string;
  email: string;
  mobile: string;
  one_liner: string;
}> {
  const seed = {
    name: "Concierge Test User",
    email: `concierge-${Date.now()}@clearpath.test`,
    mobile: "+91 98765 43210",
    one_liner:
      "AI tool that flags early Alzheimer's from MRI scans for radiologists in tier-2 hospitals",
    status: "completed",
    product_type: "product",
  };
  const { data, error } = await supabase
    .from("assessments")
    .insert(seed)
    .select("id")
    .single();
  if (error || !data) throw new Error(`seed failed: ${error?.message}`);
  insertedAssessmentIds.push(data.id);
  return { id: data.id, ...seed };
}

function basePayload(date: string) {
  return {
    name: "Concierge Submitter",
    email: `submit-${Date.now()}@clearpath.test`,
    product_name: "MedScan AI",
    target_submission_date: date,
    context:
      "We have a deficiency letter from CDSCO and need help replying within the deadline.",
  };
}

function isoFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function check1_get_empty_form() {
  const res = await fetch(`${BASE}/concierge`);
  const html = await res.text();
  const ok =
    res.ok &&
    html.includes("Get an expert on your case") &&
    html.includes("Request concierge review") &&
    !html.includes("Prefilled from your card");
  if (ok) pass("1. GET /concierge → empty form", `${res.status}`);
  else fail("1. GET /concierge → empty form", `status=${res.status}, content mismatch`);
}

async function check2_get_with_prefill() {
  const seed = await seedAssessment();
  const res = await fetch(
    `${BASE}/concierge?source=card&assessment_id=${seed.id}`
  );
  const html = await res.text();
  const ok =
    res.ok &&
    html.includes("Prefilled from your card") &&
    html.includes(seed.name) &&
    html.includes(seed.email);
  if (ok) {
    pass(
      "2. GET /concierge?source=card → prefilled banner + values",
      `${res.status}, contains name+email`
    );
  } else {
    fail(
      "2. GET /concierge?source=card → prefilled banner + values",
      `status=${res.status}, banner_present=${html.includes("Prefilled from your card")}`
    );
  }
}

async function check3_get_with_invalid_uuid() {
  const res = await fetch(
    `${BASE}/concierge?source=card&assessment_id=00000000-0000-0000-0000-000000000000`
  );
  const html = await res.text();
  const ok = res.ok && !html.includes("Prefilled from your card");
  if (ok) pass("3. Invalid uuid → empty form", `${res.status}, no banner`);
  else fail("3. Invalid uuid → empty form", `status=${res.status}, banner_present=${html.includes("Prefilled from your card")}`);
}

async function check4_post_valid_with_prefilled() {
  const seed = await seedAssessment();
  const date = isoFutureDate(45);
  const payload = {
    ...basePayload(date),
    source_assessment_id: seed.id,
    prefilled: true,
  };
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status !== 201 || !json.id) {
    fail("4. POST valid + prefilled → 201", `status=${res.status} body=${JSON.stringify(json)}`);
    return;
  }
  insertedWaitlistIds.push(json.id);
  const { data } = await supabase
    .from("tier3_waitlist")
    .select("prefilled, source_assessment_id, name, email, product_name, target_submission_date")
    .eq("id", json.id)
    .single();
  const ok =
    !!data &&
    data.prefilled === true &&
    data.source_assessment_id === seed.id &&
    data.name === payload.name;
  if (ok) {
    pass(
      "4. POST valid + prefilled → row inserted with flags",
      `id=${json.id} prefilled=${data?.prefilled} source=${data?.source_assessment_id?.slice(0, 8)}`
    );
  } else {
    fail(
      "4. POST valid + prefilled → row inserted with flags",
      `row=${JSON.stringify(data)}`
    );
  }
}

async function check5_post_valid_no_source() {
  const date = isoFutureDate(30);
  const payload = basePayload(date);
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status !== 201 || !json.id) {
    fail("5. POST valid no source → 201", `status=${res.status} body=${JSON.stringify(json)}`);
    return;
  }
  insertedWaitlistIds.push(json.id);
  const { data } = await supabase
    .from("tier3_waitlist")
    .select("prefilled, source_assessment_id")
    .eq("id", json.id)
    .single();
  const ok = !!data && data.prefilled === false && data.source_assessment_id === null;
  if (ok) pass("5. POST no source → row prefilled=false, source null", `id=${json.id}`);
  else fail("5. POST no source → row prefilled=false, source null", `row=${JSON.stringify(data)}`);
}

async function check6_post_empty_name() {
  const payload = { ...basePayload(isoFutureDate(20)), name: "" };
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 422) pass("6. POST empty name → 422", `${res.status}`);
  else fail("6. POST empty name → 422", `status=${res.status}`);
}

async function check7_post_invalid_email() {
  const payload = { ...basePayload(isoFutureDate(20)), email: "not-an-email" };
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 422) pass("7. POST invalid email → 422", `${res.status}`);
  else fail("7. POST invalid email → 422", `status=${res.status}`);
}

async function check8_post_missing_target_date() {
  const payload = { ...basePayload(isoFutureDate(20)) } as Record<string, unknown>;
  delete payload.target_submission_date;
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 422) pass("8. POST missing date → 422", `${res.status}`);
  else fail("8. POST missing date → 422", `status=${res.status}`);
}

async function check9_post_context_too_long() {
  const longContext = "word ".repeat(220).trim();
  const payload = { ...basePayload(isoFutureDate(20)), context: longContext };
  const res = await fetch(`${BASE}/api/concierge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 422) pass("9. POST context > 200 words → 422", `${res.status}`);
  else fail("9. POST context > 200 words → 422", `status=${res.status}`);
}

async function check10_confirmation_personalised() {
  const res = await fetch(
    `${BASE}/concierge/confirmation?email=${encodeURIComponent("raunaq@example.com")}`
  );
  const html = await res.text();
  const ok =
    res.ok && html.includes("Request received") && html.includes("Thanks, Raunaq");
  if (ok) pass("10. Confirmation page personalises name", `${res.status}`);
  else
    fail(
      "10. Confirmation page personalises name",
      `status=${res.status}, contains_thanks_raunaq=${html.includes("Thanks, Raunaq")}`
    );
}

async function cleanup() {
  if (insertedWaitlistIds.length > 0) {
    await supabase.from("tier3_waitlist").delete().in("id", insertedWaitlistIds);
  }
  if (insertedAssessmentIds.length > 0) {
    await supabase.from("assessments").delete().in("id", insertedAssessmentIds);
  }
}

async function main() {
  console.log(`\nstage-3.5 concierge — base=${BASE}\n`);
  try {
    await check1_get_empty_form();
    await check2_get_with_prefill();
    await check3_get_with_invalid_uuid();
    await check4_post_valid_with_prefilled();
    await check5_post_valid_no_source();
    await check6_post_empty_name();
    await check7_post_invalid_email();
    await check8_post_missing_target_date();
    await check9_post_context_too_long();
    await check10_confirmation_personalised();
  } finally {
    await cleanup();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length}/${results.length} passed${
      failed.length ? ` — ${failed.length} failed` : ""
    }\n`
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
