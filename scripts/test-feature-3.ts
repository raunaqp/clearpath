/**
 * End-to-end tests for Feature 3.
 * Run: npm run test:f3
 * Requires: dev server on :3000, .env.local with SUPABASE + ANTHROPIC keys.
 */
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const BASE = "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function pass(name: string, detail: string) {
  results.push({ name, pass: true, detail });
  console.log(`  ✓ ${name}  ${detail}`);
}
function fail(name: string, detail: string) {
  results.push({ name, pass: false, detail });
  console.log(`  ✗ ${name}  ${detail}`);
}

async function submitIntake(oneLiner: string): Promise<string> {
  const res = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "F3 Test",
      email: "f3@clearpath.test",
      one_liner: oneLiner,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`intake failed: ${res.status} ${JSON.stringify(json)}`);
  return json.assessmentId;
}

async function getAssessStatus(id: string) {
  // Trigger the server component to run pre-router
  const res = await fetch(`${BASE}/assess/${id}`, { redirect: "manual" });
  const html = await res.text();
  // Read DB to get the post-run status
  const { data } = await supabase
    .from("assessments")
    .select("status, product_type, meta")
    .eq("id", id)
    .maybeSingle();
  return { httpStatus: res.status, html, row: data };
}

async function cleanup(id: string) {
  await supabase.from("assessments").delete().eq("id", id);
}

async function runHealthcarePath() {
  console.log("\n[1] healthcare path (EkaScribe-style)");
  const id = await submitIntake(
    "AI-powered medical scribe that transcribes doctor-patient consultations and integrates with hospital EMRs"
  );
  const r = await getAssessStatus(id);
  if (r.row?.status === "routing_complete" && r.row?.product_type === "product") {
    pass("classified product + routing_complete", `product_type=${r.row.product_type}`);
  } else {
    fail(
      "healthcare classification",
      `expected status=routing_complete product_type=product, got ${r.row?.status}/${r.row?.product_type}`
    );
  }
  if (r.html.includes("Pre-routing complete") || r.html.includes("classified your product")) {
    pass("engine-coming panel rendered", "found heading text");
  } else {
    fail("engine-coming panel", "panel text not found in response HTML");
  }
  await cleanup(id);
}

async function runRejectionPath(
  label: string,
  oneLiner: string,
  expectedType: string,
  expectedCopyMarker: string
) {
  console.log(`\n[${label}] ${expectedType} path`);
  const id = await submitIntake(oneLiner);
  const r = await getAssessStatus(id);

  if (r.row?.status === "rejected" && r.row?.product_type === expectedType) {
    pass(
      `classified ${expectedType} + rejected`,
      `rejection_reason=${
        (r.row.meta as { pre_router?: { rejection_reason?: string } })?.pre_router?.rejection_reason?.slice(0, 80) ??
        "(none)"
      }...`
    );
  } else {
    fail(
      `${expectedType} classification`,
      `got status=${r.row?.status} product_type=${r.row?.product_type}`
    );
  }

  // Check the decline page separately
  const declineRes = await fetch(`${BASE}/declined/${id}`);
  const declineHtml = await declineRes.text();
  if (declineHtml.includes(expectedCopyMarker)) {
    pass(`${expectedType} decline variant`, `found copy marker "${expectedCopyMarker}"`);
  } else {
    fail(
      `${expectedType} decline copy`,
      `marker "${expectedCopyMarker}" not in decline page HTML`
    );
  }
  await cleanup(id);
}

async function checkPdfContentCacheExists() {
  console.log("\n[5] pdf_content_cache table exists");
  const { error } = await supabase
    .from("pdf_content_cache")
    .select("pdf_sha256")
    .limit(1);
  if (error) {
    fail("pdf_content_cache table", `error: ${error.message}`);
  } else {
    pass("pdf_content_cache table", "queryable via service role");
  }
}

async function makeTestPdf(): Promise<Buffer> {
  return makePdfWithContent("ProductSpec: MediScribe", [
    "AI medical scribe that transcribes doctor-patient",
    "consultations, generates SOAP notes, integrates with",
    "hospital EMR systems via HL7 FHIR APIs.",
    "Target users: primary care physicians, specialists.",
  ]);
}

