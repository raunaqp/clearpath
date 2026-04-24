/**
 * One-off: verifies Stage 1 on production by submitting a mismatched
 * one-liner + PDF with ISO 13485 and reading back meta from Supabase.
 * Run: npx tsx scripts/verify-production-stage-1.ts
 */
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts } from "pdf-lib";

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

async function makePdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([420, 640]);
  page.drawText("Prod verify: OncoScan Cervical", { x: 40, y: 580, size: 16, font });
  const lines = [
    "AI-powered cervical cancer screening from colposcopy images.",
    "Diagnostic decision support for gynaecologists.",
    "ISO 13485 certified (cert number ABC123).",
    "IEC 62304 software lifecycle in place.",
    "Validation partner: SRL Diagnostics (NABL-accredited).",
    "CDSCO Class C equivalent under evaluation.",
  ];
  let y = 550;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 16;
  }
  return Buffer.from(await pdf.save());
}

async function main() {
  const pdfBuf = await makePdf();
  const sha256 = createHash("sha256").update(pdfBuf).digest("hex");
  console.log(`PDF bytes: ${pdfBuf.length} · sha256: ${sha256.slice(0, 16)}...`);

  // fresh cache for this PDF so we actually exercise extraction
  await supabase.from("pdf_content_cache").delete().eq("pdf_sha256", sha256);

  console.log("\nstep 1 — signed URL");
  const signRes = await fetch(`${BASE}/api/storage/signed-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "oncoscan.pdf", size_bytes: pdfBuf.length }),
  });
  if (!signRes.ok) {
    console.error("signed URL failed:", await signRes.text());
    process.exit(1);
  }
  const { signedUrl, storage_path } = await signRes.json();
  console.log("  ok");

  console.log("\nstep 2 — upload PDF");
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: new Uint8Array(pdfBuf.buffer, pdfBuf.byteOffset, pdfBuf.byteLength),
  });
  if (!putRes.ok) {
    console.error("PUT failed:", putRes.status);
    process.exit(1);
  }
  console.log("  ok");

  console.log("\nstep 3 — submit intake with mismatched one-liner");
  const intakeRes = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Stage1 Prod Verify",
      email: "stage1-verify@clearpath.test",
      one_liner: "Women's health data analytics platform for Indian hospitals",
      uploaded_docs: [
        { filename: "oncoscan.pdf", storage_path, size_bytes: pdfBuf.length, sha256 },
      ],
    }),
  });
  const intake = await intakeRes.json();
  if (!intake.assessmentId) {
    console.error("intake failed:", intake);
    process.exit(1);
  }
  console.log(`  ok · id=${intake.assessmentId}`);

  console.log("\nstep 4 — trigger /assess/[id] on prod (runs pre-router)");
  const assessRes = await fetch(`${BASE}/assess/${intake.assessmentId}`);
  await assessRes.text(); // drain so pre-router completes + DB write lands
  console.log("  ok");

  console.log("\nstep 5 — read meta from Supabase");
  const { data, error } = await supabase
    .from("assessments")
    .select("status, product_type, meta")
    .eq("id", intake.assessmentId)
    .maybeSingle();
  if (error || !data) {
    console.error("supabase read failed:", error);
    process.exit(1);
  }
  console.log(`  status=${data.status} product_type=${data.product_type}`);

  type ConflictDetails = {
    severity?: string;
    authority_used?: string;
    one_liner_interpretation?: string;
    pdf_interpretation?: string | null;
  };
  type Signals = {
    certifications?: Array<{ name?: string; confidence?: string; evidence_quote?: string }>;
    partnerships?: Array<{ name?: string }>;
    prior_regulatory_work?: Array<{ type?: string }>;
    has_physical_facility?: string;
  };
  const m = data.meta as {
    conflict_detected?: boolean;
    conflict_details?: ConflictDetails | null;
    detected_signals?: Signals;
  };

  console.log("\n--- conflict fields ---");
  console.log(`conflict_detected:      ${m.conflict_detected}`);
  console.log(`conflict_details.severity:        ${m.conflict_details?.severity}`);
  console.log(`conflict_details.authority_used:  ${m.conflict_details?.authority_used}`);
  console.log(`conflict_details.one_liner_interp: ${m.conflict_details?.one_liner_interpretation?.slice(0, 100)}...`);
  console.log(`conflict_details.pdf_interp:       ${m.conflict_details?.pdf_interpretation?.slice(0, 100)}...`);

  console.log("\n--- detected_signals ---");
  const certs = m.detected_signals?.certifications ?? [];
  console.log(`certifications: ${certs.length}`);
  for (const c of certs) {
    console.log(`  · ${c.name} (${c.confidence}) — "${(c.evidence_quote ?? "").slice(0, 60)}"`);
  }
  const parts = m.detected_signals?.partnerships ?? [];
  console.log(`partnerships: ${parts.length}`);
  for (const p of parts) console.log(`  · ${p.name}`);
  const pw = m.detected_signals?.prior_regulatory_work ?? [];
  console.log(`prior_regulatory_work: ${pw.length}`);
  for (const w of pw) console.log(`  · ${w.type}`);
  console.log(`has_physical_facility: ${m.detected_signals?.has_physical_facility}`);

  // assertions
  let pass = 0, fail = 0;
  function check(label: string, cond: boolean) {
    console.log(`  ${cond ? "✓" : "✗"} ${label}`);
    cond ? pass++ : fail++;
  }
  console.log("\n--- production assertions ---");
  check("conflict_detected === true", m.conflict_detected === true);
  check(
    "severity in [high, medium]",
    m.conflict_details?.severity === "high" || m.conflict_details?.severity === "medium"
  );
  check("authority_used === 'pdf'", m.conflict_details?.authority_used === "pdf");
  check(
    "ISO 13485 detected",
    certs.some((c) => (c.name ?? "").toUpperCase().includes("ISO 13485"))
  );
  check(
    "ISO 13485 confidence high",
    certs.some(
      (c) =>
        (c.name ?? "").toUpperCase().includes("ISO 13485") && c.confidence === "high"
    )
  );

  console.log(`\nResult: ${pass} pass · ${fail} fail`);

  // cleanup
  await supabase.from("assessments").delete().eq("id", intake.assessmentId);
  await supabase.storage.from("assessment-docs").remove([storage_path]);
  await supabase.from("pdf_content_cache").delete().eq("pdf_sha256", sha256);
  console.log("cleanup: done");

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("verify crashed:", err);
  process.exit(2);
});