async function makePdfWithContent(
  title: string,
  bodyLines: string[]
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([420, 640]);
  page.drawText(title, { x: 40, y: 580, size: 16, font });
  let y = 550;
  for (const line of bodyLines) {
    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 16;
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

async function uploadPdfAndSubmit(
  oneLiner: string,
  pdfBuf: Buffer,
  filename: string,
  email: string
): Promise<string | null> {
  const sha256 = createHash("sha256").update(pdfBuf).digest("hex");
  // Best-effort cache clear so cache doesn't mask a real extraction run
  await supabase.from("pdf_content_cache").delete().eq("pdf_sha256", sha256);

  const signRes = await fetch(`${BASE}/api/storage/signed-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, size_bytes: pdfBuf.length }),
  });
  if (!signRes.ok) return null;
  const { signedUrl, storage_path } = await signRes.json();

  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: new Uint8Array(pdfBuf.buffer, pdfBuf.byteOffset, pdfBuf.byteLength),
  });
  if (!putRes.ok) return null;

  const intakeRes = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "F3 Test",
      email,
      one_liner: oneLiner,
      uploaded_docs: [
        { filename, storage_path, size_bytes: pdfBuf.length, sha256 },
      ],
    }),
  });
  const { assessmentId } = await intakeRes.json();
  if (!assessmentId) return null;

  // Await full response body so the pre-router's DB write has landed
  const assessRes = await fetch(`${BASE}/assess/${assessmentId}`);
  await assessRes.text();
  return assessmentId as string;
}

type PreRouterMeta = {
  pre_router?: { rationale?: string };
  conflict_detected?: boolean;
  conflict_details?: {
    severity?: string;
    authority_used?: string;
    one_liner_interpretation?: string;
    pdf_interpretation?: string | null;
    url_interpretation?: string | null;
  } | null;
  detected_signals?: {
    certifications?: Array<{ name?: string; confidence?: string; source?: string; evidence_quote?: string }>;
    partnerships?: unknown[];
    prior_regulatory_work?: unknown[];
    has_physical_facility?: string;
    facility_details?: string | null;
  };
};

async function runConflictDetectionPath() {
  console.log("\n[A] conflict detection — description says platform, PDF describes cancer screening");

  const pdfBuf = await makePdfWithContent(
    "Product brief: OncoScan Cervical",
    [
      "AI-powered cervical cancer screening system for colposcopy clinics.",
      "Analyses colposcopy images using a CNN trained on 48,000 cases.",
      "Outputs a risk score that drives referral to biopsy or colposcopic",
      "follow-up. Intended use: diagnostic decision support for trained",
      "gynaecologists. Target users: gynae-oncologists, women's health",
      "clinics. Regulatory path: SaMD, CDSCO Class C equivalent under",
      "evaluation. Clinical validation: 95% sensitivity, 87% specificity",
      "on a 2,400-patient retrospective study.",
    ]
  );

  const id = await uploadPdfAndSubmit(
    "Women's health data analytics platform for Indian hospitals",
    pdfBuf,
    "oncoscan-brief.pdf",
    "f3conflict@clearpath.test"
  );

  if (!id) {
    fail("conflict test setup", "could not submit intake with pdf");
    return;
  }

  const { data } = await supabase
    .from("assessments")
    .select("meta")
    .eq("id", id)
    .maybeSingle<{ meta: PreRouterMeta }>();

  const meta = data?.meta ?? {};
  const cd = meta.conflict_details ?? null;

  if (meta.conflict_detected === true) {
    pass("conflict_detected=true", `after one-liner/pdf mismatch`);
  } else {
    fail(
      "conflict_detected",
      `expected true, got ${meta.conflict_detected}`
    );
  }
  if (cd && (cd.severity === "high" || cd.severity === "medium")) {
    pass("severity high/medium", `severity=${cd.severity}`);
  } else {
    fail(
      "severity",
      `expected high/medium, got ${cd?.severity ?? "(no details)"}`
    );
  }
  if (cd?.authority_used === "pdf") {
    pass("authority_used=pdf", "pdf trusted over one-liner");
  } else {
    fail("authority_used", `expected pdf, got ${cd?.authority_used}`);
  }

  await supabase.from("assessments").delete().eq("id", id);
  await supabase
    .from("pdf_content_cache")
    .delete()
    .eq("pdf_sha256", createHash("sha256").update(pdfBuf).digest("hex"));
}

async function runCertificationExtractionPath() {
  console.log("\n[B] certification extraction — PDF mentions ISO 13485 + cert number");

  const pdfBuf = await makePdfWithContent(
    "Tech brief: DermAI",
    [
      "AI tool for skin-lesion triage. Takes a photo, returns a risk",
      "score and referral suggestion for dermatology clinics.",
      "Regulatory posture: ISO 13485 certified (cert number ABC123).",
      "IEC 62304 software lifecycle process in place.",
      "Validation partner: SRL Diagnostics (NABL-accredited).",
      "Intended users: general practitioners, skin clinics.",
    ]
  );

  const id = await uploadPdfAndSubmit(
    "AI-assisted skin-lesion triage tool for Indian dermatology clinics",
    pdfBuf,
    "dermai-brief.pdf",
    "f3certs@clearpath.test"
  );

  if (!id) {
    fail("certification test setup", "could not submit intake with pdf");
    return;
  }

  const { data } = await supabase
    .from("assessments")
    .select("meta")
    .eq("id", id)
    .maybeSingle<{ meta: PreRouterMeta }>();

  const certs = data?.meta?.detected_signals?.certifications ?? [];
  const iso = certs.find(
    (c) => (c.name ?? "").toUpperCase().includes("ISO 13485")
  );

  if (iso) {
    pass(
      "ISO 13485 detected",
      `confidence=${iso.confidence} evidence="${(iso.evidence_quote ?? "").slice(0, 60)}..."`
    );
  } else {
    fail(
      "ISO 13485 detection",
      `no ISO 13485 in certifications (${certs.length} total certs)`
    );
  }
  if (iso && iso.confidence === "high") {
    pass("confidence=high", "cert number ABC123 triggered high confidence");
  } else {
    fail(
      "ISO 13485 confidence",
      `expected high (cert number given), got ${iso?.confidence ?? "(none)"}`
    );
  }

  await supabase.from("assessments").delete().eq("id", id);
  await supabase
    .from("pdf_content_cache")
    .delete()
    .eq("pdf_sha256", createHash("sha256").update(pdfBuf).digest("hex"));
}

async function runPdfUploadPath() {
  console.log("\n[7] pdf upload path end-to-end");
  const pdfBuf = await makeTestPdf();
  const sha256 = createHash("sha256").update(pdfBuf).digest("hex");

  // Clean up any leftover cache row for this exact PDF
  await supabase.from("pdf_content_cache").delete().eq("pdf_sha256", sha256);

  // 1. Signed URL
  const signRes = await fetch(`${BASE}/api/storage/signed-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "f3-test.pdf", size_bytes: pdfBuf.length }),
  });
  if (!signRes.ok) {
    fail("signed URL", `status=${signRes.status}`);
    return;
  }
  const { signedUrl, storage_path } = await signRes.json();
  pass("signed URL", `path=${storage_path}`);

  // 2. Upload PDF
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: new Uint8Array(pdfBuf.buffer, pdfBuf.byteOffset, pdfBuf.byteLength),
  });
  if (!putRes.ok) {
    fail("pdf upload", `PUT status=${putRes.status}`);
    return;
  }
  pass("pdf upload", `${pdfBuf.length} bytes → storage`);

  // 3. Submit intake with uploaded_docs
  const intakeRes = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "F3 PDF Test",
      email: "f3pdf@clearpath.test",
      one_liner: "Clinical productivity tool for physicians. See attached product spec document.",
      uploaded_docs: [
        { filename: "f3-test.pdf", storage_path, size_bytes: pdfBuf.length, sha256 },
      ],
    }),
  });
  const { assessmentId } = await intakeRes.json();
  if (!assessmentId) {
    fail("intake with pdf", "no assessment id");
    return;
  }

  // 4. Trigger /assess → pre-router
  const assessRes = await fetch(`${BASE}/assess/${assessmentId}`);
  const assessHtml = await assessRes.text();

  const { data: row } = await supabase
    .from("assessments")
    .select("status, product_type, meta")
    .eq("id", assessmentId)
    .maybeSingle();

  if (row?.product_type === "product" || row?.product_type === "hardware_software") {
    pass(
      "pdf-fed pre-router ran",
      `status=${row.status} type=${row.product_type}`
    );
  } else {
    fail(
      "pdf-fed pre-router",
      `status=${row?.status} type=${row?.product_type}`
    );
  }

  // 5. Verify pdf_content_cache got populated
  const { data: cacheRow } = await supabase
    .from("pdf_content_cache")
    .select("pdf_sha256, extracted_summary, hit_count")
    .eq("pdf_sha256", sha256)
    .maybeSingle();
  if (cacheRow && cacheRow.extracted_summary.length > 10) {
    pass(
      "pdf summary cached",
      `summary=${cacheRow.extracted_summary.length} chars · hit_count=${cacheRow.hit_count}`
    );
  } else {
    fail("pdf summary cache", "sha256 not found in cache or summary too short");
  }

  // Cleanup
  await supabase.from("assessments").delete().eq("id", assessmentId);
  await supabase.storage.from("assessment-docs").remove([storage_path]);
  await supabase.from("pdf_content_cache").delete().eq("pdf_sha256", sha256);

  // Quiet the Next build warning by marking html as used
  void assessHtml;
}

async function runPromptCacheRepeat() {
  console.log("\n[8] prompt caching on repeat call");

  // Clear the dev log snapshot
  const logPath = "/tmp/clearpath-dev.log";
  const logSizeBefore = fs.existsSync(logPath) ? fs.statSync(logPath).size : 0;

  const id1 = await submitIntake(
    "AI radiology second-read tool for detecting lung nodules from chest X-rays"
  );
  await getAssessStatus(id1);

  // Immediately fire the second one within the 5-minute cache window
  const id2 = await submitIntake(
    "AI radiology second-read tool for detecting lung nodules from chest X-rays"
  );
  await getAssessStatus(id2);

  // Read dev log, find the two most recent api_cost_tracked events
  if (!fs.existsSync(logPath)) {
    fail("log read", "/tmp/clearpath-dev.log not found");
    return;
  }
  const raw = fs
    .readFileSync(logPath, "utf8")
    .slice(logSizeBefore);
  const events = raw.match(/api_cost_tracked[\s\S]*?cache_hit:\s*(true|false)/g) || [];
  if (events.length < 2) {
    fail(
      "cache observability",
      `only ${events.length} cost events found after the two submissions`
    );
  } else {
    const lastTwo = events.slice(-2);
    const cacheHits = lastTwo.map((e) => /cache_hit:\s*true/.test(e));
    if (cacheHits[1]) {
      pass("second call hit prompt cache", "cache_hit=true on run 2");
    } else {
      fail(
        "prompt caching",
        `run-1 cache_hit=${cacheHits[0]}, run-2 cache_hit=${cacheHits[1]} (expected true on run 2)`
      );
    }
  }

  await cleanup(id1);
  await cleanup(id2);
}

async function checkVercelDeploy() {
  console.log("\n[6] production deploy responds");
  const url = "https://clearpath-medtech.vercel.app";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      pass("vercel landing", `GET ${url} → ${res.status}`);
    } else {
      fail("vercel landing", `GET ${url} → ${res.status}`);
    }
  } catch (err) {
    fail("vercel landing", `${(err as Error).message}`);
  }
}

async function main() {
  console.log("Feature 3 tests — local dev server + supabase + vercel");
  console.log("=".repeat(70));

  await checkPdfContentCacheExists();
  await runHealthcarePath();
  await runRejectionPath(
    "2",
    "National Health Authority mission for ABDM digital health consent layer and ABHA IDs",
    "regulator",
    "not a regulated product"
  );
  await runRejectionPath(
    "3",
    "Early-stage venture capital fund investing in Indian digital health startups. Portfolio support includes regulatory guidance.",
    "investor",
    "not funds"
  );
  await runRejectionPath(
    "4",
    "Payment platform that helps businesses simplify collection and distribution of payments to vendors and employees across India",
    "out_of_scope",
    "Indian healthcare product"
  );
  await runPdfUploadPath();
  await runConflictDetectionPath();
  await runCertificationExtractionPath();
  await runPromptCacheRepeat();
  await checkVercelDeploy();

  console.log("\n" + "=".repeat(70));
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`Summary: ${passed} passed · ${failed} failed · ${results.length} total`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exit(2);
});
